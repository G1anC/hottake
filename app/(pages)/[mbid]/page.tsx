'use client'

import React, { useState } from 'react';
import Api from '../../api/api';
import { NoteSetter, NoteDisplay, starColors } from './../../components/note'
import Nav from '@/app/components/nav';
import { EuropaBold } from '@/app/lib/loadFont';
import { stringToFile } from '@/app/lib/images.service';
import { User, Review } from '@prisma/client';
import { useSession } from '@/app/lib/auth-client';
import { LastfmAlbumInfo, LastfmAlbumSummary } from '@/app/lib/types/lastfm';

const RightSide = ({ album } : {
    album: LastfmAlbumInfo["album"]
}) => {

    const api = React.useMemo(() => new Api('/api'), []);
    const { data: session } = useSession();
    const [note, setNote] = React.useState<number>(0);
    const [content, setContent] = React.useState<string>("");
    const [valid, setValid] = React.useState<boolean>(false);
    const [albumsAlike, setAlbumsAlike] = React.useState<LastfmAlbumSummary[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Submitting review:", { note, content, authorId: session?.user.id, mbid: album.mbid });

        if (!session?.user)
            return;
        try {
            const response = await api.reviews.createReview({
                note,
                content,
                authorId: session.user.id,
                mbid: album.mbid || '',
            });
    
            setValid(response.status === 200);
        } catch (e) {
            if (e === 500)
                console.error("The review couldn't be created")
        }
    };

    return (
        <div className="w-120 pb-20 h-full flex flex-col justify-between shrink-0">
            <div className="h-1/2">
                <div className="flex gap-1 items-end">
                    <div className="bg-[#181819] py-2 px-3 rounded-t-md h-14 w-auto">
                        <NoteSetter note={note} setNote={setNote} />
                    </div>

                    <div className="rounded-lg bg-[#181819] mb-1 px-6 py-3 flex justify-between w-full">
                        <button onClick={() => {}} className="text-center px-3 flex flex-col items-center">
                            <img src="/listenedNo.svg" className="w-12 hover:opacity-50 opacity-25 duration-100 hover:scale-105 transition-all" />
                            <p className="mt-2">Listened</p>
                        </button>

                        <button onClick={() => {}} className="text-center px-3 flex flex-col items-center">
                            <img src="/nextlist.svg" className="w-12" />
                            <p className="mt-2">Nextlist</p>
                        </button>

                        <button onClick={() => {}} className="text-center px-3 flex flex-col items-center">
                            <img src="/nextlist.svg" className="w-12" />
                            <p className="mt-2">Hottake</p>
                        </button>
                    </div>
                    
                </div>
                <div className="h-full max-h-160 flex flex-col gap-1">
                    <textarea
                        name="content"
                        placeholder="Write a review..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="h-full resize-none px-6 py-3 rounded-r-lg rounded-bl-lg
                            text-start align-top outline-none bg-[#181819]"
                    />
                    <button
                        onClick={handleSubmit}
                        className={`form-field px-4 py-3 rounded-md hover:bg-[#AC2C33]
                            ${valid ? "bg-green-600" : "bg-[#181819]"}
                            duration-100 transition-all`}
                        type="submit"
                    >
                        Submit
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col gap-24">
                <div className="">
                    <div className="w-full flex justify-between">
                        <p className="">Other works from 23wa</p>
                        <button className="text-white/50 hover:text-white">More</button>
                    </div>
                    <div className="w-full mt-2 flex space-x-1">
                        {albumsAlike.slice(0, 5).map((album, index: number) => (
                            <div key={index} className="flex flex-col items-center mt-2">
                                <p>{album.name}</p>
                                <p>{album.mbid}</p>
                                <p>{album.artist}</p>
                                <img src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="100" className="rounded-xs " />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="w-full flex justify-between">
                        <p className="">Albums you might like</p>
                        <button className="text-white/50 hover:text-white">More</button>
                    </div>
                    <div className="w-full mt-2 mb-24 flex space-x-1">
                        {album && [1, 2, 3, 4, 5].map((_, index) => (
                            <div key={index} className="flex flex-col items-center mt-2">
                                <img src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="100" className="rounded-xs " />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default function MbidPage({ params }: { params: Promise<{ mbid: string }> }) {
    const { mbid } = React.use(params);
    const api = React.useMemo(() => new Api('/api'), []);
    const [album, setAlbum] = React.useState<LastfmAlbumInfo["album"] | null>(null);
    const [reviews, setReviews] = React.useState<Review[]>([])
    const [user, setUser] = React.useState<User | null>(null);
    const [albumsAlike, setAlbumsAlike] = React.useState<any[]>([]);
    const [similarAlbums, setSimilarAlbums] = React.useState<any[]>([])

    // Fetch album info
    React.useEffect(() => {
        (async () => {
            try {
                const albumInfo = await api.lastfm.getAlbumInfoByMbid(mbid);
                if (albumInfo?.body)
                    setAlbum(albumInfo.body);
            } catch (e) {
                console.error('Error fetching album info by MBID:', e);
            }
        })()
    }, [mbid, api]);

    // Fetch reviews
    React.useEffect(() => {
        (async () => {
            try {
                const res = await api.reviews.getReviewsByMbid(mbid) as { body: Review[] };
                if (Array.isArray(res.body))
                    setReviews(res.body as Review[]);
            } catch (e) {
                console.error("Error fetching reviews by MBID:", e);
            }
        })();
    }, [mbid, api]);

    // Fetch similar albums
    React.useEffect(() => {
        if (!album) return;
        
        (async () => {
            try {
                const topAlbumsReponse = await api.lastfm.getArtistTopAlbums(album.artist);
                const top = (topAlbumsReponse?.body as any) || [];                
                setAlbumsAlike(top);

                const similarAlbumsResponse = await api.lastfm.getSimilarAlbums(album.artist, album.name)
                const similar = (similarAlbumsResponse?.body as any) || [];                
                setSimilarAlbums(similar);
            } catch (e) {
                console.error('Error fetching similar albums:', e);
            }
        })()
    }, [album, api]);

    const LeftSide = React.useCallback(() => {
        if (!album)
            return null;
    
        return (
            <div 
                style={{ height: "calc(100vh - 200px)" }}
                className="mt-30 gap-8 flex flex-col overflow-hidden"
            >
                <img 
                    className="rounded-lg border border-white/20 shrink-0" 
                    src={album.image[album.image.length - 1]['#text']} 
                    alt="Album Art" 
                    width="800" 
                />
                
                <div className="flex flex-col gap-0 min-h-0 flex-1">
                    <div className="px-8 flex justify-between items-center shrink-0">
                        <div className="flex space-x-4"><p>@</p><p>Track</p></div>
                        <div className="flex space-x-4"><p>Flame</p><p className="text-end w-24">Length</p></div>
                    </div>
    
                    <div className='w-full h-px bg-white/10 mt-6 shrink-0'></div>
                    
                    <div className="px-8 flex-1 overflow-y-auto flex flex-col gap-8 mt-8 min-h-0">
                        {album.tracks.track.map((track: any, index: number) => {
                            return (
                                <div key={index} className="flex justify-between items-center shrink-0">
                                    <div className="flex space-x-4">
                                        <p>{index + 1}</p>
                                        <p>{track.name}</p>
                                    </div>
                                    <div className="flex space-x-4">
                                        <p>{Math.floor(Math.random() * 6)}.{Math.floor(Math.random() * 10)}</p>
                                        <p className="text-end w-24">
                                            {`${Math.floor(track.duration / 60)}:${(track.duration % 60) < 10 ? '0' + (track.duration % 60) : (track.duration % 60)}`}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }, [album]);




    interface ReviewItemProps {
        review: Review,
        index: number
    }
    
    const ReviewItem = ({ review, index }: ReviewItemProps) => {
        const [pfpUrl, setPfpUrl] = React.useState<string>('');
        const api = React.useMemo(() => new Api('/api'), []);
        const [author, setAuthor] = useState<User | null>(null);

        React.useEffect(() => {
            (async () => {
                try {
                    const res = await api.users.getUserById(review.authorId) as { body: User };
                    setAuthor(res.body);
                } catch (e) {
                    console.error('Error fetching review author:', e);
                }
            })();
        }, [review.authorId, api]);
        
        React.useEffect(() => {
            if (!author) return;
            const loadImage = async () => {
                if (review.author?.image) {
                    const imageFile = await stringToFile(review.author.image);
                    const url = URL.createObjectURL(imageFile);
                    setPfpUrl(url);
                    return () => URL.revokeObjectURL(url);
                }
            };
            
            loadImage();
        }, [author]);
    
        if (!pfpUrl) {
            return null; // ou un skeleton/placeholder
        }
        
        return (
            <div className="p-4 w-full rounded-lg">
                <div className="w-full flex justify-between">
                    <div className="flex gap-8 items-center">
                        <img 
                            src={pfpUrl} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-full object-cover" 
                        />
                        <p className="text-4xl">
                            {author?.username ? author.username : 'Unknown User'}
                        </p>
                    </div>
                    
                    <div 
                        style={{color: starColors[review.note - 1]}}
                        className="flex gap-4 text-3xl items-center">
                        <NoteDisplay note={review.note} />
                        {review.note}
                    </div>
                </div>
                <p className="text-white/50 mt-4 ml-20">{review.content}</p>
            </div>
        );
    };

    const Reviews = React.useCallback(() => {
        return (
            <div className="w-full mb-24 mt-20 h-full">
                <div className="space-y-6 h-full overflow-y-auto">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <ReviewItem key={review.id ?? index} review={review} index={index} />
                        ))
                    ) : (
                        <p>No reviews available.</p>
                    )}
                </div>
            </div>
        );
    }, [reviews]);



    
    const RightSide = React.useCallback(() => {
        const [note, setNote] = React.useState<number>(0);
        const [content, setContent] = React.useState("");
        const [valid, setValid] = React.useState(false);
    
        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
    
            if (!user)
                return;
            try {
                const response = await api.reviews.createReview({
                    note,
                    content,
                    mbid,
                    authorId: user.id,
                });
        
                setValid(response.status === 200);
            } catch (e) {
                if (e === 500)
                    console.error("The review couldn't be created")
            }
        };
    
        const addToPlayList = async (type: PlaylistType) => {
            try {
                const response = await api.users.addToPlaylist(mbid, type)
    
                if (!response)
                    throw("couldnt handle the addition")
            } catch (e) {
                console.error
            }
        }
    
        const getAlbumImage = (albumData: AlikeAlbum, size: 'small' | 'medium' | 'large' | 'extralarge' = 'extralarge') => {
            return albumData?.image?.find((img) => img.size === size)?.['#text'] || '';
        };
    
        return (
            <div className="w-160 pb-20 h-full flex flex-col justify-between shrink-0">
                <div className="h-1/2">
                    <div className="flex gap-1 items-end">
                        <div className="bg-[#181819] py-2 px-3 rounded-t-md h-14 w-auto">
                            <NoteSetter note={note} setNote={setNote} />
                        </div>
    
                        <div className="rounded-lg bg-[#181819] mb-1 px-6 py-3 flex justify-between w-full">
                            <button onClick={() => {addToPlayList("listened")}} className="text-center px-3 flex flex-col items-center">
                                <img src="/listenedNo.svg" className="w-12 hover:opacity-50 opacity-25 duration-100 hover:scale-105 transition-all" />
                                <p className="mt-2">Listened</p>
                            </button>
    
                            <button onClick={() => {addToPlayList("nextList")}} className="text-center px-3 flex flex-col items-center">
                                <img src="/nextlist.svg" className="w-12" />
                                <p className="mt-2">Nextlist</p>
                            </button>
    
                            <button onClick={() => {addToPlayList("hotTakes")}} className="text-center px-3 flex flex-col items-center">
                                <img src="/nextlist.svg" className="w-12" />
                                <p className="mt-2">Hottake</p>
                            </button>
                        </div>
                        
                    </div>
                    <div className="h-full max-h-160 flex flex-col gap-1">
                        <textarea
                            name="content"
                            placeholder="Write a review..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="h-full resize-none px-6 py-3 rounded-r-lg rounded-bl-lg
                                text-start align-top outline-none bg-[#181819]"
                        />
                        <button
                            onClick={handleSubmit}
                            className={`form-field px-4 py-3 rounded-md hover:bg-[#AC2C33]
                                ${valid ? "bg-green-600" : "bg-[#181819]"}
                                duration-100 transition-all`}
                            type="submit"
                        >
                            Submit
                        </button>
                    </div>
                </div>
                
                <div className="flex flex-col mb-12 gap-12">
                    <div className="">
                        <div className="w-full flex justify-between">
                            <p className="">Other works from {album?.artist}</p>
                            <button className="text-white/50 hover:text-white">More</button>
                        </div>
                        <div className="w-full mt-2 flex space-x-2">
                            {albumsAlike && albumsAlike.slice(0, 5).map((alikeAlbum: LastfmAlbumInfo['album'], index: number) => {
                                const imageUrl = getAlbumImage(alikeAlbum);
                                
                                return (
                                    <a 
                                        key={alikeAlbum.mbid || index} 
                                        href={alikeAlbum.mbid ? `/${alikeAlbum.mbid}` : '#'}
                                        className="flex flex-col items-center mt-2 hover:opacity-80 transition-opacity"
                                    >
                                        {imageUrl && (
                                            <img 
                                                src={imageUrl} 
                                                alt={`${alikeAlbum.name} cover`} 
                                                width="100" 
                                                className="rounded-sm" 
                                            />
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
    
                    <div className="">
                        <div className="w-full flex justify-between">
                            <p className="">Albums you might like</p>
                            <button className="text-white/50 hover:text-white">More</button>
                        </div>
                        <div className="w-full mt-2 flex space-x-2">
                            {similarAlbums && similarAlbums.slice(0, 5).map((similarAlbum: LastfmAlbumInfo['album'], index: number) => {
                                const imageUrl = getAlbumImage(similarAlbum);
                                
                                return (
                                    <a 
                                        key={similarAlbum.mbid || index} 
                                        href={similarAlbum.mbid ? `/${similarAlbum.mbid}` : '#'}
                                        className="mt-2 hover:opacity-80 transition-opacity"
                                    >
                                        {imageUrl && (
                                            <img 
                                                src={imageUrl} 
                                                alt={`${similarAlbum.name} cover`} 
                                                width="100" 
                                                className="rounded-sm" 
                                            />
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }, [album, albumsAlike, similarAlbums, user, mbid, api]);

    if (!album) {
        return (
            <div className="h-screen w-screen text-white flex flex-col items-center gap-24 justify-center">
                <p>Loading...</p>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen relative text-white text-[12px] flex flex-col overflow-hidden">
            <Nav />
            <div className="h-1/5 absolute w-full backdrop-blur-[150px] overflow-hidden" />
            <div
                style={{
                    backgroundImage: `url(${album.image[album.image.length - 1]['#text']})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(20px)',
                    zIndex: -1,
                }} className="absolute top-0 left-0 h-1/5 w-full"
            />
            <div className="absolute w-full h-full top-1/5 bg-[#0c0c0e]" />

            <div className="z-10 h-full flex gap-20 px-40">
                <LeftSide />

                <div className="w-full h-full pt-136 ">
                    <div className="flex w-full justify-between gap-20 items-start">
                        <div className="">
                            <h1 className={`text-6xl font-bold ${EuropaBold.className}`}>{album.name}</h1>
                            <h2 className="text-xl mt-2">{album.artist}</h2>
                        </div>
                        <div className="flex gap-32">
                            <p className="">Reviews: {reviews.length}</p>
                            <p className="">Listeners: {album.listeners ? album.listeners : 'N/A'}</p>
                            <p className="">Playcount: {album.playcount ? album.playcount : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="flex h-full gap-20">
                        <Reviews />
                        <RightSide />
                    </div>
                </div>
            </div>
        </div>
    )
}
