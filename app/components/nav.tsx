'use client';

import React from 'react';
import Api from '../api/api';
import { User } from '../lib/types';
import { stringToFile } from '../lib/images.service';


const Nav = () => {
    const api = new Api('/api');
    const [text, setValues] = React.useState({name: ""});
    const [user, setUser] = React.useState<any>(null);
    const [connected, setConnected] = React.useState<boolean>(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState<boolean>(false);
    const [albumResults, setAlbumResults] = React.useState<any[]>([])
    const [artistResults, setArtistResults] = React.useState<any[]>([])
    const [image, setImage] = React.useState<any>(null);

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
                setAlbumResults(
                    Array.isArray(albumAlike?.body) 
                        ? albumAlike.body.filter(album => !album.artist.includes(','))
                        : []
                );   
                setArtistResults(
                    Array.isArray(artistAlike?.body) 
                        ? artistAlike.body.filter(artist => !artist.name.includes(','))
                        : []
                );       
            } catch (e) {
                console.error('Error searching albums:', e)
            }
        })();
    };

    React.useEffect(() => {
            const fetchMe = async () => {
                try {
                    const me = await api.users.getMe() as { body: User };
                    setUser(me.body);
                    if (me.body?.image) {
                        const responseImage = await stringToFile(me.body.image as string);
                        setImage(responseImage);
                    }
                } catch {
                    window.location.href = "/login";
                }
            };
            fetchMe();
        }, []);

        const UserButton = () => {
            return (
                <div className="flex w-full h-ful items-center justify-end px-12 ">
                    <div className="relative flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="hover:scale-110 z-10 duration-100 transition-all aspect-square">
                            <img src={image ? URL.createObjectURL(image) : "https://picsum.photos/200"} className="h-8 aspect-square rounded-full border border-white/20" />
                        </button>
                        
                        {isMenuOpen && (
                            <div className="absolute top-full right-0 mt-5 bg-[#181819] rounded-lg z-50">
                                {!user ? 
                                    <button 
                                        onClick={() => {
                                            window.location.href = '/login';
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full py-4 text-left flex gap-1 hover:bg-white/5 px-8 rounded-t-lg">
                                        Login
                                        <p className="text-white/50">or</p>
                                        register
                                    </button>
                                : 
                                    <div className="flex flex-col gap-6 py-6 px-12">
                                        <button 
                                            onClick={() => {
                                                window.location.href = '/profile'
                                            }}
                                            className="">
                                            Profile
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                            }}
                                            className="">
                                            Settings
                                        </button>
                                        <button 
                                            onClick={() => {
                                                api.users.logout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="text-center bg-red-400/5 text-red-400">
                                            Log out
                                        </button>
                                    </div>
                                }
                            </div>
                        )}
                    </div>
                </div>
            )
        }

    const ResultList = () => {
        return (
            <div className="absolute top-12 mt-2 bg-[#181819] rounded-lg shadow-lg z-50">
                {Array.from(artistResults).slice(0,2).map((result, index) => (
                    <a key={index} href={`/${result.mbid}`} className="block px-8 py-4 hover:bg-[#282829]">
                        <p className="text-white text-sm">{result.name} {result.artist}</p>
                    </a> 
                ))}
                {Array.from(albumResults).slice(0, 5).map((result, index) => (
                    <a key={index} href={`/${result.mbid}`} className="block px-8 py-3 hover:bg-[#282829]">
                        <span className="flex gap-4 shrink-0 items-center">
                            <img src={result.image[0]['#text']} width={24} className='rounded-sm' />
                            <p className="text-white text-sm">{result.name}</p>
                            <p className="text-white/50 text-xs">by {result.artist}</p>
                        </span>
                    </a>
                ))}
            </div>
        );

    }

    return (
        <nav className="w-full z-50 text-white bg-[#0c0c0e] h-14 flex items-center justify-center text-[12px]">
            <div className="flex space-x-8 w-full items-center px-12 ">
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