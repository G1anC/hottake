'use client'

import Api from "../../../api/api";
import { Review, TierlistItem } from "@prisma/client";
import { EuropaBold } from "@/app/lib/loadFont";
import { starColors } from "@/app/components/starColors";
import { EuropaRegular } from "@/app/lib/loadFont";
import { useEffect, useState, DragEvent, useMemo } from "react";
import { LastfmAlbumInfo } from "@/app/lib/types/lastfm";
import { NoteSetter } from "@/app/components/note";

interface SessionData {
    user: {
        id: string;
        username: string;
        image?: string;
        reviews?: Review[];
        listened?: string[];
        tierlist?: TierlistItem[];
    };
}

interface TierListI {
    album: LastfmAlbumInfo["album"];
    item: TierlistItem;
}

export default function Tierlist() {
    const [session, setSession] = useState<SessionData | null>(null);
    const [listenedAlbums, setListenedAlbums] = useState<(LastfmAlbumInfo["album"] | null)[]>([]);
    const [tierListItems, setTierListItems] = useState<TierListI[]>([])
    const [loading, setLoading] = useState(true);
    const [draggedAlbum, setDraggedAlbum] = useState<LastfmAlbumInfo["album"] | null>(null);
    const [draggedTierItem, setDraggedTierItem] = useState<TierListI | null>(null);
    const [selectedAlbum, setSelectedAlbum] = useState<LastfmAlbumInfo["album"] | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false)
    const [modalPosition, setModalPosition] = useState<{ x: number, y: number } | null>(null);


    const api = useMemo(() => new Api("/api"), []);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch('/api/auth/get-session');
                const data = await res.json();

                if (data?.user) {
                    setSession(data as SessionData);

                    if (data.user.listened && data.user.listened.length > 0) {
                        const albums = await Promise.all(
                            data.user.listened.map(async (mbid: string) => {
                                try {
                                    const album = (await api.lastfm.getAlbumInfoByMbid(mbid)).body;
                                    return { ...album, mbid: mbid };
                                } catch (error) {
                                    console.error(`Error fetching album ${mbid}:`, error);
                                    return null;
                                }
                            })
                        );
                        setListenedAlbums(albums);
                    }

                    if (data.user.tierlist && data.user.tierlist.length > 0) {
                        const tierListI = await Promise.all(
                            data.user.tierlist.map(async (item: TierlistItem) => {
                                try {
                                    const album = (await api.lastfm.getAlbumInfoByMbid(item.mbid)).body;
                                    // IMPORTANT : S'assurer que le mbid est présent
                                    return { album: { ...album, mbid: item.mbid }, item };
                                } catch (error) {
                                    console.error(`Error fetching album ${item.mbid}:`, error);
                                    return null;
                                }
                            })
                        );
                        setTierListItems(tierListI.filter((item): item is TierListI => item !== null));
                    }
                }
            } catch (error) {
                console.error('Error fetching session:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [api]);

    const handleDragStart = (album: LastfmAlbumInfo["album"] | null, tierItem: TierListI | null) => (e: DragEvent<HTMLImageElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        if (album) {
            setDraggedAlbum(album);
            setDraggedTierItem(null);
        }
        if (tierItem) {
            setDraggedTierItem(tierItem);
            setDraggedAlbum(null);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (tierNote: number) => async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (draggedAlbum) {
            // Adding from listened albums
            const mbid = draggedAlbum.mbid;
            if (!mbid) {
                setDraggedAlbum(null);
                return;
            }

            try {
                const response = await api.users.addToTierlist(mbid, tierNote);
                if (response.status === 200) {
                    // Remove from listened albums
                    setListenedAlbums(prev => prev.filter(a => a?.mbid !== mbid));

                    // Add to tierlist items
                    const newItem: TierListI = {
                        album: draggedAlbum,
                        item: response.body as TierlistItem
                    };
                    setTierListItems(prev => [...prev, newItem]);
                }
            } catch (error) {
                console.error('Error adding to tierlist:', error);
            }

            setDraggedAlbum(null);
        } else if (draggedTierItem) {
            // Moving existing tier item
            const mbid = draggedTierItem.album.mbid;
            if (!mbid) {
                setDraggedTierItem(null);
                return;
            }

            // Don't update if dropping in same tier
            if (draggedTierItem.item.note === tierNote) {
                setDraggedTierItem(null);
                return;
            }

            try {
                const response = await api.users.addToTierlist(mbid, tierNote);
                if (response.status === 200) {
                    // Update the item in the list
                    setTierListItems(prev =>
                        prev.map(item =>
                            item.item.mbid === mbid
                                ? { ...item, item: { ...item.item, note: tierNote } }
                                : item
                        )
                    );
                }
            } catch (error) {
                console.error('Error updating tierlist:', error);
            }

            setDraggedTierItem(null);
        }
    };

    const handleDropToUnranked = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();

        if (draggedTierItem) {
            const mbid = draggedTierItem.album.mbid;
            if (!mbid) {
                setDraggedTierItem(null);
                return;
            }

            try {
                const response = await api.users.removeFromTierlist(mbid);
                if (response.status === 200) {
                    // Remove from tierlist
                    setTierListItems(prev => prev.filter(item => item.item.mbid !== mbid));

                    // Add back to listened albums
                    setListenedAlbums(prev => [...prev, draggedTierItem.album]);
                }
            } catch (error) {
                console.error('Error removing from tierlist:', error);
            }

            setDraggedTierItem(null);
        }
    };

    const getAlbumsForTier = (tierNote: number) => {
        return tierListItems.filter(item => item.item.note === tierNote);
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-white text-2xl">Loading...</p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-white text-2xl">
                    You must be logged in to view this page.
                </p>
            </div>
        );
    }

    const Modal = () => {
        const [note, setNote] = useState<number>(0);

        useEffect(() => {
            if (note === 0 || !selectedAlbum?.mbid) {
                return;
            }

            const updateTierlist = async () => {
                try {
                    const response = await api.users.addToTierlist(selectedAlbum.mbid, note + 1);

                    if (response.status === 200) {
                        const existingItem = tierListItems.find(item => item.album.mbid === selectedAlbum.mbid);

                        if (existingItem) {
                            setTierListItems(prev =>
                                prev.map(item =>
                                    item.album.mbid === selectedAlbum.mbid
                                        ? { ...item, item: { ...item.item, note: note } }
                                        : item
                                )
                            );
                        } else {
                            setListenedAlbums(prev => prev.filter(a => a?.mbid !== selectedAlbum.mbid));

                            const newItem: TierListI = {
                                album: selectedAlbum,
                                item: response.body as TierlistItem
                            };
                            setTierListItems(prev => [...prev, newItem]);
                        }

                        setShowModal(false);
                        setSelectedAlbum(null);
                        setNote(0);
                    }
                } catch (error) {
                    console.error('Error updating tierlist:', error);
                }
            };

            updateTierlist();
        }, [note]);

        if (!showModal || !modalPosition || !selectedAlbum) return null;

        return (
            <>
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setShowModal(false);
                        setSelectedAlbum(null);
                    }}
                />

                <div
                    className="fixed z-50 bg-white/10 backdrop-blur-3xl rounded-sm p-4 -translate-x-1/2"
                    style={{
                        left: `${modalPosition.x + 64}px`,
                        top: `${modalPosition.y}px`,
                    }}
                >
                    <NoteSetter note={note} setNote={setNote} />
                </div>
            </>
        );
    };

    return (
        <div className={`h-screen text-white w-screen overflow-hidden ${EuropaRegular.className} tracking-wider`}>
            <div className="h-full w-full flex flex-col relative overflow-y-auto">
                <div className="bg-[#0c0c0e] flex flex-col w-full px-48 pt-8 pb-32 items-center z-10">
                    <div className="w-full flex justify-between space-x-8 py-16 shrink-0">
                        <div className="flex items-start space-x-8">
                            <h1 className={`text-3xl ${EuropaRegular.className}`}>
                                <span className={`text-bold ${EuropaBold.className}`}>
                                    {session?.user?.username}
                                </span>
                                &apos;s tierlist
                            </h1>
                        </div>
                    </div>

                    <div className="w-full flex flex-col gap-4 h-full">
                        {Array.from({ length: 10 }, (_, i) => i + 1).reverse().map((num) => (
                            <div
                                key={num}
                                className="w-full flex gap-4"
                            >
                                <div
                                    style={{
                                        color: starColors[num - 1],
                                        backgroundColor: starColors[num - 1] + "15",
                                        borderColor: starColors[num - 1] + "30",
                                    }}
                                    className="h-full w-32 min-h-32 border rounded-sm flex text-sm items-center justify-center"
                                >
                                    {(num / 2).toFixed(1)}
                                </div>
                                <div
                                    className="w-full relative flex flex-wrap gap-2 p-2 overflow-y-auto min-h-32 rounded-sm"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop(num)}
                                >
                                    {getAlbumsForTier(num).map((tierItem, idx) => {
                                        if (!tierItem || !tierItem.album) return null;
                                        const image = tierItem.album.image?.[tierItem.album.image.length - 1]?.['#text'];
                                        return image ? (
                                            <img
                                                key={tierItem.item.id}
                                                src={image}
                                                alt={tierItem.album.name}
                                                onClick={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setModalPosition({
                                                        x: rect.left + (rect.width / 2) - 70,
                                                        y: rect.bottom + window.scrollY + 8
                                                    });
                                                    setSelectedAlbum(tierItem.album);
                                                    setShowModal(true);
                                                }}
                                                draggable
                                                onDragStart={handleDragStart(null, tierItem)}
                                                className="rounded-xs aspect-square h-32 shrink-0 cursor-pointer hover:opacity-80 transition-opacity active:cursor-grabbing"
                                            />
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Modal />
                    <div className="w-full mt-12">
                        <h2 className={`text-xl mb-4 ${EuropaBold.className}`}>Unranked Albums</h2>
                        <div
                            className="w-full relative flex flex-wrap gap-2 p-2 rounded-sm min-h-32"
                            onDragOver={handleDragOver}
                            onDrop={handleDropToUnranked}
                        >
                            {listenedAlbums
                                .filter(album => album && !tierListItems.some(item => item.album.mbid === album.mbid))
                                .map((album, idx) => {
                                    if (!album) return null;
                                    const image = album.image?.[album.image.length - 1]?.['#text'];
                                    return image ? (
                                        <img
                                            key={idx}
                                            src={image}
                                            alt={album.name}
                                            onClick={(e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setModalPosition({
                                                    x: rect.left + (rect.width / 2) - 70,
                                                    y: rect.bottom + window.scrollY + 8
                                                });
                                                setSelectedAlbum(album);
                                                setShowModal(true);
                                            }}
                                            draggable
                                            onDragStart={handleDragStart(album, null)}
                                            className="rounded-xs aspect-square h-32 w-32 shrink-0 cursor-grab active:cursor-grabbing"
                                        />

                                    ) : null;
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
