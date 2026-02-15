"use client";

import React from 'react';
import { LastfmAlbumInfo, LastfmAlbumSummary } from '@/app/lib/types/lastfm';
import Api from '@/app/api/api';
import { useSession } from '@/app/lib/auth-client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useModal } from '../contexts/ModalContext';
import { Review } from '@prisma/client';
import { PlaylistButton } from '@/app/components/playlistButtons';

interface RightSideProps {
  album: LastfmAlbumInfo['album'];
  albumsAlike: LastfmAlbumSummary[];
  similarAlbums: LastfmAlbumSummary[];
  mbid: string;
  userReview: Review | null;
}

export default function RightSide({ album, albumsAlike, similarAlbums, mbid, userReview }: RightSideProps) {
	const api = React.useMemo(() => new Api('/api'), []);
	const router = useRouter();
	const [isReviewd, setIsReviewd] = React.useState<boolean>(false)
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
		if (userReview)
			setIsReviewd(true)
	}, [user, mbid]);

	

	const getAlbumImage = (albumData: LastfmAlbumSummary, size: 'small' | 'medium' | 'large' | 'extralarge' = 'extralarge') => {
		return albumData?.image?.find((img) => img.size === size)?.['#text'] || '';
	};

	return (
		<div className="flex flex-col justify-between items-end gap-8 shrink-0 min-h-0 h-full">
			<div className="flex-1 min-h-0 flex flex-col justify-start">
				<div className="flex gap-2 items-center w-full justify-end">
					<div className="flex">
						<div className="rounded-lg bg-[#181819] flex px-3 justify-center">
							<PlaylistButton type="listened" mbid={mbid} value={isListened} setter={setIsListened} />
							<PlaylistButton type="nextList" mbid={mbid} value={isNextlist} setter={setIsNextlist} />
							<PlaylistButton type="hotTakes" mbid={mbid} value={isHottake} setter={setIsHottake} />
						</div>
					</div>
					<button
						onClick={() => setOpenModal(true)}
						className={`group form-field px-9 rounded-lg cursor-pointer ${!isReviewd ? "text-white/50 hover:border-white/30 border-white/10" : "hover:border-white/60 border-white/30" }  border duration-100 py-6 transition-all flex flex-col items-center justify-center`}
					>
						<Image 
							src="/Review.svg" 
							width={36} 
							height={36} 
							alt="review icon"
							className={`group-hover:scale-110 ${!isReviewd && "opacity-50"} duration-150 transition-transform`}
						/>
						<div className="mt-2">Review</div>
					</button>	
				</div>
				{(!album.tags || album.tags.tag.length <= 1) && !album.wiki && "Looks like you found a pretty unknown album, there is not even a bio ;)"}
				{album.tags && album.tags.tag.length > 0 && <div className="flex w-full mt-12 justify-end gap-6">{album.tags.tag.map((tag: any) => <span key={tag.name}>{tag.name}</span>)}</div>}
				{album.wiki && <div className="mt-8 w-154 text-white/50 wrap-break-word max-h-120 text-sm line-clamp-8 text-end">{album.wiki.content.split('<')[0].trim()}</div>}
				{album.wiki && <div className="w-full flex justify-end"><button onClick={() => {}} className="bg-[#181819] outline outline-white/0 hover:outline-white/10 hover:text-white text-white/50 duration-150 transition-all mr-px px-6 py-3 rounded-lg mt-8">Read more</button></div>}
			</div>


			<div className="shrink-0">
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