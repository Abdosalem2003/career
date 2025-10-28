import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, TrendingUp, Calendar, Clock, Users, Share2, Heart, MessageSquare } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface Article {
  id: string;
  titleEn: string;
  titleAr: string;
  views: number;
  publishedAt: string;
  status: string;
}

interface ArticleAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: Article | null;
}

export function ArticleAnalyticsDialog({ open, onOpenChange, article }: ArticleAnalyticsDialogProps) {
  const { language } = useI18n();

  if (!article) return null;

  // Mock analytics data (في الإنتاج، سيتم جلبها من API)
  const analytics = {
    totalViews: article.views || 0,
    todayViews: Math.floor((article.views || 0) * 0.15),
    weekViews: Math.floor((article.views || 0) * 0.45),
    monthViews: Math.floor((article.views || 0) * 0.75),
    uniqueVisitors: Math.floor((article.views || 0) * 0.7),
    avgReadTime: "3:45",
    shares: Math.floor((article.views || 0) * 0.08),
    likes: Math.floor((article.views || 0) * 0.12),
    comments: Math.floor((article.views || 0) * 0.05),
    bounceRate: 35,
    engagementRate: 68,
  };

  const statCards = [
    {
      title: language === "ar" ? "إجمالي المشاهدات" : "Total Views",
      value: analytics.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
    },
    {
      title: language === "ar" ? "زوار فريدون" : "Unique Visitors",
      value: analytics.uniqueVisitors.toLocaleString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
    },
    {
      title: language === "ar" ? "المشاركات" : "Shares",
      value: analytics.shares.toLocaleString(),
      icon: Share2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+15%",
    },
    {
      title: language === "ar" ? "الإعجابات" : "Likes",
      value: analytics.likes.toLocaleString(),
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      change: "+20%",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {language === "ar" ? "إحصائيات المقال" : "Article Analytics"}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-1">
            {language === "ar" ? article.titleAr : article.titleEn}
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stat.change}
                      </Badge>
                    </div>
                    <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Time-based Views */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                {language === "ar" ? "المشاهدات حسب الفترة" : "Views by Period"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {language === "ar" ? "اليوم" : "Today"}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {analytics.todayViews.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(analytics.todayViews / analytics.totalViews) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {language === "ar" ? "هذا الأسبوع" : "This Week"}
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {analytics.weekViews.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(analytics.weekViews / analytics.totalViews) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      {language === "ar" ? "هذا الشهر" : "This Month"}
                    </span>
                    <span className="text-sm font-bold text-purple-600">
                      {analytics.monthViews.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(analytics.monthViews / analytics.totalViews) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Engagement Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-5 w-5 text-purple-600" />
                  {language === "ar" ? "مقاييس التفاعل" : "Engagement Metrics"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{language === "ar" ? "متوسط وقت القراءة" : "Avg. Read Time"}</span>
                  <span className="font-bold text-purple-600">{analytics.avgReadTime}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{language === "ar" ? "معدل الارتداد" : "Bounce Rate"}</span>
                  <span className="font-bold text-orange-600">{analytics.bounceRate}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{language === "ar" ? "معدل التفاعل" : "Engagement Rate"}</span>
                  <span className="font-bold text-green-600">{analytics.engagementRate}%</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  {language === "ar" ? "التفاعل الاجتماعي" : "Social Engagement"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">{language === "ar" ? "الإعجابات" : "Likes"}</span>
                  </div>
                  <span className="font-bold text-red-600">{analytics.likes.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700">{language === "ar" ? "المشاركات" : "Shares"}</span>
                  </div>
                  <span className="font-bold text-blue-600">{analytics.shares.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-gray-700">{language === "ar" ? "التعليقات" : "Comments"}</span>
                  </div>
                  <span className="font-bold text-green-600">{analytics.comments.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Article Info */}
          <Card className="bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">{language === "ar" ? "تاريخ النشر:" : "Published:"}</span>
                  <span className="font-medium">{new Date(article.publishedAt).toLocaleDateString("en-US")}</span>
                </div>
                <Badge variant={article.status === "published" ? "default" : "secondary"}>
                  {article.status === "published" 
                    ? (language === "ar" ? "منشور" : "Published")
                    : (language === "ar" ? "مسودة" : "Draft")}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
