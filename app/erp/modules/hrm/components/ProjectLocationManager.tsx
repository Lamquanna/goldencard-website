'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  FileText,
  Navigation,
  MapPinned,
  UserPlus,
  Search,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectLocation, ProjectMember, PROJECT_STATUS_CONFIG } from '../index'

// =============================================================================
// MOCK DATA
// =============================================================================

const mockProjects: ProjectLocation[] = [
  {
    id: 'proj-1',
    projectName: 'Nhà máy điện mặt trời Ninh Thuận',
    projectCode: 'SOLAR-NT-001',
    address: 'Khu công nghiệp Ninh Phước, Ninh Thuận',
    latitude: 11.5756,
    longitude: 108.9896,
    radius: 200,
    description: 'Lắp đặt hệ thống điện mặt trời công suất 50MW',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-06-30'),
    status: 'active',
    projectManagerId: 'emp-003',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'emp-001',
    teamMembers: [
      {
        id: 'pm-1',
        projectId: 'proj-1',
        employeeId: 'emp-003',
        role: 'manager',
        roleVi: 'Trưởng dự án',
        joinDate: new Date('2024-01-15'),
        isActive: true,
      },
      {
        id: 'pm-2',
        projectId: 'proj-1',
        employeeId: 'emp-010',
        role: 'engineer',
        roleVi: 'Kỹ sư',
        joinDate: new Date('2024-01-20'),
        isActive: true,
      },
      {
        id: 'pm-3',
        projectId: 'proj-1',
        employeeId: 'emp-011',
        role: 'engineer',
        roleVi: 'Kỹ sư',
        joinDate: new Date('2024-01-20'),
        isActive: true,
      },
    ],
  },
  {
    id: 'proj-2',
    projectName: 'Hệ thống điện mặt trời Bình Dương',
    projectCode: 'SOLAR-BD-002',
    address: 'Khu công nghiệp VSIP, Bình Dương',
    latitude: 10.9804,
    longitude: 106.6717,
    radius: 200,
    description: 'Lắp đặt điện mặt trời mái nhà xưởng 10MW',
    startDate: new Date('2024-02-01'),
    status: 'active',
    projectManagerId: 'emp-003',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'emp-001',
    teamMembers: [
      {
        id: 'pm-4',
        projectId: 'proj-2',
        employeeId: 'emp-012',
        role: 'engineer',
        roleVi: 'Kỹ sư',
        joinDate: new Date('2024-02-01'),
        isActive: true,
      },
    ],
  },
]

// =============================================================================
// PROJECT CARD
// =============================================================================

interface ProjectCardProps {
  project: ProjectLocation
  onEdit: (project: ProjectLocation) => void
  onDelete: (projectId: string) => void
  onManageTeam: (project: ProjectLocation) => void
  onViewMap: (project: ProjectLocation) => void
}

