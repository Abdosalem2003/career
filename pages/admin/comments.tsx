import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreVertical, Check, X, Trash2, Search, MessageSquare, Flag } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  articleId: string;
  userId?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  parentId?: string;
  createdAt: string;
}

export default function AdminComments() {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/admin/comments"],
    queryFn: async () => {
      const response = await fetch("/api/admin/comments");
      if (!response.ok) throw new Error("Failed to fetch comments");
      return response.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/comments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update comment status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({
        title: language === "ar" ? "تم التحديث بنجاح" : "Updated successfully",
        description: language === "ar" ? "تم تحديث حالة التعليق" : "Comment status updated",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/comments"] });
      toast({
        title: language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully",
        description: language === "ar" ? "تم حذف التعليق" : "Comment deleted",
      });
    },
  });

  const filteredComments = comments.filter((comment) => {
    const matchesSearch = 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || comment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      approved: { variant: "default", label: language === "ar" ? "موافق عليه" : "Approved" },
      pending: { variant: "secondary", label: language === "ar" ? "قيد المراجعة" : "Pending" },
      rejected: { variant: "destructive", label: language === "ar" ? "مرفوض" : "Rejected" },
      spam: { variant: "outline", label: language === "ar" ? "سبام" : "Spam" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const statusCounts = {
    all: comments.length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
    spam: comments.filter((c) => c.status === "spam").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "التعليقات" : "Comments"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar" ? "إدارة تعليقات المستخدمين" : "Manage user comments"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "جميع التعليقات" : "All Comments"}
            </div>
            <div className="text-2xl font-bold">{statusCounts.all}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "قيد المراجعة" : "Pending"}
            </div>
            <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "موافق عليه" : "Approved"}
            </div>
            <div className="text-2xl font-bold text-green-600">{statusCounts.approved}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "مرفوض" : "Rejected"}
            </div>
            <div className="text-2xl font-bold text-red-600">{statusCounts.rejected}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <div className="text-sm text-muted-foreground">
              {language === "ar" ? "سبام" : "Spam"}
            </div>
            <div className="text-2xl font-bold text-gray-600">{statusCounts.spam}</div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث في التعليقات..." : "Search comments..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === "ar" ? "الكل" : "All"}</SelectItem>
                <SelectItem value="pending">{language === "ar" ? "قيد المراجعة" : "Pending"}</SelectItem>
                <SelectItem value="approved">{language === "ar" ? "موافق عليه" : "Approved"}</SelectItem>
                <SelectItem value="rejected">{language === "ar" ? "مرفوض" : "Rejected"}</SelectItem>
                <SelectItem value="spam">{language === "ar" ? "سبام" : "Spam"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "المؤلف" : "Author"}</TableHead>
                <TableHead>{language === "ar" ? "التعليق" : "Comment"}</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "التاريخ" : "Date"}</TableHead>
                <TableHead className="text-right">
                  {language === "ar" ? "إجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.authorName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{comment.authorName}</div>
                        <div className="text-sm text-muted-foreground">{comment.authorEmail}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="truncate">{comment.content}</p>
                  </TableCell>
                  <TableCell>{getStatusBadge(comment.status)}</TableCell>
                  <TableCell>
                    {new Date(comment.createdAt).toLocaleDateString(
                      language === "ar" ? "ar-SA" : "en-US"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => updateStatusMutation.mutate({ id: comment.id, status: "approved" })}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          {language === "ar" ? "موافقة" : "Approve"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatusMutation.mutate({ id: comment.id, status: "rejected" })}
                        >
                          <X className="h-4 w-4 mr-2" />
                          {language === "ar" ? "رفض" : "Reject"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateStatusMutation.mutate({ id: comment.id, status: "spam" })}
                        >
                          <Flag className="h-4 w-4 mr-2" />
                          {language === "ar" ? "وسم كسبام" : "Mark as Spam"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {language === "ar" ? "حذف" : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}