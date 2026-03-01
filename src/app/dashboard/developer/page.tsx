'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Building2, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl, getFileUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function DevelopersList() {
    const [developers, setDevelopers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDevelopers = async () => {
            try {
                // Adjust '/developers' if your endpoint is different
                const res = await fetch(getApiUrl('/developers'));
                if (res.ok) {
                    const data = await res.json();
                    setDevelopers(Array.isArray(data) ? data : (data.developers || data.data || []));
                } else {
                    console.error('Failed to fetch developers');
                }
            } catch (error) {
                console.error('Error fetching developers:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDevelopers();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this developer?")) {
            try {
                const token = getAccessToken();
                // Replace '/developers/${id}' with your actual endpoint
                const res = await fetch(getApiUrl(`/developers/${id}`), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    setDevelopers(developers.filter(d => d._id !== id && d.id !== id));
                } else {
                    alert('Failed to delete developer');
                }
            } catch (error) {
                console.error('Error deleting developer:', error);
                alert('Error deleting developer');
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-red-500" />
                    Registered Developers
                </h1>
                <Link href="/dashboard/developer/create" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20">
                    <Plus className="w-5 h-5" />
                    Create Developer
                </Link>
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto min-h-[200px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Logo</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Tagline</th>
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
                            ) : developers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No developers found.
                                    </td>
                                </tr>
                            ) : (
                                developers.map((d: any, idx) => (
                                    <tr key={d._id || d.id || idx} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-700">
                                                {d.logo || d.thumbnail || d.imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={getFileUrl(d.logo || d.thumbnail || d.imageUrl)} alt={d.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-gray-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{d.name}</td>
                                        <td className="px-6 py-4 text-gray-400">{d.tagline || d.description || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-lg transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(d._id || d.id)}
                                                    className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
