// Firebase Storage Operations
// Handles file uploads and downloads for chat attachments and project files

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { getStorageInstance, STORAGE_PATHS } from './config';

// Helper to get Storage instance
function getStorage() {
  return getStorageInstance();
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  url: string;
  path: string;
}

// ============================================
// UPLOAD OPERATIONS
// ============================================

/**
 * Upload file with progress tracking
 */
export function uploadFileWithProgress(
  path: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
  onComplete?: (result: UploadedFile) => void,
  onError?: (error: Error) => void
): UploadTask {
  const storageRef = ref(getStorage(), path);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });

  uploadTask.on(
    'state_changed',
    (snapshot: UploadTaskSnapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress?.({
        bytesTransferred: snapshot.bytesTransferred,
        totalBytes: snapshot.totalBytes,
        progress: Math.round(progress),
        state: snapshot.state as UploadProgress['state'],
      });
    },
    (error) => {
      console.error('Upload error:', error);
      onError?.(error);
    },
    async () => {
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      onComplete?.({
        name: file.name,
        type: file.type,
        size: file.size,
        url: downloadURL,
        path: path,
      });
    }
  );

  return uploadTask;
}

/**
 * Simple upload without progress tracking
 */
export async function uploadFile(path: string, file: File): Promise<UploadedFile> {
  const storageRef = ref(getStorage(), path);
  
  await uploadBytes(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  });
  
  const downloadURL = await getDownloadURL(storageRef);
  
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    url: downloadURL,
    path: path,
  };
}

// ============================================
// SPECIFIC UPLOAD FUNCTIONS
// ============================================

/**
 * Upload user avatar
 */
export async function uploadAvatar(userId: string, file: File): Promise<UploadedFile> {
  const extension = file.name.split('.').pop();
  const path = `${STORAGE_PATHS.AVATARS}/${userId}/avatar.${extension}`;
  return uploadFile(path, file);
}

/**
 * Upload chat attachment
 */
export async function uploadChatAttachment(
  chatId: string,
  messageId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${STORAGE_PATHS.CHAT_MEDIA}/${chatId}/${messageId}/${timestamp}_${safeName}`;
  
  return new Promise((resolve, reject) => {
    uploadFileWithProgress(
      path,
      file,
      onProgress,
      resolve,
      reject
    );
  });
}

/**
 * Upload project file
 */
export async function uploadProjectFile(
  projectId: string,
  taskId: string | null,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadedFile> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const subPath = taskId ? `tasks/${taskId}` : 'general';
  const path = `${STORAGE_PATHS.PROJECT_FILES}/${projectId}/${subPath}/${timestamp}_${safeName}`;
  
  return new Promise((resolve, reject) => {
    uploadFileWithProgress(
      path,
      file,
      onProgress,
      resolve,
      reject
    );
  });
}

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(getStorage(), path);
  await deleteObject(storageRef);
}

/**
 * Delete all files in a folder
 */
export async function deleteFolder(folderPath: string): Promise<void> {
  const folderRef = ref(getStorage(), folderPath);
  const listResult = await listAll(folderRef);
  
  // Delete all files
  await Promise.all(listResult.items.map(item => deleteObject(item)));
  
  // Recursively delete subfolders
  await Promise.all(listResult.prefixes.map(prefix => deleteFolder(prefix.fullPath)));
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get download URL for a file path
 */
export async function getFileURL(path: string): Promise<string> {
  const storageRef = ref(getStorage(), path);
  return getDownloadURL(storageRef);
}

/**
 * List files in a folder
 */
export async function listFiles(folderPath: string): Promise<{ name: string; path: string }[]> {
  const folderRef = ref(getStorage(), folderPath);
  const listResult = await listAll(folderRef);
  
  return listResult.items.map(item => ({
    name: item.name,
    path: item.fullPath,
  }));
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes } = options; // Default 10MB
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    return { valid: false, error: `File vượt quá ${maxSizeMB}MB` };
  }
  
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type || '';
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return fileType.startsWith(type.replace('/*', '/'));
      }
      if (type.startsWith('.')) {
        return extension === type.slice(1);
      }
      return fileType === type;
    });
    
    if (!isAllowed) {
      return { valid: false, error: `Loại file không được hỗ trợ` };
    }
  }
  
  return { valid: true };
}

/**
 * Compress image before upload
 */
export async function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Could not compress image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail for image
 */
export async function generateThumbnail(file: File, size: number = 200): Promise<File> {
  return compressImage(file, size, 0.7);
}

// ============================================
// FILE TYPE HELPERS
// ============================================

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

export const ALLOWED_CHAT_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
];

export function getFileCategory(mimeType: string): 'image' | 'video' | 'document' | 'other' {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return 'video';
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) return 'document';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
