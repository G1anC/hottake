import { PlaylistType } from "../api/api";
import Image from "next/image";
import Api from "../api/api";
import React from "react";

interface PlaylistButtonProps {
    type: PlaylistType;
    mbid: string;
    value: boolean;
    setter: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PlaylistButton = ({ type, mbid, value, setter }: PlaylistButtonProps) => {
    const api = React.useMemo(() => new Api('/api'), []);

    let checker: boolean;
    let label: string;

    switch (type) {
        case "listened":
            checker = value;
            label = "Listened";
            break;
        case "hotTakes":
            checker = value;
            label = "Hottake";
            break;
        case "nextList":
            checker = value;
            label = "Nextlist";
            break;
        default:
            checker = false;
            label = "";
    }

    const handlePlaylist = async (type: PlaylistType) => {
        try {
            const hottakeResponse = value
                ? await api.users.deleteFromPlaylist(mbid, type)
                : await api.users.addToPlaylist(mbid, type);
            if (hottakeResponse.status === 200 || hottakeResponse.status === 201) {
                setter(!value);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <button
            onClick={() => { handlePlaylist(type); }}
            className="text-center px-6 py-6 flex flex-col items-center group cursor-pointer"
        >
            <Image
                src={"/" + label + ".svg"}
                width={36}
                height={36}
                className={`duration-200 group-hover:scale-110 transition-all ${checker
                        ? 'opacity-100 saturate-100 active:opacity-0 active:scale-95'
                        : 'opacity-20 saturate-0 grayscale group-hover:opacity-60 group-hover:saturate-50 group-hover:grayscale-0 active:opacity-0 active:scale-95'
                    }`}
                alt={`${label} icon`}
            />
            <span className={`mt-2 ${!checker && "group-hover:text-white text-white/50 active:text-white "} duration-200 transition-all`}>{label}</span>
        </button>
    )
}