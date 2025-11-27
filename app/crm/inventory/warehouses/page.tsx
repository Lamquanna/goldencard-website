'use client';

import { useState, useMemo } from 'react';
import {
  Warehouse, Search, Plus, MoreHorizontal, Eye, Edit2, Trash2,
  MapPin, Package, TrendingUp, TrendingDown, AlertTriangle,
  Building, Users, Thermometer, CheckCircle, XCircle, Settings,
  ChevronRight, Box, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================
interface WarehouseData {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'store' | 'distribution_center';
  address: string;
  city: string;
  province: string;
  country: string;
  contact: {
    name: string;
    phone: string;
    email: string;
  };
  manager: string;
  capacity: {
    total: number;
    used: number;
    unit: string;
  };
  stats: {
    totalItems: number;
    totalSKU: number;
    totalValue: number;
    lowStockItems: number;
    pendingIn: number;
    pendingOut: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  temperature?: {
    current: number;
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_WAREHOUSES: WarehouseData[] = [
  {
    id: 'wh-1',
    code: 'WH-HCM-01',
    name: 'Kho Trung tâm HCM - Thủ Đức',
    type: 'distribution_center',
    address: '123 Xa lộ Hà Nội, Phường Thảo Điền',
    city: 'Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    country: 'Vietnam',
    contact: {
      name: 'Nguyễn Văn Kho',
      phone: '0901234567',
      email: 'warehouse.hcm@goldenenergy.vn',
    },
    manager: 'Trần Văn Quản',
    capacity: {
      total: 5000,
      used: 3850,
      unit: 'm²',
    },
    stats: {
      totalItems: 15420,
      totalSKU: 248,
      totalValue: 45000000000,
      lowStockItems: 12,
      pendingIn: 5,
      pendingOut: 8,
    },
    status: 'active',
    temperature: {
      current: 26,
      min: 20,
      max: 35,
      unit: 'C',
    },
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: 'wh-2',
    code: 'WH-BD-01',
    name: 'Kho Bình Dương - VSIP',
    type: 'warehouse',
    address: '456 Đại lộ Bình Dương, VSIP II',
    city: 'Dĩ An',
    province: 'Bình Dương',
    country: 'Vietnam',
    contact: {
      name: 'Lê Thị Hằng',
      phone: '0909876543',
      email: 'warehouse.bd@goldenenergy.vn',
    },
    manager: 'Phạm Minh Tuấn',
    capacity: {
      total: 3000,
      used: 2100,
      unit: 'm²',
    },
    stats: {
      totalItems: 8750,
      totalSKU: 156,
      totalValue: 25000000000,
      lowStockItems: 5,
      pendingIn: 3,
      pendingOut: 2,
    },
    status: 'active',
    temperature: {
      current: 28,
      min: 20,
      max: 35,
      unit: 'C',
    },
    createdAt: new Date('2021-06-20'),
    updatedAt: new Date('2024-06-14'),
  },
  {
    id: 'wh-3',
    code: 'WH-BTH-01',
    name: 'Kho Bình Thuận - Phan Thiết',
    type: 'warehouse',
    address: '789 QL1A, Phường Phú Hài',
    city: 'Phan Thiết',
    province: 'Bình Thuận',
    country: 'Vietnam',
    contact: {
      name: 'Trương Văn Hải',
      phone: '0912345678',
      email: 'warehouse.bth@goldenenergy.vn',
    },
    manager: 'Nguyễn Thị Mai',
    capacity: {
      total: 2000,
      used: 1650,
      unit: 'm²',
    },
    stats: {
      totalItems: 5280,
      totalSKU: 98,
      totalValue: 18500000000,
      lowStockItems: 8,
      pendingIn: 2,
      pendingOut: 4,
    },
    status: 'active',
    createdAt: new Date('2022-03-10'),
    updatedAt: new Date('2024-06-13'),
  },
  {
    id: 'wh-4',
    code: 'WH-DN-01',
    name: 'Kho Đà Nẵng',
    type: 'warehouse',
    address: '321 Nguyễn Văn Linh, Quận Hải Châu',
    city: 'Đà Nẵng',
    province: 'Đà Nẵng',
    country: 'Vietnam',
    contact: {
      name: 'Hoàng Văn Nam',
      phone: '0923456789',
      email: 'warehouse.dn@goldenenergy.vn',
    },
    manager: 'Lê Văn Đức',
    capacity: {
      total: 1500,
      used: 450,
      unit: 'm²',
    },
    stats: {
      totalItems: 2150,
      totalSKU: 75,
      totalValue: 8500000000,
      lowStockItems: 3,
      pendingIn: 1,
      pendingOut: 1,
    },
    status: 'maintenance',
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2024-06-10'),
  },
];

// ============================================
// HELPERS
// ============================================
const formatCurrency = (value: number, currency: string = 'VND') => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + ' tỷ';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(0) + ' triệu';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const getTypeConfig = (type: string) => {
  switch (type) {
    case 'distribution_center':
      return { label: 'Trung tâm phân phối', color: 'text-purple-400 bg-purple-500/10', icon: Building };
    case 'warehouse':
      return { label: 'Kho hàng', color: 'text-blue-400 bg-blue-500/10', icon: Warehouse };
    case 'store':
      return { label: 'Cửa hàng', color: 'text-emerald-400 bg-emerald-500/10', icon: Building };
    default:
      return { label: type, color: 'text-gray-400 bg-gray-500/10', icon: Warehouse };
  }
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'active':
      return { label: 'Hoạt động', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle };
    case 'inactive':
      return { label: 'Ngưng hoạt động', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: XCircle };
    case 'maintenance':
      return { label: 'Bảo trì', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Settings };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: CheckCircle };
  }
};

// ============================================
// WAREHOUSE CARD COMPONENT
// ============================================
function WarehouseCard({ warehouse, onView, onEdit, onDelete }: {
  warehouse: WarehouseData;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const typeConfig = getTypeConfig(warehouse.type);
  const statusConfig = getStatusConfig(warehouse.status);
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;
  
  const usagePercent = (warehouse.capacity.used / warehouse.capacity.total) * 100;
  const usageColor = usagePercent > 90 ? 'text-red-400' : usagePercent > 70 ? 'text-amber-400' : 'text-emerald-400';
  const usageBg = usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group rounded-2xl bg-white/5 border border-white/10 
                 hover:border-blue-500/30 transition-all duration-300
                 overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${typeConfig.color}`}>
              <TypeIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white">{warehouse.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusConfig.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-sm text-white/50 mt-0.5 font-mono">{warehouse.code}</p>
            </div>
          </div>

          {/* Actions */}
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
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 top-full mt-1 z-20 w-40 py-1 rounded-xl 
                               bg-[#1a1a2e] border border-white/10 shadow-2xl"
                  >
                    <button
                      onClick={() => { onView(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-white/80 
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Xem chi tiết</span>
                    </button>
                    <button
                      onClick={() => { onEdit(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-white/80 
                                 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <button
                      onClick={() => { onDelete(); setShowActions(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-400 
                                 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 mt-3">
          <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
          <p className="text-sm text-white/60">
            {warehouse.address}, {warehouse.city}, {warehouse.province}
          </p>
        </div>
      </div>

      {/* Capacity */}
      <div className="px-5 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Dung tích sử dụng</span>
          <span className={`text-sm font-medium ${usageColor}`}>
            {usagePercent.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${usageBg} transition-all duration-500`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-white/50">
          <span>{warehouse.capacity.used.toLocaleString()} {warehouse.capacity.unit}</span>
          <span>{warehouse.capacity.total.toLocaleString()} {warehouse.capacity.unit}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="p-5 grid grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-white/40 mb-1">
            <Package className="w-3.5 h-3.5" />
            <span className="text-xs">Tồn kho</span>
          </div>
          <p className="text-lg font-bold text-white">
            {warehouse.stats.totalItems.toLocaleString()}
          </p>
          <p className="text-xs text-white/50">{warehouse.stats.totalSKU} SKU</p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/40 mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="text-xs">Giá trị</span>
          </div>
          <p className="text-lg font-bold text-blue-400">
            {formatCurrency(warehouse.stats.totalValue)}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-white/40 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs">Sắp hết</span>
          </div>
          <p className={`text-lg font-bold ${
            warehouse.stats.lowStockItems > 0 ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {warehouse.stats.lowStockItems}
          </p>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="px-5 pb-5 flex items-center gap-4">
        {warehouse.stats.pendingIn > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">{warehouse.stats.pendingIn} chờ nhập</span>
          </div>
        )}
        {warehouse.stats.pendingOut > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">{warehouse.stats.pendingOut} chờ xuất</span>
          </div>
        )}
      </div>

      {/* Temperature */}
      {warehouse.temperature && (
        <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/60">Nhiệt độ</span>
            </div>
            <span className="text-sm font-medium text-white">
              {warehouse.temperature.current}°{warehouse.temperature.unit}
              <span className="text-white/40 ml-1">
                ({warehouse.temperature.min}° - {warehouse.temperature.max}°)
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Manager */}
      <div className="px-5 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/60">Quản lý:</span>
          <span className="text-sm text-white font-medium">{warehouse.manager}</span>
        </div>
        <button
          onClick={onView}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
        >
          Chi tiết
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function WarehousesPage() {
  const [warehouses] = useState<WarehouseData[]>(MOCK_WAREHOUSES);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredWarehouses = useMemo(() => {
    let result = [...warehouses];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(wh =>
        wh.name.toLowerCase().includes(searchLower) ||
        wh.code.toLowerCase().includes(searchLower) ||
        wh.city.toLowerCase().includes(searchLower)
      );
    }

    if (selectedType !== 'all') {
      result = result.filter(wh => wh.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(wh => wh.status === selectedStatus);
    }

    return result;
  }, [warehouses, search, selectedType, selectedStatus]);

  const stats = useMemo(() => ({
    total: warehouses.length,
    active: warehouses.filter(w => w.status === 'active').length,
    totalCapacity: warehouses.reduce((sum, w) => sum + w.capacity.total, 0),
    usedCapacity: warehouses.reduce((sum, w) => sum + w.capacity.used, 0),
    totalValue: warehouses.reduce((sum, w) => sum + w.stats.totalValue, 0),
    lowStockItems: warehouses.reduce((sum, w) => sum + w.stats.lowStockItems, 0),
  }), [warehouses]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Warehouse className="w-7 h-7 text-purple-400" />
              Quản lý kho
            </h1>
            <p className="text-white/60 mt-1">
              Quản lý {warehouses.length} kho hàng trên toàn hệ thống
            </p>
          </div>

          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                           bg-gradient-to-r from-purple-500 to-blue-500
                           text-white font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            <span>Thêm kho mới</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <Warehouse className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tổng số kho</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-emerald-400">{stats.active} hoạt động</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Box className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tổng diện tích</p>
                <p className="text-2xl font-bold text-white">{stats.totalCapacity.toLocaleString()} m²</p>
                <p className="text-xs text-white/50">
                  {((stats.usedCapacity / stats.totalCapacity) * 100).toFixed(1)}% đã dùng
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <Package className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tổng tồn kho</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {warehouses.reduce((s, w) => s + w.stats.totalItems, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tổng giá trị</p>
                <p className="text-xl font-bold text-blue-400">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-amber-400/80 text-sm">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-amber-400">{stats.lowStockItems}</p>
                <p className="text-xs text-amber-400/60">sản phẩm</p>
              </div>
            </div>
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
              placeholder="Tìm theo tên, mã kho, thành phố..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50
                       transition-colors"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-purple-500/50
                     transition-colors appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="all">Tất cả loại kho</option>
            <option value="distribution_center">Trung tâm phân phối</option>
            <option value="warehouse">Kho hàng</option>
            <option value="store">Cửa hàng</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                     text-white focus:outline-none focus:border-purple-500/50
                     transition-colors appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
            <option value="maintenance">Bảo trì</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Warehouses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredWarehouses.map((warehouse) => (
            <WarehouseCard
              key={warehouse.id}
              warehouse={warehouse}
              onView={() => console.log('View', warehouse)}
              onEdit={() => console.log('Edit', warehouse)}
              onDelete={() => console.log('Delete', warehouse)}
            />
          ))}
        </div>

        {filteredWarehouses.length === 0 && (
          <div className="py-20 text-center rounded-2xl bg-white/5 border border-white/10">
            <Warehouse className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/60">Không tìm thấy kho hàng</h3>
            <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        )}
      </div>
    </div>
  );
}
