'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, EyeOff, Eye, Loader2 } from 'lucide-react';
import AuthLogo from '@/components/AuthLogo';
import { authApi } from '@/lib/auth';

export default function ResetPasswordPage() {
    const router = useRouter();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState<string | null>(null);

    useEffect(() => {
        const token = sessionStorage.getItem('resetToken');
        if (!token) {
            router.replace('/login');
        } else {
            setResetToken(token);
        }
    }, [router]);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return;

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (!resetToken) throw new Error('Action not authorized.');

            await authApi.resetPassword({ newPassword, confirmPassword }, resetToken);
            sessionStorage.removeItem('resetToken');

            // Successfully reset, go to login
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <AuthLogo />

            <h1 className="text-3xl font-bold mt-4 mb-3">Reset password</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Enter your new password below to secure your account.
            </p>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <form onSubmit={handleReset} className="flex flex-col gap-4">
                {/* New Password */}
                <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-2xl h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <Lock className="absolute left-4 w-5 h-5 text-gray-500" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full h-full bg-transparent pl-12 pr-12 text-white outline-none placeholder:text-gray-600"
                        placeholder="New Password"
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

                {/* Confirm Password */}
                <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-2xl h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <Lock className="absolute left-4 w-5 h-5 text-gray-500" />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full h-full bg-transparent pl-12 pr-12 text-white outline-none placeholder:text-gray-600"
                        placeholder="Confirm Password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 p-1 group"
                    >
                        {showConfirmPassword ? (
                            <Eye className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        ) : (
                            <EyeOff className="w-5 h-5 text-gray-400 group-hover:text-white" />
                        )}
                    </button>
                </div>

                <button
                    type="submit"
                    disabled={loading || !resetToken}
                    className="mt-6 w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-white rounded-[1.75rem] font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                </button>

                <div className="flex justify-center mt-6">
                    <button
                        type="button"
                        onClick={() => router.push('/login')}
                        className="text-[#ff0000] text-sm font-semibold hover:underline"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
