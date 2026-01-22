'use client'

import React from 'react';
import Api from './api/api';

export default function App() {
	const api = new Api('/api');

	React.useEffect(() => {
		(async () => {
			const res = await api.get('/users/me')
			if (res.status !== 200) window.location.href = '/login' 
		})()
	}, [])
	
	return (
		<div className="form-container bg-[#2b2b2b] h-screen w-screen flex flex-col items-center gap-24 justify-center">
			<h1 className="text-white text-4xl">HOTTAKE</h1>
		</div>
	);
}
