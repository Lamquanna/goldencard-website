'use client';

import React, { useState, useRef } from 'react';
import {
  FileText,
  Folder,
  Upload,
  Search,
  Grid,
  List,
  MoreHorizontal,
  Plus,
  File,
  Image,
  FileSpreadsheet,
  Presentation,
  Archive,
  Star,
  HelpCircle,
  X,
  Info,
  Download,
  Share2,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Tài liệu',
  description: 'Trang này giúp bạn quản lý và lưu trữ toàn bộ tài liệu, file của công ty một cách có tổ chức.',
  icons: [
    { icon: 'Folder (màu)', meaning: 'Thư mục phân loại tài liệu' },
    { icon: 'FileText', meaning: 'Tài liệu văn bản (Word, TXT)' },
    { icon: 'FileSpreadsheet', meaning: 'Bảng tính (Excel, CSV)' },
    { icon: 'Presentation', meaning: 'Trình chiếu (PowerPoint)' },
    { icon: 'Image', meaning: 'Hình ảnh (JPEG, PNG, GIF)' },
    { icon: 'File (đỏ)', meaning: 'Tài liệu PDF' },
    { icon: 'Archive', meaning: 'File nén (ZIP, RAR)' },
    { icon: 'Star (vàng)', meaning: 'Đã đánh dấu quan trọng' },
    { icon: 'Star (trống)', meaning: 'Chưa đánh dấu' },
    { icon: 'Upload', meaning: 'Tải lên tài liệu mới' },
    { icon: 'Grid', meaning: 'Chế độ xem lưới' },
    { icon: 'List', meaning: 'Chế độ xem danh sách' },
    { icon: 'Search', meaning: 'Tìm kiếm tài liệu' },
    { icon: 'MoreHorizontal', meaning: 'Thêm tùy chọn (tải, chia sẻ, xóa)' },
  ],
  sections: [
    {
      title: 'Thư mục',
      content: 'Các thư mục phân loại tài liệu theo danh mục: Hợp đồng, Báo cáo, Dự án, Tài chính, Nhân sự, Marketing. Nhấp vào thư mục để xem nội dung bên trong.'
    },
    {
      title: 'Tải lên tài liệu',
      content: 'Nhấn nút "Tải lên" để upload file mới. Hỗ trợ các định dạng: PDF, Word, Excel, PowerPoint, hình ảnh và file nén.'
    },
    {
      title: 'Chế độ xem',
      content: 'Chuyển đổi giữa 2 chế độ: Lưới (Grid) để xem nhanh nhiều file, hoặc Danh sách (List) để xem chi tiết hơn.'
    },
    {
      title: 'Đánh dấu quan trọng',
      content: 'Nhấn biểu tượng ngôi sao để đánh dấu tài liệu quan trọng, giúp tìm kiếm nhanh hơn sau này.'
    }
  ]
};

// Mock documents data
const mockFolders = [
  { id: '1', name: 'Hợp đồng', count: 24, color: 'bg-blue-500' },
  { id: '2', name: 'Báo cáo', count: 18, color: 'bg-green-500' },
  { id: '3', name: 'Dự án', count: 45, color: 'bg-purple-500' },
  { id: '4', name: 'Tài chính', count: 12, color: 'bg-yellow-500' },
  { id: '5', name: 'Nhân sự', count: 8, color: 'bg-pink-500' },
  { id: '6', name: 'Marketing', count: 15, color: 'bg-orange-500' },
];

const mockDocuments = [
  {
    id: '1',
    name: 'Báo cáo doanh thu Q4 2025.xlsx',
    type: 'spreadsheet',
    size: '2.4 MB',
    modified: '2025-12-15',
    owner: { name: 'Hà Hoàng Hà', initials: 'HH' },
    starred: true,
  },
  {
    id: '2',
    name: 'Hợp đồng ABC Corporation.pdf',
    type: 'pdf',
    size: '1.2 MB',
    modified: '2025-12-14',
    owner: { name: 'Rita Kim Anh', initials: 'RK' },
    starred: false,
  },
  {
    id: '3',
    name: 'Thiết kế Solar Farm.pptx',
    type: 'presentation',
    size: '8.5 MB',
    modified: '2025-12-13',
    owner: { name: 'Vũ Hoàng Phúc', initials: 'VP' },
    starred: true,
  },
  {
    id: '4',
    name: 'Ảnh dự án Bình Dương.zip',
    type: 'archive',
    size: '45.2 MB',
    modified: '2025-12-12',
    owner: { name: 'Nguyễn Văn Tuấn', initials: 'NT' },
    starred: false,
  },
  {
    id: '5',
    name: 'Bảng lương tháng 12.xlsx',
    type: 'spreadsheet',
    size: '890 KB',
    modified: '2025-12-11',
    owner: { name: 'Trần Thị Mai', initials: 'TM' },
    starred: false,
  },
];

const typeIcons = {
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  archive: Archive,
  image: Image,
  default: File,
};

const typeColors = {
  pdf: 'text-red-500',
  spreadsheet: 'text-green-500',
  presentation: 'text-orange-500',
  archive: 'text-purple-500',
  image: 'text-blue-500',
  default: 'text-gray-500',
};

