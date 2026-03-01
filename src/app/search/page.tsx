// ... (we'll rewrite the entire file to insert states for newCairoProjects and fix search)
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, getFileUrl } from '@/lib/api';

interface SearchItem {
    _id: string;
    title?: string;
    name?: string; // for developers
    location?: string;
    projectThumbnailUrl?: string;
    logoUrl?: string; // for developers/featured
}

interface WatchHistoryItem {
    _id: string;
    contentId: string | { _id?: string, id?: string, [key: string]: unknown };
    contentTitle: string;
    contentThumbnail?: string;
    currentTime: number;
    duration: number;
    updatedAt?: string;
}

type TabType = 'All' | 'Projects' | 'Developers' | 'Areas';

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<TabType>('All');

    const [results, setResults] = useState<SearchItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Discovery States
    const [latestProjects, setLatestProjects] = useState<SearchItem[]>([]);
    const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
    const [newCairoProjects, setNewCairoProjects] = useState<SearchItem[]>([]);
    const [discoveryLoading, setDiscoveryLoading] = useState(true);

    // Fetch Discovery Data (Empty search query)
    useEffect(() => {
        const fetchDiscovery = async () => {
            if (searchQuery.trim() !== '' || activeTab !== 'All') return;
            try {
                setDiscoveryLoading(true);
                const [latestRes, cwRes, newCairoRes] = await Promise.all([
                    api.getProjects({ limit: 4 }),
                    api.getContinueWatching(4),
                    api.getProjectsByLocation('New Cairo')
                ]);

                setLatestProjects(Array.isArray(latestRes.projects) ? latestRes.projects : (Array.isArray(latestRes) ? latestRes : []));
                let cwData = cwRes?.items || [];
                if (cwData.length === 0) {
                    cwData = [
                        { _id: 'mock1', contentId: 'mock1', contentTitle: 'Direction White', contentThumbnail: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400', currentTime: 15 * 60, duration: 120 * 60 },
                        { _id: 'mock2', contentId: 'mock2', contentTitle: 'Oaks', contentThumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400', currentTime: 30 * 60, duration: 135 * 60 },
                    ];
                }
                setContinueWatching(cwData);

                const nc = Array.isArray(newCairoRes.projects) ? newCairoRes.projects : (Array.isArray(newCairoRes) ? newCairoRes : []);
                setNewCairoProjects(nc.slice(0, 4));
            } catch (err) {
                console.warn('Failed to fetch discovery', err);
            } finally {
                setDiscoveryLoading(false);
            }
        };

        fetchDiscovery();
    }, [searchQuery]);

    // Fetch Search Data
    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim() && activeTab === 'All') {
                setResults([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Fetch all and filter client side to support substring
                const res = await api.getProjects({ limit: 100 });
                const all = Array.isArray(res.projects) ? res.projects : (Array.isArray(res) ? res : []);

                let filtered = all.filter((p: SearchItem) =>
                    (p.title || p.name)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.location?.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (activeTab === 'Developers') {
                    filtered = []; // Placeholder
                } else if (activeTab === 'Areas') {
                    filtered = all.filter((p: SearchItem) => p.location?.toLowerCase().includes(searchQuery.toLowerCase()));
                }

                setResults(filtered);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch search results.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="pt-24 md:pt-28 pb-12 max-w-[1600px] mx-auto px-4 min-h-[80vh]">
                {/* Top Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => router.back()} className="text-white hover:text-red-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold flex-1 text-center pr-10">Search</h1>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-3xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        className="w-full bg-[#1c1c1c] text-white rounded-full py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-600 border border-gray-800"
                        placeholder="Search for a project...."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-3 justify-start md:justify-center overflow-x-auto pb-4 scrollbar-hide mb-8 max-w-3xl mx-auto">
                    {(['All', 'Projects', 'Developers', 'Areas'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors border ${activeTab === tab ? 'bg-red-600 text-white border-red-600 font-semibold' : 'bg-[#1c1c1c] text-gray-300 border-gray-800 hover:bg-gray-800'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Dynamic Search Results */}
                {(searchQuery.trim() !== '' || activeTab !== 'All') && (
                    <div className="max-w-5xl mx-auto">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-12">{error}</div>
                        ) : results.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                                {results.map((item) => (
                                    <Link href={`/project/${item._id}`} key={item._id} className="group cursor-pointer">
                                        {/* Project Thumbnail */}
                                        <div className="relative aspect-[3/4] bg-gray-800 rounded-xl overflow-hidden mb-2">
                                            {item.projectThumbnailUrl || item.logoUrl ? (
                                                <Image
                                                    src={getFileUrl(item.projectThumbnailUrl || item.logoUrl)}
                                                    alt={item.title || item.name || 'Thumbnail'}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 border border-gray-800 rounded-xl">
                                                    <span className="text-gray-600 text-sm">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent" />
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <h3 className="text-white font-bold text-sm line-clamp-2 md:text-base">{item.title || item.name}</h3>
                                                {item.location && <p className="text-gray-300 text-xs md:text-sm truncate mt-1">{item.location}</p>}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-12">No results found for &quot;{searchQuery}&quot;.</div>
                        )}
                    </div>
                )}

                {/* Discovery Sections (Shown when search is empty) */}
                {(searchQuery.trim() === '' && activeTab === 'All') && (
                    <div className="space-y-12 max-w-4xl mx-auto">
                        {discoveryLoading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* The latest for us Section */}
                                {latestProjects.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl md:text-2xl font-bold">The latest for us</h2>
                                            <Link href="/projects" className="text-red-500 text-sm font-semibold hover:underline">View all</Link>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {latestProjects.map(proj => (
                                                <Link href={`/project/${proj._id}`} key={proj._id}>
                                                    <div className="aspect-[4/5] bg-[#1c1c1c] rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-900">
                                                        {proj.projectThumbnailUrl ? (
                                                            <Image src={getFileUrl(proj.projectThumbnailUrl)} alt={proj.title || 'Project'} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gray-900 rounded-xl" />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">{proj.title}</h3>
                                                            {proj.location && <p className="text-gray-300 text-xs mt-0.5 truncate">{proj.location}</p>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Continue Watching Section */}
                                {continueWatching.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl md:text-2xl font-bold">Continue watching</h2>
                                            <Link href="/saved" className="text-red-500 text-sm font-semibold hover:underline">View all</Link>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {continueWatching.map(item => {
                                                const minutesLeft = Math.max(0, Math.ceil((item.duration - item.currentTime) / 60));
                                                const hoursLeft = Math.floor(minutesLeft / 60);
                                                const remainingMins = minutesLeft % 60;
                                                let timeString = 'Finished';

                                                if (minutesLeft > 0) {
                                                    timeString = hoursLeft > 0
                                                        ? `${String(hoursLeft).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')} H`
                                                        : `${remainingMins}m`;
                                                }

                                                const progress = item.duration > 0 ? (item.currentTime / item.duration) * 100 : 0;
                                                const cId = typeof item.contentId === 'object' && item.contentId ? item.contentId._id || item.contentId.id : item.contentId;

                                                return (
                                                    <Link href={`/project/${cId}`} key={item._id}>
                                                        <div className="cursor-pointer group flex flex-col gap-2">
                                                            <div className="aspect-video relative overflow-hidden bg-[#1c1c1c] rounded-2xl">
                                                                {item.contentThumbnail ? (
                                                                    <Image src={getFileUrl(item.contentThumbnail)} alt={item.contentTitle} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                                ) : (
                                                                    <div className="w-full h-full bg-gray-900" />
                                                                )}
                                                                <div className="absolute inset-0 bg-black/10" />
                                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                                                    <div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center px-1">
                                                                <h3 className="text-sm font-bold truncate flex-1">{item.contentTitle}</h3>
                                                                <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{timeString}</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Projects in New Cairo Section */}
                                {newCairoProjects.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl md:text-2xl font-bold">Projects in New Cairo</h2>
                                            <Link href="/projects" className="text-red-500 text-sm font-semibold hover:underline">View all</Link>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {newCairoProjects.map(proj => (
                                                <Link href={`/project/${proj._id}`} key={proj._id}>
                                                    <div className="aspect-[4/3] md:aspect-[4/5] bg-[#1c1c1c] rounded-2xl overflow-hidden relative group cursor-pointer border border-gray-900">
                                                        {proj.projectThumbnailUrl ? (
                                                            <Image src={getFileUrl(proj.projectThumbnailUrl)} alt={proj.title || 'Project'} fill className="object-cover group-hover:scale-105 transition-transform" />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gray-900 rounded-xl" />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">{proj.title}</h3>
                                                            {proj.location && <p className="text-gray-300 text-xs mt-0.5 truncate">{proj.location}</p>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
