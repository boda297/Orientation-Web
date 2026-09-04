"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
  Gauge,
} from "lucide-react";
import Image from "next/image";
import { tokenStorage } from "@/lib/http/tokenStorage";

interface SecureVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  startTime?: number;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPause?: (currentTime: number, duration: number) => void;
  onClose?: () => void;
}

export default function SecureVideoPlayer({
  src,
  poster,
  title,
  autoPlay = true,
  startTime = 0,
  onEnded,
  onTimeUpdate,
  onPause,
  onClose,
}: SecureVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [centerAnimation, setCenterAnimation] = useState<"play" | "pause" | "fwd" | "rwd" | null>(null);

  // Watermark state
  const [userWatermark, setUserWatermark] = useState("");
  const [watermarkPos, setWatermarkPos] = useState({ top: 18, left: 20 });

  // Get user identity for watermark
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        if (tokenStorage.isValid()) {
          const payload = tokenStorage.getUserPayload();
          if (payload) {
            const id = payload.email || payload.phone || payload.name || payload.username || "";
            if (id) {
              setUserWatermark(id);
              return;
            }
          }
        }
        // Fallback info if stored in localStorage
        const storedUser = localStorage.getItem("user_info");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.email || parsed?.phone || parsed?.name) {
            setUserWatermark(parsed.email || parsed.phone || parsed.name);
            return;
          }
        }
      } catch {}
      setUserWatermark("");
    }
  }, []);

  // Floating watermark repositioning
  useEffect(() => {
    const moveWatermark = () => {
      const randomTop = Math.floor(Math.random() * 65) + 10;
      const randomLeft = Math.floor(Math.random() * 60) + 10;
      setWatermarkPos({ top: randomTop, left: randomLeft });
    };

    const interval = setInterval(moveWatermark, 9000);
    return () => clearInterval(interval);
  }, []);

  // Initial load
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (startTime > 0) {
      video.currentTime = startTime;
    }

    if (autoPlay) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [src, startTime, autoPlay]);

  // Handle controls auto-hide
  const triggerShowControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSpeedMenu && !isDragging) {
          setShowControls(false);
        }
      }, 2500);
    }
  }, [isPlaying, showSpeedMenu, isDragging]);

  const handleMouseMove = () => {
    triggerShowControls();
  };

  // Play / Pause Toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => {
        setIsPlaying(true);
        setCenterAnimation("play");
        setTimeout(() => setCenterAnimation(null), 500);
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      setCenterAnimation("pause");
      setTimeout(() => setCenterAnimation(null), 500);
      if (onPause) {
        onPause(video.currentTime, video.duration || 0);
      }
    }
    triggerShowControls();
  }, [onPause, triggerShowControls]);

  // Skip time (+/- seconds)
  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    setCenterAnimation(seconds > 0 ? "fwd" : "rwd");
    setTimeout(() => setCenterAnimation(null), 500);
    triggerShowControls();
  }, [triggerShowControls]);

  // Volume change
  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;

    const clamped = Math.max(0, Math.min(1, newVol));
    video.volume = clamped;
    setVolume(clamped);
    if (clamped === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Playback Rate
  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
    triggerShowControls();
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const onFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFSChange);
    return () => document.removeEventListener("fullscreenchange", onFSChange);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skipTime(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skipTime(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(volume + 0.1);
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(volume - 0.1);
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen().catch(() => {});
          } else if (onClose) {
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, skipTime, volume, isFullscreen, onClose]);

  // Video Events
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime, video.duration || 0);
    }

    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      setBuffered((bufferedEnd / (video.duration || 1)) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    setDuration(video.duration || 0);
    if (startTime > 0) {
      video.currentTime = startTime;
    }
  };

  // Progress Bar Seek
  const handleSeek = (clientX: number) => {
    const bar = progressBarRef.current;
    const video = videoRef.current;
    if (!bar || !video || !duration) return;

    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const seekTime = pos * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleProgressBarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    if (!bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);

    if (isDragging) {
      handleSeek(e.clientX);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;

    if (hours > 0) {
      return `${hours}:${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${remMins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => e.preventDefault()}
      className={`group relative w-full bg-black select-none overflow-hidden font-sans transition-all duration-300 ${
        isFullscreen ? "h-screen w-screen flex items-center justify-center" : "rounded-2xl max-h-[85vh] aspect-video"
      }`}
      style={{ WebkitUserSelect: "none", userSelect: "none" }}
    >
      {/* Native Video Element (Controls completely hidden) */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        controlsList="nodownload noplaybackrate nofullscreen"
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={(e) => e.preventDefault()}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        className="w-full h-full object-contain cursor-pointer bg-black"
      />

      {/* Floating Dynamic Watermark (Official Logo & clean branding) */}
      <div
        className="absolute z-30 pointer-events-none select-none transition-all duration-[4000ms] ease-in-out"
        style={{
          top: `${watermarkPos.top}%`,
          left: `${watermarkPos.left}%`,
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl opacity-75 hover:opacity-100 transition-opacity">
          <Image
            src="/assets/logo/logo.png"
            alt="Orientation"
            width={24}
            height={24}
            className="w-5 h-5 md:w-6 md:h-6 object-contain"
            unoptimized
          />
          <div className="flex flex-col">
            <span className="text-white/90 text-[11px] md:text-xs font-bold tracking-wider leading-none">
              ORIENTATION
            </span>
            {userWatermark ? (
              <span className="text-white/60 text-[9px] md:text-[10px] font-mono leading-tight mt-0.5 max-w-[140px] truncate">
                {userWatermark}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Center Animation Ripples (Play/Pause/Seek Feedback) */}
      {centerAnimation && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-25">
          <div className="w-20 h-20 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-100 animate-out fade-out zoom-out duration-500 shadow-2xl">
            {centerAnimation === "play" && <Play className="w-10 h-10 fill-white translate-x-0.5" />}
            {centerAnimation === "pause" && <Pause className="w-10 h-10 fill-white" />}
            {centerAnimation === "fwd" && (
              <div className="flex flex-col items-center">
                <RotateCw className="w-8 h-8" />
                <span className="text-[10px] font-bold mt-0.5">+10s</span>
              </div>
            )}
            {centerAnimation === "rwd" && (
              <div className="flex flex-col items-center">
                <RotateCcw className="w-8 h-8" />
                <span className="text-[10px] font-bold mt-0.5">-10s</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Bar (Title & Close Button) */}
      <div
        className={`absolute top-0 left-0 right-0 z-40 p-4 md:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between pointer-events-auto ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          <h2 className="text-white font-semibold text-sm md:text-base tracking-wide drop-shadow-md truncate max-w-[70vw]">
            {title || "Episode"}
          </h2>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-40 px-4 py-3 md:px-6 md:py-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-all duration-300 flex flex-col gap-2 pointer-events-auto ${
          showControls || !isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
      >
        {/* Timeline / Progress Scrubber */}
        <div
          ref={progressBarRef}
          onMouseDown={(e) => {
            setIsDragging(true);
            handleSeek(e.clientX);
          }}
          onMouseMove={handleProgressBarMouseMove}
          onMouseLeave={() => setHoverTime(null)}
          onMouseUp={() => setIsDragging(false)}
          className="relative w-full h-3 group/timeline cursor-pointer flex items-center"
        >
          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 px-2 py-1 bg-black/90 backdrop-blur-md border border-white/20 rounded text-[11px] font-mono text-white font-medium shadow-xl pointer-events-none transform -translate-x-1/2"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Track background */}
          <div className="w-full h-1.5 group-hover/timeline:h-2.5 bg-white/20 rounded-full overflow-hidden transition-all duration-200 relative">
            {/* Buffered bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/30 rounded-full transition-all duration-300"
              style={{ width: `${buffered}%` }}
            />
            {/* Played progress bar */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-400 rounded-full relative"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg border border-blue-500 scale-0 group-hover/timeline:scale-100 transition-transform duration-150 pointer-events-none"
            style={{ left: `calc(${progressPercent}% - 7px)` }}
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between text-white select-none">
          {/* Left Controls (Play, Skip, Volume, Time) */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full hover:bg-white/15 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              )}
            </button>

            {/* Replay 10s */}
            <button
              onClick={() => skipTime(-10)}
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-all text-white/80 hover:text-white"
              title="Rewind 10s (←)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Forward 10s */}
            <button
              onClick={() => skipTime(10)}
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-all text-white/80 hover:text-white"
              title="Forward 10s (→)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 group/volume ml-1">
              <button
                onClick={toggleMute}
                className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-all text-white/80 hover:text-white"
                title={isMuted ? "Unmute (M)" : "Mute (M)"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-0 group-hover/volume:w-16 md:group-hover/volume:w-20 transition-all duration-300 h-1 accent-blue-500 cursor-pointer opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            {/* Time Display */}
            <div className="text-xs md:text-sm font-mono text-white/80 ml-2">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1 text-white/40">/</span>
              <span className="text-white/50">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Right Controls (Speed, Fullscreen) */}
          <div className="flex items-center gap-2 relative">
            {/* Speed Selector Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1 rounded-lg hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 transition-all text-white/90 hover:text-white border border-white/10"
                title="Playback Speed"
              >
                <Gauge className="w-3.5 h-3.5 text-blue-400" />
                <span>{playbackRate === 1 ? "1x" : `${playbackRate}x`}</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1.5 w-28 bg-neutral-900/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40 border-b border-white/10">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-3 py-1.5 text-left text-xs font-medium transition-colors flex items-center justify-between ${
                        playbackRate === speed
                          ? "bg-blue-600/30 text-blue-400 font-bold"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                      {playbackRate === speed && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-9 h-9 rounded-full hover:bg-white/15 flex items-center justify-center transition-all text-white/90 hover:text-white"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
