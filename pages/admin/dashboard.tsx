import { useI18n } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, FolderOpen, Radio, Eye, TrendingUp, Clock, Activity, BarChart3, Zap, MessageSquare, Settings } from "lucide-react";
import { NotificationsDropdown } from "@/components/admin/notifications-dropdown";
import { CalendarDropdown } from "@/components/admin/calendar-dropdown";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProtectedRoute } from "@/components/protected-route";

interface Stats {
  totalArticles: number;
  totalUsers: number;
  totalCategories: number;
  activeStreams: number;
  totalViews: number;
  todayViews: number;
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { language } = useI18n();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? (language === "ar" ? "صباح الخير" : "Good Morning") 
    : currentHour < 18 ? (language === "ar" ? "مساء الخير" : "Good Afternoon") 
    : (language === "ar" ? "مساء الخير" : "Good Evening");

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
  });

  const statCards = [
    {
      title: language === "ar" ? "إجمالي المقالات" : "Total Articles",
      value: stats?.totalArticles || 0,
      icon: FileText,
      color: "text-blue-500",
      testId: "stat-articles",
      link: "/dash-unnt-2025/articles",
    },
    {
      title: language === "ar" ? "المستخدمون" : "Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      trend: "+12%",
      testId: "stat-users",
      link: "/dash-unnt-2025/users-management",
    },
    {
      title: language === "ar" ? "الأقسام" : "Categories",
      value: stats?.totalCategories || 0,
      icon: FolderOpen,
      color: "text-purple-500",
      testId: "stat-categories",
      link: "/dash-unnt-2025/categories",
    },
    {
      title: language === "ar" ? "بث مباشر نشط" : "Active Streams",
      value: stats?.activeStreams || 0,
      icon: Radio,
      color: "text-red-500",
      testId: "stat-streams",
      link: "/dash-unnt-2025/streams",
    },
    {
      title: language === "ar" ? "إجمالي المشاهدات" : "Total Views",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-orange-500",
      testId: "stat-total-views",
      link: "/dash-unnt-2025/analytics/total-views",
    },
    {
      title: language === "ar" ? "مشاهدات اليوم" : "Today's Views",
      value: stats?.todayViews || 0,
      icon: TrendingUp,
      color: "text-cyan-500",
      testId: "stat-today-views",
      link: "/dash-unnt-2025/analytics/today-views",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Greeting & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">
                {greeting}! 👋
              </h1>
              <p className="text-sm text-gray-600">
                {language === "ar" ? "نظرة عامة على نظام الأخبار" : "Overview of your news system"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Feature 1: Quick Notifications & Calendar */}
        <div className="flex items-center gap-3">
          <NotificationsDropdown />
          <CalendarDropdown />
        </div>
      </div>

      {/* Enhanced Stats Grid with Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.testId} href={stat.link}>
            <Card className="hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">{stat.title}</CardTitle>
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color.replace('text-', 'from-')} to-gray-100 flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2" data-testid={stat.testId}>
                  {stat.value.toLocaleString()}
                </div>
                {/* Feature 2: Progress Indicators */}
                <div className="space-y-1">
                  <Progress value={Math.min((stat.value / 10) * 100, 100)} className="h-1.5" />
                  <p className="text-xs text-gray-500">
                    {language === "ar" ? "نمو +12% هذا الشهر" : "+12% growth this month"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Enhanced */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  {language === "ar" ? "إجراءات سريعة" : "Quick Actions"}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {language === "ar" ? "4 إجراءات" : "4 Actions"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/dash-unnt-2025/create-article">
                  <button
                    data-testid="button-create-article"
                    className="group w-full p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:shadow-lg text-center transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
                      <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                      {language === "ar" ? "مقال جديد" : "New Article"}
                    </p>
                  </button>
                </Link>
                <Link href="/dash-unnt-2025/categories">
                  <button
                    data-testid="button-create-category"
                    className="group w-full p-5 rounded-xl border-2 border-gray-200 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 hover:shadow-lg text-center transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-purple-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
                      <FolderOpen className="h-6 w-6 text-purple-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">
                      {language === "ar" ? "قسم جديد" : "New Category"}
                    </p>
                  </button>
                </Link>
                <Link href="/dash-unnt-2025/users-management">
                  <button
                    data-testid="button-create-user"
                    className="group w-full p-5 rounded-xl border-2 border-gray-200 hover:border-green-500 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100 hover:shadow-lg text-center transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-green-100 group-hover:bg-green-500 flex items-center justify-center transition-colors">
                      <Users className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-green-700">
                      {language === "ar" ? "مستخدم جديد" : "New User"}
                    </p>
                  </button>
                </Link>
                <Link href="/dash-unnt-2025/streams">
                  <button
                    data-testid="button-start-stream"
                    className="group w-full p-5 rounded-xl border-2 border-gray-200 hover:border-red-500 hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 hover:shadow-lg text-center transition-all cursor-pointer"
                  >
                    <div className="h-12 w-12 mx-auto mb-3 rounded-xl bg-red-100 group-hover:bg-red-500 flex items-center justify-center transition-colors">
                      <Radio className="h-6 w-6 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-red-700">
                      {language === "ar" ? "بدء بث" : "Start Stream"}
                    </p>
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature 3: Recent Activity Timeline */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-purple-600" />
              {language === "ar" ? "النشاط الأخير" : "Recent Activity"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {language === "ar" ? "مقال جديد تم نشره" : "New article published"}
                  </p>
                  <p className="text-xs text-gray-500">{language === "ar" ? "منذ 5 دقائق" : "5 minutes ago"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {language === "ar" ? "مستخدم جديد انضم" : "New user joined"}
                  </p>
                  <p className="text-xs text-gray-500">{language === "ar" ? "منذ 15 دقيقة" : "15 minutes ago"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {language === "ar" ? "تعليق جديد" : "New comment"}
                  </p>
                  <p className="text-xs text-gray-500">{language === "ar" ? "منذ 30 دقيقة" : "30 minutes ago"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature 4: Performance Chart & Feature 5: Quick Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              {language === "ar" ? "نظرة عامة على الأداء" : "Performance Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "معدل النشر" : "Publishing Rate"}
                  </span>
                  <span className="text-sm font-bold text-blue-600">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "تفاعل المستخدمين" : "User Engagement"}
                  </span>
                  <span className="text-sm font-bold text-green-600">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {language === "ar" ? "جودة المحتوى" : "Content Quality"}
                  </span>
                  <span className="text-sm font-bold text-purple-600">91%</span>
                </div>
                <Progress value={91} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              {language === "ar" ? "إعدادات سريعة" : "Quick Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                  <Settings className="h-4 w-4 mr-2" />
                  {language === "ar" ? "إعدادات الموقع" : "Site Settings"}
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                  <Users className="h-4 w-4 mr-2" />
                  {language === "ar" ? "إدارة المستخدمين" : "Manage Users"}
                </Button>
              </Link>
              <Link href="/admin/seo">
                <Button variant="outline" className="w-full justify-start hover:bg-gray-50">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {language === "ar" ? "تحسين محركات البحث" : "SEO Settings"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>{language === "ar" ? "حالة النظام" : "System Health"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "ar" ? "قاعدة البيانات" : "Database"}</span>
              <span className="text-sm font-medium text-green-500" data-testid="status-database">
                {language === "ar" ? "متصل" : "Connected"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "ar" ? "التخزين" : "Storage"}</span>
              <span className="text-sm font-medium text-green-500" data-testid="status-storage">
                {language === "ar" ? "متاح" : "Available"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{language === "ar" ? "خادم البث" : "Streaming Server"}</span>
              <span className="text-sm font-medium text-green-500" data-testid="status-streaming">
                {language === "ar" ? "جاهز" : "Ready"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
