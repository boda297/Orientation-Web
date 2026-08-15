'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, getFileUrl } from '@/lib/api';
import { developersApi, projectsApi } from '@/lib/dashboardApi';
import { PREDEFINED_AREAS, formatLocationName, formatDeveloperName } from '@/lib/locationUtils';
import { Building2, MapPin, Film, Search as SearchIcon, ArrowUpRight } from 'lucide-react';

type TabType = 'All' | 'Projects' | 'Developers' | 'Areas';

interface ProjectItem {
    _id: string;
    title: string;
    location?: string;
    projectThumbnailUrl?: string;
    heroVideo?: string;
    developer?: any;
}

interface DeveloperItem {
    _id: string;
    name: string;
    location?: string;
    logo?: string;
}

interface AreaItem {
    name: string;
}

const extractArray = (res: any): any[] => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === 'object') {
        if (Array.isArray(res.projects)) return res.projects;
        if (Array.isArray(res.data)) return res.data;
        if (Array.isArray(res.docs)) return res.docs;
        if (Array.isArray(res.items)) return res.items;
        if (Array.isArray(res.results)) return res.results;
    }
    return [];
};

function SearchContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [activeTab, setActiveTab] = useState<TabType>('All');

    const [projects, setProjects] = useState<ProjectItem[]>([]);
    const [developers, setDevelopers] = useState<DeveloperItem[]>([]);
    const [areas, setAreas] = useState<AreaItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Discovery States (when search input is empty & activeTab is All)
    const [latestProjects, setLatestProjects] = useState<any[]>([]);
    const [continueWatching, setContinueWatching] = useState<any[]>([]);
    const [newCairoProjects, setNewCairoProjects] = useState<any[]>([]);
    const [discoveryLoading, setDiscoveryLoading] = useState(true);

    // Fetch Discovery Data for empty search
    useEffect(() => {
        const fetchDiscovery = async () => {
            if (searchQuery.trim() !== '' || activeTab !== 'All') return;
            try {
                setDiscoveryLoading(true);
                const [latestRes, cwRes, newCairoRes] = await Promise.all([
                    api.getProjects({ limit: 10 }).catch(() => []),
                    api.getContinueWatching(4).catch(() => ({ items: [] })),
                    api.getProjectsByLocation('New Cairo').catch(() => []),
                ]);

                const rawLatest = extractArray(latestRes);
                setLatestProjects(rawLatest.slice(0, 4));

                let cwData = cwRes?.items || [];
                if (cwData.length === 0 && typeof window !== 'undefined') {
                    const localHistory = JSON.parse(localStorage.getItem('watchHistory') || '[]');
                    cwData = localHistory.slice(0, 4);
                }
                setContinueWatching(cwData);

                const nc = extractArray(newCairoRes);
                setNewCairoProjects(nc.slice(0, 4));
            } catch (err) {
                console.warn('Failed to fetch discovery', err);
            } finally {
                setDiscoveryLoading(false);
            }
        };

        fetchDiscovery();
    }, [searchQuery, activeTab]);

    // Fetch & Filter Search Results
    useEffect(() => {
        const fetchResults = async () => {
            const query = searchQuery.toLowerCase().trim();

            if (!query && activeTab === 'All') {
                setProjects([]);
                setDevelopers([]);
                setAreas([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const [publicProjectsRes, dashProjectsRes, devData] = await Promise.all([
                    api.getProjects({ limit: 500 }).catch(() => []),
                    projectsApi.list().catch(() => []),
                    developersApi.list().catch(() => []),
                ]);

                const publicProjects = extractArray(publicProjectsRes);
                const dashProjects = extractArray(dashProjectsRes);

                // Merge projects by _id or title to ensure no duplicate
                const projectMap = new Map<string, any>();
                [...publicProjects, ...dashProjects].forEach((p) => {
                    const key = p._id || p.id || p.title;
                    if (key && !projectMap.has(key)) {
                        projectMap.set(key, p);
                    }
                });
                const projectsList = Array.from(projectMap.values());
                const developersList = extractArray(devData);

                // 1. Filter Projects
                const matchingProjects: ProjectItem[] = projectsList.filter((p) => {
                    const title = (p.title || p.name || '').toLowerCase();
                    const loc = (p.location || '').toLowerCase();
                    const devName = (
                        typeof p.developer === 'object' ? p.developer?.name : p.developer || ''
                    ).toLowerCase();

                    return !query || title.includes(query) || loc.includes(query) || devName.includes(query);
                });

                // 2. Filter Developers
                const matchingDevelopers: DeveloperItem[] = developersList.filter((d) => {
                    const name = (d.name || '').toLowerCase();
                    const loc = (d.location || '').toLowerCase();

                    return !query || name.includes(query) || loc.includes(query);
                });

                // 3. Filter Areas
                const areaSet = new Set<string>(PREDEFINED_AREAS);
                projectsList.forEach((p) => p.location && areaSet.add(formatLocationName(p.location)));
                developersList.forEach((d) => d.location && areaSet.add(formatLocationName(d.location)));

                const matchingAreas: AreaItem[] = Array.from(areaSet)
                    .filter((areaName) => !query || areaName.toLowerCase().includes(query))
                    .map((areaName) => ({ name: areaName }));

                setProjects(matchingProjects);
                setDevelopers(matchingDevelopers);
                setAreas(matchingAreas);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch search results.');
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchResults();
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery, activeTab]);

    const hasAnyResults =
        (activeTab === 'All' && (projects.length > 0 || developers.length > 0 || areas.length > 0)) ||
        (activeTab === 'Projects' && projects.length > 0) ||
        (activeTab === 'Developers' && developers.length > 0) ||
        (activeTab === 'Areas' && areas.length > 0);

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="pt-24 md:pt-28 pb-16 max-w-[1600px] mx-auto px-4 min-h-[80vh]">
                {/* Top Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="text-white hover:text-red-500 transition-colors p-2 rounded-full hover:bg-zinc-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl md:text-3xl font-bold flex-1 text-center pr-10">Search</h1>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-3xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-[#1c1c1c] text-white rounded-full py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-red-600 border border-zinc-800 text-base placeholder-gray-500 shadow-lg"
                        placeholder="Search for projects, developers, or areas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Tabs Bar */}
                <div className="flex gap-3 justify-center overflow-x-auto pb-4 scrollbar-hide mb-10 max-w-3xl mx-auto">
                    {(['All', 'Projects', 'Developers', 'Areas'] as TabType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 text-sm rounded-full whitespace-nowrap transition-all border font-semibold ${
                                activeTab === tab
                                    ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/30'
                                    : 'bg-[#1c1c1c] text-gray-300 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search Results Display */}
                {(searchQuery.trim() !== '' || activeTab !== 'All') && (
                    <div className="max-w-6xl mx-auto space-y-10">
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-12">{error}</div>
                        ) : hasAnyResults ? (
                            <>
                                {/* 1. PROJECTS SECTION */}
                                {(activeTab === 'All' || activeTab === 'Projects') && projects.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-5">
                                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                                <Film className="w-6 h-6 text-red-500" />
                                                Projects ({projects.length})
                                            </h2>
                                        </div>
                                        {/* Home Page Style Rich Cover Image Cards */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                            {projects.map((proj) => {
                                                const imgUrl =
                                                    proj.projectThumbnailUrl ||
                                                    (proj as any).projectThumbnail ||
                                                    (proj as any).thumbnail ||
                                                    (proj as any).coverImage ||
                                                    (proj as any).heroVideo ||
                                                    (proj as any).logo;
                                                return (
                                                    <Link href={`/project/${proj._id}`} key={proj._id} className="group cursor-pointer">
                                                        <div className="aspect-[4/5] bg-[#1c1c1c] rounded-2xl overflow-hidden relative border border-zinc-800 hover:border-red-500 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(239,68,68,0.25)]">
                                                            {imgUrl ? (
                                                                <Image
                                                                    src={getFileUrl(imgUrl)}
                                                                    alt={proj.title || 'Project'}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                                                                    <span className="text-zinc-600 text-xs">No Image</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                <h3 className="text-white font-bold text-base md:text-lg line-clamp-1 group-hover:text-red-400 transition-colors">
                                                                    {proj.title}
                                                                </h3>
                                                                {proj.location && (
                                                                    <p className="text-zinc-300 text-xs mt-1 truncate flex items-center gap-1">
                                                                        <MapPin className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                                                        {formatLocationName(proj.location)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* 2. DEVELOPERS SECTION */}
                                {(activeTab === 'All' || activeTab === 'Developers') && developers.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4 mt-6">
                                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                                <Building2 className="w-6 h-6 text-red-500" />
                                                Developers ({developers.length})
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {developers.map((dev) => (
                                                <Link href="/areas" key={dev._id} className="group cursor-pointer">
                                                    <div className="bg-zinc-900/90 border border-zinc-800 hover:border-red-500 p-4 rounded-2xl flex items-center gap-3.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-700">
                                                            {dev.logo ? (
                                                                <Image
                                                                    src={getFileUrl(dev.logo)}
                                                                    alt={dev.name}
                                                                    width={48}
                                                                    height={48}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <Building2 className="w-6 h-6 text-red-500" />
                                                            )}
                                                        </div>
                                                        <div className="overflow-hidden">
                                                            <h4 className="text-white font-bold text-sm truncate group-hover:text-red-400 transition-colors">
                                                                {formatDeveloperName(dev.name)}
                                                            </h4>
                                                            {dev.location && (
                                                                <p className="text-zinc-400 text-xs truncate mt-0.5 flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                                                                    {formatLocationName(dev.location)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* 3. AREAS SECTION */}
                                {(activeTab === 'All' || activeTab === 'Areas') && areas.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4 mt-6">
                                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                                <MapPin className="w-6 h-6 text-red-500" />
                                                Areas ({areas.length})
                                            </h2>
                                        </div>
                                        {/* Horizontal Pill Buttons Matching Discover Areas Design */}
                                        <div className="flex flex-wrap gap-3">
                                            {areas.map((area) => (
                                                <Link
                                                    key={area.name}
                                                    href={`/areas/${encodeURIComponent(area.name)}`}
                                                    className="group flex items-center gap-2 bg-zinc-900/90 hover:bg-red-600 text-white font-semibold text-sm md:text-base px-5 py-2.5 rounded-full border border-zinc-800 hover:border-red-500 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(239,68,68,0.35)] hover:-translate-y-0.5"
                                                >
                                                    <MapPin className="w-4 h-4 text-red-500 group-hover:text-white transition-colors" />
                                                    <span>{area.name}</span>
                                                    <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        ) : (
                            <div className="text-center text-gray-400 py-16">
                                No results found for &quot;<span className="text-white font-semibold">{searchQuery}</span>&quot;.
                            </div>
                        )}
                    </div>
                )}

                {/* Discovery Sections (Shown when search is empty & activeTab is All) */}
                {searchQuery.trim() === '' && activeTab === 'All' && (
                    <div className="space-y-12 max-w-6xl mx-auto">
                        {discoveryLoading ? (
                            <div className="flex justify-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
                            </div>
                        ) : (
                            <>
                                {/* Latest Projects Section */}
                                {latestProjects.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl md:text-2xl font-bold">The latest for us</h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                            {latestProjects.map((proj) => {
                                                const imgUrl =
                                                    proj.projectThumbnailUrl ||
                                                    (proj as any).projectThumbnail ||
                                                    (proj as any).thumbnail ||
                                                    (proj as any).coverImage ||
                                                    (proj as any).heroVideo;
                                                return (
                                                    <Link href={`/project/${proj._id}`} key={proj._id}>
                                                        <div className="aspect-[4/5] bg-[#1c1c1c] rounded-2xl overflow-hidden relative group cursor-pointer border border-zinc-800 hover:border-red-500 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(239,68,68,0.25)]">
                                                            {imgUrl ? (
                                                                <Image
                                                                    src={getFileUrl(imgUrl)}
                                                                    alt={proj.title || 'Project'}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 bg-zinc-900 rounded-xl" />
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">
                                                                    {proj.title}
                                                                </h3>
                                                                {proj.location && (
                                                                    <p className="text-gray-300 text-xs mt-0.5 truncate flex items-center gap-1">
                                                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                                                        {formatLocationName(proj.location)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Continue Watching Section */}
                                {continueWatching.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl md:text-2xl font-bold">Continue watching</h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                            {continueWatching.map((item, idx) => {
                                                const duration = item.duration || 1;
                                                const currentTime = item.currentTime || 0;
                                                const minutesLeft = Math.max(0, Math.ceil((duration - currentTime) / 60));
                                                const hoursLeft = Math.floor(minutesLeft / 60);
                                                const remainingMins = minutesLeft % 60;
                                                let timeString = 'Finished';

                                                if (minutesLeft > 0) {
                                                    timeString =
                                                        hoursLeft > 0
                                                            ? `${String(hoursLeft).padStart(2, '0')}:${String(remainingMins).padStart(2, '0')} H`
                                                            : `${remainingMins}m`;
                                                }

                                                const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
                                                let cId = item.projectId;
                                                if (!cId && item.contentId) {
                                                    cId =
                                                        typeof item.contentId === 'object'
                                                            ? item.contentId._id || item.contentId.id
                                                            : item.contentId;
                                                }
                                                const episodeId = item.episodeId || item._id;

                                                return (
                                                    <Link
                                                        href={`/project/${cId}?tab=Episodes&episode=${episodeId}&time=${Math.floor(currentTime)}`}
                                                        key={episodeId || idx}
                                                    >
                                                        <div className="cursor-pointer group flex flex-col gap-2">
                                                            <div className="aspect-video relative overflow-hidden bg-[#1c1c1c] rounded-2xl border border-zinc-800 group-hover:border-red-500 transition-all">
                                                                {item.contentThumbnail || item.thumbnail ? (
                                                                    <Image
                                                                        src={getFileUrl(item.contentThumbnail || item.thumbnail)}
                                                                        alt={item.contentTitle || item.episodeTitle || ''}
                                                                        fill
                                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-zinc-900" />
                                                                )}
                                                                <div className="absolute inset-0 bg-black/10" />
                                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                                                    <div className="h-full bg-red-600 transition-all" style={{ width: `${progress}%` }} />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-between items-center px-1">
                                                                <h3 className="text-sm font-bold truncate flex-1">
                                                                    {item.contentTitle || item.episodeTitle}
                                                                </h3>
                                                                <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2">{timeString}</span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Projects in New Cairo Section */}
                                {newCairoProjects.length > 0 && (
                                    <section>
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl md:text-2xl font-bold">Projects in New Cairo</h2>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                            {newCairoProjects.map((proj) => {
                                                const imgUrl =
                                                    proj.projectThumbnailUrl ||
                                                    (proj as any).projectThumbnail ||
                                                    (proj as any).thumbnail ||
                                                    (proj as any).coverImage ||
                                                    (proj as any).heroVideo;
                                                return (
                                                    <Link href={`/project/${proj._id}`} key={proj._id}>
                                                        <div className="aspect-[4/5] bg-[#1c1c1c] rounded-2xl overflow-hidden relative group cursor-pointer border border-zinc-800 hover:border-red-500 transition-all duration-300 hover:shadow-[0_8px_25px_rgba(239,68,68,0.25)]">
                                                            {imgUrl ? (
                                                                <Image
                                                                    src={getFileUrl(imgUrl)}
                                                                    alt={proj.title || 'Project'}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                                />
                                                            ) : (
                                                                <div className="absolute inset-0 bg-zinc-900 rounded-xl" />
                                                            )}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                                            <div className="absolute bottom-4 left-4 right-4">
                                                                <h3 className="text-white font-bold text-base md:text-lg line-clamp-1">
                                                                    {proj.title}
                                                                </h3>
                                                                {proj.location && (
                                                                    <p className="text-gray-300 text-xs mt-0.5 truncate flex items-center gap-1">
                                                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                                                        {formatLocationName(proj.location)}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
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

export default function SearchPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            }
        >
            <SearchContent />
        </Suspense>
    );
}
