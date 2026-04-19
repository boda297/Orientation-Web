'use client';

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Link2, FileText, Image as ImageIcon, Video, File, PlusSquare, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

// Example structured form for Project creation
export default function CreateProjectPage() {
    const [title, setTitle] = useState('');
    const [developerId, setDeveloperId] = useState('');
    const [location, setLocation] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [script, setScript] = useState('');

    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [heroImage, setHeroImage] = useState<File | null>(null);
    const [heroVideo, setHeroVideo] = useState<File | null>(null);
    const [inventoryPdf, setInventoryPdf] = useState<File | null>(null);

    // Episodes: multiple files could go here
    const [episodes, setEpisodes] = useState<File[]>([]);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Refs for file inputs
    const thumbnailRef = useRef<HTMLInputElement>(null);
    const heroImageRef = useRef<HTMLInputElement>(null);
    const heroVideoRef = useRef<HTMLInputElement>(null);
    const inventoryRef = useRef<HTMLInputElement>(null);
    const episodesRef = useRef<HTMLInputElement>(null);

    const [developers, setDevelopers] = useState<{ _id: string, name: string }[]>([]);

    useEffect(() => {
        // Fetch developers for the dropdown from API
        const fetchDevs = async () => {
            try {
                const res = await fetch(getApiUrl('/developers'));
                if (res.ok) {
                    const data = await res.json();
                    setDevelopers(Array.isArray(data) ? data : (data.developers || data.data || []));
                }
            } catch (err) {
                console.error("Error fetching developers", err);
            }
        };
        fetchDevs();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    const handleEpisodesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEpisodes(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('developer', developerId);
            formData.append('location', location);
            formData.append('whatsappNumber', whatsapp);
            formData.append('script', script);

            if (thumbnail) formData.append('projectThumbnailUrl', thumbnail);
            if (heroImage) formData.append('heroImageUrl', heroImage);
            if (heroVideo) formData.append('videoUrl', heroVideo);
            if (inventoryPdf) formData.append('inventoryPdf', inventoryPdf);

            episodes.forEach((ep) => formData.append('episodes', ep));

            const token = getAccessToken();
            // Replace /projects with your actual endpoint path
            const res = await fetch(getApiUrl('/projects'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to create project');
            }

            setSuccess(true);
            // Reset form
            setTitle(''); setDeveloperId(''); setLocation(''); setWhatsapp(''); setScript('');
            setThumbnail(null); setHeroImage(null); setHeroVideo(null); setInventoryPdf(null); setEpisodes([]);

        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard/project" className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max">
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Projects
            </Link>

            <div>
                <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                    <PlusSquare className="w-8 h-8 text-red-500" />
                    Create New Project
                </h1>

                {success && (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Project created successfully!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-8">

                    {/* Section 1: Basic Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Basic Details</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Project Title <span className="text-red-500">*</span></label>
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors" placeholder="e.g. Zia" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Developer <span className="text-red-500">*</span></label>
                                <select value={developerId} onChange={(e) => setDeveloperId(e.target.value)} required className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors appearance-none">
                                    <option value="" disabled>Select Developer</option>
                                    {developers.map(dev => (
                                        <option key={dev._id} value={dev._id}>{dev.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Location</label>
                                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors" placeholder="e.g. New Cairo" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">WhatsApp Number</label>
                                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors" placeholder="e.g. +201000000000" />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Media & Files */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Media & Files</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Thumbnail */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Card Thumbnail Image <span className="text-red-500">*</span></label>
                                <div onClick={() => thumbnailRef.current?.click()} className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <input type="file" ref={thumbnailRef} onChange={(e) => handleFileChange(e, setThumbnail)} accept="image/*" className="hidden" required />
                                    <ImageIcon className={`w-6 h-6 mb-2 ${thumbnail ? 'text-red-500' : 'text-gray-400'}`} />
                                    <p className="text-gray-300 text-sm">{thumbnail ? thumbnail.name : 'Upload Thumbnail'}</p>
                                </div>
                            </div>

                            {/* Hero Image */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Hero Background Image</label>
                                <div onClick={() => heroImageRef.current?.click()} className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <input type="file" ref={heroImageRef} onChange={(e) => handleFileChange(e, setHeroImage)} accept="image/*" className="hidden" />
                                    <ImageIcon className={`w-6 h-6 mb-2 ${heroImage ? 'text-red-500' : 'text-gray-400'}`} />
                                    <p className="text-gray-300 text-sm">{heroImage ? heroImage.name : 'Upload Hero Image'}</p>
                                </div>
                            </div>

                            {/* Hero Video */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Hero Background Video</label>
                                <div onClick={() => heroVideoRef.current?.click()} className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <input type="file" ref={heroVideoRef} onChange={(e) => handleFileChange(e, setHeroVideo)} accept="video/*" className="hidden" />
                                    <Video className={`w-6 h-6 mb-2 ${heroVideo ? 'text-red-500' : 'text-gray-400'}`} />
                                    <p className="text-gray-300 text-sm">{heroVideo ? heroVideo.name : 'Upload Hero Video MP4'}</p>
                                </div>
                            </div>

                            {/* Inventory PDF */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-300">Inventory PDF</label>
                                <div onClick={() => inventoryRef.current?.click()} className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <input type="file" ref={inventoryRef} onChange={(e) => handleFileChange(e, setInventoryPdf)} accept="application/pdf" className="hidden" />
                                    <FileText className={`w-6 h-6 mb-2 ${inventoryPdf ? 'text-red-500' : 'text-gray-400'}`} />
                                    <p className="text-gray-300 text-sm">{inventoryPdf ? inventoryPdf.name : 'Upload Inventory PDF'}</p>
                                </div>
                            </div>

                            {/* Episodes */}
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-300">Episodes (Videos/PDFs)</label>
                                <div onClick={() => episodesRef.current?.click()} className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                    <input type="file" ref={episodesRef} onChange={handleEpisodesChange} multiple className="hidden" />
                                    <File className={`w-6 h-6 mb-2 ${episodes.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                                    <p className="text-gray-300 text-sm">
                                        {episodes.length > 0 ? `${episodes.length} files selected` : 'Select Multiple Episodes'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Script & Extra Details */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Project Script</h2>
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={script}
                                onChange={(e) => setScript(e.target.value)}
                                className="w-full h-40 bg-black border border-zinc-700 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none transition-colors resize-none"
                                placeholder="Write the project script or detailed description here..."
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full md:w-auto self-end px-8 h-12 bg-[#ff0000] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 text-lg"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Project'}
                    </button>

                </form>
            </div>
        </div>
    );
}
