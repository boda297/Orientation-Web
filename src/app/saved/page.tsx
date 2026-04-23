'use client';

import { useEffect, useState } from 'react';
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

export default function SavedProjectsPage() {
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProjects = async () => {
      try {
        setLoading(true);
        // Get saved project IDs from localStorage
        const savedIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');
        
        if (savedIds.length === 0) {
          setSavedProjects([]);
          setLoading(false);
          return;
        }

        // Fetch all saved projects
        const projectsPromises = savedIds.map((id: string) => 
          api.getProject(id).catch(() => null)
        );
        
        const projects = await Promise.all(projectsPromises);
        const validProjects = projects.filter((p): p is Project => p !== null && (p as any).published === true);
        
        setSavedProjects(validProjects);
      } catch (error) {
        console.error('Error fetching saved projects:', error);
        setSavedProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProjects();
  }, []);

  const removeFromSaved = (projectId: string) => {
    const savedIds = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const updatedIds = savedIds.filter((id: string) => id !== projectId);
    localStorage.setItem('savedProjects', JSON.stringify(updatedIds));
    setSavedProjects(savedProjects.filter(p => p._id !== projectId));
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="pt-16 md:pt-20">
        <section className="py-8 md:py-12 bg-black">
          <div className="max-w-[1600px] mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Saved Projects</h1>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              </div>
            ) : savedProjects.length > 0 ? (
              <>
                <p className="text-gray-400 mb-6 md:mb-8">
                  Results <span className="text-red-600 font-semibold">({savedProjects.length} Projects)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {savedProjects.map((project) => (
                    <div
                      key={project._id}
                      className="group relative bg-gray-900/60 hover:bg-gray-900 rounded-lg overflow-hidden transition-colors"
                    >
                      <Link href={`/project/${project._id}`}>
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-gray-800 overflow-hidden">
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
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        {/* Project Info */}
                        <div className="p-4">
                          <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">{project.title}</h3>
                          {project.location && (
                            <p className="text-gray-300 text-sm mb-2">{project.location}</p>
                          )}
                          {project.developer?.name && (
                            <p className="text-gray-400 text-xs">{project.developer.name}</p>
                          )}
                        </div>
                      </Link>
                      
                      {/* Remove Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromSaved(project._id);
                        }}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors z-10"
                        title="Remove from saved"
                      >
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="w-16 h-16 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg mb-2">No saved projects yet</p>
                <p className="text-gray-500 text-sm mb-6">Start saving projects to see them here</p>
                <Link 
                  href="/"
                  className="inline-block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Browse Projects
                </Link>
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
