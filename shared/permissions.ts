// ============================================
// نظام الصلاحيات الشامل - 35 صلاحية
// Comprehensive Permissions System - 35 Permissions
// ============================================

export enum Permission {
  // ========== إدارة المقالات (Articles Management) ==========
  VIEW_ARTICLES = 'view_articles',
  CREATE_ARTICLES = 'create_articles',
  EDIT_OWN_ARTICLES = 'edit_own_articles',
  EDIT_ALL_ARTICLES = 'edit_all_articles',
  DELETE_OWN_ARTICLES = 'delete_own_articles',
  DELETE_ALL_ARTICLES = 'delete_all_articles',
  PUBLISH_ARTICLES = 'publish_articles',
  APPROVE_ARTICLES = 'approve_articles',
  FEATURE_ARTICLES = 'feature_articles',
  
  // ========== إدارة التعليقات (Comments Management) ==========
  VIEW_COMMENTS = 'view_comments',
  MODERATE_COMMENTS = 'moderate_comments',
  DELETE_COMMENTS = 'delete_comments',
  
  // ========== إدارة الفئات (Categories Management) ==========
  VIEW_CATEGORIES = 'view_categories',
  CREATE_CATEGORIES = 'create_categories',
  EDIT_CATEGORIES = 'edit_categories',
  DELETE_CATEGORIES = 'delete_categories',
  
  // ========== إدارة المستخدمين (Users Management) ==========
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_PERMISSIONS = 'manage_permissions',
  
  // ========== إدارة الوسائط (Media Management) ==========
  VIEW_MEDIA = 'view_media',
  UPLOAD_MEDIA = 'upload_media',
  DELETE_MEDIA = 'delete_media',
  
  // ========== إدارة الإعلانات (Ads Management) ==========
  VIEW_ADS = 'view_ads',
  CREATE_ADS = 'create_ads',
  EDIT_ADS = 'edit_ads',
  DELETE_ADS = 'delete_ads',
  
  // ========== الإحصائيات والتقارير (Analytics & Reports) ==========
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',
  
  // ========== إعدادات النظام (System Settings) ==========
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',
  MANAGE_SECURITY = 'manage_security',
}

// ============================================
// الأدوار الستة مع صلاحياتها
// Six Roles with Their Permissions
// ============================================

export enum Role {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  MODERATOR = 'moderator',
  VIEWER = 'viewer',
}

// ============================================
// توزيع الصلاحيات على الأدوار
// Permissions Distribution by Role
// ============================================

