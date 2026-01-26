'use client';

import React from 'react';
import Api from '../api/api';


const Nav = () => {
    const api = new Api('/api');
    const [searchResults, setSearchResults] = React.useState<any[]>([]);
    const [text, setValues] = React.useState({name: ""});
    const [user, setUser] = React.useState<any>(null);
    const [connected, setConnected] = React.useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
    
        const { name, value } = event.target;
        setValues((values) => ({
        ...values,
        [name]: value
        }));

        (async () => {
            try {
                const artistAlike = await api.lastfm.searchArtist(value)
                const albumAlike = await api.lastfm.searchAlbum(value)

                const artistResults = Array.isArray(artistAlike?.body) ? artistAlike.body : [];
                const albumResults = Array.isArray(albumAlike?.body) ? albumAlike.body : [];

                if (artistResults.length > 0 || albumResults.length > 0)
                    setSearchResults(artistResults.slice(0, 1).concat(albumResults));
            } catch (e) {
                console.error('Error searching albums:', e)
            }
        })();
    };

    React.useEffect(() => {
        const tmp = api.users.getMe()
        if (tmp) {
            setUser(tmp);
            setConnected(true);
        }
        setConnected(false);
    }, []);

    const UserButton = () => {
        return (
            <div className="flex space-x-4 w-full justify-end relative">
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="hover:underline relative">
                    <img src="/noUser.svg" className="h-6" />
                </button>
                
                {isMenuOpen && (
                    <div className="absolute top-full right-0 mt-5 bg-[#181819] rounded-lg z-50">
                        {!connected ? 
                            <button 
                                onClick={() => {
                                    window.location.href = '/login';
                                    setIsMenuOpen(false);
                                }}
                                className="w-full py-2 text-left flex gap-1 hover:bg-white/5 px-6 rounded-t-lg">
                                Login
                                <p className="text-white/50">or</p>
                                register
                            </button>
                        : 
                            <>
                                <button 
                                    onClick={() => {
                                        console.log('Option 2');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full py-2 px-6">
                                    Account
                                </button>
                                <button 
                                    onClick={() => {
                                        console.log('Option 3');
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full py-2 px-6">
                                    Settings
                                </button>
                                <button 
                                    onClick={() => {
                                        api.users.logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full py-2 text-left px-6 bg-red-400/5 text-red-400">
                                    Log out
                                </button>
                            </>
                        }
                    </div>
                )}
            </div>
        )
    }

    const ResultList = () => {
        return (
            <div className="absolute top-12 mt-2 w-80 bg-[#181819] rounded-lg shadow-lg z-50">
                {Array.from(searchResults).slice(0, 5).map((result, index) => (
                    <a key={index} href={`/${result.mbid}`} className="block px-4 py-2 hover:bg-[#282829] border-b border-white/10">
                        <p className="text-white text-sm">{result.name} by {result.artist}</p>
                    </a>
                ))}
            </div>
        );

    }

    return (
        <nav className="w-full z-50 px-8 py-6 text-white bg-[#0c0c0e] h-13 flex items-center justify-center text-[12px]">
            <div className="flex space-x-8 w-full">
                <a href="/" className="hover:underline"><img src="/logo.svg" className="h-5" /></a>
                <div className="flex space-x-5">
                    <a href="/" className="hover:underline">Home</a>
                    <a href="/discover" className="hover:underline">Discover</a>
                    <a href="/profile" className="hover:underline">Profile</a>
                </div>
            </div>

            <ResultList />

            {/* Search bar */}
            <div className="flex w-full justify-center items-center">
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


            <UserButton />
            
        </nav>
    );
}

export default Nav;