'use client';

import { useEffect, useRef, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
import { api, getFileUrl } from '@/lib/api';
import { getAccessToken } from '@/lib/auth';
import { saveWatchProgress } from '@/components/ContinueWatch';

interface Project {
  _id: string;
  title: string;
  location: string;
  script: string;
  heroVideoUrl?: string;
  projectThumbnailUrl?: string;
  logoUrl?: string;
  whatsappNumber?: string;
  mapsLocation?: string;
  developer?: {
    _id: string;
    name: string;
    logoUrl?: string;
  };
  episodes?: Array<{
    _id: string;
    title: string;
    episodeOrder?: number;
    duration?: string;
    thumbnail?: string;
    episodeUrl?: string;
  }>;
  reels?: Array<{
    _id: string;
    title: string;
    thumbnailUrl?: string;
    fileUrl?: string;
    likes?: number;
    number?: number;
  }>;
  inventory?: {
    _id: string;
    title: string;
    fileUrl?: string;
  };
  pdf?: Array<{
    _id: string;
    title: string;
    pdfUrl?: string;
    fileUrl?: string;
    size?: string;
  }>;
}

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [pdfs, setPdfs] = useState<any[]>([]);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [activeTab, setActiveTab] = useState('Episodes');
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const [selectedEpisode, setSelectedEpisode] = useState<{ _id: string; title: string; episodeOrder?: number; duration?: string; thumbnail?: string; episodeUrl?: string } | null>(null);
  const videoModalRef = useRef<HTMLVideoElement | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const requireAuth = (action: () => void) => {
    if (!hasMounted) return; // Prevent clicks before hydration

    const token = getAccessToken();

    // Explicitly check for 'undefined' and 'null' strings which can bypass the !(truthy) check
    const isValidToken = token && token !== 'undefined' && token !== 'null' && token.trim() !== '';

    if (!isValidToken) {
      setShowAuthModal(true);
    } else {
      action();
    }
  };

  const tabs = ['Project', 'Episodes', 'Inventory', 'Reels', 'PDF'];

  // Check if project is saved on mount
  useEffect(() => {
    if (project?._id) {
      const savedIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      setIsSaved(savedIds.includes(project._id));
    }
  }, [project?._id]);

  const toggleSave = () => {
    requireAuth(() => {
      if (!project?._id) return;

      const savedIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');

      if (isSaved) {
        // Remove from saved
        const updatedIds = savedIds.filter((id: string) => id !== project._id);
        localStorage.setItem('savedProjects', JSON.stringify(updatedIds));
        setIsSaved(false);
      } else {
        // Add to saved
        const updatedIds = [...savedIds, project._id];
        localStorage.setItem('savedProjects', JSON.stringify(updatedIds));
        setIsSaved(true);
      }
    });
  };

  const handleWhatsApp = () => {
    requireAuth(() => {
      if (!project) return;

      const projectUrl = typeof window !== 'undefined' ? window.location.href : '';
      const message = `Check out this project: ${project.title}${project.location ? ` - ${project.location}` : ''}\n${projectUrl}`;
      const whatsappNumber = project.whatsappNumber || '+201234567890';
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');
    });
  };

  const handleLocation = () => {
    requireAuth(() => {
      if (!project?.mapsLocation && !project?.location) return;

      // If mapsLocation is available, open Google Maps
      if (project.mapsLocation) {
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.mapsLocation)}`;
        window.open(mapsUrl, '_blank');
      } else if (project.location) {
        // Otherwise, search for the location
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.location)}`;
        window.open(mapsUrl, '_blank');
      }
    });
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(async () => {
      if (!project?.script) {
        alert('No script available for this project');
        return;
      }

      if (typeof window === 'undefined') return;

      // Copy the script text
      const scriptText = project.script;

      try {
        await navigator.clipboard.writeText(scriptText);
        // Show toast notification
        alert('Script copied to clipboard!');
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = scriptText;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Script copied to clipboard!');
        } catch (fallbackErr) {
          console.error('Failed to copy:', fallbackErr);
          alert('Failed to copy script. Please copy manually.');
        }
        document.body.removeChild(textArea);
      }
    });
  };

  // Check for tab and episode query parameters on mount
  const [autoPlayEpisodeId, setAutoPlayEpisodeId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && tabs.includes(tabParam)) {
        setActiveTab(tabParam);
      }
      const episodeParam = params.get('episode');
      if (episodeParam) {
        setAutoPlayEpisodeId(episodeParam);
      }
    }
  }, []);

  // Auto-open episode from Continue Watching
  useEffect(() => {
    if (autoPlayEpisodeId && project?.episodes && Array.isArray(project.episodes) && project.episodes.length > 0) {
      const episode = project.episodes.find(ep => ep._id === autoPlayEpisodeId);
      if (episode && episode.episodeUrl) {
        setSelectedEpisode(episode);
        setAutoPlayEpisodeId(null); // Clear so it doesn't re-trigger
        // Play video after modal opens
        setTimeout(() => {
          if (videoModalRef.current) {
            videoModalRef.current.play().catch(() => { });
          }
        }, 300);
      }
    }
  }, [autoPlayEpisodeId, project?.episodes]);

  // Try to play video when project loads
  useEffect(() => {
    if (project?.heroVideoUrl && heroVideoRef.current && !videoError) {
      const video = heroVideoRef.current;

      // Reset video
      video.load();

      // Try to play after a short delay
      const playTimeout = setTimeout(() => {
        video.play().catch((err) => {
          console.log('Autoplay failed:', err);
          setVideoError(true);
        });
      }, 100);

      return () => clearTimeout(playTimeout);
    }
  }, [project?.heroVideoUrl, videoError]);

  // Fetch project data
  useEffect(() => {
    let videoTimeoutId: NodeJS.Timeout | null = null;

    const fetchProject = async () => {
      try {
        if (!resolvedParams?.id) {
          setError('Project ID is missing');
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);

        const projectData = await api.getProject(resolvedParams.id);

        if (!projectData || typeof projectData !== 'object') {
          setError('Invalid project data received');
          setLoading(false);
          return;
        }

        setProject(projectData);
        setVideoError(false); // Reset video error when loading new project
        setVideoCanPlay(false); // Reset video can play state

        console.log('Project data loaded:', {
          heroVideoUrl: projectData.heroVideoUrl,
          projectThumbnailUrl: projectData.projectThumbnailUrl,
          title: projectData.title
        });

        // Fetch related projects (same developer)
        if (projectData.developer?._id) {
          try {
            setLoadingRelated(true);
            const relatedProjectsData = await api.getProjects({ developerId: projectData.developer._id });

            let projectsList = relatedProjectsData;
            if (relatedProjectsData && typeof relatedProjectsData === 'object' && !Array.isArray(relatedProjectsData)) {
              if (Array.isArray(relatedProjectsData.data)) {
                projectsList = relatedProjectsData.data;
              } else if (Array.isArray(relatedProjectsData.projects)) {
                projectsList = relatedProjectsData.projects;
              } else if (Array.isArray(relatedProjectsData.results)) {
                projectsList = relatedProjectsData.results;
              }
            }

            if (Array.isArray(projectsList)) {
              // Filter out current project
              const filtered = projectsList.filter((p: Project) => p._id !== resolvedParams.id);
              setRelatedProjects(filtered);
            }
          } catch (err) {
            console.error('Failed to fetch related projects:', err);
          } finally {
            setLoadingRelated(false);
          }
        }

        // Fetch inventory if project has inventory ID
        if (projectData.inventory) {
          try {
            const inventoryData = await api.getInventory();
            if (Array.isArray(inventoryData)) {
              const projectInventory = inventoryData.find((inv: any) =>
                inv?.project?._id === resolvedParams.id || inv?._id === projectData.inventory
              );
              if (projectInventory) {
                setInventory([projectInventory]);
              }
            }
          } catch (err) {
            console.error('Failed to fetch inventory:', err);
            // Don't fail the whole page if inventory fails
          }
        }

        // Use PDFs directly from project data
        if (projectData.pdf && Array.isArray(projectData.pdf) && projectData.pdf.length > 0) {
          setPdfs(projectData.pdf);
        }
      } catch (err: any) {
        let errorMessage = 'Failed to load project';

        if (err?.message) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }

        // Check if it's a 400 error (bad request - invalid ID format)
        if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
          errorMessage = 'Invalid project ID. Please check the URL and try again.';
        }

        setError(errorMessage);
        console.error('Error fetching project:', err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams?.id) {
      fetchProject();
    } else {
      setError('Invalid project ID');
      setLoading(false);
    }

    // Cleanup timeout on unmount
    return () => {
      if (videoTimeoutId) {
        clearTimeout(videoTimeoutId);
      }
    };
  }, [resolvedParams?.id]);

  // Update indicator position
  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = tabs.indexOf(activeTab);
      const activeButton = tabsRef.current[activeIndex];

      if (activeButton) {
        setIndicatorStyle({
          left: activeButton.offsetLeft,
          width: activeButton.offsetWidth,
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(updateIndicator, 0);

    const handleResize = () => {
      updateIndicator();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
    };
  }, [activeTab]);

  const handleTabClick = (tab: string, index: number) => {
    setActiveTab(tab);
    tabsRef.current[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number | string | undefined): string => {
    if (!seconds) return '0:00';
    const sec = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">Error loading project</p>
          <p className="text-gray-400 mb-4">{error || 'Project not found'}</p>
          <Link href="/" className="text-red-600 hover:text-red-700 underline">
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-16 md:pt-20">
        {/* Video Player Section */}
        <div className="relative w-full h-[40vh] sm:h-[50vh] md:h-[70vh] overflow-hidden bg-black">
          {project?.heroVideoUrl && !videoError ? (
            <video
              ref={heroVideoRef}
              className="absolute inset-0 w-full h-full object-cover z-0"
              src={getFileUrl(project.heroVideoUrl)}
              poster={project.projectThumbnailUrl ? getFileUrl(project.projectThumbnailUrl) : undefined}
              muted={isMuted}
              playsInline
              autoPlay
              loop
              preload="metadata"
              onError={(e) => {
                // Silently fallback to image if video fails
                setVideoError(true);
              }}
              onLoadedMetadata={() => {
                // Try to play after metadata is loaded
                if (heroVideoRef.current) {
                  heroVideoRef.current.play().catch(() => {
                    // Autoplay might fail, that's okay
                  });
                }
              }}
            />
          ) : (
            <div
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{
                backgroundImage: project?.projectThumbnailUrl
                  ? `url(${getFileUrl(project.projectThumbnailUrl)})`
                  : 'none',
                backgroundColor: '#000'
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/40 z-10" />

          {/* Video Controls */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4 z-30">
            <Link href="/" className="w-8 h-8 md:w-10 md:h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-2 z-30">
            {project?.heroVideoUrl && !videoError && (
              <>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 md:w-10 md:h-10 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label={isMuted ? "Unmute video" : "Mute video"}
                >
                  {isMuted ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <line x1="17" y1="7" x2="23" y2="13" strokeWidth={2} strokeLinecap="round" />
                      <line x1="23" y1="7" x2="17" y2="13" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Red separator line */}
        <div className="h-[1px] bg-red-600"></div>

        {/* Project Info Section */}
        <div className="bg-black py-6 px-4 md:px-8">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">{project?.title || 'Project'}</h2>
                <p className="text-xl text-gray-300 mb-2">{project?.location || ''}</p>
                <p className="text-gray-400">Script: {project?.script || 'N/A'}</p>
              </div>
              <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <button
                  onClick={toggleSave}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${isSaved
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                >
                  <svg className={`w-5 h-5 md:w-6 md:h-6 ${isSaved ? 'text-white' : 'text-white'}`} fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </button>
                <button
                  onClick={handleLocation}
                  className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title="View Location"
                  disabled={!project?.mapsLocation && !project?.location}
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <button
                  onClick={handleCopy}
                  className="w-10 h-10 md:w-12 md:h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  title="Copy Link"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-black border-b border-gray-800">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            <div
              ref={tabsContainerRef}
              className="relative flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide"
            >
              {/* Animated red line indicator */}
              <div
                className="absolute bottom-0 h-[2px] bg-red-600 transition-all duration-300 ease-in-out"
                style={{
                  left: `${indicatorStyle.left}px`,
                  width: `${indicatorStyle.width}px`,
                }}
              />

              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  onClick={() => handleTabClick(tab, index)}
                  className={`py-4 px-2 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-300 ${activeTab === tab
                    ? 'text-red-600'
                    : 'text-gray-400 hover:text-gray-300'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-black py-6 md:py-8">
          <div className="max-w-[1600px] mx-auto px-4 md:px-8">
            {activeTab === 'Project' && (
              <div className="space-y-4">
                {loadingRelated ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : relatedProjects.length > 0 ? (
                  relatedProjects.map((relatedProject) => (
                    <Link
                      key={relatedProject._id}
                      href={`/project/${relatedProject._id}?tab=Episodes`}
                      className="w-full flex items-center gap-4 rounded-2xl bg-gray-900/60 hover:bg-gray-900 transition-colors p-4 cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-24 h-20 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: relatedProject.projectThumbnailUrl
                            ? `url(${getFileUrl(relatedProject.projectThumbnailUrl)})`
                            : 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.8), rgba(217, 119, 6, 0.4))'
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-white truncate">{relatedProject.title || 'Project'}</div>
                        <div className="text-sm text-gray-400 truncate">{relatedProject.location || ''}</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No related projects available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Episodes' && (
              <div className="space-y-4">
                {project?.episodes && Array.isArray(project.episodes) && project.episodes.length > 0 ? (
                  project.episodes.map((episode) => (
                    <button
                      key={episode._id}
                      onClick={() => {
                        requireAuth(() => {
                          setSelectedEpisode(episode);
                          // Play video after modal opens
                          setTimeout(() => {
                            if (videoModalRef.current) {
                              videoModalRef.current.play().catch(() => { });
                            }
                          }, 100);
                        });
                      }}
                      className="w-full flex items-center gap-4 rounded-2xl bg-gray-900/60 hover:bg-gray-900 transition-colors p-4 text-left cursor-pointer"
                    >
                      {/* Thumbnail */}
                      <div
                        className="w-24 h-20 rounded-2xl bg-cover bg-center flex-shrink-0"
                        style={{
                          backgroundImage: episode.thumbnail
                            ? `url(${getFileUrl(episode.thumbnail)})`
                            : 'linear-gradient(to bottom right, rgba(251, 191, 36, 0.8), rgba(217, 119, 6, 0.4))'
                        }}
                      />
                      {/* Episode Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-white truncate">
                          {episode.title || `Episode ${episode.episodeOrder || ''}`}
                        </div>
                        {episode.duration && (
                          <div className="text-sm text-gray-400">{formatDuration(episode.duration)}</div>
                        )}
                      </div>
                      {/* Play Button */}
                      <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No episodes available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Inventory' && (
              <div className="py-10 md:py-12 flex justify-center">
                {inventory.length > 0 && inventory[0]?.fileUrl ? (
                  <button
                    onClick={() => requireAuth(() => {
                      window.open(getFileUrl(inventory[0].fileUrl), '_blank');
                    })}
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold shadow-lg shadow-green-600/20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm4 2h8M8 11h8M8 15h8" />
                    </svg>
                    Open Excel Sheet
                  </button>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No inventory available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'PDF' && (
              <div className="space-y-4">
                {pdfs.length > 0 ? (
                  pdfs.map((pdf) => (
                    <div
                      key={pdf._id}
                      className="w-full flex items-center gap-4 rounded-2xl bg-gray-900/60 hover:bg-gray-900 transition-colors p-4"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-red-600/20 flex items-center justify-center border border-red-600/20 flex-shrink-0">
                        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-semibold text-white truncate">{pdf.title}</div>
                        <div className="text-sm text-gray-400 truncate">
                          {pdf.title} {pdf.size ? <span className="text-gray-500">· {pdf.size}</span> : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => requireAuth(() => {
                          window.open(getFileUrl(pdf.pdfUrl || pdf.fileUrl), '_blank');
                        })}
                        className="w-12 h-12 rounded-full bg-black/40 border border-red-600/30 flex items-center justify-center flex-shrink-0 hover:bg-black/60 transition-colors"
                      >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v10m0 0l4-4m-4 4l-4-4M4 17v3h16v-3" />
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No PDFs available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Reels' && (
              <div className="space-y-4">
                {project?.reels && Array.isArray(project.reels) && project.reels.length > 0 ? (
                  project.reels.map((reel) => (
                    <div
                      key={reel._id}
                      onClick={() => requireAuth(() => {
                        window.open(getFileUrl(reel.fileUrl), '_blank');
                      })}
                      className="flex gap-4 bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative w-32 h-48 md:w-40 md:h-60 flex-shrink-0 rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: reel.thumbnailUrl
                              ? `url(${getFileUrl(reel.thumbnailUrl)})`
                              : project?.projectThumbnailUrl
                                ? `url(${getFileUrl(project.projectThumbnailUrl)})`
                                : 'linear-gradient(to bottom right, rgba(220, 38, 38, 0.8), rgba(153, 27, 27, 0.4))'
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-white font-bold text-lg md:text-xl mb-2">{reel.title || 'Reel'}</h3>
                        </div>
                        <div className="flex items-center gap-4">
                          {reel.number && (
                            <span className="text-2xl md:text-3xl font-bold text-white">{reel.number}</span>
                          )}
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-400">{reel.likes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No reels available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main >

      {/* Video Modal */}
      {
        selectedEpisode && selectedEpisode.episodeUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedEpisode(null)}
          >
            <div
              className="relative w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  if (videoModalRef.current) {
                    videoModalRef.current.pause();
                  }
                  setSelectedEpisode(null);
                }}
                className="absolute -top-12 right-0 w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors z-10"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Video Player */}
              <video
                ref={videoModalRef}
                src={getFileUrl(selectedEpisode.episodeUrl)}
                controls
                autoPlay
                className="w-full h-auto rounded-lg"
                onEnded={() => setSelectedEpisode(null)}
                onTimeUpdate={(e) => {
                  const video = e.currentTarget;
                  // Save progress every 5 seconds
                  if (Math.floor(video.currentTime) % 5 === 0 && video.currentTime > 0) {
                    saveWatchProgress({
                      episodeId: selectedEpisode._id,
                      projectId: resolvedParams.id,
                      projectTitle: project?.title || '',
                      episodeTitle: selectedEpisode.title || `Episode ${selectedEpisode.episodeOrder || ''}`,
                      thumbnail: selectedEpisode.thumbnail || project?.projectThumbnailUrl || '',
                      currentTime: video.currentTime,
                      duration: video.duration || 0,
                      timestamp: Date.now(),
                    });
                  }
                }}
                onPause={(e) => {
                  const video = e.currentTarget;
                  saveWatchProgress({
                    episodeId: selectedEpisode._id,
                    projectId: resolvedParams.id,
                    projectTitle: project?.title || '',
                    episodeTitle: selectedEpisode.title || `Episode ${selectedEpisode.episodeOrder || ''}`,
                    thumbnail: selectedEpisode.thumbnail || project?.projectThumbnailUrl || '',
                    currentTime: video.currentTime,
                    duration: video.duration || 0,
                    timestamp: Date.now(),
                  });
                }}
              />

              {/* Episode Title */}
              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-white">
                  {selectedEpisode.title || `Episode ${selectedEpisode.episodeOrder || ''}`}
                </h3>
                {selectedEpisode.duration && (
                  <p className="text-gray-400 mt-1">{formatDuration(selectedEpisode.duration)}</p>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Auth Modal */}
      {
        showAuthModal && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => {
              setIsModalClosing(true);
              setTimeout(() => { setShowAuthModal(false); setIsModalClosing(false); }, 300);
            }}
            style={{ animation: isModalClosing ? 'authFadeOut 0.3s ease-in forwards' : 'authFadeIn 0.3s ease-out' }}
          >
            <div
              className="bg-[#111] border border-zinc-800 p-6 md:p-8 rounded-[2rem] max-w-sm w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative text-center"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: isModalClosing ? 'authZoomOut 0.3s ease-in forwards' : 'authZoomIn 0.3s ease-out' }}
            >
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(255,0,0,0.1)]">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Login Required</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                You need to log in to your account first in order to interact and access all project features.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setIsModalClosing(true);
                    setTimeout(() => { setShowAuthModal(false); setIsModalClosing(false); router.push('/login'); }, 300);
                  }}
                  className="w-full h-14 bg-[#ff0000] shadow-[0_0_20px_rgba(255,0,0,0.2)] text-white font-bold rounded-full hover:bg-red-700 transition-colors"
                >
                  Okay, Log in
                </button>
                <button
                  onClick={() => {
                    setIsModalClosing(true);
                    setTimeout(() => { setShowAuthModal(false); setIsModalClosing(false); }, 300);
                  }}
                  className="w-full h-14 bg-[#1a1a1a] border border-zinc-800 text-gray-300 font-medium rounded-full hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Keyframe animations for Auth Modal */}
      <style jsx global>{`
        @keyframes authFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes authFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes authZoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes authZoomOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
        }
      `}</style>

      <Footer />
      <ChatWidget />
    </div >
  );
}
