"use client";

import Api from '../../../../api/api';
import { stringToFile } from '@/app/lib/images.service';
import { User, Review } from '@prisma/client';
import { NoteDisplay, starColors } from '@/app/components/note';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

interface ReviewItemProps {
	review: Review & { author: User };
	index: number;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
	const [pfpUrl, setPfpUrl] = useState<string>('');
	const api = useMemo(() => new Api('/api'), []);
	const [author, setAuthor] = useState<User | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await api.users.getUserById(review.authorId) as { body: User };
				setAuthor(res.body);
			} catch (e) {
				console.error('Error fetching review author:', e);
			}
		})();
	}, [review.authorId, api]);

	useEffect(() => {
		if (!author)
			return;
		const loadImage = async () => {
			if (author.image) {
				const imageFile = await stringToFile(author.image);
				const url = URL.createObjectURL(imageFile);
				setPfpUrl(url);
				return () => URL.revokeObjectURL(url);
			}
		};
		loadImage();
	}, [author]);

	return (
		<div className="w-full rounded-lg px-3">
			<div className="w-full flex justify-between">
				<div className="flex gap-6 items-center">
					<Image
						src={pfpUrl ? pfpUrl : "https://picsum.photos/200"}
						alt="Profile"
						width={24}
						height={24}
						className="w-12 h-12 rounded-full object-cover"
					/>
					<p className="text-4xl">
						{author?.username ? author.username : 'Unknown User'}
					</p>
				</div>
				<div
					style={{ color: starColors[review.note - 1] }}
					className="flex gap-3 sm:gap-4 md:gap-6 text-base sm:text-lg md:text-xl items-center min-w-0"
				>
					<div className="flex-1 min-w-0">
						<NoteDisplay note={review.note} />
					</div>
					<div className="shrink-0">
						{review.note / 2}
					</div>
				</div>
			</div>
			<p className="text-white/50 mt-4 ml-18">{review.content}</p>
		</div>
	);
};

interface ReviewProps {
	userReview: Review & { author: User } | null;
	reviews: (Review & { author: User})[];
}

export default function Reviews({ reviews, userReview }: ReviewProps) {
	const [openModal, setOpenModal] = useState(false);
	const hasReviews = reviews.length > 0;

	const ReviewButton = () => (
		<button
			onClick={() => setOpenModal(true)}
			className="group form-field px-9 rounded-lg cursor-pointer hover:bg-[#844FB3]/10 bg-[#844FB3]/5 border-[#844FB3]/30 border duration-100 py-6 transition-all flex flex-col items-center justify-center"
		>
			<Image
				src="/Review.svg"
				width={36}
				height={36}
				alt="review icon"
				className="group-hover:scale-110 duration-150 transition-transform"
			/>
			<div className="mt-2">Review</div>
		</button>
	);

	return (
		<div className="w-full pt-12 flex flex-col justify-center overflow-x-hidden min-h-0 relative">
			{userReview && <ReviewItem key={0} review={userReview} index={0} />}

			{hasReviews ? (
				<>
					<div className="flex-1 space-y-12 overflow-y-auto overflow-x-hidden flex flex-col relative items-center reviews-scroll-container pr-8 pb-24">
						{reviews.map((review, index) => (
							<ReviewItem key={review.id ?? index} review={review} index={index} />
						))}
					</div>
					<div className="absolute bottom-0 left-0 right-0 p-4 flex items-center pt-64 bg-linear-to-t from-[#0c0c0e] via-[#0c0c0e]/95 to-transparent pointer-events-none">
						<div className="pointer-events-auto mx-auto">
							<ReviewButton />
						</div>
					</div>
				</>
			) : (
				<div className="flex-1 flex items-center justify-center">
					<div className="max-w-md w-full">
						<ReviewButton />
					</div>
				</div>
			)}
		</div>
	);
}