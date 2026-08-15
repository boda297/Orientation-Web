'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { developersApi } from '@/lib/dashboardApi';
import { formatLocationName, PREDEFINED_AREAS } from '@/lib/locationUtils';

interface Area {
  name: string;
  count?: number;
}

export default function DiscoverAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);

        const [allProjects, allDevelopers] = await Promise.all([
          api.getProjects().catch(() => []),
          developersApi.list().catch(() => []),
        ]);

        let projectsData: any[] = [];
        if (Array.isArray(allProjects)) {
          projectsData = allProjects;
        } else if (allProjects && typeof allProjects === 'object') {
          projectsData = (allProjects as any).data || (allProjects as any).projects || (allProjects as any).results || [];
        }

        let developersData: any[] = Array.isArray(allDevelopers) ? allDevelopers : [];

        const locationMap = new Map<string, number>();

        // Always include predefined areas
        PREDEFINED_AREAS.forEach((area) => {
          locationMap.set(area, 0);
        });

        // Add from projects
        projectsData.forEach((p) => {
          if (p && p.location) {
            const formatted = formatLocationName(p.location);
            if (formatted) {
              locationMap.set(formatted, (locationMap.get(formatted) || 0) + 1);
            }
          }
        });

        // Add from developers
        developersData.forEach((d) => {
          if (d && d.location) {
            const formatted = formatLocationName(d.location);
            if (formatted && !locationMap.has(formatted)) {
              locationMap.set(formatted, 0);
            }
          }
        });

        const list: Area[] = Array.from(locationMap.entries()).map(([name, count]) => ({
          name,
          count,
        }));

        setAreas(list);
      } catch (error) {
        console.error('Error fetching discover areas:', error);
        // Fallback to predefined areas
        setAreas(PREDEFINED_AREAS.map((name) => ({ name, count: 0 })));
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return (
    <section className="py-6 bg-black w-full overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Discover Areas
          </h2>
          <Link
            href="/areas"
            className="text-red-600 hover:text-red-500 font-medium text-sm md:text-base transition-colors"
          >
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-11 w-32 bg-zinc-900/80 border border-zinc-800 animate-pulse rounded-full flex-shrink-0"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto py-3 px-1 scrollbar-hide scroll-smooth">
            {areas.map((area, idx) => (
              <Link
                key={area.name}
                href={`/areas/${encodeURIComponent(area.name)}`}
                style={{ animationDelay: `${idx * 40}ms` }}
                className="relative overflow-hidden group flex-shrink-0 bg-zinc-900/90 hover:bg-red-600 text-white text-sm md:text-base font-semibold px-6 py-2.5 rounded-full transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(239,68,68,0.35)] border border-zinc-800 hover:border-red-500 flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
              >
                {/* Glow Backdrop */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Sweeping Light Highlight */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />

                {/* Text & Icon */}
                <span className="relative z-10 whitespace-nowrap group-hover:scale-105 transition-transform duration-300">
                  {area.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
