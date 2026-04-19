'use client';

import { useState, useEffect } from 'react';
import { PlusSquare, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { projectsApi, type Project } from '@/lib/dashboardApi';

export default function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        projectsApi.list()
            .then(setProjects)
            .catch((err) => setError(err.message || 'Failed to load projects'))
            .finally(() => setIsLoading(false));
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        try {
            await projectsApi.delete(id);
            setProjects((prev) => prev.filter((p) => p._id !== id));
        } catch (err: any) {
            alert(err.message || 'Failed to delete project');
        }
    };

    const getDeveloperName = (dev: Project['developer']) => {
        if (!dev) return '-';
        if (typeof dev === 'object') return dev.name;
        return dev;
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <PlusSquare className="w-8 h-8 text-red-500" />
                    Registered Projects
                </h1>
                <Link
                    href="/dashboard/project/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20"
                >
                    <Plus className="w-5 h-5" />
                    Create Project
                </Link>
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
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Developer</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-gray-200">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                            <span>Loading projects...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No projects found.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((p, idx) => (
                                    <tr key={p._id || idx} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{p.title}</td>
                                        <td className="px-6 py-4 text-gray-400">{getDeveloperName(p.developer)}</td>
                                        <td className="px-6 py-4 text-gray-400">{p.location || '-'}</td>
                                        <td className="px-6 py-4">
                                            {p.status ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-300 border border-zinc-500/20">
                                                    {p.status}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/dashboard/project/edit/${p._id}`}
                                                    className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(p._id)}
                                                    className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
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
