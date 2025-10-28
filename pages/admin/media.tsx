
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Search,
  MoreVertical,
  Trash2,
  Download,
  Copy,
  Eye,
  Filter,
  Grid3x3,
  List,
  Image as ImageIcon,
  File,
  Video,
} from "lucide-react";
import { useState } from "react";
import { UploadMediaDialog } from "@/components/admin/upload-media-dialog";

interface MediaFile {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export default function AdminMedia() {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState("all");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: media = [] } = useQuery<MediaFile[]>({
    queryKey: ["/api/admin/media"],
    queryFn: async () => [],
  });

  const filteredMedia = media.filter((file) => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || 
      (filterType === "images" && file.mimeType.startsWith("image/")) ||
      (filterType === "videos" && file.mimeType.startsWith("video/")) ||
      (filterType === "documents" && !file.mimeType.startsWith("image/") && !file.mimeType.startsWith("video/"));
    return matchesSearch && matchesType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-8 w-8" />;
    if (mimeType.startsWith("video/")) return <Video className="h-8 w-8" />;
    return <File className="h-8 w-8" />;
  };

  const totalSize = media.reduce((sum, file) => sum + file.size, 0);
  const imageCount = media.filter(f => f.mimeType.startsWith("image/")).length;
  const videoCount = media.filter(f => f.mimeType.startsWith("video/")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "مكتبة الوسائط" : "Media Library"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "إدارة الصور والفيديوهات والملفات"
              : "Manage images, videos, and files"}
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          {language === "ar" ? "رفع ملف" : "Upload File"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "إجمالي الملفات" : "Total Files"}
              </div>
            </div>
            <div className="text-2xl font-bold">{media.length}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "الصور" : "Images"}
              </div>
            </div>
            <div className="text-2xl font-bold">{imageCount}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                {language === "ar" ? "الفيديوهات" : "Videos"}
              </div>
            </div>
            <div className="text-2xl font-bold">{videoCount}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "المساحة المستخدمة" : "Storage Used"}
            </div>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث في الملفات..." : "Search files..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {language === "ar" ? "الكل" : "All"}
                </SelectItem>
                <SelectItem value="images">
                  {language === "ar" ? "الصور" : "Images"}
                </SelectItem>
                <SelectItem value="videos">
                  {language === "ar" ? "الفيديوهات" : "Videos"}
                </SelectItem>
                <SelectItem value="documents">
                  {language === "ar" ? "المستندات" : "Documents"}
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((file) => (
                <Card key={file.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-2">
                      {file.mimeType.startsWith("image/") ? (
                        <img
                          src={file.filePath}
                          alt={file.fileName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        getFileIcon(file.mimeType)
                      )}
                    </div>
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                          <Eye className="h-4 w-4 mr-2" />
                          {language === "ar" ? "عرض" : "View"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          {language === "ar" ? "نسخ الرابط" : "Copy URL"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          {language === "ar" ? "تحميل" : "Download"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          {language === "ar" ? "حذف" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                      {file.mimeType.startsWith("image/") ? (
                        <img
                          src={file.filePath}
                          alt={file.fileName}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file.mimeType)
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{file.fileName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        {language === "ar" ? "عرض" : "View"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        {language === "ar" ? "نسخ الرابط" : "Copy URL"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2" />
                        {language === "ar" ? "تحميل" : "Download"}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Details Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.fileName}</DialogTitle>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-4">
              {selectedFile.mimeType.startsWith("image/") && (
                <img
                  src={selectedFile.filePath}
                  alt={selectedFile.fileName}
                  className="w-full rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "نوع الملف" : "File Type"}
                  </p>
                  <p className="font-medium">{selectedFile.mimeType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الحجم" : "Size"}
                  </p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "تاريخ الرفع" : "Upload Date"}
                  </p>
                  <p className="font-medium">
                    {new Date(selectedFile.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الرابط" : "URL"}
                  </p>
                  <p className="font-medium text-sm truncate">{selectedFile.filePath}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <UploadMediaDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} />
    </div>
  );
}
