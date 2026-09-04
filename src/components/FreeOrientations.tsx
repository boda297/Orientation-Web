'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { projectsApi } from '@/lib/api/projects.api';
import type { HomepageProject } from '@/lib/hooks/useHomepageData';
import { getFileUrl } from '@/lib/http/url';

export default function FreeOrientations() {
  const [freeProjects, setFreeProjects] = useState<HomepageProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [centerIndex, setCenterIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [autoplayKey, setAutoplayKey] = useState(0);

  /* ── Fetch directly from GET /projects/free?limit=10 ── */
  useEffect(() => {
    let cancelled = false;

    const fetchFree = async () => {
      setLoading(true);
      try {
        const data = await projectsApi.getFree(10);
        if (cancelled) return;
        setFreeProjects(Array.isArray(data) ? data as HomepageProject[] : []);
      } catch {
        if (!cancelled) setFreeProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFree();
    return () => { cancelled = true; };
  }, []);

  /* ── Reset Autoplay Helper ── */
  const resetAutoplay = useCallback(() => {
    setAutoplayKey((k) => k + 1);
  }, []);

  /* ── Navigation with Instant Reset ── */
  const navigate = useCallback(
    (dir: 'prev' | 'next') => {
      if (freeProjects.length === 0) return;
      setCenterIndex((prev) =>
        dir === 'next'
          ? (prev + 1) % freeProjects.length
          : (prev - 1 + freeProjects.length) % freeProjects.length
      );
      resetAutoplay();
    },
    [freeProjects.length, resetAutoplay]
  );

  /* ── Smart Autoplay Loop (Resumes immediately after manual interaction) ── */
  useEffect(() => {
    if (freeProjects.length < 2 || isHovered) return;

    const timer = setTimeout(() => {
      setCenterIndex((prev) => (prev + 1) % freeProjects.length);
      setAutoplayKey((k) => k + 1);
    }, 3200);

    return () => clearTimeout(timer);
  }, [freeProjects.length, isHovered, autoplayKey, centerIndex]);

  /* ── Thumbnail helper ── */
  const getThumbnailUrl = (project?: HomepageProject) => {
    if (!project) return '';
    const url = getFileUrl(project.projectThumbnailUrl);
    return url && url.trim() !== '' ? url : '';
  };

  /* ── Ultra-Smooth 0.75s 3D Position with GPU Optimization ── */
  const getCardStyle = (index: number): React.CSSProperties => {
    const len = freeProjects.length;
    if (len === 0) return { opacity: 0, pointerEvents: 'none' };

    let diff = (index - centerIndex) % len;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    const baseTransition =
      'transform 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), filter 0.75s cubic-bezier(0.16, 1, 0.3, 1)';

    if (diff === 0) {
      // CENTER CARD: in front, 0px blur, full opacity
      return {
        left: '50%',
        top: '50%',
        transform: 'translate3d(-50%, -50%, 80px) scale(1) rotateY(0deg)',
        zIndex: 30,
        opacity: 1,
        filter: 'blur(0px)',
        pointerEvents: 'auto',
        visibility: 'visible',
        transition: baseTransition,
      };
    } else if (diff === -1) {
      // LEFT SIBLING: peeking left in 3D depth, 8px blur, tilted
      return {
        left: '50%',
        top: '50%',
        transform: 'translate3d(calc(-50% - 44%), -50%, 0px) scale(0.84) rotateY(14deg)',
        zIndex: 20,
        opacity: 0.55,
        filter: 'blur(8px)',
        pointerEvents: 'auto',
        visibility: 'visible',
        cursor: 'pointer',
        transition: baseTransition,
      };
    } else if (diff === 1) {
      // RIGHT SIBLING: peeking right in 3D depth, 8px blur, tilted
      return {
        left: '50%',
        top: '50%',
        transform: 'translate3d(calc(-50% + 44%), -50%, 0px) scale(0.84) rotateY(-14deg)',
        zIndex: 20,
        opacity: 0.55,
        filter: 'blur(8px)',
        pointerEvents: 'auto',
        visibility: 'visible',
        cursor: 'pointer',
        transition: baseTransition,
      };
    } else {
      // BACKGROUND CARDS: hidden offscreen with 0 GPU overhead
      const dir = diff < 0 ? -1 : 1;
      return {
        left: '50%',
        top: '50%',
        transform: `translate3d(calc(-50% + ${dir * 88}%), -50%, -100px) scale(0.68) rotateY(${dir * -22}deg)`,
        zIndex: 10,
        opacity: 0,
        filter: 'none',
        pointerEvents: 'none',
        visibility: 'hidden',
        transition: baseTransition,
      };
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-black w-full">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
        </div>
      </section>
    );
  }

  if (freeProjects.length === 0) {
    return (
      <section className="py-8 md:py-14 bg-black w-full">
        <div className="text-center px-5">
          <h2
            className="text-2xl md:text-4xl lg:text-5xl text-white mb-3"
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Free Orientations
          </h2>
          <p className="text-zinc-500 text-sm md:text-base mt-4">
            No free projects available at the moment.
          </p>
        </div>
      </section>
    );
  }

  const progressPercent = ((centerIndex + 1) / freeProjects.length) * 100;

  return (
    <section className="relative bg-black w-full py-8 md:py-14 select-none overflow-hidden">
      {/* ═══ SECTION HEADER ═══ */}
      <div className="text-center mb-8 md:mb-12 px-5">
        <h2
          className="text-2xl md:text-4xl lg:text-5xl text-white mb-2 md:mb-3"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          Free Orientations
        </h2>
        <p
          className="text-xs md:text-sm max-w-xl mx-auto"
          style={{ color: '#e4beba', lineHeight: 1.6 }}
        >
          Explore exclusive properties through cinematic, high-definition streaming.
          No subscription required for these select showcases.
        </p>
      </div>

      {/* ═══ 3D COVERFLOW STAGE ═══ */}
      <div className="relative w-full max-w-[1200px] mx-auto px-4 md:px-12 pt-4">
        <div
          className="coverflow-stage relative w-full flex items-center justify-center"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
            height: 'clamp(240px, 38vw, 440px)',
          }}
        >
          {freeProjects.map((project, index) => {
            let diff = (index - centerIndex) % freeProjects.length;
            if (diff > freeProjects.length / 2) diff -= freeProjects.length;
            if (diff < -freeProjects.length / 2) diff += freeProjects.length;

            const isCenter = diff === 0;

            return (
              <div
                key={`${project._id || index}-${index}`}
                className="coverflow-card absolute will-change-transform"
                style={{
                  width: '74%',
                  maxWidth: '680px',
                  aspectRatio: '16/9',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transformStyle: 'preserve-3d',
                  overflow: 'visible',
                  ...getCardStyle(index),
                }}
                onMouseEnter={() => {
                  if (isCenter) setIsHovered(true);
                }}
                onMouseLeave={() => {
                  if (isCenter) setIsHovered(false);
                }}
                onClick={() => {
                  if (!isCenter) {
                    setCenterIndex(index);
                    resetAutoplay();
                  }
                }}
              >
                {/* FREE STREAMING Badge (Fully visible, unclipped) */}
                <div
                  className="absolute -top-3.5 left-4 md:-top-4 md:left-6 z-40 pointer-events-none"
                  style={{
                    opacity: isCenter ? 1 : 0,
                    transform: isCenter ? 'scale(1)' : 'scale(0.85)',
                    transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div
                    className="coverflow-badge flex items-center gap-1.5 px-3 py-1 md:px-3.5 md:py-1.5 rounded-full"
                    style={{
                      backgroundColor: '#b91c1c',
                      color: '#ffffff',
                      fontSize: '11px',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      boxShadow: '0 4px 14px rgba(185, 28, 28, 0.45)',
                    }}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.61 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
                    </svg>
                    <span>FREE STREAMING</span>
                  </div>
                </div>

                <Link
                  href={`/project/${project._id}`}
                  className={`block w-full h-full ${isCenter ? 'pointer-events-auto' : 'pointer-events-none'}`}
                >
                  {/* Card Container with Inset Shadow (Zero Seam Artifacts) */}
                  <div
                    className={`w-full h-full rounded-2xl overflow-hidden relative ${
                      isCenter ? 'coverflow-card-inner group/center cursor-pointer' : 'coverflow-glass cursor-pointer'
                    }`}
                    style={{
                      background: 'rgba(15, 15, 18, 0.6)',
                      boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                    }}
                  >
                    {/* Background Image */}
                    <div
                      className={`absolute inset-0 bg-cover bg-center high-res-img transition-transform duration-700 ${
                        isCenter ? 'group-hover/center:scale-105' : ''
                      }`}
                      style={{
                        backgroundImage: `url(${getThumbnailUrl(project)})`,
                        transform: 'translateZ(0)',
                      }}
                    />

                    {/* Dark Vignette Overlay */}
                    <div
                      className="absolute inset-0 transition-opacity duration-700"
                      style={{
                        background: isCenter
                          ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.92) 100%), linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%)'
                          : 'rgba(0, 0, 0, 0.45)',
                        transform: 'translateZ(0)',
                      }}
                    />

                    {/* Glass Sheen on Hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover/center:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 40%, rgba(185,28,28,0.06) 100%)',
                      }}
                    />


                    {/* Magnetic Play Button */}
                    <div
                      className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                      style={{
                        opacity: isCenter ? 1 : 0,
                        transform: isCenter ? 'scale(1)' : 'scale(0.8)',
                        transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <div
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-300 group-hover/center:scale-110"
                        style={{
                          background: 'rgba(185, 28, 28, 0.25)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          boxShadow: '0 0 25px rgba(185, 28, 28, 0.35)',
                        }}
                      >
                        <div
                          className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center pointer-events-auto"
                          style={{ backgroundColor: '#ef4444' }}
                        >
                          <svg className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="#ffffff" viewBox="0 0 20 20">
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Title & Location (100% Real Project Data) */}
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 z-20 flex justify-between items-end">
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-white font-bold text-sm md:text-xl lg:text-2xl tracking-tight truncate"
                          style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.01em' }}
                        >
                          {project.title}
                        </h3>
                        {project.location && (
                          <div className="flex items-center gap-2 md:gap-3 mt-1">
                            <span
                              className="text-[10px] md:text-[11px] uppercase tracking-widest flex items-center gap-0.5"
                              style={{ color: '#e4beba', fontWeight: 600 }}
                            >
                              <svg className="w-2.5 h-2.5 md:w-3 md:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {project.location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* ═══ BOTTOM CONTROLS — Kinetic Slider ═══ */}
        <div className="mt-6 md:mt-10 w-full max-w-sm mx-auto flex items-center gap-4 md:gap-5">
          <button
            onClick={() => navigate('prev')}
            className="coverflow-glass w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:text-red-500 hover:border-red-500 group/btn flex-shrink-0"
            aria-label="Previous"
          >
            <svg className="w-4 h-4 transition-transform group-hover/btn:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-750 ease-out"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: '#b91c1c',
                boxShadow: '0 0 10px rgba(185, 28, 28, 0.7)',
              }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 6px #fff' }} />
            </div>
          </div>

          <button
            onClick={() => navigate('next')}
            className="coverflow-glass w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:text-red-500 hover:border-red-500 group/btn flex-shrink-0"
            aria-label="Next"
          >
            <svg className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══ SCOPED STYLES ═══ */}
      <style jsx>{`
        .coverflow-glass {
          background: rgba(24, 24, 27, 0.4);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }
        .coverflow-card-inner {
          transition: transform 0.35s ease, box-shadow 0.35s ease;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
        }
        .coverflow-card-inner:hover {
          transform: scale(1.02);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.85), inset 0 0 0 1px rgba(255, 255, 255, 0.16);
        }
        .coverflow-badge {
          animation: badge-pulse 2.8s infinite ease-in-out;
        }
        .high-res-img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        @keyframes badge-pulse {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(185, 28, 28, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 6px 20px rgba(185, 28, 28, 0.65);
            transform: scale(1.02);
          }
        }
      `}</style>
    </section>
  );
}
