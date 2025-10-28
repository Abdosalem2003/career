import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, timestamp, int, boolean, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with RBAC
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("viewer"), // super_admin, admin, editor, author, moderator, viewer
  jobTitle: text("job_title"),
  department: text("department"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  phone: text("phone"),
  // Social Media Links
  socialLinks: json("social_links"), // {facebook, twitter, instagram, linkedin, youtube, website}
  status: text("status").notNull().default("active"), // active, inactive, suspended, banned
  lastLogin: timestamp("last_login"),
  lastActivity: timestamp("last_activity"),
  lastIP: text("last_ip"),
  loginCount: int("login_count").default(0),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Roles table with detailed permissions
export const roles = mysqlTable("roles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  permissions: json("permissions").notNull(), // array of permission keys
  isSystem: boolean("is_system").default(false), // system roles can't be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Permissions table
export const permissions = mysqlTable("permissions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  key: varchar("key", { length: 255 }).notNull().unique(), // e.g., "articles.create", "users.delete"
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // articles, users, categories, media, settings, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User permissions (additional permissions beyond role)
export const userPermissions = mysqlTable("user_permissions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  permissionId: varchar("permission_id", { length: 255 }).notNull(),
  grantedBy: varchar("granted_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Activity tracking for users
export const userActivity = mysqlTable("user_activity", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  action: text("action").notNull(), // login, logout, view, edit, delete, etc.
  resourceType: text("resource_type"), // article, user, category, etc.
  resourceId: varchar("resource_id", { length: 255 }),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User sessions for better security
export const userSessions = mysqlTable("user_sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Categories table
export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  parentId: varchar("parent_id", { length: 255 }),
  bannerImage: text("banner_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tags table
export const tags = mysqlTable("tags", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});

// Articles table
export const articles = mysqlTable("articles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  titleEn: text("title_en"),
  titleAr: text("title_ar"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerptEn: text("excerpt_en"),
  excerptAr: text("excerpt_ar"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  coverImage: text("cover_image"),
  gallery: json("gallery").$type<string[]>(),
  poll: json("poll").$type<{ question: string; options: string[]; votes: number[] }>(),
  categoryId: varchar("category_id", { length: 255 }).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  tags: json("tags").$type<string[]>(),
  status: text("status").notNull().default("draft"), // draft, published, scheduled
  featured: boolean("featured").default(false),
  specialReport: boolean("special_report").default(false), // للتقارير الخاصة
  specialReportOrder: int("special_report_order").default(0), // ترتيب التقرير
  breakingNews: boolean("breaking_news").default(false), // Show in breaking news ticker
  topNews: boolean("top_news").default(false), // Show in top news section
  views: int("views").default(0),
  readingTime: int("reading_time").default(0), // in minutes
  seoMeta: json("seo_meta"), // {titleEn, titleAr, descriptionEn, descriptionAr, keywords, ogImage}
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Media library table
export const media = mysqlTable("media", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: int("size").notNull(), // in bytes
  uploadedBy: varchar("uploaded_by", { length: 255 }).notNull(),
  usedInArticle: varchar("used_in_article", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Ads table
export const ads = mysqlTable("ads", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  placement: text("placement").notNull(), // header, sidebar-top, sidebar-middle, in-article, footer
  filePath: text("file_path"),
  url: text("url"),
  impressions: int("impressions").default(0),
  clicks: int("clicks").default(0),
  conversions: int("conversions").default(0),
  budget: int("budget").default(0),
  spent: int("spent").default(0),
  targetPages: json("target_pages").$type<string[]>(), // الصفحات المستهدفة
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Live streams table
export const streams = mysqlTable("streams", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url"), // YouTube URL for external streaming
  rtmpUrl: text("rtmp_url"),
  rtmpKey: text("rtmp_key"),
  status: text("status").notNull().default("scheduled"), // live, ended, scheduled
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  vodPath: text("vod_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Audit logs table
export const auditLogs = mysqlTable("audit_logs", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  action: text("action").notNull(), // create, update, delete
  resource: text("resource").notNull(), // article, user, category, etc.
  resourceId: varchar("resource_id", { length: 255 }),
  details: json("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Newsletter subscriptions
export const newsletters = mysqlTable("newsletters", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
});

// Comments table
export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  authorName: text("author_name"),
  authorEmail: text("author_email"),
  content: text("content").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, spam
  parentId: varchar("parent_id", { length: 255 }), // for replies
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Notifications table
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  read: boolean("read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Site settings table (Enhanced with 30+ settings)
export const siteSettings = mysqlTable("site_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: json("value").notNull(),
  category: text("category").notNull(), // general, appearance, social, seo, advanced, email, security, performance
  updatedBy: varchar("updated_by", { length: 255 }),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 1. Content Scheduling System
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: text("status").default("pending"), // pending, published, failed
  publishedAt: timestamp("published_at"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 2. A/B Testing for Articles
export const abTests = mysqlTable("ab_tests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  variantA: json("variant_a").notNull(), // {title, image, excerpt}
  variantB: json("variant_b").notNull(),
  impressionsA: int("impressions_a").default(0),
  impressionsB: int("impressions_b").default(0),
  clicksA: int("clicks_a").default(0),
  clicksB: int("clicks_b").default(0),
  status: text("status").default("active"), // active, paused, completed
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 3. Content Performance Insights
export const contentInsights = mysqlTable("content_insights", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull().unique(),
  totalViews: int("total_views").default(0),
  uniqueVisitors: int("unique_visitors").default(0),
  avgTimeOnPage: int("avg_time_on_page").default(0), // seconds
  bounceRate: int("bounce_rate").default(0), // percentage
  shareCount: int("share_count").default(0),
  commentCount: int("comment_count").default(0),
  conversionRate: int("conversion_rate").default(0),
  topReferrers: json("top_referrers"), // {source: count}
  deviceBreakdown: json("device_breakdown"), // {desktop, mobile, tablet}
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 4. Editorial Workflow
export const editorialWorkflow = mysqlTable("editorial_workflow", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  status: text("status").notNull(), // draft, in_review, approved, rejected, published
  assignedTo: varchar("assigned_to", { length: 255 }),
  reviewNotes: text("review_notes"),
  deadline: timestamp("deadline"),
  priority: text("priority").default("medium"), // low, medium, high, urgent
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 5. Content Templates
export const contentTemplates = mysqlTable("content_templates", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  structure: json("structure").notNull(), // template fields and layout
  isDefault: boolean("is_default").default(false),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 6. Media Library Folders
export const mediaFolders = mysqlTable("media_folders", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  parentId: varchar("parent_id", { length: 255 }),
  path: text("path").notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 7. Bulk Operations Log
export const bulkOperations = mysqlTable("bulk_operations", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  operation: text("operation").notNull(), // delete, update, export, import
  entityType: text("entity_type").notNull(), // articles, users, media
  affectedCount: int("affected_count").default(0),
  status: text("status").default("pending"), // pending, in_progress, completed, failed
  result: json("result"),
  executedBy: varchar("executed_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// 8. Dashboard Widgets
export const dashboardWidgets = mysqlTable("dashboard_widgets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  widgetType: text("widget_type").notNull(), // stats, chart, list, calendar
  position: json("position").notNull(), // {x, y, width, height}
  config: json("config"), // widget-specific settings
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 9. Automated Reports
export const automatedReports = mysqlTable("automated_reports", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  reportType: text("report_type").notNull(), // analytics, content, users, revenue
  schedule: text("schedule").notNull(), // daily, weekly, monthly
  recipients: json("recipients").notNull(), // array of email addresses
  lastRun: timestamp("last_run"),
  nextRun: timestamp("next_run"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 10. Content Recommendations Engine
export const contentRecommendations = mysqlTable("content_recommendations", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  recommendedArticleId: varchar("recommended_article_id", { length: 255 }).notNull(),
  score: int("score").default(0), // relevance score 0-100
  algorithm: text("algorithm").notNull(), // collaborative, content-based, hybrid
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// 11. User Engagement Tracking
export const userEngagement = mysqlTable("user_engagement", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }),
  sessionId: text("session_id").notNull(),
  pageViews: int("page_views").default(0),
  interactions: json("interactions"), // clicks, scrolls, shares
  deviceInfo: json("device_info"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  totalDuration: int("total_duration").default(0), // seconds
});

// 12. Content Versioning Advanced
export const contentVersions = mysqlTable("content_versions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  versionNumber: int("version_number").notNull(),
  content: json("content").notNull(),
  changesSummary: text("changes_summary"),
  editedBy: varchar("edited_by", { length: 255 }).notNull(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 13. API Usage Tracking
export const apiUsage = mysqlTable("api_usage", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  apiKey: text("api_key").notNull(),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: int("status_code").notNull(),
  responseTime: int("response_time"), // milliseconds
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 14. Geolocation Analytics
export const geoAnalytics = mysqlTable("geo_analytics", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }),
  country: text("country").notNull(),
  city: text("city"),
  region: text("region"),
  views: int("views").default(1),
  date: timestamp("date").notNull().defaultNow(),
});

// 15. Content Quality Scores
export const contentQuality = mysqlTable("content_quality", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull().unique(),
  readabilityScore: int("readability_score").default(0),
  seoScore: int("seo_score").default(0),
  grammarScore: int("grammar_score").default(0),
  uniquenessScore: int("uniqueness_score").default(0),
  overallScore: int("overall_score").default(0),
  suggestions: json("suggestions"), // improvement recommendations
  lastChecked: timestamp("last_checked").notNull().defaultNow(),
});

// 16. Revenue Tracking
export const revenueTracking = mysqlTable("revenue_tracking", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  source: text("source").notNull(), // ads, subscriptions, sponsors
  amount: int("amount").notNull(), // in cents
  currency: text("currency").default("USD"),
  articleId: varchar("article_id", { length: 255 }),
  date: timestamp("date").notNull(),
  metadata: json("metadata"),
});

// 17. Team Collaboration
export const teamCollaboration = mysqlTable("team_collaboration", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  action: text("action").notNull(), // editing, reviewing, commenting
  status: text("status").default("active"), // active, completed
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// 18. Content Calendar
export const contentCalendar = mysqlTable("content_calendar", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  title: text("title").notNull(),
  articleId: varchar("article_id", { length: 255 }),
  publishDate: timestamp("publish_date").notNull(),
  status: text("status").default("planned"), // planned, in_progress, published
  assignedTo: varchar("assigned_to", { length: 255 }),
  category: text("category"),
  priority: text("priority").default("medium"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 19. Import/Export History
export const importExportHistory = mysqlTable("import_export_history", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  operationType: text("operation_type").notNull(), // import, export
  entityType: text("entity_type").notNull(), // articles, users, categories
  fileFormat: text("file_format").notNull(), // json, csv, xml
  recordsCount: int("records_count").default(0),
  status: text("status").default("pending"),
  filePath: text("file_path"),
  executedBy: varchar("executed_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 20. System Health Monitoring
export const systemHealth = mysqlTable("system_health", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  metric: text("metric").notNull(), // cpu, memory, disk, database
  value: int("value").notNull(),
  unit: text("unit").notNull(), // percentage, mb, ms
  status: text("status").default("normal"), // normal, warning, critical
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// 21. Custom Fields for Articles
export const customFields = mysqlTable("custom_fields", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  fieldType: text("field_type").notNull(), // text, number, date, boolean, select
  options: json("options"), // for select fields
  isRequired: boolean("is_required").default(false),
  entityType: text("entity_type").notNull(), // article, category, user
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 22. Custom Field Values
export const customFieldValues = mysqlTable("custom_field_values", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  fieldId: varchar("field_id", { length: 255 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  value: json("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 23. Email Campaign Tracking
export const emailCampaigns = mysqlTable("email_campaigns", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  recipientList: json("recipient_list").notNull(),
  sentCount: int("sent_count").default(0),
  openCount: int("open_count").default(0),
  clickCount: int("click_count").default(0),
  status: text("status").default("draft"), // draft, sending, sent
  scheduledAt: timestamp("scheduled_at"),
  sentAt: timestamp("sent_at"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 24. Advanced Search History
export const searchHistory = mysqlTable("search_history", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  query: text("query").notNull(),
  userId: varchar("user_id", { length: 255 }),
  resultsCount: int("results_count").default(0),
  clickedResults: json("clicked_results"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 25. Content Taxonomy
export const taxonomy = mysqlTable("taxonomy", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  type: text("type").notNull(), // category, tag, topic
  parentId: varchar("parent_id", { length: 255 }),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 26. Workflow Automation Rules
export const automationRules = mysqlTable("automation_rules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  trigger: json("trigger").notNull(), // {event, conditions}
  actions: json("actions").notNull(), // array of actions to perform
  isActive: boolean("is_active").default(true),
  executionCount: int("execution_count").default(0),
  lastExecuted: timestamp("last_executed"),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 27. Content Duplicates Detection
export const duplicateContent = mysqlTable("duplicate_content", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  duplicateArticleId: varchar("duplicate_article_id", { length: 255 }).notNull(),
  similarityScore: int("similarity_score").default(0), // 0-100
  detectedAt: timestamp("detected_at").notNull().defaultNow(),
});

// 28. Performance Benchmarks
export const performanceBenchmarks = mysqlTable("performance_benchmarks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  pageUrl: text("page_url").notNull(),
  loadTime: int("load_time").notNull(), // milliseconds
  firstContentfulPaint: int("first_contentful_paint"),
  timeToInteractive: int("time_to_interactive"),
  totalBlockingTime: int("total_blocking_time"),
  cumulativeLayoutShift: int("cumulative_layout_shift"),
  deviceType: text("device_type"), // desktop, mobile, tablet
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// 29. Feature Flags
export const featureFlags = mysqlTable("feature_flags", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  key: varchar("key", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  isEnabled: boolean("is_enabled").default(false),
  rolloutPercentage: int("rollout_percentage").default(0),
  targetUsers: json("target_users"), // specific user IDs or groups
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// 30. Integration Webhooks
export const webhooks = mysqlTable("webhooks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: json("events").notNull(), // array of event types
  secret: text("secret").notNull(),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  failureCount: int("failure_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tags table (for article tagging system)
export const articleTags = mysqlTable("article_tags", {
  articleId: varchar("article_id", { length: 255 }).notNull(),
  tagId: varchar("tag_id", { length: 255 }).notNull(),
});

// Reading history (user engagement tracking)
export const readingHistory = mysqlTable("reading_history", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  readAt: timestamp("read_at").notNull().defaultNow(),
  readDuration: int("read_duration"), // in seconds
  scrollDepth: int("scroll_depth"), // percentage
});

// Bookmarks (save for later)
export const bookmarks = mysqlTable("bookmarks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Article reactions (like, love, etc.)
export const reactions = mysqlTable("reactions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  type: text("type").notNull(), // like, love, wow, sad, angry
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Push subscriptions (for web push notifications)
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }),
  endpoint: text("endpoint").notNull(),
  keys: json("keys").notNull(), // {p256dh, auth}
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Polls (interactive content)
export const polls = mysqlTable("polls", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }),
  question: text("question").notNull(),
  options: json("options").notNull(), // array of {id, text, votes}
  totalVotes: int("total_votes").default(0),
  active: boolean("active").default(true),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Poll votes
export const pollVotes = mysqlTable("poll_votes", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  pollId: varchar("poll_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  optionId: varchar("option_id", { length: 255 }).notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Article versions (revision history)
export const articleVersions = mysqlTable("article_versions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  articleId: varchar("article_id", { length: 255 }).notNull(),
  versionNumber: int("version_number").notNull(),
  titleEn: text("title_en"),
  titleAr: text("title_ar"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  editedBy: varchar("edited_by", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Related articles (manual curation)
export const relatedArticles = mysqlTable("related_articles", {
  articleId: varchar("article_id", { length: 255 }).notNull(),
  relatedArticleId: varchar("related_article_id", { length: 255 }).notNull(),
  order: int("order").default(0),
});

// Analytics table
export const analytics = mysqlTable("analytics", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  date: timestamp("date").notNull(),
  pageViews: int("page_views").default(0),
  uniqueVisitors: int("unique_visitors").default(0),
  articleViews: int("article_views").default(0),
  bounceRate: int("bounce_rate").default(0),
  avgSessionDuration: int("avg_session_duration").default(0),
  topArticles: json("top_articles"),
  topCategories: json("top_categories"),
  trafficSources: json("traffic_sources"),
});

// Menus table (for navigation management)
export const menus = mysqlTable("menus", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  location: text("location").notNull(), // header, footer, sidebar
  items: json("items").notNull(), // array of menu items
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Widgets table (for sidebar/footer widgets)
export const widgets = mysqlTable("widgets", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  type: text("type").notNull(), // popular-posts, categories, tags, newsletter, custom-html
  position: text("position").notNull(), // sidebar-top, sidebar-bottom, footer-1, footer-2
  settings: json("settings"),
  active: boolean("active").default(true),
  order: int("order").default(0),
});

// SEO Analytics table
export const seoAnalytics = mysqlTable("seo_analytics", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  url: text("url").notNull(),
  seoScore: int("seo_score").default(0), // 0-100
  metaTitleScore: int("meta_title_score").default(0),
  metaDescriptionScore: int("meta_description_score").default(0),
  keywordDensity: json("keyword_density"), // {keyword: percentage}
  internalLinks: int("internal_links").default(0),
  externalLinks: int("external_links").default(0),
  imageAltTags: int("image_alt_tags").default(0),
  totalImages: int("total_images").default(0),
  readabilityScore: int("readability_score").default(0),
  mobileOptimized: boolean("mobile_optimized").default(true),
  pageSpeed: int("page_speed").default(0),
  schemaMarkup: boolean("schema_markup").default(false),
  canonicalUrl: text("canonical_url"),
  recommendations: json("recommendations"), // array of improvement suggestions
  lastAnalyzed: timestamp("last_analyzed").notNull().defaultNow(),
});

// SEO Redirects table
export const seoRedirects = mysqlTable("seo_redirects", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  fromPath: varchar("from_path", { length: 500 }).notNull().unique(),
  toPath: text("to_path").notNull(),
  redirectType: int("redirect_type").notNull().default(301), // 301, 302, 307
  active: boolean("active").default(true),
  hits: int("hits").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// SEO Meta Templates table
export const seoMetaTemplates = mysqlTable("seo_meta_templates", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  pageType: text("page_type").notNull(), // article, category, home, author
  titleTemplate: text("title_template").notNull(),
  descriptionTemplate: text("description_template").notNull(),
  keywordsTemplate: text("keywords_template"),
  ogImageTemplate: text("og_image_template"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Robots.txt Rules table
export const robotsRules = mysqlTable("robots_rules", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userAgent: text("user_agent").notNull().default("*"),
  rule: text("rule").notNull(), // Allow, Disallow
  path: text("path").notNull(),
  order: int("order").default(0),
  active: boolean("active").default(true),
});

// Schema.org Markup table
export const schemaMarkup = mysqlTable("schema_markup", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  entityType: text("entity_type").notNull(), // Article, Organization, WebSite, BreadcrumbList
  entityId: varchar("entity_id", { length: 255 }), // article ID, category ID, etc.
  schemaJson: json("schema_json").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Backlinks table
export const backlinks = mysqlTable("backlinks", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  sourceUrl: text("source_url").notNull(),
  targetUrl: text("target_url").notNull(),
  anchorText: text("anchor_text"),
  domainAuthority: int("domain_authority"),
  pageAuthority: int("page_authority"),
  isDoFollow: boolean("is_do_follow").default(true),
  status: text("status").default("active"), // active, broken, lost
  discoveredAt: timestamp("discovered_at").notNull().defaultNow(),
  lastChecked: timestamp("last_checked"),
});

// SEO Keywords table
export const seoKeywords = mysqlTable("seo_keywords", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  keyword: varchar("keyword", { length: 255 }).notNull().unique(),
  searchVolume: int("search_volume").default(0),
  difficulty: int("difficulty").default(0), // 0-100
  cpc: int("cpc").default(0), // cost per click in cents
  ranking: int("ranking"), // current position in search results
  targetUrl: text("target_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true,
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  createdAt: true,
  impressions: true,
  clicks: true,
});

export const insertStreamSchema = createInsertSchema(streams).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNewsletterSchema = createInsertSchema(newsletters).omit({
  id: true,
  subscribedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
});

export const insertMenuSchema = createInsertSchema(menus).omit({
  id: true,
  createdAt: true,
});

export const insertWidgetSchema = createInsertSchema(widgets).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Tag = typeof tags.$inferSelect;
export type InsertTag = z.infer<typeof insertTagSchema>;

export type ArticleWithRelations = typeof articles.$inferSelect & {
  category?: typeof categories.$inferSelect;
  author?: typeof users.$inferSelect;
};

export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;

export type Ad = typeof ads.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;

export type Stream = typeof streams.$inferSelect;
export type InsertStream = z.infer<typeof insertStreamSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = z.infer<typeof insertNewsletterSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;

export type Menu = typeof menus.$inferSelect;
export type InsertMenu = z.infer<typeof insertMenuSchema>;

export type Widget = typeof widgets.$inferSelect;
export type InsertWidget = z.infer<typeof insertWidgetSchema>;

// Additional types for frontend - removed duplicate

export type CommentWithReplies = Comment & {
  replies?: Comment[];
};

export type Language = "en" | "ar";

export type SEOMeta = {
  titleEn?: string;
  titleAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  keywords?: string[];
  ogImage?: string;
};

// Live Streams table - Enhanced
export const liveStreams = mysqlTable("live_streams", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  titleEn: text("title_en").notNull(),
  titleAr: text("title_ar").notNull(),
  descriptionEn: text("description_en"),
  descriptionAr: text("description_ar"),
  
  // Stream Types: 'rtmp' | 'external' | 'screen_share'
  streamType: varchar("stream_type", { length: 20 }).notNull().default('rtmp'),
  
  // RTMP Stream
  rtmpUrl: text("rtmp_url"), // RTMP server URL
  rtmpKey: text("rtmp_key"), // Stream key
  
  // External Stream (YouTube, etc)
  externalUrl: text("external_url"), // YouTube/Vimeo/etc URL
  externalPlatform: varchar("external_platform", { length: 50 }), // 'youtube' | 'vimeo' | 'twitch'
  
  // Screen Share
  screenShareId: text("screen_share_id"), // WebRTC session ID
  
  // Common
  thumbnailUrl: text("thumbnail_url"),
  status: varchar("status", { length: 20 }).notNull().default('scheduled'), // 'scheduled' | 'live' | 'ended' | 'paused'
  isActive: boolean("is_active").default(true),
  viewerCount: int("viewer_count").default(0),
  maxViewers: int("max_viewers").default(0),
  
  // Timestamps
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  duration: int("duration"), // in seconds
  
  // Settings
  enableChat: boolean("enable_chat").default(true),
  enableRecording: boolean("enable_recording").default(false),
  isPublic: boolean("is_public").default(true),
  
  // Metadata
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams);
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;

// Live Stream Chat Messages
export const liveStreamMessages = mysqlTable("live_stream_messages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  streamId: varchar("stream_id", { length: 255 }).notNull(),
  userName: text("user_name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLiveStreamMessageSchema = createInsertSchema(liveStreamMessages);
export type LiveStreamMessage = typeof liveStreamMessages.$inferSelect;
export type InsertLiveStreamMessage = z.infer<typeof insertLiveStreamMessageSchema>;

// Live Stream Likes
export const liveStreamLikes = mysqlTable("live_stream_likes", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  streamId: varchar("stream_id", { length: 255 }).notNull(),
  userName: text("user_name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLiveStreamLikeSchema = createInsertSchema(liveStreamLikes);
export type LiveStreamLike = typeof liveStreamLikes.$inferSelect;
export type InsertLiveStreamLike = z.infer<typeof insertLiveStreamLikeSchema>;

// Ad Requests table
export const adRequests = mysqlTable("ad_requests", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  placement: text("placement").notNull(), // header, sidebar-top, sidebar-middle, in-article, footer
  adUrl: text("ad_url").notNull(), // رابط الإعلان
  imagePath: text("image_path").notNull(), // صورة الإعلان
  duration: int("duration").notNull(), // مدة الإعلان بالأيام
  message: text("message"), // رسالة إضافية
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  adminNotes: text("admin_notes"), // ملاحظات المدير
  reviewedBy: varchar("reviewed_by", { length: 255 }), // معرف المدير الذي راجع الطلب
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAdRequestSchema = createInsertSchema(adRequests);
export type AdRequest = typeof adRequests.$inferSelect;
export type InsertAdRequest = z.infer<typeof insertAdRequestSchema>;