function ProjectCard({ project, onEdit, onDelete, onManageTeam, onViewMap }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status]
  const StatusIcon = statusConfig.icon === 'Play' ? Play :
                     statusConfig.icon === 'Pause' ? Pause :
                     statusConfig.icon === 'CheckCircle2' ? CheckCircle2 :
                     statusConfig.icon === 'XCircle' ? XCircle : FileText

  const activeMembers = project.teamMembers?.filter(m => m.isActive).length || 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs">
                {project.projectCode}
              </Badge>
              <Badge className={`${statusConfig.color} text-white border-0`}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusConfig.labelVi}
              </Badge>
            </div>
            <CardTitle className="text-lg">{project.projectName}</CardTitle>
            <CardDescription className="mt-1 flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{project.address}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{activeMembers} thành viên</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPinned className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Bán kính {project.radius}m</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {format(project.startDate, 'dd/MM/yyyy', { locale: vi })}
            </span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {format(project.endDate, 'dd/MM/yyyy', { locale: vi })}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewMap(project)}
          >
            <Navigation className="h-4 w-4 mr-1" />
            Xem bản đồ
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onManageTeam(project)}
          >
            <Users className="h-4 w-4 mr-1" />
            Quản lý team
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(project)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(project.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================================================
// CREATE/EDIT PROJECT DIALOG
// =============================================================================

interface ProjectFormProps {
  project?: ProjectLocation
  onSave: (project: Partial<ProjectLocation>) => void
  onCancel: () => void
}

function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectLocation>>(
    project || {
      projectName: '',
      projectCode: '',
      address: '',
      latitude: 0,
      longitude: 0,
      radius: 200,
      description: '',
      status: 'planning',
      startDate: new Date(),
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          alert(`✅ Đã lấy vị trí hiện tại:\nLat: ${position.coords.latitude}\nLng: ${position.coords.longitude}`)
        },
        (error) => {
          alert('❌ Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí.')
        }
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project Name */}
      <div>
        <Label htmlFor="projectName">
          Tên dự án <span className="text-red-500">*</span>
        </Label>
        <Input
          id="projectName"
          value={formData.projectName}
          onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
          placeholder="VD: Nhà máy điện mặt trời Ninh Thuận"
          required
        />
      </div>

      {/* Project Code */}
      <div>
        <Label htmlFor="projectCode">
          Mã dự án <span className="text-red-500">*</span>
        </Label>
        <Input
          id="projectCode"
          value={formData.projectCode}
          onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
          placeholder="VD: SOLAR-NT-001"
          required
        />
      </div>

      {/* Address */}
      <div>
        <Label htmlFor="address">
          Địa chỉ công trường <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Địa chỉ chi tiết của công trường"
          required
          rows={2}
        />
      </div>

      {/* Location Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
          <Input
            id="latitude"
            type="number"
            step="0.000001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
          <Input
            id="longitude"
            type="number"
            step="0.000001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={getCurrentLocation}
      >
        <Navigation className="h-4 w-4 mr-2" />
        Lấy vị trí hiện tại
      </Button>

      {/* Radius */}
      <div>
        <Label htmlFor="radius">Bán kính check-in (mét)</Label>
        <Input
          id="radius"
          type="number"
          value={formData.radius}
          onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
          placeholder="200"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Mặc định 200m. Nhân viên phải ở trong bán kính này để check-in
        </p>
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Mô tả dự án</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả chi tiết về dự án, phạm vi công việc..."
          rows={3}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="startDate">Ngày bắt đầu</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate ? format(formData.startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setFormData({ ...formData, startDate: new Date(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="endDate">Ngày kết thúc (dự kiến)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => setFormData({ ...formData, endDate: new Date(e.target.value) })}
          />
        </div>
      </div>

      {/* Status */}
      <div>
        <Label htmlFor="status">Trạng thái</Label>
        <Select
          value={formData.status}
          onValueChange={(value: any) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.labelVi}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" className="flex-1">
          {project ? 'Cập nhật' : 'Tạo dự án'}
        </Button>
      </div>
    </form>
  )
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProjectLocationManager() {
  const [projects, setProjects] = useState<ProjectLocation[]>(mockProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectLocation | null>(null)

  const filteredProjects = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSaveProject = (data: Partial<ProjectLocation>) => {
    if (editingProject) {
      // Update existing
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...data, updatedAt: new Date() } : p))
      )
    } else {
      // Create new
      const newProject: ProjectLocation = {
        id: `proj-${Date.now()}`,
        ...data as ProjectLocation,
        projectManagerId: 'current-user-id', // Should be from context
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user-id',
      }
      setProjects((prev) => [newProject, ...prev])
    }
    setShowCreateDialog(false)
    setEditingProject(null)
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Bạn có chắc muốn xóa dự án này?')) {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    }
  }

  const handleManageTeam = (project: ProjectLocation) => {
    // TODO: Open team management dialog
    alert(`Quản lý team cho dự án: ${project.projectName}\n(Tính năng đang phát triển)`)
  }

  const handleViewMap = (project: ProjectLocation) => {
    // TODO: Open map view
    const mapsUrl = `https://www.google.com/maps?q=${project.latitude},${project.longitude}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Quản lý Địa điểm Dự án</h2>
          <p className="text-muted-foreground">
            Thiết lập và quản lý các địa điểm công trường cho chấm công
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo dự án mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo địa điểm dự án mới</DialogTitle>
            </DialogHeader>
            <ProjectForm
              onSave={handleSaveProject}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Tổng số dự án</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter((p) => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Đang triển khai</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter((p) => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Đã hoàn thành</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {projects.reduce((sum, p) => sum + (p.teamMembers?.filter((m) => m.isActive).length || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tổng nhân sự</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên, mã dự án, hoặc địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={(p) => {
              setEditingProject(p)
              setShowCreateDialog(true)
            }}
            onDelete={handleDeleteProject}
            onManageTeam={handleManageTeam}
            onViewMap={handleViewMap}
          />
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'Không tìm thấy dự án phù hợp' : 'Chưa có dự án nào'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa dự án</DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={editingProject}
              onSave={handleSaveProject}
              onCancel={() => setEditingProject(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default ProjectLocationManager
