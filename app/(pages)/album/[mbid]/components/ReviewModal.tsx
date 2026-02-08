'use client'
import React from "react";
import { PlaylistType } from "@/app/api/api";
import { useRouter } from "next/navigation";
import { useModal } from "../contexts/ModalContext";
import { useSession } from "@/app/lib/auth-client";
import Api from "@/app/api/api";
import { NoteSetter, starColors } from "@/app/components/note";

interface ReviewModalProps {
	mbid: string;
	content: string;
	note: number;
}

export function ReviewModal({ mbid, content: previousContent, note: previousNote }: ReviewModalProps) {
	const api = React.useMemo(() => new Api('/api'), []);
	const [note, setNote] = React.useState<number>(previousNote);
	const [content, setContent] = React.useState(previousContent);
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
						<p className="font-bold">{(previousContent || previousNote) ? "Change your review" : "Write your review"}</p>
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