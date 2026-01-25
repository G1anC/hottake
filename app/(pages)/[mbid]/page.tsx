'use client'

import React from 'react';
import Api from '../../api/api';
import Note from './../../components/note'

export default function MbidPage({ params }: { params: Promise<{ mbid: string }> }) {
    const { mbid } = React.use(params);
    const api = new Api('/api');
    const [album, setAlbum] = React.useState<any>(null);
    const [reviews, setReviews] = React.useState<any[]>([]);

    React.useEffect(() => {
        (async () => {
            try {
                const artistInfo = await api.lastfm.getAlbumInfo("23wa", "AZ");
                const reviews = await api.lastfm.getAlbumInfoByMbid(mbid);
                if (artistInfo?.body) {
                    setAlbum(artistInfo.body);
                }
                if (reviews?.body && Array.isArray(reviews.body)) {
                    setReviews(reviews.body);
                }
                return
            } catch (e) {
                console.error('Error fetching artist info by MBID:', e);
            }
        })()
    }, [mbid]);

    const LeftSide = () => {
        return (
            <div className="-mt-50 ">
                <img className="rounded-lg border border-white/20"src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="700" />
                <div className="mt-8 px-8 h-full overflow-y-scroll">
                     <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                            <p>@</p>
                            <p>Track</p>
                        </div>
                        <div className="flex space-x-4">
                            <p>Flame</p>
                            <p className="text-end w-24">Length</p>
                        </div>
                    </div>
                    <div className='w-full h-px bg-white/10 my-6'></div>
                    {album.tracks.track.map((track: any, index: number) => (
                        <div key={index} className="flex justify-between mt-4 items-center">
                            <div className="flex space-x-4">
                                <p>{index + 1}</p>
                                <p>{track.name}</p>
                            </div>
                            <div className="flex space-x-4">
                                <p>{Math.floor(Math.random() * 6)}.{Math.floor(Math.random() * 10)}</p>
                                <p className="text-end w-24">{track.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const Reviews = () => {
        return (
            <div className="w-full mb-24 mt-20 h-full">
                <h3 className="text-2xl font-bold mb-4">Reviews</h3>
                <div className="space-y-6 h-full overflow-y-auto pr-4">
                    {reviews.length > 0 ? reviews.map((review, index) => (
                        <div key={index} className="bg-white/10 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">{review.title}</h4>
                             <p className="text-sm">{review.content}</p>
                            <p className="text-xs mt-2">- {review.author}</p>
                        </div>
                    )) : <p>No reviews available.</p>}
                </div>
            </div>
        )
    }

    const RightSide = () => {
        const [note, setNote] = React.useState(0)
        interface AlikeAlbum {
            name: string;
            artist: string;
            image: Array<{ '#text': string; size: string }>;
            mbid?: string;
            url?: string;
            [key: string]: any;
        }
        const [albumsAlike, setAlbumsAlike] = React.useState<AlikeAlbum[]>([]);

        React.useEffect(() => {
            (async () => {
                try {
                    const albumsAlikeRes = await api.lastfm.getArtistTopAlbums(album.artist);
                    const topalbums = (albumsAlikeRes?.body as any)?.topalbums;
                    const alikeAlbums: AlikeAlbum[] = topalbums && Array.isArray(topalbums['album']) ? topalbums['album'] : [];
                    setAlbumsAlike(alikeAlbums);
                    return;
                } catch (e) {
                    console.error('Error fetching similar albums:', e);
                }
            })()
        }, [album]);

        return (
            <div className="w-120 pb-20 h-full flex flex-col justify-between shrink-0">
                <div className="h-1/2">
                    <div className="flex gap-1 items-end">
                        <div className="bg-[#181819] py-2 px-3 rounded-t-md h-14 w-auto">
                            <Note />
                        </div>

                        <div className="rounded-lg bg-[#181819] mb-1 px-6 py-3 flex justify-between w-full">
                            <button onClick={() => {}} className="text-center px-3 flex flex-col items-center">
                                <img src="/listenedNo.svg" className="w-12 hover:opacity-50 opacity-25 duration-100 hover:scale-105 transition-all" />
                                <p className="mt-2">
                                    Listened
                                </p>
                            </button>

                            <button onClick={() => {}} className="text-center px-3 flex flex-col items-center">
                                <img src="/nextlist.svg" className="w-12" />
                                <p className="mt-2">
                                    Nextlist
                                </p>
                            </button>

                            <button onClick={() => {}} className="text-center px-3 flex flex-col items-center">
                                <img src="/nextlist.svg" className="w-12" />
                                <p className="mt-2">
                                    HOTTAKE
                                </p>
                            </button>
                        </div>
                        
                    </div>
                    <div className="h-full max-h-160 flex flex-col gap-1">
                        <input placeholder="Write a review..." className="h-full rounded-r-lg placeholder:text-start placeholder:align-to px-6 py-3 rounded-bl-lg text-start outline-none bg-[#181819]">
                        </input>
                        <button className="form-field px-4 py-3 rounded-md bg-[#181819]  duration-100 transition-all" type="submit">
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
                            {Array.from(albumsAlike).slice(0, 5).map((album: any, index: number) => (
                                <div key={index} className="flex flex-col items-center mt-2">
                                    <p>{album.name}</p>
                                    <p>{album.mbid}</p>
                                    <p>{album.artist}</p>

                                    <img src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                </div>
                            ))}
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <div key={index} className="flex flex-col items-center mt-2">
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
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <div key={index} className="flex flex-col items-center mt-2">
                                    <img src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="100" className="rounded-xs " />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }




    if (!album) {
        return (
            <div className="h-screen w-screen text-white flex flex-col items-center gap-24 justify-center">
                <p>
                    Loading...
                </p>
            </div>
        )
    }
    return (
        <div className="h-screen w-screen relative text-white flex flex-col text-[10px] overflow-hidden">

            <div className="h-80 w-full backdrop-blur-[150px] overflow-hidden" />
            <div
                style={{
                    backgroundImage: `url(${album.image[album.image.length - 1]['#text']})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(20px)',
                    zIndex: -1,
                }} className="absolute top-0 left-0 h-80 w-full"
            />

            <div className="relative z-10 h-full bg-[#0c0c0e] flex gap-20 px-32">
                <LeftSide />

                <div className="w-full h-full pt-8">
                    <div className="flex w-full justify-between items-start">
                        <div className="">
                            <h1 className="text-6xl font-bold">{album.name}</h1>
                            <h2 className="text-xl mt-2">{album.artist}</h2>
                        </div>
                        <p className="ml-200">Reviews: {reviews.length}</p>
                        <p className="">Listeners: {album.listeners ? album.listeners : 'N/A'}</p>
                        <p className="">Playcount: {album.playcount ? album.playcount : 'N/A'}</p>
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