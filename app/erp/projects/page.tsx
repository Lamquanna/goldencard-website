'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List,
  MoreHorizontal,
  Star,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pause,
  Eye,
  Edit,
  Trash2,
  Bell,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react'
import { format, differenceInDays, isAfter } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Project, ProjectStatus, PROJECT_STATUS_CONFIG } from '@/app/erp/modules/project'
import { VIETNAM_PROVINCES, generateProjectKey } from '@/lib/vietnam-locations'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'Website Redesign',
    key: 'WEB',
    description: 'Thiết kế lại giao diện website công ty',
    color: '#3B82F6',
    status: 'active',
    startDate: new Date(2026, 0, 5),  // 5/1/2026
    endDate: new Date(2026, 0, 20),   // 20/1/2026 - Gần deadline!
    progress: 65, // Tiến độ chưa đạt 80%
    totalTasks: 24,
    completedTasks: 16,
    ownerId: 'u1',
    owner: { id: 'u1', name: 'Nguyễn Văn A' },
    members: [
      { userId: 'u1', role: 'owner', joinedAt: new Date() },
      { userId: 'u2', role: 'member', joinedAt: new Date() },
      { userId: 'u3', role: 'member', joinedAt: new Date() },
    ],
    isPublic: true,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p2',
    name: 'Mobile App Development',
    key: 'APP',
    description: 'Phát triển ứng dụng di động cho khách hàng',
    color: '#10B981',
    status: 'active',
    startDate: new Date(2026, 0, 1),  // 1/1/2026
    endDate: new Date(2026, 0, 15),   // 15/1/2026 - Rất gần deadline
    progress: 45, // Tiến độ thấp!
    totalTasks: 48,
    completedTasks: 22,
    ownerId: 'u2',
    owner: { id: 'u2', name: 'Trần Thị B' },
    members: [
      { userId: 'u2', role: 'owner', joinedAt: new Date() },
      { userId: 'u1', role: 'admin', joinedAt: new Date() },
      { userId: 'u4', role: 'member', joinedAt: new Date() },
      { userId: 'u5', role: 'member', joinedAt: new Date() },
    ],
    isPublic: false,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p3',
    name: 'CRM Implementation',
    key: 'CRM',
    description: 'Triển khai hệ thống CRM mới',
    color: '#8B5CF6',
    status: 'planning',
    startDate: new Date(2026, 1, 1),
    endDate: new Date(2026, 5, 30),
    progress: 10,
    totalTasks: 16,
    completedTasks: 2,
    ownerId: 'u1',
    owner: { id: 'u1', name: 'Nguyễn Văn A' },
    members: [
      { userId: 'u1', role: 'owner', joinedAt: new Date() },
      { userId: 'u3', role: 'member', joinedAt: new Date() },
    ],
    isPublic: true,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p4',
    name: 'Marketing Campaign Q1',
    key: 'MKT',
    description: 'Chiến dịch marketing quý 1/2025',
    color: '#F59E0B',
    status: 'completed',
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 2, 31),
    progress: 100,
    totalTasks: 32,
    completedTasks: 32,
    ownerId: 'u3',
    owner: { id: 'u3', name: 'Lê Văn C' },
    members: [
      { userId: 'u3', role: 'owner', joinedAt: new Date() },
      { userId: 'u2', role: 'member', joinedAt: new Date() },
    ],
    isPublic: true,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'p5',
    name: 'Internal Tools',
    key: 'INT',
    description: 'Phát triển công cụ nội bộ',
    color: '#EF4444',
    status: 'on_hold',
    startDate: new Date(2025, 1, 1),
    endDate: new Date(2026, 0, 10), // 10/1/2026 - Đã quá deadline
    progress: 35,
    totalTasks: 12,
    completedTasks: 4,
    ownerId: 'u1',
    owner: { id: 'u1', name: 'Nguyễn Văn A' },
    members: [
      { userId: 'u1', role: 'owner', joinedAt: new Date() },
    ],
    isPublic: false,
    allowComments: true,
    workspaceId: 'w1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getProgressColor(progress: number, daysLeft: number, endDate: Date | undefined): string {
  if (!endDate) return 'bg-blue-500'
  
  const now = new Date()
  const isNearDeadline = daysLeft <= 7 && isAfter(endDate, now)
  
  // Đỏ: Gần deadline (≤7 ngày) và tiến độ < 80%
  if (isNearDeadline && progress < 80) {
    return 'bg-red-500'
  }
  
  // Vàng: Gần deadline và tiến độ 80-90%
  if (isNearDeadline && progress >= 80 && progress < 90) {
    return 'bg-yellow-500'
  }
  
  // Xanh: Tiến độ ≥ 90%
  if (progress >= 90) {
    return 'bg-green-500'
  }
  
  // Xanh dương: Mặc định
  return 'bg-blue-500'
}

