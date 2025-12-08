'use client';

import React, { useState, useCallback } from 'react';
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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  MoreHorizontal,
  Plus,
  Phone,
  Mail,
  Building2,
  Calendar,
  DollarSign,
  User,
  Flame,
  ThermometerSun,
  Snowflake,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
import type { Lead, LeadStatus, LeadRating } from '../index';
import { LEAD_STATUS_CONFIG, getRatingColor } from '../index';

interface KanbanColumn {
  id: LeadStatus;
  title: string;
  titleVi: string;
  color: string;
  leads: Lead[];
}

interface PipelineKanbanProps {
  leads: Lead[];
  onLeadMove: (leadId: string, newStatus: LeadStatus) => Promise<void>;
  onLeadClick: (lead: Lead) => void;
  onLeadEdit: (lead: Lead) => void;
  onLeadDelete: (leadId: string) => void;
  onAddLead: (status: LeadStatus) => void;
  isLoading?: boolean;
}

// Sortable Lead Card Component
function SortableLeadCard({
  lead,
  onClick,
  onEdit,
  onDelete,
}: {
  lead: Lead;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
    data: {
      type: 'lead',
      lead,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getRatingIcon = (rating: LeadRating) => {
    switch (rating) {
      case 'hot':
        return <Flame className="h-3.5 w-3.5 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="h-3.5 w-3.5 text-orange-500" />;
      case 'cold':
        return <Snowflake className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return null;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer',
        isDragging && 'opacity-50 shadow-lg scale-105'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center justify-center h-6 cursor-grab active:cursor-grabbing border-b border-gray-100 dark:border-gray-700 rounded-t-lg bg-gray-50 dark:bg-gray-700/50"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>

      {/* Card Content */}
      <div className="p-3" onClick={onClick}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {lead.name}
            </h4>
            {lead.company && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                <Building2 className="h-3 w-3 flex-shrink-0" />
                {lead.company}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {getRatingIcon(lead.rating)}
                </TooltipTrigger>
                <TooltipContent>
                  <p className="capitalize">{lead.rating} lead</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  Sửa thông tin
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                  Gọi điện
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                  Gửi email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                  Tạo hoạt động
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                  Chuyển thành Contact
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                >
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1 mb-3">
          {lead.phone && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </p>
          )}
          {lead.email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
              <Mail className="h-3 w-3 flex-shrink-0" />
              {lead.email}
            </p>
          )}
        </div>

        {/* Budget & Score */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {lead.budget && (
            <Badge variant="secondary" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" />
              {formatCurrency(lead.budget)}
            </Badge>
          )}
          <div
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: `${getRatingColor(lead.rating)}20`,
              color: getRatingColor(lead.rating),
            }}
          >
            Score: {lead.score}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          {lead.assignedToId ? (
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {lead.assignedToId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-500">Đã phân công</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <User className="h-3 w-3" />
              Chưa phân công
            </span>
          )}
          
          {lead.nextFollowUp && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(lead.nextFollowUp).toLocaleDateString('vi-VN')}
            </span>
          )}
        </div>

        {/* Tags */}
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {lead.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
            {lead.tags.length > 3 && (
              <span className="text-[10px] text-gray-400">
                +{lead.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Lead Card Overlay (for drag preview)
function LeadCardOverlay({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-500 shadow-xl p-3 w-72">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {lead.name}
          </h4>
          {lead.company && (
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 flex-shrink-0" />
              {lead.company}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({
  column,
  onAddLead,
  onLeadClick,
  onLeadEdit,
  onLeadDelete,
}: {
  column: KanbanColumn;
  onAddLead: () => void;
  onLeadClick: (lead: Lead) => void;
  onLeadEdit: (lead: Lead) => void;
  onLeadDelete: (leadId: string) => void;
}) {
  const totalValue = column.leads.reduce((sum, lead) => sum + (lead.budget || 0), 0);

  return (
    <div className="flex flex-col min-w-[300px] max-w-[300px] h-full">
      {/* Column Header */}
      <div
        className="px-3 py-2 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: `${column.color}15` }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {column.titleVi}
          </span>
          <Badge
            variant="secondary"
            className="rounded-full text-xs"
            style={{
              backgroundColor: `${column.color}30`,
              color: column.color,
            }}
          >
            {column.leads.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onAddLead}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Total Value */}
      {totalValue > 0 && (
        <div
          className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 border-x"
          style={{ backgroundColor: `${column.color}08` }}
        >
          Tổng:{' '}
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
          }).format(totalValue)}
        </div>
      )}

      {/* Cards Container */}
      <div
        className="flex-1 p-2 space-y-2 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 rounded-b-lg border border-t-0 border-gray-200 dark:border-gray-700"
        style={{ minHeight: '200px' }}
      >
        <SortableContext
          items={column.leads.map((lead) => lead.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.leads.map((lead) => (
            <SortableLeadCard
              key={lead.id}
              lead={lead}
              onClick={() => onLeadClick(lead)}
              onEdit={() => onLeadEdit(lead)}
              onDelete={() => onLeadDelete(lead.id)}
            />
          ))}
        </SortableContext>

        {column.leads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">Không có leads</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={onAddLead}
            >
              <Plus className="h-3 w-3 mr-1" />
              Thêm lead
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Pipeline Kanban Component
export function PipelineKanban({
  leads,
  onLeadMove,
  onLeadClick,
  onLeadEdit,
  onLeadDelete,
  onAddLead,
  isLoading,
}: PipelineKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    // Initialize columns from config
    return LEAD_STATUS_CONFIG
      .filter((status) => !['won', 'lost'].includes(status.id))
      .map((status) => ({
        id: status.id as LeadStatus,
        title: status.name,
        titleVi: status.nameVi,
        color: status.color,
        leads: leads.filter((lead) => lead.status === status.id),
      }));
  });

  // Update columns when leads change
  React.useEffect(() => {
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        leads: leads.filter((lead) => lead.status === col.id),
      }))
    );
  }, [leads]);

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

  const activeLead = activeId
    ? leads.find((lead) => lead.id === activeId)
    : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeContainer = columns.find((col) =>
      col.leads.some((lead) => lead.id === active.id)
    )?.id;

    const overContainer =
      columns.find((col) => col.id === over.id)?.id ||
      columns.find((col) =>
        col.leads.some((lead) => lead.id === over.id)
      )?.id;

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns((prev) => {
      const activeColumn = prev.find((col) => col.id === activeContainer)!;
      const overColumn = prev.find((col) => col.id === overContainer)!;

      const activeIndex = activeColumn.leads.findIndex(
        (lead) => lead.id === active.id
      );

      const [movedLead] = activeColumn.leads.splice(activeIndex, 1);
      movedLead.status = overContainer;

      overColumn.leads.push(movedLead);

      return [...prev];
    });
  }, [columns]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      setActiveId(null);

      if (!over) return;

      const activeContainer = columns.find((col) =>
        col.leads.some((lead) => lead.id === active.id)
      )?.id;

      if (activeContainer) {
        const lead = leads.find((l) => l.id === active.id);
        if (lead && lead.status !== activeContainer) {
          await onLeadMove(active.id as string, activeContainer);
        }
      }
    },
    [columns, leads, onLeadMove]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddLead={() => onAddLead(column.id)}
              onLeadClick={onLeadClick}
              onLeadEdit={onLeadEdit}
              onLeadDelete={onLeadDelete}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead && <LeadCardOverlay lead={activeLead} />}
        </DragOverlay>
      </DndContext>
    </TooltipProvider>
  );
}

export default PipelineKanban;
