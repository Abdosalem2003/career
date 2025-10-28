import React from "react";
import { Link, useRoute } from "wouter";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Image,
  DollarSign,
  Radio,
  FileCheck,
  Settings,
  BarChart3,
  Search,
  MessageSquare,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  Flame,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n";
import { ReactNode } from "react";
import { Logo } from "@/components/logo";
import { ProtectedRoute, useAuth } from "@/components/protected-route";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </ProtectedRoute>
  );
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { language } = useI18n();
  const { user, logout } = useAuth();
  const [isActive] = useRoute("/dash-unnt-2025/:path*");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    {
      href: "/dash-unnt-2025",
      icon: LayoutDashboard,
      label: language === "ar" ? "لوحة التحكم" : "Dashboard",
      testId: "admin-nav-dashboard",
    },
    {
      href: "/dash-unnt-2025/articles",
      icon: FileText,
      label: language === "ar" ? "المقالات" : "Articles",
      testId: "admin-nav-articles",
    },
    {
      href: "/dash-unnt-2025/categories",
      icon: FolderOpen,
      label: language === "ar" ? "الأقسام" : "Categories",
      testId: "admin-nav-categories",
    },
    {
      href: "/dash-unnt-2025/users-management",
      icon: Shield,
      label: language === "ar" ? "إدارة المستخدمين" : "User Management",
      testId: "admin-nav-users-management",
    },
    {
      href: "/dash-unnt-2025/media",
      icon: Image,
      label: language === "ar" ? "المكتبة" : "Media",
      testId: "admin-nav-media",
    },
    {
      href: "/dash-unnt-2025/ads",
      icon: DollarSign,
      label: language === "ar" ? "الإعلانات" : "Ads",
      testId: "admin-nav-ads",
    },
    {
      href: "/dash-unnt-2025/ad-requests",
      icon: Inbox,
      label: language === "ar" ? "طلبات الإعلانات" : "Ad Requests",
      testId: "admin-nav-ad-requests",
    },
    {
      href: "/dash-unnt-2025/special-reports",
      icon: Flame,
      label: language === "ar" ? "التقارير الخاصة" : "Special Reports",
      testId: "admin-nav-special-reports",
    },
    {
      href: "/dash-unnt-2025/streams",
      icon: Radio,
      label: language === "ar" ? "البث المباشر" : "Streams",
      testId: "admin-nav-streams",
    },
    {
      href: "/dash-unnt-2025/polls",
      icon: BarChart3,
      label: language === "ar" ? "استطلاعات الرأي" : "Polls",
      testId: "admin-nav-polls",
    },
    {
      href: "/dash-unnt-2025/audit-logs",
      icon: FileCheck,
      label: language === "ar" ? "السجلات" : "Audit Logs",
      testId: "admin-nav-logs",
    },
    {
      href: "/dash-unnt-2025/settings",
      icon: Settings,
      label: language === "ar" ? "الإعدادات" : "Settings",
      testId: "admin-nav-settings",
    },
    {
      href: "/dash-unnt-2025/seo",
      icon: Search,
      label: language === "ar" ? "تحسين محركات البحث" : "SEO",
      testId: "admin-nav-seo",
    },
    {
      href: "/dash-unnt-2025/comments",
      icon: MessageSquare,
      label: language === "ar" ? "التعليقات" : "Comments",
      testId: "admin-nav-comments",
    },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="text-gray-600"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Logo className="h-8 w-8" variant="blue" />
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 lg:w-64 border-r bg-card
        transform transition-transform duration-300 ease-in-out
        lg:transform-none lg:flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 p-6 space-y-2">
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden absolute top-4 right-4 text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <div className="px-4 mb-6">
              <Logo 
                className="h-10 w-10" 
                variant="blue" 
                showText={true}
                textSize="sm"
              />
            </div>

            {/* Admin Profile Card */}
            <div className="px-2 mb-6">
              <Link href="/dash-unnt-2025/users-management">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100 hover:border-blue-200 transition-all cursor-pointer hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-600 to-indigo-600 flex-shrink-0">
                      <AvatarFallback className="bg-transparent text-white font-bold text-lg">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {user?.name || (language === "ar" ? "المدير" : "Admin")}
                      </p>
                      <p className="text-xs text-blue-600 font-medium">
                        {user?.email || "admin@news.com"}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t border-blue-100">
                    {language === "ar" ? "اضغط لإدارة المستخدمين" : "Click to manage users"}
                  </div>
                </div>
              </Link>
            </div>

            <Separator className="my-4" />

            <h2 className="px-4 mb-4 text-lg font-semibold">
              {language === "ar" ? "الإدارة" : "Admin"}
            </h2>
            
            {/* Menu Items */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isCurrentPage = window.location.pathname === item.href;

              return (
                <Link key={item.href} href={item.href} data-testid={item.testId}>
                  <Button
                    variant={isCurrentPage ? "secondary" : "ghost"}
                    className="w-full justify-start hover-elevate"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon className={`h-4 w-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout Button at Bottom */}
        <div className="border-t bg-gray-50/50 p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className={`h-4 w-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
            {language === "ar" ? "تسجيل الخروج" : "Logout"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-w-0">
        <div className="pt-16 lg:pt-0 p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
