'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, Loader2 } from 'lucide-react';
import AuthLogo from '@/components/AuthLogo';
import { authApi, setAuthCookies } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError('');
        try {
            const res = await authApi.login({ email: email.toLowerCase(), password });

            // Assume res object has { accessToken, refreshToken } based on docs
            if (res.accessToken && res.refreshToken) {
                setAuthCookies(res.accessToken, res.refreshToken);
                router.push('/');
                router.refresh();
            } else {
                setError('Login successful but no tokens received.');
            }
        } catch (err: any) {
            setError(err.message || 'Error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <AuthLogo />

            <h1 className="text-3xl font-bold mb-3 mt-4">Log in</h1>
            <p className="text-gray-400 text-sm mb-8">
                Enter your email and password to start easily following Orientation real estate projects.
            </p>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {/* Email */}
                <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-2xl h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <Mail className="absolute left-4 w-5 h-5 text-gray-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-full bg-transparent pl-12 pr-4 text-white outline-none placeholder:text-gray-600"
                        placeholder="Email"
                    />
                </div>

                {/* Password */}
                <div>
                    <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-2xl h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                        <Lock className="absolute left-4 w-5 h-5 text-gray-500" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-full bg-transparent pl-12 pr-12 text-white outline-none placeholder:text-gray-600"
                            placeholder="Password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 p-1 group"
                        >
                            {showPassword ? (
                                <Eye className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            )}
                        </button>
                    </div>

                    <div className="flex justify-end mt-3">
                        <Link href="/forgot-password" className="text-[#ff0000] text-sm font-medium hover:underline">
                            Forgot password
                        </Link>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-white rounded-3xl font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
                </button>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-[#ff0000] font-medium hover:underline">
                        Create an account
                    </Link>
                </p>
            </form>
        </div>
    );
}
