'use client';

import { useState, useMemo, useCallback } from 'react';
import { 
  Package, Search, Filter, Plus, Download, Upload, MoreHorizontal, 
  Eye, Edit2, Trash2, QrCode, Barcode, AlertTriangle, TrendingDown,
  TrendingUp, ArrowUpDown, Check, X, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InventoryItem, ItemCategory } from '@/lib/crm/types';

// ============================================
// MOCK DATA - Replace with API calls
// ============================================
const MOCK_CATEGORIES: ItemCategory[] = [
  { id: 'cat-1', code: 'SOLAR', name: 'Solar Panel', sortOrder: 1 },
  { id: 'cat-2', code: 'INV', name: 'Inverter', sortOrder: 2 },
  { id: 'cat-3', code: 'BAT', name: 'Battery', sortOrder: 3 },
  { id: 'cat-4', code: 'CABLE', name: 'Cable & Wire', sortOrder: 4 },
  { id: 'cat-5', code: 'MOUNT', name: 'Mounting System', sortOrder: 5 },
  { id: 'cat-6', code: 'IOT', name: 'IoT Device', sortOrder: 6 },
];

const MOCK_ITEMS: InventoryItem[] = [
  {
    id: 'item-001',
    code: 'SP-JA-550',
    name: 'Tấm pin JA Solar 550W Mono',
    description: 'Tấm pin năng lượng mặt trời JA Solar Deep Blue 3.0 Pro',
    categoryId: 'cat-1',
    category: MOCK_CATEGORIES[0],
    brand: 'JA Solar',
    model: 'JAM72S30-550/MR',
    unit: 'tấm',
    unitPrice: 3500000,
    currency: 'VND',
    openingStock: 0,
    currentStock: 1250,
    reservedStock: 200,
    availableStock: 1050,
    minStockAlert: 100,
    maxStockLevel: 5000,
    reorderPoint: 300,
    reorderQty: 500,
    trackSerial: false,
    trackLotBatch: true,
    status: 'active',
    imageUrl: '/images/panels/ja-solar-550.jpg',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-15'),
    stockStatus: 'normal',
    stockValue: 4375000000,
  },
  {
    id: 'item-002',
    code: 'INV-HW-100',
    name: 'Inverter Huawei SUN2000-100KTL',
    description: 'Inverter hòa lưới 100kW Huawei',
    categoryId: 'cat-2',
    category: MOCK_CATEGORIES[1],
    brand: 'Huawei',
    model: 'SUN2000-100KTL-M1',
    unit: 'bộ',
    unitPrice: 125000000,
    currency: 'VND',
    openingStock: 0,
    currentStock: 8,
    reservedStock: 3,
    availableStock: 5,
    minStockAlert: 5,
    maxStockLevel: 50,
    reorderPoint: 10,
    reorderQty: 20,
    trackSerial: true,
    trackLotBatch: true,
    status: 'active',
    imageUrl: '/images/inverters/huawei-100ktl.jpg',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-10'),
    stockStatus: 'low',
    stockValue: 1000000000,
  },
  {
    id: 'item-003',
    code: 'CBL-DC-6',
    name: 'Cáp DC Solar 6mm² PV1-F',
    description: 'Cáp chuyên dụng cho điện mặt trời 1500V DC',
    categoryId: 'cat-4',
    category: MOCK_CATEGORIES[3],
    brand: 'Helukabel',
    model: 'SOLARFLEX-X PV1-F',
    unit: 'm',
    unitPrice: 35000,
    currency: 'VND',
    openingStock: 0,
    currentStock: 0,
    reservedStock: 0,
    availableStock: 0,
    minStockAlert: 5000,
    maxStockLevel: 100000,
    reorderPoint: 10000,
    reorderQty: 20000,
    trackSerial: false,
    trackLotBatch: true,
    status: 'active',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-15'),
    stockStatus: 'out_of_stock',
    stockValue: 0,
  },
  {
    id: 'item-004',
    code: 'BAT-BYD-280',
    name: 'BYD Battery Box Premium HVS 7.7',
    description: 'Pin lưu trữ năng lượng BYD 7.7kWh',
    categoryId: 'cat-3',
    category: MOCK_CATEGORIES[2],
    brand: 'BYD',
    model: 'B-BOX HVS 7.7',
    unit: 'bộ',
    unitPrice: 85000000,
    currency: 'VND',
    openingStock: 0,
    currentStock: 12,
    reservedStock: 2,
    availableStock: 10,
    minStockAlert: 10,
    maxStockLevel: 100,
    reorderPoint: 15,
    reorderQty: 30,
    trackSerial: true,
    trackLotBatch: true,
    status: 'active',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-12'),
    stockStatus: 'critical',
    stockValue: 1020000000,
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatCurrency = (value: number, currency: string = 'VND') => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value);
};

