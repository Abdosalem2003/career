import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer, 
  boolean, 
  jsonb,
  index,
  foreignKey,
  unique
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ============================================
// Users Table with Indexes
// ============================================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("viewer"),
  jobTitle: text("job_title"),
  department: text("department"),
  profileImage: text("profile_image"),
  bio: text("bio"),
  status: text("status").notNull().default("active"),
  lastLogin: timestamp("last_login"),
  lastActivity: timestamp("last_activity"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  twoFactorSecret: text("two_factor_secret"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  // Indexes للبحث السريع
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
  statusIdx: index("users_status_idx").on(table.status),
  createdAtIdx: index("users_created_at_idx").on(table.createdAt),
}));

// ============================================
// Categories Table with Self-Reference
// ============================================
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: varchar("parent_id"),
  bannerImage: text("banner_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  // Index على slug للبحث السريع
  slugIdx: index("categories_slug_idx").on(table.slug),
  parentIdIdx: index("categories_parent_id_idx").on(table.parentId),
  // Foreign key للـ parent category
  parentFk: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: "categories_parent_fk"
  }).onDelete("cascade"),
}));

// ============================================
// Tags Table
// ============================================
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  slugIdx: index("tags_slug_idx").on(table.slug),
}));

// ============================================
// Articles Table with Foreign Keys
// ============================================
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  titleEn: text("title_en"),
  titleAr: text("title_ar"),
  slug: text("slug").notNull().unique(),
  excerptEn: text("excerpt_en"),
  excerptAr: text("excerpt_ar"),
  contentEn: text("content_en"),
  contentAr: text("content_ar"),
  coverImage: text("cover_image"),
  gallery: text("gallery").array(),
  categoryId: varchar("category_id").notNull(),
  authorId: varchar("author_id").notNull(),
  tags: text("tags").array().default(sql`ARRAY[]::text[]`),
  status: text("status").notNull().default("draft"),
  featured: boolean("featured").default(false),
  breaking: boolean("breaking").default(false),
  views: integer("views").default(0),
  readingTime: integer("reading_time").default(0),
  seoMeta: jsonb("seo_meta"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Indexes للبحث والفلترة
  slugIdx: index("articles_slug_idx").on(table.slug),
  categoryIdIdx: index("articles_category_id_idx").on(table.categoryId),
  authorIdIdx: index("articles_author_id_idx").on(table.authorId),
  statusIdx: index("articles_status_idx").on(table.status),
  featuredIdx: index("articles_featured_idx").on(table.featured),
  breakingIdx: index("articles_breaking_idx").on(table.breaking),
  publishedAtIdx: index("articles_published_at_idx").on(table.publishedAt),
  createdAtIdx: index("articles_created_at_idx").on(table.createdAt),
  
  // Foreign Keys
  categoryFk: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [categories.id],
    name: "articles_category_fk"
  }).onDelete("restrict"), // منع حذف category إذا كان له مقالات
  
  authorFk: foreignKey({
    columns: [table.authorId],
    foreignColumns: [users.id],
    name: "articles_author_fk"
  }).onDelete("restrict"), // منع حذف مؤلف إذا كان له مقالات
}));

// ============================================
// Comments Table with Foreign Keys
// ============================================
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  parentId: varchar("parent_id"), // للردود
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  articleIdIdx: index("comments_article_id_idx").on(table.articleId),
  userIdIdx: index("comments_user_id_idx").on(table.userId),
  statusIdx: index("comments_status_idx").on(table.status),
  createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
  
  // Foreign Keys
  articleFk: foreignKey({
    columns: [table.articleId],
    foreignColumns: [articles.id],
    name: "comments_article_fk"
  }).onDelete("cascade"), // حذف التعليقات عند حذف المقال
  
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "comments_user_fk"
  }).onDelete("cascade"),
  
  parentFk: foreignKey({
    columns: [table.parentId],
    foreignColumns: [table.id],
    name: "comments_parent_fk"
  }).onDelete("cascade"),
}));

// ============================================
// Media Table with Foreign Keys
// ============================================
export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  usedInArticle: varchar("used_in_article"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uploadedByIdx: index("media_uploaded_by_idx").on(table.uploadedBy),
  createdAtIdx: index("media_created_at_idx").on(table.createdAt),
  
  uploadedByFk: foreignKey({
    columns: [table.uploadedBy],
    foreignColumns: [users.id],
    name: "media_uploaded_by_fk"
  }).onDelete("restrict"),
  
  usedInArticleFk: foreignKey({
    columns: [table.usedInArticle],
    foreignColumns: [articles.id],
    name: "media_used_in_article_fk"
  }).onDelete("set null"),
}));

// ============================================
// Ads Table with Indexes
// ============================================
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  placement: text("placement").notNull(),
  filePath: text("file_path"),
  url: text("url"),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  budget: integer("budget").default(0),
  spent: integer("spent").default(0),
  targetPages: text("target_pages").array().default(sql`ARRAY['all']::text[]`),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  placementIdx: index("ads_placement_idx").on(table.placement),
  activeIdx: index("ads_active_idx").on(table.active),
  startDateIdx: index("ads_start_date_idx").on(table.startDate),
  endDateIdx: index("ads_end_date_idx").on(table.endDate),
  // Composite index للبحث عن الإعلانات النشطة في موقع معين
  placementActiveIdx: index("ads_placement_active_idx").on(table.placement, table.active),
}));

// ============================================
// User Activity Table with Foreign Keys
// ============================================
export const userActivity = pgTable("user_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  resourceType: text("resource_type"),
  resourceId: varchar("resource_id"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("user_activity_user_id_idx").on(table.userId),
  actionIdx: index("user_activity_action_idx").on(table.action),
  createdAtIdx: index("user_activity_created_at_idx").on(table.createdAt),
  
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
    name: "user_activity_user_fk"
  }).onDelete("cascade"),
}));

// ============================================
// Relations (للاستعلامات المعقدة)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  comments: many(comments),
  media: many(media),
  activities: many(userActivity),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  comments: many(comments),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  articles: many(articles),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
  replies: many(comments),
}));

// ============================================
// Zod Schemas للتحقق
// ============================================

export const insertUserSchema = createInsertSchema(users);
export const insertArticleSchema = createInsertSchema(articles);
export const insertCategorySchema = createInsertSchema(categories);
export const insertCommentSchema = createInsertSchema(comments);
export const insertAdSchema = createInsertSchema(ads);

// ============================================
// Types
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Ad = typeof ads.$inferSelect;
export type NewAd = typeof ads.$inferInsert;
