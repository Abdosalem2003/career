// Shared TypeScript types for CareerCanvas
// These types are used across both frontend and backend

// ============ User Types ============
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  jobTitle: string | null;
  department: string | null;
  profileImage: string | null;
  bio: string | null;
  status: string;
  lastLogin: Date | null;
  lastActivity: Date | null;
  twoFactorEnabled: boolean | null;
  twoFactorSecret: string | null;
  createdAt: Date;
}

export interface InsertUser {
  email: string;
  password: string;
  name: string;
  role?: string;
  jobTitle?: string | null;
  department?: string | null;
  profileImage?: string | null;
  bio?: string | null;
  status?: string;
  lastLogin?: Date | null;
  lastActivity?: Date | null;
  twoFactorEnabled?: boolean | null;
  twoFactorSecret?: string | null;
}

// ============ Category Types ============
export interface Category {
  id: string;
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId: string | null;
  bannerImage: string | null;
  createdAt: Date;
}

export interface InsertCategory {
  nameEn: string;
  nameAr: string;
  slug: string;
  parentId?: string | null;
  bannerImage?: string | null;
}

// ============ Article Types ============
export interface Article {
  id: string;
  titleEn: string | null;
  titleAr: string | null;
  slug: string;
  excerptEn: string | null;
  excerptAr: string | null;
  contentEn: string | null;
  contentAr: string | null;
  coverImage: string | null;
  gallery: string[] | null;
  categoryId: string;
  authorId: string;
  tags: string[] | null;
  status: string;
  featured: boolean | null;
  views: number | null;
  readingTime: number | null;
  seoMeta: any | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertArticle {
  titleEn?: string | null;
  titleAr?: string | null;
  slug: string;
  excerptEn?: string | null;
  excerptAr?: string | null;
  contentEn?: string | null;
  contentAr?: string | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  categoryId: string;
  authorId: string;
  tags?: string[] | null;
  status?: string;
  featured?: boolean | null;
  views?: number | null;
  readingTime?: number | null;
  seoMeta?: any | null;
  publishedAt?: Date | null;
}

// Article with relations (for frontend display)
export interface ArticleWithRelations extends Article {
  author?: User;
  category?: Category;
  poll?: {
    question: string;
    options: string[];
    votes: number[];
  } | null | undefined;
  specialReport?: boolean | null;
  specialReportOrder?: number | null;
  breakingNews?: boolean | null;
  topNews?: boolean | null;
}

// ============ Media Types ============
export interface Media {
  id: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  usedInArticle: string | null;
  createdAt: Date;
}

export interface InsertMedia {
  fileName: string;
  filePath: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  usedInArticle?: string | null;
}

// ============ Ad Types ============
export interface Ad {
  id: string;
  name: string;
  placement: string;
  filePath: string | null;
  url: string | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  budget: number | null;
  spent: number | null;
  targetPages: string[] | null;
  startDate: Date | null;
  endDate: Date | null;
  active: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertAd {
  name: string;
  placement: string;
  filePath?: string | null;
  url?: string | null;
  impressions?: number | null;
  clicks?: number | null;
  conversions?: number | null;
  budget?: number | null;
  spent?: number | null;
  targetPages?: string[] | null;
  startDate?: Date | null;
  endDate?: Date | null;
  active?: boolean | null;
  updatedAt?: Date;
}

// ============ Stream Types ============
export interface Stream {
  id: string;
  name: string;
  rtmpKey: string;
  status: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  vodPath: string | null;
  createdAt: Date;
}

export interface InsertStream {
  name: string;
  rtmpKey: string;
  status?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  vodPath?: string | null;
}

// ============ Audit Log Types ============
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string | null;
  details: any;
  ipAddress: string | null;
  createdAt: Date;
}

export interface InsertAuditLog {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: any;
  ipAddress?: string | null;
}

// ============ Site Settings Types ============
export interface SiteSettings {
  // General Settings
  siteNameEn?: string;
  siteNameAr?: string;
  siteDescriptionEn?: string;
  siteDescriptionAr?: string;
  logo?: string;
  favicon?: string;
  description?: string;
  
  // Management Team
  chairmanName?: string;
  chairmanTitle?: string;
  editorInChiefName?: string;
  editorInChiefTitle?: string;
  
  // Footer Settings
  copyrightTextAr?: string;
  copyrightTextEn?: string;
  madeWithLoveTextAr?: string;
  madeWithLoveTextEn?: string;
  footerDescriptionAr?: string;
  footerDescriptionEn?: string;
  designerCompanyName?: string;
  designerCompanyUrl?: string;
  
  // Contact Information
  contactEmail?: string;
  phone?: string;
  
  // Social Media
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  snapchatUrl?: string;
  telegramUrl?: string;
  whatsappUrl?: string;
  githubUrl?: string;
  pinterestUrl?: string;
  redditUrl?: string;
  discordUrl?: string;
  emailUrl?: string;
  phoneUrl?: string;
  enableNewsletter?: boolean;
  enableAds?: boolean;
  enableLiveStream?: boolean;
  
  // Email Settings
  smtpHost?: string;
  smtpPort?: string;
  smtpUsername?: string;
  smtpPassword?: string;
  newArticleNotifications?: boolean;
  weeklyNewsletter?: boolean;
  
  // Security
  twoFactorAuth?: boolean;
  botProtection?: boolean;
  maxLoginAttempts?: string;
  sessionTimeout?: string;
  ipLogging?: boolean;
  
  // Appearance
  customCSS?: string;
  customJS?: string;
  customCss?: string;
  customJs?: string;
  
  // Performance
  enableCaching?: boolean;
  autoImageCompression?: boolean;
  lazyLoadImages?: boolean;
  cdnEnabled?: boolean;
  cdnUrl?: string;
  
  // Notifications
  browserNotifications?: boolean;
  commentNotifications?: boolean;
  pendingArticleNotifications?: boolean;
  
  // Advanced
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  allowRegistration?: boolean;
  requireEmailVerification?: boolean;
  postsPerPage?: number;
  developerMode?: boolean;
  errorLogging?: boolean;
  apiRateLimit?: string;
  facebookPixelId?: string;
  autoSitemap?: boolean;
  enableAMP?: boolean;
}

// ============ Comment Types ============
export interface Comment {
  id: string;
  articleId: string;
  userId: string | null;
  authorName: string | null;
  authorEmail: string | null;
  content: string;
  status: string;
  parentId: string | null;
  ipAddress: string | null;
  createdAt: Date;
}

// ============ Newsletter Types ============
export interface Newsletter {
  id: string;
  email: string;
  subscribedAt: Date;
}

// ============ API Response Types ============
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============ Filter Types ============
export interface ArticleFilters {
  categoryId?: string;
  authorId?: string;
  status?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

// ============ Statistics Types ============
export interface DashboardStats {
  totalArticles: number;
  totalUsers: number;
  totalCategories: number;
  totalViews: number;
  publishedArticles: number;
  draftArticles: number;
  activeUsers: number;
  todayViews: number;
}
