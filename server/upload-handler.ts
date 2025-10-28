import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  path: string;
}

/**
 * Handle base64 image upload
 */
export async function handleBase64Upload(
  base64Data: string,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    folder?: string;
  } = {}
): Promise<UploadedFile> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
    folder = "uploads",
  } = options;

  try {
    // Extract mime type and data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
      throw new Error("Invalid base64 string");
    }

    const mimeType = matches[1];
    const base64Content = matches[2];

    // Check mime type
    if (!allowedTypes.includes(mimeType)) {
      throw new Error(`File type ${mimeType} is not allowed`);
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, "base64");

    // Check file size
    if (buffer.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`);
    }

    // Generate unique filename
    const ext = mimeType.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    
    // Use correct path for development and production
    const isDev = process.env.NODE_ENV !== 'production';
    const uploadDir = isDev 
      ? path.join(process.cwd(), "public", folder)
      : path.join(process.cwd(), "dist", "public", folder);
    const filePath = path.join(uploadDir, filename);

    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, buffer);
    
    console.log(`✅ File uploaded: ${filePath}`);

    // Return file info
    return {
      id: randomUUID(),
      filename,
      originalName: filename,
      mimeType,
      size: buffer.length,
      url: `/${folder}/${filename}`,
      path: filePath,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

/**
 * Delete uploaded file
 */
export async function deleteUploadedFile(filePath: string): Promise<boolean> {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error("Delete file error:", error);
    return false;
  }
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  buffer: Buffer,
  options: {
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<boolean> {
  // This is a placeholder - in production, use a library like 'sharp' or 'jimp'
  // to validate actual image dimensions
  return true;
}

/**
 * Compress image
 */
export async function compressImage(
  buffer: Buffer,
  quality: number = 80
): Promise<Buffer> {
  // This is a placeholder - in production, use a library like 'sharp'
  // to compress images
  return buffer;
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(
  buffer: Buffer,
  width: number = 200,
  height: number = 200
): Promise<Buffer> {
  // This is a placeholder - in production, use a library like 'sharp'
  // to generate thumbnails
  return buffer;
}
