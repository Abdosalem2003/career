import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, FolderOpen, Edit, Trash2, Copy } from "lucide-react";
import { EditCategoryDialog } from "./edit-category-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { ViewArticlesDialog } from "./view-articles-dialog";

interface CategoryActionsProps {
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
}

export function CategoryActions({ categoryId, categoryName, categoryNameAr }: CategoryActionsProps) {
  const { language } = useI18n();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewArticlesOpen, setViewArticlesOpen] = useState(false);

  // Copy slug to clipboard
  const handleCopySlug = () => {
    navigator.clipboard.writeText(categoryName);
    toast({
      title: language === "ar" ? "✓ تم النسخ" : "✓ Copied",
      description: language === "ar" ? "تم نسخ الرابط بنجاح" : "Slug copied to clipboard",
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          {/* View Articles */}
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setViewArticlesOpen(true)}
          >
            <FolderOpen className="h-4 w-4 mr-2 text-blue-600" />
            <span>{language === "ar" ? "عرض المقالات" : "View Articles"}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Edit Category */}
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={() => setEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2 text-green-600" />
            <span>{language === "ar" ? "تعديل القسم" : "Edit Category"}</span>
          </DropdownMenuItem>

          {/* Copy Slug */}
          <DropdownMenuItem 
            className="cursor-pointer"
            onClick={handleCopySlug}
          >
            <Copy className="h-4 w-4 mr-2 text-purple-600" />
            <span>{language === "ar" ? "نسخ الرابط" : "Copy Slug"}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Delete Category */}
          <DropdownMenuItem 
            className="text-destructive cursor-pointer"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <span>{language === "ar" ? "حذف القسم" : "Delete Category"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog */}
      <EditCategoryDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen}
        categoryId={categoryId}
        categoryName={categoryName}
        categoryNameAr={categoryNameAr}
      />

      {/* Delete Dialog */}
      <DeleteCategoryDialog 
        open={deleteDialogOpen} 
        onOpenChange={setDeleteDialogOpen}
        categoryId={categoryId}
        categoryName={categoryName}
        categoryNameAr={categoryNameAr}
      />

      {/* View Articles Dialog */}
      <ViewArticlesDialog 
        open={viewArticlesOpen} 
        onOpenChange={setViewArticlesOpen}
        categoryId={categoryId}
        categoryName={categoryName}
        categoryNameAr={categoryNameAr}
      />
    </>
  );
}
