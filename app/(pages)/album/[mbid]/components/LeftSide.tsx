import { LastfmAlbumInfo, LastfmTrackInfo } from '@/app/lib/types/lastfm';
import Image from 'next/image';
import Api from '@/app/api/api';


export default async function LeftSide({ album }: { album: LastfmAlbumInfo["album"] }) {
	const api = new Api('http://localhost:3000/api');

	if (!album || !album.tracks || album.tracks?.track.length <= 0)
		return null

	let tracks: LastfmTrackInfo['track'][] = []
	let highest = 0

	try {
		const trackPromises = album.tracks.track.map(async (t) => {
			return api.lastfm.getTrackInfo(album.artist, t.name)
		})

		const trackResponses = await Promise.all(trackPromises)

		tracks = trackResponses
			.filter(response => response.status === 200 && response.body)
			.map(response => response.body)
			.filter(Boolean)

		// ✅ Fix: calculer highest après avoir récupéré les tracks
		highest = Math.max(
			...tracks
				.map(track => Number(track.listeners) || 0)
				.filter(num => !isNaN(num))
		)

	} catch (e) {
		console.error('Error fetching album info by MBID:', e);
	}


	return (
		<div className="gap-12 h-full flex pl-20 py-12 justify-center flex-col">
			<div className="relative w-full aspect-square min-w-200 mx-auto max-w-[95vw] lg:max-w-400">
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
					<div className="flex space-x-4"><p>Listeners</p><p className="text-end w-24">Length</p></div>
				</div>
				<div className='w-full h-px bg-white/5 mt-6 shrink-0'></div>
				<div className="px-8 flex-1 overflow-y-auto flex flex-col gap-10 mt-12 min-h-0">
					{tracks && tracks.map((track, index: number) => {
						const listeners = Number(track.listeners) || 0
						const widthPercent = highest > 0 ? (listeners / highest * 100) : 0

						return (
							<div key={index} className="flex justify-between items-center shrink-0">
								<div className="flex space-x-4">
									<p>{index + 1}</p>
									<p>{track.name}</p>
								</div>
								<div className="flex space-x-4 items-center">
									<div className="relative rounded-sm text-end w-40 py-3 px-4 overflow-hidden">
										<div
											style={{ width: `${widthPercent}%` }}
											className="absolute top-0 right-0 h-full bg-white/10"
										/>
										<span className="relative z-10">
											{track.listeners ? Number(track.listeners).toLocaleString('fr-FR') : '0'}
										</span>
									</div>
									<p className="text-end w-20">
										{track.duration ?
											`${Math.floor(track.duration / 60000)}:${String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}`
											: '0:00'
										}
									</p>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	);
}