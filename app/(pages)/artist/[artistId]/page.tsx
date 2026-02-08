import Api from '../../../api/api';

import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";


const getServerSession = async () => {
    return auth.api.getSession({
        headers: await headers(),
    });
};

interface MbidPageProps {
    params: Promise<{ mbid: string }>;
}

export default async function ArtistPage({ params }: MbidPageProps) {
    const { artistId } = await params;
    const api = new Api('http://localhost:3000/api');

    const session = await getServerSession();

    return (
        <div></div>
    )
}