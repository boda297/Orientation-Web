'use client';

import { useState, useEffect, useMemo } from 'react';
import { Image as ImageIcon, Building2, Edit, Trash2, Plus, Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { developersApi, getFileUrl, type Developer } from '@/lib/dashboardApi';
import { formatDeveloperName, formatLocationName } from '@/lib/locationUtils';

export default function DevelopersList() {
    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        developersApi.list()
            .then(setDevelopers)
            .catch((err) => setError(err.message || 'Failed to load developers'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this developer?')) return;
        try {
            await developersApi.delete(id);
            setDevelopers((prev) => prev.filter((d) => d._id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete developer');
        }
    };

    const filteredDevelopers = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return developers;
        return developers.filter((d) => {
            const name = (d.name || '').toLowerCase();
            const loc = (d.location || '').toLowerCase();
            return name.includes(q) || loc.includes(q);
        });
    }, [developers, searchQuery]);

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-red-500" />
                    Registered Developers
                </h1>
                <Link
                    href="/dashboard/developer/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Create Developer
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center bg-[#111] border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-2.5 shadow-lg transition-colors">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mr-3" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by developer name or location..."
                    className="w-full bg-transparent text-white placeholder-zinc-500 outline-none text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="text-gray-400 hover:text-white p-1 ml-2 transition-colors"
                        title="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto min-h-[200px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Logo</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                            <span>Loading developers...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredDevelopers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? `No developers matching "${searchQuery}".` : 'No developers found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredDevelopers.map((d, idx) => {
                                    const logoSrc = d.logo;
                                    return (
                                        <tr key={d._id || idx} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
                                                    {logoSrc ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={getFileUrl(logoSrc)}
                                                            alt={d.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">{formatDeveloperName(d.name)}</td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {d.location ? formatLocationName(d.location) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/dashboard/developer/edit/${d._id}`}
                                                        className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(d._id)}
                                                        className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
