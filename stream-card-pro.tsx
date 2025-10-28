import { useState } from "react";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Play,
  Pause,
  StopCircle,
  Trash2,
  Users,
  Clock,
  Eye,
  Share2,
  Settings,
  Maximize2,
  MoreVertical,
  Edit,
  Copy,
  ExternalLink,
  Radio,
} from "lucide-react";
import type { LiveStream } from "@shared/schema";

interface StreamCardProProps {
  stream: LiveStream;
  onPlay?: (id: string) => void;
  onPause?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function StreamCardPro({
  stream,
  onPlay,
  onPause,
  onStop,
  onDelete,
  onEdit,
  onShare,
}: StreamCardProProps) {
  const { language } = useI18n();
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      live: "from-red-500 to-pink-500",
      scheduled: "from-blue-500 to-cyan-500",
      ended: "from-gray-500 to-gray-600",
      paused: "from-yellow-500 to-orange-500",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusText = (status: string) => {
    const texts = {
      live: language === "ar" ? "مباشر" : "Live",
      scheduled: language === "ar" ? "مجدول" : "Scheduled",
      ended: language === "ar" ? "انتهى" : "Ended",
      paused: language === "ar" ? "متوقف" : "Paused",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getDuration = () => {
    if (!stream.startedAt) return "0:00";
    const now = new Date().getTime();
    const start = new Date(stream.startedAt).getTime();
    const diff = Math.floor((now - start) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        {/* Thumbnail Section */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
          {stream.thumbnailUrl ? (
            <img
              src={stream.thumbnailUrl}
              alt={language === "ar" ? stream.titleAr : stream.titleEn}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-500">
              <Eye className="h-16 w-16 text-white opacity-50" />
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            <Badge
              className={`bg-gradient-to-r ${getStatusColor(stream.status)} text-white border-0 shadow-lg px-3 py-1 text-sm font-bold`}
            >
              {stream.status === "live" && (
                <motion.div
                  className="w-2 h-2 rounded-full bg-white mr-2"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              {getStatusText(stream.status)}
            </Badge>
          </div>

          {/* Type Badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="backdrop-blur-md bg-black/50 text-white border-0">
              {stream.streamType === "rtmp" && "RTMP"}
              {stream.streamType === "external" && (language === "ar" ? "خارجي" : "External")}
              {stream.streamType === "screen_share" && (language === "ar" ? "شاشة" : "Screen")}
            </Badge>
          </div>

          {/* Live Stats Overlay */}
          {stream.status === "live" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 backdrop-blur-md bg-black/50 px-3 py-2 rounded-full">
                  <Users className="h-4 w-4 text-white" />
                  <span className="text-white font-bold">{stream.viewerCount || 0}</span>
                </div>
                <div className="flex items-center gap-2 backdrop-blur-md bg-black/50 px-3 py-2 rounded-full">
                  <Clock className="h-4 w-4 text-white" />
                  <span className="text-white font-mono">{getDuration()}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hover Overlay with Quick Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3"
          >
            {stream.status === "scheduled" && onPlay && (
              <Button
                size="lg"
                onClick={() => onPlay(stream.id)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                <Play className="h-5 w-5 mr-2" />
                {language === "ar" ? "بدء" : "Start"}
              </Button>
            )}

            {stream.status === "live" && (
              <>
                {onPause && (
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => onPause(stream.id)}
                    className="shadow-lg"
                  >
                    <Pause className="h-5 w-5" />
                  </Button>
                )}
                {onStop && (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => onStop(stream.id)}
                    className="shadow-lg"
                  >
                    <StopCircle className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}

            {/* Studio Button */}
            {(stream.status === "scheduled" || stream.status === "live") && (
              <Button
                size="lg"
                onClick={() => window.open(`/admin/broadcast-studio/${stream.id}`, "_blank")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
              >
                <Radio className="h-5 w-5 mr-2" />
                {language === "ar" ? "الاستوديو" : "Studio"}
              </Button>
            )}

            <Button
              size="lg"
              variant="secondary"
              onClick={() => window.open(`/live/${stream.id}`, "_blank")}
              className="shadow-lg"
            >
              <ExternalLink className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Content Section */}
        <CardContent className="p-6">
          {/* Title */}
          <h3 className="font-bold text-xl mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
            {language === "ar" ? stream.titleAr : stream.titleEn}
          </h3>

          {/* Description */}
          {(stream.descriptionAr || stream.descriptionEn) && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {language === "ar" ? stream.descriptionAr : stream.descriptionEn}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{stream.viewerCount || 0}</span>
            </div>
            {stream.maxViewers && stream.maxViewers > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{stream.maxViewers}</span>
              </div>
            )}
            {stream.createdAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {new Date(stream.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                </span>
              </div>
            )}
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-2">
            {stream.status === "scheduled" && onPlay && (
              <Button
                size="sm"
                onClick={() => onPlay(stream.id)}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <Play className="h-4 w-4 mr-1" />
                {language === "ar" ? "بدء" : "Start"}
              </Button>
            )}

            {stream.status === "live" && (
              <>
                {onPause && (
                  <Button size="sm" variant="outline" onClick={() => onPause(stream.id)} className="flex-1">
                    <Pause className="h-4 w-4 mr-1" />
                    {language === "ar" ? "إيقاف" : "Pause"}
                  </Button>
                )}
                {onStop && (
                  <Button size="sm" variant="outline" onClick={() => onStop(stream.id)} className="flex-1">
                    <StopCircle className="h-4 w-4 mr-1" />
                    {language === "ar" ? "إنهاء" : "Stop"}
                  </Button>
                )}
              </>
            )}

            {onShare && (
              <Button size="sm" variant="outline" onClick={() => onShare(stream.id)}>
                <Share2 className="h-4 w-4" />
              </Button>
            )}

            {/* More Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.open(`/live/${stream.id}`, "_blank")}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {language === "ar" ? "فتح" : "Open"}
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(stream.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {language === "ar" ? "تعديل" : "Edit"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(`${window.location.origin}/live/${stream.id}`)}>
                  <Copy className="h-4 w-4 mr-2" />
                  {language === "ar" ? "نسخ الرابط" : "Copy Link"}
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(stream.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {language === "ar" ? "حذف" : "Delete"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
