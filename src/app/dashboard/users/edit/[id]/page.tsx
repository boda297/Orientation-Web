'use client';

import { useState, useEffect, use } from 'react';
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle, UserCog, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usersApi, type User, type UpdateUserPayload } from '@/lib/dashboardApi';
import { getAccessToken } from '@/lib/auth';

const inputCls =
    'w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors';
const selectCls =
    'w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors appearance-none';

/** Decodes the JWT and returns the role string, or null on failure */
function getRoleFromToken(): string | null {
    try {
        const token = getAccessToken();
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role ?? null;
    } catch {
        return null;
    }
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [role, setRole] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // 1. Check role — superadmin only
    useEffect(() => {
        const userRole = getRoleFromToken();
        if (userRole === 'superadmin') {
            setAuthorized(true);
        } else {
            setAuthorized(false);
        }
    }, []);

    // 2. Fetch user data
    useEffect(() => {
        if (authorized !== true) return;
        usersApi
            .get(id)
            .then((data) => {
                setUser(data);
                setUsername(data.username ?? '');
                setEmail(data.email ?? '');
                setPhoneNumber(data.phoneNumber ?? '');
                setRole(data.role ?? '');
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoadingUser(false));
    }, [id, authorized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');

        try {
            const payload: UpdateUserPayload = {
                username: username || undefined,
                email: email || undefined,
                phoneNumber: phoneNumber || undefined,
                role: role || undefined,
            };
            if (password) payload.password = password;

            const updated = await usersApi.update(id, payload);
            setUser(updated);
            setSuccess('User updated successfully!');
            setPassword('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message || 'Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    // ── Guards ───────────────────────────────────────────────────

    if (authorized === null) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (authorized === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-white">Access Denied</h2>
                <p className="text-gray-400">Only superadmins can edit users.</p>
                <Link href="/dashboard/users" className="text-red-500 hover:underline mt-2">
                    ← Back to Users
                </Link>
            </div>
        );
    }

    if (loadingUser) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (notFound || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-400">User not found.</p>
                <Link href="/dashboard/users" className="text-red-500 hover:underline">
                    Back to Users
                </Link>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────

    return (
        <div className="animate-in fade-in duration-500 max-w-2xl mx-auto space-y-6">
            <Link
                href="/dashboard/users"
                className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Users
            </Link>

            <div>
                <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
                    <UserCog className="w-8 h-8 text-red-500" />
                    Edit User
                </h1>
                <p className="text-gray-500 text-sm">
                    Editing:{' '}
                    <span className="text-gray-300 font-medium">{user.username}</span>
                </p>
            </div>

            {/* Superadmin badge */}
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5" />
                Superadmin Only
            </div>

            {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    {success}
                </div>
            )}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Username */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={inputCls}
                            placeholder="Username"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputCls}
                            placeholder="user@example.com"
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Phone Number</label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={inputCls}
                            placeholder="+201000000000"
                        />
                    </div>

                    {/* Role */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className={selectCls}
                        >
                            <option value="">Select role</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                        </select>
                    </div>
                </div>

                {/* Password section */}
                <div className="border-t border-zinc-800 pt-6">
                    <h2 className="text-base font-bold text-white mb-4">Change Password</h2>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            New Password{' '}
                            <span className="text-gray-500 font-normal">(leave blank to keep current)</span>
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputCls}
                            placeholder="••••••••"
                            autoComplete="new-password"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full md:w-auto self-end px-8 h-12 bg-[#ff0000] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}
