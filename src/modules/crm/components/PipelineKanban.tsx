'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  DollarSign,
  MoreVertical,
  Plus,
  GripVertical,
  Eye,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCRMStore } from '../store';
import { Lead, Deal, Pipeline, LeadStatus, DealStage } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface KanbanItemBase {
  id: string;
  title: string;
  subtitle?: string;
  value?: number;
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}

interface KanbanLead extends KanbanItemBase {
  type: 'lead';
  original: Lead;
}

interface KanbanDeal extends KanbanItemBase {
  type: 'deal';
  original: Deal;
}

type KanbanItem = KanbanLead | KanbanDeal;

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  items: KanbanItem[];
  order: number;
}

interface PipelineKanbanProps {
  pipelineType: 'lead' | 'deal';
  pipelineId?: string;
  onItemClick?: (item: KanbanItem) => void;
  onItemEdit?: (item: KanbanItem) => void;
  onItemDelete?: (item: KanbanItem) => void;
  onAddItem?: (stageId: string) => void;
  className?: string;
}

// ============================================================================
// LEAD STATUS CONFIG
// ============================================================================

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; order: number }> = {
  NEW: { label: 'Mới', color: '#3b82f6', order: 1 },
  CONTACTED: { label: 'Đã liên hệ', color: '#eab308', order: 2 },
  QUALIFIED: { label: 'Đủ điều kiện', color: '#8b5cf6', order: 3 },
  PROPOSAL: { label: 'Đề xuất', color: '#f97316', order: 4 },
  NEGOTIATION: { label: 'Đàm phán', color: '#06b6d4', order: 5 },
  WON: { label: 'Thành công', color: '#10b981', order: 6 },
  LOST: { label: 'Thất bại', color: '#ef4444', order: 7 },
  NURTURING: { label: 'Nuôi dưỡng', color: '#6366f1', order: 8 },
};

const DEAL_STAGE_CONFIG: Record<DealStage, { label: string; color: string; order: number }> = {
  PROSPECTING: { label: 'Tìm kiếm', color: '#3b82f6', order: 1 },
  QUALIFICATION: { label: 'Đánh giá', color: '#8b5cf6', order: 2 },
  NEEDS_ANALYSIS: { label: 'Phân tích nhu cầu', color: '#06b6d4', order: 3 },
  VALUE_PROPOSITION: { label: 'Đề xuất giá trị', color: '#f97316', order: 4 },
  DECISION_MAKERS: { label: 'Người quyết định', color: '#eab308', order: 5 },
  PERCEPTION_ANALYSIS: { label: 'Phân tích nhận thức', color: '#ec4899', order: 6 },
  PROPOSAL: { label: 'Đề xuất', color: '#14b8a6', order: 7 },
  NEGOTIATION: { label: 'Đàm phán', color: '#f59e0b', order: 8 },
  CLOSED_WON: { label: 'Thành công', color: '#10b981', order: 9 },
  CLOSED_LOST: { label: 'Thất bại', color: '#ef4444', order: 10 },
};

// ============================================================================
// SORTABLE ITEM COMPONENT
// ============================================================================

