'use client';

import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Loader2, Building2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

export default function CreateDeveloperPage() {
    const [name, setName] = useState('');
    const [tagline, setTagline] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelected(e.target.files[0]);
        }
    };

    const handleFileSelected = (selectedFile: File) => {
        if (!selectedFile.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreview(objectUrl);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !file) {
            alert('Please provide a name and a logo.');
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (tagline) formData.append('tagline', tagline);
            formData.append('logo', file); // Double check if API expects 'logo', 'image' or 'thumbnail'

            const token = getAccessToken();
            // Replace /developers with your API endpoint
            const res = await fetch(getApiUrl('/developers'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => null);
                throw new Error(errorData?.message || 'Failed to create developer');
            }

            setSuccess(true);
            setName('');
            setTagline('');
            setFile(null);
            setPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to create developer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto space-y-6">
            <Link href="/dashboard/developer" className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max">
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

                <form onSubmit={handleSubmit} className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col gap-6">

                    {/* Name Input */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Developer Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="e.g. Margins Developments"
                        />
                    </div>

                    {/* Tagline Input Optional */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Tagline / Slogan (Optional)</label>
                        <input
                            type="text"
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            className="w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors"
                            placeholder="e.g. Paving a new way"
                        />
                    </div>

                    {/* Logo Upload Drag & Drop */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Developer Logo <span className="text-red-500">*</span></label>
                        <div
                            className={`relative border-2 border-dashed rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-red-500 bg-red-500/10' : 'border-zinc-700 bg-black hover:border-zinc-500 hover:bg-zinc-900/50'
                                }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            {preview ? (
                                <div className="relative w-full h-full p-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                                </div>
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

                    {/* Submit Button */}
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
