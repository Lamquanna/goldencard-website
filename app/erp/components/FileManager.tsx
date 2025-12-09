'use client'

import { useState, useCallback } from 'react'
import { 
  FolderOpen, 
  File, 
  Upload, 
  FolderPlus, 
  Grid, 
  List, 
  Search,
  MoreVertical,
  Download,
  Trash2,
  Share2,
  Edit2,
  ChevronRight,
  Home,
  HardDrive
} from 'lucide-react'
import { 
  useFileManager, 
  fileTypeIcons, 
  formatFileSize,
  type FileItem 
} from '@/app/erp/core/file-manager'

export function FileManager() {
  const {
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
    createFolder,
    uploadFile,
    deleteSelected,
  } = useFileManager()

  const [searchQuery, setSearchQuery] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), 'current-user')
      setNewFolderName('')
      setShowNewFolder(false)
    }
  }

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList) return

    for (let i = 0; i < fileList.length; i++) {
      await uploadFile(fileList[i], 'current-user')
    }
  }, [uploadFile])

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const usedPercentage = (storageStats.used / storageStats.total) * 100

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Actions */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Tải lên</span>
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Tạo thư mục</span>
            </button>

            {selectedFiles.size > 0 && (
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Xóa ({selectedFiles.size})</span>
              </button>
            )}
          </div>

          {/* Search & View */}
          <div className="flex items-center gap-2 flex-1">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <Grid className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
              >
                <List className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mt-4 text-sm">
          <button
            onClick={() => navigateToFolder(null)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-600 dark:text-gray-400"
          >
            <Home className="w-4 h-4" />
          </button>
          
          {breadcrumb.map((folder, index) => (
            <div key={folder.id} className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => navigateToFolder(folder.id)}
                className={`px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  index === breadcrumb.length - 1
                    ? 'text-gray-900 dark:text-white font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New Folder Dialog */}
      {showNewFolder && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-3">
          <FolderOpen className="w-5 h-5 text-blue-500" />
          <input
            type="text"
            placeholder="Tên thư mục mới"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            autoFocus
            className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateFolder}
            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600"
          >
            Tạo
          </button>
          <button
            onClick={() => {
              setShowNewFolder(false)
              setNewFolderName('')
            }}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {filteredFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FolderOpen className="w-16 h-16 mb-4" />
            <p className="text-lg">Thư mục trống</p>
            <p className="text-sm">Tải lên file hoặc tạo thư mục mới</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredFiles.map(file => (
              <FileGridItem
                key={file.id}
                file={file}
                isSelected={selectedFiles.has(file.id)}
                onSelect={() => toggleSelect(file.id)}
                onDoubleClick={() => file.type === 'folder' && navigateToFolder(file.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFiles.map(file => (
              <FileListItem
                key={file.id}
                file={file}
                isSelected={selectedFiles.has(file.id)}
                onSelect={() => toggleSelect(file.id)}
                onDoubleClick={() => file.type === 'folder' && navigateToFolder(file.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Storage Stats */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <HardDrive className="w-4 h-4" />
            <span>Dung lượng</span>
          </div>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatFileSize(storageStats.used)} / {formatFileSize(storageStats.total)}
          </span>
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              usedPercentage > 90 ? 'bg-red-500' : 
              usedPercentage > 70 ? 'bg-yellow-500' : 
              'bg-blue-500'
            }`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Grid View Item
function FileGridItem({ 
  file, 
  isSelected, 
  onSelect, 
  onDoubleClick 
}: { 
  file: FileItem
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
}) {
  const { icon, color } = fileTypeIcons[file.type]

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <div className="text-4xl mb-3 text-center">{icon}</div>
      <div className="text-sm font-medium text-gray-900 dark:text-white truncate text-center">
        {file.name}
      </div>
      {file.type !== 'folder' && (
        <div className="text-xs text-gray-500 text-center mt-1">
          {formatFileSize(file.size)}
        </div>
      )}
    </div>
  )
}

// List View Item
function FileListItem({ 
  file, 
  isSelected, 
  onSelect, 
  onDoubleClick 
}: { 
  file: FileItem
  isSelected: boolean
  onSelect: () => void
  onDoubleClick: () => void
}) {
  const { icon } = fileTypeIcons[file.type]

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-blue-50 dark:bg-blue-900/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onSelect}
        onClick={(e) => e.stopPropagation()}
        className="rounded border-gray-300 dark:border-gray-600"
      />
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </div>
      </div>
      {file.type !== 'folder' && (
        <div className="text-xs text-gray-500 hidden sm:block">
          {formatFileSize(file.size)}
        </div>
      )}
      <div className="text-xs text-gray-500 hidden md:block">
        {file.createdAt.toLocaleDateString('vi-VN')}
      </div>
      <button 
        onClick={(e) => e.stopPropagation()}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  )
}
