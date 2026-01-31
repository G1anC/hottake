"use client";

import React from 'react';
import { NoteSetter } from '@/app/components/note';
import { LastfmAlbumInfo, LastfmAlbumSummary } from '@/app/lib/types/lastfm';
import Api, { PlaylistType } from '@/app/api/api';
import { useSession } from '@/app/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';


interface RightSideProps {
  album: LastfmAlbumInfo['album'];
  albumsAlike: LastfmAlbumSummary[];
  similarAlbums: LastfmAlbumSummary[];
  mbid: string;
}

export default function RightSide({ album, albumsAlike, similarAlbums, mbid }: RightSideProps) {
	const api = React.useMemo(() => new Api('/api'), []);
	const [note, setNote] = React.useState<number>(0);
	const [content, setContent] = React.useState("");
	const [valid, setValid] = React.useState(false);
	const router = useRouter();
	const [isListened, setIsListened] = React.useState<boolean>(false)
	const [isHottake, setIsHottake] = React.useState<boolean>(false)
	const [isNextlist, setIsNextlist] = React.useState<boolean>(false)


	const { data: session } = useSession(); 
	const user = session?.user

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!session?.user) {
			router.push('/login?redirect=' + window.location.pathname);
			return;
		}

		const user = session.user;

		try {
			const response = await api.reviews.createReview({
				note,
				content,
				mbid,
				authorId: user.id,
			});
			setValid(response.status === 200);
			handlePlaylist("listened");
		} catch (e) {
			if (e === 500) console.error("The review couldn't be created");
		}
	};

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
					let hottake = isHottake ? await api.users.deleteFromPlaylist(mbid, type) : await api.users.addToPlaylist(mbid, type)
					if (!hottake)
						break
					setIsHottake(!isHottake);
					break;
				case "listened":
					let listened = isListened ? await api.users.deleteFromPlaylist(mbid, type) : await api.users.addToPlaylist(mbid, type)
					if (!listened)
						break
					setIsListened(!isListened);
					break;
				case "nextList":
					let nextlist = isNextlist ? await api.users.deleteFromPlaylist(mbid, type) : await api.users.addToPlaylist(mbid, type)
					if (!nextlist)
						break
					setIsNextlist(!isNextlist);
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
			<button onClick={() => { handlePlaylist(type); }} className="text-center px-3 flex flex-col items-center">
				<Image 
					src={"/" + label + (!checker ? "No" : "") + ".svg"} 
					width={48} 
					height={48} 
					className={`w-11 duration-100 hover:scale-105 transition-all ${checker ? 'opacity-100' : 'opacity-25 hover:opacity-50'}`}
					alt={`${label} icon`} 
				/>
				<p className="mt-2">{label}</p>
			</button>
		)
	}

	return (
		<div className="h-full pb-12 overflow-hidden justify-between gap-8 flex flex-col shrink-0">
			<div className="flex flex-col">
				<div className="flex gap-1 items-end">
					<div className="bg-[#181819] py-2 px-3 rounded-t-md h-14 w-auto">
						<NoteSetter note={note} setNote={setNote} />
					</div>
					<div className="rounded-lg bg-[#181819] mb-1 px-6 py-6 w-full flex justify-between gap-6">
						<PlaylistButton type="listened" />
						<PlaylistButton type="nextList" />
						<PlaylistButton type="hotTakes" />
					</div>
				</div>
				<div className="flex flex-col gap-1 min-h-0">
					<textarea
						name="content"
						placeholder="Write a review..."
						value={content}
						onChange={(e) => setContent(e.target.value)}
						className="grow min-h-60 h-full resize-none px-6 py-3 w-full not-only:rounded-r-lg rounded-bl-lg text-start align-top outline-none bg-[#181819] overflow-y-auto"
					/>
					<button
						onClick={handleSubmit}
						className={`form-field px-4 py-3 rounded-md hover:bg-[#AC2C33] ${valid ? 'bg-green-600' : 'bg-[#181819]'} duration-100 transition-all`}
						type="submit"
					>
						Submit
					</button>
				</div>
			</div>

			<div className="">
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
									width={100}
									height={100}
									className="rounded-sm"
									alt={`${alikeAlbum.name} cover by ${alikeAlbum.artist}`}
								/>
							)}
							</a>
						);
					})}
				</div>
			</div>



			<div className="">
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
									width={100}
									height={100}
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
	);
}
