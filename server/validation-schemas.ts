import { z } from 'zod';

// ============================================
// User Validation Schemas
// ============================================

export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .email('Invalid email address')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'moderator', 'viewer']).optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'banned']).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().toLowerCase().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['super_admin', 'admin', 'editor', 'author', 'moderator', 'viewer']).optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'banned']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ============================================
// Article Validation Schemas
// ============================================

export const createArticleSchema = z.object({
  titleEn: z.string().min(5, 'English title must be at least 5 characters').optional(),
  titleAr: z.string().min(5, 'Arabic title must be at least 5 characters').optional(),
  contentEn: z.string().min(50, 'English content must be at least 50 characters').optional(),
  contentAr: z.string().min(50, 'Arabic content must be at least 50 characters').optional(),
  excerptEn: z.string().max(300, 'English excerpt must be less than 300 characters').optional(),
  excerptAr: z.string().max(300, 'Arabic excerpt must be less than 300 characters').optional(),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  coverImage: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  featured: z.boolean().optional(),
  breaking: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateArticleSchema = createArticleSchema.partial();

// ============================================
// Category Validation Schemas
// ============================================

export const createCategorySchema = z.object({
  nameEn: z.string().min(2, 'English name must be at least 2 characters'),
  nameAr: z.string().min(2, 'Arabic name must be at least 2 characters'),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  parentId: z.string().uuid().optional(),
  bannerImage: z.string().url().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// ============================================
// Ad Validation Schemas
// ============================================

export const createAdSchema = z.object({
  name: z.string().min(3, 'Ad name must be at least 3 characters'),
  placement: z.enum(['header', 'sidebar-top', 'sidebar-middle', 'in-article', 'footer']),
  filePath: z.string().min(1, 'Image is required'),
  url: z.string().url('Invalid URL').optional(),
  active: z.boolean().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().min(0).optional(),
  targetPages: z.array(z.string()).optional(),
});

export const updateAdSchema = createAdSchema.partial();

// ============================================
// Comment Validation Schemas
// ============================================

export const createCommentSchema = z.object({
  articleId: z.string().uuid('Invalid article ID'),
  content: z.string()
    .min(5, 'Comment must be at least 5 characters')
    .max(1000, 'Comment must be less than 1000 characters'),
  parentId: z.string().uuid().optional(),
});

// ============================================
// Settings Validation Schemas
// ============================================

export const updateSettingsSchema = z.object({
  siteName: z.string().min(2).optional(),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
  allowRegistration: z.boolean().optional(),
  requireEmailVerification: z.boolean().optional(),
  defaultLanguage: z.enum(['ar', 'en']).optional(),
});

// ============================================
// Pagination Schema
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ============================================
// ID Validation
// ============================================

export const idSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// ============================================
// Helper function للتحقق من البيانات
// ============================================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// ============================================
// Middleware للتحقق من البيانات
// ============================================

export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = validateData(schema, req.body);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors?.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    // استبدال req.body بالبيانات المتحقق منها
    req.body = result.data;
    next();
  };
}

export function validateParams(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = validateData(schema, req.params);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid parameters',
        details: result.errors?.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    req.params = result.data;
    next();
  };
}

export function validateQuery(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    const result = validateData(schema, req.query);
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: result.errors?.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    req.query = result.data;
    next();
  };
}
