'use client';

import Api from "../../api/api"
import React, { useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import Nav from "@/app/components/nav";
import { stringToFile, fileToString } from "@/app/lib/images.service";
import { Review, User } from "@/app/lib/types";

export default function Profile() {
    const api = new Api('/api');
    const [user, setUser] = React.useState<any>(null);
    const [image, setImage] = React.useState<any>(null);
    const [reviews, setReviews] = React.useState<any>(null);

    const [imagesFromAlbums, setImagesFromAlbums] = React.useState<any[]>([]);

    React.useEffect(() => {
        (async () => {
            const res = await api.get('/users/me') as any;
            setUser(res.body);

            if (res.body?.reviews) {
                setReviews(res.body.reviews);
                const albumImages = res.body.reviews.map(async (review: Review) => {
                    const album: any = (await api.lastfm.getAlbumInfoByMbid(review.mbid)).body
                    if (!album.image)
                        return
                    const image = await album.image[album.image.length - 1]['#text']
                    setImagesFromAlbums([...imagesFromAlbums, image])
                })
            }
            
            if (res.body?.image) {
                const responseImage = await stringToFile(res.body.image as string);
                setImage(responseImage);
            }
        })();
    }, []);


    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file || null);
    };
    
    const handleFile = async (file: File | null) => {
        if (!file)
            return;

        if (!file.type.startsWith("image/")) {
            alert("Merci de choisir une image");
            return;
        }

        if (file.size > 1024 * 1024 * 1024) {
            alert("Le fichier est trop volumineux (2 Go max).");
            return;
        }
        const fileString = await fileToString(file)
        api.users.uploadImage(user.id, fileString)
    };
    
    return (
        <div className="h-screen w-screen text-white">
            <Nav />
            <div className="w-full h-full flex items-center justify-cente relative gap-4 flex-col">
                {user ?
                    <>
                        <div className="h-120 w-full backdrop-blur-[150px] overflow-hidden" />
                        <div className="w-full h-[400px] absolute -translate-x-1/2 left-1/2 mt-8 flex justify-center gap-5">
                            {imagesFromAlbums.slice(0, 5).map((image, index) => {
                                console.log(image)
                                return (
                                    <img className=" aspect-square z-50 rounded-lg" src={image} key={index} />
                                )
                            })}
                        </div>
                        <div
                            style={{
                                backgroundImage: `url(${image ? URL.createObjectURL(image) : "https://picsum.photos/200"})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(100px)',
                                zIndex: -1,
                            }} className="absolute top-0 left-0 h-120 w-full"
                        />
                        <p>
                            Profile Page<br />
                            Name: {user.name}<br />
                            Email: {user.email}<br />
                            Pseudo: {user.pseudo}<br />
                        </p>
                        <img
                            width={64}
                            className="border border-white/10 aspect-square rounded-full"
                            src={image && URL.createObjectURL(image)}
                        />
                    </>
                :
                    <p>
                        Loading...
                    </p>
                }

                <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="bg-[#181819] px-8 py-4 w-fit" id="input_field">
                    <input 
                        type="file"
                        className=""
                        id="imgfile"
                        accept="image/png, image/jpg"
                        onChange ={handleFileSelect}

                    />
                </div>

                <button className={"bg-red-200"} onClick={async () => {
                    const response = await api.users.logout()
                    //refresh the page
                    window.location.href = '/profile';

                }}>
                    Logout
                </button>
            </div>
        </div>
    )
}