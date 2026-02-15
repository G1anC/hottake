import Api from '../../../api/api';

import { auth } from "@/app/lib/auth";
import { DeezerTrackSearchResponse, LastfmArtistInfo } from '@/app/lib/types/lastfm';
import deezer from '@/app/routes/deezer';
import { headers } from "next/headers";
import Image from 'next/image';

const getServerSession = async () => {
    return auth.api.getSession({
        headers: await headers(),
    });
};

interface MbidPageProps {
    params: Promise<{ artistId: string }>;
}

export default async function ArtistPage({ params }: MbidPageProps) {
    const { artistId } = await params;
    const api = new Api('http://localhost:3000/api');

    const session = await getServerSession();

    let deezerArtist: any = null
    let artist: LastfmArtistInfo['artist'] | null = null

    try {
        const artistInfo = await api.lastfm.getArtistInfoByMbid(artistId);
        if (artistInfo?.body)
            artist = artistInfo.body;

        const deezerArtistInfo = await api.deezer.searchArtist(artistInfo.body.name)
        if (deezerArtistInfo?.body)
            // c'est pleins de 
            deezerArtist = deezerArtistInfo.body.data[0].artist

    } catch (e) {
        console.error('Error fetching album info by MBID:', e);
    }


    if (!artist)
        return
    return (
        <div className="w-screen text-white h-screen pb-14 bg-[#0c0c0e] flex justify-start relative items-start">
            <div style={{ height: "calc(100vh - 2vh)" }} className="z-10 pb-14 w-full relative bg-[#0c0c0e] flex items-start gap-20">
                <div className="relative pl-20 w-full aspect-square min-w-200 max-w-[80vw] z-10 py-12 lg:max-w-200">
                    <Image
                        className="rounded-lg border border-white/20 object-cover"
                        src={deezerArtist.picture_xl || ''}
                        alt="Artist Art"
                        fill
                        sizes="(max-width: 1024px) 80vw, 1200px"
                        priority
                    />
                </div>
                <div
                    style={{
                        backgroundImage: `url(${deezerArtist.picture_xl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'start',
                        zIndex: -1,
                        height: "calc(20vh)"
                    }}
                    className="w-full absolute top-0 left-0"
                />
                <div className="h-[20vh] absolute w-full top-0 backdrop-blur-[150px]" />
                <div className="w-100 aspect-square">
            </div>
            </div>
        </div>
    )
}