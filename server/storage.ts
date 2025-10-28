import {
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Article, type InsertArticle, type ArticleWithRelations,
  type Media, type InsertMedia,
  type Ad, type InsertAd,
  type Stream, type InsertStream,
  type AuditLog, type InsertAuditLog,
} from "@shared/types";
import { type Newsletter, type InsertNewsletter, type Tag, type InsertTag, type AdRequest, type InsertAdRequest } from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword } from "./password-utils";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // Categories
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  getAllCategories(): Promise<Category[]>;

  // Tags
  getTag(id: string): Promise<Tag | undefined>;
  getTagBySlug(slug: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  getAllTags(): Promise<Tag[]>;

  // Articles
  getArticle(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<boolean>;
  getAllArticles(filters?: { categoryId?: string; authorId?: string; status?: string }): Promise<Article[]>;
  getArticlesWithRelations(filters?: { categoryId?: string; authorId?: string; status?: string; limit?: number }): Promise<ArticleWithRelations[]>;
  incrementArticleViews(id: string): Promise<void>;

  // Media
  getMedia(id: string): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  deleteMedia(id: string): Promise<boolean>;
  getAllMedia(): Promise<Media[]>;

  // Ads
  getAd(id: string): Promise<Ad | undefined>;
  getActiveAdByPlacement(placement: string): Promise<Ad | undefined>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: string, ad: Partial<InsertAd>): Promise<Ad | undefined>;
  deleteAd(id: string): Promise<boolean>;
  getAllAds(): Promise<Ad[]>;
  incrementAdImpressions(id: string): Promise<void>;
  incrementAdClicks(id: string): Promise<void>;

  // Streams
  getStream(id: string): Promise<Stream | undefined>;
  getActiveStream(): Promise<Stream | undefined>;
  createStream(stream: InsertStream): Promise<Stream>;
  updateStream(id: string, stream: Partial<InsertStream>): Promise<Stream | undefined>;
  getAllStreams(): Promise<Stream[]>;

  // Audit Logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: { userId?: string; resource?: string }): Promise<AuditLog[]>;

  // Newsletter
  createNewsletterSubscription(newsletter: InsertNewsletter): Promise<Newsletter>;
  getAllNewsletters(): Promise<Newsletter[]>;

  // Ad Requests
  createAdRequest(request: InsertAdRequest): Promise<AdRequest>;
  getAdRequests(): Promise<AdRequest[]>;
  getAdRequest(id: string): Promise<AdRequest | undefined>;
  updateAdRequestStatus(id: string, status: string, adminNotes?: string, reviewedBy?: string): Promise<AdRequest | undefined>;
  deleteAdRequest(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private tags: Map<string, Tag>;
  private articles: Map<string, Article>;
  private media: Map<string, Media>;
  private ads: Map<string, Ad>;
  private streams: Map<string, Stream>;
  private auditLogs: Map<string, AuditLog>;
  private newsletters: Map<string, Newsletter>;
  private adRequests: Map<string, AdRequest>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.tags = new Map();
    this.articles = new Map();
    this.media = new Map();
    this.ads = new Map();
    this.streams = new Map();
    this.auditLogs = new Map();
    this.adRequests = new Map();
    this.newsletters = new Map();
    
    this.seedData();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    
    // Hash password before storing
    const hashedPassword = await hashPassword(insertUser.password);
    
    const user: User = {
      ...insertUser,
      id,
      password: hashedPassword, // Store hashed password
      createdAt: new Date(),
      role: insertUser.role || 'viewer',
      status: insertUser.status || 'active',
      jobTitle: insertUser.jobTitle || null,
      department: insertUser.department || null,
      profileImage: insertUser.profileImage || null,
      bio: insertUser.bio || null,
      lastLogin: insertUser.lastLogin || null,
      lastActivity: insertUser.lastActivity || null,
      twoFactorEnabled: insertUser.twoFactorEnabled || null,
      twoFactorSecret: insertUser.twoFactorSecret || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // Hash password if it's being updated
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }
    
    // Log profile image update
    if (updates.profileImage !== undefined) {
      console.log('[STORAGE] Updating profileImage:', updates.profileImage ? 'New image' : 'Removing image');
    }
    
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    
    // Verify update
    console.log('[STORAGE] User updated, profileImage:', updated.profileImage);
    
    return updated;
  }

  async updateUserLoginInfo(id: string, loginInfo: { lastLogin: string; lastIP: string; loginCount: number }): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { 
      ...user, 
      lastLogin: new Date(loginInfo.lastLogin),
      lastIP: loginInfo.lastIP,
      loginCount: loginInfo.loginCount
    };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Categories
  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find((cat) => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      createdAt: new Date(),
      parentId: insertCategory.parentId || null,
      bannerImage: insertCategory.bannerImage || null,
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...updates };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // Tags
  async getTag(id: string): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async getTagBySlug(slug: string): Promise<Tag | undefined> {
    return Array.from(this.tags.values()).find((tag) => tag.slug === slug);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = randomUUID();
    const tag: Tag = { ...insertTag, id };
    this.tags.set(id, tag);
    return tag;
  }

  async getAllTags(): Promise<Tag[]> {
    return Array.from(this.tags.values());
  }

  // Articles
  async getArticle(id: string): Promise<Article | undefined> {
    return this.articles.get(id);
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    return Array.from(this.articles.values()).find((article) => article.slug === slug);
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const id = randomUUID();
    const now = new Date();
    const article: Article = {
      ...insertArticle,
      id,
      views: 0,
      createdAt: now,
      updatedAt: now,
      titleEn: insertArticle.titleEn || null,
      titleAr: insertArticle.titleAr || null,
      excerptEn: insertArticle.excerptEn || null,
      excerptAr: insertArticle.excerptAr || null,
      contentEn: insertArticle.contentEn || null,
      contentAr: insertArticle.contentAr || null,
      coverImage: insertArticle.coverImage || null,
      gallery: insertArticle.gallery || null,
      tags: insertArticle.tags || null,
      status: insertArticle.status || 'draft',
      featured: insertArticle.featured || null,
      readingTime: insertArticle.readingTime || null,
      seoMeta: insertArticle.seoMeta || null,
      publishedAt: insertArticle.publishedAt || null,
    };
    this.articles.set(id, article);
    return article;
  }

  async updateArticle(id: string, updates: Partial<InsertArticle>): Promise<Article | undefined> {
    console.log("[Storage] ===== UPDATE ARTICLE START =====");
    console.log("[Storage] Article ID:", id);
    console.log("[Storage] Updates:", JSON.stringify(updates, null, 2));
    console.log("[Storage] Total articles in storage:", this.articles.size);
    
    const article = this.articles.get(id);
    if (!article) {
      console.error("[Storage] ❌ Article NOT FOUND:", id);
      console.log("[Storage] Available article IDs:");
      Array.from(this.articles.keys()).forEach((key, index) => {
        console.log(`  ${index + 1}. ${key}`);
      });
      return undefined;
    }
    
    console.log("[Storage] ✅ Article FOUND:");
    console.log("[Storage] Current featured status:", article.featured);
    console.log("[Storage] New featured status:", updates.featured);
    
    // Create updated article with proper type handling
    const updated: Article = {
      ...article,
      ...updates,
      updatedAt: new Date(),
      // Ensure featured is properly set as boolean
      featured: updates.featured !== undefined ? Boolean(updates.featured) : article.featured,
    };
    
    this.articles.set(id, updated);
    console.log("[Storage] ✅ Article UPDATED successfully");
    console.log("[Storage] Updated featured status:", updated.featured);
    console.log("[Storage] ===== UPDATE ARTICLE END =====");
    
    return updated;
  }

  async deleteArticle(id: string): Promise<boolean> {
    return this.articles.delete(id);
  }

  async getAllArticles(filters?: { categoryId?: string; authorId?: string; status?: string }): Promise<Article[]> {
    let articles = Array.from(this.articles.values());
    
    if (filters?.categoryId) {
      articles = articles.filter((a) => a.categoryId === filters.categoryId);
    }
    if (filters?.authorId) {
      articles = articles.filter((a) => a.authorId === filters.authorId);
    }
    if (filters?.status) {
      articles = articles.filter((a) => a.status === filters.status);
    }
    
    return articles;
  }

  async getArticlesWithRelations(filters?: { categoryId?: string; authorId?: string; status?: string; limit?: number }): Promise<ArticleWithRelations[]> {
    const articles = await this.getAllArticles(filters);
    const articlesWithRelations: ArticleWithRelations[] = [];

    for (const article of articles) {
      const author = await this.getUser(article.authorId);
      const category = await this.getCategory(article.categoryId);
      
      if (author && category) {
        articlesWithRelations.push({
          ...article,
          author,
          category,
        });
      }
    }

    const sorted = articlesWithRelations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filters?.limit ? sorted.slice(0, filters.limit) : sorted;
  }

  async incrementArticleViews(id: string): Promise<void> {
    const article = this.articles.get(id);
    if (article) {
      article.views = (article.views || 0) + 1;
      this.articles.set(id, article);
    }
  }

  // Media
  async getMedia(id: string): Promise<Media | undefined> {
    return this.media.get(id);
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = randomUUID();
    const media: Media = {
      ...insertMedia,
      id,
      createdAt: new Date(),
      usedInArticle: insertMedia.usedInArticle || null,
    };
    this.media.set(id, media);
    return media;
  }

  async deleteMedia(id: string): Promise<boolean> {
    return this.media.delete(id);
  }

  async getAllMedia(): Promise<Media[]> {
    return Array.from(this.media.values());
  }

  // Ads
  async getAd(id: string): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async getActiveAdByPlacement(placement: string): Promise<Ad | undefined> {
    const now = new Date();
    return Array.from(this.ads.values()).find((ad) => {
      if (!ad.active || ad.placement !== placement) return false;
      if (ad.startDate && new Date(ad.startDate) > now) return false;
      if (ad.endDate && new Date(ad.endDate) < now) return false;
      return true;
    });
  }

  async createAd(insertAd: InsertAd): Promise<Ad> {
    const id = randomUUID();
    const ad: Ad = {
      ...insertAd,
      id,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      budget: insertAd.budget || null,
      spent: insertAd.spent || null,
      targetPages: insertAd.targetPages || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      filePath: insertAd.filePath || null,
      url: insertAd.url || null,
      startDate: insertAd.startDate || null,
      endDate: insertAd.endDate || null,
      active: insertAd.active || null,
    };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: string, updates: Partial<InsertAd>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    const updated = { ...ad, ...updates };
    this.ads.set(id, updated);
    return updated;
  }

  async deleteAd(id: string): Promise<boolean> {
    return this.ads.delete(id);
  }

  async getAllAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }

  async incrementAdImpressions(id: string): Promise<void> {
    const ad = this.ads.get(id);
    if (ad) {
      ad.impressions = (ad.impressions || 0) + 1;
      this.ads.set(id, ad);
    }
  }

  async incrementAdClicks(id: string): Promise<void> {
    const ad = this.ads.get(id);
    if (ad) {
      ad.clicks = (ad.clicks || 0) + 1;
      this.ads.set(id, ad);
    }
  }

  // Streams
  async getStream(id: string): Promise<Stream | undefined> {
    return this.streams.get(id);
  }

  async getActiveStream(): Promise<Stream | undefined> {
    return Array.from(this.streams.values()).find((s) => s.status === "live");
  }

  async createStream(insertStream: InsertStream): Promise<Stream> {
    const id = randomUUID();
    const stream: Stream = {
      ...insertStream,
      id,
      createdAt: new Date(),
      status: insertStream.status || null,
      startedAt: insertStream.startedAt || null,
      endedAt: insertStream.endedAt || null,
      vodPath: insertStream.vodPath || null,
    };
    this.streams.set(id, stream);
    return stream;
  }

  async updateStream(id: string, updates: Partial<InsertStream>): Promise<Stream | undefined> {
    const stream = this.streams.get(id);
    if (!stream) return undefined;
    const updated = { ...stream, ...updates };
    this.streams.set(id, updated);
    return updated;
  }

  async getAllStreams(): Promise<Stream[]> {
    return Array.from(this.streams.values());
  }

  // Audit Logs
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    const id = randomUUID();
    const log: AuditLog = {
      ...insertLog,
      id,
      createdAt: new Date(),
      resourceId: insertLog.resourceId || null,
      details: insertLog.details || null,
      ipAddress: insertLog.ipAddress || null,
    };
    this.auditLogs.set(id, log);
    return log;
  }

  async getAuditLogs(filters?: { userId?: string; resource?: string }): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (filters?.userId) {
      logs = logs.filter((l) => l.userId === filters.userId);
    }
    if (filters?.resource) {
      logs = logs.filter((l) => l.resource === filters.resource);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Newsletter
  async createNewsletterSubscription(insertNewsletter: InsertNewsletter): Promise<Newsletter> {
    const id = randomUUID();
    const newsletter: Newsletter = { ...insertNewsletter, id, subscribedAt: new Date() };
    this.newsletters.set(id, newsletter);
    return newsletter;
  }

  async getAllNewsletters(): Promise<Newsletter[]> {
    return Array.from(this.newsletters.values());
  }

  // Seed data
  private async seedData() {
    // Create Super Admin first
    const superAdmin = await this.createUser({
      email: "superadmin@careercanvas.com",
      password: "SuperAdmin@2025!",
      name: "المدير العام",
      role: "super_admin",
      status: "active",
      jobTitle: "Super Administrator",
      department: "الإدارة العليا",
      bio: "المدير العام للنظام - صلاحيات كاملة",
      profileImage: null,
    });
    
    // Create users
    const admin = await this.createUser({
      email: "admin@news.com",
      password: "admin123",
      name: "أحمد محمود",
      role: "admin",
      jobTitle: "رئيس التحرير",
      department: "الإدارة",
      bio: "رئيس تحرير متخصص في الأخبار السياسية والاقتصادية",
      profileImage: null,
    });

    const editor = await this.createUser({
      email: "sarah@news.com",
      password: "editor123",
      name: "سارة علي",
      role: "editor",
      jobTitle: "محررة أخبار",
      department: "القسم الثقافي",
      bio: "محررة متخصصة في الشؤون الثقافية والفنية",
      profileImage: null,
    });

    // Create categories
    const politics = await this.createCategory({
      nameEn: "Politics",
      nameAr: "سياسة",
      slug: "politics",
      parentId: null,
      bannerImage: null,
    });

    const sports = await this.createCategory({
      nameEn: "Sports",
      nameAr: "رياضة",
      slug: "sports",
      parentId: null,
      bannerImage: null,
    });

    const tech = await this.createCategory({
      nameEn: "Technology",
      nameAr: "تكنولوجيا",
      slug: "technology",
      parentId: null,
      bannerImage: null,
    });

    // Create tags
    await this.createTag({
      nameEn: "Breaking News",
      nameAr: "عاجل",
      slug: "breaking",
    });

    await this.createTag({
      nameEn: "Analysis",
      nameAr: "تحليل",
      slug: "analysis",
    });

    // Create articles with different view counts
    const article1 = await this.createArticle({
      titleEn: "Major Political Summit Concludes with Historic Agreement",
      titleAr: "قمة سياسية كبرى تختتم باتفاق تاريخي",
      slug: "political-summit-historic-agreement",
      excerptEn: "World leaders gather to sign groundbreaking peace accord",
      excerptAr: "قادة العالم يجتمعون لتوقيع اتفاق سلام تاريخي",
      contentEn: "<h2>Historic Achievement</h2><p>In a momentous gathering, world leaders have come together to sign what many are calling the most significant peace accord of the decade...</p>",
      contentAr: "<h2>إنجاز تاريخي</h2><p>في تجمع تاريخي، اجتمع قادة العالم لتوقيع ما يسميه الكثيرون أهم اتفاق سلام في العقد...</p>",
      coverImage: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200",
      gallery: null,
      categoryId: politics.id,
      authorId: admin.id,
      tags: ["breaking"],
      status: "published",
      featured: true,
      readingTime: 5,
      seoMeta: null,
      publishedAt: new Date(),
    });
    // Set views for article 1
    article1.views = 15420;

    const article2 = await this.createArticle({
      titleEn: "Championship Final: Underdogs Claim Victory",
      titleAr: "نهائي البطولة: الفريق الضعيف يحقق النصر",
      slug: "championship-final-underdog-victory",
      excerptEn: "Against all odds, the underdog team secures championship title",
      excerptAr: "ضد كل التوقعات، الفريق الضعيف يحقق لقب البطولة",
      contentEn: "<h2>Incredible Comeback</h2><p>In one of the most thrilling finals in recent memory, the underdog team staged an incredible comeback...</p>",
      contentAr: "<h2>عودة لا تصدق</h2><p>في واحد من أكثر النهائيات إثارة في الذاكرة الحديثة، قام الفريق الضعيف بعودة مذهلة...</p>",
      coverImage: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200",
      gallery: null,
      categoryId: sports.id,
      authorId: editor.id,
      tags: ["breaking"],
      status: "published",
      featured: true,
      readingTime: 4,
      seoMeta: null,
      publishedAt: new Date(Date.now() - 3600000),
    });
    // Set views for article 2
    article2.views = 28750;

    const article3 = await this.createArticle({
      titleEn: "Revolutionary AI Technology Transforms Healthcare",
      titleAr: "تقنية الذكاء الاصطناعي الثورية تحول الرعاية الصحية",
      slug: "ai-transforms-healthcare",
      excerptEn: "New AI system promises to revolutionize medical diagnosis",
      excerptAr: "نظام ذكاء اصطناعي جديد يعد بثورة في التشخيص الطبي",
      contentEn: "<h2>Medical Breakthrough</h2><p>A groundbreaking artificial intelligence system has been developed that can diagnose diseases with unprecedented accuracy...</p>",
      contentAr: "<h2>اختراق طبي</h2><p>تم تطوير نظام ذكاء اصطناعي رائد يمكنه تشخيص الأمراض بدقة غير مسبوقة...</p>",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200",
      gallery: null,
      categoryId: tech.id,
      authorId: admin.id,
      tags: ["analysis"],
      status: "published",
      featured: false,
      readingTime: 6,
      seoMeta: null,
      publishedAt: new Date(Date.now() - 7200000),
    });
    // Set views for article 3
    article3.views = 12340;

    const article4 = await this.createArticle({
      titleEn: "Climate Summit: Nations Commit to Bold Action",
      titleAr: "قمة المناخ: الدول تلتزم بإجراءات جريئة",
      slug: "climate-summit-bold-commitments",
      excerptEn: "Global leaders pledge unprecedented climate action",
      excerptAr: "قادة العالم يتعهدون بإجراءات مناخية غير مسبوقة",
      contentEn: "<h2>Environmental Progress</h2><p>At the annual climate summit, nations have committed to ambitious new targets for reducing carbon emissions...</p>",
      contentAr: "<h2>تقدم بيئي</h2><p>في قمة المناخ السنوية، التزمت الدول بأهداف طموحة جديدة لخفض انبعاثات الكربون...</p>",
      coverImage: "https://images.unsplash.com/photo-1569163139394-de4798aa62b0?w=1200",
      gallery: null,
      categoryId: politics.id,
      authorId: editor.id,
      tags: ["analysis"],
      status: "published",
      featured: false,
      readingTime: 7,
      seoMeta: null,
      publishedAt: new Date(Date.now() - 10800000),
    });
    // Set views for article 4
    article4.views = 9870;

    const article5 = await this.createArticle({
      titleEn: "Tech Giants Unite for Cybersecurity Initiative",
      titleAr: "عمالقة التكنولوجيا يتحدون لمبادرة الأمن السيبراني",
      slug: "tech-cybersecurity-initiative",
      excerptEn: "Major tech companies join forces to combat cyber threats",
      excerptAr: "شركات التكنولوجيا الكبرى توحد قواها لمكافحة التهديدات السيبرانية",
      contentEn: "<h2>Digital Security</h2><p>Leading technology companies have announced a collaborative initiative to strengthen global cybersecurity...</p>",
      contentAr: "<h2>الأمن الرقمي</h2><p>أعلنت شركات التكنولوجيا الرائدة عن مبادرة تعاونية لتعزيز الأمن السيبراني العالمي...</p>",
      coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200",
      gallery: null,
      categoryId: tech.id,
      authorId: admin.id,
      tags: [],
      status: "published",
      featured: false,
      readingTime: 5,
      seoMeta: null,
      publishedAt: new Date(Date.now() - 14400000),
    });
    // Set views for article 5
    article5.views = 7650;

    // Update articles in storage with view counts
    this.articles.set(article1.id, article1);
    this.articles.set(article2.id, article2);
    this.articles.set(article3.id, article3);
    this.articles.set(article4.id, article4);
    this.articles.set(article5.id, article5);

    // Create a stream
    await this.createStream({
      name: "Live News Coverage",
      rtmpKey: `rtmp_${randomUUID()}`,
      status: "offline",
      startedAt: null,
      endedAt: null,
      vodPath: null,
    });
  }

  // Ad Requests
  async createAdRequest(request: InsertAdRequest): Promise<AdRequest> {
    const id = randomUUID();
    const adRequest: AdRequest = {
      id,
      ...request,
      message: request.message || null,
      phone: request.phone || null,
      company: request.company || null,
      status: request.status || "pending",
      adminNotes: request.adminNotes || null,
      reviewedBy: request.reviewedBy || null,
      reviewedAt: request.reviewedAt || null,
      createdAt: new Date(),
    };
    this.adRequests.set(id, adRequest);
    return adRequest;
  }

  async getAdRequests(): Promise<AdRequest[]> {
    return Array.from(this.adRequests.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getAdRequest(id: string): Promise<AdRequest | undefined> {
    return this.adRequests.get(id);
  }

  async updateAdRequestStatus(
    id: string, 
    status: string, 
    adminNotes?: string, 
    reviewedBy?: string
  ): Promise<AdRequest | undefined> {
    const request = this.adRequests.get(id);
    if (!request) return undefined;

    const updated: AdRequest = {
      ...request,
      status,
      adminNotes: adminNotes || request.adminNotes,
      reviewedBy: reviewedBy || request.reviewedBy,
      reviewedAt: new Date(),
    };
    this.adRequests.set(id, updated);
    return updated;
  }

  async deleteAdRequest(id: string): Promise<boolean> {
    return this.adRequests.delete(id);
  }
}

// استخدام Memory Storage (مؤقتاً - حتى يتم فتح Firewall)
export const storage = new MemStorage();

// PostgreSQL Storage (سيتم تفعيله بعد فتح Firewall)
// import { postgresStorage } from "./postgres-storage";
// export const storage = postgresStorage;
