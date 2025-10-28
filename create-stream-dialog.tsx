import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
import { Video, Youtube, Monitor, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InsertLiveStream } from "@shared/schema";

interface CreateStreamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateStreamDialog({ open, onOpenChange }: CreateStreamDialogProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [streamType, setStreamType] = useState<"rtmp" | "external" | "screen_share">("rtmp");

  const { register, handleSubmit, reset, watch, setValue } = useForm<Partial<InsertLiveStream>>({
    defaultValues: {
      streamType: "rtmp",
      status: "scheduled",
      enableChat: true,
      enableRecording: false,
      isPublic: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<InsertLiveStream>) => {
      const response = await fetch("/api/admin/live-streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-streams/stats"] });
      toast({
        title: language === "ar" ? "تم الإنشاء" : "Created",
        description: language === "ar" ? "تم إنشاء البث بنجاح" : "Stream created successfully",
      });
      reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل إنشاء البث" : "Failed to create stream",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Partial<InsertLiveStream>) => {
    createMutation.mutate({
      ...data,
      streamType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {language === "ar" ? "إنشاء بث جديد" : "Create New Stream"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar"
              ? "اختر نوع البث وأدخل التفاصيل المطلوبة"
              : "Choose stream type and enter required details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Stream Type Selection */}
          <div className="space-y-3">
            <Label>{language === "ar" ? "نوع البث" : "Stream Type"}</Label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => {
                  setStreamType("rtmp");
                  setValue("streamType", "rtmp");
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  streamType === "rtmp"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <Video className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">RTMP</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {language === "ar" ? "بث مباشر حقيقي" : "Real Live Stream"}
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStreamType("external");
                  setValue("streamType", "external");
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  streamType === "external"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <Youtube className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">
                  {language === "ar" ? "رابط خارجي" : "External"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  YouTube, Vimeo, etc
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStreamType("screen_share");
                  setValue("streamType", "screen_share");
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  streamType === "screen_share"
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <Monitor className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">
                  {language === "ar" ? "مشاركة الشاشة" : "Screen Share"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {language === "ar" ? "بث الشاشة" : "Share Screen"}
                </div>
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">
                {language === "ar" ? "أساسي" : "Basic"}
              </TabsTrigger>
              <TabsTrigger value="stream">
                {language === "ar" ? "البث" : "Stream"}
              </TabsTrigger>
              <TabsTrigger value="settings">
                {language === "ar" ? "إعدادات" : "Settings"}
              </TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titleEn">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </Label>
                  <Input
                    id="titleEn"
                    {...register("titleEn", { required: true })}
                    placeholder="Enter title in English"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titleAr">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </Label>
                  <Input
                    id="titleAr"
                    {...register("titleAr", { required: true })}
                    placeholder="أدخل العنوان بالعربية"
                    dir="rtl"
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
                    placeholder="Enter description in English"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descriptionAr">
                    {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                  </Label>
                  <Textarea
                    id="descriptionAr"
                    {...register("descriptionAr")}
                    placeholder="أدخل الوصف بالعربية"
                    dir="rtl"
                    rows={3}
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
                />
              </div>
            </TabsContent>

            {/* Stream Tab */}
            <TabsContent value="stream" className="space-y-4">
              {streamType === "rtmp" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rtmpUrl">
                      {language === "ar" ? "RTMP Server URL" : "RTMP Server URL"}
                    </Label>
                    <Input
                      id="rtmpUrl"
                      {...register("rtmpUrl")}
                      placeholder="rtmp://your-server.com/live"
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "ar"
                        ? "عنوان خادم RTMP الخاص بك"
                        : "Your RTMP server address"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtmpKey">
                      {language === "ar" ? "Stream Key" : "Stream Key"}
                    </Label>
                    <Input
                      id="rtmpKey"
                      {...register("rtmpKey")}
                      placeholder="your-stream-key-here"
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "ar"
                        ? "مفتاح البث الخاص بك (سيتم إنشاؤه تلقائياً إذا تُرك فارغاً)"
                        : "Your stream key (will be auto-generated if left empty)"}
                    </p>
                  </div>
                </>
              )}

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
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="vimeo">Vimeo</SelectItem>
                        <SelectItem value="twitch">Twitch</SelectItem>
                        <SelectItem value="facebook">Facebook Live</SelectItem>
                        <SelectItem value="other">
                          {language === "ar" ? "أخرى" : "Other"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="externalUrl">
                      {language === "ar" ? "رابط البث" : "Stream URL"}
                    </Label>
                    <Input
                      id="externalUrl"
                      {...register("externalUrl")}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground">
                      {language === "ar"
                        ? "رابط البث من YouTube أو منصة أخرى"
                        : "Stream URL from YouTube or other platform"}
                    </p>
                  </div>
                </>
              )}

              {streamType === "screen_share" && (
                <div className="p-6 bg-muted rounded-lg text-center">
                  <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {language === "ar"
                      ? "سيتم تفعيل مشاركة الشاشة عند بدء البث"
                      : "Screen sharing will be activated when stream starts"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ar"
                      ? "ستحتاج إلى السماح بمشاركة الشاشة في المتصفح"
                      : "You'll need to allow screen sharing in your browser"}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="scheduledAt">
                  {language === "ar" ? "موعد البث" : "Scheduled Time"}
                </Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  {...register("scheduledAt")}
                />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {language === "ar" ? "تفعيل الدردشة" : "Enable Chat"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "السماح للمشاهدين بالدردشة"
                        : "Allow viewers to chat"}
                    </div>
                  </div>
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => setValue("enableChat", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {language === "ar" ? "تسجيل البث" : "Record Stream"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "حفظ البث للمشاهدة لاحقاً"
                        : "Save stream for later viewing"}
                    </div>
                  </div>
                  <Switch
                    defaultChecked={false}
                    onCheckedChange={(checked) => setValue("enableRecording", checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {language === "ar" ? "بث عام" : "Public Stream"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {language === "ar"
                        ? "متاح لجميع الزوار"
                        : "Available to all visitors"}
                    </div>
                  </div>
                  <Switch
                    defaultChecked={true}
                    onCheckedChange={(checked) => setValue("isPublic", checked)}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              {createMutation.isPending
                ? language === "ar"
                  ? "جاري الإنشاء..."
                  : "Creating..."
                : language === "ar"
                ? "إنشاء البث"
                : "Create Stream"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
