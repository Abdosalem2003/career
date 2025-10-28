import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Video,
  Users,
  MessageCircle,
  Settings,
  BarChart3,
  Eye,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Clock,
} from "lucide-react";
import { LiveBroadcaster } from "@/components/live-broadcaster";
import { ProfessionalVideoPlayer } from "@/components/professional-video-player";
import { useToast } from "@/hooks/use-toast";
import type { LiveStream } from "@shared/schema";

export default function LiveBroadcastStudio() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("broadcast");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [streamStats, setStreamStats] = useState({
    currentViewers: 0,
    peakViewers: 0,
    totalViews: 0,
    likes: 0,
    duration: 0,
  });

  // Fetch stream data
  const { data: stream, isLoading } = useQuery<LiveStream>({
    queryKey: [`/api/admin/live-streams/${id}`],
    enabled: !!id,
    refetchInterval: 5000,
  });

  // Update stream status
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/admin/live-streams/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/live-streams/${id}`] });
    },
  });

  // Handle stream start
  const handleStreamStart = async (streamData: any) => {
    try {
      await updateStatusMutation.mutateAsync("live");
      toast({
        title: language === "ar" ? "✅ بدأ البث" : "✅ Stream Started",
        description: language === "ar" ? "البث المباشر نشط الآن" : "Live stream is now active",
      });
    } catch (error) {
      console.error("Error starting stream:", error);
    }
  };

  // Handle stream stop
  const handleStreamStop = async () => {
    try {
      await updateStatusMutation.mutateAsync("ended");
      toast({
        title: language === "ar" ? "⏹️ توقف البث" : "⏹️ Stream Stopped",
        description: language === "ar" ? "تم إيقاف البث المباشر" : "Live stream has been stopped",
      });
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  // Update stats
  useEffect(() => {
    if (stream) {
      setStreamStats({
        currentViewers: stream.viewerCount || 0,
        peakViewers: stream.maxViewers || 0,
        totalViews: stream.viewerCount || 0,
        likes: 0,
        duration: stream.duration || 0,
      });
    }
  }, [stream]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Radio className="h-12 w-12 text-red-500" />
        </motion.div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {language === "ar" ? "البث غير موجود" : "Stream Not Found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {language === "ar"
                ? "لم يتم العثور على البث المطلوب"
                : "The requested stream was not found"}
            </p>
            <Button onClick={() => navigate("/admin/live-streams")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "ar" ? "العودة" : "Go Back"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate("/admin/live-streams")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  {language === "ar" ? "استوديو البث المباشر" : "Live Broadcast Studio"}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                  <Sparkles className="h-4 w-4" />
                  {language === "ar" ? stream.titleAr : stream.titleEn}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <Badge
              className={`px-4 py-2 text-sm font-bold ${
                stream.status === "live"
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                  : stream.status === "scheduled"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                  : "bg-gradient-to-r from-gray-500 to-gray-600 text-white"
              }`}
            >
              {stream.status === "live" && (language === "ar" ? "مباشر" : "Live")}
              {stream.status === "scheduled" && (language === "ar" ? "مجدول" : "Scheduled")}
              {stream.status === "ended" && (language === "ar" ? "انتهى" : "Ended")}
            </Badge>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                label: language === "ar" ? "المشاهدون الآن" : "Current Viewers",
                value: streamStats.currentViewers,
                icon: Users,
                color: "from-blue-500 to-cyan-500",
              },
              {
                label: language === "ar" ? "أقصى مشاهدة" : "Peak Viewers",
                value: streamStats.peakViewers,
                icon: TrendingUp,
                color: "from-green-500 to-emerald-500",
              },
              {
                label: language === "ar" ? "إجمالي المشاهدات" : "Total Views",
                value: streamStats.totalViews,
                icon: Eye,
                color: "from-purple-500 to-pink-500",
              },
              {
                label: language === "ar" ? "الإعجابات" : "Likes",
                value: streamStats.likes,
                icon: Heart,
                color: "from-red-500 to-pink-500",
              },
              {
                label: language === "ar" ? "المدة" : "Duration",
                value: `${Math.floor(streamStats.duration / 60)}m`,
                icon: Clock,
                color: "from-orange-500 to-red-500",
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        <stat.icon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Broadcast/Preview */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="broadcast" className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  {language === "ar" ? "البث" : "Broadcast"}
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  {language === "ar" ? "المعاينة" : "Preview"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="broadcast" className="mt-0">
                {stream.streamType === "webrtc" || stream.streamType === "screen_share" ? (
                  <LiveBroadcaster
                    streamId={stream.id}
                    onStreamStart={handleStreamStart}
                    onStreamStop={handleStreamStop}
                  />
                ) : stream.streamType === "external" ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-bold mb-2">
                          {language === "ar" ? "بث خارجي" : "External Stream"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {language === "ar"
                            ? "هذا البث يستخدم رابط خارجي"
                            : "This stream uses an external URL"}
                        </p>
                        <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                          {stream.externalUrl}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-bold mb-2">
                          {language === "ar" ? "بث RTMP" : "RTMP Stream"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {language === "ar"
                            ? "استخدم برنامج بث خارجي مثل OBS"
                            : "Use external broadcasting software like OBS"}
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-muted-foreground mb-1">Server URL:</p>
                            <p className="font-mono">{stream.rtmpUrl || "rtmp://localhost/live"}</p>
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                            <p className="text-muted-foreground mb-1">Stream Key:</p>
                            <p className="font-mono">{stream.rtmpKey || "••••••••"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="preview" className="mt-0">
                <ProfessionalVideoPlayer
                  streamUrl={stream.externalUrl || stream.rtmpUrl || undefined}
                  streamType={stream.streamType as any}
                  isLive={stream.status === "live"}
                  viewerCount={streamStats.currentViewers}
                  title={language === "ar" ? stream.titleAr : stream.titleEn}
                  onLike={() => setStreamStats(prev => ({ ...prev, likes: prev.likes + 1 }))}
                  onShare={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/live/${stream.id}`);
                    toast({
                      title: language === "ar" ? "✅ تم النسخ" : "✅ Copied",
                      description: language === "ar" ? "تم نسخ رابط البث" : "Stream link copied",
                    });
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Chat & Analytics */}
          <div className="space-y-6">
            {/* Chat */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {language === "ar" ? "الدردشة المباشرة" : "Live Chat"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 overflow-y-auto mb-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {language === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div key={index} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="font-semibold text-sm">{msg.user}</p>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    disabled
                  />
                  <Button disabled>
                    {language === "ar" ? "إرسال" : "Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {language === "ar" ? "التحليلات" : "Analytics"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "معدل المشاهدة" : "View Rate"}
                    </span>
                    <span className="font-bold">+12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "معدل التفاعل" : "Engagement"}
                    </span>
                    <span className="font-bold">8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {language === "ar" ? "متوسط المشاهدة" : "Avg. Watch Time"}
                    </span>
                    <span className="font-bold">12:34</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stream Info */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {language === "ar" ? "معلومات البث" : "Stream Info"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "النوع" : "Type"}
                    </span>
                    <span className="font-semibold">
                      {stream.streamType === "webrtc" && (language === "ar" ? "كاميرا مباشرة" : "Live Camera")}
                      {stream.streamType === "external" && (language === "ar" ? "خارجي" : "External")}
                      {stream.streamType === "screen_share" && (language === "ar" ? "شاشة" : "Screen")}
                      {stream.streamType === "rtmp" && "RTMP"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "الدردشة" : "Chat"}
                    </span>
                    <Badge variant={stream.enableChat ? "default" : "secondary"}>
                      {stream.enableChat
                        ? language === "ar" ? "مفعلة" : "Enabled"
                        : language === "ar" ? "معطلة" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "التسجيل" : "Recording"}
                    </span>
                    <Badge variant={stream.enableRecording ? "default" : "secondary"}>
                      {stream.enableRecording
                        ? language === "ar" ? "مفعل" : "Enabled"
                        : language === "ar" ? "معطل" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {language === "ar" ? "الوصول" : "Access"}
                    </span>
                    <Badge variant={stream.isPublic ? "default" : "secondary"}>
                      {stream.isPublic
                        ? language === "ar" ? "عام" : "Public"
                        : language === "ar" ? "خاص" : "Private"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
