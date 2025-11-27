'use client';

import { useState, useMemo } from 'react';
import {
  ArrowUpFromLine, Search, Plus, MoreHorizontal, Eye, Edit2,
  Check, X, ChevronDown, Package, Clock, CheckCircle, AlertCircle, 
  XCircle, Building, Calendar, User, Shield, AlertTriangle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StockOut, StockApproval } from '@/lib/crm/types';

// ============================================
// MOCK DATA
// ============================================
const MOCK_RECEIVERS = [
  { id: 'rec-1', name: 'Dự án Solar Farm Bình Thuận', type: 'project' },
  { id: 'rec-2', name: 'Phòng Kỹ thuật', type: 'department' },
  { id: 'rec-3', name: 'Nguyễn Văn A', type: 'employee' },
];

const MOCK_WAREHOUSES = [
  { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức' },
  { id: 'wh-2', code: 'WH-BD', name: 'Kho Bình Dương' },
];

const MOCK_STOCK_OUTS: StockOut[] = [
  {
    id: 'so-001',
    referenceNo: 'GIN-2024-0089',
    type: 'issue',
    warehouseId: 'wh-1',
    warehouse: { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiverId: 'rec-1',
    receiver: { id: 'rec-1', name: 'Dự án Solar Farm Bình Thuận', type: 'project', status: 'active', createdAt: new Date() },
    projectId: 'proj-001',
    issueDate: new Date('2024-06-16'),
    requiredDate: new Date('2024-06-18'),
    totalItems: 3,
    totalQty: 350,
    totalValue: 1225000000,
    status: 'pending_approval',
    approvalLevel: 1,
    priority: 'high',
    createdBy: 'user-1',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15'),
    approvals: [
      {
        id: 'app-1',
        stockOutId: 'so-001',
        approvalLevel: 1,
        approverId: 'user-mgr-1',
        approverRole: 'Quản lý kho',
        status: 'pending',
        minValue: 0,
        maxValue: 500000000,
        createdAt: new Date(),
      },
      {
        id: 'app-2',
        stockOutId: 'so-001',
        approvalLevel: 2,
        approverId: 'user-dir-1',
        approverRole: 'Giám đốc',
        status: 'pending',
        minValue: 500000000,
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 'so-002',
    referenceNo: 'GIN-2024-0088',
    type: 'issue',
    warehouseId: 'wh-1',
    warehouse: { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiverId: 'rec-2',
    receiver: { id: 'rec-2', name: 'Phòng Kỹ thuật', type: 'department', status: 'active', createdAt: new Date() },
    issueDate: new Date('2024-06-15'),
    totalItems: 2,
    totalQty: 10,
    totalValue: 350000,
    status: 'completed',
    approvalLevel: 1,
    priority: 'normal',
    createdBy: 'user-2',
    createdAt: new Date('2024-06-14'),
    updatedAt: new Date('2024-06-15'),
    approvals: [
      {
        id: 'app-3',
        stockOutId: 'so-002',
        approvalLevel: 1,
        approverId: 'user-mgr-1',
        approverRole: 'Quản lý kho',
        status: 'approved',
        decisionAt: new Date('2024-06-14'),
        comments: 'Đồng ý xuất',
        minValue: 0,
        maxValue: 500000000,
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 'so-003',
    referenceNo: 'GIN-2024-0087',
    type: 'transfer_out',
    warehouseId: 'wh-1',
    warehouse: { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    destWarehouseId: 'wh-2',
    issueDate: new Date('2024-06-14'),
    totalItems: 5,
    totalQty: 500,
    totalValue: 1750000000,
    status: 'approved',
    approvalLevel: 2,
    priority: 'normal',
    createdBy: 'user-1',
    createdAt: new Date('2024-06-13'),
    updatedAt: new Date('2024-06-14'),
    approvals: [
      {
        id: 'app-4',
        stockOutId: 'so-003',
        approvalLevel: 1,
        approverId: 'user-mgr-1',
        approverRole: 'Quản lý kho',
        status: 'approved',
        decisionAt: new Date('2024-06-13'),
        createdAt: new Date(),
      },
      {
        id: 'app-5',
        stockOutId: 'so-003',
        approvalLevel: 2,
        approverId: 'user-dir-1',
        approverRole: 'Giám đốc',
        status: 'approved',
        decisionAt: new Date('2024-06-14'),
        createdAt: new Date(),
      },
    ],
  },
  {
    id: 'so-004',
    referenceNo: 'GIN-2024-0086',
    type: 'issue',
    warehouseId: 'wh-2',
    warehouse: { id: 'wh-2', code: 'WH-BD', name: 'Kho Bình Dương', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiverId: 'rec-3',
    receiver: { id: 'rec-3', name: 'Nguyễn Văn A', type: 'employee', status: 'active', createdAt: new Date() },
    issueDate: new Date('2024-06-13'),
    totalItems: 1,
    totalQty: 5,
    totalValue: 175000,
    status: 'rejected',
    approvalLevel: 1,
    priority: 'low',
    rejectionReason: 'Thiếu chứng từ yêu cầu',
    createdBy: 'user-3',
    createdAt: new Date('2024-06-12'),
    updatedAt: new Date('2024-06-13'),
    approvals: [
      {
        id: 'app-6',
        stockOutId: 'so-004',
        approvalLevel: 1,
        approverId: 'user-mgr-2',
        approverRole: 'Quản lý kho',
        status: 'rejected',
        decisionAt: new Date('2024-06-13'),
        comments: 'Thiếu chứng từ yêu cầu',
        createdAt: new Date(),
      },
    ],
  },
];

// ============================================
// HELPERS
// ============================================
const formatCurrency = (value: number, currency: string = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'draft':
      return { label: 'Nháp', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: FileText };
    case 'pending_approval':
      return { label: 'Chờ duyệt', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock };
    case 'approved':
      return { label: 'Đã duyệt', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: CheckCircle };
    case 'processing':
      return { label: 'Đang xử lý', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Package };
    case 'completed':
      return { label: 'Hoàn thành', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
    case 'rejected':
      return { label: 'Từ chối', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle };
    case 'cancelled':
      return { label: 'Đã hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: AlertCircle };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'urgent':
      return { label: 'Khẩn cấp', color: 'text-red-400 bg-red-500/10' };
    case 'high':
      return { label: 'Cao', color: 'text-orange-400 bg-orange-500/10' };
    case 'normal':
      return { label: 'Bình thường', color: 'text-blue-400 bg-blue-500/10' };
    case 'low':
      return { label: 'Thấp', color: 'text-gray-400 bg-gray-500/10' };
    default:
      return { label: priority, color: 'text-gray-400 bg-gray-500/10' };
  }
};

const getReceiverTypeConfig = (type: string) => {
  switch (type) {
    case 'project':
      return { label: 'Dự án', icon: Building, color: 'text-blue-400' };
    case 'department':
      return { label: 'Phòng ban', icon: Building, color: 'text-purple-400' };
    case 'employee':
      return { label: 'Nhân viên', icon: User, color: 'text-emerald-400' };
    case 'external':
      return { label: 'Bên ngoài', icon: Building, color: 'text-amber-400' };
    default:
      return { label: type, icon: Building, color: 'text-white/60' };
  }
};

// ============================================
// APPROVAL PROGRESS COMPONENT
// ============================================
function ApprovalProgress({ approvals, currentLevel }: { approvals?: StockApproval[], currentLevel: number }) {
  if (!approvals || approvals.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {approvals.map((approval, index) => (
        <div key={approval.id} className="flex items-center">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${approval.status === 'approved' 
              ? 'bg-emerald-500 text-white' 
              : approval.status === 'rejected'
              ? 'bg-red-500 text-white'
              : approval.status === 'pending' && approval.approvalLevel === currentLevel
              ? 'bg-amber-500 text-white animate-pulse'
              : 'bg-white/10 text-white/40'
            }`}
          >
            {approval.status === 'approved' ? (
              <Check className="w-3 h-3" />
            ) : approval.status === 'rejected' ? (
              <X className="w-3 h-3" />
            ) : (
              approval.approvalLevel
            )}
          </div>
          {index < approvals.length - 1 && (
            <div className={`w-4 h-0.5 ${
              approval.status === 'approved' ? 'bg-emerald-500' : 'bg-white/10'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================
// STOCK OUT ROW
// ============================================
function StockOutRow({ item, onView, onEdit, onApprove, onReject, onComplete }: {
  item: StockOut;
  onView: () => void;
  onEdit: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getStatusConfig(item.status);
  const priorityConfig = getPriorityConfig(item.priority);
  const receiverTypeConfig = item.receiver ? getReceiverTypeConfig(item.receiver.type) : null;
  const StatusIcon = statusConfig.icon;
  const ReceiverIcon = receiverTypeConfig?.icon || Building;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group hover:bg-white/[0.02] transition-colors"
    >
      {/* Reference */}
      <td className="px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm text-white font-medium">{item.referenceNo}</p>
            {item.priority !== 'normal' && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityConfig.color}`}>
                {priorityConfig.label}
              </span>
            )}
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            {item.type === 'issue' ? 'Xuất hàng' : 
             item.type === 'transfer_out' ? 'Chuyển kho' : 
             item.type === 'disposal' ? 'Thanh lý' : item.type}
          </p>
        </div>
      </td>

      {/* Receiver */}
      <td className="px-4 py-4">
        {item.receiver ? (
          <div className="flex items-center gap-2">
            <ReceiverIcon className={`w-4 h-4 ${receiverTypeConfig?.color}`} />
            <div>
              <p className="text-white">{item.receiver.name}</p>
              <p className="text-xs text-white/50">{receiverTypeConfig?.label}</p>
            </div>
          </div>
        ) : item.destWarehouseId ? (
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-400" />
            <span className="text-white/70">Chuyển kho</span>
          </div>
        ) : (
          <span className="text-white/40">-</span>
        )}
      </td>

      {/* Warehouse */}
      <td className="px-4 py-4">
        <span className="text-white/70">{item.warehouse?.name || '-'}</span>
      </td>

      {/* Date */}
      <td className="px-4 py-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/40" />
            <span className="text-white/70">{formatDate(item.issueDate)}</span>
          </div>
          {item.requiredDate && (
            <p className="text-xs text-white/50 mt-0.5">
              Yêu cầu: {formatDate(item.requiredDate)}
            </p>
          )}
        </div>
      </td>

      {/* Quantity */}
      <td className="px-4 py-4 text-center">
        <p className="text-white font-medium">{item.totalItems}</p>
        <p className="text-xs text-white/50">{item.totalQty} đơn vị</p>
      </td>

      {/* Value */}
      <td className="px-4 py-4 text-right">
        <span className="text-white font-medium">{formatCurrency(item.totalValue)}</span>
      </td>

      {/* Approval Progress */}
      <td className="px-4 py-4">
        <ApprovalProgress approvals={item.approvals} currentLevel={item.approvalLevel} />
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.label}
        </span>
      </td>

      {/* Actions */}
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
                  className="absolute right-0 top-full mt-1 z-20 w-48 py-1 rounded-xl 
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

                  {item.status === 'draft' && (
                    <button
                      onClick={() => { onEdit(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                  )}

                  {item.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => { onApprove?.(); setShowActions(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-emerald-400 
                                   hover:bg-emerald-500/10 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Duyệt</span>
                      </button>
                      <button
                        onClick={() => { onReject?.(); setShowActions(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 
                                   hover:bg-red-500/10 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>
                    </>
                  )}

                  {item.status === 'approved' && (
                    <button
                      onClick={() => { onComplete?.(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-blue-400 
                                 hover:bg-blue-500/10 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      <span>Xuất kho</span>
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
export default function StockOutPage() {
  const [stockOuts] = useState<StockOut[]>(MOCK_STOCK_OUTS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  const filteredItems = useMemo(() => {
    let result = [...stockOuts];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.referenceNo.toLowerCase().includes(searchLower) ||
        item.receiver?.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(item => item.status === selectedStatus);
    }

    if (selectedWarehouse !== 'all') {
      result = result.filter(item => item.warehouseId === selectedWarehouse);
    }

    return result;
  }, [stockOuts, search, selectedStatus, selectedWarehouse]);

  const stats = useMemo(() => ({
    total: stockOuts.length,
    pendingApproval: stockOuts.filter(i => i.status === 'pending_approval').length,
    approved: stockOuts.filter(i => i.status === 'approved').length,
    completed: stockOuts.filter(i => i.status === 'completed').length,
    totalValue: stockOuts.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.totalValue, 0),
  }), [stockOuts]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ArrowUpFromLine className="w-7 h-7 text-orange-400" />
              Xuất kho
            </h1>
            <p className="text-white/60 mt-1">
              Quản lý phiếu xuất kho với quy trình duyệt đa cấp
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                           bg-gradient-to-r from-orange-500 to-red-500
                           text-white font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span>Tạo phiếu xuất</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">Tổng phiếu</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-amber-400/80 text-sm">Chờ duyệt</p>
                <p className="text-2xl font-bold text-amber-400">{stats.pendingApproval}</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm">Đã duyệt</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.approved}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400/80 text-sm">Đã xuất</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-purple-400/80 text-sm">Tổng giá trị xuất</p>
            <p className="text-xl font-bold text-purple-400 mt-1">{formatCurrency(stats.totalValue)}</p>
          </div>
        </div>

        {/* Approval Notice */}
        {stats.pendingApproval > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
          >
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            <div>
              <p className="text-amber-400 font-medium">
                Có {stats.pendingApproval} phiếu xuất đang chờ duyệt
              </p>
              <p className="text-amber-400/70 text-sm">
                Vui lòng kiểm tra và xử lý các phiếu đang chờ duyệt
              </p>
            </div>
            <button className="ml-auto px-4 py-2 rounded-lg bg-amber-500 text-white font-medium 
                             hover:bg-amber-600 transition-colors">
              Xem ngay
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã phiếu, người nhận..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-orange-500/50
                       transition-colors"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-orange-500/50
                     transition-colors appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending_approval">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="completed">Đã xuất</option>
            <option value="rejected">Từ chối</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-orange-500/50
                     transition-colors appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all">Tất cả kho</option>
            {MOCK_WAREHOUSES.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Mã phiếu</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Người nhận</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Kho xuất</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Ngày xuất</th>
                  <th className="px-4 py-4 text-center text-white/60 font-medium">Số lượng</th>
                  <th className="px-4 py-4 text-right text-white/60 font-medium">Giá trị</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Duyệt</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <StockOutRow
                    key={item.id}
                    item={item}
                    onView={() => console.log('View', item)}
                    onEdit={() => console.log('Edit', item)}
                    onApprove={() => console.log('Approve', item)}
                    onReject={() => console.log('Reject', item)}
                    onComplete={() => console.log('Complete', item)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <ArrowUpFromLine className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/60">Không tìm thấy phiếu xuất</h3>
              <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
