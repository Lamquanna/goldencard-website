'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, Search, Plus, MoreHorizontal, SlidersHorizontal,
  Eye, Edit2, Trash2, Phone, Mail,
  TrendingUp, TrendingDown, Target, Activity, Flame, Zap,
  Download, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, canViewAll as checkCanViewAll, hasPermission, canEditAll as checkCanEditAll } from '@/lib/permissions';
import { getAuthUser } from '@/lib/auth-utils';
import { exportToExcel, leadsExportColumns } from '@/lib/excel-export';
import LeadCreationModal from '@/components/ERP/LeadCreationModal';

// ============================================
// TYPES
// ============================================
interface Lead {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  score: number;
  value?: number;
  assignedTo?: string;
  assignedUser?: { id: string; name: string; avatar?: string };
  tags: string[];
  lastActivity?: Date;
  nextFollowUp?: Date;
  createdAt: Date;
  notes?: string;
  activities: LeadActivity[];
}

interface LeadActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'status_change';
  title: string;
  description?: string;
  user: string;
  createdAt: Date;
}

// ============================================
// MOCK DATA
// ============================================
const LEAD_SOURCES = [
  'Website', 'Facebook', 'Google Ads', 'Referral', 'Cold Call', 'Event', 'Partner', 'LinkedIn'
];

const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-001',
    name: 'Công ty TNHH ABC Solar',
    company: 'ABC Corporation',
    email: 'contact@abc.com.vn',
    phone: '0901234567',
    source: 'Website',
    status: 'qualified',
    priority: 'high',
    score: 85,
    value: 5500000000,
    assignedTo: 'admin',
    assignedUser: { id: 'admin', name: 'Admin User' },
    tags: ['Solar Rooftop', 'Enterprise', 'Urgent'],
    lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-06-01'),
    activities: [
      { id: 'act-1', type: 'call', title: 'Gọi điện giới thiệu', user: 'Admin User', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      { id: 'act-2', type: 'email', title: 'Gửi báo giá sơ bộ', user: 'Admin User', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    ],
  },
  {
    id: 'lead-002',
    name: 'Nhà máy XYZ Manufacturing',
    company: 'XYZ Manufacturing',
    email: 'info@xyz-mfg.vn',
    phone: '0912345678',
    source: 'Google Ads',
    status: 'proposal',
    priority: 'urgent',
    score: 92,
    value: 12000000000,
    assignedTo: 'sale',
    assignedUser: { id: 'sale', name: 'Nhân viên Sale' },
    tags: ['Solar Farm', 'Industrial', 'Hot Lead'],
    lastActivity: new Date(Date.now() - 30 * 60 * 1000),
    nextFollowUp: new Date(Date.now() + 2 * 60 * 60 * 1000),
    createdAt: new Date('2024-05-15'),
    activities: [
      { id: 'act-3', type: 'meeting', title: 'Họp trình bày phương án', user: 'Nhân viên Sale', createdAt: new Date(Date.now() - 30 * 60 * 1000) },
    ],
  },
  {
    id: 'lead-003',
    name: 'Anh Nguyễn Văn C',
    company: '',
    email: 'nguyenvanc@gmail.com',
    phone: '0987654321',
    source: 'Facebook',
    status: 'contacted',
    priority: 'medium',
    score: 45,
    value: 250000000,
    assignedTo: 'admin',
    assignedUser: { id: 'admin', name: 'Admin User' },
    tags: ['Residential', 'Home Solar'],
    lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date('2024-06-10'),
    activities: [],
  },
  {
    id: 'lead-004',
    name: 'Khu công nghiệp Long Hậu',
    company: 'Long Hau IP',
    email: 'investment@longhau.vn',
    phone: '0923456789',
    source: 'Referral',
    status: 'new',
    priority: 'high',
    score: 78,
    value: 25000000000,
    tags: ['Mega Project', 'Industrial Park'],
    createdAt: new Date('2024-06-14'),
    activities: [],
  },
  {
    id: 'lead-005',
    name: 'Trường ĐH Bách Khoa',
    company: 'HCMUT',
    email: 'facilities@hcmut.edu.vn',
    phone: '0934567890',
    source: 'Event',
    status: 'won',
    priority: 'medium',
    score: 100,
    value: 3500000000,
    assignedTo: 'sale',
    assignedUser: { id: 'sale', name: 'Nhân viên Sale' },
    tags: ['Education', 'Government'],
    lastActivity: new Date('2024-06-01'),
    createdAt: new Date('2024-04-01'),
    activities: [],
  },
];

