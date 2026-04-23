'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

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
        console.log('Fetching areas...');

        // Fetch all projects to extract unique locations
        const allProjects = await api.getProjects();
        console.log('Fetched projects for areas:', allProjects);

        let projectsData = allProjects;
        if (allProjects && typeof allProjects === 'object' && !Array.isArray(allProjects)) {
          if (Array.isArray(allProjects.data)) {
            projectsData = allProjects.data;
          } else if (Array.isArray(allProjects.projects)) {
            projectsData = allProjects.projects;
          } else if (Array.isArray(allProjects.results)) {
            projectsData = allProjects.results;
          }
        }

        if (Array.isArray(projectsData)) {
          // Extract unique locations and count projects per location
          const locationMap = new Map<string, number>();
          projectsData.forEach((project: any) => {
            if (project.location && project.published === true) {
              const location = project.location.trim();
              locationMap.set(location, (locationMap.get(location) || 0) + 1);
            }
          });

          // Convert to array and sort
          const areasList: Area[] = Array.from(locationMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name));

          setAreas(areasList);
          console.log(`Set ${areasList.length} areas`);
        } else {
          setAreas([]);
        }
      } catch (error) {
        console.error('Error fetching areas:', error);
        setAreas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  if (loading) {
    return (
      <section className="py-4 md:py-6 bg-black">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Discover Areas</h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (areas.length === 0) {
    return null;
  }

  return (
    <section className="py-4 md:py-6 bg-black w-full overflow-hidden">
      <div className="w-full px-4 md:px-6">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">Discover Areas</h2>
          <Link
            href="/areas"
            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-2 transition-colors group"
          >
            View All
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
          style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', paddingLeft: 'calc(50vw - 50%)', paddingRight: 'calc(50vw - 50%)' }}
        >
          {areas.map((area, index) => (
            <Link
              key={area.name}
              href={`/areas/${encodeURIComponent(area.name)}`}
              className={`flex-shrink-0 bg-gray-800 hover:bg-red-600 rounded-lg px-6 py-4 md:px-8 md:py-5 transition-all duration-300 cursor-pointer group relative overflow-hidden ${index === 0 ? 'ml-4 md:ml-6' : ''
                } ${index === areas.length - 1 ? 'mr-4 md:mr-6' : ''}`}
            >
              {/* Hover Effect Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Shine Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              {/* Text */}
              <span className="relative z-10 text-white font-semibold text-base md:text-lg whitespace-nowrap group-hover:scale-105 transition-transform duration-300">
                {area.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
