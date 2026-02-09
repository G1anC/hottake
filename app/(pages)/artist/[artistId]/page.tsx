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
        <div className="w-screen text-white h-screen pb-14 bg-[#0c0c0e] flex justify-center items-center">
            {artist.name}
            <div className="w-100 aspect-square">
                <Image
                    className="rounded-lg border w-100 border-white/20 object-cover"
                    src={deezerArtist.picture_xl || ''}
                    alt="Artist Art"
                    width={100}
                    height={100}
                    sizes="(max-width: 200px) 5vw, 200px"
                    priority
                />
            </div>
            {deezerArtist ?
                <>
                    {deezerArtist.name}
                </>
                :
                <>
                </>
            
            }
        </div>
    )
}