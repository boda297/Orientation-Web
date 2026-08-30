"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        ep.thumbnail
                          ? getFileUrl(ep.thumbnail)
                          : project.projectThumbnailUrl
                          ? getFileUrl(project.projectThumbnailUrl)
                          : "/placeholder.jpg"
                      }
                      alt={ep.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="text-white font-medium">
                        {ep.title || `Episode ${ep.episodeOrder || ""}`}
                      </h4>
                      {ep.duration && (
                        <span className="text-gray-400 text-xs">
                          {ep.duration}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {isLocked ? (
                      <span className="text-amber-400">🔒</span>
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
                  className="p-4 bg-gray-900 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
                >
                  <span className="text-white">
                    {inv.title || `${project.title} Inventory`}
                  </span>
                  <span
                    className={`text-sm px-3 py-1 rounded font-medium ${
                      isLocked
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {isLocked ? "🔒 Subscribe to View" : "Download File"}
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
                  className="p-4 bg-gray-900 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-800 transition"
                >
                  <span className="text-white">📄 {file.title}</span>
                  <span
                    className={`text-sm px-3 py-1 rounded font-medium ${
                      isLocked
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-600/20 text-red-400 border border-red-600/30"
                    }`}
                  >
                    {isLocked ? "🔒 Subscribe to Download" : "Open PDF"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-400 py-6 text-center">No PDFs available</p>
          )}
        </div>
      )}

      {/* ── Subscribe Modal ── */}
      {showSubscribeModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4"
          onClick={() => {
            setIsSubscribeModalClosing(true);
            setTimeout(() => {
              setShowSubscribeModal(false);
              setIsSubscribeModalClosing(false);
            }, 300);
          }}
        >
          <div
            className="bg-[#111] border border-zinc-800 text-white rounded-2xl max-w-md w-full p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              🔒
            </div>
            <h3 className="text-2xl font-bold">Subscription Required</h3>
            <p className="text-gray-300 text-sm mt-2">
              {lockedItemName} is exclusive to subscribers. Subscribe now to get
              unlimited access to all project episodes, reels, inventory, and PDFs.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowSubscribeModal(false);
                  router.push("/checkout");
                }}
                className="w-full bg-red-600 hover:bg-red-700 font-bold py-3 rounded-lg text-white transition-colors"
              >
                Go to Subscribe
              </button>
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
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
