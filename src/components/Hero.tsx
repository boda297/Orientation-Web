'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api, getFileUrl } from '@/lib/api';

interface FeaturedProject {
  _id: string;
  title: string;
  location?: string;
  projectThumbnailUrl?: string;
  heroVideoUrl?: string;
  logoUrl?: string;
}

export default function Hero() {
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const projects = await api.getFeaturedProjects(3);
        if (Array.isArray(projects) && projects.length > 0) {
          const publishedProjects = projects.filter((p: any) => p.published === true);
          setFeaturedProjects(publishedProjects.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching featured projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  // Play the active video and pause others
  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === currentVideoIndex) {
        video.play().catch(() => { });
      } else {
        video.pause();
        video.currentTime = 0; // Optional: Reset video when not active
      }
    });
  }, [currentVideoIndex, featuredProjects]);

  // Pause video when page changes
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            videoRefs.current.forEach((video) => {
              if (video) video.pause();
            });
          } else {
            if (videoRefs.current[currentVideoIndex]) {
              videoRefs.current[currentVideoIndex]?.play().catch(() => { });
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(sectionRef.current);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        videoRefs.current.forEach((video) => {
          if (video) video.pause();
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      videoRefs.current.forEach((video) => {
        if (video) video.pause();
      });
    };
  }, [currentVideoIndex]);

  const onTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset(0);
    if ('targetTouches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || touchStart === null) return;
    const currentX = 'targetTouches' in e ? e.targetTouches[0].clientX : (e as React.MouseEvent).clientX;
    const diff = currentX - touchStart;
    setDragOffset(diff);
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Dynamic threshold, 15% of window width
    const threshold = typeof window !== 'undefined' ? window.innerWidth * 0.15 : 50;

    if (dragOffset > threshold) {
      handlePrev();
    } else if (dragOffset < -threshold) {
      handleNext();
    }

    setDragOffset(0);
    setTouchStart(null);
  };

  const changeVideo = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleNext = () => {
    if (featuredProjects.length === 0) return;
    const nextIndex = (currentVideoIndex + 1) % featuredProjects.length;
    changeVideo(nextIndex);
  };

  const handlePrev = () => {
    if (featuredProjects.length === 0) return;
    const prevIndex = (currentVideoIndex - 1 + featuredProjects.length) % featuredProjects.length;
    changeVideo(prevIndex);
  };

  const handleVideoEnd = (index: number) => {
    handleNext();
  };

  if (loading) {
    return (
      <section className="relative w-full h-screen bg-black overflow-hidden flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </section>
    );
  }

  if (featuredProjects.length === 0) {
    return (
      <section className="relative w-full h-screen bg-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white">ORIENTATION</h1>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`relative w-full h-screen bg-black overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onTouchStart}
      onMouseMove={onTouchMove}
      onMouseUp={onTouchEnd}
      onMouseLeave={onTouchEnd}
    >
      {/* Slider Container mapping all videos horizontally */}
      <div
        className="absolute inset-0 flex h-full will-change-transform"
        style={{
          width: `${featuredProjects.length * 100}%`,
          transform: `translateX(calc(-${(currentVideoIndex * 100) / featuredProjects.length}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
        }}
      >
        {featuredProjects.map((project, index) => (
          <div
            key={project._id || index}
            className="w-full h-full relative"
            style={{ width: `${100 / featuredProjects.length}%` }}
          >
            {/* Video Background */}
            {project.heroVideoUrl ? (
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                src={getFileUrl(project.heroVideoUrl)}
                poster={getFileUrl(project.projectThumbnailUrl)}
                muted
                playsInline
                loop={false}
                onEnded={() => handleVideoEnd(index)}
              />
            ) : (
              <div
                className="absolute inset-0 bg-cover bg-center pointer-events-none"
                style={{
                  backgroundImage: project.projectThumbnailUrl
                    ? `url(${getFileUrl(project.projectThumbnailUrl)})`
                    : 'none',
                  backgroundColor: '#000'
                }}
              />
            )}

            {/* Slide Gradient Overlay */}
            <div
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 80%, rgba(0,0,0,1) 100%)'
              }}
            />

            {/* Slide Content Container - Center */}
            <div className="absolute bottom-16 left-0 right-0 z-20 flex flex-col items-center px-4">
              {project.logoUrl ? (
                <div className="mb-6 md:mb-8">
                  <Image
                    src={getFileUrl(project.logoUrl)}
                    alt={project.title || 'Logo'}
                    width={300}
                    height={120}
                    className="h-16 md:h-24 lg:h-32 w-auto object-contain drop-shadow-2xl pointer-events-none"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="mb-6 md:mb-8">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-red-200 to-white drop-shadow-2xl tracking-wider text-center pointer-events-none">
                    ORIENTATION
                  </h1>
                </div>
              )}

              <Link
                href={`/project/${project._id}`}
                className="mb-2"
                onClick={(e) => isDragging && dragOffset !== 0 ? e.preventDefault() : null}
              >
                <button className="group pointer-events-auto relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white font-bold py-3 px-8 md:py-4 md:px-12 rounded-full text-base md:text-lg transition-all duration-500 flex items-center gap-3 shadow-2xl hover:shadow-red-500/60 hover:scale-110 active:scale-95">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative z-10 w-8 h-8 bg-white/25 group-hover:bg-white/35 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:scale-125">
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <span className="relative z-10 text-white font-bold tracking-wide">Watch</span>
                </button>
              </Link>
            </div>

            {/* Slide Project Info - Bottom Left */}
            <div className="hidden md:block absolute md:bottom-20 md:left-8 z-20 md:max-w-md pointer-events-none">
              <h2 className="md:text-4xl lg:text-5xl font-bold text-white md:mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-tight">
                {project.title}
              </h2>
              {project.location && (
                <p className="md:text-xl text-gray-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                  {project.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Indicators - Fixed at Bottom Center */}
      {featuredProjects.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-2 pointer-events-auto">
          {featuredProjects.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                changeVideo(index);
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentVideoIndex ? 'bg-red-600 w-8' : 'bg-gray-600/50 hover:bg-gray-500'}`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
