import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Radio,
  Users,
  Clock,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  Facebook,
  Twitter,
  Send,
} from "lucide-react";
import { ProfessionalVideoPlayer } from "@/components/professional-video-player";
import type { LiveStream } from "@shared/schema";

export default function LiveStreamView() {
  const { id } = useParams();
  const { language } = useI18n();
  const [duration, setDuration] = useState("0:00");
  const [userName, setUserName] = useState("");
  const [showNameDialog, setShowNameDialog] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  // Fetch stream data
  const { data: stream, isLoading } = useQuery<LiveStream>({
    queryKey: [`/api/streams/${id}`],
    refetchInterval: 5000,
  });

  // Fetch chat messages
  const { data: chatData } = useQuery({
    queryKey: [`/api/streams/${id}/messages`],
    refetchInterval: 2000,
    enabled: !!userName,
  });

  // Fetch likes
  const { data: likesData } = useQuery({
    queryKey: [`/api/streams/${id}/likes`],
    refetchInterval: 3000,
  });

  // Update messages
  useEffect(() => {
    if (chatData && Array.isArray(chatData)) {
      setMessages(chatData);
    }
  }, [chatData]);

  // Update likes
  useEffect(() => {
    if (likesData && typeof likesData === 'object') {
      const data = likesData as { count?: number; likes?: string[] };
      setLikesCount(data.count || 0);
      if (userName && data.likes) {
        setIsLiked(data.likes.includes(userName));
      }
    }
  }, [likesData, userName]);

  // Send chat message
  const sendMessage = async () => {
    if (!chatMessage.trim() || !userName) return;

    try {
      await fetch(`/api/streams/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, message: chatMessage }),
      });
      setChatMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Toggle like
  const toggleLike = async () => {
    if (!userName) return;

    try {
      const response = await fetch(`/api/streams/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });
      const data = await response.json();
      setIsLiked(data.liked);
      setLikesCount(data.count);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // Save username
  const saveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem(`stream_${id}_userName`, userName);
      setShowNameDialog(false);
    }
  };

  // Load username from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`stream_${id}_userName`);
    if (saved) {
      setUserName(saved);
      setShowNameDialog(false);
    }
  }, [id]);


  // Update duration
  useEffect(() => {
    if (!stream?.startedAt) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(stream.startedAt!).getTime();
      const diff = Math.floor((now - start) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setDuration(
        hours > 0
          ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
          : `${minutes}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [stream]);

  const getVideoUrl = () => {
    if (!stream) return "";
    
    if (stream.streamType === "external" && stream.externalUrl) {
      return stream.externalUrl;
    }
    
    if (stream.streamType === "rtmp" && stream.rtmpUrl) {
      return stream.rtmpUrl;
    }
    
    return "";
  };

  const shareStream = (platform: string) => {
    const url = window.location.href;
    const title = language === "ar" ? stream?.titleAr : stream?.titleEn;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || "")}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${url}`)}`,
    };
    
    window.open(urls[platform as keyof typeof urls], "_blank", "width=600,height=400");
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {language === "ar" ? "لا يوجد بث مباشر" : "No Live Stream"}
            </h2>
            <p className="text-muted-foreground">
              {language === "ar"
                ? "لا يوجد بث مباشر حالياً"
                : "There is no live stream currently"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Name Dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {language === "ar" ? "مرحباً بك في البث المباشر" : "Welcome to Live Stream"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {language === "ar"
                  ? "يرجى إدخال اسمك للمشاركة في الدردشة والإعجاب"
                  : "Please enter your name to join chat and like"}
              </p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && saveUserName()}
                placeholder={language === "ar" ? "اسمك..." : "Your name..."}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                autoFocus
              />
              <Button onClick={saveUserName} className="w-full" disabled={!userName.trim()}>
                {language === "ar" ? "انضمام" : "Join"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Professional Video Player */}
              {(stream.externalUrl || stream.rtmpUrl) ? (
                <ProfessionalVideoPlayer
                  streamUrl={stream.externalUrl || stream.rtmpUrl || ""}
                  streamType={stream.streamType as any}
                  isLive={stream.status === "live"}
                  viewerCount={0}
                  title={language === "ar" ? stream.titleAr : stream.titleEn}
                  onShare={() => shareStream("whatsapp")}
                  autoPlay={true}
                />
              ) : (
                <Card className="border-0 shadow-lg">
                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Radio className="h-20 w-20 mx-auto mb-4 opacity-50" />
                      <h3 className="text-2xl font-bold mb-2">
                        {language === "ar" ? "البث سيبدأ قريباً" : "Stream Starting Soon"}
                      </h3>
                      <p className="text-gray-400">
                        {language === "ar" 
                          ? "يرجى الانتظار، البث المباشر سيبدأ قريباً" 
                          : "Please wait, the live stream will start soon"}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Stream Info */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">
                        {language === "ar" ? stream.titleAr : stream.titleEn}
                      </h1>
                      {(stream.descriptionAr || stream.descriptionEn) && (
                        <p className="text-muted-foreground">
                          {language === "ar" ? stream.descriptionAr : stream.descriptionEn}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 mb-6">
                    {stream.status === "live" && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <span className="font-mono font-semibold">{duration}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="lg"
                      variant={isLiked ? "default" : "outline"}
                      className={`flex-1 ${isLiked ? "bg-red-500 hover:bg-red-600" : ""}`}
                      onClick={toggleLike}
                      disabled={!userName}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${isLiked ? "fill-current" : ""}`} />
                      {language === "ar" ? "إعجاب" : "Like"} ({likesCount})
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => shareStream("facebook")}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => shareStream("twitter")}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => shareStream("whatsapp")}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chat Card */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      {language === "ar" ? "الدردشة" : "Chat"}
                    </h3>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-3 mb-4 h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {!userName ? (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        {language === "ar"
                          ? "يرجى إدخال اسمك للمشاركة في الدردشة"
                          : "Please enter your name to join the chat"}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-sm text-muted-foreground py-8">
                        {language === "ar"
                          ? "لا توجد رسائل بعد"
                          : "No messages yet"}
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <div className="font-semibold text-sm text-red-500 mb-1">
                            {msg.userName}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString(language === "ar" ? "ar-EG" : "en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={language === "ar" ? "اكتب رسالة..." : "Type a message..."}
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={!userName}
                    />
                    <Button onClick={sendMessage} disabled={!userName || !chatMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Stream Details */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">
                    {language === "ar" ? "تفاصيل البث" : "Stream Details"}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "الحالة" : "Status"}
                      </span>
                      <Badge className={`bg-gradient-to-r ${
                        stream.status === "live"
                          ? "from-red-500 to-pink-500"
                          : "from-gray-500 to-gray-600"
                      } text-white`}>
                        {stream.status === "live"
                          ? language === "ar" ? "مباشر" : "Live"
                          : language === "ar" ? "منتهي" : "Ended"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {language === "ar" ? "النوع" : "Type"}
                      </span>
                      <span className="font-semibold">
                        {stream.streamType === "external" && (language === "ar" ? "خارجي" : "External")}
                        {stream.streamType === "rtmp" && "RTMP"}
                        {stream.streamType === "screen_share" && (language === "ar" ? "شاشة" : "Screen")}
                      </span>
                    </div>
                    {stream.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {language === "ar" ? "التاريخ" : "Date"}
                        </span>
                        <span className="font-semibold">
                          {new Date(stream.createdAt).toLocaleDateString(
                            language === "ar" ? "en-US" : "en-US"
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
