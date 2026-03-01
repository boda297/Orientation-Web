'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';
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

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  const [saved, setSaved] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    // Check initial saved state from localStorage
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      if (savedIds.includes(project._id)) {
        // eslint-disable-next-line
        setSaved(true);
      }
    } catch {
      // ignore
    }
  }, [project._id]);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const savedIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');
      const newSavedState = !saved;

      if (newSavedState) {
        if (!savedIds.includes(project._id)) {
          savedIds.push(project._id);
        }
      } else {
        const index = savedIds.indexOf(project._id);
        if (index > -1) {
          savedIds.splice(index, 1);
        }
      }

      localStorage.setItem('savedProjects', JSON.stringify(savedIds));
      setSaved(newSavedState);
    } catch (err) {
      console.error('Failed to update saved projects', err);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/project/${project._id}`;

    // Helper to show tooltip
    const showSuccess = () => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    };

    // Attempt to use native mobile Share API first ONLY if on mobile
    if (typeof navigator !== 'undefined' && navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      navigator.share({
        title: `Check out ${project.title} on Orientation`,
        url: url
      }).catch((err) => console.log('Share cancelled', err));
      return;
    }

    // Must be synchronous for execCommand
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url).then(showSuccess).catch(console.error);
    } else {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        // Use fixed and top 0 to prevent browser from scrolling down when focusing
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        showSuccess();
      } catch (error) {
        console.error('Fallback failed to copy link', error);
      }
    }
  };

  return (
    <Link
      href={`/project/${project._id}`}
      className="flex flex-col sm:flex-row gap-4 md:gap-6 bg-gray-800 hover:bg-gray-700 rounded-lg p-4 md:p-6 transition-colors group"
    >
      {/* Project Thumbnail */}
      <div className="relative w-full sm:w-48 md:w-64 h-48 md:h-64 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
        {project.projectThumbnailUrl ? (
          <Image
            src={getFileUrl(project.projectThumbnailUrl)}
            alt={project.title || 'Project thumbnail'}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition-colors">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Project Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-bold text-xl md:text-2xl mb-2">{project.title}</h3>
          {project.location && (
            <p className="text-gray-300 text-sm md:text-base mb-4">{project.location}</p>
          )}
          {project.developer?.name && (
            <p className="text-gray-400 text-sm md:text-base">{project.developer.name}</p>
          )}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            <span>Watch</span>
          </button>
          <button onClick={handleSave} className={`${saved ? 'text-red-600' : 'text-gray-400'} hover:text-white transition-colors`}>
            <svg className="w-6 h-6" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button onClick={handleShare} className="text-gray-400 hover:text-white transition-colors relative">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>

            {/* Elegant Tooltip Popup */}
            {showCopied && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-gray-900 border border-gray-700 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Link Copied
              </div>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function AreaProjectsPage({ params }: { params: Promise<{ area: string }> }) {
  const resolvedParams = use(params);
  const areaName = decodeURIComponent(resolvedParams.area);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log(`Fetching projects for area: "${areaName}"`);

        // Try the location endpoint first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let data: any;
        try {
          data = await api.getProjectsByLocation(areaName);
          console.log(`Received data from location endpoint for ${areaName}:`, data);

          // Handle if response is an object with a data/projects array
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            if (Array.isArray(data.data)) {
              data = data.data;
            } else if (Array.isArray(data.projects)) {
              data = data.projects;
            } else if (Array.isArray(data.results)) {
              data = data.results;
            }
          }
        } catch (locationError) {
          console.warn(`Location endpoint failed, trying to fetch all projects and filter:`, locationError);
          // If location endpoint fails, fetch all projects and filter by location
          let allProjects = await api.getProjects();
          console.log(`Fetched projects response:`, allProjects);

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

          console.log(`Total projects to filter: ${Array.isArray(allProjects) ? allProjects.length : 0}`);

          if (Array.isArray(allProjects)) {
            // Filter projects by location (case-insensitive, partial match)
            const areaNameLower = areaName.toLowerCase();
            data = allProjects.filter((project: Project) => {
              const projectLocation = project.location?.toLowerCase() || '';
              return (
                projectLocation === areaNameLower ||
                projectLocation.includes(areaNameLower) ||
                areaNameLower.includes(projectLocation) ||
                projectLocation.replace(/\s+/g, '') === areaNameLower.replace(/\s+/g, '')
              );
            });
            console.log(`Filtered ${data.length} projects for ${areaName}`);
          } else {
            data = [];
          }
        }

        if (Array.isArray(data)) {
          setProjects(data);
          console.log(`Set ${data.length} projects for ${areaName}`);
        } else {
          console.warn(`Data is not an array for ${areaName}:`, data);
          setProjects([]);
        }
      } catch (error) {
        console.error(`Error fetching projects for ${areaName}:`, error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    if (areaName) {
      fetchProjects();
    }
  }, [areaName]);

  // Filter projects by search query
  const filteredProjects = projects.filter((project) =>
    project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-16 md:pt-20">
        <section className="py-8 md:py-12 bg-black">
          <div className="max-w-[1600px] mx-auto px-4">
            <div className="mb-6 md:mb-8">
              <Link
                href="/areas"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Areas
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Projects in {areaName}</h1>
            </div>

            {/* Search Bar */}
            <div className="mb-6 md:mb-8">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for a project...."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-6 md:mb-8">
                  Results <span className="text-red-600 font-semibold">({filteredProjects.length} Orientation)</span>
                </p>
                {filteredProjects.length > 0 ? (
                  <div className="space-y-4 md:space-y-6">
                    {filteredProjects.map((project) => (
                      <ProjectCard key={project._id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <p>No projects found in this area</p>
                  </div>
                )}
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
