import Api from "../../api/api"
import Nav from "@/app/components/nav";
import { Review } from "@prisma/client";
import { EuropaBold } from "@/app/lib/loadFont";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import UserPicture from "./UserPicture";
import { LastfmAlbumInfo } from "@/app/lib/types/lastfm";
import { stringToFile } from "@/app/lib/images.service";
import Image from "next/image";
import { listen } from "node:quic";

const getServerSession = async () => {
    return auth.api.getSession({
        headers: await headers(),
    })
};

export default async function Profile() {
    const api = new Api('http://localhost:3000/api');

    const session = await getServerSession();


    if (!session?.user || !session)
        return <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-white text-2xl">You must be logged in to view this page.</p>
            </div>

    const backgroundImage = session?.user.image 
        ? await stringToFile(session.user.image)
        : null;

    let imagesFromAlbums: string[] = []
    let reviews: Review[] = [];

    const listenedAlbums = await Promise.all(
        (session.user.listened || []).map(async (albumMbid: string) => {
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
                                <p className="text-[12px]">{review.content}</p>
                            </div>
                        ))
                    ) : (
                        <p>No reviews available.</p>
                    )}
                </div>
            </div>
        );
    }

    console.log(backgroundImage)
    console.log('Background URL:', backgroundImage ? URL.createObjectURL(backgroundImage) : 'none');


    return (
        <div className="h-screen w-screen text-white flex flex-col overflow-hidden">            
            <div className="flex-1 flex flex-col relative overflow-hidden">       
                <div className="h-1/5 absolute w-full backdrop-blur-[150px] overflow-hidden" />
                <Image
                    src={'https://picsum.photos/200/300'} //FIX: change this image by the background
                    alt="background"
                    fill
                    unoptimized // This bypasses Next.js optimization
                    className="object-cover h-1/5 w-full -z-10"
                />
                <div className="absolute w-full h-full top-1/5 bg-[#0c0c0e]" />
                <div className=" h-full flex flex-col w-full px-60 pb-8 items-center justify-center z-10">
                    <div className="w-full min-h-1/5 z-50 mt-8 flex justify-center shrink-0 gap-2">
                        {bigFiveAlbums.map((album, index) => {
                            if (!album) return
                            return (
                                <img className=" aspect-square z-50 w-full max-w-180 rounded-lg" src={album.image[album.image.length - 1]['#text']} key={index} />
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
                        <div className="w-240 h-full pb-12 flex flex-col justify-between min-gap-8">
                            <div className="">
                                <div className="w-full flex justify-between">
                                    <p className="">Listened</p>
                                    <button className="text-white/50 hover:text-white">More</button>
                                </div>
                                <div className="w-full mt-2 flex space-x-1">
                                    {listenedAlbums.slice(0, 5).map((album, index: number) => (
                                        album ? (
                                            <div key={index} className="">
                                                <img src={album?.image?.[album.image.length - 1]?.['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>

                            <div className="">
                                <div className="w-full flex justify-between">
                                    <p className="">Hottakes</p>
                                    <button className="text-white/50 hover:text-white">More</button>
                                </div>
                                <div className="w-full mt-2 flex space-x-1">
                                    {hotTakesAlbums.slice(0, 5).map((album, index: number) => (
                                        album ? (
                                            <div key={index} className="">
                                                <img src={album?.image?.[album.image.length - 1]?.['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                            <div className="mb-6">
                                <div className="w-full flex justify-between">
                                    <p className="">Nextlist</p>
                                    <button className="text-white/50 hover:text-white">More</button>
                                </div>
                                <div className="w-full mt-2 flex space-x-1">
                                    {nextListAlbums.slice(0, 5).map((album, index: number) => (
                                        album ? (
                                            <div key={index} className="">
                                                <img src={album?.image?.[album.image.length - 1]?.['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> 
        </div>
    )
}
