'use client';

import { useState, useRef, useEffect, use } from 'react';
import {
    ChevronLeft, Loader2, CheckCircle2, AlertCircle,
    PencilLine, Trash2, Plus, Pencil, Film, FileText,
    Image as ImageIcon, Video, File, Package, BookOpen,
    ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { getApiUrl, getFileUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';

interface Developer { _id: string; name: string; }
interface Episode {
    _id: string; title: string; episodeOrder?: string | number;
    duration?: string; thumbnail?: string | null; episodeUrl?: string;
}
interface Reel { _id: string; title: string; thumbnail?: string; fileUrl?: string; }
interface Inventory { _id: string; title: string; fileUrl?: string; }
interface Pdf { _id: string; title: string; fileUrl?: string; pdfUrl?: string; }
interface Project {
    _id: string; title: string; location?: string; whatsappNumber?: string;
    script?: string; status?: string; featured?: boolean; published?: boolean;
    logoUrl?: string; heroVideoUrl?: string; projectThumbnailUrl?: string;
    developer?: { _id: string; name: string; };
    episodes?: Episode[]; reels?: Reel[]; inventory?: Inventory; pdf?: Pdf[];
}

function Banner({ type, msg, onClose }: { type: 'success' | 'error'; msg: string; onClose: () => void }) {
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-6 border ${type === 'success'
            ? 'bg-green-500/20 border-green-500 text-green-300'
            : 'bg-red-500/20 border-red-500 text-red-300'}`}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="flex-1 text-sm">{msg}</span>
            <button onClick={onClose} className="text-current opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
    );
}

// FileZone with real image/video preview
function FileZone({
    label, icon: Icon, accept, file, existingUrl, onChange, required
}: {
    label: string; icon: React.ElementType; accept: string;
    file: File | null; existingUrl?: string | null; onChange: (f: File | null) => void; required?: boolean;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const hasExisting = !file && !!existingUrl;
    const hasNew = !!file;

    const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!file) { setNewPreviewUrl(null); return; }
        const url = URL.createObjectURL(file);
        setNewPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const isImage = accept.includes('image');
    const isVideo = accept.includes('video');

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        if (dropped) onChange(dropped);
    };

    const previewUrl = hasNew ? newPreviewUrl : hasExisting ? getFileUrl(existingUrl as string) : null;
    const showPreview = !!previewUrl;

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
                {hasExisting && <span className="ml-2 text-xs text-yellow-400 font-normal">Current file &mdash; click to replace</span>}
            </label>
            <div
                onClick={() => ref.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl h-36 cursor-pointer transition-colors overflow-hidden ${
                    hasNew ? 'border-red-500' : hasExisting ? 'border-yellow-500/60' : 'border-zinc-700 bg-black hover:border-red-500 hover:bg-zinc-900/50'
                }`}
            >
                <input
                    ref={ref} type="file" accept={accept} className="hidden"
                    onChange={e => onChange(e.target.files?.[0] ?? null)}
                />

                {showPreview && isImage && (
                    <img src={previewUrl!} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                )}
                {showPreview && isVideo && (
                    <video src={previewUrl!} className="absolute inset-0 w-full h-full object-cover" muted playsInline preload="metadata" />
                )}
                {showPreview && !isImage && !isVideo && (
                    <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                        <Icon className="w-10 h-10 text-zinc-400" />
                    </div>
                )}

                {showPreview && (
                    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-1">
                        <Icon className="w-5 h-5 text-white/80" />
                        <p className="text-white/70 text-xs font-medium px-4 text-center line-clamp-2">
                            {hasNew ? file!.name : 'Click or drag to replace'}
                        </p>
                    </div>
                )}

                {hasExisting && (
                    <span className="absolute top-2 right-2 text-xs bg-yellow-500 text-black font-bold px-2 py-0.5 rounded-full z-10">
                        Replace
                    </span>
                )}
                {hasNew && (
                    <span className="absolute top-2 right-2 text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full z-10">
                        New
                    </span>
                )}

                {!showPreview && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Icon className="w-6 h-6 mb-2 text-gray-400" />
                        <p className="text-gray-300 text-sm text-center px-4">Upload {label}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const inputCls = "w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors";
const textareaCls = "w-full h-40 bg-black border border-zinc-700 rounded-xl p-4 text-white focus:border-red-500 focus:outline-none transition-colors resize-none";
const selectCls = "w-full h-12 bg-black border border-zinc-700 rounded-xl px-4 text-white focus:border-red-500 focus:outline-none transition-colors appearance-none";

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between bg-black border border-zinc-700 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-300">{label}</span>
            <button type="button" onClick={() => onChange(!checked)}
                className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-red-500' : 'bg-zinc-700'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
    return (
        <button type="submit" disabled={loading}
            className="mt-4 w-full md:w-auto self-end px-8 h-12 bg-[#ff0000] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 text-lg">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : label}
        </button>
    );
}

export default function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const TABS = ['Project Details', 'Episodes', 'Reels', 'Inventory', 'PDFs'];
    const [activeTab, setActiveTab] = useState('Project Details');
    const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

    useEffect(() => {
        const idx = TABS.indexOf(activeTab);
        const btn = tabsRef.current[idx];
        if (btn) setIndicatorStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }, [activeTab]);

    const [project, setProject] = useState<Project | null>(null);
    const [loadingProject, setLoadingProject] = useState(true);
    const [developers, setDevelopers] = useState<Developer[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const [projRes, devRes] = await Promise.all([
                    fetch(getApiUrl(`/projects/${id}`)),
                    fetch(getApiUrl('/developers'))
                ]);
                if (projRes.ok) { const data = await projRes.json(); setProject(data); }
                if (devRes.ok) {
                    const data = await devRes.json();
                    setDevelopers(Array.isArray(data) ? data : (data.developers || data.data || []));
                }
            } catch (err) { console.error(err); } finally { setLoadingProject(false); }
        };
        load();
    }, [id]);

    if (loadingProject) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-10 h-10 animate-spin text-red-500" />
        </div>
    );

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <p className="text-gray-400">Project not found.</p>
            <Link href="/dashboard/project" className="text-red-500 hover:underline">Back to Projects</Link>
        </div>
    );

    return (
        <div className="animate-in fade-in duration-500 max-w-5xl mx-auto space-y-6">
            <Link href="/dashboard/project" className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors w-max">
                <ChevronLeft className="w-5 h-5 mr-1" /> Back to Projects
            </Link>
            <div className="flex items-center gap-3">
                <PencilLine className="w-8 h-8 text-red-500" />
                <h1 className="text-3xl font-bold text-white">Edit Project</h1>
                <span className="ml-2 text-gray-500 text-xl font-normal truncate max-w-xs">{project.title}</span>
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="relative flex gap-1 border-b border-zinc-800 px-4 overflow-x-auto scrollbar-hide">
                    <div className="absolute bottom-0 h-[2px] bg-red-500 transition-all duration-300 ease-in-out"
                        style={{ left: `${indicatorStyle.left}px`, width: `${indicatorStyle.width}px` }} />
                    {TABS.map((tab, idx) => (
                        <button key={tab} ref={el => { tabsRef.current[idx] = el; }} onClick={() => setActiveTab(tab)}
                            className={`py-4 px-3 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'text-red-500' : 'text-gray-400 hover:text-gray-200'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="p-6 md:p-8">
                    {activeTab === 'Project Details' && <ProjectDetailsTab project={project} developers={developers} id={id} onUpdate={setProject} />}
                    {activeTab === 'Episodes' && <EpisodesTab project={project} id={id} onUpdate={setProject} />}
                    {activeTab === 'Reels' && <ReelsTab project={project} id={id} onUpdate={setProject} />}
                    {activeTab === 'Inventory' && <InventoryTab project={project} id={id} onUpdate={setProject} />}
                    {activeTab === 'PDFs' && <PdfsTab project={project} id={id} onUpdate={setProject} />}
                </div>
            </div>
        </div>
    );
}

function ProjectDetailsTab({ project, developers, id, onUpdate }: {
    project: Project; developers: Developer[]; id: string; onUpdate: (p: Project) => void;
}) {
    const [title, setTitle] = useState(project.title || '');
    const [developerId, setDeveloperId] = useState(
        typeof project.developer === 'object' ? project.developer?._id ?? '' : (project.developer as any) || ''
    );
    const [location, setLocation] = useState(project.location || '');
    const [whatsapp, setWhatsapp] = useState(project.whatsappNumber || '');
    const [status, setStatus] = useState(project.status || '');
    const [script, setScript] = useState(project.script || '');
    const [featured, setFeatured] = useState(project.featured ?? false);
    const [published, setPublished] = useState(project.published ?? false);
    const [logo, setLogo] = useState<File | null>(null);
    const [heroVideo, setHeroVideo] = useState<File | null>(null);
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setBanner(null);
        try {
            const fd = new FormData();
            fd.append('title', title);
            if (developerId) fd.append('developer', developerId);
            if (location) fd.append('location', location);
            if (whatsapp) fd.append('whatsappNumber', whatsapp);
            if (status) fd.append('status', status);
            if (script) fd.append('script', script);
            fd.append('featured', String(featured));
            fd.append('published', String(published));
            if (logo) fd.append('logoUrl', logo);
            if (heroVideo) fd.append('videoUrl', heroVideo);
            if (thumbnail) fd.append('projectThumbnailUrl', thumbnail);
            const token = getAccessToken();
            const res = await fetch(getApiUrl(`/projects/${id}`), {
                method: 'PATCH', headers: { Authorization: `Bearer ${token}` }, body: fd,
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.message || 'Failed to update project');
            }
            const updated = await res.json();
            onUpdate(updated);
            setBanner({ type: 'success', msg: 'Project updated successfully!' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setBanner({ type: 'error', msg: err.message || 'Something went wrong' });
        } finally { setLoading(false); }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {banner && <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner(null)} />}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Basic Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Project Title <span className="text-red-500">*</span></label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className={inputCls} placeholder="e.g. Zia" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Developer</label>
                        <select value={developerId} onChange={e => setDeveloperId(e.target.value)} className={selectCls}>
                            <option value="">Select Developer</option>
                            {developers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Location</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className={inputCls} placeholder="e.g. New Cairo" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">WhatsApp Number</label>
                        <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputCls} placeholder="+201000000000" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}>
                            <option value="">Select Status</option>
                            {['PLANNING','CONSTRUCTION','COMPLETED','DELIVERED'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Visibility</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle label="Featured" checked={featured} onChange={setFeatured} />
                    <Toggle label="Published" checked={published} onChange={setPublished} />
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Media Files</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FileZone label="Logo" icon={ImageIcon} accept="image/*" file={logo} existingUrl={project.logoUrl} onChange={setLogo} />
                    <FileZone label="Hero Video" icon={Video} accept="video/*" file={heroVideo} existingUrl={project.heroVideoUrl} onChange={setHeroVideo} />
                    <FileZone label="Project Thumbnail" icon={ImageIcon} accept="image/*" file={thumbnail} existingUrl={project.projectThumbnailUrl} onChange={setThumbnail} />
                </div>
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white border-b border-zinc-800 pb-2">Project Script</h2>
                <textarea value={script} onChange={e => setScript(e.target.value)} className={textareaCls} placeholder="Write the project script or detailed description here..." />
            </div>
            <SubmitBtn loading={loading} label="Save Changes" />
        </form>
    );
}

function EpisodesTab({ project, id, onUpdate }: { project: Project; id: string; onUpdate: (p: Project) => void }) {
    const [episodes, setEpisodes] = useState<Episode[]>(project.episodes || []);
    const [showForm, setShowForm] = useState(false);
    const [editingEp, setEditingEp] = useState<Episode | null>(null);
    const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [epTitle, setEpTitle] = useState('');
    const [epOrder, setEpOrder] = useState('');
    const [epDuration, setEpDuration] = useState('');
    const [epThumb, setEpThumb] = useState<File | null>(null);
    const [epVideo, setEpVideo] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const openAdd = () => { setEditingEp(null); setEpTitle(''); setEpOrder(''); setEpDuration(''); setEpThumb(null); setEpVideo(null); setShowForm(true); };
    const openEdit = (ep: Episode) => { setEditingEp(ep); setEpTitle(ep.title||''); setEpOrder(String(ep.episodeOrder??'')); setEpDuration(String(ep.duration??'')); setEpThumb(null); setEpVideo(null); setShowForm(true); };
    const cancelForm = () => { setShowForm(false); setEditingEp(null); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setBanner(null);
        try {
            const fd = new FormData();
            fd.append('title', epTitle);
            if (epOrder) fd.append('episodeOrder', epOrder);
            if (epDuration) fd.append('duration', epDuration);
            if (!editingEp) fd.append('projectId', id);
            if (epThumb) fd.append('thumbnail', epThumb);
            if (epVideo) fd.append('episodeUrl', epVideo);
            const token = getAccessToken();
            const url = editingEp ? getApiUrl(`/episode/${editingEp._id}`) : getApiUrl('/episode');
            const res = await fetch(url, { method: editingEp ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) { const err = await res.json().catch(()=>null); throw new Error(err?.message||'Failed to save episode'); }
            const saved: Episode = await res.json();
            if (editingEp) { setEpisodes(prev => prev.map(ep => ep._id === saved._id ? saved : ep)); setBanner({type:'success',msg:'Episode updated!'}); }
            else { setEpisodes(prev=>[...prev,saved]); setBanner({type:'success',msg:'Episode added!'}); }
            cancelForm();
        } catch (err: any) { setBanner({type:'error',msg:err.message||'Something went wrong'}); } finally { setSaving(false); }
    };

    const handleDelete = async (epId: string) => {
        if (!window.confirm('Delete this episode?')) return;
        try {
            const token = getAccessToken();
            const res = await fetch(getApiUrl(`/episode/${epId}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete');
            setEpisodes(prev => prev.filter(ep => ep._id !== epId));
            setBanner({type:'success',msg:'Episode deleted.'});
        } catch (err: any) { setBanner({type:'error',msg:err.message}); }
    };

    return (
        <div className="space-y-6">
            {banner && <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner(null)} />}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Film className="w-5 h-5 text-red-500" /> Episodes</h2>
                <button onClick={openAdd} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Plus className="w-4 h-4" /> Add Episode</button>
            </div>
            {episodes.length === 0 ? <p className="text-center text-gray-500 py-8">No episodes yet.</p> : (
                <div className="space-y-3">
                    {episodes.map(ep => (
                        <div key={ep._id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="w-20 h-14 rounded-lg bg-cover bg-center bg-zinc-800 shrink-0"
                                style={{ backgroundImage: (ep.thumbnail ) ? `url(${getFileUrl(ep.thumbnail )})` : undefined }} />
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate">{ep.title}</p>
                                <p className="text-gray-400 text-sm">Order: {ep.episodeOrder} &middot; Duration: {ep.duration }</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => openEdit(ep)} className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(ep._id)} className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showForm && (
                <form onSubmit={handleSave} className="mt-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-lg">{editingEp ? 'Edit Episode' : 'Add Episode'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Title <span className="text-red-500">*</span></label>
                            <input required type="text" value={epTitle} onChange={e => setEpTitle(e.target.value)} className={inputCls} placeholder="Episode title" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Episode Order</label>
                            <input type="number" value={epOrder} onChange={e => setEpOrder(e.target.value)} className={inputCls} placeholder="1" min={1} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-300">Duration (seconds)</label>
                            <input type="number" value={epDuration} onChange={e => setEpDuration(e.target.value)} className={inputCls} placeholder="120" min={0} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileZone label="Thumbnail" icon={ImageIcon} accept="image/*" file={epThumb} existingUrl={editingEp?.thumbnail} onChange={setEpThumb} />
                        <FileZone label="Video File (max 5GB)" icon={Video} accept="video/*" file={epVideo} existingUrl={editingEp?.episodeUrl} onChange={setEpVideo} />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={cancelForm} className="px-5 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}{editingEp ? 'Save Changes' : 'Add Episode'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function ReelsTab({ project, id, onUpdate }: { project: Project; id: string; onUpdate: (p: Project) => void }) {
    const [reels, setReels] = useState<Reel[]>(project.reels || []);
    const [showForm, setShowForm] = useState(false);
    const [editingReel, setEditingReel] = useState<Reel | null>(null);
    const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [reelTitle, setReelTitle] = useState('');
    const [reelVideo, setReelVideo] = useState<File | null>(null);
    const [reelThumb, setReelThumb] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const openAdd = () => { setEditingReel(null); setReelTitle(''); setReelVideo(null); setReelThumb(null); setShowForm(true); };
    const openEdit = (r: Reel) => { setEditingReel(r); setReelTitle(r.title||''); setReelVideo(null); setReelThumb(null); setShowForm(true); };
    const cancelForm = () => { setShowForm(false); setEditingReel(null); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setBanner(null);
        try {
            const fd = new FormData();
            fd.append('title', reelTitle);
            if (!editingReel) fd.append('projectId', id);
            if (reelVideo) fd.append('fileUrl', reelVideo);
            if (reelThumb) fd.append('thumbnail', reelThumb);
            const token = getAccessToken();
            const url = editingReel ? getApiUrl(`/reels/${editingReel._id}`) : getApiUrl('/reels');
            const res = await fetch(url, { method: editingReel ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) { const err = await res.json().catch(()=>null); throw new Error(err?.message||'Failed to save reel'); }
            const saved: Reel = await res.json();
            if (editingReel) { setReels(prev=>prev.map(r=>r._id===saved._id?saved:r)); setBanner({type:'success',msg:'Reel updated!'}); }
            else { setReels(prev=>[...prev,saved]); setBanner({type:'success',msg:'Reel added!'}); }
            cancelForm();
        } catch (err: any) { setBanner({type:'error',msg:err.message||'Something went wrong'}); } finally { setSaving(false); }
    };

    const handleDelete = async (reelId: string) => {
        if (!window.confirm('Delete this reel?')) return;
        try {
            const token = getAccessToken();
            const res = await fetch(getApiUrl(`/reels/${reelId}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete');
            setReels(prev=>prev.filter(r=>r._id!==reelId));
            setBanner({type:'success',msg:'Reel deleted.'});
        } catch (err: any) { setBanner({type:'error',msg:err.message}); }
    };

    return (
        <div className="space-y-6">
            {banner && <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner(null)} />}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Film className="w-5 h-5 text-red-500" /> Reels</h2>
                <button onClick={openAdd} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Plus className="w-4 h-4" /> Add Reel</button>
            </div>
            {reels.length === 0 ? <p className="text-center text-gray-500 py-8">No reels yet.</p> : (
                <div className="space-y-3">
                    {reels.map(r => (
                        <div key={r._id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="w-14 h-20 rounded-lg bg-cover bg-center bg-zinc-800 shrink-0"
                                style={{ backgroundImage: r.thumbnail ? `url(${getFileUrl(r.thumbnail)})` : undefined }} />
                            <div className="flex-1 min-w-0"><p className="text-white font-semibold truncate">{r.title}</p></div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => openEdit(r)} className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(r._id)} className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showForm && (
                <form onSubmit={handleSave} className="mt-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-lg">{editingReel ? 'Edit Reel' : 'Add Reel'}</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Title <span className="text-red-500">*</span></label>
                        <input required type="text" value={reelTitle} onChange={e => setReelTitle(e.target.value)} className={inputCls} placeholder="Reel title" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FileZone label="Video File (max 5GB)" icon={Video} accept="video/*" file={reelVideo} existingUrl={editingReel?.fileUrl} onChange={setReelVideo} />
                        <FileZone label="Thumbnail" icon={ImageIcon} accept="image/*" file={reelThumb} existingUrl={editingReel?.thumbnail} onChange={setReelThumb} />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={cancelForm} className="px-5 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving?<Loader2 className="w-4 h-4 animate-spin"/>:null}{editingReel?'Save Changes':'Add Reel'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function InventoryTab({ project, id, onUpdate }: { project: Project; id: string; onUpdate: (p: Project) => void }) {
    const [inventory, setInventory] = useState<Inventory | null>(project.inventory || null);
    const [showForm, setShowForm] = useState(false);
    const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [invTitle, setInvTitle] = useState('');
    const [invFile, setInvFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const openUpload = () => { setInvTitle(inventory?.title||''); setInvFile(null); setShowForm(true); };
    const cancelForm = () => setShowForm(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setBanner(null);
        try {
            const fd = new FormData();
            fd.append('title', invTitle);
            fd.append('projectId', id);
            if (invFile) fd.append('file', invFile);
            const token = getAccessToken();
            const url = inventory ? getApiUrl(`/files/inventory/${inventory._id}`) : getApiUrl('/files/upload/inventory');
            const res = await fetch(url, { method: inventory?'PATCH':'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) { const err = await res.json().catch(()=>null); throw new Error(err?.message||'Failed to save inventory'); }
            const saved: Inventory = await res.json();
            setInventory(saved);
            setBanner({type:'success',msg:inventory?'Inventory updated!':'Inventory uploaded!'});
            cancelForm();
        } catch (err: any) { setBanner({type:'error',msg:err.message||'Something went wrong'}); } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!inventory || !window.confirm('Delete inventory?')) return;
        try {
            const token = getAccessToken();
            const res = await fetch(getApiUrl(`/files/inventory/${inventory._id}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete');
            setInventory(null);
            setBanner({type:'success',msg:'Inventory deleted.'});
        } catch (err: any) { setBanner({type:'error',msg:err.message}); }
    };

    return (
        <div className="space-y-6">
            {banner && <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner(null)} />}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-red-500" /> Inventory</h2>
                {!showForm && !inventory && (
                    <button onClick={openUpload} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Plus className="w-4 h-4" /> Upload Inventory</button>
                )}
            </div>
            {!inventory && !showForm && <p className="text-center text-gray-500 py-8">No inventory uploaded.</p>}
            {inventory && !showForm && (
                <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                    <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center border border-green-600/20 shrink-0"><Package className="w-6 h-6 text-green-400" /></div>
                    <div className="flex-1 min-w-0"><p className="text-white font-semibold truncate">{inventory.title}</p></div>
                    <div className="flex gap-2 shrink-0">
                        {inventory.fileUrl && <a href={getFileUrl(inventory.fileUrl)} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 hover:bg-green-500/20 hover:text-green-400 text-gray-400 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                        <button onClick={openUpload} className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={handleDelete} className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                </div>
            )}
            {showForm && (
                <form onSubmit={handleSave} className="mt-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-lg">{inventory?'Edit Inventory':'Upload Inventory'}</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Title <span className="text-red-500">*</span></label>
                        <input required type="text" value={invTitle} onChange={e => setInvTitle(e.target.value)} className={inputCls} placeholder="e.g. Unit Inventory Sheet" />
                    </div>
                    <FileZone label="Inventory File" icon={File} accept="*/*" file={invFile} existingUrl={inventory?.fileUrl} onChange={setInvFile} />
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={cancelForm} className="px-5 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving?<Loader2 className="w-4 h-4 animate-spin"/>:null}{inventory?'Save Changes':'Upload'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

function PdfsTab({ project, id, onUpdate }: { project: Project; id: string; onUpdate: (p: Project) => void }) {
    const [pdfs, setPdfs] = useState<Pdf[]>(project.pdf || []);
    const [showForm, setShowForm] = useState(false);
    const [editingPdf, setEditingPdf] = useState<Pdf | null>(null);
    const [banner, setBanner] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [pdfTitle, setPdfTitle] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    const openAdd = () => { setEditingPdf(null); setPdfTitle(''); setPdfFile(null); setShowForm(true); };
    const openEdit = (p: Pdf) => { setEditingPdf(p); setPdfTitle(p.title||''); setPdfFile(null); setShowForm(true); };
    const cancelForm = () => { setShowForm(false); setEditingPdf(null); };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setBanner(null);
        try {
            const fd = new FormData();
            fd.append('title', pdfTitle);
            if (!editingPdf) fd.append('projectId', id);
            if (pdfFile) fd.append('file', pdfFile);
            const token = getAccessToken();
            const url = editingPdf ? getApiUrl(`/files/pdf/${editingPdf._id}`) : getApiUrl('/files/upload/pdf');
            const res = await fetch(url, { method: editingPdf?'PATCH':'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
            if (!res.ok) { const err = await res.json().catch(()=>null); throw new Error(err?.message||'Failed to save PDF'); }
            const saved: Pdf = await res.json();
            if (editingPdf) { setPdfs(prev=>prev.map(p=>p._id===saved._id?saved:p)); setBanner({type:'success',msg:'PDF updated!'}); }
            else { setPdfs(prev=>[...prev,saved]); setBanner({type:'success',msg:'PDF added!'}); }
            cancelForm();
        } catch (err: any) { setBanner({type:'error',msg:err.message||'Something went wrong'}); } finally { setSaving(false); }
    };

    const handleDelete = async (pdfId: string) => {
        if (!window.confirm('Delete this PDF?')) return;
        try {
            const token = getAccessToken();
            const res = await fetch(getApiUrl(`/files/pdf/${pdfId}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) throw new Error('Failed to delete');
            setPdfs(prev=>prev.filter(p=>p._id!==pdfId));
            setBanner({type:'success',msg:'PDF deleted.'});
        } catch (err: any) { setBanner({type:'error',msg:err.message}); }
    };

    return (
        <div className="space-y-6">
            {banner && <Banner type={banner.type} msg={banner.msg} onClose={() => setBanner(null)} />}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-red-500" /> PDFs</h2>
                <button onClick={openAdd} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"><Plus className="w-4 h-4" /> Add PDF</button>
            </div>
            {pdfs.length === 0 ? <p className="text-center text-gray-500 py-8">No PDFs yet.</p> : (
                <div className="space-y-3">
                    {pdfs.map(p => (
                        <div key={p._id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <div className="w-12 h-12 rounded-lg bg-red-600/10 flex items-center justify-center border border-red-600/20 shrink-0"><FileText className="w-6 h-6 text-red-400" /></div>
                            <div className="flex-1 min-w-0"><p className="text-white font-semibold truncate">{p.title}</p></div>
                            <div className="flex gap-2 shrink-0">
                                {(p.fileUrl||p.pdfUrl) && <a href={getFileUrl(p.fileUrl||p.pdfUrl)} target="_blank" rel="noreferrer" className="p-2 bg-zinc-800 hover:bg-blue-500/20 hover:text-blue-400 text-gray-400 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></a>}
                                <button onClick={() => openEdit(p)} className="p-2 bg-zinc-800 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(p._id)} className="p-2 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-gray-400 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showForm && (
                <form onSubmit={handleSave} className="mt-4 bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-lg">{editingPdf?'Edit PDF':'Add PDF'}</h3>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-300">Title <span className="text-red-500">*</span></label>
                        <input required type="text" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} className={inputCls} placeholder="e.g. Floor Plans" />
                    </div>
                    <FileZone label="PDF File" icon={FileText} accept="application/pdf" file={pdfFile} existingUrl={editingPdf?.fileUrl||editingPdf?.pdfUrl} onChange={setPdfFile} />
                    <div className="flex gap-3 justify-end">
                        <button type="button" onClick={cancelForm} className="px-5 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-gray-300 text-sm font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50">
                            {saving?<Loader2 className="w-4 h-4 animate-spin"/>:null}{editingPdf?'Save Changes':'Add PDF'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
