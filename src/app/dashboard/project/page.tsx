'use client';

import { useState, useEffect } from 'react';
import { PlusSquare, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function ProjectsList() {
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                // Adjust endpoint if needed
                const res = await fetch(getApiUrl('/projects'));
                if (res.ok) {
                    const data = await res.json();
                    setProjects(Array.isArray(data) ? data : (data.projects || data.data || []));
                } else {
                    console.error('Failed to fetch projects');
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this project?")) {
            try {
                const token = getAccessToken();
                // Adjust /projects/${id} if needed
                const res = await fetch(getApiUrl(`/projects/${id}`), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    setProjects(projects.filter(p => p._id !== id && p.id !== id));
                } else {
                    alert('Failed to delete project');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Error deleting project');
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <PlusSquare className="w-8 h-8 text-red-500" />
                    Registered Projects
                </h1>
                <Link href="/dashboard/project/create" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20">
                    <Plus className="w-5 h-5" />
                    Create Project
                </Link>
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto min-h-[200px]">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-zinc-900 border-b border-zinc-800 text-gray-300 uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Developer</th>
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
                                            <span>Loading projects...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                        No projects found.
                                    </td>
                                </tr>
                            ) : (
                                projects.map((p: any, idx) => (
                                    <tr key={p._id || p.id || idx} className="hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium">{p.title}</td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {typeof p.developer === 'object' ? p.developer?.name : (p.developerName || p.developer || '-')}
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{p.location || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-500 text-gray-400 rounded-lg transition-colors" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p._id || p.id)}
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
