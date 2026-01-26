'use client';

import Api from "../../api/api"
import React, { useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import Nav from "@/app/components/nav";

export default function Profile() {
    const api = new Api('/api');
    const [user, setUser] = React.useState<any>(null);
    const [file, setFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);


    React.useEffect(() => {
        (async () => {
            const res = await api.get('/users/me')
            setUser(res.body)
        })()
    }, [])

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
        const fileString = JSON.stringify(file)
        console.log(fileString)
        api.users.uploadImage(user.id, fileString)
    };
    
    console.log("before: " + (user && user.image))

    return (
        <div className="h-screen w-screen text-white">
            <Nav />
            <div className="w-full h-full flex items-center justify-center gap-4 flex-col">
                {user ?
                <>
                    <p>
                        Profile Page<br />
                        Name: {user.name}<br />
                        Email: {user.email}<br />
                        Pseudo: {user.pseudo}<br />
                    </p>
                    <img src={user.image && URL.createObjectURL(user.image)} />
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