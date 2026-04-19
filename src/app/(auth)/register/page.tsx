'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, EyeOff, Eye, Loader2, User, Phone } from 'lucide-react';
import AuthLogo from '@/components/AuthLogo';
import { authApi } from '@/lib/auth';
// @ts-ignore
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState<string>('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password || !username) return;

        setLoading(true);
        setError('');

        try {
            await authApi.register({
                username,
                email: email.toLowerCase(),
                password,
                phoneNumber: phone ? `+${phone}` : undefined,
            });

            // Redirect to OTP verification with purpose 'register'
            router.push(`/verify?email=${encodeURIComponent(email)}&purpose=register`);
        } catch (err: any) {
            setError(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col animate-in fade-in duration-500">
            <AuthLogo />

            <h1 className="text-3xl font-bold mt-4 mb-3">Create an account</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Create your account to start viewing Orientation projects and access all details easily.
            </p>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded-xl mb-4 text-sm">{error}</div>}

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
                {/* Username */}
                <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-[1.25rem] h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <User className="absolute left-4 w-5 h-5 text-gray-500" />
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full h-full bg-transparent pl-14 pr-4 text-white outline-none placeholder:text-gray-600"
                        placeholder="Username"
                    />
                </div>

                {/* Phone number */}
                <div className="custom-phone-wrapper relative flex items-center bg-[#111] border border-zinc-800 rounded-[1.25rem] h-14 focus-within:border-zinc-600 transition-colors group">
                    <PhoneInput
                        country={'eg'}
                        value={phone}
                        onChange={(val: string) => setPhone(val)}
                        enableSearch={true}
                        disableSearchIcon={true}
                        searchPlaceholder="Search country..."
                        containerClass="w-full h-full flex"
                        inputClass="!w-full !h-full !bg-transparent !text-white !border-none !pl-[4.5rem] !font-sans !text-base focus:!outline-none placeholder:!text-gray-600"
                        buttonClass="!bg-transparent !border-none !rounded-l-[1.25rem] !pl-4 hover:!bg-transparent"
                        dropdownClass="!bg-[#111] !text-white !border-zinc-800 !rounded-xl custom-scrollbar"
                        searchClass="!bg-[#111] !text-white !border-zinc-800 !p-2"
                        placeholder="Phone number"
                    />
                </div>

                {/* Email */}
                <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-[1.25rem] h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <Mail className="absolute left-4 w-5 h-5 text-gray-500" />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-full bg-transparent pl-14 pr-4 text-white outline-none placeholder:text-gray-600"
                        placeholder="Email"
                    />
                </div>

                {/* Password */}
                <div className="relative flex items-center bg-[#111] border border-zinc-800 rounded-[1.25rem] h-14 overflow-hidden focus-within:border-zinc-600 transition-colors">
                    <Lock className="absolute left-4 w-5 h-5 text-gray-500" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-full bg-transparent pl-14 pr-12 text-white outline-none placeholder:text-gray-600"
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

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full h-14 bg-white text-black hover:bg-gray-200 rounded-full font-bold flex items-center justify-center transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create an account'}
                </button>

                <p className="text-center text-sm text-gray-400 mt-4">
                    Already have an account?{' '}
                    <Link href="/login" className="text-[#ff0000] font-medium hover:underline">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    );
}
