import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  Square,
  Settings,
  Monitor,
  Camera,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Eye,
  Clock,
  Circle,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiveBroadcasterProps {
  streamId?: string;
  onStreamStart?: (streamData: any) => void;
  onStreamStop?: () => void;
  autoStart?: boolean;
}

export function LiveBroadcaster({
  streamId,
  onStreamStart,
  onStreamStop,
  autoStart = false,
}: LiveBroadcasterProps) {
  const { language } = useI18n();
  const { toast } = useToast();

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [streamType, setStreamType] = useState<"camera" | "screen">("camera");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>("");
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [streamQuality, setStreamQuality] = useState<"low" | "medium" | "high">("high");
  const [viewerCount, setViewerCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);
        
        const cameras = deviceList.filter(d => d.kind === "videoinput");
        const microphones = deviceList.filter(d => d.kind === "audioinput");
        
        if (cameras.length > 0 && !selectedCamera) {
          setSelectedCamera(cameras[0].deviceId);
        }
        if (microphones.length > 0 && !selectedMicrophone) {
          setSelectedMicrophone(microphones[0].deviceId);
        }
      } catch (error) {
        console.error("Error getting devices:", error);
      }
    };

    getDevices();
  }, []);

  // Duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming, isPaused]);

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Get quality constraints
  const getQualityConstraints = () => {
    const qualities = {
      low: { width: 640, height: 360, frameRate: 15 },
      medium: { width: 1280, height: 720, frameRate: 30 },
      high: { width: 1920, height: 1080, frameRate: 30 },
    };
    return qualities[streamQuality];
  };

  // Start camera/screen stream
  const startStream = async () => {
    try {
      setConnectionStatus("connecting");
      
      let stream: MediaStream;
      const quality = getQualityConstraints();

      if (streamType === "camera") {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
            ...quality,
          },
          audio: {
            deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } else {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: quality as any,
          audio: true,
        });
      }

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute local preview to avoid feedback
      }

      setIsStreaming(true);
      setConnectionStatus("connected");
      setDuration(0);

      // Start recording if enabled
      if (mediaRecorderRef.current === null) {
        startRecording(stream);
      }

      toast({
        title: language === "ar" ? "✅ بدأ البث" : "✅ Stream Started",
        description: language === "ar" ? "البث المباشر نشط الآن" : "Live stream is now active",
      });

      if (onStreamStart) {
        onStreamStart({
          streamId,
          type: streamType,
          quality: streamQuality,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      console.error("Error starting stream:", error);
      setConnectionStatus("disconnected");
      
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: error.message || (language === "ar" ? "فشل بدء البث" : "Failed to start stream"),
        variant: "destructive",
      });
    }
  };

  // Stop stream
  const stopStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (isRecording) {
      stopRecording();
    }

    setIsStreaming(false);
    setConnectionStatus("disconnected");
    setDuration(0);

    toast({
      title: language === "ar" ? "⏹️ توقف البث" : "⏹️ Stream Stopped",
      description: language === "ar" ? "تم إيقاف البث المباشر" : "Live stream has been stopped",
    });

    if (onStreamStop) {
      onStreamStop();
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  // Start recording
  const startRecording = (stream: MediaStream) => {
    try {
      const options = { mimeType: "video/webm;codecs=vp9" };
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        
        // Download the recording
        const a = document.createElement("a");
        a.href = url;
        a.download = `stream-${Date.now()}.webm`;
        a.click();
        
        recordedChunksRef.current = [];
        
        toast({
          title: language === "ar" ? "💾 تم الحفظ" : "💾 Saved",
          description: language === "ar" ? "تم حفظ التسجيل" : "Recording saved",
        });
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Auto start
  useEffect(() => {
    if (autoStart) {
      startStream();
    }
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [autoStart]);

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                {connectionStatus === "connected" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : connectionStatus === "connecting" ? (
                  <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {connectionStatus === "connected" && (language === "ar" ? "متصل" : "Connected")}
                  {connectionStatus === "connecting" && (language === "ar" ? "جاري الاتصال..." : "Connecting...")}
                  {connectionStatus === "disconnected" && (language === "ar" ? "غير متصل" : "Disconnected")}
                </span>
              </div>

              {/* Live Indicator */}
              {isStreaming && (
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-white mr-2"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {language === "ar" ? "مباشر" : "LIVE"}
                </Badge>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <Badge variant="destructive">
                  <Circle className="h-3 w-3 mr-1 fill-current" />
                  {language === "ar" ? "تسجيل" : "REC"}
                </Badge>
              )}

              {/* Duration */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono font-bold">{formatDuration(duration)}</span>
                </div>
              )}

              {/* Viewer Count */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-bold">{viewerCount}</span>
              </div>
            </div>

            {/* Stream Type Toggle */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={streamType === "camera" ? "default" : "outline"}
                onClick={() => setStreamType("camera")}
                disabled={isStreaming}
              >
                <Camera className="h-4 w-4 mr-1" />
                {language === "ar" ? "كاميرا" : "Camera"}
              </Button>
              <Button
                size="sm"
                variant={streamType === "screen" ? "default" : "outline"}
                onClick={() => setStreamType("screen")}
                disabled={isStreaming}
              >
                <Monitor className="h-4 w-4 mr-1" />
                {language === "ar" ? "شاشة" : "Screen"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card className="overflow-hidden border-0 shadow-2xl">
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Overlay when video is off */}
          {!videoEnabled && isStreaming && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <VideoOff className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">
                  {language === "ar" ? "الكاميرا متوقفة" : "Camera Off"}
                </p>
              </div>
            </div>
          )}

          {/* Not streaming overlay */}
          {!isStreaming && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
              <div className="text-center text-white">
                <Radio className="h-20 w-20 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-bold mb-2">
                  {language === "ar" ? "جاهز للبث" : "Ready to Stream"}
                </p>
                <p className="text-sm opacity-75">
                  {language === "ar" ? "اضغط على زر البدء للبث المباشر" : "Click start to go live"}
                </p>
              </div>
            </div>
          )}

          {/* Control Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between">
              {/* Left Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="lg"
                  variant={videoEnabled ? "secondary" : "destructive"}
                  onClick={toggleVideo}
                  disabled={!isStreaming}
                  className="shadow-lg"
                >
                  {videoEnabled ? (
                    <Video className="h-5 w-5" />
                  ) : (
                    <VideoOff className="h-5 w-5" />
                  )}
                </Button>

                <Button
                  size="lg"
                  variant={audioEnabled ? "secondary" : "destructive"}
                  onClick={toggleAudio}
                  disabled={!isStreaming}
                  className="shadow-lg"
                >
                  {audioEnabled ? (
                    <Mic className="h-5 w-5" />
                  ) : (
                    <MicOff className="h-5 w-5" />
                  )}
                </Button>
              </div>

              {/* Center Control - Start/Stop */}
              <div>
                {!isStreaming ? (
                  <Button
                    size="lg"
                    onClick={startStream}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-2xl px-8"
                  >
                    <Radio className="h-6 w-6 mr-2" />
                    {language === "ar" ? "بدء البث" : "Go Live"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={stopStream}
                    variant="destructive"
                    className="shadow-2xl px-8"
                  >
                    <Square className="h-6 w-6 mr-2" />
                    {language === "ar" ? "إيقاف البث" : "Stop Stream"}
                  </Button>
                )}
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-2">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={toggleFullscreen}
                  className="shadow-lg"
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
        </div>
      </Card>

      {/* Settings Panel */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Camera Selection */}
            {streamType === "camera" && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  {language === "ar" ? "الكاميرا" : "Camera"}
                </label>
                <Select
                  value={selectedCamera}
                  onValueChange={setSelectedCamera}
                  disabled={isStreaming}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {devices.filter(d => d.kind === "videoinput" && d.deviceId).length > 0 ? (
                      devices
                        .filter(d => d.kind === "videoinput" && d.deviceId)
                        .map(device => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-camera" disabled>
                        {language === "ar" ? "لا توجد كاميرا" : "No camera found"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Microphone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mic className="h-4 w-4" />
                {language === "ar" ? "الميكروفون" : "Microphone"}
              </label>
              <Select
                value={selectedMicrophone}
                onValueChange={setSelectedMicrophone}
                disabled={isStreaming}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {devices.filter(d => d.kind === "audioinput" && d.deviceId).length > 0 ? (
                    devices
                      .filter(d => d.kind === "audioinput" && d.deviceId)
                      .map(device => (
                        <SelectItem key={device.deviceId} value={device.deviceId}>
                          {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-microphone" disabled>
                      {language === "ar" ? "لا يوجد ميكروفون" : "No microphone found"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {language === "ar" ? "الجودة" : "Quality"}
              </label>
              <Select
                value={streamQuality}
                onValueChange={(value: any) => setStreamQuality(value)}
                disabled={isStreaming}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    {language === "ar" ? "منخفضة (360p)" : "Low (360p)"}
                  </SelectItem>
                  <SelectItem value="medium">
                    {language === "ar" ? "متوسطة (720p)" : "Medium (720p)"}
                  </SelectItem>
                  <SelectItem value="high">
                    {language === "ar" ? "عالية (1080p)" : "High (1080p)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
