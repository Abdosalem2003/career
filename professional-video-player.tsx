import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Radio,
  Users,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react";

interface ProfessionalVideoPlayerProps {
  streamUrl?: string;
  streamType?: "rtmp" | "external" | "webrtc" | "hls";
  isLive?: boolean;
  viewerCount?: number;
  title?: string;
  onLike?: () => void;
  onShare?: () => void;
  autoPlay?: boolean;
}

export function ProfessionalVideoPlayer({
  streamUrl,
  streamType = "external",
  isLive = false,
  viewerCount = 0,
  title,
  onLike,
  onShare,
  autoPlay = true,
}: ProfessionalVideoPlayerProps) {
  const { language } = useI18n();
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [quality, setQuality] = useState<"auto" | "1080p" | "720p" | "480p" | "360p">("auto");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  // Update time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Change volume
  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0];
    video.volume = newVolume / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Seek
  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video || isLive) return;

    video.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video || isLive) return;

    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  // Change playback speed
  const changeSpeed = () => {
    const video = videoRef.current;
    if (!video) return;

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    
    video.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  // Handle like
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike();
  };

  // Get video source based on type
  const getVideoSource = () => {
    if (!streamUrl) return null;

    // For YouTube, convert to embed URL
    if (streamType === "external" && streamUrl.includes("youtube.com")) {
      const videoId = streamUrl.split("v=")[1]?.split("&")[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}&controls=1&rel=0`;
    }

    // For other external URLs
    if (streamType === "external") {
      return streamUrl;
    }

    // For RTMP/HLS/WebRTC
    return streamUrl;
  };

  const videoSource = getVideoSource();

  return (
    <div
      ref={containerRef}
      className="relative group"
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <Card className="overflow-hidden border-0 shadow-2xl">
        <div className="relative aspect-video bg-black">
          {/* Video/Iframe Player */}
          {streamType === "external" && videoSource ? (
            <iframe
              ref={iframeRef}
              src={videoSource}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (streamType === "webrtc" || streamType === "hls" || streamType === "rtmp") && videoSource ? (
            <video
              ref={videoRef}
              src={videoSource}
              autoPlay={autoPlay}
              className="w-full h-full object-cover"
              onClick={togglePlay}
              onError={(e) => {
                console.error("Video error:", e);
                setBuffering(false);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Radio className="h-20 w-20 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold">
                  {language === "ar" ? "لا يوجد بث متاح" : "No Stream Available"}
                </p>
              </div>
            </div>
          )}

          {/* Live Badge */}
          {isLive && (
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg px-4 py-2 text-sm font-bold">
                <motion.div
                  className="w-2 h-2 rounded-full bg-white mr-2"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                {language === "ar" ? "مباشر" : "LIVE"}
              </Badge>
            </div>
          )}

          {/* Viewer Count */}
          {isLive && viewerCount > 0 && (
            <div className="absolute top-4 right-4 z-10">
              <div className="backdrop-blur-md bg-black/50 px-4 py-2 rounded-full flex items-center gap-2">
                <Users className="h-4 w-4 text-white" />
                <span className="text-white font-bold">{viewerCount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Buffering Indicator */}
          {buffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}

          {/* Controls Overlay */}
          {streamType !== "external" && (
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10"
                >
                  {/* Top Bar */}
                  <div className="absolute top-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        {title && (
                          <h3 className="text-white font-bold text-lg">{title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={handleLike}
                        >
                          <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        </Button>
                        {onShare && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={onShare}
                          >
                            <Share2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center Play Button */}
                  {!isPlaying && !buffering && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={togglePlay}
                        className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        <Play className="h-10 w-10 text-white ml-1" />
                      </motion.button>
                    </div>
                  )}

                  {/* Bottom Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    {/* Progress Bar */}
                    {!isLive && duration > 0 && (
                      <div className="space-y-1">
                        <Slider
                          value={[currentTime]}
                          max={duration}
                          step={0.1}
                          onValueChange={handleSeek}
                          className="cursor-pointer"
                        />
                        <div className="flex items-center justify-between text-xs text-white/80">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>
                    )}

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      {/* Left Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={togglePlay}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>

                        {!isLive && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={() => skip(-10)}
                            >
                              <SkipBack className="h-5 w-5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={() => skip(10)}
                            >
                              <SkipForward className="h-5 w-5" />
                            </Button>
                          </>
                        )}

                        {/* Volume Control */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20"
                            onClick={toggleMute}
                          >
                            {isMuted || volume === 0 ? (
                              <VolumeX className="h-5 w-5" />
                            ) : (
                              <Volume2 className="h-5 w-5" />
                            )}
                          </Button>
                          <div className="w-24 hidden md:block">
                            <Slider
                              value={[volume]}
                              max={100}
                              step={1}
                              onValueChange={handleVolumeChange}
                              className="cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Playback Speed */}
                        {!isLive && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 text-xs font-bold min-w-[3rem]"
                            onClick={changeSpeed}
                          >
                            {playbackSpeed}x
                          </Button>
                        )}
                      </div>

                      {/* Right Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                          onClick={toggleFullscreen}
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-5 w-5" />
                          ) : (
                            <Maximize2 className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </Card>
    </div>
  );
}
