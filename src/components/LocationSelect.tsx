'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { projectsApi } from '@/lib/api/projects.api';
import { developersApi } from '@/lib/api/developer.api';
import { formatLocationName, normalizeLocationList } from '@/lib/locationUtils';

interface LocationSelectProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export default function LocationSelect({
    value,
    onChange,
    placeholder = 'e.g. New Cairo',
    required = false,
    className = '',
}: LocationSelectProps) {
    const [options, setOptions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchLocations() {
            try {
                setLoading(true);
                const [projectsData, developersData] = await Promise.all([
                    projectsApi.list().catch(() => []),
                    developersApi.list().catch(() => []),
                ]);

                const pList: any[] = Array.isArray(projectsData) ? projectsData : [];
                const dList: any[] = Array.isArray(developersData) ? developersData : [];

                const rawLocations: string[] = [
                    ...pList.map((p) => p.location),
                    ...dList.map((d) => d.location),
                    // Default popular locations in Egypt real estate
                    'New Cairo',
                    'Maadi',
                    'North Coast',
                    'New Capital',
                    '6th of October',
                    'Sheikh Zayed',
                    'Mostakbal City',
                    'Ain Sokhna',
                    'El Gouna',
                ];

                const normalized = normalizeLocationList(rawLocations);
                if (isMounted) {
                    setOptions(normalized);
                }
            } catch (err) {
                console.error('Error loading location options:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchLocations();

        return () => {
            isMounted = false;
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    const handleBlur = () => {
        if (value) {
            const formatted = formatLocationName(value);
            onChange(formatted);
        }
    };

    const handleSelectOption = (opt: string) => {
        const formatted = formatLocationName(opt);
        onChange(formatted);
        setIsOpen(false);
    };

    const filteredOptions = options.filter((opt) =>
        opt.toLowerCase().includes((value || '').toLowerCase())
    );

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    className="w-full h-12 bg-black border border-zinc-700 rounded-xl pl-10 pr-10 text-white focus:border-red-500 focus:outline-none transition-colors"
                />
                <MapPin className="w-5 h-5 text-gray-500 absolute left-3 pointer-events-none" />
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="absolute right-3 p-1 text-gray-400 hover:text-white transition-colors"
                >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl divide-y divide-zinc-800">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <button
                                key={opt}
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur before click registers
                                    handleSelectOption(opt);
                                }}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-red-600/20 hover:text-red-400 transition-colors ${
                                    value.trim().toLowerCase() === opt.toLowerCase()
                                        ? 'bg-red-600/10 text-red-500 font-semibold'
                                        : 'text-gray-200'
                                }`}
                            >
                                <span>{opt}</span>
                                {value.trim().toLowerCase() === opt.toLowerCase() && (
                                    <span className="text-xs bg-red-600/30 text-red-400 px-2 py-0.5 rounded-full">
                                        Selected
                                    </span>
                                )}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-400 text-center">
                            No matching registered locations.{' '}
                            <span className="text-gray-300 font-semibold">"{value}"</span> will be added as new location.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