export const RolePermissions: Record<Role, Permission[]> = {
  // 🔴 Super Admin - تحكم كامل (35 صلاحية)
  [Role.SUPER_ADMIN]: [
    Permission.VIEW_ARTICLES,
    Permission.CREATE_ARTICLES,
    Permission.EDIT_OWN_ARTICLES,
    Permission.EDIT_ALL_ARTICLES,
    Permission.DELETE_OWN_ARTICLES,
    Permission.DELETE_ALL_ARTICLES,
    Permission.PUBLISH_ARTICLES,
    Permission.APPROVE_ARTICLES,
    Permission.FEATURE_ARTICLES,
    Permission.VIEW_COMMENTS,
    Permission.MODERATE_COMMENTS,
    Permission.DELETE_COMMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORIES,
    Permission.EDIT_CATEGORIES,
    Permission.DELETE_CATEGORIES,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_PERMISSIONS,
    Permission.VIEW_MEDIA,
    Permission.UPLOAD_MEDIA,
    Permission.DELETE_MEDIA,
    Permission.VIEW_ADS,
    Permission.CREATE_ADS,
    Permission.EDIT_ADS,
    Permission.DELETE_ADS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_SETTINGS,
    Permission.EDIT_SETTINGS,
    Permission.MANAGE_SECURITY,
  ],

  // 🟠 Admin - إدارة شاملة (28 صلاحية)
  [Role.ADMIN]: [
    Permission.VIEW_ARTICLES,
    Permission.CREATE_ARTICLES,
    Permission.EDIT_OWN_ARTICLES,
    Permission.EDIT_ALL_ARTICLES,
    Permission.DELETE_OWN_ARTICLES,
    Permission.DELETE_ALL_ARTICLES,
    Permission.PUBLISH_ARTICLES,
    Permission.APPROVE_ARTICLES,
    Permission.FEATURE_ARTICLES,
    Permission.VIEW_COMMENTS,
    Permission.MODERATE_COMMENTS,
    Permission.DELETE_COMMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORIES,
    Permission.EDIT_CATEGORIES,
    Permission.DELETE_CATEGORIES,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.VIEW_MEDIA,
    Permission.UPLOAD_MEDIA,
    Permission.DELETE_MEDIA,
    Permission.VIEW_ADS,
    Permission.CREATE_ADS,
    Permission.EDIT_ADS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_SETTINGS,
  ],

  // 🟡 Editor - إدارة المحتوى (18 صلاحية)
  [Role.EDITOR]: [
    Permission.VIEW_ARTICLES,
    Permission.CREATE_ARTICLES,
    Permission.EDIT_OWN_ARTICLES,
    Permission.EDIT_ALL_ARTICLES,
    Permission.DELETE_OWN_ARTICLES,
    Permission.PUBLISH_ARTICLES,
    Permission.APPROVE_ARTICLES,
    Permission.FEATURE_ARTICLES,
    Permission.VIEW_COMMENTS,
    Permission.MODERATE_COMMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORIES,
    Permission.EDIT_CATEGORIES,
    Permission.VIEW_MEDIA,
    Permission.UPLOAD_MEDIA,
    Permission.VIEW_ADS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
  ],

  // 🟢 Author - كاتب المقالات (8 صلاحيات)
  [Role.AUTHOR]: [
    Permission.VIEW_ARTICLES,
    Permission.CREATE_ARTICLES,
    Permission.EDIT_OWN_ARTICLES,
    Permission.DELETE_OWN_ARTICLES,
    Permission.VIEW_COMMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_MEDIA,
    Permission.UPLOAD_MEDIA,
  ],

  // 🔵 Moderator - مشرف المحتوى (10 صلاحيات)
  [Role.MODERATOR]: [
    Permission.VIEW_ARTICLES,
    Permission.VIEW_COMMENTS,
    Permission.MODERATE_COMMENTS,
    Permission.DELETE_COMMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_MEDIA,
    Permission.VIEW_ADS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
    Permission.APPROVE_ARTICLES,
  ],

  // ⚪ Viewer - قراءة فقط (7 صلاحيات)
  [Role.VIEWER]: [
    Permission.VIEW_ARTICLES,
    Permission.VIEW_COMMENTS,
    Permission.VIEW_CATEGORIES,
    Permission.VIEW_MEDIA,
    Permission.VIEW_ADS,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_REPORTS,
  ],
};

// ============================================
// أسماء الصلاحيات بالعربية
// Permission Names in Arabic
// ============================================

