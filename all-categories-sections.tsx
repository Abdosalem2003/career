import { useQuery } from "@tanstack/react-query";
import { DynamicCategorySection } from "./dynamic-category-section";
import type { Category } from "@shared/types";
import { Skeleton } from "@/components/ui/skeleton";

export function AllCategoriesSections() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="space-y-12">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, j) => (
                <Skeleton key={j} className="h-64 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {categories.map((category, index) => (
        <DynamicCategorySection
          key={category.id}
          category={category}
          index={index}
        />
      ))}
    </div>
  );
}
