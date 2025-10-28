/**
 * المدير العام الثابت - Permanent Super Admin
 * مدير الموقع الرئيسي الذي لا يمكن حذفه نهائياً
 */

import { storage } from "./storage";

// معلومات المدير العام الافتراضية
export const SUPER_ADMIN_CONFIG = {
  id: "00000000-0000-0000-0000-000000000001", // ID ثابت
  email: "superadmin@careercanvas.com",
  password: "SuperAdmin@2025!",
  name: "المدير العام",
  role: "super_admin",
  status: "active" as const,
  isPermanent: true, // علامة للمدير الدائم
};

/**
 * التحقق من وجود المدير العام وإنشائه إذا لم يكن موجوداً
 */
export async function ensureSuperAdminExists() {
  try {
    console.log("[SUPER ADMIN] Checking for super admin...");
    
    // التحقق من وجود المدير العام بالبريد الإلكتروني
    const existingAdmin = await storage.getUserByEmail(SUPER_ADMIN_CONFIG.email);
    
    if (existingAdmin) {
      console.log("[SUPER ADMIN] ✅ Super admin exists:", existingAdmin.email);
      
      // التأكد من أن الدور صحيح
      if (existingAdmin.role !== "super_admin") {
        console.log("[SUPER ADMIN] Updating role to super_admin...");
        await storage.updateUser(existingAdmin.id, {
          role: "super_admin",
          status: "active",
        });
      }
      
      return existingAdmin;
    }
    
    // إنشاء المدير العام إذا لم يكن موجوداً
    console.log("[SUPER ADMIN] Creating super admin...");
    
    const superAdmin = await storage.createUser({
      email: SUPER_ADMIN_CONFIG.email,
      password: SUPER_ADMIN_CONFIG.password,
      name: SUPER_ADMIN_CONFIG.name,
      role: SUPER_ADMIN_CONFIG.role,
      status: SUPER_ADMIN_CONFIG.status,
    });
    
    console.log("[SUPER ADMIN] ✅ Super admin created successfully!");
    console.log("[SUPER ADMIN] Email:", SUPER_ADMIN_CONFIG.email);
    console.log("[SUPER ADMIN] Password:", SUPER_ADMIN_CONFIG.password);
    console.log("[SUPER ADMIN] ⚠️  Please change the password after first login!");
    
    return superAdmin;
  } catch (error) {
    console.error("[SUPER ADMIN] ❌ Error ensuring super admin:", error);
    throw error;
  }
}

/**
 * التحقق من أن البريد الإلكتروني هو للمدير العام الدائم
 */
export function isSuperAdminEmail(email: string): boolean {
  return email.toLowerCase() === SUPER_ADMIN_CONFIG.email.toLowerCase();
}

/**
 * التحقق من أن المستخدم هو المدير العام الدائم (بالبريد الإلكتروني)
 */
export async function isPermanentSuperAdmin(userEmail: string): Promise<boolean> {
  return isSuperAdminEmail(userEmail);
}

/**
 * منع حذف المدير العام
 */
export async function canDeleteUser(userEmail: string): Promise<{ allowed: boolean; reason?: string }> {
  if (isSuperAdminEmail(userEmail)) {
    return {
      allowed: false,
      reason: "لا يمكن حذف المدير العام الدائم للموقع",
    };
  }
  return { allowed: true };
}

/**
 * الحصول على معلومات المدير العام (بدون كلمة المرور)
 */
export function getSuperAdminInfo() {
  return {
    id: SUPER_ADMIN_CONFIG.id,
    email: SUPER_ADMIN_CONFIG.email,
    name: SUPER_ADMIN_CONFIG.name,
    role: SUPER_ADMIN_CONFIG.role,
    isPermanent: true,
  };
}
