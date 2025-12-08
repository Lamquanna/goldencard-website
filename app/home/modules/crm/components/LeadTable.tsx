'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  MoreHorizontal,
  Phone,
  Mail,
  Building2,
  Calendar,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Flame,
  ThermometerSun,
  Snowflake,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Types
import type { Lead, LeadStatus, LeadSource, LeadRating } from '../index';
import { LEAD_STATUS_CONFIG, LEAD_SOURCE_CONFIG, getRatingColor } from '../index';

interface LeadTableProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadEdit: (lead: Lead) => void;
  onLeadDelete: (leadId: string) => void;
  onLeadsDelete: (leadIds: string[]) => void;
  onLeadAssign: (leadId: string, userId: string) => void;
  onLeadsAssign: (leadIds: string[], userId: string) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onExport: (leadIds?: string[]) => void;
  onImport: () => void;
  onAddLead: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
  users?: { id: string; name: string; avatar?: string }[];
}

type SortField = 'name' | 'company' | 'status' | 'score' | 'createdAt' | 'lastContactAt';
type SortDirection = 'asc' | 'desc';

export function LeadTable({
  leads,
  onLeadClick,
  onLeadEdit,
  onLeadDelete,
  onLeadsDelete,
  onLeadAssign,
  onLeadsAssign,
  onStatusChange,
  onExport,
  onImport,
  onAddLead,
  onRefresh,
  isLoading,
  users = [],
}: LeadTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<LeadRating | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch =
            lead.name.toLowerCase().includes(query) ||
            lead.email?.toLowerCase().includes(query) ||
            lead.phone?.includes(query) ||
            lead.company?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }

        // Status filter
        if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

        // Source filter
        if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

        // Rating filter
        if (ratingFilter !== 'all' && lead.rating !== ratingFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let aValue: unknown = a[sortField];
        let bValue: unknown = b[sortField];

        if (sortField === 'createdAt' || sortField === 'lastContactAt') {
          aValue = aValue ? new Date(aValue as Date).getTime() : 0;
          bValue = bValue ? new Date(bValue as Date).getTime() : 0;
        }

        if (typeof aValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue);
        }

        return sortDirection === 'asc'
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      });
  }, [leads, searchQuery, statusFilter, sourceFilter, ratingFilter, sortField, sortDirection]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredLeads.map((lead) => lead.id));
    }
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedIds((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRatingIcon = (rating: LeadRating) => {
    switch (rating) {
      case 'hot':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="h-4 w-4 text-orange-500" />;
      case 'cold':
        return <Snowflake className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: LeadStatus) => {
    const config = LEAD_STATUS_CONFIG.find((s) => s.id === status);
    if (!config) return null;

    return (
      <Badge
        variant="secondary"
        style={{
          backgroundColor: `${config.color}20`,
          color: config.color,
        }}
      >
        {config.nameVi}
      </Badge>
    );
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email, SĐT, công ty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filters */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Lọc
                  {(statusFilter !== 'all' || sourceFilter !== 'all' || ratingFilter !== 'all') && (
                    <Badge variant="secondary" className="ml-2">
                      {[statusFilter, sourceFilter, ratingFilter].filter((f) => f !== 'all').length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trạng thái</label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => setStatusFilter(value as LeadStatus | 'all')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        {LEAD_STATUS_CONFIG.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                              {status.nameVi}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nguồn</label>
                    <Select
                      value={sourceFilter}
                      onValueChange={(value) => setSourceFilter(value as LeadSource | 'all')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả nguồn" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả nguồn</SelectItem>
                        {LEAD_SOURCE_CONFIG.map((source) => (
                          <SelectItem key={source.id} value={source.id}>
                            {source.nameVi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Đánh giá</label>
                    <Select
                      value={ratingFilter}
                      onValueChange={(value) => setRatingFilter(value as LeadRating | 'all')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="hot">
                          <div className="flex items-center gap-2">
                            <Flame className="h-4 w-4 text-red-500" />
                            Hot
                          </div>
                        </SelectItem>
                        <SelectItem value="warm">
                          <div className="flex items-center gap-2">
                            <ThermometerSun className="h-4 w-4 text-orange-500" />
                            Warm
                          </div>
                        </SelectItem>
                        <SelectItem value="cold">
                          <div className="flex items-center gap-2">
                            <Snowflake className="h-4 w-4 text-blue-500" />
                            Cold
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setStatusFilter('all');
                      setSourceFilter('all');
                      setRatingFilter('all');
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import từ Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport()}>
                  <Download className="h-4 w-4 mr-2" />
                  Export tất cả
                </DropdownMenuItem>
                {selectedIds.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onExport(selectedIds)}>
                      <Download className="h-4 w-4 mr-2" />
                      Export đã chọn ({selectedIds.length})
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" onClick={onAddLead}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Lead
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Đã chọn {selectedIds.length} lead
            </span>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Phân công
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {users.map((user) => (
                    <DropdownMenuItem
                      key={user.id}
                      onClick={() => onLeadsAssign(selectedIds, user.id)}
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {user.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onLeadsDelete(selectedIds)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds([])}
              >
                Bỏ chọn
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedIds.length === filteredLeads.length &&
                      filteredLeads.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="-ml-3"
                  >
                    Tên
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('company')}
                    className="-ml-3"
                  >
                    Công ty
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Liên hệ</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('status')}
                    className="-ml-3"
                  >
                    Trạng thái
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('score')}
                    className="-ml-3"
                  >
                    Score
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Người phụ trách</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('createdAt')}
                    className="-ml-3"
                  >
                    Ngày tạo
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                  </Button>
                </TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">Không có leads nào</p>
                      <p className="text-sm mt-1">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Thử thay đổi bộ lọc để xem kết quả'
                          : 'Bắt đầu bằng cách thêm lead mới'}
                      </p>
                      <Button className="mt-4" onClick={onAddLead}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm Lead
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => onLeadClick(lead)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.includes(lead.id)}
                        onCheckedChange={() => handleSelectLead(lead.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRatingIcon(lead.rating)}
                        <span className="font-medium">{lead.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.company && (
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Building2 className="h-4 w-4" />
                          {lead.company}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => onStatusChange(lead.id, value as LeadStatus)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LEAD_STATUS_CONFIG.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: status.color }}
                                />
                                {status.nameVi}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div
                        className="inline-flex items-center px-2 py-1 rounded text-sm font-medium"
                        style={{
                          backgroundColor: `${getRatingColor(lead.rating)}20`,
                          color: getRatingColor(lead.rating),
                        }}
                      >
                        {lead.score}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(lead.budget)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {lead.assignedToId ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {lead.assignedToId.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {users.map((user) => (
                              <DropdownMenuItem
                                key={user.id}
                                onClick={() => onLeadAssign(lead.id, user.id)}
                              >
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>
                                    {user.name.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {user.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onLeadClick(lead)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onLeadEdit(lead)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onLeadDelete(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Hiển thị {filteredLeads.length} / {leads.length} leads
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-red-500" />
              {leads.filter((l) => l.rating === 'hot').length} Hot
            </span>
            <span className="flex items-center gap-1">
              <ThermometerSun className="h-4 w-4 text-orange-500" />
              {leads.filter((l) => l.rating === 'warm').length} Warm
            </span>
            <span className="flex items-center gap-1">
              <Snowflake className="h-4 w-4 text-blue-500" />
              {leads.filter((l) => l.rating === 'cold').length} Cold
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default LeadTable;
