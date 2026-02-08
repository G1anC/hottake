import Api from '../../../api/api';
import { EuropaBold } from '@/app/lib/loadFont';
import { Review, User } from '@prisma/client';
import { LastfmAlbumInfo, LastfmAlbumSummary } from '@/app/lib/types/lastfm';
import LeftSide from './components/LeftSide';
import RightSide from './components/RightSide';
import { ReviewModal } from './components/ReviewModal';
import Reviews from './components/Reviews';
import { ModalProvider } from './contexts/ModalContext';
import { Stat } from "@/app/components/stats"
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

interface MbidPageProps {
    params: Promise<{ mbid: string }>;
}


const getServerSession = async () => {
    return auth.api.getSession({
        headers: await headers(),
    });
};


export default async function MbidPage({ params }: MbidPageProps) {
    const { mbid } = await params;
    const api = new Api('http://localhost:3000/api');

    const session = await getServerSession();

    let album: LastfmAlbumInfo["album"] | null = null;
    let reviews: (Review & { author: User })[] = [];
    let albumsAlike: LastfmAlbumSummary[] = [];
    let similarAlbums: LastfmAlbumSummary[] = [];
    let userReview: Review & { author: User } | null = null

    try {
        const albumInfo = await api.lastfm.getAlbumInfoByMbid(mbid);
        if (albumInfo?.body)
            album = albumInfo.body;
    } catch (e) {
        console.error('Error fetching album info by MBID:', e);
    }

    try {
        const res = await api.reviews.getReviewsByMbid(mbid) as { body: (Review & { author: User })[] };
        if (Array.isArray(res.body)) {
            reviews = res.body;
            if (session && session.user) {
                const userId = session.user.id;
                userReview = res.body.find((review) => review.authorId === userId) ?? null;
            }
        }
    } catch (e) {
        console.error("Error fetching reviews by MBID:", e);
    }

    if (album) {
        try {
            const topAlbumsReponse = await api.lastfm.getArtistTopAlbums(album.artist);
            albumsAlike = (topAlbumsReponse?.body.filter(a => a.mbid !== album.mbid)) || [];
            const similarAlbumsResponse = await api.lastfm.getSimilarAlbums(album.artist, album.name);
            similarAlbums = (similarAlbumsResponse?.body.filter(a => a.mbid !== album.mbid)) || [];
        } catch (e) {
            console.error('Error fetching similar albums:', e);
        }
    }



    if (!album) {
        return (
            <div className="h-screen w-screen text-white flex flex-col items-center gap-24 justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <ModalProvider>
            <div className="h-full w-screen relative text-white text-[12px] flex flex-col overflow-hidden">
                <ReviewModal mbid={mbid} content={(userReview && userReview.content) ? userReview.content : ""} note={userReview ? userReview.note : 0} />
                <div style={{ height: "calc(100vh - 2vh)"}} className="z-10 h-[80vh] pb-14 relative bg-[#0c0c0e] flex items-end gap-20">
                    <div
                        style={{
                            backgroundImage: `url(${album?.image.find(img => img.size === 'extralarge')?.['#text'] || ''})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            zIndex: -1,
                            height: "calc(20vh)"
                        }}
                        className="w-full absolute top-0 left-0"
                    />
                    <div className="h-[20vh] absolute w-full top-0 backdrop-blur-[150px]" />
                    <LeftSide album={album} />


                    <div style={{height: "calc(80vh - 60px)"}} className="w-full flex flex-col gap-4 h-full">
                        <div className="flex w-full justify-between gap-20 pr-20 items-start pt-12">
                            <div className="">
                                <h1 className={`text-6xl font-bold ${EuropaBold.className}`}>{album?.name}</h1>
                                <h2 className="text-[12px] mt-2">{album?.artist}</h2>
                            </div>
                            <div className="flex gap-32">
                                <Stat label="Reviews" value={reviews.length} />
                                <Stat label="Playcount" value={album?.playcount ? Number(album.playcount).toLocaleString() : 'N/A'} />
                                <Stat label="Listeners" value={album?.listeners ? Number(album.listeners).toLocaleString() : 'N/A'} />
                                <Stat label="Tracks" value={album?.tracks ? album.tracks.track.length : 'N/A'} />
                            </div>
                        </div>

                        <div className="flex flex-1 gap-20 min-h-0 pr-20">
                            <Reviews reviews={reviews} userReview={userReview ? userReview : null} />
                            <RightSide album={album} albumsAlike={albumsAlike} similarAlbums={similarAlbums} mbid={mbid} userReview={userReview} />
                        </div>
                    </div>
                </div>
            </div>
        </ModalProvider>
    );
}