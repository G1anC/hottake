"use client";

import Api from "@/app/api/api";
import { fileToString, stringToFile } from "@/app/lib/images.service";
import Image from "next/image";
import { DragEvent, ChangeEvent, useRef, useEffect, useState } from "react";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";




const UserPicture = ({ userId, b64Image } : {
    userId: string,
    b64Image: string | null,
}) => {
    const api = new Api('/api');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [image, setImage] = useState<File | null>(null);

    useEffect(() => {
        const fetchImage = async () => {
            if (b64Image) {
                const file = await stringToFile(b64Image);
                setImage(file);
            }
        };
        fetchImage();
    }, [b64Image]);

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
        if (!file || !userId)
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
        api.users.uploadImage(userId, fileString)
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className="relative w-32 h-32 group"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <button
                type="button"
                aria-label="Changer la photo de profil"
                className="w-full h-full rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={handleButtonClick}
                tabIndex={0}
            >
                <Image
                    height={140}
                    alt="User Profile Image"
                    width={140}
                    className="border border-white/10 aspect-square rounded-full bg-white/5 object-cover"
                    src={image ? URL.createObjectURL(image) : "/noUser.svg" }
                />
                <div className="overflow-hidden rounded-full absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity pointer-events-none">
                    <ArrowUpTrayIcon className="h-8 w-8 text-white mb-1" />
                </div>
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
            />
        </div>
    )
};

export default UserPicture;
