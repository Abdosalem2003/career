import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Radio, Plus, Edit, Trash2, Eye, ExternalLink, Youtube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Stream {
  id: string;
  name: string;
  youtubeUrl?: string;
  description?: string;
  status: "live" | "ended" | "scheduled";
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

export default function AdminStreams() {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStream, setEditingStream] = useState<Stream | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    youtubeUrl: "",
    description: "",
    status: "scheduled" as "live" | "ended" | "scheduled",
  });

  // Fetch streams
  const { data: streams = [], isLoading } = useQuery<Stream[]>({
    queryKey: ["/api/streams"],
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = editingStream 
        ? `/api/admin/streams/${editingStream.id}`
        : "/api/admin/streams";
      
      const response = await fetch(url, {
        method: editingStream ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save stream");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: language === "ar" ? "✅ تم الحفظ" : "✅ Saved",
        description: language === "ar" 
          ? "تم حفظ البث بنجاح" 
          : "Stream saved successfully",
      });
    },
    onError: () => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: language === "ar" 
          ? "فشل حفظ البث" 
          : "Failed to save stream",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/streams/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete stream");
      return response.json();
    },
    onSuccess: () => {
      // Force refresh both queries
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      queryClient.refetchQueries({ queryKey: ["/api/streams"] });
      toast({
        title: language === "ar" ? "✅ تم الحذف" : "✅ Deleted",
        description: language === "ar" 
          ? "تم حذف البث بنجاح" 
          : "Stream deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: language === "ar" ? "❌ خطأ" : "❌ Error",
        description: language === "ar" 
          ? "فشل حذف البث" 
          : "Failed to delete stream",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      youtubeUrl: "",
      description: "",
      status: "scheduled",
    });
    setEditingStream(null);
  };

  const handleEdit = (stream: Stream) => {
    setEditingStream(stream);
    setFormData({
      name: stream.name,
      youtubeUrl: stream.youtubeUrl || "",
      description: stream.description || "",
      status: stream.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.youtubeUrl.trim()) {
      toast({
        title: language === "ar" ? "⚠️ تنبيه" : "⚠️ Warning",
        description: language === "ar" 
          ? "الرجاء ملء جميع الحقول المطلوبة" 
          : "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      live: "bg-red-500 hover:bg-red-500 animate-pulse",
      scheduled: "bg-blue-500 hover:bg-blue-500",
      ended: "bg-gray-500 hover:bg-gray-500",
    };
    const labels = {
      live: language === "ar" ? "مباشر" : "Live",
      scheduled: language === "ar" ? "مجدول" : "Scheduled",
      ended: language === "ar" ? "انتهى" : "Ended",
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              <Radio className="h-5 w-5 text-white" />
            </div>
            {language === "ar" ? "إدارة البث المباشر" : "Live Streams Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar" 
              ? "إنشاء وإدارة البث المباشر من YouTube" 
              : "Create and manage live streams from YouTube"}
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
          className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          {language === "ar" ? "إضافة بث" : "Add Stream"}
        </Button>
      </div>

      {/* Streams Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            {language === "ar" ? "قائمة البث" : "Streams List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-12">
              <Radio className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === "ar" 
                  ? "لا توجد بثوث. ابدأ بإضافة بث جديد!" 
                  : "No streams yet. Start by adding a new stream!"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === "ar" ? "الاسم" : "Name"}</TableHead>
                    <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                    <TableHead>{language === "ar" ? "رابط YouTube" : "YouTube URL"}</TableHead>
                    <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                    <TableHead className="text-right">{language === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell className="font-medium">{stream.name}</TableCell>
                      <TableCell>{getStatusBadge(stream.status)}</TableCell>
                      <TableCell>
                        {stream.youtubeUrl ? (
                          <a
                            href={stream.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {language === "ar" ? "فتح" : "Open"}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(stream.createdAt).toLocaleDateString("en-US", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open("/live", "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(stream)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
                                deleteMutation.mutate(stream.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              {editingStream 
                ? (language === "ar" ? "تعديل البث" : "Edit Stream")
                : (language === "ar" ? "إضافة بث جديد" : "Add New Stream")}
            </DialogTitle>
            <DialogDescription>
              {language === "ar" 
                ? "أضف رابط YouTube للبث المباشر" 
                : "Add YouTube URL for live streaming"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Stream Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {language === "ar" ? "اسم البث" : "Stream Name"} *
              </Label>
              <Input
                id="name"
                placeholder={language === "ar" ? "مثال: مؤتمر صحفي" : "e.g., Press Conference"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">
                {language === "ar" ? "رابط YouTube" : "YouTube URL"} *
              </Label>
              <Input
                id="youtubeUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {language === "ar" 
                  ? "انسخ رابط الفيديو من YouTube" 
                  : "Copy the video URL from YouTube"}
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                {language === "ar" ? "الحالة" : "Status"}
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">
                    {language === "ar" ? "مباشر الآن" : "Live Now"}
                  </SelectItem>
                  <SelectItem value="scheduled">
                    {language === "ar" ? "مجدول" : "Scheduled"}
                  </SelectItem>
                  <SelectItem value="ended">
                    {language === "ar" ? "انتهى" : "Ended"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {language === "ar" ? "الوصف" : "Description"}
              </Label>
              <Textarea
                id="description"
                placeholder={language === "ar" ? "وصف البث..." : "Stream description..."}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              {saveMutation.isPending 
                ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                : (language === "ar" ? "حفظ" : "Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
