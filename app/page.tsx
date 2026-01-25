'use client'

import React from 'react';
import Api from './api/api';

export default function App() {
	const api = new Api('/api');
	const [user, setUser] = React.useState<any>(null);
	const [wa23, setWa23] = React.useState<any>(null);
	const [album , setAlbum] = React.useState<any>(null);
	const [albumAlike, setAlbumAlike] = React.useState<any[]>([]);

	React.useEffect(() => {
		(async () => {
			const res = await api.get('/users/me')
			setUser(res.body)
		})()
	}, [])

	React.useEffect(() => {
		(async () => {
			const res = await api.lastfm.getArtistInfo('23wa')
			setWa23(res.body)
		})()
	}, [])

	React.useEffect(() => {
		(async () => {
			try {
				const albumAlike = await api.lastfm.searchAlbum('23wa')
				if (albumAlike?.body && Array.isArray(albumAlike.body) && albumAlike.body.length > 0)
					setAlbumAlike(albumAlike.body)
			} catch (e) {
				console.error('Error searching albums:', e)
			}
			
			try {
				const albumInfo = await api.lastfm.getAlbumInfo('Charlie XCX', 'Brat')
				if (albumInfo?.body)
					setAlbum(albumInfo.body)
			} catch (e) {
				console.error('Error fetching album info:', e)
			}
		})()
	}, [])

	return (
		<div className="h-screen w-screen flex flex-col items-center gap-24 justify-start">
			{wa23 && 
				<div className="flex flex-col items-center gap-4 bg-white rounded-2xl">
					<p>Artist: {wa23.name}</p>
					<p>Listeners: {wa23.stats.listeners}</p>
					<p>Playcount: {wa23.stats.playcount}</p>
					{wa23.stats.image?.length > 0 && <img src={wa23.stats.image[album.image.length - 1]['#text']} alt="Artist Image" width="200" />}

					<p>Tags: {wa23.tags.tag.map((tag: any) => tag.name).join(', ')}</p>
				</div>
			}

			{album && 
				<div className="flex flex-col items-center gap-4 bg-white rounded-2xl">
					<p>Name: {album.name}</p>
					<p>Artist: {album.artist}</p>
					<p>id: {album.id}</p>
					<p>MBID: {album.mbid}</p>
					<p>URL: <a href={album.url} target="_blank" rel="noopener noreferrer">{album.url}</a></p>
					<p>Release Date: {album.wiki ? album.wiki.published : 'N/A'}</p>
					<p>Summary: {album.wiki ? album.wiki.summary : 'N/A'}</p>
					<p>Content: {album.wiki ? album.wiki.content : 'N/A'}</p>
					{/* <p>Listeners: {album.stats.listeners}</p>
					<p>Playcount: {album.stats.playcount}</p> */}
					<div className="flex gap-4">
						{album.image?.length > 0 && <img src={album.image[album.image.length - 1]['#text']} alt="Artist Image" width="200" />}
					</div>
					{/* <p>Tags: {album.tags.tag.map((tag: any) => tag.name).join(', ')}</p> */}
				</div>
			}

			{albumAlike && 
				<div className="flex flex-row items-center gap-4 bg-white rounded-2xl">
					<p>Albums similar to "23wa":</p>
					{albumAlike.slice(0, 4).map((album: any, index: number) => (
						<div key={index} className="flex flex-row items-center gap-2 border-b border-gray-300 pb-4">
							<p>Name: {album.name}</p>
							<p>Artist: {album.artist}</p>
							<img src={album.image[album.image.length - 1]['#text']} alt="Album Art" width="100" />
						</div>
					))}
				</div>
			}


		</div>
	);
}
