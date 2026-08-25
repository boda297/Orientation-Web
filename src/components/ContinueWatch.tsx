'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { watchHistoryApi } from '@/lib/api/watchHistory.api';
import { getFileUrl } from '@/lib/http/url';
import { tokenStorage } from '@/lib/http/tokenStorage';

export interface WatchHistoryEntry {
  episodeId: string;
  projectId: string;
  projectTitle: string;
  episodeTitle: string;
  thumbnail: string;
  episodeUrl?: string; // Pre-cached for instant direct playback
  currentTime: number;
  duration: number;
  timestamp: number; // Date.now()
}

/**
 * Saves watch progress.
 * - Always updates `localStorage` instantly (0 network requests).
 * - Only sends an HTTP request to the backend database when `syncToBackend === true` (on pause, end, or video close).
 */
export function saveWatchProgress(entry: WatchHistoryEntry, syncToBackend: boolean = false) {
  if (typeof window === 'undefined') return;
  try {
    const history: WatchHistoryEntry[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    // Update existing or add new
    const existingIndex = history.findIndex(h => h.episodeId === entry.episodeId);
    if (existingIndex >= 0) {
      history[existingIndex] = { ...history[existingIndex], ...entry, timestamp: Date.now() };
    } else {
      history.unshift({ ...entry, timestamp: Date.now() });
    }
    // Keep only last 20 items
    const trimmed = history.slice(0, 20);
    localStorage.setItem('watchHistory', JSON.stringify(trimmed));

    // Send HTTP request to backend ONLY when explicitly requested (on pause or close)
    if (syncToBackend && tokenStorage.isValid() && entry.episodeId) {
      watchHistoryApi.updateProgress({
        projectId: entry.projectId,
        projectTitle: entry.projectTitle,
        contentId: entry.episodeId,
        contentTitle: entry.episodeTitle || 'Episode',
        contentThumbnail: entry.thumbnail,
        episodeUrl: entry.episodeUrl,
        currentTime: Math.floor(entry.currentTime),
        duration: Math.max(1, Math.floor(entry.duration)),
        contentType: 'episode',
      }).catch(() => {
        // Silently catch background sync failures
      });
    }
  } catch (e) {
    console.warn('Failed to save watch progress:', e);
  }
}

/**
 * Removes a specific episode from watch history in localStorage.
 */
export function removeWatchProgress(episodeId: string) {
  if (typeof window === 'undefined' || !episodeId) return;
  try {
    const history: WatchHistoryEntry[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    const filtered = history.filter(h => h.episodeId !== episodeId);
    localStorage.setItem('watchHistory', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to remove watch progress from localStorage:', e);
  }
}

// Helper to validate MongoDB ObjectId format (24 hex characters)
function isValidMongoId(id: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(id);
}

// Helper to get watch history from localStorage (0 network requests)
export function getWatchHistory(): WatchHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const history: WatchHistoryEntry[] = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    // Filter out completed (>95%), and entries with invalid projectId
    const valid = history
      .filter(h =>
        h.duration > 0 &&
        (h.currentTime / h.duration) < 0.95 &&
        h.projectId &&
        isValidMongoId(h.projectId)
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    // Auto-cleanup: if some entries were removed, update localStorage
    if (valid.length !== history.length) {
      localStorage.setItem('watchHistory', JSON.stringify(valid));
    }

    return valid;
  } catch {
    return [];
  }
}

// Helper to clear watch history
export function clearWatchHistory() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('watchHistory');
}

export default function ContinueWatch() {
  const [items, setItems] = useState<WatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setHasMounted(true);
      const authenticated = tokenStorage.isValid();
      setIsLoggedIn(authenticated);

      // Completely invisible for guest users
      if (!authenticated) {
        setItems([]);
        setLoading(false);
        return;
      }

      // 1. Local-First: Check localStorage immediately (0 network requests)
      const localHistory = getWatchHistory();
      if (localHistory.length > 0) {
        setItems(localHistory);
        setLoading(false);
        return;
      }

      // 2. Only if local storage is empty, fetch once from backend to seed local cache (e.g. new device/browser)
      try {
        setLoading(true);
        const data = await watchHistoryApi.getContinueWatching(10);
        if (data && data.items && data.items.length > 0) {
          const apiItems: WatchHistoryEntry[] = data.items
            .map((item: any) => {
              // Extract project ID - try multiple paths from the API response
              let projectId = '';
              if (item.projectId) {
                projectId = typeof item.projectId === 'object' ? item.projectId._id || item.projectId.id || '' : item.projectId;
              } else if (item.project) {
                projectId = typeof item.project === 'object' ? item.project._id || item.project.id || '' : item.project;
              } else if (typeof item.contentId === 'object' && item.contentId) {
                projectId = item.contentId.project || item.contentId._id || item.contentId.id || '';
              } else if (typeof item.contentId === 'string') {
                projectId = item.contentId;
              }

              return {
                episodeId: item._id || '',
                projectId: String(projectId),
                projectTitle: item.projectTitle || '',
                episodeTitle: item.contentTitle || 'Untitled',
                thumbnail: item.contentThumbnail || '',
                currentTime: item.currentTime || 0,
                duration: item.duration || 1,
                timestamp: item.updatedAt ? new Date(item.updatedAt).getTime() : Date.now(),
              };
            })
            .filter((item: WatchHistoryEntry) => item.projectId && isValidMongoId(item.projectId));

          if (apiItems.length > 0) {
            setItems(apiItems);
            localStorage.setItem('watchHistory', JSON.stringify(apiItems));
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to fetch continue watching from server:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();

    window.addEventListener('auth-change', fetchHistory);
    window.addEventListener('storage', fetchHistory);
    return () => {
      window.removeEventListener('auth-change', fetchHistory);
      window.removeEventListener('storage', fetchHistory);
    };
  }, []);

  if (!hasMounted || !isLoggedIn) {
    return null; // Don't show anything to guest users
  }

  if (loading) {
    return null; // Local-first loading is instant, avoid layout shifts
  }

  if (items.length === 0) {
    return null; // Don't show section if no history
  }

  return (
    <section className="py-4 md:py-6 bg-black">
      <div className="max-w-[1600px] mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">Continue Watching</h2>
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((item) => {
            const progressPercent = item.duration > 0 ? Math.min(100, Math.round((item.currentTime / item.duration) * 100)) : 0;
            const minutesLeft = Math.max(0, Math.ceil((item.duration - item.currentTime) / 60));

            return (
              <Link
                href={`/project/${item.projectId}?tab=Episodes&episode=${item.episodeId}&time=${Math.floor(item.currentTime)}`}
                key={item.episodeId}
                className="block flex-shrink-0 w-48 sm:w-56 md:w-64 group cursor-pointer"
              >
                <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden mb-3">
                  <div
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundImage: item.thumbnail ? `url(${getFileUrl(item.thumbnail)})` : 'linear-gradient(135deg, #1a1a2e, #16213e)' }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300" />

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50">
                    <div
                      className="h-full bg-red-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Time Left */}
                  {minutesLeft > 0 && (
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {minutesLeft} min left
                    </div>
                  )}

                  {/* Play Button - Minimal Transparent */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-black/30 backdrop-blur-md border border-white/50 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-white/20 group-hover:border-white transition-all duration-300">
                      <svg className="w-5 h-5 md:w-8 md:h-8 text-white ml-0.5 md:ml-1 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-white font-semibold mb-1 text-sm md:text-base truncate">{item.episodeTitle}</h3>
                <p className="text-gray-400 text-xs md:text-sm truncate">{item.projectTitle}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

