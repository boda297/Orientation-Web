'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { api, getFileUrl } from '@/lib/api';

interface LatestOrientation {
  _id: string;
  title: string;
  location?: string;
  projectThumbnailUrl?: string;
  developer?: {
    name: string;
  };
}

export default function LatestOrientations() {
  const [orientations, setOrientations] = useState<LatestOrientation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrientations = async () => {
      try {
        // Fetch latest projects from the new endpoint
        const projects = await api.getLatestProjects(10);

        let projectsData = projects;
        if (projects && typeof projects === 'object' && !Array.isArray(projects)) {
          if (Array.isArray(projects.data)) {
            projectsData = projects.data;
          } else if (Array.isArray(projects.projects)) {
            projectsData = projects.projects;
          } else if (Array.isArray(projects.results)) {
            projectsData = projects.results;
          }
        }

        if (Array.isArray(projectsData)) {
          const publishedProjects = projectsData.filter((p: any) => p.published === true);
          setOrientations(publishedProjects);
        }
      } catch (error) {
        console.error('Error fetching latest orientations:', error);
        // Keep empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchOrientations();
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || orientations.length === 0) return;

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
  }, [orientations.length, isDragging]);

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
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 pl-4 md:pl-6">The latest for us</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </section>
    );
  }

  if (orientations.length === 0) {
    return null; // Don't show section if no projects
  }
  return (
    <section className="py-4 md:py-6 bg-black w-full overflow-hidden">
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 pl-4 md:pl-6">The latest for us</h2>
      <div
        ref={scrollContainerRef}
        className={`flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide ${isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
        style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {orientations.map((orientation, index) => (
          <Link
            key={orientation._id}
            href={`/project/${orientation._id}`}
            onClick={(e) => isDragging && e.preventDefault()}
            className={`flex-shrink-0 w-48 sm:w-56 md:w-64 lg:w-72 group relative ${index === 0 ? 'pl-4 md:pl-6' : ''} ${index === orientations.length - 1 ? 'pr-4 md:pr-6' : ''}`}
          >
            <div className="relative aspect-[4/5] bg-gray-800 overflow-hidden rounded-lg">
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                style={{
                  backgroundImage: orientation.projectThumbnailUrl
                    ? `url(${getFileUrl(orientation.projectThumbnailUrl)})`
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
                <h3 className="text-white font-bold text-lg md:text-xl mb-2">{orientation.title}</h3>
                {orientation.location && (
                  <p className="text-gray-200 text-xs md:text-sm mb-2 font-semibold">{orientation.location}</p>
                )}
                {orientation.developer?.name && (
                  <p className="text-gray-400 text-xs mt-2">{orientation.developer.name}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
