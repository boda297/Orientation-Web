'use client';

import { useState, useRef, useEffect } from 'react';
import {
    CheckCircle2, Loader2, Image as ImageIcon,
    Video, PlusSquare, ChevronLeft,
} from 'lucide-react';
import Link from 'next/link';
import { projectsApi, developersApi, type Developer } from '@/lib/dashboardApi';

/** Square image upload with live preview */
function ImageZone({
    label, file, onChange, required,
}: {
    label: string;
    file: File | null;
    onChange: (f: File | null) => void;
    required?: boolean;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                onClick={() => ref.current?.click()}
                className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black rounded-xl cursor-pointer transition-colors overflow-hidden"
                style={{ aspectRatio: '1 / 1' }}
            >
                <input
                    ref={ref}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
                {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-4">
                        <ImageIcon className="w-8 h-8 text-gray-500" />
                        <p className="text-gray-400 text-xs text-center">Click to upload {label}</p>
                    </div>
                )}
                {previewUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                        <p className="text-white text-xs font-medium px-2 text-center truncate">{file?.name}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/** 16:9 video upload with native video player preview */
function VideoZone({
    label, file, onChange, required,
}: {
    label: string;
    file: File | null;
    onChange: (f: File | null) => void;
    required?: boolean;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const previewUrl = file ? URL.createObjectURL(file) : null;
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div
                className="relative border-2 border-dashed border-zinc-700 hover:border-red-500 bg-black rounded-xl cursor-pointer transition-colors overflow-hidden"
                style={{ aspectRatio: '16 / 9' }}
                onClick={() => !previewUrl && ref.current?.click()}
            >
                <input
                    ref={ref}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                />
                {previewUrl ? (
                    <video
                        src={previewUrl}
                        controls
                        className="w-full h-full object-contain bg-black"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full gap-2 p-4">
                        <Video className="w-8 h-8 text-gray-500" />
                        <p className="text-gray-400 text-xs text-center">Click to upload {label}</p>
                    </div>
                )}
                {previewUrl && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); ref.current?.click(); }}
                        className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-lg transition-colors z-10"
                    >
                        Replace
                    </button>
                )}
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

    const [thumbnail, setThumbnail] = useState<File | null>(null);  // → projectThumbnail
    const [logoImage, setLogoImage] = useState<File | null>(null);   // → logo
    const [heroVideo, setHeroVideo] = useState<File | null>(null);   // → heroVideo (required)

    const [developers, setDevelopers] = useState<Developer[]>([]);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        developersApi.list().then(setDevelopers).catch(console.error);
    }, []);

    const resetForm = () => {
        setTitle(''); setDeveloperId(''); setLocation(''); setWhatsapp(''); setScript('');
        setThumbnail(null); setLogoImage(null); setHeroVideo(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!heroVideo) { setError('Please upload a hero background video.'); return; }
        if (!developerId) { setError('Please select a developer.'); return; }

        setLoading(true);
        setSuccess(false);
        setError('');

        try {
            await projectsApi.create({
                title,
                developer: developerId,
                location,
                script,
                whatsappNumber: whatsapp || undefined,
                projectThumbnail: thumbnail ?? undefined,
                heroVideo,
                logo: logoImage ?? undefined,
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
                            <label className="text-sm font-semibold text-gray-300">
                                Location <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
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
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <ImageZone label="Card Thumbnail" file={thumbnail} onChange={setThumbnail} />
                        <ImageZone label="Developer Logo" file={logoImage} onChange={setLogoImage} />
                    </div>
                    <VideoZone label="Hero Background Video" file={heroVideo} onChange={setHeroVideo} required />
                </div>

                {/* Script */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">
                        Project Script <span className="text-red-500">*</span>
                    </h2>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        required
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
