import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Radio, Eye, Play } from "lucide-react";
import type { Stream } from "@shared/schema";

export default function LivePage() {
  const { language } = useI18n();
  const [viewers, setViewers] = useState(Math.floor(Math.random() * 500) + 100);

  // Simulate real-time viewer count
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { data: activeStream, isLoading } = useQuery<Stream>({
    queryKey: ["/api/streams/active"],
    refetchInterval: 30000,
  });

  // Extract YouTube video ID
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match?.[1];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold" data-testid="text-page-title">
                  {language === "ar" ? "البث المباشر" : "Live Streaming"}
                </h1>
              </div>
            </div>
            {activeStream?.status === "live" && (
              <div className="flex items-center gap-4">
                <Badge className="bg-red-500 hover:bg-red-500 animate-pulse px-4 py-2">
                  <Radio className="h-4 w-4 mr-2" />
                  LIVE
                </Badge>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4" />
                  <span className="font-bold">{viewers.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Play className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {activeStream?.status === "live"
                    ? (language === "ar" ? "بث مباشر الآن" : "Live Now")
                    : (language === "ar" ? "لا يوجد بث مباشر" : "No Active Stream")
                  }
                </h2>
                {activeStream && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeStream.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <Skeleton className="aspect-video w-full rounded-xl" />
            ) : activeStream?.status === "live" ? (
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                {(() => {
                  const stream = activeStream as any;
                  
                  // YouTube Embed - check both youtubeUrl and rtmpKey
                  const youtubeUrl = stream.youtubeUrl || stream.rtmpKey;
                  if (youtubeUrl) {
                    const videoId = getYouTubeVideoId(youtubeUrl);
                    if (videoId) {
                      return (
                        <iframe
                          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title="Live Stream"
                        />
                      );
                    }
                  }
                  
                  // Fallback
                  return (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                      <div className="text-center p-8">
                        <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                          <Play className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-white font-bold text-2xl mb-3">{activeStream.name}</h3>
                        <p className="text-white/80 mb-6">
                          {language === "ar" ? "لا يوجد رابط بث متاح" : "No stream URL available"}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Radio className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
                    {language === "ar" ? "لا يوجد بث مباشر حالياً" : "No active stream at the moment"}
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                    {language === "ar" ? "تحقق مرة أخرى لاحقاً" : "Check back later"}
                  </p>
                </div>
              </div>
            )}

            {/* Stream Description */}
            {activeStream && (activeStream as any).description && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                <h4 className="font-semibold mb-2">
                  {language === "ar" ? "عن البث" : "About Stream"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(activeStream as any).description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
