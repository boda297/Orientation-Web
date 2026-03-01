'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TVPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
                <div className="text-center animate-pulse">
                    <h1 className="text-5xl md:text-7xl font-bold mb-4">TV SHOW</h1>
                    <p className="text-xl md:text-3xl text-red-600 font-semibold tracking-[0.3em] uppercase mt-6">
                        Coming Soon
                    </p>
                </div>
            </main>
            <Footer />
        </div>
    );
}
