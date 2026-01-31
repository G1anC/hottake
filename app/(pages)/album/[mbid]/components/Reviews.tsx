"use client";

import React from 'react';
import { Review, User } from '@prisma/client';
import ReviewItem from './ReviewItem';

export default function Reviews({ reviews }: { reviews: (Review & { author: User })[] }) {

  console.log(reviews);

  return (
    <div className="w-full mb-24 mt-20 h-full">
      <div className="space-y-6 h-full overflow-y-auto">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <ReviewItem key={review.id ?? index} review={review} index={index} />
          ))
        ) : (
          <p>No reviews available.</p>
        )}
      </div>
    </div>
  );
}
