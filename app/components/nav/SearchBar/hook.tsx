import Api from "@/app/api/api";
import { LastfmAlbumSummary, LastfmArtistSummary } from "@/app/lib/types/lastfm";
import { useEffect, useMemo, useState } from "react";

export const useSearchBar = () => {
    const api = useMemo(() => new Api('/api'), []);
    const [albumResults, setAlbumResults] = useState<LastfmAlbumSummary[]>([]);
    const [artistResults, setArtistResults] = useState<LastfmArtistSummary[]>([]);
    const [text, setValues] = useState({ name: "" });

    const removeDuplicateName = (name: string): string => {
        const parts = name.split(' ');
        const midpoint = Math.floor(parts.length / 2);

        // Check if the name can be split into two identical halves
        if (parts.length % 2 === 0) {
            const firstHalf = parts.slice(0, midpoint).join(' ');
            const secondHalf = parts.slice(midpoint).join(' ');

            if (firstHalf === secondHalf) {
                return firstHalf;
            }
        }

        return name;
    };

    useEffect(() => {
        // Debounce logic
        const handler = setTimeout(() => {
            const fetchResults = async () => {
                try {
                    const artistAlike = await api.lastfm.searchArtist(text.name)
                    const albumAlike = await api.lastfm.searchAlbum(text.name)

                    const artistResults = Array.isArray(artistAlike?.body) ? artistAlike.body : [];
                    const albumResults = Array.isArray(albumAlike?.body) ? albumAlike.body : [];

                    if (artistResults.length > 0 || albumResults.length > 0) {
                        console.log(artistResults)
                        setArtistResults(
                            artistResults.slice(0, 2).map(artist => ({
                                ...artist,
                                name: removeDuplicateName(artist.name)
                            }))
                        );
                        setAlbumResults(albumResults.filter(album => !album.artist.includes(',')).slice(0, 5));
                    }
                } catch (e) {
                    console.error('Error searching albums:', e)
                }
            };

            if (text.name.length > 0) {
                fetchResults();
            } else {
                setArtistResults([]);
                setAlbumResults([]);
            }
        }, 350); // 350ms debounce

        return () => clearTimeout(handler);
    }, [text, api]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const { name, value } = event.target;
        setValues((values) => ({
            ...values,
            [name]: value
        }));
    }

    return { artistResults, albumResults, text, handleInputChange };
};

