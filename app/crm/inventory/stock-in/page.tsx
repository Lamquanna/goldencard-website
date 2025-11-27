'use client';

import { useState, useMemo } from 'react';
import {
  ArrowDownToLine, Search, Filter, Plus, MoreHorizontal, Eye, Edit2, Trash2,
  Check, X, ChevronDown, Package, Truck, FileText, Clock, CheckCircle,
  AlertCircle, XCircle, Building, Calendar, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StockIn, StockInItem, Supplier, Warehouse as WarehouseType } from '@/lib/crm/types';

// ============================================
// MOCK DATA
// ============================================
const MOCK_SUPPLIERS = [
  { id: 'sup-1', code: 'SUP-001', name: 'JA Solar VN', contactPerson: 'Nguyễn Văn A' },
  { id: 'sup-2', code: 'SUP-002', name: 'Huawei Technologies', contactPerson: 'Trần Thị B' },
  { id: 'sup-3', code: 'SUP-003', name: 'BYD Battery', contactPerson: 'Lê Văn C' },
];

const MOCK_WAREHOUSES = [
  { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức' },
  { id: 'wh-2', code: 'WH-BD', name: 'Kho Bình Dương' },
  { id: 'wh-3', code: 'WH-BT', name: 'Kho Dự án Bình Thuận' },
];

const MOCK_STOCK_INS: StockIn[] = [
  {
    id: 'si-001',
    referenceNo: 'GRN-2024-0125',
    type: 'purchase',
    supplierId: 'sup-1',
    supplier: { id: 'sup-1', code: 'SUP-001', name: 'JA Solar VN', status: 'active', country: 'Vietnam', paymentTerms: 30, rating: 4.5, createdAt: new Date(), updatedAt: new Date() },
    warehouseId: 'wh-1',
    warehouse: { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiptDate: new Date('2024-06-15'),
    poNumber: 'PO-2024-0089',
    invoiceNumber: 'INV-JA-2024-156',
    totalItems: 3,
    totalQty: 500,
    totalValue: 1750000000,
    status: 'completed',
    createdBy: 'user-1',
    createdAt: new Date('2024-06-14'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: 'si-002',
    referenceNo: 'GRN-2024-0124',
    type: 'purchase',
    supplierId: 'sup-2',
    supplier: { id: 'sup-2', code: 'SUP-002', name: 'Huawei Technologies', status: 'active', country: 'Vietnam', paymentTerms: 45, rating: 5, createdAt: new Date(), updatedAt: new Date() },
    warehouseId: 'wh-1',
    warehouse: { id: 'wh-1', code: 'WH-HCM', name: 'Kho HCM - Thủ Đức', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiptDate: new Date('2024-06-14'),
    poNumber: 'PO-2024-0088',
    totalItems: 2,
    totalQty: 15,
    totalValue: 1875000000,
    status: 'approved',
    createdBy: 'user-1',
    createdAt: new Date('2024-06-13'),
    updatedAt: new Date('2024-06-14'),
  },
  {
    id: 'si-003',
    referenceNo: 'GRN-2024-0123',
    type: 'return',
    warehouseId: 'wh-2',
    warehouse: { id: 'wh-2', code: 'WH-BD', name: 'Kho Bình Dương', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiptDate: new Date('2024-06-13'),
    totalItems: 1,
    totalQty: 5,
    totalValue: 17500000,
    status: 'pending',
    notes: 'Hàng trả về từ dự án A',
    createdBy: 'user-2',
    createdAt: new Date('2024-06-13'),
    updatedAt: new Date('2024-06-13'),
  },
  {
    id: 'si-004',
    referenceNo: 'GRN-2024-0122',
    type: 'transfer_in',
    sourceWarehouseId: 'wh-1',
    warehouseId: 'wh-3',
    warehouse: { id: 'wh-3', code: 'WH-BT', name: 'Kho Dự án Bình Thuận', type: 'warehouse', country: 'Vietnam', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    receiptDate: new Date('2024-06-12'),
    totalItems: 4,
    totalQty: 200,
    totalValue: 700000000,
    status: 'draft',
    createdBy: 'user-1',
    createdAt: new Date('2024-06-12'),
    updatedAt: new Date('2024-06-12'),
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
      return { 
        label: 'Nháp', 
        color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        icon: FileText 
      };
    case 'pending':
      return { 
        label: 'Chờ duyệt', 
        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        icon: Clock 
      };
    case 'approved':
      return { 
        label: 'Đã duyệt', 
        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        icon: CheckCircle 
      };
    case 'completed':
      return { 
        label: 'Hoàn thành', 
        color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        icon: CheckCircle 
      };
    case 'cancelled':
      return { 
        label: 'Đã hủy', 
        color: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: XCircle 
      };
    default:
      return { 
        label: status, 
        color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
        icon: AlertCircle 
      };
  }
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'purchase':
      return { label: 'Mua hàng', icon: Truck, color: 'text-blue-400' };
    case 'return':
      return { label: 'Trả hàng', icon: ArrowDownToLine, color: 'text-amber-400' };
    case 'transfer_in':
      return { label: 'Chuyển kho', icon: Building, color: 'text-purple-400' };
    case 'adjustment':
      return { label: 'Điều chỉnh', icon: FileText, color: 'text-gray-400' };
    case 'initial':
      return { label: 'Tồn đầu kỳ', icon: Package, color: 'text-emerald-400' };
    default:
      return { label: type, icon: Package, color: 'text-white/60' };
  }
};

// ============================================
// COMPONENTS
// ============================================
interface StockInRowProps {
  item: StockIn;
  onView: () => void;
  onEdit: () => void;
  onApprove?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
}

function StockInRow({ item, onView, onEdit, onApprove, onComplete, onCancel }: StockInRowProps) {
  const [showActions, setShowActions] = useState(false);
  const statusConfig = getStatusConfig(item.status);
  const typeConfig = getTypeConfig(item.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group hover:bg-white/[0.02] transition-colors"
    >
      {/* Reference */}
      <td className="px-4 py-4">
        <div>
          <p className="font-mono text-sm text-white font-medium">{item.referenceNo}</p>
          <div className="flex items-center gap-2 mt-1">
            <TypeIcon className={`w-3.5 h-3.5 ${typeConfig.color}`} />
            <span className="text-xs text-white/50">{typeConfig.label}</span>
          </div>
        </div>
      </td>

      {/* Supplier / Source */}
      <td className="px-4 py-4">
        {item.supplier ? (
          <div>
            <p className="text-white">{item.supplier.name}</p>
            {item.poNumber && (
              <p className="text-xs text-white/50 mt-0.5">PO: {item.poNumber}</p>
            )}
          </div>
        ) : item.sourceWarehouseId ? (
          <span className="text-white/70">Từ kho khác</span>
        ) : (
          <span className="text-white/40">-</span>
        )}
      </td>

      {/* Warehouse */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-white/40" />
          <span className="text-white">{item.warehouse?.name || '-'}</span>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/40" />
          <span className="text-white/70">{formatDate(item.receiptDate)}</span>
        </div>
      </td>

      {/* Items */}
      <td className="px-4 py-4">
        <div className="text-center">
          <p className="text-white font-medium">{item.totalItems}</p>
          <p className="text-xs text-white/50">{item.totalQty} đơn vị</p>
        </div>
      </td>

      {/* Total Value */}
      <td className="px-4 py-4 text-right">
        <span className="text-white font-medium">
          {formatCurrency(item.totalValue)}
        </span>
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
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowActions(false)}
                />
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

                  {item.status === 'pending' && (
                    <button
                      onClick={() => { onApprove?.(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-emerald-400 
                                 hover:bg-emerald-500/10 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Duyệt</span>
                    </button>
                  )}

                  {item.status === 'approved' && (
                    <button
                      onClick={() => { onComplete?.(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-blue-400 
                                 hover:bg-blue-500/10 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Hoàn thành</span>
                    </button>
                  )}

                  {(item.status === 'draft' || item.status === 'pending') && (
                    <>
                      <hr className="my-1 border-white/10" />
                      <button
                        onClick={() => { onCancel?.(); setShowActions(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 
                                   hover:bg-red-500/10 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Hủy phiếu</span>
                      </button>
                    </>
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
export default function StockInPage() {
  const [stockIns] = useState<StockIn[]>(MOCK_STOCK_INS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');

  // Filter items
  const filteredItems = useMemo(() => {
    let result = [...stockIns];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.referenceNo.toLowerCase().includes(searchLower) ||
        item.poNumber?.toLowerCase().includes(searchLower) ||
        item.supplier?.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(item => item.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      result = result.filter(item => item.type === selectedType);
    }

    if (selectedWarehouse !== 'all') {
      result = result.filter(item => item.warehouseId === selectedWarehouse);
    }

    return result;
  }, [stockIns, search, selectedStatus, selectedType, selectedWarehouse]);

  // Stats
  const stats = useMemo(() => ({
    total: stockIns.length,
    pending: stockIns.filter(i => i.status === 'pending').length,
    approved: stockIns.filter(i => i.status === 'approved').length,
    completed: stockIns.filter(i => i.status === 'completed').length,
    totalValue: stockIns.filter(i => i.status === 'completed').reduce((sum, i) => sum + i.totalValue, 0),
  }), [stockIns]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <ArrowDownToLine className="w-7 h-7 text-emerald-400" />
              Nhập kho
            </h1>
            <p className="text-white/60 mt-1">
              Quản lý phiếu nhập kho, mua hàng, trả hàng
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                             bg-gradient-to-r from-emerald-500 to-teal-500
                             text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              <span>Tạo phiếu nhập</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 text-sm">Tổng phiếu</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-400/80 text-sm">Chờ duyệt</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{stats.pending}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-blue-400/80 text-sm">Đã duyệt</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.approved}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400/80 text-sm">Hoàn thành</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <p className="text-purple-400/80 text-sm">Tổng giá trị nhập</p>
            <p className="text-xl font-bold text-purple-400 mt-1">{formatCurrency(stats.totalValue)}</p>
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
              placeholder="Tìm theo mã phiếu, PO, nhà cung cấp..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50
                       transition-colors"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-emerald-500/50
                     transition-colors appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-emerald-500/50
                     transition-colors appearance-none cursor-pointer min-w-[140px]"
          >
            <option value="all">Tất cả loại</option>
            <option value="purchase">Mua hàng</option>
            <option value="return">Trả hàng</option>
            <option value="transfer_in">Chuyển kho</option>
            <option value="adjustment">Điều chỉnh</option>
          </select>

          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-emerald-500/50
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
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Nhà cung cấp</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Kho nhận</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Ngày nhập</th>
                  <th className="px-4 py-4 text-center text-white/60 font-medium">Số lượng</th>
                  <th className="px-4 py-4 text-right text-white/60 font-medium">Giá trị</th>
                  <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <StockInRow
                    key={item.id}
                    item={item}
                    onView={() => console.log('View', item)}
                    onEdit={() => console.log('Edit', item)}
                    onApprove={() => console.log('Approve', item)}
                    onComplete={() => console.log('Complete', item)}
                    onCancel={() => console.log('Cancel', item)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <ArrowDownToLine className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/60">Không tìm thấy phiếu nhập</h3>
              <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
