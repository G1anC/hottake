'use client';

import Api from "../api/api"
import React from "react"
import LoginCheckPoint from "../loginCheckPoint";

export default function Profile() {
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
        <div className="h-screen w-screen bg-white flex flex-col items-center gap-24 justify-center">
            {user ?
                <p>
                    Profile Page<br />
                    Name: {user.name}<br />
                    Email: {user.email}<br />
                    Pseudo: {user.pseudo}<br />

                </p>
                :
                <p>
                    Loading...
                </p>
            }
            <button className={"bg-red-200"} onClick={async () => {
                const response = await api.users.logout()
                window.location.href = '/login'
            }}>
                Logout
            </button>
        </div>
    )
}