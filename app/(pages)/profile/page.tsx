import Api from "../../api/api"
import Nav from "@/app/components/nav";
import { Review } from "@prisma/client";
import { EuropaBold } from "@/app/lib/loadFont";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import UserPicture from "./UserPicture";

const getServerSession = async () => {
    return auth.api.getSession({
        headers: await headers(),
    })
};

export default async function Profile() {
    const api = new Api('/api');

    const session = await getServerSession();

    if (!session?.user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-white text-2xl">You must be logged in to view this page.</p>
            </div>
        )
    };

    let reviews: Review[] = [];
    let imagesFromAlbums: string[] = [];
    const listenedAlbums = await Promise.all(
        session.user.Listened.map(async (albumMbid: string) => {
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
                    if (!album.image)
                        return null
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
            <Nav />
            <div className="w-full h-full flex items-center overflow-hidden justify-cente relative flex-col">
                <div className="h-140 w-full backdrop-blur-[150px] absolute top-0 left-0" />
                
                <div
                    style={{
                        backgroundImage: `url("https://picsum.photos/200")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(100px)',
                        zIndex: -1,
                    }} className="absolute top-0 left-0 h-140 w-full"
                />
                <div className="absolute w-full h-full top-140 bg-[#0c0c0e]" />
                <div className=" h-full flex flex-col w-full px-60 pb-8 items-center justify-center z-10">
                    <div className="w-full z-50 mt-12 flex justify-center gap-2">
                        {imagesFromAlbums.map((image, index) => {
                            return (
                                <img className=" aspect-square z-50 w-full max-w-180 rounded-lg" src={image} key={index} />
                            )
                        })}
                    </div>
                    <div className="w-full flex justify-between space-x-8 pt-12">
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
                                        {listenedAlbums.slice(0, 5).map((album, index: number) => (
                                            <div key={index} className="flex flex-col items-center mt-2">
                                                <p>{album?.name}</p>
                                                <p>{album?.mbid}</p>
                                                <p>{album?.artist}</p>
                                                <img src={album?.image[album.image.length - 1]['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                            </div>
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
