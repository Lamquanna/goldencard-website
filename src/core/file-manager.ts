/**
 * File Manager - Document Storage and Management
 * 
 * Handles file uploads, folder structures, previews,
 * and attachment management across modules.
 */

import { FileItem, FileType, User } from './types';
import { auditLog } from './audit-log';

interface UploadOptions {
  name: string;
  mimeType: string;
  size: number;
  content: File | Blob;
  parentId?: string;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
}

interface CreateFolderOptions {
  name: string;
  parentId?: string;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
}

interface MoveOptions {
  itemId: string;
  targetFolderId?: string;
}

interface FileQuery {
  parentId?: string;
  moduleId?: string;
  entityType?: string;
  entityId?: string;
  mimeTypes?: string[];
  search?: string;
}

type StorageProvider = {
  upload: (file: File | Blob, path: string) => Promise<string>;
  delete: (path: string) => Promise<void>;
  getUrl: (path: string) => Promise<string>;
  getThumbnailUrl?: (path: string) => Promise<string>;
};

type FileEventHandler = (event: FileEvent) => void | Promise<void>;

interface FileEvent {
  type: 'upload' | 'delete' | 'move' | 'rename' | 'folder_create';
  item: FileItem;
  user: User;
  metadata?: Record<string, unknown>;
}

// Preview support configuration
const PREVIEW_SUPPORT: Record<string, 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'office' | 'none'> = {
  // Images
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  // PDFs
  'application/pdf': 'pdf',
  // Videos
  'video/mp4': 'video',
  'video/webm': 'video',
  // Audio
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  // Text
  'text/plain': 'text',
  'text/html': 'text',
  'text/css': 'text',
  'text/javascript': 'text',
  'application/json': 'text',
  'application/xml': 'text',
  // Office
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'office',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'office',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'office',
  'application/msword': 'office',
  'application/vnd.ms-excel': 'office',
  'application/vnd.ms-powerpoint': 'office',
};

class FileManager {
  private files: Map<string, FileItem> = new Map();
  private storageProvider: StorageProvider | null = null;
  private eventHandlers: Set<FileEventHandler> = new Set();
  private maxFileSize = 100 * 1024 * 1024; // 100MB
  private allowedMimeTypes: Set<string> | null = null; // null = allow all

  // ============================================
  // Configuration
  // ============================================

  /**
   * Set storage provider (Google Drive, S3, local, etc.)
   */
  setStorageProvider(provider: StorageProvider): void {
    this.storageProvider = provider;
  }

  /**
   * Set maximum file size
   */
  setMaxFileSize(bytes: number): void {
    this.maxFileSize = bytes;
  }

  /**
   * Set allowed MIME types (null = allow all)
   */
  setAllowedMimeTypes(types: string[] | null): void {
    this.allowedMimeTypes = types ? new Set(types) : null;
  }

  // ============================================
  // File Operations
  // ============================================

