'use client';

import { useState, useRef, useEffect } from 'react';
import {
    UploadCloud, CheckCircle2, Loader2, Image as ImageIcon,
    Video, File, FileText, PlusSquare, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { projectsApi, developersApi, type Developer } from '@/lib/dashboardApi';

function FileZone({
    label, icon: Icon, accept, file, onChange, required,
}: {
    label: string;
    icon: React.ElementType;
    accept: string;
    file: File | null;
    onChange: (f: File | null) => void;
    required?: boolean;
}) {
    const ref = useRef<HTMLInputElement>(null);
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => ref.current?.click()}
                className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
                <input
                    ref={ref}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
                <Icon className={`w-6 h-6 mb-2 ${file ? 'text-red-500' : 'text-gray-400'}`} />
                <p className="text-gray-300 text-sm text-center px-2 truncate max-w-full">
                    {file ? file.name : `Upload ${label}`}
                </p>
            </div>
        </div>
    );
}

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
    const [episodes, setEpisodes] = useState<File[]>([]);
    const episodesRef = useRef<HTMLInputElement>(null);

    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        developersApi.list().then(setDevelopers).catch(console.error);
    }, []);

    const resetForm = () => {
        setTitle(''); setDeveloperId(''); setLocation(''); setWhatsapp(''); setScript('');
        setThumbnail(null); setHeroImage(null); setHeroVideo(null); setInventoryPdf(null); setEpisodes([]);
        if (episodesRef.current) episodesRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!thumbnail) { setError('Please upload a project thumbnail.'); return; }
        if (!developerId) { setError('Please select a developer.'); return; }

        setLoading(true);
        setSuccess(false);
        setError('');

        try {
            await projectsApi.create({
                title,
                developer: developerId,
                location: location || undefined,
                whatsappNumber: whatsapp || undefined,
                script: script || undefined,
                projectThumbnailUrl: thumbnail ?? undefined,
                heroImageUrl: heroImage ?? undefined,
                videoUrl: heroVideo ?? undefined,
                inventoryPdf: inventoryPdf ?? undefined,
                episodes: episodes.length ? episodes : undefined,
            });
            setSuccess(true);
            resetForm();
        } catch (err: any) {
            setError(err.message || 'Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
            <Link
                href="/dashboard/project"
                className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Projects
            </Link>

            <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <PlusSquare className="w-8 h-8 text-red-500" />
                Create New Project
            </h1>

            {success && (
                <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Project created successfully!</span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-8"
            >
                {/* Basic Details */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Basic Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">
                                Project Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="e.g. Zia"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">
                                Developer <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={developerId}
                                onChange={(e) => setDeveloperId(e.target.value)}
                                required
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors appearance-none"
                            >
                                <option value="" disabled>Select Developer</option>
                                {developers.map((dev) => (
                                    <option key={dev._id} value={dev._id}>{dev.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="e.g. New Cairo"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">WhatsApp Number</label>
                            <input
                                type="text"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                                placeholder="e.g. +201000000000"
                            />
                        </div>
                    </div>
                </div>

                {/* Media & Files */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Media & Files</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileZone label="Card Thumbnail" icon={ImageIcon} accept="image/*" file={thumbnail} onChange={setThumbnail} required />
                        <FileZone label="Hero Background Image" icon={ImageIcon} accept="image/*" file={heroImage} onChange={setHeroImage} />
                        <FileZone label="Hero Background Video" icon={Video} accept="video/*" file={heroVideo} onChange={setHeroVideo} />
                        <FileZone label="Inventory PDF" icon={FileText} accept="application/pdf" file={inventoryPdf} onChange={setInventoryPdf} />
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-sm font-semibold text-gray-300">Episodes (Videos / PDFs)</label>
                            <div
                                onClick={() => episodesRef.current?.click()}
                                className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black hover:bg-zinc-900/50 rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors"
                            >
                                <input
                                    ref={episodesRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => setEpisodes(e.target.files ? Array.from(e.target.files) : [])}
                                />
                                <File className={`w-6 h-6 mb-2 ${episodes.length ? 'text-red-500' : 'text-gray-400'}`} />
                                <p className="text-gray-300 text-sm">
                                    {episodes.length ? `${episodes.length} file(s) selected` : 'Select Multiple Episodes'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Script */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Project Script</h2>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        className="w-full h-40 bg-black border border-zinc-700 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none transition-colors resize-none"
                        placeholder="Write the project script or detailed description here..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 w-full md:w-auto self-end px-8 h-12 bg-[#ff0000] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 text-lg"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Create Project'}
                </button>
            </form>
        </div>
    );
}