function shouldShowAlert(progress: number, daysLeft: number, endDate: Date | undefined): boolean {
  if (!endDate) return false
  const now = new Date()
  return daysLeft <= 7 && isAfter(endDate, now) && progress < 80
}

// =============================================================================
// STATUS ICON
// =============================================================================

function StatusIcon({ status }: { status: ProjectStatus }) {
  const icons = {
    planning: Clock,
    active: BarChart3,
    on_hold: Pause,
    completed: CheckCircle2,
    cancelled: AlertCircle,
  }
  const Icon = icons[status]
  const config = PROJECT_STATUS_CONFIG[status]

  return (
    <div className={`p-1.5 rounded ${config.color}/10`}>
      <Icon className={`h-4 w-4 ${config.color.replace('bg-', 'text-')}`} />
    </div>
  )
}

// =============================================================================
// PROJECT CARD
// =============================================================================

function ProjectCard({ project }: { project: Project }) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const daysLeft = project.endDate ? differenceInDays(project.endDate, new Date()) : 0
  const progressColor = getProgressColor(project.progress, daysLeft, project.endDate)
  const showAlert = shouldShowAlert(project.progress, daysLeft, project.endDate)

  return (
    <Link href={`/erp/projects/${project.id}`}>
      <Card className={`hover:shadow-md transition-all cursor-pointer group h-full ${showAlert ? 'border-red-300 border-2' : ''}`}>
        <CardContent className="p-4">
          {/* Alert Badge */}
          {showAlert && (
            <div className="mb-3 flex items-center gap-2 text-xs bg-red-50 text-red-700 p-2 rounded-md">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-medium">Cảnh báo: Gần deadline, tiến độ chậm!</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: project.color }}
              >
                {project.key.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground">{project.key}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); window.location.href = `/erp/projects/${project.id}`; }}>
                  <Eye className="h-4 w-4 mr-2" /> Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); alert('Chức năng chỉnh sửa dự án: ' + project.name); }}>
                  <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); }}>
                  <Star className="h-4 w-4 mr-2" /> Đánh dấu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.preventDefault(); }}>
                  <Settings className="h-4 w-4 mr-2" /> Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.preventDefault(); if(confirm('Bạn có chắc muốn xóa dự án này?')) { alert('Đã xóa dự án: ' + project.name); } }}>
                  <Trash2 className="h-4 w-4 mr-2" /> Xóa dự án
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {project.description}
            </p>
          )}

          {/* Timeline */}
          {project.startDate && project.endDate && (
            <div className="flex items-center gap-4 mb-4 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(project.startDate, 'dd/MM/yyyy', { locale: vi })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className={`h-3 w-3 ${daysLeft <= 7 && daysLeft > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
                <span className={daysLeft <= 7 && daysLeft > 0 ? 'text-red-500 font-medium' : 'text-muted-foreground'}>
                  {format(project.endDate, 'dd/MM/yyyy', { locale: vi })}
                  {daysLeft > 0 && ` (${daysLeft} ngày)`}
                  {daysLeft === 0 && ' (Hôm nay!)'}
                  {daysLeft < 0 && ` (Quá ${Math.abs(daysLeft)} ngày)`}
                </span>
              </div>
            </div>
          )}

          {/* Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tiến độ</span>
              <span className={`font-medium ${showAlert ? 'text-red-600' : ''}`}>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className={`h-2 ${progressColor}`} />
            <p className="text-xs text-muted-foreground">
              {project.completedTasks}/{project.totalTasks} công việc hoàn thành
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <Badge variant="outline" className={`${statusConfig.color} text-white border-0`}>
              {statusConfig.labelVi}
            </Badge>
            <div className="flex items-center -space-x-2">
              {project.members.slice(0, 3).map((member, idx) => (
                <Avatar key={idx} className="h-7 w-7 border-2 border-background">
                  <AvatarFallback className="text-xs">
                    {member.userId.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 3 && (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// =============================================================================
// PROJECT LIST ITEM
// =============================================================================

function ProjectListItem({ project }: { project: Project }) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const daysLeft = project.endDate ? differenceInDays(project.endDate, new Date()) : 0
  const progressColor = getProgressColor(project.progress, daysLeft, project.endDate)
  const showAlert = shouldShowAlert(project.progress, daysLeft, project.endDate)

  return (
    <Link href={`/erp/projects/${project.id}`}>
      <div className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors ${showAlert ? 'border-red-300 border-2 bg-red-50/30' : ''}`}>
        {showAlert && (
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
        )}
        
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
          style={{ backgroundColor: project.color }}
        >
          {project.key.substring(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{project.name}</h3>
            <Badge variant="outline" className={`${statusConfig.color} text-white border-0`}>
              {statusConfig.labelVi}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{project.description}</p>
          
          {/* Timeline */}
          {project.startDate && project.endDate && (
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-muted-foreground">
                📅 {format(project.startDate, 'dd/MM/yyyy')} - {format(project.endDate, 'dd/MM/yyyy')}
              </span>
              {daysLeft > 0 && (
                <span className={`font-medium ${daysLeft <= 7 ? 'text-red-500' : 'text-muted-foreground'}`}>
                  ⏱️ Còn {daysLeft} ngày
                </span>
              )}
            </div>
          )}
          
          {/* Progress bar */}
          <div className="mt-2">
            <Progress value={project.progress} className={`h-1.5 ${progressColor}`} />
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-center">
            <p className={`text-lg font-semibold ${showAlert ? 'text-red-600' : ''}`}>{project.progress}%</p>
            <p className="text-xs text-muted-foreground">Tiến độ</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold">{project.completedTasks}/{project.totalTasks}</p>
            <p className="text-xs text-muted-foreground">Hoàn thành</p>
          </div>
          <div className="flex items-center -space-x-2">
            {project.members.slice(0, 3).map((member, idx) => (
              <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {member.userId.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}

// =============================================================================
// CREATE PROJECT DIALOG
// =============================================================================

interface CreateProjectDialogProps {
  onProjectCreated?: (project: Project) => void
}

function CreateProjectDialog({ onProjectCreated }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    province: '',
    district: '',
    address: '',
    color: '#3B82F6',
    description: '',
  });
  const [projectCode, setProjectCode] = useState('PRJ-XXXX');

  // Get districts for selected province
  const selectedProvince = VIETNAM_PROVINCES.find(p => p.code === formData.province);
  const districts = selectedProvince?.districts || [];

  // Update project code when location changes
  const handleProvinceChange = (value: string) => {
    setFormData({ ...formData, province: value, district: '' });
    setProjectCode('PRJ-XXXX'); // Reset until district selected
  };

  const handleDistrictChange = (value: string) => {
    setFormData({ ...formData, district: value });
    if (formData.province) {
      const newKey = generateProjectKey(formData.province, value);
      setProjectCode(newKey);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.province) {
      alert('⚠️ Vui lòng điền tên dự án và chọn tỉnh/thành phố');
      return;
    }

    setIsSubmitting(true);

    try {
      const location = `${selectedProvince?.name}${formData.district && formData.district !== 'all' ? ' - ' + districts.find(d => d.code === formData.district)?.name : ''}`;
      
      const response = await fetch('/api/erp/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          projectKey: projectCode,
          description: formData.description,
          color: formData.color,
          location: location,
          startDate: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create project');
      }

      const data = await response.json();
      
      // Create new project object to add to state
      const newProject: Project = {
        id: data.data?.id || `p${Date.now()}`,
        name: formData.name,
        key: projectCode,
        description: formData.description,
        color: formData.color,
        status: 'planning',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        progress: 0,
        totalTasks: 0,
        completedTasks: 0,
        ownerId: 'current-user',
        owner: { id: 'current-user', name: 'You' },
        members: [{ userId: 'current-user', role: 'owner', joinedAt: new Date() }],
        isPublic: true,
        allowComments: true,
        workspaceId: 'w1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to parent state
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }

      alert(`✅ Đã tạo dự án thành công!\nMã dự án: ${projectCode}`);
      setOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        province: '',
        district: '',
        address: '',
        color: '#3B82F6',
        description: '',
      });
      setProjectCode('PRJ-XXXX');
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tạo dự án
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Tạo dự án mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo dự án mới. Mã dự án sẽ được tạo tự động.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên dự án <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="VD: Điện mặt trời 10kW hộ gia đình" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tỉnh/Thành phố <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.province}
                  onValueChange={handleProvinceChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tỉnh/thành phố" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {VIETNAM_PROVINCES.map((province) => (
                      <SelectItem key={province.code} value={province.code}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quận/Huyện</Label>
                <Select 
                  value={formData.district}
                  onValueChange={handleDistrictChange}
                  disabled={!formData.province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.province ? "Chọn quận/huyện" : "Chọn tỉnh trước"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {districts.map((district) => (
                      <SelectItem key={district.code} value={district.code}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mã dự án (Tự động)</Label>
              <Input 
                value={projectCode} 
                readOnly 
                className="bg-gray-100 font-mono font-bold text-[#D4AF37]"
              />
              <p className="text-xs text-muted-foreground">
                Mã được tạo tự động theo địa điểm
              </p>
            </div>
            <div className="space-y-2">
              <Label>Địa chỉ cụ thể (Tùy chọn)</Label>
              <Input
                placeholder="VD: 123 Đường ABC, Phường XYZ"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Màu sắc dự án</Label>
              <div className="flex items-center gap-3">
                <Input 
                  type="color" 
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10 w-20 cursor-pointer" 
                />
                <div className="flex gap-2">
                  {['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#D4AF37'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-900' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mô tả dự án</Label>
              <Textarea 
                placeholder="Mô tả chi tiết về dự án, quy mô, yêu cầu đặc biệt..." 
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" className="bg-[#D4AF37] hover:bg-[#B8962E] text-white" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Đang tạo...' : 'Tạo dự án'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [projects, setProjects] = useState<Project[]>(mockProjects)

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      searchQuery === '' ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.key.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Stats
  const stats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold: projects.filter(p => p.status === 'on_hold').length,
  }

  // Callback to add new project
  const handleProjectCreated = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
  }

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <div>
        <Link href="/erp/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dự án</h1>
          <p className="text-muted-foreground">Quản lý tất cả dự án của bạn</p>
        </div>
        <CreateProjectDialog onProjectCreated={handleProjectCreated} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng dự án</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Đang thực hiện</p>
                <p className="text-2xl font-bold text-green-500">{stats.active}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoàn thành</p>
                <p className="text-2xl font-bold text-blue-500">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tạm dừng</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.onHold}</p>
              </div>
              <Pause className="h-8 w-8 text-yellow-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="active">Đang làm</TabsTrigger>
              <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Projects */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProjects.map(project => (
            <ProjectListItem key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">Không tìm thấy dự án nào</p>
        </div>
      )}
    </div>
  )
}
