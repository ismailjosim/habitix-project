import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';

import { serverEnv } from '@/lib/env';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_DOC_SIZE = 15 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const allowedDocTypes = new Set(['application/pdf']);

cloudinary.config({
  cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
  api_key: serverEnv.CLOUDINARY_API_KEY,
  api_secret: serverEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

import type { UploadedImage } from '@/types';
export type { UploadedImage };

export async function uploadImage(
  file: File,
  options: Pick<UploadApiOptions, 'folder' | 'transformation'>
): Promise<UploadedImage> {
  validateImage(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options,
        resource_type: 'image',
        unique_filename: true,
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Cloudinary did not return an upload result'));
          return;
        }
        resolve(uploadResult);
      }
    );

    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadDocument(
  file: File,
  options: Pick<UploadApiOptions, 'folder'>
): Promise<UploadedImage> {
  validateDocument(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        ...options,
        resource_type: 'auto',
        unique_filename: true,
        overwrite: false,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Cloudinary did not return an upload result'));
          return;
        }
        resolve(uploadResult);
      }
    );

    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteImage(
  publicId: string | null | undefined,
  resourceType: 'image' | 'raw' | 'video' = 'image'
) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}

export function extractPublicIdFromUrl(url: string | null | undefined): string | null {
  if (!url || !url.includes('cloudinary.com')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    const afterUpload = parts[1];
    // Remove version prefix if present e.g. v123456789/
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Strip file extension
    const lastDot = withoutVersion.lastIndexOf('.');
    return lastDot === -1 ? withoutVersion : withoutVersion.substring(0, lastDot);
  } catch {
    return null;
  }
}

function validateImage(file: File) {
  if (!allowedImageTypes.has(file.type)) {
    throw new Error('Use a JPG, PNG, WebP, or GIF image');
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be 8 MB or smaller');
  }
  if (file.size === 0) {
    throw new Error('Choose a non-empty image');
  }
}

function validateDocument(file: File) {
  if (!allowedDocTypes.has(file.type) && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF documents are supported');
  }
  if (file.size > MAX_DOC_SIZE) {
    throw new Error('Document must be 15 MB or smaller');
  }
  if (file.size === 0) {
    throw new Error('Choose a non-empty document');
  }
}