// ============================================
// HELPERS
// ============================================
const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + ' tỷ';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(0) + ' triệu';
  }
  return value.toLocaleString('vi-VN');
};

const formatTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'new':
      return { label: 'Mới', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'contacted':
      return { label: 'Đã liên hệ', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
    case 'qualified':
      return { label: 'Đủ điều kiện', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
    case 'proposal':
      return { label: 'Báo giá', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'negotiation':
      return { label: 'Đàm phán', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    case 'won':
      return { label: 'Thành công', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'lost':
      return { label: 'Thất bại', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return { label: 'Khẩn cấp', color: 'text-red-400', icon: Flame };
    case 'high':
      return { label: 'Cao', color: 'text-orange-400', icon: TrendingUp };
    case 'medium':
      return { label: 'Trung bình', color: 'text-amber-400', icon: Target };
    case 'low':
      return { label: 'Thấp', color: 'text-gray-400', icon: TrendingDown };
    default:
      return { label: priority, color: 'text-gray-400', icon: Target };
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-400 bg-emerald-500/10';
  if (score >= 60) return 'text-amber-400 bg-amber-500/10';
  if (score >= 40) return 'text-orange-400 bg-orange-500/10';
  return 'text-red-400 bg-red-500/10';
};

// ============================================
// LEAD SCORE BADGE
// ============================================
function LeadScoreBadge({ score }: { score: number }) {
  const colorClass = getScoreColor(score);
  
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${colorClass}`}>
      <Zap className="w-3.5 h-3.5" />
      <span className="text-sm font-medium">{score}</span>
    </div>
  );
}

// ============================================
// LEAD CARD (for Kanban view)
// ============================================
function LeadCard({ lead, onView }: { lead: Lead; onView: () => void }) {
  const statusConfig = getStatusConfig(lead.status);
  const priorityConfig = getPriorityConfig(lead.priority);
  const PriorityIcon = priorityConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onClick={onView}
      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 
                 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white truncate group-hover:text-amber-400 transition-colors">
            {lead.name}
          </h4>
          {lead.company && (
            <p className="text-sm text-white/50 truncate mt-0.5">{lead.company}</p>
          )}
        </div>
        <LeadScoreBadge score={lead.score} />
      </div>

      {lead.value && (
        <div className="mt-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-emerald-400 font-medium">{formatCurrency(lead.value)}</span>
        </div>
      )}

      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {lead.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
            {tag}
          </span>
        ))}
        {lead.tags.length > 2 && (
          <span className="text-[10px] text-white/40">+{lead.tags.length - 2}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        {lead.assignedUser ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                          flex items-center justify-center text-[10px] text-white font-medium">
              {lead.assignedUser.name.charAt(0)}
            </div>
            <span className="text-xs text-white/50">{lead.assignedUser.name}</span>
          </div>
        ) : (
          <span className="text-xs text-white/30">Chưa phân công</span>
        )}

        {lead.lastActivity && (
          <span className="text-xs text-white/40">{formatTimeAgo(lead.lastActivity)}</span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// LEAD ROW (for Table view)
// ============================================
function LeadRow({ lead, onView, onEdit, onDelete, canEdit = true, canDelete = true }: {
  lead: Lead;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getStatusConfig(lead.status);
  const priorityConfig = getPriorityConfig(lead.priority);
  const PriorityIcon = priorityConfig.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group hover:bg-white/[0.02] transition-colors"
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 
                        flex items-center justify-center text-white font-bold">
            {lead.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-white hover:text-amber-400 cursor-pointer transition-colors"
               onClick={onView}>
              {lead.name}
            </p>
            {lead.company && (
              <p className="text-sm text-white/50">{lead.company}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-4">
        <div className="space-y-1">
          {lead.email && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Mail className="w-4 h-4" />
              <span>{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Phone className="w-4 h-4" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
      </td>

      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </td>

      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <PriorityIcon className={`w-4 h-4 ${priorityConfig.color}`} />
          <span className={`text-sm ${priorityConfig.color}`}>{priorityConfig.label}</span>
        </div>
      </td>

      <td className="px-4 py-4">
        <LeadScoreBadge score={lead.score} />
      </td>

      <td className="px-4 py-4">
        {lead.value ? (
          <span className="text-emerald-400 font-medium">{formatCurrency(lead.value)}</span>
        ) : (
          <span className="text-white/30">-</span>
        )}
      </td>

      <td className="px-4 py-4">
        {lead.assignedUser ? (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 
                          flex items-center justify-center text-xs text-white font-medium">
              {lead.assignedUser.name.charAt(0)}
            </div>
            <span className="text-sm text-white/70">{lead.assignedUser.name}</span>
          </div>
        ) : (
          <span className="text-white/30 text-sm">Chưa phân công</span>
        )}
      </td>

      <td className="px-4 py-4">
        {lead.lastActivity && (
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Activity className="w-4 h-4" />
            <span>{formatTimeAgo(lead.lastActivity)}</span>
          </div>
        )}
      </td>

      <td className="px-4 py-4">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-white/60" />
          </button>

          <AnimatePresence>
            {showActions && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowActions(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 z-20 w-44 py-1 rounded-xl 
                             bg-[#1a1a2e] border border-white/10 shadow-2xl"
                >
                  <button
                    onClick={() => { onView(); setShowActions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                               hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem chi tiết</span>
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => { onEdit(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}
                  {!canEdit && (
                    <div className="w-full flex items-center gap-3 px-4 py-2.5 text-white/30 cursor-not-allowed">
                      <Lock className="w-4 h-4" />
                      <span>Không có quyền sửa</span>
                    </div>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => { onDelete(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 
                                 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </td>
    </motion.tr>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  // User auth state
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('staff');

  // Permission checks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const canViewAll = useMemo(() => checkCanViewAll(userRole, 'leads'), [userRole]);
  const canEditAllLeads = useMemo(() => checkCanEditAll(userRole, 'leads'), [userRole]);
  const canCreate = useMemo(() => hasPermission(userRole, 'leads', 'create'), [userRole]);
  const canDelete = useMemo(() => hasPermission(userRole, 'leads', 'delete'), [userRole]);
  const canExport = useMemo(() => hasPermission(userRole, 'leads', 'export'), [userRole]);

  useEffect(() => {
    const authUser = getAuthUser();
    if (authUser) {
      setCurrentUserId(authUser.id);
      setUserRole(authUser.role);
    }
  }, []);

  // Filter leads based on permissions
  const visibleLeads = useMemo(() => {
    // For leads, most sales can view all leads but only edit assigned ones
    // This is controlled at the action level
    return leads;
  }, [leads]);

  // Stats
  const stats = useMemo(() => ({
    total: visibleLeads.length,
    new: visibleLeads.filter(l => l.status === 'new').length,
    qualified: visibleLeads.filter(l => l.status === 'qualified' || l.status === 'proposal').length,
    won: visibleLeads.filter(l => l.status === 'won').length,
    totalValue: visibleLeads.reduce((sum, l) => sum + (l.value || 0), 0),
    avgScore: Math.round(visibleLeads.reduce((sum, l) => sum + l.score, 0) / Math.max(visibleLeads.length, 1)),
  }), [visibleLeads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    let result = [...visibleLeads];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(l =>
        l.name.toLowerCase().includes(searchLower) ||
        l.company?.toLowerCase().includes(searchLower) ||
        l.email?.toLowerCase().includes(searchLower) ||
        l.phone?.includes(search)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(l => l.status === selectedStatus);
    }

    if (selectedSource !== 'all') {
      result = result.filter(l => l.source === selectedSource);
    }

    if (selectedPriority !== 'all') {
      result = result.filter(l => l.priority === selectedPriority);
    }

    return result;
  }, [visibleLeads, search, selectedStatus, selectedSource, selectedPriority]);

  // Check if user can edit a specific lead
  const canEditLead = (lead: Lead) => {
    if (canEditAllLeads) return true;
    return lead.assignedTo === currentUserId;
  };

  // Group leads by status for Kanban
  const leadsByStatus = useMemo(() => {
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    return stages.map(status => ({
      status,
      config: getStatusConfig(status),
      leads: filteredLeads.filter(l => l.status === status),
    }));
  }, [filteredLeads]);

  // Export to Excel handler
  const handleExportExcel = useCallback(() => {
    const exportData = filteredLeads.map(lead => ({
      id: lead.id,
      company: lead.company || lead.name,
      contact: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      sourceLabel: lead.source,
      statusLabel: getStatusConfig(lead.status).label,
      value: lead.value ? formatCurrency(lead.value) : '',
      notes: lead.notes || '',
      assignedToName: lead.assignedUser?.name || '',
      createdAt: lead.createdAt,
      lastActivity: lead.lastActivity,
    }));
    
    const filename = `leads_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(exportData, leadsExportColumns, filename);
  }, [filteredLeads]);

  // Handle lead creation
  const handleCreateLead = useCallback((leadData: any) => {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: leadData.name,
      company: leadData.company,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source,
      status: 'new',
      priority: leadData.priority,
      score: 50, // Default score
      value: leadData.value,
      tags: leadData.tags,
      notes: leadData.notes,
      createdAt: new Date(),
      activities: [],
    };
    setLeads([newLead, ...leads]);
  }, [leads]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-blue-400" />
              Quản lý Leads
            </h1>
            <p className="text-white/60 mt-1">
              {stats.total} khách hàng tiềm năng · Tổng giá trị: {formatCurrency(stats.totalValue)}
            </p>
            {!canEditAllLeads && (
              <div className="flex items-center gap-1 text-sm text-amber-400 mt-1">
                <Lock className="w-4 h-4" />
                <span>Bạn chỉ có thể chỉnh sửa leads được phân công cho mình</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canExport && (
              <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 
                               border border-white/10 text-white/70 hover:bg-white/10 transition-colors">
                <Download className="w-4 h-4" />
                <span>Xuất Excel</span>
              </button>
            )}

            {canCreate && (
              <button
                onClick={() => setShowLeadModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                             bg-gradient-to-r from-blue-500 to-cyan-500
                             text-white font-medium hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4" />
                <span>Thêm Lead</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">Tổng Leads</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm">Leads mới</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.new}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-purple-400/80 text-sm">Đang xử lý</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{stats.qualified}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400/80 text-sm">Thành công</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.won}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400/80 text-sm">Tổng giá trị</p>
            <p className="text-xl font-bold text-amber-400 mt-1">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <p className="text-cyan-400/80 text-sm">Lead Score TB</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{stats.avgScore}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, email, SĐT..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50
                       transition-colors"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-blue-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Mới</option>
            <option value="contacted">Đã liên hệ</option>
            <option value="qualified">Đủ điều kiện</option>
            <option value="proposal">Báo giá</option>
            <option value="won">Thành công</option>
            <option value="lost">Thất bại</option>
          </select>

          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-blue-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả nguồn</option>
            {LEAD_SOURCES.map(source => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-blue-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả độ ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showFilters 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {viewMode === 'table' ? (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Khách hàng</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Liên hệ</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Ưu tiên</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Score</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Giá trị</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Phụ trách</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Hoạt động</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredLeads.map((lead) => {
                    const leadEditable = canEditLead(lead);
                    return (
                      <LeadRow
                        key={lead.id}
                        lead={lead}
                        onView={() => console.log('View', lead)}
                        onEdit={() => {
                          if (leadEditable) {
                            console.log('Edit', lead);
                          } else {
                            alert('Bạn không có quyền chỉnh sửa lead này');
                          }
                        }}
                        onDelete={() => {
                          if (canDelete) {
                            console.log('Delete', lead);
                          } else {
                            alert('Bạn không có quyền xóa lead');
                          }
                        }}
                        canEdit={leadEditable}
                        canDelete={canDelete}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="py-20 text-center">
                <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white/60">Không tìm thấy lead</h3>
                <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            )}
          </div>
        ) : (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {leadsByStatus.map(({ status, config, leads: stageLeads }) => (
              <div key={status} className="flex-shrink-0 w-80">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-sm font-medium border ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-sm text-white/40">{stageLeads.length}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onView={() => console.log('View', lead)}
                    />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="p-8 rounded-xl border-2 border-dashed border-white/10 text-center">
                      <p className="text-sm text-white/30">Không có lead</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lead Creation Modal */}
      <LeadCreationModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onSubmit={handleCreateLead}
      />
    </div>
  );
}
