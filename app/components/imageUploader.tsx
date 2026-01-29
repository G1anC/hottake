'use client';

import Api from "@/app/api/api"
import React, { useRef, useState, DragEvent, ChangeEvent, useEffect } from "react";
import Nav from "@/app/components/nav";
import { useSession } from "@/app/lib/auth-client";
import { useRouter } from "next/router";

export default function Profile() {
    const api = new Api('/api');
    const [file, setFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter();

    const {data: session} = useSession();
    

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
        if (!file || !session || !session.user)
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
        api.users.uploadImage(session.user.id, fileString)
    };
    
    console.log("before: " + session?.user?.image)

    return (
        <div className="h-screen w-screen text-white">
            <Nav />
            <div className="w-full h-full flex items-center justify-center gap-4 flex-col">
                {session ?
                <>
                    <p>
                        Profile Page<br />
                        Name: {session?.user?.name}<br />
                        Email: {session?.user?.email}<br />
                        Pseudo: {session?.user?.username}<br />
                    </p>
                    <img src={session?.user?.image || ''} />
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
                    router.reload();
                }}>
                    Logout
                </button>
            </div>
        </div>
    )
}
