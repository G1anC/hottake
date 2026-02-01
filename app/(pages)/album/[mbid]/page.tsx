import React from 'react';
import Api from '../../../api/api';
import Nav from '@/app/components/nav';
import { EuropaBold } from '@/app/lib/loadFont';
import { Review, User } from '@prisma/client';
import { LastfmAlbumInfo, LastfmAlbumSummary } from '@/app/lib/types/lastfm';
import LeftSide from './components/LeftSide';
import RightSide, {NewWriteReviewModal} from './components/RightSide';
import Reviews from './components/Reviews';
import { ModalProvider } from './contexts/ModalContext';

interface MbidPageProps {
    params: Promise<{ mbid: string }>;
}

export default async function MbidPage({ params }: MbidPageProps) {
    const { mbid } = await params;
    const api = new Api('http://localhost:3000/api');

    let album: LastfmAlbumInfo["album"] | null = null;
    let reviews: (Review & { author: User })[] = [];
    let albumsAlike: LastfmAlbumSummary[] = [];
    let similarAlbums: LastfmAlbumSummary[] = [];

    try {
        const albumInfo = await api.lastfm.getAlbumInfoByMbid(mbid);
        if (albumInfo?.body) album = albumInfo.body;
    } catch (e) {
        console.error('Error fetching album info by MBID:', e);
    }

    try {
        const res = await api.reviews.getReviewsByMbid(mbid) as { body: (Review & { author: User })[] };
        if (Array.isArray(res.body)) reviews = res.body;
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

    const Stat = ({ label, value }: { label: string; value: string | number }) => (
        <div className="flex flex-col items-end">
            <p className="text-[10px] text-white/50">{label}</p>
            <p className="text-[12px] font-semibold">{value}</p>
        </div>
    );

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
                <NewWriteReviewModal mbid={mbid} />
                <div style={{ height: "calc(100vh - 2vh)"}} className="z-10 h-[80vh] pb-12 relative bg-[#0c0c0e] flex items-end gap-20">
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
                            <Reviews reviews={reviews} />
                            <RightSide album={album} albumsAlike={albumsAlike} similarAlbums={similarAlbums} mbid={mbid} />
                        </div>
                    </div>
                </div>
            </div>
        </ModalProvider>
    );
}