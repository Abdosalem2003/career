import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface UploadedImage {
  id: string;
  url: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface ImageUploaderAdvancedProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  maxSizePerImage?: number; // in MB
  language?: 'ar' | 'en';
}

export function ImageUploaderAdvanced({
  onImagesUploaded,
  maxImages = Infinity,
  maxSizePerImage = 10,
  language = 'ar'
}: ImageUploaderAdvancedProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const texts = {
    ar: {
      dragDrop: 'اسحب وأفلت الصور هنا',
      or: 'أو',
      browse: 'تصفح الملفات',
      uploading: 'جاري الرفع...',
      success: 'تم الرفع بنجاح',
      error: 'فشل الرفع',
      maxSize: `الحد الأقصى ${maxSizePerImage}MB لكل صورة`,
      maxImages: `الحد الأقصى ${maxImages} صورة`,
      remove: 'حذف',
      compressing: 'جاري الضغط...',
      formats: 'JPG, PNG, GIF, WEBP'
    },
    en: {
      dragDrop: 'Drag & drop images here',
      or: 'or',
      browse: 'Browse Files',
      uploading: 'Uploading...',
      success: 'Upload successful',
      error: 'Upload failed',
      maxSize: `Max ${maxSizePerImage}MB per image`,
      maxImages: `Max ${maxImages} images`,
      remove: 'Remove',
      compressing: 'Compressing...',
      formats: 'JPG, PNG, GIF, WEBP'
    }
  };

  const t = texts[language];

  // Compress image before upload
  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if too large
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85 // Quality
          );
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Upload single image
  const uploadImage = async (file: File, imageId: string) => {
    try {
      // Update status to compressing
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, status: 'uploading' as const, progress: 10 } : img
      ));

      // Compress image
      const compressedBlob = await compressImage(file);
      
      // Update progress
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, progress: 30 } : img
      ));

      // Convert to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      const base64 = await base64Promise;

      // Update progress
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, progress: 60 } : img
      ));

      // Upload to server
      const response = await fetch('/api/dash-unnt-2025/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64,
          fileName: file.name,
          mimeType: file.type
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Update to success
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'success' as const, progress: 100, url: data.url } 
          : img
      ));

      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, status: 'error' as const, error: t.error } 
          : img
      ));
      throw error;
    }
  };

  // Handle file selection
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check max images limit
    if (images.length + fileArray.length > maxImages) {
      toast({
        title: language === 'ar' ? 'تجاوز الحد الأقصى' : 'Limit exceeded',
        description: t.maxImages,
        variant: 'destructive'
      });
      return;
    }

    // Validate and create image objects
    const newImages: UploadedImage[] = [];
    for (const file of fileArray) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: language === 'ar' ? 'نوع ملف غير صحيح' : 'Invalid file type',
          description: file.name,
          variant: 'destructive'
        });
        continue;
      }

      // Check file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSizePerImage) {
        toast({
          title: language === 'ar' ? 'حجم الملف كبير جداً' : 'File too large',
          description: `${file.name} (${sizeMB.toFixed(2)}MB)`,
          variant: 'destructive'
        });
        continue;
      }

      const imageId = `${Date.now()}-${Math.random()}`;
      newImages.push({
        id: imageId,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0
      });

      // Start upload
      uploadImage(file, imageId).catch(console.error);
    }

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, maxImages, maxSizePerImage, language, toast]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Remove image
  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Get successful uploads
  const getSuccessfulUrls = () => {
    return images.filter(img => img.status === 'success').map(img => img.url);
  };

  // Notify parent when images are uploaded
  const handleDone = () => {
    const urls = getSuccessfulUrls();
    if (urls.length > 0) {
      onImagesUploaded(urls);
      toast({
        title: t.success,
        description: `${urls.length} ${language === 'ar' ? 'صورة' : 'images'}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`relative border-2 border-dashed transition-all ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <Upload className={`h-8 w-8 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-700">
                {t.dragDrop}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {t.or}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {t.browse}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />

            <div className="text-xs text-gray-400 space-y-1">
              <p>{t.formats}</p>
              <p>{t.maxSize}</p>
              {maxImages !== Infinity && <p>{t.maxImages}</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      {t.remove}
                    </Button>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    {image.status === 'uploading' && (
                      <div className="bg-blue-500 text-white p-1.5 rounded-full">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    )}
                    {image.status === 'success' && (
                      <div className="bg-green-500 text-white p-1.5 rounded-full">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    {image.status === 'error' && (
                      <div className="bg-red-500 text-white p-1.5 rounded-full">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {image.status === 'uploading' && (
                  <div className="p-2">
                    <Progress value={image.progress} className="h-1" />
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {image.progress}%
                    </p>
                  </div>
                )}

                {/* File Info */}
                <div className="p-2 border-t">
                  <p className="text-xs text-gray-600 truncate" title={image.name}>
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(image.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Done Button */}
          {getSuccessfulUrls().length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleDone} className="bg-green-600 hover:bg-green-700">
                <Check className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تم' : 'Done'} ({getSuccessfulUrls().length})
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
