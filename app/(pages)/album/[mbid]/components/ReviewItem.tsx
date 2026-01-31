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
    if (!author) return;
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

  if (!pfpUrl) {
    return null; // or a skeleton/placeholder
  }

  return (
    <div className="p-4 w-full rounded-lg">
      <div className="w-full flex justify-between">
        <div className="flex gap-8 items-center">
          <Image
            src={pfpUrl}
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
          className="flex gap-4 text-3xl items-center"
        >
          <NoteDisplay note={review.note} />
          {review.note}
        </div>
      </div>
      <p className="text-white/50 mt-4 ml-20">{review.content}</p>
    </div>
  );
};

export default ReviewItem;
