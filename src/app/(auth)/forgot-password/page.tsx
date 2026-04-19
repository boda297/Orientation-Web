'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Loader2 } from 'lucide-react';
import AuthLogo from '@/components/AuthLogo';
import { authApi } from '@/lib/auth';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            await authApi.forgotPassword({ email: email.toLowerCase() });
            router.push(`/verify?email=${encodeURIComponent(email.toLowerCase())}&purpose=reset`);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <AuthLogo />

            <h1 className="text-3xl font-bold mt-4 mb-3">Forgot password</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Enter the email you used to log in when you first used the app!
            </p>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <form onSubmit={handleSendCode} className="flex flex-col gap-4">
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

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-white rounded-[1.75rem] font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send code'}
                </button>

                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-[#ff0000] text-sm font-semibold hover:underline"
                    >
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
}
