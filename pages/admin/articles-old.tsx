
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Plus, MoreVertical, Edit, Trash2, Eye, Search } from "lucide-react";
import { useState } from "react";
import { CreateArticleDialog } from "@/components/admin/create-article-dialog";

interface Article {
  id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  status: string;
  views: number;
  featured: boolean;
  publishedAt: string;
  author: { name: string };
  category: { nameEn: string; nameAr: string };
}

export default function AdminArticles() {
  const { language } = useI18n();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  const filteredArticles = articles.filter((article) =>
    (article.titleEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     article.titleAr?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      published: "default",
      draft: "secondary",
      archived: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status === "published"
          ? language === "ar" ? "منشور" : "Published"
          : status === "draft"
          ? language === "ar" ? "مسودة" : "Draft"
          : language === "ar" ? "مؤرشف" : "Archived"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {language === "ar" ? "المقالات" : "Articles"}
          </h1>
          <p className="text-muted-foreground">
            {language === "ar"
              ? "إدارة جميع المقالات في النظام"
              : "Manage all articles in the system"}
          </p>
        </div>
        <Button data-testid="button-create-article" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {language === "ar" ? "مقال جديد" : "New Article"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث في المقالات..." : "Search articles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === "ar" ? "العنوان" : "Title"}</TableHead>
                <TableHead>{language === "ar" ? "القسم" : "Category"}</TableHead>
                <TableHead>{language === "ar" ? "الكاتب" : "Author"}</TableHead>
                <TableHead>{language === "ar" ? "الحالة" : "Status"}</TableHead>
                <TableHead>{language === "ar" ? "المشاهدات" : "Views"}</TableHead>
                <TableHead>{language === "ar" ? "مميز" : "Featured"}</TableHead>
                <TableHead>{language === "ar" ? "تاريخ النشر" : "Published"}</TableHead>
                <TableHead className="text-right">
                  {language === "ar" ? "إجراءات" : "Actions"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id} data-testid={`row-article-${article.id}`}>
                  <TableCell className="font-medium">
                    {language === "ar" ? article.titleAr : article.titleEn}
                  </TableCell>
                  <TableCell>
                    {language === "ar"
                      ? article.category.nameAr
                      : article.category.nameEn}
                  </TableCell>
                  <TableCell>{article.author.name}</TableCell>
                  <TableCell>{getStatusBadge(article.status)}</TableCell>
                  <TableCell>{article.views?.toLocaleString() || 0}</TableCell>
                  <TableCell>
                    {article.featured ? (
                      <Badge variant="default">
                        {language === "ar" ? "نعم" : "Yes"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        {language === "ar" ? "لا" : "No"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(article.publishedAt).toLocaleDateString(
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
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          {language === "ar" ? "عرض" : "View"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          {language === "ar" ? "تعديل" : "Edit"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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

      <CreateArticleDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
