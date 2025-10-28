import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Flame, 
  Search, 
  Eye, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Trash2,
  RefreshCw
} from 'lucide-react';
import type { ArticleWithRelations } from '@shared/schema';

export default function SpecialReportsAdmin() {
  const { language } = useI18n();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  // جلب جميع المقالات
  const { data: allArticles, isLoading } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/admin/articles'],
  });

  // جلب التقارير الخاصة الحالية
  const { data: specialReports } = useQuery<ArticleWithRelations[]>({
    queryKey: ['/api/special-reports'],
  });

  // Mutation لتحديث حالة التقرير الخاص
  const updateSpecialReport = useMutation({
    mutationFn: async ({ id, isSpecial, order }: { id: string; isSpecial: boolean; order?: number }) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialReport: isSpecial,
          specialReportOrder: order || 0,
        }),
      });
      if (!response.ok) throw new Error('Failed to update');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/articles'] });
      queryClient.invalidateQueries({ queryKey: ['/api/special-reports'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث التقرير بنجاح' : 'Report updated successfully',
      });
    },
  });

  // Mutation لتحديث الترتيب
  const updateOrder = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialReportOrder: newOrder,
        }),
      });
      if (!response.ok) throw new Error('Failed to update order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/special-reports'] });
    },
  });

  const handleToggleSpecialReport = (article: ArticleWithRelations) => {
    const isCurrentlySpecial = specialReports?.some(r => r.id === article.id);
    
    if (!isCurrentlySpecial && specialReports && specialReports.length >= 40) {
      toast({
        title: language === 'ar' ? 'تحذير' : 'Warning',
        description: language === 'ar' 
          ? 'لقد وصلت للحد الأقصى (40 تقرير). يرجى حذف تقرير قديم أولاً.'
          : 'Maximum limit reached (40 reports). Please remove an old report first.',
        variant: 'destructive',
      });
      return;
    }

    updateSpecialReport.mutate({
      id: article.id,
      isSpecial: !isCurrentlySpecial,
      order: isCurrentlySpecial ? 0 : (specialReports?.length || 0) + 1,
    });
  };

  const handleMoveUp = (article: ArticleWithRelations, currentIndex: number) => {
    if (currentIndex === 0) return;
    const newOrder = (specialReports?.[currentIndex - 1]?.specialReportOrder || 0) + 1;
    updateOrder.mutate({ id: article.id, newOrder });
  };

  const handleMoveDown = (article: ArticleWithRelations, currentIndex: number) => {
    if (!specialReports || currentIndex === specialReports.length - 1) return;
    const newOrder = (specialReports?.[currentIndex + 1]?.specialReportOrder || 0) - 1;
    updateOrder.mutate({ id: article.id, newOrder });
  };

  const filteredArticles = allArticles?.filter(article => {
    const title = language === 'ar' ? article.titleAr : article.titleEn;
    return title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'إدارة التقارير الخاصة' : 'Manage Special Reports'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? `${specialReports?.length || 0} / 40 تقرير نشط`
                : `${specialReports?.length || 0} / 40 active reports`
              }
            </p>
          </div>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/special-reports'] })}
          variant="outline"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'تحديث' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Special Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Flame className="h-6 w-6 text-green-500" />
              {language === 'ar' ? 'التقارير الخاصة الحالية' : 'Current Special Reports'}
              <Badge variant="secondary" className="text-lg">
                {specialReports?.length || 0}/40
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : specialReports && specialReports.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {specialReports.map((report, index) => {
                  const title = language === 'ar' ? report.titleAr : report.titleEn;
                  return (
                    <div
                      key={report.id}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-green-50 dark:bg-green-950/20"
                    >
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                        {report.coverImage && (
                          <img
                            src={report.coverImage}
                            alt={title || ''}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{report.views || 0}</span>
                          <Calendar className="h-3 w-3 ml-2" />
                          <span>
                            {report.publishedAt 
                              ? new Date(report.publishedAt).toLocaleDateString()
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveUp(report, index)}
                          disabled={index === 0}
                          className="h-7 w-7 p-0"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMoveDown(report, index)}
                          disabled={index === specialReports.length - 1}
                          className="h-7 w-7 p-0"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleSpecialReport(report)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                {language === 'ar' ? 'لا توجد تقارير خاصة' : 'No special reports'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* All Articles */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ar' ? 'جميع المقالات' : 'All Articles'}
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : filteredArticles && filteredArticles.length > 0 ? (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredArticles.map((article) => {
                  const title = language === 'ar' ? article.titleAr : article.titleEn;
                  const isSpecial = specialReports?.some(r => r.id === article.id);
                  
                  return (
                    <div
                      key={article.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={isSpecial}
                        onCheckedChange={() => handleToggleSpecialReport(article)}
                        disabled={!isSpecial && specialReports && specialReports.length >= 40}
                      />
                      <div className="flex-shrink-0 w-12 h-12 rounded overflow-hidden">
                        {article.coverImage && (
                          <img
                            src={article.coverImage}
                            alt={title || ''}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {isSpecial && (
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              <Flame className="h-3 w-3 mr-1" />
                              {language === 'ar' ? 'تقرير خاص' : 'Special'}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {article.views || 0} {language === 'ar' ? 'مشاهدة' : 'views'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                {language === 'ar' ? 'لا توجد مقالات' : 'No articles found'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
