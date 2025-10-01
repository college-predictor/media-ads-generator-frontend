'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
// Adjust the import below to wherever you initialize Firebase Auth
import { auth } from '@/lib/firebase';

const Navbar = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const displayName = user?.displayName || user?.email || 'User';
    const initial = displayName?.charAt(0)?.toUpperCase() || 'U';

    return (
        <div className="bg-white border-b border-blue-200 px-6 py-4 flex justify-between items-center">
            <div className="flex-1">
                <h1 className="text-2xl font-semibold text-blue-900">Welcome back!</h1>
            </div>

            <div className="flex items-center space-x-4">
                {!loading && user ? (
                    <>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{initial}</span>
                            </div>
                            <span className="text-blue-900 font-medium">{displayName}</span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Logout
                        </button>
                    </>
                ) : loading ? (
                    <span className="text-blue-900">Loading...</span>
                ) : (
                    <button
                        onClick={() => router.push('/login')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Sign in
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;