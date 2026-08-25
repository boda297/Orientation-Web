'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, ArrowUpRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { projectsApi } from '@/lib/api/projects.api';
import { formatLocationName, PREDEFINED_AREAS } from '@/lib/locationUtils';

interface Area {
  name: string;
  count?: number;
}

export default function AreasPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoading(true);
        
        // Fetch projects and developers to extract unique locations
        const [allProjects] = await Promise.all([
          projectsApi.list().catch(() => []),
        ]);
        
        let projectsData: any[] = [];
        if (Array.isArray(allProjects)) {
          projectsData = allProjects;
        } else if (allProjects && typeof allProjects === 'object') {
          projectsData = (allProjects as any).data || (allProjects as any).projects || (allProjects as any).results || [];
        }
        
        const locationMap = new Map<string, number>();

        // Prepopulate with default predefined areas
        PREDEFINED_AREAS.forEach((area) => {
          locationMap.set(area, 0);
        });

        // Process projects
        projectsData.forEach((project: any) => {
          if (project && project.location) {
            const formattedLoc = formatLocationName(project.location);
            if (formattedLoc) {
              locationMap.set(formattedLoc, (locationMap.get(formattedLoc) || 0) + 1);
            }
          }
        });

        // Convert to array and sort
        const areasList: Area[] = Array.from(locationMap.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setAreas(areasList);
      } catch (error) {
        console.error('Error fetching areas:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-red-600 selection:text-white">
      <Header />
      <main className="pt-20 md:pt-24 pb-16">
        <section className="py-8 md:py-12 bg-black relative">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />

          <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-zinc-800/80 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-red-500 font-bold mb-1 block">
                  Explore Destinations
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                  Areas & Locations
                </h1>
              </div>
              <p className="text-gray-400 text-sm md:text-base font-medium">
                Results <span className="text-red-500 font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{areas.length} Areas</span>
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="h-44 bg-zinc-900/60 border border-zinc-800 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {areas.map((area, idx) => (
                  <Link
                    key={area.name}
                    href={`/areas/${encodeURIComponent(area.name)}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="group relative overflow-hidden bg-zinc-950/80 hover:bg-zinc-900/90 border border-zinc-800/90 hover:border-red-500/60 rounded-2xl p-6 h-44 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_12px_35px_rgba(239,68,68,0.25)] animate-in fade-in slide-in-from-bottom-4"
                  >
                    {/* Glowing Ambient Background on Hover */}
                    <div className="absolute -inset-px bg-gradient-to-br from-red-600/25 via-rose-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

                    {/* Sweeping Metallic Light Beam Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                    {/* Top Row: Icon & Arrow Indicator */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-red-500 group-hover:bg-red-600 group-hover:border-red-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-inner">
                        <MapPin className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-red-600/30 group-hover:border-red-500/50 transition-all duration-300">
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Title & Count Details */}
                    <div className="relative z-10 mt-auto">
                      <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-red-400 transition-colors duration-300 tracking-wide line-clamp-1">
                        {area.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs font-semibold text-gray-400 group-hover:text-gray-200 transition-colors">
                          {area.count && area.count > 0 ? `${area.count} ${area.count === 1 ? 'Project' : 'Projects'}` : 'Explore Region'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
