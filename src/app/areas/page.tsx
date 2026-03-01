'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { api } from '@/lib/api';

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
        console.log('Fetching all areas...');
        
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
            if (project.location) {
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

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-16 md:pt-20">
        <section className="py-8 md:py-12 bg-black">
          <div className="max-w-[1600px] mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Areas</h1>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-6 md:mb-8">
                  Results <span className="text-red-600 font-semibold">({areas.length} Areas)</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {areas.map((area) => (
                    <Link
                      key={area.name}
                      href={`/areas/${encodeURIComponent(area.name)}`}
                      className="bg-gray-800 hover:bg-gray-700 rounded-lg px-6 py-4 md:px-8 md:py-5 transition-colors cursor-pointer text-center"
                    >
                      <span className="text-white font-semibold text-base md:text-lg">
                        {area.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
