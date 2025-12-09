/**
 * HOME Platform - File Manager / Document System
 * Integration với Google Workspace (2TB)
 */

// =============================================================================
// FILE TYPES
// =============================================================================

export type FileType = 
  | 'folder'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'archive'
  | 'other'

export type FileSource = 'local' | 'google-drive' | 'dropbox' | 'onedrive'

export interface FileItem {
  id: string
  name: string
  type: FileType
  source: FileSource
  
  // Location
  parentId: string | null
  path: string
  
  // Metadata
  size: number // bytes
  mimeType: string
  extension: string
  
  // Permissions (inherited from module)
  moduleId?: string
  resourceType?: string
  resourceId?: string
  
  // Ownership
  createdBy: string
  createdAt: Date
  updatedBy?: string
  updatedAt?: Date
  
  // Sharing
  isPublic: boolean
  sharedWith: FileSharePermission[]
  
  // Version
  version: number
  versions?: FileVersion[]
  
  // Google Drive specific
  googleDriveId?: string
  googleDriveUrl?: string
  
  // Thumbnail
  thumbnailUrl?: string
}

export interface FileSharePermission {
  userId: string
  permission: 'view' | 'edit' | 'admin'
  expiresAt?: Date
}

export interface FileVersion {
  version: number
  size: number
  createdBy: string
  createdAt: Date
  note?: string
}

export interface FileUploadProgress {
  fileId: string
  fileName: string
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

// =============================================================================
// FILE MANAGER
// =============================================================================

class FileManager {
  private files: Map<string, FileItem> = new Map()
  private uploadQueue: FileUploadProgress[] = []

  // Get files in folder
  getFilesInFolder(folderId: string | null): FileItem[] {
    return Array.from(this.files.values())
      .filter(f => f.parentId === folderId)
      .sort((a, b) => {
        // Folders first, then by name
        if (a.type === 'folder' && b.type !== 'folder') return -1
        if (a.type !== 'folder' && b.type === 'folder') return 1
        return a.name.localeCompare(b.name)
      })
  }

  // Get file by ID
  getFile(id: string): FileItem | undefined {
    return this.files.get(id)
  }

  // Create folder
  createFolder(name: string, parentId: string | null, createdBy: string): FileItem {
    const folder: FileItem = {
      id: `folder_${Date.now()}`,
      name,
      type: 'folder',
      source: 'local',
      parentId,
      path: this.buildPath(parentId, name),
      size: 0,
      mimeType: 'inode/directory',
      extension: '',
      createdBy,
      createdAt: new Date(),
      isPublic: false,
      sharedWith: [],
      version: 1,
    }

    this.files.set(folder.id, folder)
    return folder
  }

  // Upload file
  async uploadFile(
    file: File,
    parentId: string | null,
    createdBy: string,
    options?: {
      moduleId?: string
      resourceType?: string
      resourceId?: string
    }
  ): Promise<FileItem> {
    const fileId = `file_${Date.now()}`
    
    // Add to upload queue
    const progress: FileUploadProgress = {
      fileId,
      fileName: file.name,
      progress: 0,
      status: 'uploading',
    }
    this.uploadQueue.push(progress)

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        progress.progress = i
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      const fileItem: FileItem = {
        id: fileId,
        name: file.name,
        type: this.getFileType(file.type, file.name),
        source: 'local',
        parentId,
        path: this.buildPath(parentId, file.name),
        size: file.size,
        mimeType: file.type,
        extension: this.getExtension(file.name),
        createdBy,
        createdAt: new Date(),
        isPublic: false,
        sharedWith: [],
        version: 1,
        moduleId: options?.moduleId,
        resourceType: options?.resourceType,
        resourceId: options?.resourceId,
      }

      this.files.set(fileId, fileItem)
      progress.status = 'completed'
      
      return fileItem
    } catch (error) {
      progress.status = 'error'
      progress.error = error instanceof Error ? error.message : 'Upload failed'
      throw error
    }
  }

  // Delete file
  deleteFile(id: string): boolean {
    const file = this.files.get(id)
    if (!file) return false

    // If folder, delete all children
    if (file.type === 'folder') {
      const children = this.getFilesInFolder(id)
      children.forEach(child => this.deleteFile(child.id))
    }

    this.files.delete(id)
    return true
  }

  // Move file
  moveFile(id: string, newParentId: string | null): boolean {
    const file = this.files.get(id)
    if (!file) return false

    file.parentId = newParentId
    file.path = this.buildPath(newParentId, file.name)
    file.updatedAt = new Date()

    return true
  }

  // Rename file
  renameFile(id: string, newName: string): boolean {
    const file = this.files.get(id)
    if (!file) return false

    file.name = newName
    file.path = this.buildPath(file.parentId, newName)
    file.updatedAt = new Date()

    return true
  }

  // Share file
  shareFile(id: string, userId: string, permission: 'view' | 'edit' | 'admin'): boolean {
    const file = this.files.get(id)
    if (!file) return false

    const existingIndex = file.sharedWith.findIndex(s => s.userId === userId)
    if (existingIndex >= 0) {
      file.sharedWith[existingIndex].permission = permission
    } else {
      file.sharedWith.push({ userId, permission })
    }

    return true
  }

