'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, getFileUrl } from '@/lib/api';

interface NewsItem {
    _id: string;
    title: string;
    thumbnail?: string;
    projectId?: any;
    developer?: string;
    createdAt?: string;
}

export default function NewsPage() {
    const router = useRouter();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const data = await api.getNews();
                // Ensure data is array
                if (Array.isArray(data)) {
                    setNews(data);
                } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
                    setNews(data.data);
                } else {
                    setNews([]);
                }
            } catch (err) {
                console.error('Failed to fetch news:', err);
                setError('Failed to load news');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />
            <main className="flex-1 max-w-md mx-auto w-full pt-24 md:pt-28 pb-12 px-4">
                {/* Header Section */}
                <div className="flex items-center mb-8 relative">
                    <button onClick={() => router.back()} className="absolute left-0 text-white p-2 hover:text-red-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl md:text-2xl font-bold flex-1 text-center">News</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 text-red-500">{error}</div>
                ) : news.length > 0 ? (
                    <>
                        <h2 className="text-lg font-bold mb-6">
                            Results <span className="text-red-600">({news.length} News)</span>
                        </h2>

                        <div className="space-y-6">
                            {news.map((item) => {
                                const projectId = item.projectId?._id || (typeof item.projectId === 'string' ? item.projectId : '');
                                return (
                                    <div key={item._id} className="bg-[#1e272e] rounded-xl overflow-hidden border border-gray-800 transition-transform hover:scale-[1.02]">
                                        <div 
                                            className="bg-[#4b7a8d] flex items-center justify-center py-20 bg-cover bg-center relative"
                                            style={item.thumbnail ? { backgroundImage: `url(${getFileUrl(item.thumbnail)})` } : undefined}
                                        >
                                            {/* Optional overlay if thumbnail exists to make text readable */}
                                            {item.thumbnail && <div className="absolute inset-0 bg-black/40"></div>}
                                            <h3 className={`relative z-10 text-white text-3xl md:text-4xl italic font-light tracking-wide px-4 text-center drop-shadow-lg`}>{item.title}</h3>
                                        </div>
                                        <div className="p-4 flex items-center justify-between">
                                            <span className="text-gray-400 text-sm font-medium line-clamp-1 flex-1 mr-4">{item.developer || item.title}</span>
                                            {projectId ? (
                                                <Link href={`/project/${projectId}`} className="flex items-center gap-2 bg-[#2d3436] hover:bg-[#353b48] text-white px-5 py-2.5 rounded-3xl text-sm font-medium transition-colors flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    View Project
                                                </Link>
                                            ) : (
                                                <button className="flex items-center gap-2 bg-[#2d3436] hover:bg-[#353b48] text-white px-5 py-2.5 rounded-3xl text-sm font-medium transition-colors flex-shrink-0">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                    </svg>
                                                    Remind Me
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-lg font-bold mb-6">
                            Results <span className="text-red-600">(0 News)</span>
                        </h2>

                        {/* Empty State */}
                        <div className="text-center py-12 text-gray-400">
                            <div className="mb-4">
                                <svg className="w-16 h-16 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                </svg>
                            </div>
                            <p className="text-gray-400 text-lg mb-2">No news available</p>
                            <p className="text-gray-500 text-sm">Check back later for updates</p>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}
