/**
 * Media Uploader Component
 * مكون رفع الوسائط
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Image as ImageIcon, Video, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MediaUploaderProps {
  onImageUpload: (images: string[]) => void;
  onVideoUpload: (videos: string[]) => void;
  uploadedImages: string[];
  uploadedVideos: string[];
  language: string;
}

export function MediaUploader({
  onImageUpload,
  onVideoUpload,
  uploadedImages,
  uploadedVideos,
  language
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newImages: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        newImages.push(reader.result as string);
        setProgress(((i + 1) / files.length) * 100);

        if (i === files.length - 1) {
          onImageUpload([...uploadedImages, ...newImages]);
          setUploading(false);
          setProgress(0);
          toast({
            title: "✅ " + (language === "ar" ? "تم الرفع" : "Uploaded"),
            description: `${files.length} ${language === "ar" ? "صورة" : "images"}`,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    const newVideos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onloadend = () => {
        newVideos.push(reader.result as string);
        setProgress(((i + 1) / files.length) * 100);

        if (i === files.length - 1) {
          onVideoUpload([...uploadedVideos, ...newVideos]);
          setUploading(false);
          setProgress(0);
          toast({
            title: "✅ " + (language === "ar" ? "تم الرفع" : "Uploaded"),
            description: `${files.length} ${language === "ar" ? "فيديو" : "videos"}`,
          });
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    onImageUpload(newImages);
  };

  const removeVideo = (index: number) => {
    const newVideos = uploadedVideos.filter((_, i) => i !== index);
    onVideoUpload(newVideos);
  };

  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {language === "ar" ? "رفع الصور" : "Upload Images"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="max-w-xs mx-auto"
              disabled={uploading}
            />
            {uploading && <Progress value={progress} className="mt-4" />}
          </div>

          {/* Image Gallery */}
          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {uploadedImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt={`Upload ${i + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            {language === "ar" ? "رفع الفيديوهات" : "Upload Videos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
            <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <Input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoUpload}
              className="max-w-xs mx-auto"
              disabled={uploading}
            />
            {uploading && <Progress value={progress} className="mt-4" />}
          </div>

          {/* Video List */}
          {uploadedVideos.length > 0 && (
            <div className="space-y-2 mt-4">
              {uploadedVideos.map((video, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-purple-600" />
                    <span className="text-sm">
                      {language === "ar" ? "فيديو" : "Video"} {i + 1}
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeVideo(i)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
