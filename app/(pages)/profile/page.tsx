import Api from "../../api/api"
import Nav from "@/app/components/nav";
import { Review } from "@prisma/client";
import { EuropaBold } from "@/app/lib/loadFont";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import UserPicture from "./UserPicture";
import { LastfmAlbumInfo } from "@/app/lib/types/lastfm";

const getServerSession = async () => {
    return auth.api.getSession({
        headers: await headers(),
    })
};

export default async function Profile() {
    const api = new Api('http://localhost:3000/api');

    const session = await getServerSession();

    if (!session?.user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-white text-2xl">You must be logged in to view this page.</p>
            </div>
        )
    };

    let imagesFromAlbums: string[] = []
    let reviews: Review[] = [];

    const listenedAlbums = await Promise.all(
        (session.user.Listened || []).map(async (albumMbid: string) => {
            try {
                const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body
                return album
            } catch (error) {
                return null
            }
        })
    );

    const bigFiveAlbums = await Promise.all(
        (session.user.bigFive || []).map(async (albumMbid: string) => {
            try {
                const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body
                return album
            } catch (error) {
                return null
            }
        })
    );

    const nextListAlbums = await Promise.all(
        (session.user.nextList || []).map(async (albumMbid: string) => {
            try {
                const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body
                return album
            } catch (error) {
                return null
            }
        })
    );

    const hotTakesAlbums = await Promise.all(
        (session.user.hotTakes || []).map(async (albumMbid: string) => {
            try {
                const album = (await api.lastfm.getAlbumInfoByMbid(albumMbid)).body
                return album
            } catch (error) {
                return null
            }
        })
    );


    if (session?.user?.reviews) {
        reviews = session.user.reviews;

        const images = await Promise.all(
            reviews.map(async (review: Review) => {
                try {
                    const album = (await api.lastfm.getAlbumInfoByMbid(review.mbid)).body
                    if (!album || !album.image || album.image.length === 0) {
                        return null
                    }
                    const image = album.image[album.image.length - 1]['#text']
                    return image
                } catch (error) {
                    return null
                }
            })
        );
        imagesFromAlbums = images.filter(img => img !== null) as string[];
    }

    const Reviews = ({ reviews }: { reviews: Review[] }) => {
        return (
            <div className="w-full mb-24 mt-20 h-full">
                <h3 className="text-2xl font-bold mb-4">Reviews</h3>
                <div className="space-y-6 h-full overflow-y-auto pr-4">
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <div key={index} className="bg-white/10 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Note: {review.note / 2}</h4>
                                <p className="text-sm">{review.content}</p>
                            </div>
                        ))
                    ) : (
                        <p>No reviews available.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen text-white flex flex-col overflow-hidden">            
            <div className="flex-1 flex flex-col relative overflow-hidden">                
                <div
                    style={{
                        backgroundImage: `url("https://picsum.photos/200")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(100px)',
                        zIndex: -1,
                    }} className="absolute top-0 left-0 h-1/5 w-full"
                />
                <div className="absolute w-full h-full top-1/5 bg-[#0c0c0e]" />
                <div className=" h-full flex flex-col w-full px-60 pb-8 items-center justify-center z-10">
                    <div className="w-full min-h-1/5 z-50 mt-8 flex justify-center shrink-0 gap-2">
                        {imagesFromAlbums.map((image, index) => {
                            return (
                                <img className=" aspect-square z-50 w-full max-w-180 rounded-lg" src={image} key={index} />
                            )
                        })}
                    </div>
                    <div className="w-full flex justify-between space-x-8 pt-8">
                        <div className="flex items-start space-x-8">
                            <UserPicture userId={session.user.id} b64Image={session.user.image} />
                            <div className="">
                                <h1 className={`text-8xl font-bold ${EuropaBold.className}`}>{session?.user?.username}</h1>
                                <p className="opacity-50 mt-4">{session?.user?.bio}</p>
                            </div>
                        </div>
                        <div className="w-full max-w-200 gap-4 flex justify-between shrink-0">
                            <div className="flex gap-2">
                                Reviews:
                                <div>{!reviews ? "0" : reviews.length}</div>
                            </div>
                            <div className="flex gap-2">
                                Member since:
                                <div>{new Date(session?.user?.createdAt || '').toLocaleDateString('fr-FR', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}</div>
                            </div>
                        </div>
                    </div>
                    <div className="h-full w-full flex gap-40 mt-12">
                        <div className="w-full h-full">
                            <Reviews reviews={reviews} />
                        </div>
                        <div className="w-240 h-full flex flex-col justify-between min-gap-8">
                                <div className="">
                                    <div className="w-full flex justify-between">
                                        <p className="">Big Five</p>
                                        <button className="text-white/50 hover:text-white">More</button>
                                    </div>
                                    <div className="w-full mt-2 flex space-x-1">
                                        {bigFiveAlbums.slice(0, 5).map((album, index: number) => (
                                            album ? (
                                                <div key={index} className="flex flex-col items-center mt-2">
                                                    <p>{album?.name}</p>
                                                    <p className="text-sm text-white/50">{album?.artist}</p>
                                                    <img src={album?.image?.[album.image.length - 1]?.['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="w-full flex justify-between">
                                        <p className=""></p>
                                        <button className="text-white/50 hover:text-white">More</button>
                                    </div>
                                    <div className="w-full mt-2 mb-24 flex space-x-1">
                                        {/* {album && [1, 2, 3, 4, 5].map((_, index) => (
                                            <div key={index} className="flex flex-col items-center mt-2">
                                                <img src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                            </div>
                                        ))} */}
                                    </div>
                            </div>
                        </div>
                    </div>
                </div> 
            </div>
        </div>
    )
}
