import type { UploadResponse } from '@/types';
export type { UploadResponse };

/**
 * Client-side file upload utility calling /api/upload
 */
export async function uploadFile(
  file: File,
  type: 'avatar' | 'team' | 'help-desk' | 'material' = 'avatar'
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to upload file');
  }

  return data;
}

/**
 * Delete a file from Cloudinary via /api/upload
 */
export async function deleteUploadedFile(
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<boolean> {
  const response = await fetch('/api/upload', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, resourceType }),
  });

  const data = await response.json();
  return Boolean(data.success);
}
