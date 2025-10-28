import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Youtube, Monitor, Check, Loader2, Sparkles, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateStreamDialogProProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStreamDialogPro({ open, onOpenChange }: CreateStreamDialogProProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [streamType, setStreamType] = useState<"webrtc" | "rtmp" | "external" | "screen_share">("webrtc");
  const [step, setStep] = useState(1);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      titleEn: "",
      titleAr: "",
      descriptionEn: "",
      descriptionAr: "",
      streamType: "webrtc",
      rtmpUrl: "",
      rtmpKey: "",
      externalUrl: "",
      externalPlatform: "youtube",
      thumbnailUrl: "",
      enableChat: true,
      enableRecording: false,
      isPublic: true,
      scheduledAt: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/admin/live-streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          streamType,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create stream");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams/stats"] });
      toast({
        title: language === "ar" ? "✅ تم الإنشاء" : "✅ Created",
        description: language === "ar" ? "تم إنشاء البث بنجاح" : "Stream created successfully",
      });
      reset();
      setStep(1);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: error.message || (language === "ar" ? "فشل إنشاء البث" : "Failed to create stream"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {language === "ar" ? "إنشاء بث جديد" : "Create New Stream"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar"
              ? "اختر نوع البث وأدخل التفاصيل المطلوبة"
              : "Choose stream type and enter required details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s
                      ? "bg-gradient-to-br from-red-500 to-pink-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  animate={{ scale: step === s ? 1.1 : 1 }}
                >
                  {step > s ? <Check className="h-5 w-5" /> : s}
                </motion.div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 ${step > s ? "bg-gradient-to-r from-red-500 to-pink-500" : "bg-gray-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Stream Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <Label className="text-lg font-bold">
                  {language === "ar" ? "نوع البث" : "Stream Type"}
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { type: "webrtc", icon: Video, label: language === "ar" ? "بث مباشر" : "Live Camera", desc: language === "ar" ? "كاميرا + ميكروفون" : "Camera + Mic" },
                    { type: "external", icon: Youtube, label: language === "ar" ? "رابط خارجي" : "External", desc: "YouTube, Vimeo" },
                    { type: "screen_share", icon: Monitor, label: language === "ar" ? "مشاركة الشاشة" : "Screen Share", desc: language === "ar" ? "بث الشاشة" : "Share Screen" },
                    { type: "rtmp", icon: Settings, label: "RTMP", desc: language === "ar" ? "متقدم" : "Advanced" },
                  ].map(({ type, icon: Icon, label, desc }) => (
                    <motion.button
                      key={type}
                      type="button"
                      onClick={() => {
                        setStreamType(type as any);
                        setValue("streamType", type);
                      }}
                      className={`p-6 border-2 rounded-xl transition-all ${
                        streamType === type
                          ? "border-red-500 bg-red-50 dark:bg-red-950 shadow-lg"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className={`h-12 w-12 mx-auto mb-3 ${streamType === type ? "text-red-500" : "text-gray-400"}`} />
                      <div className="font-bold text-lg">{label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titleEn">
                      {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"} *
                    </Label>
                    <Input
                      id="titleEn"
                      {...register("titleEn", { required: true })}
                      placeholder="Enter title in English"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="titleAr">
                      {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} *
                    </Label>
                    <Input
                      id="titleAr"
                      {...register("titleAr", { required: true })}
                      placeholder="أدخل العنوان بالعربية"
                      dir="rtl"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descriptionEn">
                      {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                    </Label>
                    <Textarea
                      id="descriptionEn"
                      {...register("descriptionEn")}
                      placeholder="Enter description"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descriptionAr">
                      {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                    </Label>
                    <Textarea
                      id="descriptionAr"
                      {...register("descriptionAr")}
                      placeholder="أدخل الوصف"
                      dir="rtl"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">
                    {language === "ar" ? "رابط الصورة المصغرة" : "Thumbnail URL"}
                  </Label>
                  <Input
                    id="thumbnailUrl"
                    {...register("thumbnailUrl")}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="h-12"
                  />
                </div>

                {streamType === "external" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="externalPlatform">
                        {language === "ar" ? "المنصة" : "Platform"}
                      </Label>
                      <Select
                        onValueChange={(value) => setValue("externalPlatform", value)}
                        defaultValue="youtube"
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="vimeo">Vimeo</SelectItem>
                          <SelectItem value="twitch">Twitch</SelectItem>
                          <SelectItem value="facebook">Facebook Live</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="externalUrl">
                        {language === "ar" ? "رابط البث" : "Stream URL"} *
                      </Label>
                      <Input
                        id="externalUrl"
                        {...register("externalUrl", { required: streamType === "external" })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="h-12"
                      />
                    </div>
                  </>
                )}

                {streamType === "rtmp" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="rtmpUrl">RTMP Server URL</Label>
                      <Input
                        id="rtmpUrl"
                        {...register("rtmpUrl")}
                        placeholder="rtmp://your-server.com/live"
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rtmpKey">Stream Key</Label>
                      <Input
                        id="rtmpKey"
                        {...register("rtmpKey")}
                        placeholder="Auto-generated if empty"
                        className="h-12"
                      />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step 3: Settings */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  {[
                    { name: "enableChat", label: language === "ar" ? "تفعيل الدردشة" : "Enable Chat", desc: language === "ar" ? "السماح للمشاهدين بالدردشة" : "Allow viewers to chat", defaultValue: true },
                    { name: "enableRecording", label: language === "ar" ? "تسجيل البث" : "Record Stream", desc: language === "ar" ? "حفظ البث للمشاهدة لاحقاً" : "Save for later", defaultValue: false },
                    { name: "isPublic", label: language === "ar" ? "بث عام" : "Public Stream", desc: language === "ar" ? "متاح لجميع الزوار" : "Available to all", defaultValue: true },
                  ].map(({ name, label, desc, defaultValue }) => (
                    <div key={name} className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-red-200 transition-colors">
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                      <Switch
                        defaultChecked={defaultValue}
                        onCheckedChange={(checked) => setValue(name as any, checked)}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledAt">
                    {language === "ar" ? "موعد البث (اختياري)" : "Scheduled Time (Optional)"}
                  </Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    {...register("scheduledAt")}
                    className="h-12"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => (step === 1 ? onOpenChange(false) : prevStep())}
              disabled={createMutation.isPending}
            >
              {step === 1 ? (language === "ar" ? "إلغاء" : "Cancel") : (language === "ar" ? "السابق" : "Previous")}
            </Button>

            {step < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                {language === "ar" ? "التالي" : "Next"}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {language === "ar" ? "جاري الإنشاء..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {language === "ar" ? "إنشاء البث" : "Create Stream"}
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
