'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Building2,
  User,
  Phone,
  Mail,
  MoreVertical,
  Plus,
  Eye,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Filter,
  Search,
  Download,
  Upload,
  ArrowUpRight,
  Star,
  StarOff,
  UserPlus,
  Globe,
  Calendar,
  Megaphone,
  Handshake,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCRMStore } from '../store';
import { Lead, LeadSource, LeadStatus } from '../types';

// ============================================================================
// TYPES
// ============================================================================

type SortField = 'createdAt' | 'updatedAt' | 'company' | 'name' | 'budget' | 'score';
type SortDirection = 'asc' | 'desc';

interface LeadTableProps {
  onViewLead?: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
  onConvertLead?: (lead: Lead) => void;
  onAddLead?: () => void;
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  NEW: { label: 'Mới', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CONTACTED: { label: 'Đã liên hệ', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  QUALIFIED: { label: 'Đủ điều kiện', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  PROPOSAL: { label: 'Đề xuất', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  NEGOTIATION: { label: 'Đàm phán', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  WON: { label: 'Thành công', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  LOST: { label: 'Thất bại', color: 'text-red-700', bgColor: 'bg-red-100' },
  NURTURING: { label: 'Nuôi dưỡng', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
};

const SOURCE_CONFIG: Record<LeadSource, { label: string; icon: React.ReactNode }> = {
  WEBSITE: { label: 'Website', icon: <Globe className="h-3 w-3" /> },
  REFERRAL: { label: 'Giới thiệu', icon: <UserPlus className="h-3 w-3" /> },
  SOCIAL_MEDIA: { label: 'Mạng xã hội', icon: <User className="h-3 w-3" /> },
  COLD_CALL: { label: 'Cold call', icon: <Phone className="h-3 w-3" /> },
  EXHIBITION: { label: 'Triển lãm', icon: <Calendar className="h-3 w-3" /> },
  ADVERTISEMENT: { label: 'Quảng cáo', icon: <Megaphone className="h-3 w-3" /> },
  PARTNER: { label: 'Đối tác', icon: <Handshake className="h-3 w-3" /> },
  OTHER: { label: 'Khác', icon: <Tag className="h-3 w-3" /> },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value?: number) => {
  if (!value) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50';
  if (score >= 60) return 'text-blue-600 bg-blue-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-zinc-600 bg-zinc-50';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LeadTable({
  onViewLead,
  onEditLead,
  onDeleteLead,
  onConvertLead,
  onAddLead,
  className,
}: LeadTableProps) {
  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState({
    checkbox: true,
    company: true,
    contact: true,
    source: true,
    status: true,
    score: true,
    budget: true,
    assignee: true,
    createdAt: true,
    actions: true,
  });

  // Store
  const { leads, deleteLead, selectLead } = useCRMStore();

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lead) =>
          lead.company?.toLowerCase().includes(query) ||
          lead.name.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.phone?.includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      result = result.filter((lead) => lead.source === sourceFilter);
    }

    // Sorting
    result.sort((a, b) => {
      let aVal: string | number | Date = '';
      let bVal: string | number | Date = '';

      switch (sortField) {
        case 'company':
          aVal = a.company || a.name;
          bVal = b.company || b.name;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'budget':
          aVal = a.budget || 0;
          bVal = b.budget || 0;
          break;
        case 'score':
          aVal = a.score || 0;
          bVal = b.score || 0;
          break;
        case 'createdAt':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case 'updatedAt':
          aVal = new Date(a.updatedAt);
          bVal = new Date(b.updatedAt);
          break;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchQuery, statusFilter, sourceFilter, sortField, sortDirection]);

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredLeads.map((l) => l.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      onDeleteLead?.(leadToDelete);
    }
    setDeleteDialogOpen(false);
    setLeadToDelete(null);
  };

  const handleView = (lead: Lead) => {
    selectLead(lead);
    onViewLead?.(lead);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="ml-1 h-3 w-3 text-zinc-400" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="ml-1 h-3 w-3" />
    ) : (
      <ChevronDown className="ml-1 h-3 w-3" />
    );
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Nguồn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nguồn</SelectItem>
              {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Column Visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Cột
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Hiển thị cột</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.entries(visibleColumns).map(([key, visible]) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={visible}
                  onCheckedChange={(checked) =>
                    setVisibleColumns((prev) => ({ ...prev, [key]: checked }))
                  }
                >
                  {key === 'checkbox' && 'Checkbox'}
                  {key === 'company' && 'Công ty'}
                  {key === 'contact' && 'Liên hệ'}
                  {key === 'source' && 'Nguồn'}
                  {key === 'status' && 'Trạng thái'}
                  {key === 'score' && 'Điểm'}
                  {key === 'budget' && 'Ngân sách'}
                  {key === 'assignee' && 'Phụ trách'}
                  {key === 'createdAt' && 'Ngày tạo'}
                  {key === 'actions' && 'Hành động'}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Badge variant="secondary" className="mr-2">
              Đã chọn: {selectedIds.size}
            </Badge>
          )}
          
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
          
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Nhập
          </Button>

          <Button onClick={onAddLead}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white dark:bg-zinc-950 z-10">
            <TableRow>
              {visibleColumns.checkbox && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === filteredLeads.length && filteredLeads.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              
              {visibleColumns.company && (
                <TableHead>
                  <button
                    className="flex items-center font-semibold hover:text-primary"
                    onClick={() => handleSort('company')}
                  >
                    Công ty / Khách hàng
                    <SortIcon field="company" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.contact && (
                <TableHead>
                  <button
                    className="flex items-center font-semibold hover:text-primary"
                    onClick={() => handleSort('name')}
                  >
                    Liên hệ
                    <SortIcon field="name" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.source && (
                <TableHead>Nguồn</TableHead>
              )}

              {visibleColumns.status && (
                <TableHead>Trạng thái</TableHead>
              )}

              {visibleColumns.score && (
                <TableHead>
                  <button
                    className="flex items-center font-semibold hover:text-primary"
                    onClick={() => handleSort('score')}
                  >
                    Điểm
                    <SortIcon field="score" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.budget && (
                <TableHead>
                  <button
                    className="flex items-center font-semibold hover:text-primary"
                    onClick={() => handleSort('budget')}
                  >
                    Ngân sách
                    <SortIcon field="budget" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.assignee && (
                <TableHead>Phụ trách</TableHead>
              )}

              {visibleColumns.createdAt && (
                <TableHead>
                  <button
                    className="flex items-center font-semibold hover:text-primary"
                    onClick={() => handleSort('createdAt')}
                  >
                    Ngày tạo
                    <SortIcon field="createdAt" />
                  </button>
                </TableHead>
              )}

              {visibleColumns.actions && (
                <TableHead className="w-12"></TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead) => (
                <motion.tr
                  key={lead.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900',
                    selectedIds.has(lead.id) && 'bg-primary/5'
                  )}
                  onClick={() => handleView(lead)}
                >
                  {visibleColumns.checkbox && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(lead.id)}
                        onCheckedChange={() => handleSelectOne(lead.id)}
                      />
                    </TableCell>
                  )}

                  {visibleColumns.company && (
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {lead.company || lead.name}
                            </p>
                            {lead.company && (
                              <p className="text-sm text-zinc-500">{lead.position}</p>
                            )}
                          </div>
                          {lead.has_contact_info && (
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.contact && (
                    <TableCell>
                      <div className="space-y-1">
                        {lead.company && (
                          <p className="text-sm font-medium">{lead.name}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                          {lead.email && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={`mailto:${lead.email}`}
                                    className="hover:text-primary"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Mail className="h-3 w-3" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>{lead.email}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {lead.phone && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <a
                                    href={`tel:${lead.phone}`}
                                    className="hover:text-primary"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Phone className="h-3 w-3" />
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent>{lead.phone}</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.source && (
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {SOURCE_CONFIG[lead.source]?.icon}
                        <span className="text-sm">
                          {SOURCE_CONFIG[lead.source]?.label || lead.source}
                        </span>
                      </div>
                    </TableCell>
                  )}

                  {visibleColumns.status && (
                    <TableCell>
                      <Badge
                        className={cn(
                          'font-medium',
                          STATUS_CONFIG[lead.status]?.bgColor,
                          STATUS_CONFIG[lead.status]?.color
                        )}
                        variant="secondary"
                      >
                        {STATUS_CONFIG[lead.status]?.label || lead.status}
                      </Badge>
                    </TableCell>
                  )}

                  {visibleColumns.score && (
                    <TableCell>
                      {lead.score !== undefined && (
                        <Badge className={cn('font-mono', getScoreColor(lead.score))} variant="secondary">
                          {lead.score}
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  {visibleColumns.budget && (
                    <TableCell>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(lead.budget)}
                      </span>
                    </TableCell>
                  )}

                  {visibleColumns.assignee && (
                    <TableCell>
                      {lead.assignedTo?.name ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={lead.assignedTo.avatar} />
                            <AvatarFallback className="text-[10px]">
                              {getInitials(lead.assignedTo.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-zinc-400">—</span>
                      )}
                    </TableCell>
                  )}

                  {visibleColumns.createdAt && (
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-sm text-zinc-500">
                              {formatDistanceToNow(new Date(lead.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}

                  {visibleColumns.actions && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleView(lead)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditLead?.(lead)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onConvertLead?.(lead)}>
                            <ArrowUpRight className="mr-2 h-4 w-4" />
                            Chuyển thành Deal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(lead)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>

        {filteredLeads.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <User className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Không có lead nào
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                ? 'Thử điều chỉnh bộ lọc để tìm lead'
                : 'Bắt đầu bằng cách thêm lead mới'}
            </p>
            <Button className="mt-4" onClick={onAddLead}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm Lead
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          Hiển thị {filteredLeads.length} / {leads.length} lead
        </p>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa lead</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa lead <strong>{leadToDelete?.company || leadToDelete?.name}</strong>?
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LeadTable;
