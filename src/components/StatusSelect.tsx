'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Activity } from 'lucide-react';

export type ProjectStatus = 'PLANNING' | 'CONSTRUCTION' | 'COMPLETED' | 'DELIVERED';

interface StatusSelectProps {
    value: string;
    onChange: (status: ProjectStatus) => void;
    className?: string;
}

const STATUS_OPTIONS: { label: ProjectStatus; color: string; badgeCls: string }[] = [
    {
        label: 'PLANNING',
        color: '#3b82f6',
        badgeCls: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
        label: 'CONSTRUCTION',
        color: '#f59e0b',
        badgeCls: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    },
    {
        label: 'COMPLETED',
        color: '#10b981',
        badgeCls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
        label: 'DELIVERED',
        color: '#a855f7',
        badgeCls: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    },
];

export default function StatusSelect({ value, onChange, className = '' }: StatusSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentOption = STATUS_OPTIONS.find((opt) => opt.label === value) || STATUS_OPTIONS[0];

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full h-12 bg-black border border-zinc-700 hover:border-red-500 rounded-xl px-4 flex items-center justify-between transition-colors focus:outline-none focus:border-red-500"
            >
                <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-red-500" />
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentOption.badgeCls}`}>
                        {currentOption.label}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                    {STATUS_OPTIONS.map((opt) => {
                        const isSelected = value === opt.label;
                        return (
                            <button
                                key={opt.label}
                                type="button"
                                onClick={() => {
                                    onChange(opt.label);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-zinc-800 transition-colors ${
                                    isSelected ? 'bg-zinc-800/80 font-semibold' : ''
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${opt.badgeCls}`}>
                                        {opt.label}
                                    </span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-red-500" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