export const PermissionLabels: Record<Permission, { ar: string; en: string }> = {
  [Permission.VIEW_ARTICLES]: { ar: 'عرض المقالات', en: 'View Articles' },
  [Permission.CREATE_ARTICLES]: { ar: 'إنشاء المقالات', en: 'Create Articles' },
  [Permission.EDIT_OWN_ARTICLES]: { ar: 'تعديل مقالاتي', en: 'Edit Own Articles' },
  [Permission.EDIT_ALL_ARTICLES]: { ar: 'تعديل جميع المقالات', en: 'Edit All Articles' },
  [Permission.DELETE_OWN_ARTICLES]: { ar: 'حذف مقالاتي', en: 'Delete Own Articles' },
  [Permission.DELETE_ALL_ARTICLES]: { ar: 'حذف جميع المقالات', en: 'Delete All Articles' },
  [Permission.PUBLISH_ARTICLES]: { ar: 'نشر المقالات', en: 'Publish Articles' },
  [Permission.APPROVE_ARTICLES]: { ar: 'الموافقة على المقالات', en: 'Approve Articles' },
  [Permission.FEATURE_ARTICLES]: { ar: 'تمييز المقالات', en: 'Feature Articles' },
  [Permission.VIEW_COMMENTS]: { ar: 'عرض التعليقات', en: 'View Comments' },
  [Permission.MODERATE_COMMENTS]: { ar: 'إدارة التعليقات', en: 'Moderate Comments' },
  [Permission.DELETE_COMMENTS]: { ar: 'حذف التعليقات', en: 'Delete Comments' },
  [Permission.VIEW_CATEGORIES]: { ar: 'عرض الفئات', en: 'View Categories' },
  [Permission.CREATE_CATEGORIES]: { ar: 'إنشاء الفئات', en: 'Create Categories' },
  [Permission.EDIT_CATEGORIES]: { ar: 'تعديل الفئات', en: 'Edit Categories' },
  [Permission.DELETE_CATEGORIES]: { ar: 'حذف الفئات', en: 'Delete Categories' },
  [Permission.VIEW_USERS]: { ar: 'عرض المستخدمين', en: 'View Users' },
  [Permission.CREATE_USERS]: { ar: 'إنشاء المستخدمين', en: 'Create Users' },
  [Permission.EDIT_USERS]: { ar: 'تعديل المستخدمين', en: 'Edit Users' },
  [Permission.DELETE_USERS]: { ar: 'حذف المستخدمين', en: 'Delete Users' },
  [Permission.MANAGE_ROLES]: { ar: 'إدارة الأدوار', en: 'Manage Roles' },
  [Permission.MANAGE_PERMISSIONS]: { ar: 'إدارة الصلاحيات', en: 'Manage Permissions' },
  [Permission.VIEW_MEDIA]: { ar: 'عرض الوسائط', en: 'View Media' },
  [Permission.UPLOAD_MEDIA]: { ar: 'رفع الوسائط', en: 'Upload Media' },
  [Permission.DELETE_MEDIA]: { ar: 'حذف الوسائط', en: 'Delete Media' },
  [Permission.VIEW_ADS]: { ar: 'عرض الإعلانات', en: 'View Ads' },
  [Permission.CREATE_ADS]: { ar: 'إنشاء الإعلانات', en: 'Create Ads' },
  [Permission.EDIT_ADS]: { ar: 'تعديل الإعلانات', en: 'Edit Ads' },
  [Permission.DELETE_ADS]: { ar: 'حذف الإعلانات', en: 'Delete Ads' },
  [Permission.VIEW_ANALYTICS]: { ar: 'عرض الإحصائيات', en: 'View Analytics' },
  [Permission.VIEW_REPORTS]: { ar: 'عرض التقارير', en: 'View Reports' },
  [Permission.EXPORT_DATA]: { ar: 'تصدير البيانات', en: 'Export Data' },
  [Permission.VIEW_SETTINGS]: { ar: 'عرض الإعدادات', en: 'View Settings' },
  [Permission.EDIT_SETTINGS]: { ar: 'تعديل الإعدادات', en: 'Edit Settings' },
  [Permission.MANAGE_SECURITY]: { ar: 'إدارة الأمان', en: 'Manage Security' },
};

// ============================================
// أسماء الأدوار بالعربية
// Role Names in Arabic
// ============================================

export const RoleLabels: Record<Role, { ar: string; en: string; color: string; icon: string }> = {
  [Role.SUPER_ADMIN]: { 
    ar: 'مدير عام', 
    en: 'Super Admin', 
    color: 'red',
    icon: '👑'
  },
  [Role.ADMIN]: { 
    ar: 'مدير', 
    en: 'Admin', 
    color: 'orange',
    icon: '⚡'
  },
  [Role.EDITOR]: { 
    ar: 'محرر', 
    en: 'Editor', 
    color: 'yellow',
    icon: '✏️'
  },
  [Role.AUTHOR]: { 
    ar: 'كاتب', 
    en: 'Author', 
    color: 'green',
    icon: '📝'
  },
  [Role.MODERATOR]: { 
    ar: 'مشرف', 
    en: 'Moderator', 
    color: 'blue',
    icon: '🛡️'
  },
  [Role.VIEWER]: { 
    ar: 'مشاهد', 
    en: 'Viewer', 
    color: 'gray',
    icon: '👁️'
  },
};

// ============================================
// دوال مساعدة للتحقق من الصلاحيات
// Helper Functions for Permission Checking
// ============================================

/**
 * التحقق من صلاحية المستخدم
 * Check if user has permission
 */
export function hasPermission(userRole: Role, permission: Permission): boolean {
  const permissions = RolePermissions[userRole];
  return permissions.includes(permission);
}

/**
 * التحقق من عدة صلاحيات
 * Check if user has all permissions
 */
export function hasAllPermissions(userRole: Role, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * التحقق من أي صلاحية من القائمة
 * Check if user has any of the permissions
 */
export function hasAnyPermission(userRole: Role, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * الحصول على جميع صلاحيات الدور
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return RolePermissions[role];
}

/**
 * التحقق من مستوى الدور
 * Check if role has higher or equal level
 */
export function hasRoleLevel(userRole: Role, requiredRole: Role): boolean {
  const roleLevels: Record<Role, number> = {
    [Role.SUPER_ADMIN]: 6,
    [Role.ADMIN]: 5,
    [Role.EDITOR]: 4,
    [Role.AUTHOR]: 3,
    [Role.MODERATOR]: 2,
    [Role.VIEWER]: 1,
  };
  
  return roleLevels[userRole] >= roleLevels[requiredRole];
}
