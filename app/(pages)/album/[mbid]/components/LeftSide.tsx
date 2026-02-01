import React from 'react';
import { LastfmAlbumInfo } from '@/app/lib/types/lastfm';
import Image from 'next/image';

export default function LeftSide({ album }: { album: LastfmAlbumInfo["album"] }) {
  if (!album) return null;
  return (
    <div
      className="mt-30 gap-8 flex flex-col h-full"
    >
    <div className="relative w-full aspect-square min-w-140 mx-auto max-w-[95vw] lg:max-w-300">
      <Image
        className="rounded-lg border border-white/20 object-cover"
        src={album.image.find(img => img.size === 'extralarge')?.['#text'] || ''}
        alt="Album Art"
        fill
        sizes="(max-width: 1024px) 95vw, 1200px"
        priority
      />
    </div>
      <div className="flex flex-col gap-0 min-h-0 flex-1 h-full">
        <div className="px-8 flex justify-between items-center shrink-0">
          <div className="flex space-x-4"><p>@</p><p>Track</p></div>
          <div className="flex space-x-4"><p>Flame</p><p className="text-end w-24">Length</p></div>
        </div>
        <div className='w-full h-px bg-white/10 mt-6 shrink-0'></div>
        <div className="px-8 flex-1 overflow-y-auto flex flex-col gap-8 mt-8 min-h-0">
          {album.tracks && album.tracks.track.map((track, index: number) => (
            <div key={index} className="flex justify-between items-center shrink-0">
              <div className="flex space-x-4">
                <p>{index + 1}</p>
                <p>{track.name}</p>
              </div>
              <div className="flex space-x-4">
                <p>{Math.floor(Math.random() * 6)}.{Math.floor(Math.random() * 10)}</p>
                <p className="text-end w-24">
                  {`${Math.floor(track.duration / 60)}:${(track.duration % 60) < 10 ? '0' + (track.duration % 60) : (track.duration % 60)}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
