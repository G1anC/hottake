'use client';

import React, { useEffect } from 'react';
import Api from '../../api/api';

import Link from "next/link";

import UserButton from './UserButton';

const useSearchBar = () => {
    const api = new Api('/api');
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [text, setValues] = React.useState({name: ""});
    
    useEffect(() => {
        const fetchResults = async () => {
            try {
                const artistAlike = await api.lastfm.searchArtist(text.name)
                const albumAlike = await api.lastfm.searchAlbum(text.name)

                const artistResults = Array.isArray(artistAlike?.body) ? artistAlike.body : [];
                const albumResults = Array.isArray(albumAlike?.body) ? albumAlike.body : [];

                if (artistResults.length > 0 || albumResults.length > 0)
                    setSearchResults(artistResults.slice(0, 1).concat(albumResults));
            } catch (e) {
                console.error('Error searching albums:', e)
            }
        };

        // if (text.name.length > 0) {
        //     fetchResults();
        // } else {
        //     setSearchResults([]);
        // }

    }, [api.lastfm, text]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
            
        const { name, value } = event.target;
        setValues((values) => ({
        ...values,
        [name]: value
        }));
    }
    return { searchResults, text, handleInputChange };
}

const Nav = () => {
    const { searchResults, text, handleInputChange } = useSearchBar();

    const ResultList = () => {
        return (
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12  mt-2 w-80 bg-[#181819] overflow-hidden rounded-lg shadow-lg z-50">
                {Array.from(searchResults).slice(0, 5).map((result, index) => (
                    <a key={index} href={`/${result.mbid}`} className="block px-4 py-2 hover:bg-[#282829] border-b border-white/10">
                        <p className="text-white text-sm">{result.name} by {result.artist}</p>
                    </a>
                ))}
            </div>
        );
    }

    return (
        <nav className="w-full z-50 relative px-8 py-6 text-white bg-[#0c0c0e] h-14 flex items-center justify-between text-sm">
            <div className="flex space-x-8 items-center">
                <Link href="/" className="hover:underline"><img src="/logo.svg" className="h-5" /></Link>
                <div className="flex space-x-5">
                    <Link href="/" className="hover:underline">Home</Link>
                    <Link href="/discover" className="hover:underline">Discover</Link>
                    <Link href="/profile" className="hover:underline">Profile</Link>
                </div>
            </div>

            {/* Search bar */}
            <div className="flex justify-center absolute left-1/2 transform -translate-x-1/2 items-center">
                <div className="relative w-80 rounded-lg bg-[#181819]">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full px-4 py-2 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/10"
                        name="name"
                        value={text.name}
                        onChange={handleInputChange}
                    >
                    </input>
                    <button className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white">
                        <img src="/cross.svg" />
                    </button>
                </div>
            </div>

            <ResultList />

            <UserButton />
            
        </nav>
    );
}

export default Nav;
