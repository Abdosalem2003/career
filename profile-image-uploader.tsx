import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileImageUploaderProps {
  currentImage?: string;
  userName: string;
  onImageChange: (base64: string) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfileImageUploader({
  currentImage,
  userName,
  onImageChange,
  size = "md",
  className,
}: ProfileImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-20 w-20",
    md: "h-32 w-32",
    lg: "h-40 w-40",
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("الملف يجب أن يكون صورة");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("حجم الصورة يجب أن يكون أقل من 5MB");
      return;
    }

    setIsLoading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        console.log('[ProfileImageUploader] Image converted to base64, length:', base64.length);
        setPreview(base64);
        onImageChange(base64);
        console.log('[ProfileImageUploader] onImageChange called');
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError("فشل قراءة الملف");
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("حدث خطأ أثناء رفع الصورة");
      setIsLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar with Upload Button */}
      <div className="relative group">
        <Avatar className={cn(sizeClasses[size], "border-4 border-white shadow-xl transition-all")}>
          {preview ? (
            <AvatarImage src={preview} alt={userName} className="object-cover" />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-4xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Upload Overlay */}
        <div
          onClick={handleClick}
          className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </div>

        {/* Remove Button */}
        {preview && !isLoading && (
          <button
            onClick={handleRemove}
            className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClick}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              جاري الرفع...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {preview ? "تغيير الصورة" : "رفع صورة"}
            </>
          )}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Info Text */}
        <p className="text-xs text-gray-500 text-center">
          PNG, JPG, GIF حتى 5MB
        </p>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-500 text-center font-medium">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