interface SortableItemProps {
  item: KanbanItem;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function SortableItem({ item, onView, onEdit, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatCurrency = (value: number) => {
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
      >
        <GripVertical className="h-4 w-4 text-zinc-400" />
      </div>

      {/* Card Content */}
      <div className="p-3 pl-6">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
              {item.title}
            </h4>
            {item.subtitle && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                {item.subtitle}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
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
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Value */}
        {item.value !== undefined && item.value > 0 && (
          <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
            <DollarSign className="h-3.5 w-3.5" />
            {formatCurrency(item.value)}
          </div>
        )}

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {item.assigneeName ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={item.assigneeAvatar} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(item.assigneeName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-zinc-500 truncate max-w-[80px]">
                      {item.assigneeName}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.assigneeName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <span className="text-xs text-zinc-400">Chưa phân công</span>
          )}

          <span className="text-[10px] text-zinc-400">
            {format(new Date(item.updatedAt), 'dd/MM', { locale: vi })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================================
// KANBAN COLUMN COMPONENT
// ============================================================================

interface KanbanColumnProps {
  column: KanbanColumn;
  onAddItem?: () => void;
  onItemView?: (item: KanbanItem) => void;
  onItemEdit?: (item: KanbanItem) => void;
  onItemDelete?: (item: KanbanItem) => void;
}

function KanbanColumnComponent({
  column,
  onAddItem,
  onItemView,
  onItemEdit,
  onItemDelete,
}: KanbanColumnProps) {
  const totalValue = useMemo(() => {
    return column.items.reduce((sum, item) => sum + (item.value || 0), 0);
  }, [column.items]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="flex-shrink-0 w-72 bg-zinc-50 dark:bg-zinc-950 rounded-xl">
      {/* Column Header */}
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {column.title}
            </h3>
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {column.items.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onAddItem}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {totalValue > 0 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Tổng: {formatCurrency(totalValue)} ₫
          </p>
        )}
      </div>

      {/* Column Items */}
      <div className="h-[calc(100vh-280px)] overflow-y-auto">
        <div className="p-2 space-y-2">
          <SortableContext
            items={column.items.map((i) => i.id)}
            strategy={horizontalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {column.items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onView={() => onItemView?.(item)}
                  onEdit={() => onItemEdit?.(item)}
                  onDelete={() => onItemDelete?.(item)}
                />
              ))}
            </AnimatePresence>
          </SortableContext>
          
          {column.items.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-xs text-zinc-400">Chưa có mục nào</p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 text-xs"
                onClick={onAddItem}
              >
                <Plus className="mr-1 h-3 w-3" />
                Thêm mới
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DRAG OVERLAY ITEM
// ============================================================================

function DragOverlayItem({ item }: { item: KanbanItem }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-72 bg-white dark:bg-zinc-900 rounded-lg border-2 border-primary shadow-xl p-3">
      <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
        {item.title}
      </h4>
      {item.subtitle && (
        <p className="text-xs text-zinc-500 truncate mt-0.5">{item.subtitle}</p>
      )}
      {item.value !== undefined && item.value > 0 && (
        <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 mt-2">
          <DollarSign className="h-3.5 w-3.5" />
          {formatCurrency(item.value)}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PipelineKanban({
  pipelineType,
  pipelineId,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onAddItem,
  className,
}: PipelineKanbanProps) {
  const [activeItem, setActiveItem] = useState<KanbanItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  // Store
  const {
    leads,
    deals,
    pipelines,
    moveLeadToStatus,
    moveDealToStage,
    selectLead,
    selectDeal,
  } = useCRMStore();

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get active pipeline or use default stages
  const activePipeline = useMemo(() => {
    if (pipelineId) {
      return pipelines.find((p: Pipeline) => p.id === pipelineId);
    }
    // Return default pipeline if none found
    return pipelines.find((p: Pipeline) => p.isDefault);
  }, [pipelines, pipelineId]);

  // Convert to kanban columns based on pipeline type
  const columns = useMemo<KanbanColumn[]>(() => {
    // Use status/stage configs to build columns
    if (pipelineType === 'lead') {
      const items = leads.filter((lead: Lead) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const matchesSearch = 
            lead.name.toLowerCase().includes(query) ||
            lead.company?.toLowerCase().includes(query) ||
            lead.email?.toLowerCase().includes(query);
          if (!matchesSearch) return false;
        }
        // Assignee filter
        if (filterAssignee !== 'all' && lead.assignedTo?.id !== filterAssignee) {
          return false;
        }
        return true;
      });

      return Object.entries(LEAD_STATUS_CONFIG)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([status, config]) => ({
          id: status,
          title: config.label,
          color: config.color,
          order: config.order,
          items: items
            .filter((lead: Lead) => lead.status === status)
            .map((lead: Lead): KanbanItem => ({
              id: lead.id,
              type: 'lead',
              title: lead.company || lead.name,
              subtitle: lead.company ? lead.name : lead.email,
              value: lead.budget,
              assigneeId: lead.assignedTo?.id,
              assigneeName: lead.assignedTo?.name,
              assigneeAvatar: lead.assignedTo?.avatar,
              createdAt: lead.createdAt,
              updatedAt: lead.updatedAt,
              tags: lead.tags,
              original: lead,
            })),
        }));
    }

    // Deal pipeline
    const dealItems = deals.filter((deal: Deal) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          deal.name.toLowerCase().includes(query) ||
          deal.contact?.name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      if (filterAssignee !== 'all' && deal.owner?.id !== filterAssignee) {
        return false;
      }
      return true;
    });

    return Object.entries(DEAL_STAGE_CONFIG)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([stage, config]) => ({
        id: stage,
        title: config.label,
        color: config.color,
        order: config.order,
        items: dealItems
          .filter((deal: Deal) => deal.stage === stage)
          .map((deal: Deal): KanbanItem => ({
            id: deal.id,
            type: 'deal',
            title: deal.name,
            subtitle: deal.contact?.name,
            value: deal.value,
            assigneeId: deal.owner?.id,
            assigneeName: deal.owner?.name,
            assigneeAvatar: deal.owner?.avatar,
            createdAt: deal.createdAt,
            updatedAt: deal.updatedAt,
            tags: deal.tags,
            original: deal,
          })),
      }));
  }, [leads, deals, pipelineType, searchQuery, filterAssignee]);

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map<string, string>();
    if (pipelineType === 'lead') {
      leads.forEach((lead: Lead) => {
        if (lead.assignedTo?.id && lead.assignedTo?.name) {
          uniqueAssignees.set(lead.assignedTo.id, lead.assignedTo.name);
        }
      });
    } else {
      deals.forEach((deal: Deal) => {
        if (deal.owner?.id && deal.owner?.name) {
          uniqueAssignees.set(deal.owner.id, deal.owner.name);
        }
      });
    }
    return Array.from(uniqueAssignees.entries()).map(([id, name]) => ({ id, name }));
  }, [leads, deals, pipelineType]);

  // Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id as string;

    for (const column of columns) {
      const item = column.items.find((i) => i.id === activeId);
      if (item) {
        setActiveItem(item);
        break;
      }
    }
  }, [columns]);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Handle drag over logic if needed
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find source and destination columns
    let sourceColumn: KanbanColumn | undefined;
    let destinationColumn: KanbanColumn | undefined;
    let activeKanbanItem: KanbanItem | undefined;

