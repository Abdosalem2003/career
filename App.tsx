import { Switch, Route, useRoute, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme-provider";
import { PrayerProvider } from "@/lib/prayer-context";
import { Header } from "@/components/header";
import { ModernHeader } from "@/components/modern-header";
import { ProfessionalHeader } from "@/components/professional-header";
import { EnhancedHeader } from "@/components/enhanced-header";
import { Footer } from "@/components/footer";
import { ModernFooter } from "@/components/modern-footer";
import { NewsTicker } from "@/components/news-ticker";
import { LiveStreamNotification } from "@/components/live-stream-notification";
import NotFound from "@/pages/not-found";
import { useFavicon } from "@/hooks/use-favicon";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

// Toggle between headers: "classic" | "modern" | "professional" | "enhanced"
const HEADER_TYPE = "enhanced";
const FOOTER_TYPE = "modern"; // "classic" | "modern"

// Pages
import Home from "@/pages/home";
import CategoryPage from "@/pages/category";
import ArticlePage from "@/pages/article";
import AuthorPage from "@/pages/author";
import LivePage from "./pages/live";
import LiveStreamView from "./pages/live-stream-view";
import LiveBroadcastStudio from "./pages/live-broadcast-studio";
import GoldPrices from "./pages/gold-prices";
import PrayerTimes from "./pages/prayer-times";
import AuthorProfile from "./pages/author-profile";
import CategoriesPage from "@/pages/categories";
import AdvertisePage from "@/pages/advertise";
import TopNewsPage from "@/pages/top-news";

// Auth Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import AccessDenied from "@/pages/access-denied";
import Debug from "@/pages/debug";

// Admin Pages
import UsersManagement from "@/pages/admin/users-management";
import PollsManagement from "@/pages/admin/polls-management";
import AdminDashboard from "@/pages/admin/dashboard";
import { AdminLayout } from "@/pages/admin/layout";
import AdminArticles from "@/pages/admin/articles";
import CreateArticlePro from "@/pages/admin/create-article-pro";
import EditArticle from "@/pages/admin/edit-article";
import AdminCategories from "@/pages/admin/categories";
import AdminMedia from "@/pages/admin/media";
import AdminAds from "@/pages/admin/ads-professional";
import AdminAdRequests from "@/pages/admin/ad-requests";
import AdminSpecialReports from "@/pages/admin/special-reports";
import AdminStreams from "@/pages/admin/streams";
import AdminAuditLogs from "@/pages/admin/audit-logs";
import AdminSettings from "@/pages/admin/settings";
import AdminSEO from "@/pages/admin/seo";
import AdminComments from "@/pages/admin/comments";
import SuperAdminSettings from "@/pages/admin/super-admin-settings";
import AdminPolls from "@/pages/admin/polls";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/categories" component={CategoriesPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/author/:id" component={AuthorProfile} />
      <Route path="/live" component={LivePage} />
      <Route path="/live/:id" component={LiveStreamView} />
      <Route path="/gold-prices" component={GoldPrices} />
      <Route path="/prayer-times" component={PrayerTimes} />
      <Route path="/advertise" component={AdvertisePage} />
      <Route path="/top-news" component={TopNewsPage} />

      {/* Auth Routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/access-denied" component={AccessDenied} />
      <Route path="/debug" component={Debug} />

      {/* Admin Routes - New Path: dash-unnt-2025 */}
      <Route path="/dash-unnt-2025/users-management">
        {() => (
          <AdminLayout>
            <UsersManagement />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025">
        {() => (
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/articles">
        {() => (
          <AdminLayout>
            <AdminArticles />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/create-article">
        {() => (
          <AdminLayout>
            <EditArticle />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/edit-article/:id">
        {() => {
          // Check authentication
          const user = JSON.parse(localStorage.getItem('user') || 'null');
          if (!user) {
            return <Redirect to="/login" />;
          }
          return (
            <AdminLayout>
              <EditArticle />
            </AdminLayout>
          );
        }}
      </Route>
      <Route path="/dash-unnt-2025/categories">
        {() => (
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        )}
      </Route>
      {/* Removed old users page - use /dash-unnt-2025/users-management instead */}
      <Route path="/dash-unnt-2025/media">
        {() => (
          <AdminLayout>
            <AdminMedia />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/ads">
        {() => (
          <AdminLayout>
            <AdminAds />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/ad-requests">
        {() => (
          <AdminLayout>
            <AdminAdRequests />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/special-reports">
        {() => (
          <AdminLayout>
            <AdminSpecialReports />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/streams">
        {() => (
          <AdminLayout>
            <AdminStreams />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/audit-logs">
        {() => (
          <AdminLayout>
            <AdminAuditLogs />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/settings">
        {() => (
          <AdminLayout>
            <AdminSettings />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/seo">
        {() => (
          <AdminLayout>
            <AdminSEO />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/comments">
        {() => (
          <AdminLayout>
            <AdminComments />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/super-admin">
        {() => (
          <AdminLayout>
            <SuperAdminSettings />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/polls">
        {() => (
          <AdminLayout>
            <PollsManagement />
          </AdminLayout>
        )}
      </Route>
      <Route path="/dash-unnt-2025/broadcast-studio/:id">
        {() => <LiveBroadcastStudio />}
      </Route>
      <Route path="/dash-unnt-2025/:rest*">
        {() => (
          <AdminLayout>
            <div className="text-center py-12">
              <p className="text-muted-foreground">Admin section coming soon</p>
            </div>
          </AdminLayout>
        )}
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Update favicon dynamically (inside QueryClientProvider)
  useFavicon();
  
  // Scroll to top on route change
  useScrollToTop();
  
  // Check if current route is admin - more comprehensive check
  const currentPath = window.location.pathname;
  const isAdmin = currentPath.startsWith('/dash-unnt-2025');

  // Select header based on type
  const renderHeader = () => {
    if (HEADER_TYPE === "enhanced") return <EnhancedHeader />;
    if (HEADER_TYPE === "professional") return <ProfessionalHeader />;
    if (HEADER_TYPE === "modern") return <ModernHeader />;
    return <Header />;
  };

  // Select footer based on type
  const renderFooter = () => {
    if (FOOTER_TYPE === "modern") return <ModernFooter />;
    return <Footer />;
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <PrayerProvider>
          <TooltipProvider>
            {isAdmin ? (
              // Admin routes: No header/footer, just the content
              <>
                <Router />
                <Toaster />
              </>
            ) : (
              // Public routes: Full layout with header/footer
              <div className="min-h-screen flex flex-col">
                <LiveStreamNotification />
                {renderHeader()}
                <NewsTicker />
                
                <main className="flex-1">
                  <Router />
                </main>
                
                {renderFooter()}
                <Toaster />
              </div>
            )}
          </TooltipProvider>
        </PrayerProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
