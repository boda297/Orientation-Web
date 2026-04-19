'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Building2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { developersApi } from '@/lib/dashboardApi';

export default function CreateDeveloperPage() {
    const [name, setName] = useState('');
    const [tagline, setTagline] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelected = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            setError('Please upload an image file.');
            return;
        }
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) { setError('Please provide a logo image.'); return; }

        setLoading(true);
        setSuccess(false);
        setError('');

        try {
            await developersApi.create({ name, tagline: tagline || undefined, logo: file });
            setSuccess(true);
            setName('');
            setTagline('');
            setFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            setError(err.message || 'Failed to create developer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
            <Link
                href="/dashboard/developer"
                className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Developers
            </Link>

            <div>
                <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-red-500" />
                    Create Developer
                </h1>

                {success && (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Developer created successfully!</span>
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6"
                >
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Developer Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="e.g. Margins Developments"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Tagline / Slogan (Optional)
                        </label>
                        <input
                            type="text"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="e.g. Paving a new way"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">
                            Developer Logo <span className="text-red-500">*</span>
                        </label>
                        <div
                            className={`relative border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                isDragging
                                    ? 'border-red-500 bg-red-500/10'
                                    : 'border-zinc-700 bg-black hover:border-zinc-500 hover:bg-zinc-900/50'
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDragging(false);
                                if (e.dataTransfer.files[0]) handleFileSelected(e.dataTransfer.files[0]);
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                                accept="image/*"
                                className="hidden"
                            />
                            {preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="w-full h-full object-contain rounded-lg p-2"
                                />
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
                                        <UploadCloud className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-300 font-medium">Click or drag image here</p>
                                    <p className="text-gray-500 text-xs mt-1">SVG, PNG, JPG or WEBP (max. 5MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full md:w-auto self-end px-8 h-12 bg-[#ff0000] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Developer'}
                    </button>
                </form>
            </div>
        </div>
    );
}
