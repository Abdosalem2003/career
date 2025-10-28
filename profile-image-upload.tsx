import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X, Camera, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface ProfileImageUploadProps {
  currentImage?: string;
  userName: string;
  onImageChange: (imageUrl: string) => void;
  maxSize?: number; // بالميجابايت
}

export function ProfileImageUpload({
  currentImage,
  userName,
  onImageChange,
  maxSize = 2,
}: ProfileImageUploadProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = async (file: File) => {
    // التحقق من نوع الملف
    if (!file.type.startsWith("image/")) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "الرجاء اختيار صورة" : "Please select an image",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" 
          ? `حجم الصورة يجب أن يكون أقل من ${maxSize}MB`
          : `Image size must be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // قراءة الصورة كـ base64
      const reader = new FileReader();
      
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress((e.loaded / e.total) * 100);
        }
      };

      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setPreviewUrl(base64);
        setProgress(100);
        
        // إرسال الصورة للـ parent component
        onImageChange(base64);
        
        toast({
          title: language === "ar" ? "تم الرفع" : "Uploaded",
          description: language === "ar" ? "تم رفع الصورة بنجاح" : "Image uploaded successfully",
        });
        
        setUploading(false);
      };

      reader.onerror = () => {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" ? "فشل رفع الصورة" : "Failed to upload image",
          variant: "destructive",
        });
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description: language === "ar" ? "فشل رفع الصورة" : "Failed to upload image",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    onImageChange("");
    toast({
      title: language === "ar" ? "تم الحذف" : "Removed",
      description: language === "ar" ? "تم حذف الصورة" : "Image removed",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative group">
        <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
          <AvatarImage src={previewUrl} alt={userName} />
          <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Upload Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-6 w-6" />
          </Button>
        </div>

        {/* Loading Spinner */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && progress < 100 && (
        <div className="w-full max-w-xs">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground mt-1">
            {Math.round(progress)}%
          </p>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`w-full max-w-xs border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900"
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-2">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {language === "ar" ? "اسحب الصورة هنا" : "Drag image here"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" ? "أو انقر لاختيار ملف" : "or click to select"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === "ar" ? `حتى ${maxSize}MB` : `Up to ${maxSize}MB`}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {previewUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4 mr-2" />
            {language === "ar" ? "إزالة الصورة" : "Remove Image"}
          </Button>
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-muted-foreground text-center max-w-xs">
        {language === "ar"
          ? "الصيغ المدعومة: JPG, PNG, GIF, WebP"
          : "Supported formats: JPG, PNG, GIF, WebP"}
      </p>
    </div>
  );
}
