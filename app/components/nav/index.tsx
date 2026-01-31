'use client';

import Link from "next/link";

import { EuropaBold } from "@/app/lib/loadFont";

import UserButton from './UserButton';
import NavSearchBar from "./SearchBar";
import Image from "next/image";
import { usePathname } from "next/navigation";

const Nav = () => {

    const pathname = usePathname();

    return (
        <nav className="w-full z-50 relative px-8 py-6 text-white bg-[#0c0c0e] h-14 flex items-center justify-between text-sm">
            <div className="flex space-x-8 items-center">
                <Link href="/" className="hover:underline">
                <Image src="/logo.svg" alt="Logo" width={80} height={20} className="h-5" />
                </Link>
                <div className="flex space-x-5 text-sm">
                    <Link href="/" className={`${EuropaBold.className} ${pathname === "/" ? "text-white" : "text-white/50"} hover:text-white text-sm`}>Home</Link>
                    <Link href="/discover" className={`${EuropaBold.className} ${pathname === "/discover" ? "text-white" : "text-white/50"} hover:text-white text-sm`}>Discover</Link>
                    <Link href="/profile" className={`${EuropaBold.className} ${pathname === "/profile" ? "text-white" : "text-white/50"} hover:text-white text-sm`}>Profile</Link>
                </div>
            </div>

            <NavSearchBar />

            <UserButton />
            
        </nav>
    );
}

export default Nav;
