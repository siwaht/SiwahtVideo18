import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
// Removed slider dependency for performance optimization
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: string | number;
  height?: string | number;
  gifLike?: boolean; // Play like a GIF: autoplay, loop, muted, no controls
}

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
  muted = false,
  controls = true,
  width = "100%",
  height = "auto",
  gifLike = false,
}: VideoPlayerProps) {
  // Override props when in GIF-like mode
  const isGifLike = gifLike;
  const shouldAutoPlay = isGifLike || autoPlay;
  const shouldMute = isGifLike || muted;
  const shouldShowControls = !isGifLike && controls;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(shouldAutoPlay);
  const [isMuted, setIsMuted] = useState(shouldMute);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(shouldMute ? 0 : 1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(shouldShowControls);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      
      // Force play for GIF-like videos after metadata is loaded
      if (isGifLike && shouldAutoPlay) {
        video.play().catch((error) => {
          video.muted = true;
          video.play().catch((e) => {
          });
        });
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    const handleError = (e: Event) => {
      setHasError(true);
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("volumechange", handleVolumeChange);
    video.addEventListener("error", handleError);
    video.addEventListener("loadstart", handleLoadStart);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("volumechange", handleVolumeChange);
      video.removeEventListener("error", handleError);
      video.removeEventListener("loadstart", handleLoadStart);
    };
  }, [isGifLike, shouldAutoPlay]);

  // Auto-play for GIF-like videos when they come into view (global auto-pause handles pausing)
  useEffect(() => {
    if (!isGifLike) return;
    
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // GIF-like video is visible, start playing
            video.play().catch((error) => {
            });
          }
          // Note: Pausing is now handled by the global auto-pause system
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isGifLike, src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = value[0];
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = value[0];
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const retry = () => {
    const video = videoRef.current;
    if (!video) return;
    
    setHasError(false);
    setIsLoading(true);
    video.load();
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          "relative bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center text-white",
          className
        )}
        style={{ width, height: height === "auto" ? "300px" : height }}
      >
        <div className="text-center p-6">
          <div className="text-slate-400 mb-4">
            <Play className="h-12 w-12 mx-auto mb-2" />
            <p className="text-sm">Unable to load video</p>
            {title && <p className="text-xs text-slate-500 mt-1">{title}</p>}
          </div>
          <Button
            onClick={retry}
            variant="outline"
            size="sm"
            className="gap-2 text-white border-white/20 hover:bg-white/10"
          >
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group flex items-center justify-center",
        className
      )}
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={shouldAutoPlay}
        muted={shouldMute}
        loop={isGifLike}
        className="w-full h-full object-cover"
        onClick={isGifLike ? undefined : togglePlay}
        data-testid="video-element"
        playsInline
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading video...</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay - only show if not in GIF-like mode */}
      {!isGifLike && !isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Button
            onClick={togglePlay}
            size="lg"
            className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 text-white border-0"
            data-testid="play-overlay-button"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>
      )}

      {/* Mute Button for GIF-like videos - always visible */}
      {isGifLike && (
        <div className="absolute top-3 right-3 opacity-80 hover:opacity-100 transition-opacity">
          <Button
            onClick={toggleMute}
            size="sm"
            variant="ghost"
            className="rounded-full w-10 h-10 bg-black/40 hover:bg-black/60 text-white border-0 p-0"
            data-testid="gif-mute-button"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Custom Controls - only show if shouldShowControls is true */}
      {shouldShowControls && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-white/20 rounded-full h-1 relative cursor-pointer"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const percent = (e.clientX - rect.left) / rect.width;
                   handleSeek([percent * (duration || 100)]);
                 }}>
              <div 
                className="bg-white rounded-full h-1 transition-all duration-150"
                style={{ width: `${(currentTime / (duration || 100)) * 100}%` }}
              />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <Button
                onClick={togglePlay}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1"
                data-testid="play-pause-button"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleMute}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20 p-1"
                  data-testid="mute-button"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                <div className="w-20">
                  <div className="w-full bg-white/20 rounded-full h-1 relative cursor-pointer"
                       onClick={(e) => {
                         const rect = e.currentTarget.getBoundingClientRect();
                         const percent = (e.clientX - rect.left) / rect.width;
                         handleVolumeChange([percent]);
                       }}>
                    <div 
                      className="bg-white rounded-full h-1 transition-all duration-150"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-sm text-white/80">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {title && (
                <span className="text-sm text-white/80 hidden sm:block">
                  {title}
                </span>
              )}
              
              <Button
                onClick={toggleFullscreen}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1"
                data-testid="fullscreen-button"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}