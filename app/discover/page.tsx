'use client'

import React from 'react';
import Api from '../api/api';
import LoginCheckPoint from '../loginCheckPoint';

export default function Discover() {
    const api = new Api('/api');
    const [user, setUser] = React.useState<any>(null);

    LoginCheckPoint();

    React.useEffect(() => {
        (async () => {
            const res = await api.get('/users/me')
            setUser(res.body)
        })()
    }, [])
    return (
        <div className="form-container bg-stone-100 h-screen w-screen flex flex-col items-center gap-24 justify-center">
            <h1 className="text-black font-black text-4xl">DISCOVER PAGE</h1>
        </div>
    )
}