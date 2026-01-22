'use client'

import React from 'react';
import Api from './api/api';

export default function App() {
	const api = new Api('/api');
	const [user, setUser] = React.useState<any>(null);

	React.useEffect(() => {
		(async () => {
			const res = await api.get('/users/me')
			if (res.status !== 200) {
				window.location.href = '/login' 
				return
			}
			setUser(res.body)
		})()
	}, [])
	
	return (
		<div className="form-container bg-stone-100 h-screen w-screen flex flex-col items-center gap-24 justify-center">
			<h1 className="text-black font-black text-4xl">HOTTAKE</h1>
			<div>{user ? <p>Welcome, {user.name}!</p> : <p>Loading...</p>}</div>
		</div>
	);
}
