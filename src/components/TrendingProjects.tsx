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

export default function TrendingProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProjects = async () => {
      try {
        setLoading(true);
        console.log('Fetching trending projects...');
        const data = await api.getTrendingProjects(10);
        console.log('Received trending projects:', data);

        // Handle if response is an object with a data/projects array
        let projectsData = data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (Array.isArray(data.data)) {
            projectsData = data.data;
          } else if (Array.isArray(data.projects)) {
            projectsData = data.projects;
          } else if (Array.isArray(data.results)) {
            projectsData = data.results;
          }
        }

        if (Array.isArray(projectsData)) {
          // Limit to 10 projects
          const publishedProjects = projectsData.filter((p: any) => p.published === true);
          setProjects(publishedProjects.slice(0, 10));
          console.log(`Set ${Math.min(publishedProjects.length, 10)} trending projects`);
        } else {
          console.warn('Trending projects data is not an array:', projectsData);
          setProjects([]);
        }
      } catch (error) {
        console.error('Error fetching trending projects:', error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProjects();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || projects.length === 0) return;

    let intervalId: NodeJS.Timeout;
    let isHovered = false;

    const handleMouseEnter = () => isHovered = true;
    const handleMouseLeave = () => {
      isHovered = false;
      setIsDragging(false);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    const autoScroll = () => {
      if (!isHovered && !isDragging && container) {
        const firstChild = container.children[0] as HTMLElement;
        const scrollAmount = firstChild ? firstChild.offsetWidth + 24 : 300;

        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          // Rewind smoothly to the start
          container.style.scrollBehavior = 'smooth';
          container.scrollLeft = 0;
        } else {
          container.style.scrollBehavior = 'smooth';
          container.scrollLeft += scrollAmount;
        }
      }
    };

    intervalId = setInterval(autoScroll, 3000);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      clearInterval(intervalId);
      if (container) container.style.scrollBehavior = 'auto';
    };
  }, [projects.length, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.scrollBehavior = 'auto';
      setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
      setScrollLeft(scrollContainerRef.current.scrollLeft);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <section className="py-4 md:py-6 bg-black w-full overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 pl-4 md:pl-6">Top 10</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return null;
  }

  return (
    <section className="py-4 md:py-6 bg-black w-full overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 pl-4 md:pl-6">Top 10</h2>
      <div
        ref={scrollContainerRef}
        className={`flex gap-4 md:gap-6 overflow-x-auto pb-12 md:pb-16 pt-2 scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {projects.map((project, index) => {
          const rank = index + 1;
          return (
            <Link
              key={project._id}
              href={`/project/${project._id}`}
              onClick={(e) => isDragging && e.preventDefault()}
              className={`flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72 group relative ${index === 0 ? 'pl-4 md:pl-6' : ''} ${index === projects.length - 1 ? 'pr-4 md:pr-6' : ''}`}
            >
              <div className="relative aspect-[4/5] bg-gray-800 overflow-hidden rounded-lg">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{
                    backgroundImage: project.projectThumbnailUrl
                      ? `url(${getFileUrl(project.projectThumbnailUrl)})`
                      : 'none',
                    backgroundColor: '#1f2937'
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/50 group-hover:to-black/10 transition-all duration-500" />

                {/* Play Button - Minimal Transparent */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 z-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-black/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-white/20 group-hover:border-white transition-all duration-300">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                </div>

                {/* Content - Slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out bg-gradient-to-t from-black via-black/95 to-transparent">
                  <h3 className="text-white font-bold text-lg md:text-xl mb-2">{project.title}</h3>
                  {project.location && (
                    <p className="text-gray-200 text-xs md:text-sm mb-2 font-semibold">{project.location}</p>
                  )}
                  {project.developer?.name && (
                    <p className="text-gray-400 text-xs mt-2">{project.developer.name}</p>
                  )}
                </div>
              </div>

              {/* Rank Number - Custom Assets Image (Solid over Outline, breaking card bottom edge on the RIGHT) */}
              <div
                className={`absolute -bottom-4 sm:-bottom-6 z-20 h-20 sm:h-24 md:h-32 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] pointer-events-none flex items-end transition-all duration-300 ease-out group-hover:scale-[1.15] group-hover:-translate-y-3 group-hover:rotate-3 group-hover:drop-shadow-[0_15px_25px_rgba(220,38,38,0.2)] ${index === projects.length - 1 ? '-right-2 md:right-0' : '-right-5 md:-right-6'}`}
              >
                <div className="relative h-full flex items-end">
                  {/* Outline image behind, slightly offset down and right */}
                  <img
                    src={`/assets/top10/${rank}_outline.png`}
                    alt={`Top ${rank} Outline`}
                    className="absolute top-1.5 left-1.5 md:top-2 md:left-2 h-full w-auto object-contain opacity-90 transition-transform duration-300 group-hover:translate-x-1.5 group-hover:translate-y-1.5"
                  />
                  {/* Main solid image */}
                  <img
                    src={`/assets/top10/${rank}.png`}
                    alt={`Top ${rank}`}
                    className="relative z-10 h-full w-auto object-contain"
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
