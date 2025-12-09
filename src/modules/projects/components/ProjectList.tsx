'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  Calendar,
  FolderOpen,
  Grid3X3,
  List,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProjectStore, selectFilteredProjects, selectProjectStats } from '../store';
import {
  Project,
  ProjectStatus,
  PROJECT_STATUS_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'grid' | 'table';

interface ProjectListProps {
  onProjectClick?: (project: Project) => void;
  onAddProject?: () => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (project: Project) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// ============================================================================
// PROJECT STATS CARDS
// ============================================================================

function ProjectStatsCards() {
  const stats = useProjectStore(selectProjectStats);

  const items = [
    { 
      label: 'Tổng dự án', 
      value: stats.total, 
      icon: FolderOpen, 
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950' 
    },
    { 
      label: 'Đang thực hiện', 
      value: stats.inProgress, 
      icon: BarChart3, 
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950' 
    },
    { 
      label: 'Tạm dừng', 
      value: stats.onHold, 
      icon: Calendar, 
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950' 
    },
    { 
      label: 'Hoàn thành', 
      value: stats.completed, 
      icon: FolderOpen, 
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-950' 
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {item.value}
                  </p>
                  <p className="text-xs text-zinc-500">{item.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================================================
// PROJECT CARD COMPONENT
// ============================================================================

interface ProjectCardProps {
  project: Project;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ProjectCard({ project, onView, onEdit, onDelete }: ProjectCardProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Card
        className={cn(
          'h-full cursor-pointer hover:shadow-lg transition-shadow',
          project.color && `border-l-4`
        )}
        style={{ borderLeftColor: project.color }}
        onClick={onView}
      >
        {/* Thumbnail */}
        {project.thumbnail && (
          <div className="relative h-32 overflow-hidden rounded-t-lg">
            <img
              src={project.thumbnail}
              alt={project.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <CardContent className={cn('p-4', !project.thumbnail && 'pt-4')}>
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="text-xs font-mono"
                >
                  {project.code}
                </Badge>
                <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {project.name}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
              {project.description}
            </p>
          )}

          {/* Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-zinc-500">Tiến độ</span>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
            <div className="flex items-center justify-between mt-1 text-xs text-zinc-400">
              <span>{project.completedTasks} hoàn thành</span>
              <span>{project.totalTasks} tổng</span>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {project.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {/* Team */}
            <div className="flex -space-x-2">
              {project.members.slice(0, 4).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-white dark:border-zinc-900">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 4 && (
                <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    +{project.members.length - 4}
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(project.startDate), 'dd/MM/yyyy')}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// PROJECT TABLE ROW
// ============================================================================

interface ProjectTableRowProps {
  project: Project;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function ProjectTableRow({ project, onView, onEdit, onDelete }: ProjectTableRowProps) {
  const statusConfig = PROJECT_STATUS_CONFIG[project.status];

  return (
    <TableRow
      className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
      onClick={onView}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: project.color || '#3b82f6' }}
          >
            <FolderOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-zinc-900 dark:text-zinc-100">
                {project.name}
              </p>
              <Badge variant="outline" className="text-xs font-mono">
                {project.code}
              </Badge>
            </div>
            {project.description && (
              <p className="text-xs text-zinc-500 line-clamp-1 max-w-xs">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', statusConfig.bgColor, statusConfig.color)}>
          {statusConfig.label}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="w-32">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">{project.completedTasks}/{project.totalTasks}</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-1.5" />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex -space-x-1">
          {project.members.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="h-6 w-6 border-2 border-white dark:border-zinc-900">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="text-[10px]">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {project.members.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
              <span className="text-[10px] font-medium">+{project.members.length - 3}</span>
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {format(new Date(project.startDate), 'dd/MM/yyyy')}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {project.endDate ? format(new Date(project.endDate), 'dd/MM/yyyy') : '-'}
        </span>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectList({
  onProjectClick,
  onAddProject,
  onEditProject,
  onDeleteProject,
}: ProjectListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {
    projectFilters,
    setProjectFilters,
    clearProjectFilters,
    selectProject,
  } = useProjectStore();

  const projects = useProjectStore(selectFilteredProjects);

  const handleProjectView = useCallback((project: Project) => {
    selectProject(project);
    onProjectClick?.(project);
  }, [selectProject, onProjectClick]);

  const handleSearch = useCallback((value: string) => {
    setProjectFilters({ search: value || undefined });
  }, [setProjectFilters]);

  const hasActiveFilters = useMemo(() => {
    return !!(projectFilters.search || projectFilters.status);
  }, [projectFilters]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <ProjectStatsCards />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm dự án..."
              value={projectFilters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearProjectFilters}>
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Add Project */}
          <Button onClick={onAddProject}>
            <Plus className="h-4 w-4 mr-2" />
            Dự án mới
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                      Trạng thái
                    </label>
                    <Select
                      value={projectFilters.status || 'all'}
                      onValueChange={(value) =>
                        setProjectFilters({ status: value === 'all' ? undefined : value as ProjectStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={() => handleProjectView(project)}
                onEdit={() => onEditProject?.(project)}
                onDelete={() => onDeleteProject?.(project)}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Dự án</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead>Thành viên</TableHead>
                <TableHead>Bắt đầu</TableHead>
                <TableHead>Kết thúc</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <ProjectTableRow
                  key={project.id}
                  project={project}
                  onView={() => handleProjectView(project)}
                  onEdit={() => onEditProject?.(project)}
                  onDelete={() => onDeleteProject?.(project)}
                />
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <FolderOpen className="h-12 w-12 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Chưa có dự án nào
            </h3>
            <p className="text-sm text-zinc-500 mb-4">
              {hasActiveFilters
                ? 'Không tìm thấy dự án phù hợp với bộ lọc'
                : 'Bắt đầu bằng cách tạo dự án đầu tiên'}
            </p>
            {!hasActiveFilters && (
              <Button onClick={onAddProject}>
                <Plus className="h-4 w-4 mr-2" />
                Tạo dự án mới
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