const getStockStatusColor = (status?: string) => {
  switch (status) {
    case 'normal':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'low':
      return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    case 'critical':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'out_of_stock':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

const getStockStatusLabel = (status?: string) => {
  switch (status) {
    case 'normal':
      return 'Bình thường';
    case 'low':
      return 'Sắp hết';
    case 'critical':
      return 'Cảnh báo';
    case 'out_of_stock':
      return 'Hết hàng';
    default:
      return 'N/A';
  }
};

// ============================================
// COMPONENTS
// ============================================

interface ItemRowProps {
  item: InventoryItem;
  onView: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  isSelected: boolean;
  onSelect: () => void;
}

function ItemRow({ item, onView, onEdit, onDelete, isSelected, onSelect }: ItemRowProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group hover:bg-white/[0.02] transition-colors ${
        isSelected ? 'bg-blue-500/5' : ''
      }`}
    >
      {/* Checkbox */}
      <td className="px-4 py-3">
        <label className="relative flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="peer sr-only"
          />
          <div className="w-5 h-5 rounded border border-white/20 bg-white/5 
                          peer-checked:bg-blue-500 peer-checked:border-blue-500
                          transition-colors flex items-center justify-center">
            {isSelected && <Check className="w-3 h-3 text-white" />}
          </div>
        </label>
      </td>

      {/* Item Info */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover bg-white/5"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
              <Package className="w-5 h-5 text-white/40" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-white/60">{item.code}</span>
              {item.trackSerial && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400">
                  Serial
                </span>
              )}
            </div>
            <p className="text-white font-medium line-clamp-1">{item.name}</p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="text-white/70">{item.category?.name || '-'}</span>
      </td>

      {/* Brand */}
      <td className="px-4 py-3">
        <span className="text-white/70">{item.brand || '-'}</span>
      </td>

      {/* Stock */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium">{formatNumber(item.currentStock)}</span>
            <span className="text-white/40">{item.unit}</span>
          </div>
          {item.reservedStock > 0 && (
            <div className="text-xs text-amber-400">
              {formatNumber(item.reservedStock)} đã đặt
            </div>
          )}
        </div>
      </td>

      {/* Available */}
      <td className="px-4 py-3">
        <span className={`text-lg font-medium ${
          item.availableStock <= 0 ? 'text-red-400' : 
          item.availableStock <= (item.minStockAlert || 0) ? 'text-amber-400' : 
          'text-emerald-400'
        }`}>
          {formatNumber(item.availableStock)}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${
          getStockStatusColor(item.stockStatus)
        }`}>
          {item.stockStatus === 'out_of_stock' && <AlertTriangle className="w-3 h-3" />}
          {item.stockStatus === 'critical' && <TrendingDown className="w-3 h-3" />}
          {item.stockStatus === 'low' && <TrendingDown className="w-3 h-3" />}
          {item.stockStatus === 'normal' && <TrendingUp className="w-3 h-3" />}
          {getStockStatusLabel(item.stockStatus)}
        </span>
      </td>

      {/* Value */}
      <td className="px-4 py-3 text-right">
        <span className="text-white font-medium">
          {formatCurrency(item.stockValue || 0)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
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
                    onClick={() => { onView(item); setShowActions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                               hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Xem chi tiết</span>
                  </button>
                  <button
                    onClick={() => { onEdit(item); setShowActions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                               hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Chỉnh sửa</span>
                  </button>
                  <button
                    onClick={() => { /* Show QR */ }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                               hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Tạo QR Code</span>
                  </button>
                  <button
                    onClick={() => { /* Print barcode */ }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/80 
                               hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Barcode className="w-4 h-4" />
                    <span>In mã vạch</span>
                  </button>
                  <hr className="my-1 border-white/10" />
                  <button
                    onClick={() => { onDelete(item); setShowActions(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400 
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
      </td>
    </motion.tr>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ItemsListPage() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        item.code.toLowerCase().includes(searchLower) ||
        item.name.toLowerCase().includes(searchLower) ||
        item.brand?.toLowerCase().includes(searchLower) ||
        item.model?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(item => item.categoryId === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter(item => item.stockStatus === selectedStatus);
    }

    // Sort
    result.sort((a, b) => {
      let aVal: unknown = a[sortField as keyof InventoryItem];
      let bVal: unknown = b[sortField as keyof InventoryItem];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [items, search, selectedCategory, selectedStatus, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => ({
    total: items.length,
    lowStock: items.filter(i => i.stockStatus === 'low' || i.stockStatus === 'critical').length,
    outOfStock: items.filter(i => i.stockStatus === 'out_of_stock').length,
    totalValue: items.reduce((sum, i) => sum + (i.stockValue || 0), 0),
  }), [items]);

  // Handlers
  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  }, [filteredItems, selectedItems]);

  const handleSelectItem = useCallback((id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  }, [selectedItems]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Danh mục hàng hóa</h1>
            <p className="text-white/60 mt-1">
              Quản lý {stats.total} sản phẩm trong kho
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                             bg-white/5 border border-white/10 text-white/80
                             hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" />
              <span>Xuất Excel</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                             bg-white/5 border border-white/10 text-white/80
                             hover:bg-white/10 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Nhập từ file</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                             bg-gradient-to-r from-blue-500 to-purple-500
                             text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <TrendingDown className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Sắp hết hàng</p>
                <p className="text-2xl font-bold text-amber-400">{stats.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Hết hàng</p>
                <p className="text-2xl font-bold text-red-400">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm">Tổng giá trị</p>
                <p className="text-xl font-bold text-emerald-400">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã, tên, thương hiệu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50
                       transition-colors"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-blue-500/50
                     transition-colors cursor-pointer min-w-[180px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả danh mục</option>
            {MOCK_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-blue-500/50
                     transition-colors cursor-pointer min-w-[160px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="normal">Bình thường</option>
            <option value="low">Sắp hết</option>
            <option value="critical">Cảnh báo</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>

          {/* More Filters */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors
                      ${showFilters 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
          >
            <Filter className="w-4 h-4" />
            <span>Bộ lọc</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Bulk Actions */}
        <AnimatePresence>
          {selectedItems.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20"
            >
              <span className="text-blue-400 font-medium">
                Đã chọn {selectedItems.size} sản phẩm
              </span>
              <div className="flex-1" />
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
                Xuất Excel
              </button>
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-colors">
                Cập nhật hàng loạt
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                Xóa đã chọn
              </button>
              <button 
                onClick={() => setSelectedItems(new Set())}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-4 text-left">
                    <label className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                        onChange={handleSelectAll}
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 rounded border border-white/20 bg-white/5 
                                    peer-checked:bg-blue-500 peer-checked:border-blue-500
                                    transition-colors flex items-center justify-center">
                        {selectedItems.size === filteredItems.length && filteredItems.length > 0 && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </label>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button 
                      onClick={() => handleSort('name')}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <span>Sản phẩm</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-white/60">Danh mục</span>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-white/60">Thương hiệu</span>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button 
                      onClick={() => handleSort('currentStock')}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <span>Tồn kho</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <button 
                      onClick={() => handleSort('availableStock')}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                      <span>Có thể xuất</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-4 py-4 text-left">
                    <span className="text-white/60">Trạng thái</span>
                  </th>
                  <th className="px-4 py-4 text-right">
                    <button 
                      onClick={() => handleSort('stockValue')}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors ml-auto"
                    >
                      <span>Giá trị tồn</span>
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-4 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    isSelected={selectedItems.has(item.id)}
                    onSelect={() => handleSelectItem(item.id)}
                    onView={(item) => console.log('View', item)}
                    onEdit={(item) => console.log('Edit', item)}
                    onDelete={(item) => console.log('Delete', item)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="py-20 text-center">
              <Package className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/60">Không tìm thấy sản phẩm</h3>
              <p className="text-white/40 mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          )}

          {/* Pagination */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <span className="text-white/60 text-sm">
                Hiển thị {filteredItems.length} / {items.length} sản phẩm
              </span>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg bg-white/5 text-white/60 
                                 hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled>
                  Trước
                </button>
                <button className="px-4 py-2 rounded-lg bg-blue-500 text-white">1</button>
                <button className="px-4 py-2 rounded-lg bg-white/5 text-white/60 
                                 hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled>
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
