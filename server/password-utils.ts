import bcrypt from 'bcrypt';
import { logError, logDebug } from './logger';

// عدد جولات التشفير (كلما زاد كان أكثر أماناً لكن أبطأ)
const SALT_ROUNDS = 10;

/**
 * تشفير كلمة المرور
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    logDebug('Hashing password');
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return hash;
  } catch (error) {
    logError('Failed to hash password', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * التحقق من كلمة المرور
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    logDebug('Verifying password');
    const isValid = await bcrypt.compare(password, hash);
    return isValid;
  } catch (error) {
    logError('Failed to verify password', error);
    return false;
  }
}

/**
 * التحقق من قوة كلمة المرور
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * توليد كلمة مرور عشوائية قوية
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*(),.?":{}|<>';
  const all = uppercase + lowercase + numbers + special;
  
  let password = '';
  
  // ضمان وجود حرف واحد على الأقل من كل نوع
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // ملء الباقي عشوائياً
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }
  
  // خلط الأحرف
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
