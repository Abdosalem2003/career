
import { minify } from 'terser';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Code compression utilities
export async function compressJavaScript(code: string): Promise<string> {
  const result = await minify(code, {
    compress: {
      dead_code: true,
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: {
      toplevel: true,
    },
    format: {
      comments: false,
    },
  });
  return result.code || code;
}

export async function compressCSS(css: string): Promise<string> {
  // Simple CSS minification
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around special chars
    .trim();
}

export async function compressHTML(html: string): Promise<string> {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/>\s+</g, '><') // Remove spaces between tags
    .replace(/\s+/g, ' ') // Replace multiple spaces
    .trim();
}

// Image compression utilities
export interface ImageCompressionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export async function compressImage(
  inputPath: string,
  outputPath: string,
  options: ImageCompressionOptions = {}
): Promise<{ originalSize: number; compressedSize: number; ratio: string }> {
  const {
    quality = 85,
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
  } = options;

  const inputStats = await fs.stat(inputPath);
  const originalSize = inputStats.size;

  let pipeline = sharp(inputPath);

  // Resize if needed
  pipeline = pipeline.resize(maxWidth, maxHeight, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  // Apply format-specific compression
  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality, compressionLevel: 9, progressive: true });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 6 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality, effort: 6 });
      break;
  }

  await pipeline.toFile(outputPath);

  const outputStats = await fs.stat(outputPath);
  const compressedSize = outputStats.size;
  const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(2);

  return { originalSize, compressedSize, ratio: `${ratio}%` };
}

// Batch image compression
export async function compressImagesInDirectory(
  inputDir: string,
  outputDir: string,
  options: ImageCompressionOptions = {}
): Promise<Array<{ file: string; result: any }>> {
  const files = await fs.readdir(inputDir);
  const imageFiles = files.filter((file) =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  const results = [];

  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file.replace(/\.\w+$/, `.${options.format || 'webp'}`));

    try {
      const result = await compressImage(inputPath, outputPath, options);
      results.push({ file, result });
    } catch (error) {
      console.error(`Error compressing ${file}:`, error);
      results.push({ file, result: { error: (error as Error).message } });
    }
  }

  return results;
}

// Generate responsive image variants
export async function generateResponsiveImages(
  inputPath: string,
  outputDir: string
): Promise<string[]> {
  const sizes = [320, 640, 768, 1024, 1366, 1920];
  const outputPaths: string[] = [];

  const filename = path.basename(inputPath, path.extname(inputPath));

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `${filename}-${size}w.webp`);
    await sharp(inputPath)
      .resize(size, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);
    outputPaths.push(outputPath);
  }

  return outputPaths;
}

// Create thumbnail
export async function createThumbnail(
  inputPath: string,
  outputPath: string,
  size: number = 200
): Promise<void> {
  await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(outputPath);
}

// Optimize image for web
export async function optimizeForWeb(inputPath: string, outputPath: string): Promise<any> {
  const ext = path.extname(inputPath).toLowerCase();
  let pipeline = sharp(inputPath);

  // Auto-orient based on EXIF data
  pipeline = pipeline.rotate();

  // Remove metadata
  pipeline = pipeline.withMetadata({
    orientation: undefined,
  });

  // Apply format-specific optimization
  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 85, progressive: true, mozjpeg: true });
  } else if (ext === '.png') {
    pipeline = pipeline.png({ quality: 85, compressionLevel: 9 });
  } else {
    // Convert to WebP for other formats
    pipeline = pipeline.webp({ quality: 85 });
  }

  const info = await pipeline.toFile(outputPath);
  return info;
}
