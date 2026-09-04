'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { projectsApi } from '@/lib/api/projects.api';

export interface HomepageProject {
  _id: string;
  title: string;
  location?: string;
  status?: string;
  published?: boolean;
  projectThumbnailUrl?: string;
  heroVideoUrl?: string;
  logoUrl?: string;
  developer?: { _id?: string; name: string; logoUrl?: string } | string | any;
  trendingScore?: number;
  rank?: number;
  episodes?: any[];
  hasAccess?: boolean;
  isFree?: boolean;
  // featured-specific
  ad_url?: string;
  adUrl?: string;
}

interface HomepageData {
  /** Featured projects for the Hero carousel */
  featuredProjects: HomepageProject[];
  /** All published projects (used for Latest + Area filtering) */
  allProjects: HomepageProject[];
  /** Top-10 trending projects */
  top10Projects: HomepageProject[];
  /** Upcoming / PLANNING status projects */
  upcomingProjects: HomepageProject[];
  /** True while the initial fetch is in progress */
  loading: boolean;
}

const HomepageDataContext = createContext<HomepageData>({
  featuredProjects: [],
  allProjects: [],
  top10Projects: [],
  upcomingProjects: [],
  loading: true,
});

/**
 * Fetches all homepage data in a single coordinated parallel fetch.
 * Components read from this context instead of making individual API calls.
 */
export function HomepageDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HomepageData>({
    featuredProjects: [],
    allProjects: [],
    top10Projects: [],
    upcomingProjects: [],
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      try {
        const [featured, all, top10, upcoming] = await Promise.all([
          projectsApi.getFeatured(3).catch(() => [] as HomepageProject[]),
          projectsApi.list({ limit: 80 }).catch(() => [] as HomepageProject[]),
          projectsApi.getTop10(10).catch(() => [] as HomepageProject[]),
          projectsApi.getUpcoming(10).catch(() => [] as HomepageProject[]),
        ]);

        if (cancelled) return;

        // Use featured data as-is — the /projects/featured endpoint already returns
        // the fields needed for the Hero carousel (title, thumbnail, heroVideoUrl, developer).
        // Individual GET /projects/:id calls are deliberately removed here to prevent
        // burst 429 rate-limit errors on every homepage load.
        const featuredList = (Array.isArray(featured) ? featured : []) as HomepageProject[];

        setData({
          featuredProjects: featuredList,
          allProjects: (Array.isArray(all) ? all : []) as HomepageProject[],
          top10Projects: (Array.isArray(top10) ? top10 : []) as HomepageProject[],
          upcomingProjects: (Array.isArray(upcoming) ? upcoming : []) as HomepageProject[],
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setData((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return (
    <HomepageDataContext.Provider value={data}>
      {children}
    </HomepageDataContext.Provider>
  );
}

/** Hook to consume homepage data from context */
export function useHomepageData(): HomepageData {
  return useContext(HomepageDataContext);
}

/**
 * Client-side location filter helper.
 * Matches project.location against a location name using
 * the same fuzzy strategy the old ProjectsByArea used — but
 * with zero network requests.
 */
export function filterByLocation(
  projects: HomepageProject[],
  location: string
): HomepageProject[] {
  const locationLower = location.toLowerCase().replace(/\s+/g, '');
  return projects.filter((p) => {
    const pl = (p.location ?? '').toLowerCase().replace(/\s+/g, '');
    return (
      pl === locationLower ||
      pl.includes(locationLower) ||
      locationLower.includes(pl)
    );
  });
}
