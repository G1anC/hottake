"use client";

import React from 'react';
import { NoteSetter, starColors } from '@/app/components/note';
import { LastfmAlbumInfo, LastfmAlbumSummary } from '@/app/lib/types/lastfm';
import Api, { PlaylistType } from '@/app/api/api';
import { useSession } from '@/app/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useModal } from '../contexts/ModalContext';

interface RightSideProps {
  album: LastfmAlbumInfo['album'];
  albumsAlike: LastfmAlbumSummary[];
  similarAlbums: LastfmAlbumSummary[];
  mbid: string;
}

export function NewWriteReviewModal({ mbid }: {mbid: string}) {
	const api = React.useMemo(() => new Api('/api'), []);
	const [note, setNote] = React.useState<number>(0);
	const [content, setContent] = React.useState("");
	const [valid, setValid] = React.useState(false);
	const router = useRouter();
	const [isListened, setIsListened] = React.useState<boolean>(false)
	const [isHottake, setIsHottake] = React.useState<boolean>(false)
	const [isNextlist, setIsNextlist] = React.useState<boolean>(false)
	const { openModal, setOpenModal } = useModal();

	const { data: session } = useSession(); 
	const user = session?.user

	// Vérifie si le formulaire est valide
	const isFormValid = content.trim().length > 0 && note >= 0;

	const handlePlaylist = async (type: PlaylistType) => {
		try {
			switch (type) {
				case "hotTakes":
					const hottakeResponse = isHottake 
						? await api.users.deleteFromPlaylist(mbid, type) 
						: await api.users.addToPlaylist(mbid, type);
					if (hottakeResponse.status === 200 || hottakeResponse.status === 201) {
						setIsHottake(!isHottake);
					}
					break;
				case "listened":
					const listenedResponse = isListened 
						? await api.users.deleteFromPlaylist(mbid, type) 
						: await api.users.addToPlaylist(mbid, type);
					if (listenedResponse.status === 200 || listenedResponse.status === 201) {
						setIsListened(!isListened);
					}
					break;
				case "nextList":
					const nextlistResponse = isNextlist 
						? await api.users.deleteFromPlaylist(mbid, type) 
						: await api.users.addToPlaylist(mbid, type);
					if (nextlistResponse.status === 200 || nextlistResponse.status === 201) {
						setIsNextlist(!isNextlist);
					}
					break;
			}
		} catch (e) {
			console.error(e);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Vérifie que le formulaire est valide
		if (!isFormValid) {
			return;
		}
		
		if (!session?.user) {
			router.push('/login?redirect=' + window.location.pathname);
			return;
		}
		
		const user = session.user;
		
		try {
			const response = await api.reviews.createReview({
				note: note + 1,
				content,
				mbid,
				authorId: user.id,
			});
			setValid(response.status === 200);
			handlePlaylist("listened");
			setOpenModal(false);
		} catch (e) {
			if (e === 500) console.error("The review couldn't be created");
		}
	};

	if (!openModal) return null;

	return (
		<div className="absolute flex items-center z-50 justify-center w-full h-full gap-4 bg-[#0c0c0e]/80 backdrop-blur-md ">
			<div className="max-w-160 w-full py-12 px-12 relative rounded-xl border border-white/5 bg-[#0c0c0e]">
				<button onClick={() => setOpenModal(false)} className="absolute top-2 right-2">
					<img src="/cross.svg" className="hover:opacity-100 hover:scale-110 opacity-50 duration-100 transition-all" width='48' height='24' />
				</button>
				
				<div className="w-full flex rounded-t-lg items-center justify-between">
					<span className="flex gap-2 items-center bg-[#181819] rounded-t-lg px-9 py-3 shrink-0">
						<img src="/Review.svg" width="24" height='24' alt="review icon" />
						<p className="font-bold">Write your review</p>
					</span>
					<div className="w-full justify-center flex">
						<NoteSetter note={note} setNote={setNote} />
					</div>
				</div>
				<textarea
					name="content"
					placeholder="Write a review..."
					value={content}
					onChange={(e) => setContent(e.target.value)}
					className="grow min-h-120 h-full resize-none p-6 px-8 w-full rounded-b-lg rounded-r-lg text-align align-top outline-none bg-[#181819] overflow-y-auto"
					required
				/>
				<button
					onClick={handleSubmit}
					disabled={!isFormValid}
					className={`form-field px-4 py-3 rounded-md w-full mt-2 duration-100 transition-all ${
						isFormValid 
							? 'hover:opacity-80 cursor-pointer' 
							: 'cursor-not-allowed opacity-50'
					} ${valid ? 'bg-green-600' : ''}`}
					style={{
						backgroundColor: `${starColors[note]}16`, // 20 in hex = ~12% opacity
						borderColor: `${starColors[note]}40`, // 26 in hex = ~15% opacity
						borderWidth: '1px',
						borderStyle: 'solid'
					}}
					type="submit"
				>
					Submit
				</button>
			</div>
		</div>
	)
}
export default function RightSide({ album, albumsAlike, similarAlbums, mbid }: RightSideProps) {
	const api = React.useMemo(() => new Api('/api'), []);
	const router = useRouter();
	const [isListened, setIsListened] = React.useState<boolean>(false)
	const [isHottake, setIsHottake] = React.useState<boolean>(false)
	const [isNextlist, setIsNextlist] = React.useState<boolean>(false)
	const { setOpenModal } = useModal();

	const { data: session } = useSession(); 
	const user = session?.user

	React.useEffect(() => {
		if (user?.listened?.includes(mbid)) {
			setIsListened(true);
		}
		if (user?.hotTakes?.includes(mbid)) {
			setIsHottake(true);
		}
		if (user?.nextList?.includes(mbid)) {
			setIsNextlist(true);
		}
	}, [user, mbid]);

	const handlePlaylist = async (type: PlaylistType) => {
		try {
			switch (type) {
				case "hotTakes":
					const hottakeResponse = isHottake 
						? await api.users.deleteFromPlaylist(mbid, type) 
						: await api.users.addToPlaylist(mbid, type);
					if (hottakeResponse.status === 200 || hottakeResponse.status === 201) {
						setIsHottake(!isHottake);
					}
					break;
				case "listened":
					const listenedResponse = isListened 
						? await api.users.deleteFromPlaylist(mbid, type) 
						: await api.users.addToPlaylist(mbid, type);
					if (listenedResponse.status === 200 || listenedResponse.status === 201) {
						setIsListened(!isListened);
					}
					break;
				case "nextList":
					const nextlistResponse = isNextlist 
						? await api.users.deleteFromPlaylist(mbid, type) 
						: await api.users.addToPlaylist(mbid, type);
					if (nextlistResponse.status === 200 || nextlistResponse.status === 201) {
						setIsNextlist(!isNextlist);
					}
					break;
			}
		} catch (e) {
			console.error(e);
		}
	};

	const getAlbumImage = (albumData: LastfmAlbumSummary, size: 'small' | 'medium' | 'large' | 'extralarge' = 'extralarge') => {
		return albumData?.image?.find((img) => img.size === size)?.['#text'] || '';
	};

	const PlaylistButton = ({type}: {type: PlaylistType}) => {
		let checker: boolean;
		let label: string;
	
		switch (type) {
			case "listened":
				checker = isListened;
				label = "Listened";
				break;
			case "hotTakes":
				checker = isHottake;
				label = "Hottake";
				break;
			case "nextList":
				checker = isNextlist;
				label = "Nextlist";
				break;
			default:
				checker = false;
				label = "";
		}
	
		return (
			<button 
				onClick={() => { handlePlaylist(type); }} 
				className="text-center px-6 py-6 flex flex-col items-center group cursor-pointer"
			>
				<Image 
					src={"/" + label + ".svg"} 
					width={36} 
					height={36} 
					className={`duration-300 group-hover:scale-105 transition-all ${
						checker 
							? 'opacity-100 saturate-100 active:opacity-0 active:scale-95' 
							: 'opacity-30 saturate-0 grayscale group-hover:opacity-60 group-hover:saturate-50 group-hover:grayscale-0 active:opacity-0 active:scale-95'
					}`}
					alt={`${label} icon`} 
				/>
				<span className="mt-2">{label}</span>
			</button>
		)
	}

	return (
		<div className="flex flex-col justify-between items-end gap-8 shrink-0 min-h-0 h-full">
			<div className="flex-1 min-h-0 flex flex-col justify-start">
				<div className="flex gap-2 items-center w-full justify-end">
					<div className="flex">
						<div className="rounded-lg bg-[#181819] flex px-3 justify-center">
							<PlaylistButton type="listened" />
							<PlaylistButton type="nextList" />
							<PlaylistButton type="hotTakes" />
						</div>
					</div>
					<button
						onClick={() => setOpenModal(true)}
						className="group form-field px-9 rounded-lg cursor-pointer hover:bg-[#844FB3]/10 bg-[#844FB3]/5 border-[#844FB3]/30 border duration-100 py-6 transition-all flex flex-col items-center justify-center"
					>
						<Image 
							src="/Review.svg" 
							width={36} 
							height={36} 
							alt="review icon"
							className="group-hover:scale-105 duration-150 transition-transform"
						/>
						<div className="mt-2">Review</div>
					</button>	
				</div>

				{album.tags && album.tags.tag.length > 0 && <div className="flex w-full mt-12 justify-end gap-6">{album.tags.tag.map((tag: any) => <span key={tag.name}>{tag.name}</span>)}</div>}
				{album.wiki && <div className="mt-8 w-154 text-white/50 wrap-break-word max-h-120 line-clamp-8 text-end">{album.wiki.content.split('<')[0].trim()}</div>}
				{album.wiki && <div className="w-full flex justify-end"><button onClick={() => {}} className="bg-[#181819] outline outline-white/0 hover:outline-white/10 hover:text-white text-white/50 duration-150 transition-all mr-px px-6 py-3 rounded-lg mt-8">Read more</button></div>}
			</div>


			<div className="flex-shrink-0">
				<div>
					<div className="w-full flex justify-between">
						<p className="">Other works from {album?.artist}</p>
						<button className="text-white/50 hover:text-white">More</button>
					</div>
					<div className="w-full mt-2 flex space-x-2">
						{albumsAlike && albumsAlike.slice(0, 5).map((alikeAlbum, index: number) => {
							const imageUrl = getAlbumImage(alikeAlbum);
							return (
								<a key={alikeAlbum.mbid || index} href={alikeAlbum.mbid ? `/album/${alikeAlbum.mbid}` : '#'} className="flex flex-col items-center mt-2 hover:opacity-80 transition-opacity">
								{imageUrl && (
									<Image
										src={imageUrl}
										width={80}
										height={80}
										className="rounded-sm"
										alt={`${alikeAlbum.name} cover by ${alikeAlbum.artist}`}
									/>
								)}
								</a>
							);
						})}
					</div>
				</div>

				<div className="mt-16">
					<div className="w-full flex justify-between">
						<p className="">Albums you might like</p>
						<button className="text-white/50 hover:text-white">More</button>
					</div>
					<div className="w-full mt-2 flex space-x-2">
						{similarAlbums && similarAlbums.slice(0, 5).map((similarAlbum, index) => {
							const imageUrl = getAlbumImage(similarAlbum);
							return (
								<a key={similarAlbum.mbid || index} href={similarAlbum.mbid ? `/album/${similarAlbum.mbid}` : '#'} className="mt-2 hover:opacity-80 transition-opacity">
								{imageUrl && (
									<Image
										src={imageUrl}
										width={80}
										height={80}
										className="rounded-sm"
										alt={`${similarAlbum.name} cover by ${similarAlbum.artist}`}
									/>
								)}
								</a>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}