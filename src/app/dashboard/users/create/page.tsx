'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, UserPlus, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function CreateUserPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || !role) {
            alert('Please fill all fields.');
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const token = getAccessToken();
            // Replace /users with your actual POST endpoint
            const res = await fetch(getApiUrl('/users'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, password, role })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to create user');
            }

            setSuccess(true);
            setName('');
            setEmail('');
            setPassword('');
            setRole('user');
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to create user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard/users" className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Users
            </Link>

            <div>
                <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                    <UserPlus className="w-8 h-8 text-red-500" />
                    Create User
                </h1>

                {success && (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>User created successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        {/* Email Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="e.g. john@example.com"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Role Select */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Role <span className="text-red-500">*</span></label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors cursor-pointer appearance-none"
                            >
                                <option value="user">User (Normal)</option>
                                <option value="admin">Admin</option>
                                <option value="superadmin">Super Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full md:w-auto self-end px-8 h-12 bg-[#ff0000] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create User'}
                    </button>
                </form>
            </div>
        </div>
    );
}