  /**
   * Upload a file
   */
  async upload(options: UploadOptions, user: User): Promise<FileItem> {
    // Validate file size
    if (options.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed (${this.formatSize(this.maxFileSize)})`);
    }

    // Validate MIME type
    if (this.allowedMimeTypes && !this.allowedMimeTypes.has(options.mimeType)) {
      throw new Error(`File type "${options.mimeType}" is not allowed`);
    }

    // Generate path
    const path = this.generatePath(options);

    // Upload to storage provider
    let url = '';
    let thumbnailUrl: string | undefined;

    if (this.storageProvider) {
      url = await this.storageProvider.upload(options.content, path);
      
      if (this.storageProvider.getThumbnailUrl && this.isPreviewable(options.mimeType)) {
        try {
          thumbnailUrl = await this.storageProvider.getThumbnailUrl(path);
        } catch {
          // Thumbnail generation failed, continue without it
        }
      }
    }

    // Create file item
    const fileItem: FileItem = {
      id: this.generateId(),
      name: options.name,
      type: 'file',
      mimeType: options.mimeType,
      size: options.size,
      path,
      parentId: options.parentId,
      moduleId: options.moduleId,
      entityType: options.entityType,
      entityId: options.entityId,
      url,
      thumbnailUrl,
      uploadedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.files.set(fileItem.id, fileItem);

    // Emit event
    await this.emitEvent({ type: 'upload', item: fileItem, user });

    // Audit log
    await auditLog.logCreate(user, 'file-manager', 'file', fileItem.id, {
      name: fileItem.name,
      mimeType: fileItem.mimeType,
      size: fileItem.size,
    });

    return fileItem;
  }

  /**
   * Create a folder
   */
  async createFolder(options: CreateFolderOptions, user: User): Promise<FileItem> {
    // Check for duplicate name in same parent
    const existing = this.findByName(options.name, options.parentId);
    if (existing) {
      throw new Error(`A file or folder with name "${options.name}" already exists`);
    }

    const folder: FileItem = {
      id: this.generateId(),
      name: options.name,
      type: 'folder',
      path: this.generateFolderPath(options),
      parentId: options.parentId,
      moduleId: options.moduleId,
      entityType: options.entityType,
      entityId: options.entityId,
      uploadedBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.files.set(folder.id, folder);

    // Emit event
    await this.emitEvent({ type: 'folder_create', item: folder, user });

    return folder;
  }

  /**
   * Delete a file or folder
   */
  async delete(itemId: string, user: User): Promise<void> {
    const item = this.files.get(itemId);
    if (!item) {
      throw new Error(`Item "${itemId}" not found`);
    }

    // If folder, delete all contents recursively
    if (item.type === 'folder') {
      const children = this.getChildren(itemId);
      for (const child of children) {
        await this.delete(child.id, user);
      }
    }

    // Delete from storage
    if (this.storageProvider && item.type === 'file') {
      await this.storageProvider.delete(item.path);
    }

    this.files.delete(itemId);

    // Emit event
    await this.emitEvent({ type: 'delete', item, user });

    // Audit log
    await auditLog.logDelete(user, 'file-manager', item.type, item.id, {
      name: item.name,
      path: item.path,
    });
  }

  /**
   * Move a file or folder
   */
  async move(options: MoveOptions, user: User): Promise<FileItem> {
    const item = this.files.get(options.itemId);
    if (!item) {
      throw new Error(`Item "${options.itemId}" not found`);
    }

    // Validate target folder
    if (options.targetFolderId) {
      const targetFolder = this.files.get(options.targetFolderId);
      if (!targetFolder || targetFolder.type !== 'folder') {
        throw new Error(`Target folder "${options.targetFolderId}" not found`);
      }

      // Prevent moving folder into itself or its children
      if (item.type === 'folder' && this.isDescendant(options.targetFolderId, item.id)) {
        throw new Error('Cannot move folder into itself or its children');
      }
    }

    // Check for duplicate name
    const existing = this.findByName(item.name, options.targetFolderId);
    if (existing && existing.id !== item.id) {
      throw new Error(`A file or folder with name "${item.name}" already exists in target location`);
    }

    const updatedItem: FileItem = {
      ...item,
      parentId: options.targetFolderId,
      updatedAt: new Date(),
    };

    this.files.set(item.id, updatedItem);

    // Emit event
    await this.emitEvent({ 
      type: 'move', 
      item: updatedItem, 
      user,
      metadata: { fromParentId: item.parentId, toParentId: options.targetFolderId },
    });

    return updatedItem;
  }

  /**
   * Rename a file or folder
   */
  async rename(itemId: string, newName: string, user: User): Promise<FileItem> {
    const item = this.files.get(itemId);
    if (!item) {
      throw new Error(`Item "${itemId}" not found`);
    }

    // Check for duplicate name
    const existing = this.findByName(newName, item.parentId);
    if (existing && existing.id !== item.id) {
      throw new Error(`A file or folder with name "${newName}" already exists`);
    }

    const oldName = item.name;
    const updatedItem: FileItem = {
      ...item,
      name: newName,
      updatedAt: new Date(),
    };

    this.files.set(item.id, updatedItem);

    // Emit event
    await this.emitEvent({ 
      type: 'rename', 
      item: updatedItem, 
      user,
      metadata: { oldName, newName },
    });

    return updatedItem;
  }

  /**
   * Copy a file
   */
  async copy(itemId: string, targetFolderId: string | undefined, user: User): Promise<FileItem> {
    const item = this.files.get(itemId);
    if (!item) {
      throw new Error(`Item "${itemId}" not found`);
    }

    if (item.type === 'folder') {
      throw new Error('Folder copying is not supported');
    }

    // Generate unique name if needed
    let newName = item.name;
    let existing = this.findByName(newName, targetFolderId);
    let counter = 1;
    while (existing) {
      const ext = this.getExtension(item.name);
      const baseName = item.name.replace(ext, '');
      newName = `${baseName} (${counter})${ext}`;
      existing = this.findByName(newName, targetFolderId);
      counter++;
    }

    const newItem: FileItem = {
      ...item,
      id: this.generateId(),
      name: newName,
      parentId: targetFolderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadedBy: user.id,
    };

    this.files.set(newItem.id, newItem);

    return newItem;
  }

  // ============================================
  // Query Methods
  // ============================================

  /**
   * Get file by ID
   */
  get(itemId: string): FileItem | undefined {
    return this.files.get(itemId);
  }

  /**
   * List files and folders
   */
  list(query: FileQuery = {}): FileItem[] {
    let items = Array.from(this.files.values());

    // Filter by parent
    if (query.parentId !== undefined) {
      items = items.filter(i => i.parentId === query.parentId);
    }

    // Filter by module
    if (query.moduleId) {
      items = items.filter(i => i.moduleId === query.moduleId);
    }

    // Filter by entity
    if (query.entityType && query.entityId) {
      items = items.filter(i => 
        i.entityType === query.entityType && i.entityId === query.entityId
      );
    }

    // Filter by MIME types
    if (query.mimeTypes && query.mimeTypes.length > 0) {
      items = items.filter(i => 
        i.type === 'folder' || (i.mimeType && query.mimeTypes!.includes(i.mimeType))
      );
    }

    // Search by name
    if (query.search) {
      const search = query.search.toLowerCase();
      items = items.filter(i => i.name.toLowerCase().includes(search));
    }

    // Sort: folders first, then by name
    items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return items;
  }

  /**
   * Get children of a folder
   */
  getChildren(folderId: string): FileItem[] {
    return this.list({ parentId: folderId });
  }

  /**
   * Get path to item (breadcrumb)
   */
  getPath(itemId: string): FileItem[] {
    const path: FileItem[] = [];
    let current = this.files.get(itemId);

    while (current) {
      path.unshift(current);
      current = current.parentId ? this.files.get(current.parentId) : undefined;
    }

    return path;
  }

  /**
   * Get files attached to an entity
   */
  getEntityFiles(entityType: string, entityId: string): FileItem[] {
    return this.list({ entityType, entityId });
  }

  /**
   * Find by name in a folder
   */
  private findByName(name: string, parentId?: string): FileItem | undefined {
    return Array.from(this.files.values()).find(
      i => i.name === name && i.parentId === parentId
    );
  }

  /**
   * Check if a folder is a descendant of another
   */
  private isDescendant(itemId: string, ancestorId: string): boolean {
    let current = this.files.get(itemId);
    while (current) {
      if (current.id === ancestorId) return true;
      current = current.parentId ? this.files.get(current.parentId) : undefined;
    }
    return false;
  }

  // ============================================
  // Preview Support
  // ============================================

  /**
   * Check if file type is previewable
   */
  isPreviewable(mimeType: string): boolean {
    return PREVIEW_SUPPORT[mimeType] !== undefined && PREVIEW_SUPPORT[mimeType] !== 'none';
  }

  /**
   * Get preview type for a file
   */
  getPreviewType(mimeType: string): 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'office' | 'none' {
    return PREVIEW_SUPPORT[mimeType] || 'none';
  }

  /**
   * Get file URL for preview/download
   */
  async getFileUrl(itemId: string): Promise<string> {
    const item = this.files.get(itemId);
    if (!item) {
      throw new Error(`Item "${itemId}" not found`);
    }

    if (item.type === 'folder') {
      throw new Error('Cannot get URL for folder');
    }

    if (item.url) {
      return item.url;
    }

    if (this.storageProvider) {
      return this.storageProvider.getUrl(item.path);
    }

    throw new Error('No storage provider configured');
  }

  // ============================================
  // Events
  // ============================================

  /**
   * Subscribe to file events
   */
  onEvent(handler: FileEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  private async emitEvent(event: FileEvent): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('File event handler error:', error);
      }
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private generateId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePath(options: UploadOptions): string {
    const parts: string[] = [];
    
    if (options.moduleId) {
      parts.push(options.moduleId);
    }
    
    if (options.entityType && options.entityId) {
      parts.push(options.entityType, options.entityId);
    }
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    const safeName = this.sanitizeFileName(options.name);
    parts.push(`${timestamp}_${safeName}`);

    return parts.join('/');
  }

  private generateFolderPath(options: CreateFolderOptions): string {
    const parts: string[] = [];
    
    if (options.parentId) {
      const parent = this.files.get(options.parentId);
      if (parent) {
        parts.push(parent.path);
      }
    } else if (options.moduleId) {
      parts.push(options.moduleId);
    }
    
    parts.push(this.sanitizeFileName(options.name));
    return parts.join('/');
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot > 0 ? filename.substring(lastDot) : '';
  }

  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): { totalFiles: number; totalFolders: number; totalSize: number } {
    const files = Array.from(this.files.values());
    return {
      totalFiles: files.filter(f => f.type === 'file').length,
      totalFolders: files.filter(f => f.type === 'folder').length,
      totalSize: files.reduce((sum, f) => sum + (f.size || 0), 0),
    };
  }
}

// Singleton instance
export const fileManager = new FileManager();

export type { UploadOptions, CreateFolderOptions, MoveOptions, FileQuery, StorageProvider, FileEvent };
