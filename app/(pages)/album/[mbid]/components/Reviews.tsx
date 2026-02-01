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

export default function Reviews({ reviews }: { reviews: (Review & { author: User })[] }) {
	console.log(reviews)
	return (
		<div className="w-full pt-12 flex flex-col min-h-0">
			<div className="flex-1 space-y-12 overflow-y-auto pr-2">
				{reviews.length > 0 ? reviews.map((review, index) => <ReviewItem key={review.id ?? index} review={review} index={index} />
				) : (
					<p>No reviews available.</p>
				)}
			</div>
		</div>
	);
}
