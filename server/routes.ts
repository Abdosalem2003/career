import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { settingsStorage } from "./settings-storage";
import { handleBase64Upload, deleteUploadedFile } from "./upload-handler";
import { registerAdsAPI } from "./ads-api";
import { registerLiveStreamRoutes } from "./live-stream-routes";
import { z } from "zod";
import { randomUUID } from "crypto";
import CryptoJS from "crypto-js";
import {
  rateLimiter,
  // csrfProtection,
  xssProtection,
  // sqlInjectionProtection,
  // sessionHijackingProtection,
  // hackerDetectionMiddleware,
  testSecuritySystem,
  getSecurityStatus,
  clearAllBlocks
} from "./middleware/security";
import { requireAuth, requirePermission, requireRole, Permission, Role } from "./advanced-permissions";
import { ensureSuperAdminExists, canDeleteUser, isSuperAdminEmail } from "./super-admin";
import { hashPassword, verifyPassword } from "./password-utils";

// Extend Express Session to include custom data
declare module 'express-session' {
  interface SessionData {
    userEmail?: string;
    userId?: string;
    userRole?: string;
    csrfToken?: string;
  }
}
import { eq, and, desc } from "drizzle-orm";
import { articles } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ============================================
  // Initialize Super Admin (معطل - البيانات موجودة في PostgreSQL)
  // ============================================
  // await ensureSuperAdminExists(); // معطل لأن البيانات موجودة
  
  // ============================================
  // Apply Security Layers (Simplified for Development)
  // Security middleware - RATE LIMITING DISABLED
  // app.use(rateLimiter); // DISABLED - تم إلغاؤه
  app.use(xssProtection); // ENABLED
  // app.use(hackerDetectionMiddleware); // Keep disabled for now
  // app.use(sqlInjectionProtection); // Keep disabled for now
  // app.use(sessionHijackingProtection); // Keep disabled for now
  
  // Security test endpoints
  app.get("/api/security/test", testSecuritySystem);
  app.get("/api/security/status", getSecurityStatus);
  app.post("/api/security/clear", clearAllBlocks); // Clear all blocks
  
  // ============ Authentication ============
  
  // Simplified Login endpoint - NO encryption required
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log("[Auth] Login attempt:", email);
      
      if (!email || !password) {
        return res.status(400).json({ error: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      }
      
      // Find user
      const user = await storage.getUserByEmail(email.toLowerCase());
      
      if (!user) {
        console.log("[Auth] User not found:", email);
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
      
      // Check if user is active
      if (user.status !== 'active') {
        return res.status(403).json({ error: "حسابك غير نشط. يرجى الاتصال بالمسؤول" });
      }
      
      // Verify password with bcrypt
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        console.log("[Auth] Invalid password for:", email);
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
      
      // Generate secure token
      const token = randomUUID() + '-' + Date.now() + '-' + randomUUID();
      
      // Save session
      if (req.session) {
        req.session.userEmail = user.email;
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }
      
      // Update last login time and increment login count
      try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const currentLoginCount = (user as any).loginCount || 0;
        await storage.updateUserLoginInfo(user.id, {
          lastLogin: new Date().toISOString(),
          lastIP: ip,
          loginCount: currentLoginCount + 1
        });
        console.log("[Auth] Updated login info for:", email, "IP:", ip);
      } catch (updateError) {
        console.error("[Auth] Failed to update login info:", updateError);
      }
      
      console.log("[Auth] Login successful:", email, "Role:", user.role);
      
      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      res.status(500).json({ error: "خطأ في الخادم. يرجى المحاولة لاحقاً" });
    }
  });
  
  // Register endpoint - DISABLED for public access
  // Public registration is disabled. Only admins can create users via /api/admin/users
  app.post("/api/auth/register", async (req, res) => {
    return res.status(403).json({ 
      error: "التسجيل العام معطل. يرجى الاتصال بالمسؤول للحصول على حساب",
      message: "Public registration is disabled. Contact admin for access."
    });
  });
  
  // Logout endpoint
  app.post("/api/auth/logout", async (req, res) => {
    try {
      // Clear session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            console.error("[Auth] Session destroy error:", err);
          }
        });
      }
      
      // Clear cookies
      res.clearCookie('authToken');
      res.clearCookie('connect.sid');
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في تسجيل الخروج" });
    }
  });
  
  // Verify token endpoint
  app.get("/api/auth/verify", async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: "غير مصرح" });
      }
      
      // في نظام بسيط، نعتبر أي توكن صالح
      // في نظام متقدم، يجب التحقق من قاعدة البيانات
      res.json({ valid: true });
    } catch (error) {
      res.status(500).json({ error: "حدث خطأ في التحقق" });
    }
  });

  // ============ User Management ============
  // Old endpoints removed - using new ones with proper permissions below

  // ============ Articles ============
  
  // Get all articles (with filters and relations)
  app.get("/api/articles", async (req, res) => {
    try {
      const { category, author, status = "published", search, sort, limit } = req.query;
      let articles = await storage.getArticlesWithRelations();
      
      // Filter by query parameters
      if (category) articles = articles.filter(a => a.categoryId === category);
      if (author) articles = articles.filter(a => a.authorId === author);
      if (status) articles = articles.filter(a => a.status === status);
      
      // Search functionality
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        articles = articles.filter(a => 
          (a.titleAr && a.titleAr.toLowerCase().includes(searchLower)) ||
          (a.titleEn && a.titleEn.toLowerCase().includes(searchLower)) ||
          (a.excerptAr && a.excerptAr.toLowerCase().includes(searchLower)) ||
          (a.excerptEn && a.excerptEn.toLowerCase().includes(searchLower)) ||
          (a.contentAr && a.contentAr.toLowerCase().includes(searchLower)) ||
          (a.contentEn && a.contentEn.toLowerCase().includes(searchLower))
        );
      }
      
      // Sort functionality
      if (sort === 'views') {
        articles = articles.sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (sort === 'recent') {
        articles = articles.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
      }
      
      // Limit results
      if (limit && typeof limit === 'string') {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum)) {
          articles = articles.slice(0, limitNum);
        }
      }
      
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // Get featured articles - دعم عدد لا نهائي
  app.get("/api/articles/featured", async (req, res) => {
    try {
      // جلب جميع المقالات المنشورة بدون حد
      let articles = await storage.getArticlesWithRelations();
      // تصفية المقالات المميزة فقط (بدون حد)
      const featured = articles.filter((a) => a.status === 'published' && a.featured);
      res.json(featured);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured articles" });
    }
  });

  // Get trending articles (by views)
  app.get("/api/articles/trending", async (req, res) => {
    try {
      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.status === 'published');
      const trending = articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
      res.json(trending);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending articles" });
    }
  });

  // Get latest articles
  app.get("/api/articles/latest", async (req, res) => {
    try {
      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.status === 'published').slice(0, 31);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest articles" });
    }
  });

  // Get most read articles
  app.get("/api/articles/most-read", async (req, res) => {
    try {
      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.status === 'published');
      const mostRead = articles.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
      res.json(mostRead);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch most read articles" });
    }
  });

  // Get breaking news for ticker
  app.get("/api/articles/breaking", async (req, res) => {
    try {
      const articles = await storage.getAllArticles({ status: "published" });
      const breaking = articles
        .filter((a) => a.tags?.includes("breaking"))
        .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
        .slice(0, 5);
      res.json(breaking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch breaking news" });
    }
  });

  // Get article by slug
  app.get("/api/articles/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const author = await storage.getUser(article.authorId);
      const category = await storage.getCategory(article.categoryId);

      if (!author || !category) {
        return res.status(404).json({ error: "Article relations not found" });
      }

      res.json({ ...article, author, category });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Increment article views
  app.post("/api/articles/:slug/increment-views", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (article) {
        await storage.incrementArticleViews(article.id);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to increment views" });
    }
  });

  // Get related articles
  app.get("/api/articles/related/:slug", async (req, res) => {
    try {
      const article = await storage.getArticleBySlug(req.params.slug);
      if (!article) {
        return res.json([]);
      }

      let allArticles = await storage.getArticlesWithRelations();
      allArticles = allArticles.filter(a => a.status === 'published');
      
      const related = allArticles
        .filter((a) => {
          if (a.id === article.id) return false;
          // Match by category or tags
          if (a.categoryId === article.categoryId) return true;
          if (article.tags && a.tags) {
            return article.tags.some((tag) => a.tags?.includes(tag));
          }
          return false;
        })
        .slice(0, 4);

      res.json(related);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch related articles" });
    }
  });

  // Get articles by category slug
  app.get("/api/articles/category/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.categoryId === category.id && a.status === 'published');
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category articles" });
    }
  });

  // Get articles by author
  app.get("/api/articles/author/:id", async (req, res) => {
    try {
      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.authorId === req.params.id && a.status === 'published');
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch author articles" });
    }
  });

  // Get special reports (التقارير الخاصة)
  app.get("/api/special-reports", async (req, res) => {
    try {
      const { categoryId } = req.query;
      
      // جلب جميع المقالات المنشورة
      let allArticles = await storage.getArticlesWithRelations();
      allArticles = allArticles.filter(a => a.status === 'published');
      
      // فلترة التقارير الخاصة
      let reports = allArticles.filter((article: any) => article.specialReport === true);
      
      // فلترة حسب القسم إذا تم تحديده
      if (categoryId) {
        reports = reports.filter((article: any) => article.categoryId === categoryId);
      }
      
      // ترتيب حسب specialReportOrder
      reports.sort((a: any, b: any) => (b.specialReportOrder || 0) - (a.specialReportOrder || 0));
      
      // حد أقصى 40 تقرير
      reports = reports.slice(0, 40);

      res.json(reports);
    } catch (error) {
      console.error("Failed to fetch special reports:", error);
      res.status(500).json({ error: "Failed to fetch special reports" });
    }
  });

  // ============ Categories ============
  
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // ============ Users ============
  
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // ============ Ads ============
  
  app.get("/api/ads/active/:placement", async (req, res) => {
    try {
      const ad = await storage.getActiveAdByPlacement(req.params.placement);
      if (ad) {
        await storage.incrementAdImpressions(ad.id);
      }
      res.json(ad || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ad" });
    }
  });

  app.post("/api/ads/:id/click", async (req, res) => {
    try {
      await storage.incrementAdClicks(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to record click" });
    }
  });

  // ============ Streams ============
  
  app.get("/api/streams/active", async (req, res) => {
    try {
      const stream = await storage.getActiveStream();
      res.json(stream || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active stream" });
    }
  });

  app.get("/api/streams", async (req, res) => {
    try {
      const allStreams = await storage.getAllStreams();
      // Filter out deleted streams
      const activeStreams = allStreams.filter((s: any) => s.status !== "deleted");
      res.json(activeStreams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch streams" });
    }
  });

  // Top News API
  app.get("/api/articles/top-news", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      const topNews = articles
        .filter((a: any) => a.topNews && a.status === "published")
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 100);
      
      res.json(topNews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top news" });
    }
  });

  // ============ Polls API ============
  
  // Get all polls
  app.get("/api/polls", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      const polls = articles
        .filter((a: any) => (a as any).poll && a.status === "published")
        .map((a: any) => ({
          id: a.id,
          question: (a as any).poll.question,
          options: (a as any).poll.options,
          votes: (a as any).poll.votes || (a as any).poll.options.map(() => 0),
          active: true,
          createdAt: a.createdAt,
          articleId: a.id,
          articleTitle: a.titleAr || a.titleEn
        }));
      
      res.json(polls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch polls" });
    }
  });

  // Vote on poll
  app.post("/api/polls/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const { optionIndex } = req.body;
      
      if (typeof optionIndex !== 'number') {
        return res.status(400).json({ error: "Invalid option index" });
      }

      const articles = await storage.getAllArticles();
      const article = articles.find((a: any) => a.id === id);
      
      if (!article || !(article as any).poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      // Update votes
      const updatedPoll = { ...(article as any).poll };
      if (!updatedPoll.votes) {
        updatedPoll.votes = updatedPoll.options.map(() => 0);
      }
      
      if (optionIndex >= 0 && optionIndex < updatedPoll.votes.length) {
        updatedPoll.votes[optionIndex]++;
      } else {
        return res.status(400).json({ error: "Invalid option index" });
      }

      // Update article with new poll data
      await storage.updateArticle(id, { poll: updatedPoll } as any);
      
      res.json({
        success: true,
        poll: {
          id: article.id,
          question: updatedPoll.question,
          options: updatedPoll.options,
          votes: updatedPoll.votes
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get active polls for homepage
  app.get("/api/polls/active", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      const activePolls = articles
        .filter((a: any) => (a as any).poll && a.status === "published")
        .sort((a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 3) // Latest 3 polls
        .map((a: any) => ({
          id: a.id,
          question: (a as any).poll.question,
          options: (a as any).poll.options,
          votes: (a as any).poll.votes || (a as any).poll.options.map(() => 0),
          articleTitle: a.titleAr || a.titleEn,
          articleSlug: a.slug
        }));
      
      res.json(activePolls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active polls" });
    }
  });

  // Create new poll (as article with poll)
  app.post("/api/polls", requireAuth, async (req, res) => {
    try {
      const { question, options, articleId } = req.body;

      if (!question || !options || options.length < 2) {
        return res.status(400).json({ error: "Invalid poll data" });
      }

      // Create article with poll
      const slug = question.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Date.now();
      
      const newArticle = {
        titleAr: question,
        titleEn: question,
        slug,
        excerptAr: "استطلاع رأي",
        excerptEn: "Poll",
        contentAr: question,
        contentEn: question,
        categoryId: "politics", // Default category
        authorId: (req as any).session.userId,
        status: "published" as const,
        featured: false,
        poll: {
          question,
          options,
          votes: options.map(() => 0)
        }
      };

      const article = await storage.createArticle(newArticle);
      
      res.json({
        success: true,
        poll: {
          id: article.id,
          question,
          options,
          votes: options.map(() => 0),
          active: true,
          createdAt: article.createdAt,
        }
      });
    } catch (error: any) {
      console.error("Create poll error:", error);
      res.status(500).json({ error: error.message || "Failed to create poll" });
    }
  });

  // Update poll
  app.put("/api/polls/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { question, options } = req.body;

      const articles = await storage.getAllArticles();
      const article = articles.find((a: any) => a.id === id);
      if (!article) {
        return res.status(404).json({ error: "Poll not found" });
      }

      const updatedPoll = {
        question,
        options,
        votes: (article as any).poll?.votes || options.map(() => 0)
      };

      await storage.updateArticle(id, {
        titleAr: question,
        titleEn: question,
        contentAr: question,
        contentEn: question,
        poll: updatedPoll
      } as any);

      res.json({ success: true, poll: updatedPoll });
    } catch (error: any) {
      console.error("Update poll error:", error);
      res.status(500).json({ error: error.message || "Failed to update poll" });
    }
  });

  // Delete poll
  app.delete("/api/polls/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteArticle(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete poll error:", error);
      res.status(500).json({ error: error.message || "Failed to delete poll" });
    }
  });

  // Toggle poll active status
  app.patch("/api/polls/:id/toggle", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { active } = req.body;

      console.log('Toggle poll API called:', { id, active });

      const articles = await storage.getAllArticles();
      const article = articles.find((a: any) => a.id === id);
      
      if (!article) {
        console.log('Poll not found:', id);
        return res.status(404).json({ error: "Poll not found" });
      }

      console.log('Found article:', { id: article.id, currentStatus: article.status });

      const newStatus = active ? "published" : "draft";
      await storage.updateArticle(id, {
        status: newStatus
      } as any);

      console.log('Poll status updated to:', newStatus);

      res.json({ success: true, active, status: newStatus });
    } catch (error: any) {
      console.error("Toggle poll error:", error);
      res.status(500).json({ error: error.message || "Failed to toggle poll" });
    }
  });

  // Admin: Create stream
  app.post("/api/admin/streams", requireAuth, async (req, res) => {
    try {
      const { name, youtubeUrl, description, status } = req.body;
      
      if (!name || !youtubeUrl) {
        return res.status(400).json({ error: "Name and YouTube URL are required" });
      }

      const stream = await storage.createStream({
        name,
        youtubeUrl,
        description: description || null,
        status: status || "scheduled",
      } as any);

      res.json(stream);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Update stream
  app.put("/api/admin/streams/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, youtubeUrl, description, status } = req.body;

      const stream = await storage.updateStream(id, {
        name,
        youtubeUrl,
        description,
        status,
      } as any);

      res.json(stream);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Delete stream
  app.delete("/api/admin/streams/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get all streams and filter out the deleted one
      const allStreams = await storage.getAllStreams();
      const streamExists = allStreams.find((s: any) => s.id === id);
      
      if (!streamExists) {
        return res.status(404).json({ error: "Stream not found" });
      }
      
      // Actually delete by updating status to 'deleted'
      await storage.updateStream(id, { status: "deleted" } as any);
      
      res.json({ 
        success: true, 
        message: "Stream deleted successfully",
        deletedId: id 
      });
    } catch (error: any) {
      console.error("Delete stream error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============ Admin Stats ============
  
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const articles = await storage.getAllArticles();
      const users = await storage.getAllUsers();
      const categories = await storage.getAllCategories();
      const streams = await storage.getAllStreams();
      
      const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayViews = articles
        .filter((a) => a.publishedAt && new Date(a.publishedAt) >= today)
        .reduce((sum, a) => sum + (a.views || 0), 0);

      res.json({
        totalArticles: articles.length,
        totalUsers: users.length,
        totalCategories: categories.length,
        activeStreams: streams.filter((s) => s.status === "live").length,
        totalViews,
        todayViews,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ============ Admin Articles CRUD ============
  
  // New path for articles
  app.post("/api/dash-unnt-2025/articles", requireAuth, async (req, res) => {
    try {
      console.log("[CREATE ARTICLE] Received data:", req.body);
      console.log("[CREATE ARTICLE] User:", (req as any).user);
      
      const articleData = {
        ...req.body,
        authorId: (req as any).user?.id || req.body.authorId,
      };
      
      const article = await storage.createArticle(articleData);
      res.json(article);
    } catch (error: any) {
      console.error("[CREATE ARTICLE] Error:", error);
      res.status(500).json({ error: error.message || "Failed to create article" });
    }
  });
  
  app.post("/api/admin/articles", async (req, res) => {
    try {
      console.log("[CREATE ARTICLE] Received data:", req.body);
      console.log("[CREATE ARTICLE] User:", req.user);
      
      // Get author ID from session
      const authorId = req.user?.id || req.body.authorId || "1";
      
      // Ensure required fields
      const articleData = {
        ...req.body,
        authorId, // Link to current user
        status: req.body.status || "published",
        publishedAt: req.body.status === "published" ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const article = await storage.createArticle(articleData);
      console.log("[CREATE ARTICLE] Created successfully:", article.id, "by author:", authorId);
      res.json(article);
    } catch (error) {
      console.error("[CREATE ARTICLE] Error:", error);
      res.status(500).json({ error: "Failed to create article" });
    }
  });

  app.put("/api/admin/articles/:id", async (req, res) => {
    try {
      const article = await storage.updateArticle(req.params.id, req.body);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Failed to update article" });
    }
  });

  // PATCH endpoint for partial updates (like featured toggle)
  app.patch("/api/admin/articles/:id", async (req, res) => {
    try {
      console.log("\n[Routes] ===== PATCH REQUEST START =====");
      console.log("[Routes] Article ID from params:", req.params.id);
      console.log("[Routes] Request body:", JSON.stringify(req.body, null, 2));
      console.log("[Routes] Request headers:", req.headers['content-type']);
      
      const articleId = req.params.id;
      const updates = req.body;
      
      // Validate that we have an ID
      if (!articleId) {
        console.error("[Routes] ❌ No article ID provided");
        return res.status(400).json({ error: "Article ID is required" });
      }
      
      // Validate that we have updates
      if (!updates || Object.keys(updates).length === 0) {
        console.error("[Routes] ❌ No updates provided");
        return res.status(400).json({ error: "No updates provided" });
      }
      
      console.log("[Routes] Calling storage.updateArticle...");
      const article = await storage.updateArticle(articleId, updates);
      
      if (!article) {
        console.error("[Routes] ❌ Article not found in storage");
        return res.status(404).json({ 
          error: "Article not found",
          articleId: articleId,
          message: "The article you're trying to update doesn't exist"
        });
      }
      
      console.log("[Routes] ✅ Article updated successfully");
      console.log("[Routes] Returning article:", { id: article.id, featured: article.featured });
      console.log("[Routes] ===== PATCH REQUEST END =====\n");
      
      res.json(article);
    } catch (error) {
      console.error("[Routes] ❌ PATCH ERROR:", error);
      console.error("[Routes] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      res.status(500).json({ 
        error: "Failed to update article",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.delete("/api/admin/articles/:id", async (req, res) => {
    try {
      const success = await storage.deleteArticle(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Article not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  // ============ Admin Categories CRUD ============
  
  app.post("/api/admin/categories", async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/admin/categories/:id", async (req, res) => {
    try {
      const category = await storage.updateCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // ============ Admin Users CRUD ============
  
  // Get all users - requires USERS_VIEW permission
  app.get("/api/admin/users", requireAuth, requirePermission(Permission.USERS_VIEW), async (req, res) => {
    try {
      // Disable cache completely
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const currentUser = (req as any).user;
      const isCurrentSuperAdmin = isSuperAdminEmail(currentUser.email);
      
      console.log('=== GET USERS REQUEST ===');
      console.log('Current user:', currentUser.email);
      console.log('Is super admin:', isCurrentSuperAdmin);
      
      const users = await storage.getAllUsers();
      console.log('Total users before filter:', users.length);
      
      // Hide super admin from all users except super admin himself
      const filteredUsers = isCurrentSuperAdmin 
        ? users // Super admin sees everyone including himself
        : users.filter(u => !isSuperAdminEmail(u.email)); // Others don't see super admin
      
      console.log('Total users after filter:', filteredUsers.length);
      console.log('Filtered out super admin:', users.length - filteredUsers.length > 0);
      
      const usersWithoutPasswords = filteredUsers.map(({ password, twoFactorSecret, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "فشل جلب المستخدمين" });
    }
  });

  // Get single user by ID (public endpoint for author profiles)
  app.get("/api/users/:id", async (req, res) => {
    try {
      // Disable cache
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      // Hide super admin from everyone except super admin himself
      if (isSuperAdminEmail(user.email)) {
        const currentUser = (req as any).user;
        const isCurrentSuperAdmin = currentUser && isSuperAdminEmail(currentUser.email);
        
        if (!isCurrentSuperAdmin) {
          console.log('[SECURITY] Unauthorized attempt to view super admin by:', currentUser?.email || 'anonymous');
          return res.status(404).json({ error: "المستخدم غير موجود" });
        }
      }
      
      const { password, twoFactorSecret, ...userWithoutSensitiveData } = user;
      res.json(userWithoutSensitiveData);
    } catch (error) {
      res.status(500).json({ error: "فشل جلب بيانات المستخدم" });
    }
  });

  // Create user - requires USERS_CREATE permission
  app.post("/api/admin/users", requireAuth, requirePermission(Permission.USERS_CREATE), async (req, res) => {
    try {
      const userData: any = { ...req.body };
      
      // Handle profile image upload (base64)
      if (userData.profileImage && userData.profileImage.startsWith('data:image')) {
        try {
          const uploadedFile = await handleBase64Upload(userData.profileImage, {
            folder: 'profile-images',
            maxSize: 5 * 1024 * 1024, // 5MB
          });
          userData.profileImage = uploadedFile.url;
        } catch (uploadError) {
          console.error('Profile image upload error:', uploadError);
          return res.status(400).json({ error: "فشل رفع الصورة. تأكد من أن الصورة أقل من 5MB" });
        }
      }
      
      // Handle socialLinks
      if (userData.socialLinks) {
        if (typeof userData.socialLinks === 'string') {
          try {
            userData.socialLinks = JSON.parse(userData.socialLinks);
          } catch (e) {
            console.error('Failed to parse socialLinks:', e);
            return res.status(400).json({ error: "بيانات روابط السوشيال ميديا غير صحيحة" });
          }
        }
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('Create user error:', error);
      res.status(500).json({ error: error.message || "فشل إنشاء المستخدم" });
    }
  });

  // Update user - requires USERS_EDIT permission
  app.put("/api/admin/users/:id", requireAuth, requirePermission(Permission.USERS_EDIT), async (req, res) => {
    try {
      console.log('=== UPDATE USER REQUEST ===');
      console.log('User ID:', req.params.id);
      console.log('Request Body:', JSON.stringify(req.body, null, 2));
      
      // Get current user (who is making the request)
      const currentUser = (req as any).user;
      
      // Get user to be updated
      const userToUpdate = await storage.getUserByEmail(req.params.id);
      let targetUser = userToUpdate;
      if (!targetUser) {
        const users = await storage.getAllUsers();
        targetUser = users.find(u => u.id === req.params.id);
      }
      
      if (!targetUser) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      // Check if target is super admin
      const isTargetSuperAdmin = isSuperAdminEmail(targetUser.email);
      const isCurrentSuperAdmin = isSuperAdminEmail(currentUser.email);
      
      // Protection: Only super admin can edit super admin
      if (isTargetSuperAdmin && !isCurrentSuperAdmin) {
        console.log('[SECURITY] Unauthorized attempt to edit super admin by:', currentUser.email);
        return res.status(404).json({ 
          error: "المستخدم غير موجود",
          code: "NOT_FOUND"
        });
      }
      
      const updateData: any = {};
      
      // For super admin: only allow email and password changes
      if (isTargetSuperAdmin) {
        console.log('Updating super admin - restricted fields');
        
        // Only email and password can be changed
        if (req.body.email) {
          updateData.email = req.body.email.toLowerCase().trim();
        }
        if (req.body.password && req.body.password.trim() !== '') {
          updateData.password = req.body.password;
          console.log('Super admin password will be updated');
        }
        
        // Role and status are LOCKED for super admin
        // Ignore any attempts to change them
        console.log('Super admin role and status are LOCKED');
      } else {
        // For regular users: allow all fields
        if (req.body.name) updateData.name = req.body.name.trim();
        if (req.body.email) updateData.email = req.body.email.toLowerCase().trim();
        if (req.body.role) updateData.role = req.body.role;
        if (req.body.status) updateData.status = req.body.status;
      }
      
      // Optional fields - only for non-super-admin users
      if (!isTargetSuperAdmin) {
        updateData.phone = req.body.phone || '';
        updateData.bio = req.body.bio || '';
        updateData.jobTitle = req.body.jobTitle || '';
        updateData.department = req.body.department || '';
        
        // Password - only if provided and not empty (already handled for super admin above)
        if (req.body.password && req.body.password.trim() !== '' && !updateData.password) {
          updateData.password = req.body.password;
          console.log('Password will be updated');
        }
      }
      
      // Profile Image - Enhanced with detailed logging
      console.log('[API] Profile image in request:', req.body.profileImage ? 'Present' : 'Not present');
      
      if (req.body.profileImage !== undefined) {
        if (req.body.profileImage === '' || req.body.profileImage === null) {
          // Remove image
          updateData.profileImage = '';
          console.log('[API] Removing profile image');
        } else if (req.body.profileImage.startsWith('data:image')) {
          // Upload new image
          try {
            console.log('[API] Uploading new profile image...');
            console.log('[API] Base64 size:', req.body.profileImage.length);
            
            const uploadedFile = await handleBase64Upload(req.body.profileImage, {
              folder: 'profile-images',
              maxSize: 5 * 1024 * 1024,
            });
            
            updateData.profileImage = uploadedFile.url;
            console.log('[API] ✅ Image uploaded successfully:', uploadedFile.url);
            console.log('[API] File saved at:', uploadedFile.path);
          } catch (uploadError: any) {
            console.error('[API] ❌ Image upload error:', uploadError.message);
            return res.status(400).json({ error: `فشل رفع الصورة: ${uploadError.message}` });
          }
        } else if (req.body.profileImage.startsWith('/') || req.body.profileImage.startsWith('http')) {
          // Keep existing URL
          updateData.profileImage = req.body.profileImage;
          console.log('[API] Keeping existing image URL:', req.body.profileImage);
        } else {
          console.warn('[API] ⚠️ Invalid profileImage format:', req.body.profileImage.substring(0, 50));
        }
      }
      
      // Social Links - clean empty values
      if (req.body.socialLinks && typeof req.body.socialLinks === 'object') {
        const cleanLinks: any = {};
        for (const [key, value] of Object.entries(req.body.socialLinks)) {
          if (value && typeof value === 'string' && value.trim() !== '') {
            cleanLinks[key] = value.trim();
          }
        }
        if (Object.keys(cleanLinks).length > 0) {
          updateData.socialLinks = cleanLinks;
          console.log('Social links:', cleanLinks);
        }
      }
      
      updateData.updatedAt = new Date();
      
      console.log('Final update data:', JSON.stringify(updateData, null, 2));
      
      const user = await storage.updateUser(req.params.id, updateData);
      if (!user) {
        console.error('User not found:', req.params.id);
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      const { password, ...userWithoutPassword } = user;
      console.log('User updated successfully');
      res.json(userWithoutPassword);
    } catch (error: any) {
      console.error('=== UPDATE USER ERROR ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      res.status(500).json({ error: error.message || "فشل تحديث المستخدم" });
    }
  });

  // Delete user - requires USERS_DELETE permission
  app.delete("/api/admin/users/:id", requireAuth, requirePermission(Permission.USERS_DELETE), async (req, res) => {
    try {
      const currentUser = (req as any).user;
      const isCurrentSuperAdmin = isSuperAdminEmail(currentUser.email);
      
      // Get user to check if it's super admin
      const userToDelete = await storage.getUserByEmail(req.params.id);
      if (!userToDelete) {
        // Try by ID
        const users = await storage.getAllUsers();
        const foundUser = users.find(u => u.id === req.params.id);
        if (foundUser) {
          // Check if super admin
          if (isSuperAdminEmail(foundUser.email)) {
            console.log('[SECURITY] Unauthorized attempt to delete super admin by:', currentUser.email);
            return res.status(404).json({ 
              error: "المستخدم غير موجود",
              code: "NOT_FOUND"
            });
          }
        }
      } else {
        // Check if super admin
        if (isSuperAdminEmail(userToDelete.email)) {
          console.log('[SECURITY] Unauthorized attempt to delete super admin by:', currentUser.email);
          return res.status(404).json({ 
            error: "المستخدم غير موجود",
            code: "NOT_FOUND"
          });
        }
      }
      
      const success = await storage.deleteUser(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "فشل حذف المستخدم" });
    }
  });

  // Get user activity log - requires USERS_VIEW permission
  app.get("/api/admin/users/:id/activity", requireAuth, requirePermission(Permission.USERS_VIEW), async (req, res) => {
    try {
      const { id } = req.params;
      // For now, return mock data. In production, this would query the userActivity table
      const activities = [
        {
          id: randomUUID(),
          action: "تسجيل دخول",
          resourceType: "system",
          ipAddress: "127.0.0.1",
          createdAt: new Date().toISOString(),
        },
        {
          id: randomUUID(),
          action: "تعديل مقالة",
          resourceType: "article",
          resourceId: randomUUID(),
          ipAddress: "127.0.0.1",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: randomUUID(),
          action: "إنشاء مقالة جديدة",
          resourceType: "article",
          resourceId: randomUUID(),
          ipAddress: "127.0.0.1",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ];
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "فشل جلب سجل النشاطات" });
    }
  });

  // Get permissions info - requires authentication
  app.get("/api/admin/permissions", requireAuth, async (req, res) => {
    try {
      const allPermissions = Object.values(Permission);
      res.json(allPermissions);
    } catch (error) {
      res.status(500).json({ error: "فشل جلب الصلاحيات" });
    }
  });

  // Get roles info - requires authentication
  app.get("/api/admin/roles", requireAuth, async (req, res) => {
    try {
      const allRoles = Object.values(Role);
      res.json(allRoles);
    } catch (error) {
      res.status(500).json({ error: "فشل جلب الأدوار" });
    }
  });

  // Get current user info
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "فشل جلب معلومات المستخدم" });
    }
  });

  // Get current user permissions
  app.get("/api/auth/me/permissions", requireAuth, async (req, res) => {
    try {
      const user = (req as any).user;
      res.json({
        role: user.role,
        permissions: Object.values(Permission)
      });
    } catch (error) {
      res.status(500).json({ error: "فشل جلب صلاحياتك" });
    }
  });

  // ============ Admin Ads CRUD ============
  
  app.get("/api/admin/ads", async (req, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ads" });
    }
  });

  app.post("/api/admin/ads", async (req, res) => {
    try {
      const ad = await storage.createAd(req.body);
      res.json(ad);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  app.put("/api/admin/ads/:id", async (req, res) => {
    try {
      const ad = await storage.updateAd(req.params.id, req.body);
      if (!ad) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json(ad);
    } catch (error) {
      res.status(500).json({ error: "Failed to update ad" });
    }
  });

  app.delete("/api/admin/ads/:id", async (req, res) => {
    try {
      const success = await storage.deleteAd(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Ad not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ad" });
    }
  });

  // ============ Admin Media CRUD ============
  
  app.get("/api/admin/media", async (req, res) => {
    try {
      const media = await storage.getAllMedia();
      res.json(media);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  app.post("/api/admin/media", async (req, res) => {
    try {
      const mediaFile = await storage.createMedia(req.body);
      res.json(mediaFile);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload media" });
    }
  });

  app.delete("/api/admin/media/:id", async (req, res) => {
    try {
      const success = await storage.deleteMedia(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Media not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // ============ Public Settings (for frontend) ============
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await settingsStorage.getSettings();
      // Return only public settings (exclude sensitive data)
      const publicSettings = {
        siteNameAr: settings.siteNameAr,
        siteNameEn: settings.siteNameEn,
        siteDescriptionAr: settings.siteDescriptionAr,
        siteDescriptionEn: settings.siteDescriptionEn,
        logo: settings.logo,
        favicon: settings.favicon,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        facebookUrl: settings.facebookUrl,
        twitterUrl: settings.twitterUrl,
        instagramUrl: settings.instagramUrl,
        youtubeUrl: settings.youtubeUrl,
        linkedinUrl: settings.linkedinUrl,
        whatsappUrl: settings.whatsappUrl,
        telegramUrl: settings.telegramUrl,
        tiktokUrl: settings.tiktokUrl,
        snapchatUrl: settings.snapchatUrl,
        pinterestUrl: settings.pinterestUrl,
        redditUrl: settings.redditUrl,
        discordUrl: settings.discordUrl,
        githubUrl: settings.githubUrl,
        emailUrl: settings.emailUrl,
        phoneUrl: settings.phoneUrl,
        // primaryColor: settings.primaryColor,
        // darkMode: settings.darkMode,
        // breakingNewsTicker: settings.breakingNewsTicker,
      };
      res.json(publicSettings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // ============ Admin Settings CRUD ============
  
  app.get("/api/admin/settings", async (req, res) => {
    try {
      const settings = await settingsStorage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/settings", async (req, res) => {
    try {
      const settings = await settingsStorage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Upload media for articles (images in editor)
  app.post("/api/dash-unnt-2025/media/upload", requireAuth, async (req, res) => {
    try {
      const { base64, fileName, mimeType } = req.body;
      
      if (!base64) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const uploadedFile = await handleBase64Upload(base64, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
        folder: "uploads",
      });

      res.json({ 
        success: true, 
        url: uploadedFile.url,
        fileName: uploadedFile.filename 
      });
    } catch (error: any) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: error.message || "Failed to upload image" });
    }
  });

  // Upload logo
  app.post("/api/admin/settings/upload-logo", async (req, res) => {
    try {
      const { base64 } = req.body;
      
      if (!base64) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const uploadedFile = await handleBase64Upload(base64, {
        maxSize: 2 * 1024 * 1024, // 2MB
        allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
        folder: "logos",
      });

      // Update settings with new logo
      await settingsStorage.setSetting("logo", uploadedFile.url);

      res.json({ 
        success: true, 
        url: uploadedFile.url,
        file: uploadedFile 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to upload logo" });
    }
  });

  // Upload favicon
  app.post("/api/admin/settings/upload-favicon", async (req, res) => {
    try {
      const { base64 } = req.body;
      
      if (!base64) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const uploadedFile = await handleBase64Upload(base64, {
        maxSize: 1 * 1024 * 1024, // 1MB
        allowedTypes: ["image/x-icon", "image/png", "image/svg+xml"],
        folder: "favicons",
      });

      // Update settings with new favicon
      await settingsStorage.setSetting("favicon", uploadedFile.url);

      res.json({ 
        success: true, 
        url: uploadedFile.url,
        file: uploadedFile 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to upload favicon" });
    }
  });

  // ============ Compression APIs ============
  
  app.post("/api/admin/compress/code", async (req, res) => {
    try {
      const { code, type } = req.body; // type: 'js', 'css', 'html'
      const { compressJavaScript, compressCSS, compressHTML } = await import("./compression");
      
      let compressed;
      switch (type) {
        case 'js':
          compressed = await compressJavaScript(code);
          break;
        case 'css':
          compressed = await compressCSS(code);
          break;
        case 'html':
          compressed = await compressHTML(code);
          break;
        default:
          return res.status(400).json({ error: "Invalid type" });
      }
      
      const originalSize = Buffer.byteLength(code, 'utf8');
      const compressedSize = Buffer.byteLength(compressed, 'utf8');
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);
      
      res.json({ 
        compressed, 
        originalSize, 
        compressedSize, 
        ratio: `${ratio}%` 
      });
    } catch (error) {
      res.status(500).json({ error: "Compression failed" });
    }
  });

  app.post("/api/admin/compress/image", async (req, res) => {
    try {
      const { inputPath, quality, format } = req.body;
      const { compressImage } = await import("./compression");
      
      const outputPath = inputPath.replace(/\.\w+$/, `.optimized.${format || 'webp'}`);
      const result = await compressImage(inputPath, outputPath, { quality, format });
      
      res.json({ success: true, outputPath, ...result });
    } catch (error) {
      res.status(500).json({ error: "Image compression failed" });
    }
  });

  // ============ Advanced User Management ============
  
  // REMOVED - Duplicate endpoint - Using the one with permissions and super admin filter above

  app.get("/api/admin/permissions", async (req, res) => {
    try {
      const permissions = [
        { key: "articles.view", name: "View Articles", category: "articles" },
        { key: "articles.create", name: "Create Articles", category: "articles" },
        { key: "articles.edit", name: "Edit Articles", category: "articles" },
        { key: "articles.delete", name: "Delete Articles", category: "articles" },
        { key: "articles.publish", name: "Publish Articles", category: "articles" },
        { key: "articles.schedule", name: "Schedule Articles", category: "articles" },
        { key: "articles.feature", name: "Feature Articles", category: "articles" },
        { key: "articles.archive", name: "Archive Articles", category: "articles" },
        { key: "users.view", name: "View Users", category: "users" },
        { key: "users.create", name: "Create Users", category: "users" },
        { key: "users.edit", name: "Edit Users", category: "users" },
        { key: "users.delete", name: "Delete Users", category: "users" },
        { key: "users.roles", name: "Manage Roles", category: "users" },
        { key: "users.permissions", name: "Manage Permissions", category: "users" },
        { key: "users.suspend", name: "Suspend Users", category: "users" },
        { key: "categories.view", name: "View Categories", category: "categories" },
        { key: "categories.create", name: "Create Categories", category: "categories" },
        { key: "categories.edit", name: "Edit Categories", category: "categories" },
        { key: "categories.delete", name: "Delete Categories", category: "categories" },
        { key: "media.view", name: "View Media", category: "media" },
        { key: "media.upload", name: "Upload Media", category: "media" },
        { key: "media.edit", name: "Edit Media", category: "media" },
        { key: "media.delete", name: "Delete Media", category: "media" },
        { key: "media.optimize", name: "Optimize Media", category: "media" },
        { key: "comments.view", name: "View Comments", category: "comments" },
        { key: "comments.moderate", name: "Moderate Comments", category: "comments" },
        { key: "comments.delete", name: "Delete Comments", category: "comments" },
        { key: "comments.spam", name: "Mark as Spam", category: "comments" },
        { key: "settings.view", name: "View Settings", category: "settings" },
        { key: "settings.general", name: "Edit General Settings", category: "settings" },
        { key: "settings.seo", name: "Edit SEO Settings", category: "settings" },
        { key: "settings.security", name: "Edit Security Settings", category: "settings" },
        { key: "settings.advanced", name: "Edit Advanced Settings", category: "settings" },
        { key: "analytics.view", name: "View Analytics", category: "analytics" },
        { key: "analytics.export", name: "Export Analytics", category: "analytics" },
        { key: "analytics.reports", name: "Generate Reports", category: "analytics" },
        { key: "system.backup", name: "Create Backups", category: "system" },
        { key: "system.logs", name: "View System Logs", category: "system" },
        { key: "system.maintenance", name: "Maintenance Mode", category: "system" },
        { key: "system.api", name: "API Access", category: "system" },
      ];
      res.json(permissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch permissions" });
    }
  });

  app.get("/api/admin/roles", async (req, res) => {
    try {
      const roles = [
        { id: "1", name: "super_admin", displayName: "Super Administrator", description: "Full system access", permissions: ["*"], isSystem: true },
        { id: "2", name: "admin", displayName: "Administrator", description: "Administrative access", permissions: ["articles.*", "categories.*", "media.*", "comments.*", "users.view", "users.edit", "analytics.*", "settings.general"], isSystem: true },
        { id: "3", name: "editor", displayName: "Editor", description: "Content management", permissions: ["articles.*", "categories.view", "categories.edit", "media.*", "comments.*", "analytics.view"], isSystem: true },
        { id: "4", name: "author", displayName: "Author", description: "Create articles", permissions: ["articles.view", "articles.create", "articles.edit", "media.view", "media.upload", "categories.view"], isSystem: true },
        { id: "5", name: "moderator", displayName: "Moderator", description: "Moderate content", permissions: ["articles.view", "comments.*", "media.view"], isSystem: true },
        { id: "6", name: "viewer", displayName: "Viewer", description: "Read-only access", permissions: ["articles.view", "categories.view", "media.view", "analytics.view"], isSystem: true },
      ];
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/admin/comments", async (req, res) => {
    try {
      res.json([]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  // ============ Newsletter ============
  
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const schema = z.object({ email: z.string().email() });
      const data = schema.parse(req.body);
      
      const existing = await storage.getAllNewsletters();
      if (existing.some((n) => n.email === data.email)) {
        return res.status(400).json({ error: "Email already subscribed" });
      }

      await storage.createNewsletterSubscription(data);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid email" });
    }
  });

  // ============ Advanced Search Engine ============
  
  app.get("/api/search", async (req, res) => {
    try {
      const query = (req.query.q as string || "").toLowerCase().trim();
      
      if (!query || query.length < 2) {
        return res.json([]);
      }

      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.status === 'published');
      
      // Advanced search with scoring
      const results = articles.map((article) => {
        const titleEn = (article.titleEn || "").toLowerCase();
        const titleAr = (article.titleAr || "").toLowerCase();
        const excerptEn = (article.excerptEn || "").toLowerCase();
        const excerptAr = (article.excerptAr || "").toLowerCase();
        const contentEn = (article.contentEn || "").toLowerCase();
        const contentAr = (article.contentAr || "").toLowerCase();
        
        let score = 0;
        
        // Title matches (highest priority)
        if (titleEn.includes(query)) score += 10;
        if (titleAr.includes(query)) score += 10;
        
        // Excerpt matches (medium priority)
        if (excerptEn.includes(query)) score += 5;
        if (excerptAr.includes(query)) score += 5;
        
        // Content matches (lower priority)
        if (contentEn.includes(query)) score += 2;
        if (contentAr.includes(query)) score += 2;
        
        // Category matches
        if (article.category) {
          const categoryNameEn = (article.category.nameEn || "").toLowerCase();
          const categoryNameAr = (article.category.nameAr || "").toLowerCase();
          if (categoryNameEn.includes(query)) score += 3;
          if (categoryNameAr.includes(query)) score += 3;
        }
        
        return { ...article, searchScore: score };
      })
      .filter(article => article.searchScore > 0)
      .sort((a, b) => b.searchScore - a.searchScore)
      .slice(0, 20);

      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ============ Sitemap & RSS ============
  
  app.get("/api/sitemap.xml", async (req, res) => {
    try {
      const articles = await storage.getAllArticles({ status: "published" });
      const categories = await storage.getAllCategories();
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      
      // Homepage
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/</loc>\n`;
      xml += `    <changefreq>daily</changefreq>\n`;
      xml += `    <priority>1.0</priority>\n`;
      xml += '  </url>\n';
      
      // Categories
      categories.forEach((cat) => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/category/${cat.slug}</loc>\n`;
        xml += `    <changefreq>daily</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += '  </url>\n';
      });
      
      // Articles
      articles.forEach((article) => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
        if (article.updatedAt) {
          xml += `    <lastmod>${new Date(article.updatedAt).toISOString()}</lastmod>\n`;
        }
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.6</priority>\n`;
        xml += '  </url>\n';
      });
      
      xml += '</urlset>';
      
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });

  app.get("/api/rss.xml", async (req, res) => {
    try {
      let articles = await storage.getArticlesWithRelations();
      articles = articles.filter(a => a.status === 'published').slice(0, 20);
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
      xml += '  <channel>\n';
      xml += '    <title>Today\'s News</title>\n';
      xml += `    <link>${baseUrl}</link>\n`;
      xml += '    <description>Latest news and updates</description>\n';
      xml += '    <language>ar</language>\n';
      
      articles.forEach((article) => {
        xml += '    <item>\n';
        xml += `      <title>${article.titleAr || article.titleEn || ""}</title>\n`;
        xml += `      <link>${baseUrl}/article/${article.slug}</link>\n`;
        xml += `      <description>${article.excerptAr || article.excerptEn || ""}</description>\n`;
        if (article.publishedAt) {
          xml += `      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>\n`;
        }
        if (article.author?.name) {
          xml += `      <author>${article.author.name}</author>\n`;
        }
        xml += '    </item>\n';
      });
      
      xml += '  </channel>\n';
      xml += '</rss>';
      
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate RSS feed" });
    }
  });

  // ============ Super Admin Settings ============
  
  // Get super admin profile
  app.get("/api/admin/super-admin/profile", async (req, res) => {
    try {
      // Set content type
      res.setHeader('Content-Type', 'application/json');
      
      // TODO: Add authentication middleware to verify super admin
      // Get the first user with super_admin role (for now)
      const users = await storage.getAllUsers();
      const superAdmin = users.find(u => u.role === "super_admin") || users[0];
      
      if (!superAdmin) {
        return res.status(404).json({ error: "Super admin not found" });
      }

      res.json({
        id: superAdmin.id,
        username: superAdmin.name,
        email: superAdmin.email,
        jobTitle: superAdmin.jobTitle || "",
      });
    } catch (error) {
      console.error("Error fetching super admin profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Update super admin profile
  app.put("/api/admin/super-admin/profile", async (req, res) => {
    try {
      // Set content type
      res.setHeader('Content-Type', 'application/json');
      
      // TODO: Add authentication middleware to verify super admin
      const { username, email, jobTitle, currentPassword, newPassword } = req.body;

      // Validate required fields
      if (!username || !email) {
        return res.status(400).json({ error: "Username and email are required" });
      }

      // Get the super admin user
      const users = await storage.getAllUsers();
      const superAdmin = users.find(u => u.role === "super_admin") || users[0];
      
      if (!superAdmin) {
        return res.status(404).json({ error: "Super admin not found" });
      }

      // If changing password, validate current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: "Current password is required" });
        }

        // TODO: Verify current password against database
        // TODO: Hash and update new password
        // For now, we'll skip password verification in development
      }

      // Update user data
      const updateData: any = {
        name: username,
        email: email,
        jobTitle: jobTitle || null,
      };

      if (newPassword) {
        updateData.password = newPassword; // TODO: Hash this in production
      }

      await storage.updateUser(superAdmin.id, updateData);

      res.json({
        success: true,
        message: "Profile updated successfully",
        username,
        email,
        jobTitle,
      });
    } catch (error) {
      console.error("Error updating super admin profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Register ads API
  await registerAdsAPI(app);
  
  // ============ Ad Requests API ============
  
  // Submit ad request (public)
  app.post("/api/ad-requests", async (req, res) => {
    try {
      const adRequest = await storage.createAdRequest(req.body);
      res.json(adRequest);
    } catch (error) {
      console.error("Error creating ad request:", error);
      res.status(500).json({ error: "Failed to create ad request" });
    }
  });

  // Upload ad image (public)
  app.post("/api/ad-requests/upload-image", async (req, res) => {
    try {
      const { base64 } = req.body;
      const uploadedFile = await handleBase64Upload(base64, {
        folder: "ad-requests",
      });
      res.json({ path: uploadedFile.url });
    } catch (error) {
      console.error("Error uploading ad image:", error);
      res.status(500).json({ error: "Failed to upload image" });
    }
  });

  // Get all ad requests (admin only)
  app.get("/api/admin/ad-requests", async (req, res) => {
    try {
      const requests = await storage.getAdRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching ad requests:", error);
      res.status(500).json({ error: "Failed to fetch ad requests" });
    }
  });

  // Update ad request status (admin only)
  app.put("/api/admin/ad-requests/:id", async (req, res) => {
    try {
      const { status, adminNotes, reviewedBy } = req.body;
      const updated = await storage.updateAdRequestStatus(req.params.id, status);
      
      // If approved, automatically create an active ad
      if (status === "approved" && updated) {
        const adRequest = await storage.getAdRequest(req.params.id);
        if (adRequest) {
          // Calculate end date based on duration
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + adRequest.duration);
          
          // Create the ad
          const newAd = await storage.createAd({
            name: `${adRequest.company || adRequest.name} - إعلان`,
            filePath: adRequest.imagePath || "",
            url: adRequest.adUrl,
            placement: adRequest.placement,
            active: true,
            startDate: startDate,
            endDate: endDate,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            budget: 0,
            spent: 0,
            targetPages: ["all"],
          });
          
          console.log(`[Ad System] Auto-created ad from approved request:`, newAd.id);
          
          res.json({ 
            ...updated, 
            adCreated: true, 
            adId: newAd.id,
            message: "تم الموافقة على الطلب ونشر الإعلان تلقائياً"
          });
          return;
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating ad request:", error);
      res.status(500).json({ error: "Failed to update ad request" });
    }
  });

  // Delete ad request (admin only)
  app.delete("/api/admin/ad-requests/:id", async (req, res) => {
    try {
      await storage.deleteAdRequest(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ad request:", error);
      res.status(500).json({ error: "Failed to delete ad request" });
    }
  });
  
  // Register live stream routes
  registerLiveStreamRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
