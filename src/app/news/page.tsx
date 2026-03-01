'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function NewsPage() {
    const router = useRouter();

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

                <h2 className="text-lg font-bold mb-6">
                    Results <span className="text-red-600">(1 News)</span>
                </h2>

                {/* News Card */}
                <div className="bg-[#1e272e] rounded-xl overflow-hidden border border-gray-800 transition-transform hover:scale-[1.02]">
                    <div className="bg-[#4b7a8d] flex items-center justify-center py-20">
                        <h3 className="text-white text-4xl italic font-light tracking-wide">news 1</h3>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">aljar</span>
                        <button className="flex items-center gap-2 bg-[#2d3436] hover:bg-[#353b48] text-white px-5 py-2.5 rounded-3xl text-sm font-medium transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            Remind Me
                        </button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
