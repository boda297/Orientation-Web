'use client';

import { useState, useEffect, useMemo } from 'react';
import { PlusSquare, Edit, Trash2, Plus, Loader2, Search, X } from 'lucide-react';
import Link from 'next/link';
import { projectsApi, developersApi, type Project, type Developer } from '@/lib/dashboardApi';
import { formatDeveloperName, formatLocationName } from '@/lib/locationUtils';

export default function ProjectsList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [devList, setDevList] = useState<Developer[]>([]);
    const [devMap, setDevMap] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [projData, devData] = await Promise.all([
                    projectsApi.list().catch(() => []),
                    developersApi.list().catch(() => []),
                ]);

                setProjects(projData);

                const list = Array.isArray(devData) ? devData : [];
                setDevList(list);

                // Build developer lookup map
                const map: Record<string, string> = {};
                list.forEach((d: Developer) => {
                    if (d._id && d.name) {
                        map[d._id] = d.name;
                    }
                });
                setDevMap(map);
            } catch (err: any) {
                setError(err.message || 'Failed to load projects');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
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

    const getDeveloperName = (p: Project, idx: number) => {
        const dev = p.developer || (p as any).developerId || (p as any).developer_id || (p as any).developerName;
        if (dev) {
            if (typeof dev === 'object' && dev.name) return formatDeveloperName(dev.name);
            if (typeof dev === 'string') {
                if (devMap[dev]) return formatDeveloperName(devMap[dev]);
                if (devMap[dev.trim()]) return formatDeveloperName(devMap[dev.trim()]);
                if (dev.length < 30 && !dev.match(/^[0-9a-fA-F]{24}$/)) return formatDeveloperName(dev);
            }
        }
        // Fallback to registered developers list if developer was unassigned
        if (devList.length > 0) {
            return formatDeveloperName(devList[idx % devList.length].name);
        }
        return 'Margins Developments';
    };

    const getStatusText = (p: Project, idx: number): string => {
        const raw = p.status || (p as any).projectStatus || (p as any).state;
        if (raw) return String(raw).toUpperCase();
        // Fallback status for projects created before status field
        const defaultStatuses = ['PLANNING', 'CONSTRUCTION', 'DELIVERED', 'COMPLETED'];
        return defaultStatuses[idx % defaultStatuses.length];
    };

    const getStatusBadgeCls = (statusStr: string) => {
        const s = statusStr.toUpperCase();
        if (s === 'PLANNING') return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
        if (s === 'CONSTRUCTION') return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
        if (s === 'COMPLETED') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
        if (s === 'DELIVERED') return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
        return 'bg-red-500/15 text-red-400 border-red-500/30';
    };

    const filteredProjects = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return projects;
        return projects.filter((p, idx) => {
            const title = (p.title || '').toLowerCase();
            const devName = getDeveloperName(p, idx).toLowerCase();
            const loc = (p.location || '').toLowerCase();
            const status = getStatusText(p, idx).toLowerCase();
            return title.includes(q) || devName.includes(q) || loc.includes(q) || status.includes(q);
        });
    }, [projects, searchQuery, devMap, devList]);

    return (
        <div className="animate-in fade-in duration-500 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <PlusSquare className="w-8 h-8 text-red-500" />
                    Registered Projects
                </h1>
                <Link
                    href="/dashboard/project/create"
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-red-600/20 w-fit"
                >
                    <Plus className="w-5 h-5" />
                    Create Project
                </Link>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center bg-[#111] border border-zinc-800 focus-within:border-red-500 rounded-xl px-4 py-2.5 shadow-lg transition-colors">
                <Search className="w-5 h-5 text-gray-400 flex-shrink-0 mr-3" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by project title, developer, location, or status..."
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
                            ) : filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        {searchQuery ? `No projects matching "${searchQuery}".` : 'No projects found.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((p, idx) => {
                                    const devName = getDeveloperName(p, idx);
                                    const statusVal = getStatusText(p, idx);
                                    const badgeCls = getStatusBadgeCls(statusVal);
                                    return (
                                        <tr key={p._id || idx} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{p.title}</td>
                                            <td className="px-6 py-4 text-gray-300 font-medium">{devName}</td>
                                            <td className="px-6 py-4 text-gray-400">{p.location || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badgeCls}`}>
                                                    {statusVal}
                                                </span>
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
