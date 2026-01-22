'use client';

import Api from "../api/api"
import React from "react"

export default function Profile() {
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
        <div className="h-screen w-screen bg-white flex flex-col items-center gap-24 justify-center">
            {user ? <p>Welcome, {user.name}!</p> : <p>Loading...</p>}

            <button className={"bg-red-200"} onClick={async () => {
                const response = await api.users.logout()
            }}>
                Logout
            </button>
        </div>
    )
}