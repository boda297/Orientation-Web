"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { tokenStorage } from "@/lib/http/tokenStorage";
import { getFileUrl } from "@/lib/http/url";
import type { IProject, ProjectEpisode, ProjectInventory, ProjectPdf } from "@/types/projects.types";

export interface ProjectTabsProps {
  project: IProject;
  onPlayEpisode?: (episode: ProjectEpisode) => void;
  onOpenInventory?: (inventory: ProjectInventory) => void;
  onOpenPdf?: (pdf: ProjectPdf) => void;
}

export function ProjectTabs({
  project,
  onPlayEpisode,
  onOpenInventory,
  onOpenPdf,
}: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<"episodes" | "inventory" | "pdf">("episodes");
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [isSubscribeModalClosing, setIsSubscribeModalClosing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthModalClosing, setIsAuthModalClosing] = useState(false);
  const [lockedItemName, setLockedItemName] = useState("");
  const router = useRouter();

  // Unified click handler for all locked media
  const handleItemClick = (
    item: any,
    type: "Episode" | "Inventory" | "Brochure" | "PDF"
  ) => {
    // 1. Guest user check -> Show Login Modal
    if (!tokenStorage.isValid()) {
      setShowAuthModal(true);
      return;
    }

    // 2. Unsubscribed user check -> Show Subscribe Modal
    if (!project?.hasAccess || item?.locked) {
      const title =
        item?.title ||
        item?.fileName ||
        (type === "Episode" ? `Episode ${item?.episodeOrder || ""}` : type);
      setLockedItemName(`${type}: "${title}"`);
      setShowSubscribeModal(true);
      return;
    }

    // 3. Subscribed / Unlocked user -> Open/Play content
    if (type === "Episode") {
      if (onPlayEpisode) {
        onPlayEpisode(item);
      } else if (item?.episodeUrl) {
        window.open(getFileUrl(item.episodeUrl), "_blank");
      }
    }

    if (type === "Inventory") {
      if (onOpenInventory) {
        onOpenInventory(item);
      } else {
        const url = item?.inventoryUrl || item?.fileUrl;
        if (url) window.open(getFileUrl(url), "_blank");
      }
    }

    if (type === "PDF" || type === "Brochure") {
      if (onOpenPdf) {
        onOpenPdf(item);
      } else {
        const url = item?.pdfUrl || item?.fileUrl;
        if (url) window.open(getFileUrl(url), "_blank");
      }
    }
  };

  const episodes = project.episodes || [];
  const inventory = Array.isArray(project.inventory)
    ? project.inventory
    : project.inventory
    ? [project.inventory]
    : [];
  const pdfs = project.pdf || [];

  return (
    <div className="w-full">
      {/* ── Tabs Navigation ── */}
      <div className="flex gap-4 border-b border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("episodes")}
          className={`pb-2 font-semibold transition-colors ${
            activeTab === "episodes"
              ? "text-red-500 border-b-2 border-red-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Episodes ({episodes.length})
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`pb-2 font-semibold transition-colors ${
            activeTab === "inventory"
              ? "text-red-500 border-b-2 border-red-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Inventory
        </button>
        <button
          onClick={() => setActiveTab("pdf")}
          className={`pb-2 font-semibold transition-colors ${
            activeTab === "pdf"
              ? "text-red-500 border-b-2 border-red-500 font-bold"
              : "text-gray-400 hover:text-white"
          }`}
        >
          PDF ({pdfs.length})
        </button>
      </div>

      {/* ── Episodes Tab ── */}
      {activeTab === "episodes" && (
        <div className="mt-4 flex flex-col gap-3">
          {episodes.length > 0 ? (
            episodes.map((ep: any) => {
              const isLocked = !project?.hasAccess || !!ep.locked;
              return (
                <div
                  key={ep._id}
                  onClick={() => handleItemClick(ep, "Episode")}
                  className="flex items-center justify-between p-3 bg-gray-900/60 hover:bg-gray-900 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900 border border-white/10 shadow-sm">
                      <img
                        src={
                          ep.thumbnail
                            ? getFileUrl(ep.thumbnail)
                            : project.projectThumbnailUrl
                            ? getFileUrl(project.projectThumbnailUrl)
                            : "/placeholder.jpg"
                        }
                        alt={ep.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                      {/* Light Sweep Shimmer Ray */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none skew-x-12" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium group-hover:text-red-500 transition-colors">
                        {ep.title || `Episode ${ep.episodeOrder || ""}`}
                      </h4>
                      {ep.duration && (
                        <span className="text-gray-400 text-xs">
                          {ep.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div>
                    {isLocked ? (
                      <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-red-500/80 text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] active:scale-95 select-none backdrop-blur-sm"
                      >
                        <Lock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                        <span>Subscribe to watch</span>
                      </button>
                    ) : (
                      <span className="text-white">▶</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 py-6 text-center">No episodes available</p>
          )}
        </div>
      )}

      {/* ── Inventory Tab ── */}
      {activeTab === "inventory" && (
        <div className="mt-4 flex flex-col gap-3">
          {inventory.length > 0 ? (
            inventory.map((inv: any, idx: number) => {
              const isLocked = !project?.hasAccess || !!inv.locked;
              return (
                <div
                  key={inv._id || idx}
                  onClick={() => handleItemClick(inv, "Inventory")}
                  className="p-4 bg-gray-900/60 hover:bg-gray-900 rounded-xl flex justify-between items-center cursor-pointer transition-all"
                >
                  <span className="text-white">
                    {inv.title || `${project.title} Inventory`}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm active:scale-95 ${
                      isLocked
                        ? "bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-sm"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                        <span>Subscribe to View</span>
                      </>
                    ) : (
                      "Download File"
                    )}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 py-6 text-center">No inventory available</p>
          )}
        </div>
      )}

      {/* ── PDF Tab ── */}
      {activeTab === "pdf" && (
        <div className="mt-4 flex flex-col gap-3">
          {pdfs.length > 0 ? (
            pdfs.map((file: any) => {
              const isLocked = !project?.hasAccess || !!file.locked;
              return (
                <div
                  key={file._id}
                  onClick={() => handleItemClick(file, "Brochure")}
                  className="p-4 bg-gray-900/60 hover:bg-gray-900 rounded-xl flex justify-between items-center cursor-pointer transition-all"
                >
                  <span className="text-white">📄 {file.title}</span>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-sm active:scale-95 ${
                      isLocked
                        ? "bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 hover:text-white border border-zinc-700/80 hover:border-red-500/80 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] backdrop-blur-sm"
                        : "bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600 hover:text-white"
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                        <span>Subscribe to Download</span>
                      </>
                    ) : (
                      "Open PDF"
                    )}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 py-6 text-center">No PDFs available</p>
          )}
        </div>
      )}

      {/* ── Subscribe Modal (2-Column Stitch Design) ── */}
      {showSubscribeModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-[20px] flex items-center justify-center p-5 md:p-16"
          onClick={() => {
            setIsSubscribeModalClosing(true);
            setTimeout(() => {
              setShowSubscribeModal(false);
              setIsSubscribeModalClosing(false);
            }, 300);
          }}
        >
          <div
            className="bg-[#111114] border border-white/10 rounded-xl max-w-[780px] w-full overflow-hidden shadow-2xl relative flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Stitch Image */}
            <div className="w-full md:w-1/2 relative min-h-[300px] md:min-h-[500px] bg-black">
              <img
                src="/assets/subscription-modal-preview.jpg"
                alt="Orientation VIP Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Vignette effect */}
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 80px rgba(17, 17, 20, 0.9)' }} />
              {/* Mobile bottom gradient blend */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111114] to-transparent md:hidden" />
              {/* Desktop right gradient blend */}
              <div className="hidden md:block absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#111114] to-transparent" />
            </div>

            {/* Right Column: Content & Actions */}
            <div className="w-full md:w-1/2 p-5 md:p-8 flex flex-col justify-center bg-[#111114]">
              <div className="mb-4">
                {/* VIP Badge */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide mb-4 border" style={{ background: 'rgba(255, 84, 81, 0.1)', color: '#ffb3ad', borderColor: 'rgba(255, 84, 81, 0.3)' }}>
                  Orientation VIP
                </span>

                {/* Headline */}
                <h2 className="text-2xl md:text-[32px] font-bold text-[#e2e2e2] mb-2 leading-tight tracking-tight">
                  Unlock Full Access
                </h2>

                {/* Subtitle */}
                <p className="text-sm text-[#e4beba] leading-relaxed">
                  Gain exclusive access to the full {project?.title ? `'${project.title}'` : 'Orientation'} series and more.
                </p>
              </div>

              {/* Benefits Grid - Glassmorphism Cards */}
              <div className="grid grid-cols-2 gap-2.5 mb-6 md:mb-8">
                <div className="rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 group hover:border-[#ff5451]/60 transition-colors duration-300" style={{ background: 'rgba(53, 53, 53, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <svg className="w-6 h-6 text-[#ffb3ad] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold text-[#e2e2e2] tracking-wide">All Orientations</span>
                </div>

                <div className="rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 group hover:border-[#ff5451]/60 transition-colors duration-300" style={{ background: 'rgba(53, 53, 53, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <svg className="w-6 h-6 text-[#ffb3ad] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-xs font-semibold text-[#e2e2e2] tracking-wide">Exclusive Orientations</span>
                </div>

                <div className="rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 group hover:border-[#ff5451]/60 transition-colors duration-300" style={{ background: 'rgba(53, 53, 53, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <svg className="w-6 h-6 text-[#ffb3ad] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="text-xs font-semibold text-[#e2e2e2] tracking-wide">Campaign Sales Videos</span>
                </div>

                <div className="rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 group hover:border-[#ff5451]/60 transition-colors duration-300" style={{ background: 'rgba(53, 53, 53, 0.4)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <svg className="w-6 h-6 text-[#ffb3ad] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                  <span className="text-xs font-semibold text-[#e2e2e2] tracking-wide">Restaurant & Events</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={() => {
                    setIsSubscribeModalClosing(true);
                    setTimeout(() => {
                      setShowSubscribeModal(false);
                      setIsSubscribeModalClosing(false);
                      router.push("/checkout");
                    }, 300);
                  }}
                  className="relative inline-flex h-13 md:h-14 w-full overflow-hidden rounded-xl p-[1.5px] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer group select-none shadow-[0_0_20px_rgba(255,51,85,0.25)] hover:shadow-[0_0_30px_rgba(255,51,85,0.45)]"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2.5s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#ff3355_0%,#ef4444_25%,#7f1d1d_50%,#ef4444_75%,#ff3355_100%)]" />
                  <span className="inline-flex h-full w-full items-center justify-center gap-2 rounded-xl bg-zinc-950/90 group-hover:bg-zinc-950/70 px-6 py-2 text-base md:text-lg font-bold text-white backdrop-blur-3xl transition-colors">
                    <span>Go to Subscribe</span>
                    <svg className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubscribeModalClosing(true);
                    setTimeout(() => {
                      setShowSubscribeModal(false);
                      setIsSubscribeModalClosing(false);
                    }, 300);
                  }}
                  className="text-[#e4beba] hover:text-[#ffb3ad] transition-colors text-xs font-semibold uppercase tracking-[0.05em] text-center py-2 cursor-pointer"
                >
                  Cancel / Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Auth / Login Modal ── */}
      {showAuthModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={() => {
            setIsAuthModalClosing(true);
            setTimeout(() => {
              setShowAuthModal(false);
              setIsAuthModalClosing(false);
            }, 300);
          }}
        >
          <div
            className="bg-[#111] border border-zinc-800 text-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">Login Required</h3>
            <p className="text-gray-300 text-sm mt-2">
              You need to log in to your account first in order to interact and access all project features.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  router.push("/login");
                }}
                className="w-full bg-red-600 hover:bg-red-700 font-bold py-3 rounded-lg text-white transition-colors"
              >
                Okay, Log in
              </button>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectTabs;
