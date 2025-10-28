import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfileImageUploaderProps {
  currentImage?: string;
  userName?: string;
  onImageChange: (base64: string) => void;
}

export function ProfileImageUploader({ 
  currentImage, 
  userName, 
  onImageChange 
}: ProfileImageUploaderProps) {
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار صورة فقط (JPG, PNG, GIF)",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "خطأ",
        description: "حجم الصورة يجب أن يكون أقل من 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // تحويل إلى Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageChange(base64);
        
        toast({
          title: "✓ تم",
          description: "تم اختيار الصورة بنجاح. احفظ التغييرات لتطبيقها.",
        });
        setUploading(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "خطأ",
          description: "فشل قراءة الصورة",
          variant: "destructive",
        });
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الصورة",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview("");
    onImageChange("");
    toast({
      title: "تم",
      description: "تم إزالة الصورة",
    });
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl border-2 border-blue-200 dark:border-blue-800">
      <div className="relative group">
        <Avatar className="h-32 w-32 ring-4 ring-blue-200 dark:ring-blue-800 shadow-xl transition-all group-hover:ring-blue-400">
          <AvatarImage src={preview} className="object-cover" />
          <AvatarFallback className="text-4xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
            {userName?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        
        {preview && (
          <Button
            type="button"
            size="icon"
            variant="destructive"
            className="absolute -top-2 -right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <Camera className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <Button
          type="button"
          variant="default"
          className="relative w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          disabled={uploading}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={uploading}
          />
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? "جاري التحميل..." : "اختر صورة جديدة"}
        </Button>
        
        {preview && preview !== currentImage && (
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            ✓ صورة جديدة محددة - احفظ التغييرات
          </p>
        )}
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-muted-foreground">
          الصيغ المدعومة: JPG, PNG, GIF, WEBP
        </p>
        <p className="text-xs text-muted-foreground">
          الحد الأقصى: 5 ميجابايت
        </p>
      </div>
    </div>
  );
}
