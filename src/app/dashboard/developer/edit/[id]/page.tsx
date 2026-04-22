'use client';

import { useState, useEffect, use } from 'react';
import { ChevronLeft, Loader2, CheckCircle2, AlertCircle, Building2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { developersApi, type Developer, type UpdateDeveloperPayload } from '@/lib/dashboardApi';
import { getAccessToken } from '@/lib/auth';

const inputCls =
    'w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors';

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

export default function EditDeveloperPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const [authorized, setAuthorized] = useState<boolean | null>(null);
    const [developer, setDeveloper] = useState<Developer | null>(null);
    const [loadingDev, setLoadingDev] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [socialMediaLink, setSocialMediaLink] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // 1. Role check — admin or superadmin
    useEffect(() => {
        const role = getRoleFromToken();
        if (role === 'admin' || role === 'superadmin' || role === 'ADMIN') {
            setAuthorized(true);
        } else {
            setAuthorized(false);
        }
    }, []);

    // 2. Fetch developer
    useEffect(() => {
        if (authorized !== true) return;
        developersApi
            .get(id)
            .then((data) => {
                setDeveloper(data);
                setName(data.name ?? '');
                setLocation(data.location ?? '');
                setEmail(data.email ?? '');
                setPhone(data.phone ?? '');
                setSocialMediaLink(''); // not returned by API, user can re-enter
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoadingDev(false));
    }, [id, authorized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            const payload: UpdateDeveloperPayload = {
                name: name || undefined,
                location: location || undefined,
                email: email || undefined,
                phone: phone || undefined,
                socialMediaLink: socialMediaLink || undefined,
            };
            const updated = await developersApi.update(id, payload);
            setDeveloper(updated);
            setSuccess('Developer updated successfully!');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.message || 'Failed to update developer.');
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
                <p className="text-gray-400">Only admins and superadmins can edit developers.</p>
                <Link href="/dashboard/developer" className="text-red-500 hover:underline mt-2">
                    ← Back to Developers
                </Link>
            </div>
        );
    }

    if (loadingDev) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-red-500" />
            </div>
        );
    }

    if (notFound || !developer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-gray-400">Developer not found.</p>
                <Link href="/dashboard/developer" className="text-red-500 hover:underline">
                    Back to Developers
                </Link>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────

    return (
        <div className="animate-in fade-in duration-500 max-w-2xl mx-auto space-y-6">
            <Link
                href="/dashboard/developer"
                className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Developers
            </Link>

            <div>
                <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-red-500" />
                    Edit Developer
                </h1>
                <p className="text-gray-500 text-sm">
                    Editing:{' '}
                    <span className="text-gray-300 font-medium">{developer.name}</span>
                </p>
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
                    {/* Name */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Developer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputCls}
                            placeholder="e.g. Margins Developments"
                        />
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Location <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className={inputCls}
                            placeholder="e.g. New Cairo"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Email (Optional)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. contact@developer.com"
                        />
                    </div>

                    {/* Phone */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Phone (Optional)
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. +201000000000"
                        />
                    </div>

                    {/* Social Media */}
                    <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Social Media Link (Optional)
                        </label>
                        <input
                            type="url"
                            value={socialMediaLink}
                            onChange={(e) => setSocialMediaLink(e.target.value)}
                            className={inputCls}
                            placeholder="e.g. https://instagram.com/developer"
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