export default function DocumentsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHelp, setShowHelp] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [folders, setFolders] = useState(mockFolders);
  const [documents, setDocuments] = useState(mockDocuments);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        type: getFileType(file.name),
        size: formatFileSize(file.size),
        modified: new Date().toISOString().split('T')[0],
        owner: { name: 'Bạn', initials: 'ME' },
        starred: false,
      };
      setDocuments([newDoc, ...documents]);
      alert(`Đã tải lên: ${file.name}`);
    }
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'spreadsheet';
    if (['pptx', 'ppt'].includes(ext || '')) return 'presentation';
    if (['pdf'].includes(ext || '')) return 'pdf';
    if (['zip', 'rar', '7z'].includes(ext || '')) return 'archive';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
    return 'default';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Handle create new folder
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-orange-500'];
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        count: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowNewFolderDialog(false);
      alert(`Đã tạo thư mục: ${newFolder.name}`);
    }
  };

  // Toggle star
  const handleToggleStar = (docId: string) => {
    setDocuments(documents.map(d => 
      d.id === docId ? { ...d, starred: !d.starred } : d
    ));
  };

  // Delete document
  const handleDeleteDoc = (docId: string) => {
    if (confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      setDocuments(documents.filter(d => d.id !== docId));
    }
  };

  // Download document (mock)
  const handleDownload = (docName: string) => {
    alert(`Đang tải xuống: ${docName}`);
  };

  // Share document (mock)
  const handleShare = (docName: string) => {
    alert(`Đã copy link chia sẻ: ${docName}`);
  };

  // Filter documents by search
  const filteredDocuments = documents.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.jpg,.jpeg,.png,.gif"
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tài liệu</h1>
            <p className="text-gray-600 mt-1">Quản lý tài liệu và file của công ty</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowHelp(true)}
            className="text-gray-500 hover:text-[#D4AF37]"
            title="Xem hướng dẫn sử dụng"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-gray-200" onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Tải lên
          </Button>
          <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white" onClick={() => setShowNewFolderDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thư mục mới
          </Button>
        </div>
      </div>

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo thư mục mới</DialogTitle>
            <DialogDescription>Nhập tên cho thư mục mới</DialogDescription>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Tên thư mục..."
            onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>Hủy</Button>
            <Button onClick={handleCreateFolder}>Tạo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help Guide */}
      {showHelp && (
        <Card className="bg-gradient-to-br from-amber-50 to-white border-[#D4AF37]/30">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D4AF37]" />
                <CardTitle className="text-lg text-gray-900">{helpGuide.title}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 -mt-2 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>{helpGuide.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Icons explanation */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Ý nghĩa các biểu tượng (Icons)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {helpGuide.icons.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-600 border">{item.icon}</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sections */}
            <div className="grid gap-3 sm:grid-cols-2">
              {helpGuide.sections.map((section, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{section.title}</h4>
                  <p className="text-xs text-gray-600">{section.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and View Toggle */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm tài liệu..." 
            className="pl-10 bg-white border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'bg-white shadow-sm' : ''}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'bg-white shadow-sm' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Folders */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thư mục</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <Card 
              key={folder.id} 
              className="bg-white border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setCurrentFolder(folder.id);
                alert(`Mở thư mục: ${folder.name}`);
              }}
            >
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-lg ${folder.color} bg-opacity-20 flex items-center justify-center mb-3`}>
                  <Folder className={`w-6 h-6 ${folder.color.replace('bg-', 'text-')}`} />
                </div>
                <h3 className="font-medium text-gray-900 truncate">{folder.name}</h3>
                <p className="text-sm text-gray-500">{folder.count} file</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Documents */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu gần đây</h2>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => {
              const IconComponent = typeIcons[doc.type as keyof typeof typeIcons] || typeIcons.default;
              const iconColor = typeColors[doc.type as keyof typeof typeColors] || typeColors.default;
              
              return (
                <Card key={doc.id} className="bg-white border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <IconComponent className={`w-6 h-6 ${iconColor}`} />
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); handleToggleStar(doc.id); }}
                        >
                          <Star className={`w-4 h-4 ${doc.starred ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(doc.name)}>
                              <Download className="w-4 h-4 mr-2" />
                              Tải xuống
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(doc.name)}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Chia sẻ
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteDoc(doc.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900 truncate mb-1">{doc.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.modified}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                          {doc.owner.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{doc.owner.name}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white border-gray-200">
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Tên</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Chủ sở hữu</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cập nhật</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Kích thước</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => {
                    const IconComponent = typeIcons[doc.type as keyof typeof typeIcons] || typeIcons.default;
                    const iconColor = typeColors[doc.type as keyof typeof typeColors] || typeColors.default;
                    
                    return (
                      <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <IconComponent className={`w-5 h-5 ${iconColor}`} />
                            <span className="text-gray-900">{doc.name}</span>
                            {doc.starred && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                                {doc.owner.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-700">{doc.owner.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{doc.modified}</td>
                        <td className="py-3 px-4 text-gray-600">{doc.size}</td>
                        <td className="py-3 px-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-400">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDownload(doc.name)}>
                                <Download className="w-4 h-4 mr-2" />
                                Tải xuống
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShare(doc.name)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Chia sẻ
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStar(doc.id)}>
                                <Star className="w-4 h-4 mr-2" />
                                {doc.starred ? 'Bỏ đánh dấu' : 'Đánh dấu'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteDoc(doc.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
