'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api, getFileUrl } from '@/lib/api';

interface Project {
  _id: string;
  title: string;
  location?: string;
  projectThumbnailUrl?: string;
  developer?: {
    name: string;
  };
}

interface ProjectsByAreaProps {
  title: string;
  location: string; // Location name to fetch from API
}

export default function ProjectsByArea({ title, location }: ProjectsByAreaProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log(`Fetching projects for location: "${location}"`);

        // Try multiple location name variations
        const locationVariations = [
          location,
          location.replace(/([A-Z])/g, ' $1').trim(), // "Northcoast" -> "Northcoast", "North Coast"
          location.toLowerCase(),
          location.toUpperCase(),
        ];

        // Remove duplicates
        const uniqueVariations = [...new Set(locationVariations)];

        let data: any = [];

        // Try each variation with the location endpoint
        for (const variation of uniqueVariations) {
          try {
            const response = await api.getProjectsByLocation(variation);
            console.log(`Received data from location endpoint for "${variation}":`, response);

            let responseData = response;
            // Handle if response is an object with a data/projects array
            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
              if (Array.isArray(responseData.data)) {
                responseData = responseData.data;
              } else if (Array.isArray(responseData.projects)) {
                responseData = responseData.projects;
              } else if (Array.isArray(responseData.results)) {
                responseData = responseData.results;
              }
            }

            if (Array.isArray(responseData) && responseData.length > 0) {
              data = responseData;
              console.log(`Found ${data.length} projects using variation "${variation}"`);
              break; // Found projects, stop trying other variations
            }
          } catch (error) {
            // Continue to next variation
            console.log(`Variation "${variation}" failed, trying next...`);
          }
        }

        // If no data found from location endpoint, fetch all and filter
        if (!Array.isArray(data) || data.length === 0) {
          console.log(`Location endpoint didn't return data, fetching all projects and filtering...`);
          try {
            let allProjects = await api.getProjects();
            console.log(`Fetched all projects response:`, allProjects);

            // Handle if response is an object with a data/projects array
            if (allProjects && typeof allProjects === 'object' && !Array.isArray(allProjects)) {
              if (Array.isArray(allProjects.data)) {
                allProjects = allProjects.data;
              } else if (Array.isArray(allProjects.projects)) {
                allProjects = allProjects.projects;
              } else if (Array.isArray(allProjects.results)) {
                allProjects = allProjects.results;
              }
            }

            if (Array.isArray(allProjects)) {
              console.log(`Total projects to filter: ${allProjects.length}`);

              // Log all unique locations for debugging
              const uniqueLocations = [...new Set(allProjects.map((p: Project) => p.location).filter(Boolean))];
              console.log(`Available locations in API:`, uniqueLocations);

              // Filter projects by location (case-insensitive, partial match, try all variations)
              const locationLower = location.toLowerCase();
              data = allProjects.filter((project: Project) => {
                const projectLocation = project.location?.toLowerCase() || '';
                // Try exact match, contains, or partial match
                return (
                  projectLocation === locationLower ||
                  projectLocation.includes(locationLower) ||
                  locationLower.includes(projectLocation) ||
                  projectLocation.replace(/\s+/g, '') === locationLower.replace(/\s+/g, '') // Remove spaces and compare
                );
              });
              console.log(`Filtered ${data.length} projects for "${location}" from ${allProjects.length} total projects`);
            } else {
              data = [];
            }
          } catch (filterError) {
            console.error(`Error filtering projects:`, filterError);
            data = [];
          }
        }

        if (Array.isArray(data)) {
          setProjects(data);
          console.log(`✅ Set ${data.length} projects for ${location}`);
        } else {
          console.warn(`Data is not an array for ${location}:`, data);
          setProjects([]);
        }
      } catch (error) {
        console.error(`Error fetching projects for ${location}:`, error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchProjects();
    }
  }, [location]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollContainerRef.current?.offsetLeft || 0));
    setScrollLeft(scrollContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <section className="py-4 md:py-6 bg-black">
        <div className="max-w-[1600px] mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{title}</h2>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-6 bg-black">
      <div className="max-w-[1600px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">{title}</h2>
        {projects.length > 0 ? (
          <div
            ref={scrollContainerRef}
            className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {projects.map((project) => (
              <Link
                key={project._id}
                href={`/project/${project._id}`}
                onClick={(e) => isDragging && e.preventDefault()}
                className="flex-shrink-0 w-72 sm:w-80 md:w-96 group relative"
              >
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-3">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                    style={{
                      backgroundImage: project.projectThumbnailUrl
                        ? `url(${getFileUrl(project.projectThumbnailUrl)})`
                        : 'none',
                      backgroundColor: '#1f2937'
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />
                  {/* Play Button - Minimal Transparent */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-black/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-white/20 group-hover:border-white transition-all duration-300">
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">{project.title}</h3>
                {project.location && (
                  <p className="text-gray-300 text-sm mb-2">{project.location}</p>
                )}
                {project.developer?.name && (
                  <p className="text-gray-500 text-xs mt-2">{project.developer.name}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <p>No projects available in this area</p>
          </div>
        )}
      </div>
    </section>
  );
}
