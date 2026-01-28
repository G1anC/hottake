'use client'

import React from 'react';
import Api from '../../api/api';

export default function Discover() {
    const api = new Api('/api');
    
    return (
        <div className="form-container h-screen w-screen flex flex-col items-center gap-24 justify-center">
            <h1 className="text-black font-black text-4xl">DISCOVER PAGE</h1>
        </div>
    )
}
