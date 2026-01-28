'use client'

import React from 'react';
import Api from './api/api';
import Nav from './components/nav'

export default function App() {
	const api = new Api('/api');

	return (
		<>
			<Nav />
		</>
	);
}
