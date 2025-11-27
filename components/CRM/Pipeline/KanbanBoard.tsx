'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { PIPELINE_STAGES, getScoreCategory, formatCurrency } from '@/lib/crm-config';
import type { Lead } from '@/lib/types/crm';

interface LeadCardProps {
  lead: Lead & { 
    deal_value?: number; 
    score?: number;
    probability?: number;
  };
  onLeadClick: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: string) => void;
}

function LeadCard({ lead, onLeadClick, onStageChange }: LeadCardProps) {
  const scoreCategory = getScoreCategory(lead.score || 0);
  
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => !isDragging && onLeadClick(lead)}
      className={`
        bg-white rounded-lg border-2 p-4 mb-3 cursor-move
        transition-all duration-200 hover:shadow-lg
        ${isDragging ? 'shadow-2xl opacity-50 z-50' : 'shadow-sm'}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
            {lead.name}
          </h4>
          <p className="text-xs text-gray-500">{lead.phone || 'Chưa có SĐT'}</p>
        </div>
        
        {/* Score Badge */}
        {lead.score !== undefined && lead.score > 0 && (
          <div className={`
            ${scoreCategory.bgColor} ${scoreCategory.textColor}
            px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1
          `}>
            <span>{scoreCategory.icon}</span>
            <span>{lead.score}</span>
          </div>
        )}
      </div>

      {/* Deal Value */}
      {lead.deal_value && lead.deal_value > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💰</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">
              {formatCurrency(lead.deal_value)}
            </p>
            {lead.probability && (
              <p className="text-xs text-gray-500">
                {lead.probability}% xác suất
              </p>
            )}
          </div>
        </div>
      )}

      {/* Message Preview */}
      {lead.message && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {lead.message}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {/* Source */}
        <span className="text-xs text-gray-500 flex items-center gap-1">
          {(lead.source as string).includes('website') && '🌐'}
          {lead.source === 'phone' && '📞'}
          {lead.source === 'email' && '✉️'}
          {lead.source === 'contact_form' && '📝'}
          {lead.source === 'messenger' && '💌'}
          {lead.source === 'zalo' && '💬'}
          <span className="capitalize">
            {(lead.source as string)?.replace('website_', '').replace('_', ' ')}
          </span>
        </span>

        {/* Assigned User */}
        {lead.assigned_to && (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {lead.assigned_user?.full_name?.[0] || 'A'}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions (on hover) */}
      <div className="mt-2 pt-2 border-t border-gray-100 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Call action
          }}
          className="flex-1 text-xs py-1 px-2 bg-green-50 hover:bg-green-100 text-green-700 rounded"
        >
          📞 Gọi
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Email action
          }}
          className="flex-1 text-xs py-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded"
        >
          📧 Email
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Note action
          }}
          className="flex-1 text-xs py-1 px-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded"
        >
          📝 Ghi chú
        </button>
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  stage: typeof PIPELINE_STAGES[number];
  leads: (Lead & { deal_value?: number; score?: number; probability?: number })[];
  onLeadClick: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: string) => void;
}

function PipelineColumn({ stage, leads, onLeadClick, onStageChange }: PipelineColumnProps) {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
  const avgProbability = leads.length > 0
    ? Math.round(leads.reduce((sum, lead) => sum + (lead.probability || stage.probability), 0) / leads.length)
    : stage.probability;

  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stage },
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div ref={setNodeRef} className={`transition-colors ${isOver ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
      {/* Column Header */}
      <div className={`
        ${stage.bgColor} ${stage.borderColor} ${stage.textColor}
        border-2 rounded-t-lg p-4
      `}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <span className="text-lg">{stage.id === 'new' ? '🆕' : stage.id === 'won' ? '🎉' : stage.id === 'lost' ? '😞' : '📊'}</span>
            {stage.name}
          </h3>
          <span className="text-xs font-semibold px-2 py-1 bg-white/50 rounded-full">
            {leads.length}
          </span>
        </div>

        {/* Stats */}
        <div className="text-xs space-y-1">
          {totalValue > 0 && (
            <div className="flex justify-between">
              <span className="opacity-75">Tổng giá trị:</span>
              <span className="font-bold">{formatCurrency(totalValue)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="opacity-75">Xác suất TB:</span>
            <span className="font-bold">{avgProbability}%</span>
          </div>
        </div>
      </div>

        {/* Cards Container */}
        <div className={`
          ${stage.bgColor} ${stage.borderColor}
          border-2 border-t-0 rounded-b-lg p-3
          min-h-[500px] max-h-[calc(100vh-300px)] overflow-y-auto
          custom-scrollbar
        `}>
          <AnimatePresence>
            {leads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-gray-400 text-sm mt-8"
              >
                <p>Kéo thả khách hàng vào đây</p>
                <p className="text-xs mt-1">hoặc chuyển giai đoạn</p>
              </motion.div>
            ) : (
              leads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onLeadClick={onLeadClick}
                  onStageChange={onStageChange}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  leads: (Lead & { deal_value?: number; score?: number; probability?: number })[];
  onLeadClick: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: string) => void;
  onRefresh?: () => void;
}

export default function KanbanBoard({ leads, onLeadClick, onStageChange, onRefresh }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group leads by stage - direct mapping (status = stage)
  const leadsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage.id] = leads.filter(lead => {
      const status = lead.status || 'new';
      // Direct mapping: status IS the stage ID
      // Stages: new, contacted, qualified, proposal, won, lost
      return status === stage.id;
    });
    return acc;
  }, {} as Record<string, typeof leads>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const leadId = active.id as string;
    const targetStageId = over.id as string;
    
    // Find the lead
    const lead = leads.find(l => l.id === leadId);
    
    // Validate target stage exists
    const targetStage = PIPELINE_STAGES.find(s => s.id === targetStageId);
    
    if (lead && targetStage) {
      // Direct comparison - status IS the stage ID
      const currentStageId = lead.status || 'new';
      
      // Only update if actually moving to a different stage
      if (currentStageId !== targetStageId) {
        console.log(`[KanbanBoard] Moving lead ${leadId} from ${currentStageId} to ${targetStageId}`);
        onStageChange(leadId, targetStageId);
      } else {
        console.log(`[KanbanBoard] Lead ${leadId} dropped on same stage ${targetStageId}, no action`);
      }
    }
    
    setActiveId(null);
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <div className="w-full">
      {/* Pipeline Stats Summary */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Tổng khách hàng tiềm năng</p>
          <p className="text-3xl font-bold">{leads.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Tổng giá trị</p>
          <p className="text-2xl font-bold">
            {formatCurrency(leads.reduce((sum, l) => sum + (l.deal_value || 0), 0))}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Tỷ lệ chuyển đổi</p>
          <p className="text-3xl font-bold">
            {leads.length > 0 ? Math.round((leadsByStage['won']?.length || 0) / leads.length * 100) : 0}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Khách hàng tiềm năng nóng</p>
          <p className="text-3xl font-bold">
            {leads.filter(l => (l.score || 0) >= 80).length}
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            leads={leadsByStage[stage.id] || []}
            onLeadClick={onLeadClick}
            onStageChange={onStageChange}
          />
        ))}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>

    {/* Drag Overlay */}
    <DragOverlay>
      {activeLead ? (
        <div className="bg-white rounded-lg border-2 border-blue-500 p-4 shadow-2xl opacity-90 rotate-3 scale-105">
          <h4 className="font-semibold text-gray-900 text-sm">{activeLead.name}</h4>
          <p className="text-xs text-gray-500">{activeLead.phone}</p>
        </div>
      ) : null}
    </DragOverlay>
    </DndContext>
  );
}
