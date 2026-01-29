'use client';

import Api from "../../api/api"
import React from "react";
import Nav from "@/app/components/nav";
import { stringToFile, fileToString } from "@/app/lib/images.service";
import { Review, User } from "@/app/lib/types";
import { EuropaBold } from "@/app/lib/loadFont";
import { NoteDisplay, starColors } from "@/app/components/note";

export default function Profile() {
    const api = React.useMemo(() => new Api('/api'), []);
    const [user, setUser] = React.useState<User | null>(null);
    const [image, setImage] = React.useState<File | null>(null);
    const [reviews, setReviews] = React.useState<Review[]>([]);
    const [imagesFromAlbums, setImagesFromAlbums] = React.useState<string[]>([]);
    const [listenedAlbums, setListenedAlbums] = React.useState<any[]>([]);
    const [hotTakesAlbums, setHotTakesAlbums] = React.useState<any[]>([]);
    const [nextListAlbums, setNextListdAlbums] = React.useState<any[]>([]);
    const [bigFiveAlbums, setBigFiveAlbums] = React.useState<any[]>([]);

    // Fetch user data and reviews
    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await api.get('/users/me') as any;
                setUser(res.body);

                setHotTakesAlbums(res.body.hotTakes);
                setNextListdAlbums(res.body.nextList);
                setBigFiveAlbums(res.body.bigFive);
                setListenedAlbums(res.body.listened)

                if (res.body?.reviews) {
                    setReviews(res.body.reviews);
                    await fetchAlbumImages(res.body.reviews);
                }
                
                if (res.body?.image) {
                    const responseImage = await stringToFile(res.body.image as string);
                    setImage(responseImage);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [api]);

    // Fetch album images for reviews
    const fetchAlbumImages = async (reviews: Review[]) => {
        const images = await Promise.all(
            reviews.map(async (review: Review) => {
                try {
                    const album: any = (await api.lastfm.getAlbumInfoByMbid(review.mbid)).body;
                    return album?.image?.[album.image.length - 1]?.['#text'] || null;
                } catch (error) {
                    console.error('Error fetching album:', error);
                    return null;
                }
            })
        );
        
        const validImages = images.filter((img): img is string => img !== null);
        setImagesFromAlbums(validImages);
    };

    // Image upload handlers
    const handleFile = async (file: File | null) => {
        if (!file || !user) return;

        if (!file.type.startsWith("image/")) {
            alert("Merci de choisir une image");
            return;
        }

        if (file.size > 1024 * 1024 * 1024) {
            alert("Le fichier est trop volumineux (2 Go max).");
            return;
        }

        const fileString = await fileToString(file);
        await api.users.uploadImage(user.id, fileString);
    };

    if (!user) {
        return <div className="h-screen w-screen flex items-center justify-center text-white">Loading...</div>;
    }
    
    return (
        <div className="h-screen w-screen text-white flex flex-col overflow-hidden">
            <Nav />
            
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background effects */}
                <BackgroundEffects image={image} />
                
                {/* Main content */}
                <div className="flex-1 flex flex-col px-60 pb-8 z-10 overflow-hidden">
                    {/* Top images banner */}
                    <TopImagesBanner images={imagesFromAlbums} />
                    
                    {/* Profile header */}
                    <ProfileHeader user={user} image={image} reviewsCount={reviews.length} />
                    
                    {/* Content area - scrollable reviews + sidebar */}
                    <div className="flex-1 flex gap-40 mt-12 min-h-0 overflow-hidden">
                        <ReviewsSection reviews={reviews} api={api} />
                        <Sidebar 
                            hotTakesAlbums={bigFiveAlbums}
                            listenedAlbums={listenedAlbums}
                            nextListAlbums={nextListAlbums}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==================== Sub-components ====================

interface BackgroundEffectsProps {
    image: File | null;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ image }) => (
    <>
        <div className="h-1/5 w-full backdrop-blur-[150px] absolute top-0 left-0" />
        <div
            style={{
                backgroundImage: `url(${image ? URL.createObjectURL(image) : "https://picsum.photos/200"})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px)',
                zIndex: -1,
            }}
            className="absolute top-0 left-0 h-1/5 w-full"
        />
        <div className="absolute w-full h-full top-1/5 bg-[#0c0c0e]" />
    </>
);

interface TopImagesBannerProps {
    images: string[];
}

const TopImagesBanner: React.FC<TopImagesBannerProps> = ({ images }) => (
    <div className="w-full z-50 mt-12 min-h-1/5 flex justify-center gap-2 shrink-0">
        {images.slice(0, 5).map((image, index) => (
            <img 
                key={index}
                className="aspect-square z-50 w-full max-w-1/5 rounded-lg" 
                src={image} 
                alt={`Album ${index + 1}`}
            />
        ))}
    </div>
);




interface ProfileHeaderProps {
    user: User;
    image: File | null;
    reviewsCount: number;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, image, reviewsCount }) => (
    <div className="w-full flex justify-between space-x-8 pt-12 shrink-0">
        <div className="flex items-start space-x-8">
            <img
                width={80}
                className="border border-white/10 aspect-square rounded-full"
                src={image ? URL.createObjectURL(image) : undefined}
                alt="Profile"
            />
            <div>
                <h1 className={`text-8xl font-bold ${EuropaBold.className}`}>{user.pseudo}</h1>
                <p className="opacity-50 mt-4">{user.bio}</p>
            </div>
        </div>
        <div className="w-full max-w-200 gap-4 flex justify-between shrink-0">
            <div className="flex gap-2">
                Reviews:
                <div>{reviewsCount}</div>
            </div>
            <div className="flex gap-2">
                Member since:
                <div>
                    {new Date(user.createdAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                    })}
                </div>
            </div>
        </div>
    </div>
);





interface ReviewsSectionProps {
    reviews: Review[];
    api: Api;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews, api }) => (
    <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
            {reviews.length > 0 ? (
                reviews.map((review, index) => (
                    <ReviewItem key={review.id ?? index} review={review} api={api} />
                ))
            ) : (
                <p>No reviews available.</p>
            )}
        </div>
    </div>
);

interface ReviewItemProps {
    review: Review;
    api: Api;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, api }) => {
    const [albumData, setAlbumData] = React.useState<any>(null);
    
    React.useEffect(() => {
        const fetchAlbumData = async () => {
            try {
                const albumInfo = await api.lastfm.getAlbumInfoByMbid(review.mbid);
                if (albumInfo?.body) {
                    setAlbumData(albumInfo.body);
                }
            } catch (e) {
                console.error('Error fetching album info:', e);
            }
        };
        
        fetchAlbumData();
    }, [review.mbid, api]);
    
    return (
        <div className="p-4 w-full rounded-lg">
            <div className="w-full flex justify-between">
                <div className="flex gap-8 items-start">
                    {albumData ? (
                        <>
                            <img 
                                src={albumData.image[albumData.image.length - 1]['#text']} 
                                alt="Album cover" 
                                className="w-24 h-24 rounded object-cover shrink-0" 
                            />
                            <div className="flex flex-col">
                                <div className="flex space-x-4 items-center">
                                    <p className="text-2xl font-bold">
                                        {albumData.name}
                                    </p>
                                    <p className="text-lg text-white/70">
                                        {albumData.artist}
                                    </p>
                                </div>
                                <p className="text-white/50 mt-2">{review.content}</p>
                            </div>
                        </>
                    ) : (
                        <div className="w-24 h-24 rounded bg-gray-700 animate-pulse shrink-0" />
                    )}
                </div>
                
                <div 
                    style={{color: starColors[review.note - 1]}}
                    className="flex gap-4 text-3xl items-center shrink-0">
                    <NoteDisplay note={review.note} />
                    {review.note / 2}
                </div>
            </div>
        </div>
    );
};






interface SidebarProps {
    listenedAlbums: any[];
    hotTakesAlbums: any[];
    nextListAlbums: any[];
}

const Sidebar: React.FC<SidebarProps> = ({ nextListAlbums, listenedAlbums, hotTakesAlbums }) => (
    <div className="w-129 shrink-0 flex flex-col justify-between">
        <AlbumSection 
            title="Listened" 
            albums={listenedAlbums} 
        />
        <AlbumSection 
            title="Hottakes" 
            albums={hotTakesAlbums} 
        />
        <AlbumSection 
            title="NextList" 
            albums={nextListAlbums} 
        />
    </div>
);

interface AlbumSectionProps {
    title: string;
    albums: any[];
}

const AlbumSection: React.FC<AlbumSectionProps> = ({ title, albums }) => {
    if (!albums || albums.length === 0) {
        return null;
    }
    
    return (
        <div className="mb-6">
            <div className="w-full flex justify-between">
                <p>{title}</p>
                <button className="text-white/50 hover:text-white">More</button>
            </div>
            <div className="w-full mt-2 flex space-x-1">
                {albums.slice(0, 5).map((mbid: string, index: number) => (
                    <AlbumItem key={mbid || index} mbid={mbid} />
                ))}
            </div>
        </div>
    );
};

interface AlbumItemProps {
    mbid: string;
}

const AlbumItem: React.FC<AlbumItemProps> = ({ mbid }) => {
    const api = React.useMemo(() => new Api('/api'), []);
    const [albumData, setAlbumData] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        const fetchAlbumData = async () => {
            if (!mbid) {
                setLoading(false);
                return;
            }
            
            try {
                const albumInfo = await api.lastfm.getAlbumInfoByMbid(mbid);
                if (albumInfo?.body) {
                    setAlbumData(albumInfo.body);
                }
            } catch (e) {
                console.error('Error fetching album info:', e);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAlbumData();
    }, [mbid, api]);
    
    if (loading) {
        return (
            <div className="w-24 h-24 rounded-xs bg-gray-700 animate-pulse" />
        );
    }
    
    if (!albumData?.image || !Array.isArray(albumData.image) || albumData.image.length === 0) {
        return null;
    }
    
    const imageUrl = albumData.image[albumData.image.length - 1]?.['#text'];
    
    if (!imageUrl) {
        return null;
    }
    
    return (
        <a 
            href={`/${mbid}`}
            className="flex flex-col items-center mt-2 hover:opacity-80 transition-opacity"
        >
            <img 
                src={imageUrl} 
                alt={albumData.name || 'Album cover'} 
                width="100" 
                className="rounded-xs" 
            />
        </a>
    );
};