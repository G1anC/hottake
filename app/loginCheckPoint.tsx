'use client'

import React from 'react'
import Api from './api/api';

export default function LoginCheckPoint() {
    const api = new Api('/api');
    React.useEffect(() => {
		(async () => {
			const res = await api.get('/users/me')
			if (res.status !== 200) {
				window.location.href = '/login' 
				return
			}
		})()
	}, [])

    return null
}