    for (const column of columns) {
      const item = column.items.find((i) => i.id === activeId);
      if (item) {
        sourceColumn = column;
        activeKanbanItem = item;
      }
      if (column.id === overId || column.items.some((i) => i.id === overId)) {
        destinationColumn = column;
      }
    }

    if (!sourceColumn || !destinationColumn || !activeKanbanItem) return;

    // Move item to new column/stage
    if (sourceColumn.id !== destinationColumn.id) {
      if (pipelineType === 'lead') {
        moveLeadToStatus(activeId, destinationColumn.id as LeadStatus);
      } else {
        moveDealToStage(activeId, destinationColumn.id as DealStage);
      }
    }
  }, [columns, pipelineType, moveLeadToStatus, moveDealToStage]);

  const handleItemView = useCallback((item: KanbanItem) => {
    if (item.type === 'lead') {
      selectLead(item.original);
    } else {
      selectDeal(item.original);
    }
    onItemClick?.(item);
  }, [selectLead, selectDeal, onItemClick]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>

          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Người phụ trách" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả người phụ trách</SelectItem>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">
            {pipelineType === 'lead' ? 'Lead Pipeline' : 'Deal Pipeline'}
            {activePipeline && `: ${activePipeline.name}`}
          </span>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="flex gap-4 p-4 min-w-max">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {columns.map((column) => (
                <KanbanColumnComponent
                  key={column.id}
                  column={column}
                  onAddItem={() => onAddItem?.(column.id)}
                  onItemView={handleItemView}
                  onItemEdit={onItemEdit}
                  onItemDelete={onItemDelete}
                />
              ))}

              <DragOverlay>
                {activeItem && <DragOverlayItem item={activeItem} />}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PipelineKanban;
