import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdPlacement } from "@/components/ad-placement";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, Radio, Volume2, VolumeX, Maximize, Minimize,
  Users, MessageCircle, Send, Eye, Clock
} from "lucide-react";
import type { Stream } from "@shared/schema";

export default function LivePageImproved() {
  const { language } = useI18n();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, time: string}>>([]);

  const { data: activeStream, isLoading } = useQuery<Stream>({
    queryKey: ["/api/streams/active"],
    refetchInterval: 10000, // تحديث كل 10 ثواني
  });

  const { data: streams } = useQuery<Stream[]>({
    queryKey: ["/api/streams"],
  });

  // محاكاة عدد المشاهدين
  useEffect(() => {
    if (activeStream?.status === "live") {
      const interval = setInterval(() => {
        setViewers(prev => Math.max(0, prev + Math.floor(Math.random() * 10 - 3)));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeStream]);

  // تشغيل الفيديو
  const handlePlay = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        await videoRef.current.play();
        setIsPlaying(true);
        toast({
          title: language === "ar" ? "جاري البث" : "Streaming",
          description: language === "ar" ? "تم بدء البث المباشر" : "Live stream started",
        });
      }
    } catch (error) {
      console.error("Play error:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل تشغيل البث" : "Failed to play stream",
        variant: "destructive",
      });
    }
  };

  // كتم الصوت
  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // ملء الشاشة
  const handleFullscreen = () => {
    if (!videoRef.current) return;

    if (!isFullscreen) {
      videoRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // إرسال رسالة
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      user: language === "ar" ? "أنت" : "You",
      message: chatMessage,
      time: new Date().toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage("");
  };

  // رابط البث الفعلي
  const getStreamUrl = () => {
    if (!activeStream) return "";
    
    // إذا كان هناك رابط YouTube
    if (activeStream.youtubeUrl) {
      // تحويل رابط YouTube إلى embed
      const videoId = activeStream.youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
      }
    }

    // إذا كان هناك رابط مباشر
    if (activeStream.streamUrl) {
      return activeStream.streamUrl;
    }

    // رابط RTMP (يحتاج تحويل)
    if (activeStream.rtmpUrl) {
      // في الإنتاج، يجب تحويل RTMP إلى HLS
      return activeStream.rtmpUrl;
    }

    return "";
  };

  const streamUrl = getStreamUrl();
  const isYouTube = streamUrl.includes('youtube.com');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-page-title">
            {language === "ar" ? "البث المباشر" : "Live Streaming"}
          </h1>
          {activeStream?.status === "live" && (
            <div className="flex items-center gap-4">
              <Badge className="bg-red-500 hover:bg-red-500 animate-pulse">
                <Radio className="h-3 w-3 mr-1" />
                LIVE
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>{viewers.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Header Ad */}
        <AdPlacement placement="header" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Video Player */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {isLoading ? (
                  <Skeleton className="aspect-video w-full" />
                ) : activeStream?.status === "live" && streamUrl ? (
                  <div className="relative aspect-video bg-black group">
                    {isYouTube ? (
                      // YouTube Embed
                      <iframe
                        src={streamUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      // Video Player
                      <>
                        <video
                          ref={videoRef}
                          className="w-full h-full"
                          controls={false}
                          autoPlay
                          muted={isMuted}
                          playsInline
                          src={streamUrl}
                        />

                        {/* Custom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-white hover:bg-white/20"
                                onClick={handlePlay}
                              >
                                <Play className={`h-5 w-5 ${isPlaying ? 'hidden' : 'block'}`} />
                                <span className={`h-5 w-5 ${isPlaying ? 'block' : 'hidden'}`}>⏸</span>
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-white hover:bg-white/20"
                                onClick={handleMute}
                              >
                                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-white hover:bg-white/20"
                              onClick={handleFullscreen}
                            >
                              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Stream Info Overlay */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3">
                        <h3 className="text-white font-bold text-lg">
                          {activeStream.name}
                        </h3>
                        {activeStream.startedAt && (
                          <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {language === "ar" ? "بدأ منذ: " : "Started: "}
                              {new Date(activeStream.startedAt).toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg font-semibold">
                        {language === "ar" ? "لا يوجد بث مباشر حالياً" : "No active stream"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {language === "ar" ? "تابعنا للحصول على التحديثات" : "Follow us for updates"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stream Description */}
            {activeStream && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "ar" ? "عن البث" : "About Stream"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {activeStream.description || (language === "ar" ? "لا يوجد وصف" : "No description")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Live Chat */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    {language === "ar" ? "الدردشة المباشرة" : "Live Chat"}
                  </CardTitle>
                  <Badge variant="secondary">
                    <Users className="h-3 w-3 mr-1" />
                    {viewers}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Chat Messages */}
                <div className="h-96 bg-muted/50 rounded-lg p-4 mb-4 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-muted-foreground text-center">
                        {language === "ar" ? "كن أول من يعلق!" : "Be the first to comment!"}
                      </p>
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="bg-background rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <AdPlacement placement="sidebar-top" />

            {/* Recorded Streams */}
            {streams && streams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {language === "ar" ? "البث المسجل" : "Recorded Streams"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {streams.slice(0, 5).map((stream) => (
                      <div
                        key={stream.id}
                        className="p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      >
                        <h4 className="font-semibold text-sm line-clamp-1">{stream.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stream.endedAt
                            ? new Date(stream.endedAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                            : language === "ar" ? "قريباً" : "Upcoming"
                          }
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