  // Search files
  searchFiles(query: string, options?: { type?: FileType; moduleId?: string }): FileItem[] {
    const queryLower = query.toLowerCase()
    
    return Array.from(this.files.values())
      .filter(file => {
        const matchesQuery = file.name.toLowerCase().includes(queryLower)
        const matchesType = !options?.type || file.type === options.type
        const matchesModule = !options?.moduleId || file.moduleId === options.moduleId
        
        return matchesQuery && matchesType && matchesModule
      })
  }

  // Get breadcrumb path
  getBreadcrumb(folderId: string | null): FileItem[] {
    const breadcrumb: FileItem[] = []
    let currentId = folderId

    while (currentId) {
      const folder = this.files.get(currentId)
      if (folder) {
        breadcrumb.unshift(folder)
        currentId = folder.parentId
      } else {
        break
      }
    }

    return breadcrumb
  }

  // Helper: Build path string
  private buildPath(parentId: string | null, name: string): string {
    if (!parentId) return `/${name}`
    
    const parent = this.files.get(parentId)
    return parent ? `${parent.path}/${name}` : `/${name}`
  }

  // Helper: Get file type from mime type
  private getFileType(mimeType: string, fileName: string): FileType {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType === 'application/pdf') return 'pdf'
    if (mimeType.includes('spreadsheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) return 'spreadsheet'
    if (mimeType.includes('presentation') || fileName.endsWith('.pptx')) return 'presentation'
    if (mimeType.includes('document') || mimeType.includes('word') || fileName.endsWith('.docx')) return 'document'
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive'
    return 'other'
  }

  // Helper: Get file extension
  private getExtension(fileName: string): string {
    const parts = fileName.split('.')
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
  }

  // Get upload queue
  getUploadQueue(): FileUploadProgress[] {
    return this.uploadQueue
  }

  // Get storage stats
  getStorageStats(): { used: number; total: number; byType: Record<FileType, number> } {
    let used = 0
    const byType: Record<FileType, number> = {
      folder: 0,
      document: 0,
      spreadsheet: 0,
      presentation: 0,
      image: 0,
      video: 0,
      audio: 0,
      pdf: 0,
      archive: 0,
      other: 0,
    }

    this.files.forEach(file => {
      used += file.size
      byType[file.type] += file.size
    })

    return {
      used,
      total: 2 * 1024 * 1024 * 1024 * 1024, // 2TB
      byType,
    }
  }
}

// =============================================================================
// FILE ICON MAPPING
// =============================================================================

export const fileTypeIcons: Record<FileType, { icon: string; color: string }> = {
  folder: { icon: '📁', color: 'text-yellow-500' },
  document: { icon: '📝', color: 'text-blue-500' },
  spreadsheet: { icon: '📊', color: 'text-green-500' },
  presentation: { icon: '📽️', color: 'text-orange-500' },
  image: { icon: '🖼️', color: 'text-purple-500' },
  video: { icon: '🎬', color: 'text-red-500' },
  audio: { icon: '🎵', color: 'text-pink-500' },
  pdf: { icon: '📄', color: 'text-red-600' },
  archive: { icon: '📦', color: 'text-gray-500' },
  other: { icon: '📎', color: 'text-gray-400' },
}

// =============================================================================
// FORMAT FILE SIZE
// =============================================================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const fileManager = new FileManager()

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useCallback } from 'react'

export function useFileManager(initialFolderId: string | null = null) {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialFolderId)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const files = fileManager.getFilesInFolder(currentFolderId)
  const breadcrumb = fileManager.getBreadcrumb(currentFolderId)
  const storageStats = fileManager.getStorageStats()

  const navigateToFolder = useCallback((folderId: string | null) => {
    setCurrentFolderId(folderId)
    setSelectedFiles(new Set())
  }, [])

  const toggleSelect = useCallback((fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileId)) {
        newSet.delete(fileId)
      } else {
        newSet.add(fileId)
      }
      return newSet
    })
  }, [])

  const selectAll = useCallback(() => {
    setSelectedFiles(new Set(files.map(f => f.id)))
  }, [files])

  const clearSelection = useCallback(() => {
    setSelectedFiles(new Set())
  }, [])

  return {
    currentFolderId,
    files,
    breadcrumb,
    selectedFiles,
    viewMode,
    storageStats,
    navigateToFolder,
    toggleSelect,
    selectAll,
    clearSelection,
    setViewMode,
    createFolder: (name: string, createdBy: string) => 
      fileManager.createFolder(name, currentFolderId, createdBy),
    uploadFile: (file: File, createdBy: string) => 
      fileManager.uploadFile(file, currentFolderId, createdBy),
    deleteSelected: () => {
      selectedFiles.forEach(id => fileManager.deleteFile(id))
      setSelectedFiles(new Set())
    },
  }
}
