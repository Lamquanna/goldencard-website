'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Search, Plus, MoreHorizontal, SlidersHorizontal,
  Eye, Edit2, Trash2, Phone, Mail, Crown, Star, Award, 
  TrendingUp, ShoppingBag, Calendar, Download, ArrowUpDown,
  Building2, MapPin, ChevronDown, Filter, X, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// VIP TIER SYSTEM
// ============================================
type VipTier = 'member' | 'silver' | 'gold' | 'platinum' | 'diamond';

const VIP_TIERS: Record<VipTier, { 
  label: string; 
  minSpend: number; 
  discount: number; 
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  member: { 
    label: 'Member', 
    minSpend: 0, 
    discount: 0,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: Users
  },
  silver: { 
    label: 'Silver', 
    minSpend: 100000000, // 100 triệu
    discount: 3,
    color: 'text-slate-500',
    bgColor: 'bg-gradient-to-r from-slate-200 to-slate-300',
    borderColor: 'border-slate-400',
    icon: Award
  },
  gold: { 
    label: 'Gold', 
    minSpend: 500000000, // 500 triệu
    discount: 5,
    color: 'text-amber-600',
    bgColor: 'bg-gradient-to-r from-amber-200 to-yellow-300',
    borderColor: 'border-amber-400',
    icon: Star
  },
  platinum: { 
    label: 'Platinum', 
    minSpend: 2000000000, // 2 tỷ
    discount: 8,
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-r from-blue-200 to-cyan-300',
    borderColor: 'border-blue-400',
    icon: Crown
  },
  diamond: { 
    label: 'Diamond', 
    minSpend: 5000000000, // 5 tỷ
    discount: 12,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-r from-purple-300 to-pink-300',
    borderColor: 'border-purple-400',
    icon: Crown
  },
};

// ============================================
// TYPES
// ============================================
interface Customer {
  id: string;
  code: string; // Mã khách hàng: KH-0001
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  taxCode?: string;
  // VIP System
  vipTier: VipTier;
  totalSpent: number;
  totalOrders: number;
  // Source info
  convertedFromLead?: string; // Lead ID
  source: string;
  // Metadata
  notes?: string;
  tags: string[];
  assignedTo?: string;
  assignedUser?: { id: string; name: string };
  createdAt: Date;
  lastOrderAt?: Date;
  // Contact history
  lastContactAt?: Date;
}

interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

// ============================================
// MOCK DATA
// ============================================
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'cust-001',
    code: 'KH-0001',
    name: 'Công ty TNHH ABC Solar',
    company: 'ABC Corporation',
    email: 'contact@abc.com.vn',
    phone: '0901234567',
    address: '123 Nguyễn Văn Linh, Quận 7',
    city: 'TP. Hồ Chí Minh',
    taxCode: '0123456789',
    vipTier: 'gold',
    totalSpent: 5500000000,
    totalOrders: 3,
    source: 'Website',
    convertedFromLead: 'lead-001',
    tags: ['Enterprise', 'Solar Rooftop'],
    assignedTo: 'admin',
    assignedUser: { id: 'admin', name: 'Admin User' },
    createdAt: new Date('2024-01-15'),
    lastOrderAt: new Date('2024-06-01'),
    lastContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust-002',
    code: 'KH-0002',
    name: 'Nhà máy XYZ Manufacturing',
    company: 'XYZ Manufacturing',
    email: 'info@xyz-mfg.vn',
    phone: '0912345678',
    address: '456 Đại lộ Bình Dương',
    city: 'Bình Dương',
    taxCode: '9876543210',
    vipTier: 'platinum',
    totalSpent: 12000000000,
    totalOrders: 5,
    source: 'Google Ads',
    tags: ['Industrial', 'Solar Farm', 'VIP'],
    assignedTo: 'sale',
    assignedUser: { id: 'sale', name: 'Nhân viên Sale' },
    createdAt: new Date('2023-08-20'),
    lastOrderAt: new Date('2024-05-15'),
    lastContactAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust-003',
    code: 'KH-0003',
    name: 'Anh Nguyễn Văn C',
    email: 'nguyenvanc@gmail.com',
    phone: '0987654321',
    address: '789 Lê Văn Việt, Quận 9',
    city: 'TP. Hồ Chí Minh',
    vipTier: 'silver',
    totalSpent: 250000000,
    totalOrders: 1,
    source: 'Facebook',
    tags: ['Residential', 'Home Solar'],
    assignedTo: 'admin',
    assignedUser: { id: 'admin', name: 'Admin User' },
    createdAt: new Date('2024-03-10'),
    lastOrderAt: new Date('2024-03-15'),
    lastContactAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust-004',
    code: 'KH-0004',
    name: 'Trường ĐH Bách Khoa',
    company: 'HCMUT',
    email: 'facilities@hcmut.edu.vn',
    phone: '0934567890',
    address: '268 Lý Thường Kiệt, Quận 10',
    city: 'TP. Hồ Chí Minh',
    taxCode: '0301078781',
    vipTier: 'gold',
    totalSpent: 3500000000,
    totalOrders: 2,
    source: 'Event',
    tags: ['Education', 'Government'],
    assignedTo: 'sale',
    assignedUser: { id: 'sale', name: 'Nhân viên Sale' },
    createdAt: new Date('2024-02-01'),
    lastOrderAt: new Date('2024-06-01'),
    lastContactAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'cust-005',
    code: 'KH-0005',
    name: 'Chị Trần Thị D',
    email: 'tranthid@gmail.com',
    phone: '0976543210',
    address: '321 Võ Văn Ngân, Thủ Đức',
    city: 'TP. Hồ Chí Minh',
    vipTier: 'member',
    totalSpent: 80000000,
    totalOrders: 1,
    source: 'Referral',
    tags: ['Residential'],
    createdAt: new Date('2024-05-20'),
    lastOrderAt: new Date('2024-05-25'),
  },
  {
    id: 'cust-006',
    code: 'KH-0006',
    name: 'Tập đoàn Vingroup',
    company: 'Vingroup JSC',
    email: 'procurement@vingroup.net',
    phone: '024 3974 9999',
    address: '7 Bàng Lăng 1, Vinhomes Riverside',
    city: 'Hà Nội',
    taxCode: '0101245486',
    vipTier: 'diamond',
    totalSpent: 55000000000,
    totalOrders: 12,
    source: 'Partner',
    tags: ['Enterprise', 'VIP', 'Mega Project'],
    assignedTo: 'admin',
    assignedUser: { id: 'admin', name: 'Admin User' },
    createdAt: new Date('2022-01-10'),
    lastOrderAt: new Date('2024-06-10'),
    lastContactAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
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
  return value.toLocaleString('vi-VN') + ' đ';
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatTimeAgo = (date: Date) => {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return formatDate(date);
};

// Calculate VIP tier based on total spent
const calculateVipTier = (totalSpent: number): VipTier => {
  if (totalSpent >= VIP_TIERS.diamond.minSpend) return 'diamond';
  if (totalSpent >= VIP_TIERS.platinum.minSpend) return 'platinum';
  if (totalSpent >= VIP_TIERS.gold.minSpend) return 'gold';
  if (totalSpent >= VIP_TIERS.silver.minSpend) return 'silver';
  return 'member';
};

// Get next tier info
const getNextTierInfo = (currentTier: VipTier, totalSpent: number) => {
  const tiers: VipTier[] = ['member', 'silver', 'gold', 'platinum', 'diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === tiers.length - 1) return null; // Already at highest tier
  
  const nextTier = tiers[currentIndex + 1];
  const nextTierConfig = VIP_TIERS[nextTier];
  const amountNeeded = nextTierConfig.minSpend - totalSpent;
  
  return {
    tier: nextTier,
    config: nextTierConfig,
    amountNeeded,
    progress: (totalSpent / nextTierConfig.minSpend) * 100,
  };
};

// ============================================
// VIP BADGE COMPONENT
// ============================================
function VipBadge({ tier, size = 'md' }: { tier: VipTier; size?: 'sm' | 'md' | 'lg' }) {
  const config = VIP_TIERS[tier];
  const TierIcon = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium border
                     ${config.bgColor} ${config.color} ${config.borderColor}
                     ${sizeClasses[size]}`}>
      <TierIcon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}

// ============================================
// CUSTOMER MODAL
// ============================================
function CustomerModal({ 
  isOpen, 
  onClose,
  customer,
  mode = 'view'
}: { 
  isOpen: boolean; 
  onClose: () => void;
  customer?: Customer;
  mode?: 'view' | 'edit' | 'create';
}) {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    company: customer?.company || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    address: customer?.address || '',
    city: customer?.city || '',
    taxCode: customer?.taxCode || '',
    notes: customer?.notes || '',
    tags: customer?.tags?.join(', ') || '',
  });

  if (!isOpen) return null;

  const nextTierInfo = customer ? getNextTierInfo(customer.vipTier, customer.totalSpent) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'create' ? 'Thêm khách hàng mới' : 
                   mode === 'edit' ? 'Chỉnh sửa khách hàng' : 'Chi tiết khách hàng'}
                </h2>
                {customer && (
                  <p className="text-sm text-white/80">{customer.code}</p>
                )}
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {mode === 'view' && customer ? (
              <div className="space-y-6">
                {/* VIP Status Card */}
                <div className={`p-4 rounded-xl border-2 ${VIP_TIERS[customer.vipTier].borderColor} ${VIP_TIERS[customer.vipTier].bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <VipBadge tier={customer.vipTier} size="lg" />
                      <div>
                        <p className="text-sm text-gray-600">Giảm giá: <span className="font-bold">{VIP_TIERS[customer.vipTier].discount}%</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Tổng chi tiêu</p>
                      <p className="text-xl font-bold text-gray-800">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </div>
                  
                  {/* Progress to next tier */}
                  {nextTierInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-300/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">
                          Còn {formatCurrency(nextTierInfo.amountNeeded)} để lên {nextTierInfo.config.label}
                        </span>
                        <span className="text-xs font-medium">{nextTierInfo.progress.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${Math.min(nextTierInfo.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <ShoppingBag className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{customer.totalOrders}</p>
                    <p className="text-xs text-gray-500">Đơn hàng</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <TrendingUp className="w-6 h-6 mx-auto text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(customer.totalSpent / Math.max(customer.totalOrders, 1))}</p>
                    <p className="text-xs text-gray-500">TB/đơn</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <Calendar className="w-6 h-6 mx-auto text-purple-500 mb-2" />
                    <p className="text-sm font-bold text-gray-900">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : 'N/A'}</p>
                    <p className="text-xs text-gray-500">Đơn gần nhất</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Tên khách hàng</label>
                    <p className="text-gray-900 font-medium">{customer.name}</p>
                  </div>
                  {customer.company && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Công ty</label>
                      <p className="text-gray-900">{customer.company}</p>
                    </div>
                  )}
                  {customer.email && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Email</label>
                      <p className="text-gray-900">{customer.email}</p>
                    </div>
                  )}
                  {customer.phone && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Điện thoại</label>
                      <p className="text-gray-900">{customer.phone}</p>
                    </div>
                  )}
                  {customer.address && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Địa chỉ</label>
                      <p className="text-gray-900">{customer.address}, {customer.city}</p>
                    </div>
                  )}
                  {customer.taxCode && (
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Mã số thuế</label>
                      <p className="text-gray-900">{customer.taxCode}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Nguồn</label>
                    <p className="text-gray-900">{customer.source}</p>
                  </div>
                </div>

                {/* Tags */}
                {customer.tags.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wide">Tags</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {customer.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Create/Edit Form */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập tên công ty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0901234567"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="TP. Hồ Chí Minh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                    <input
                      type="text"
                      value={formData.taxCode}
                      onChange={e => setFormData({...formData, taxCode: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0123456789"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (phân cách bằng dấu phẩy)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={e => setFormData({...formData, tags: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enterprise, VIP, Solar"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={formData.notes}
                      onChange={e => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ghi chú về khách hàng..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {mode === 'view' ? 'Đóng' : 'Hủy'}
            </button>
            {mode !== 'view' && (
              <button
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg 
                         hover:shadow-lg transition-all"
              >
                {mode === 'create' ? 'Tạo khách hàng' : 'Lưu thay đổi'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<VipTier | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'createdAt'>('totalSpent');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let result = customers.filter(customer => {
      const matchSearch = searchQuery === '' || 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery);
      
      const matchTier = selectedTier === 'all' || customer.vipTier === selectedTier;
      
      return matchSearch && matchTier;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'totalSpent') {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortBy === 'createdAt') {
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [customers, searchQuery, selectedTier, sortBy, sortOrder]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: customers.length,
      totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      byTier: {
        diamond: customers.filter(c => c.vipTier === 'diamond').length,
        platinum: customers.filter(c => c.vipTier === 'platinum').length,
        gold: customers.filter(c => c.vipTier === 'gold').length,
        silver: customers.filter(c => c.vipTier === 'silver').length,
        member: customers.filter(c => c.vipTier === 'member').length,
      },
    };
  }, [customers]);

  const openCustomerModal = (customer: Customer | null, mode: 'view' | 'edit' | 'create') => {
    setSelectedCustomer(customer);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Khách hàng</h1>
            <p className="text-gray-600 mt-1">Quản lý khách hàng và hệ thống VIP</p>
          </div>
          <button
            onClick={() => openCustomerModal(null, 'create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Thêm khách hàng
          </button>
        </div>

        {/* VIP Tier Stats */}
        <div className="grid grid-cols-5 gap-4">
          {(['diamond', 'platinum', 'gold', 'silver', 'member'] as VipTier[]).map(tier => {
            const config = VIP_TIERS[tier];
            const TierIcon = config.icon;
            const count = stats.byTier[tier];
            
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(selectedTier === tier ? 'all' : tier)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedTier === tier 
                    ? `${config.borderColor} ${config.bgColor}` 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TierIcon className={`w-5 h-5 ${config.color}`} />
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">Giảm {config.discount}%</p>
              </button>
            );
          })}
        </div>

        {/* Total Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng khách hàng</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">VIP (Gold+)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byTier.diamond + stats.byTier.platinum + stats.byTier.gold}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, mã, email, SĐT..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 
                       focus:ring-blue-500 focus:border-blue-500 text-gray-900"
            />
          </div>
          <button
            onClick={() => {
              setSortBy(sortBy === 'totalSpent' ? 'name' : sortBy === 'name' ? 'createdAt' : 'totalSpent');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-sm">
              {sortBy === 'totalSpent' ? 'Doanh số' : sortBy === 'name' ? 'Tên' : 'Ngày tạo'}
            </span>
          </button>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2.5 bg-white border rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            {sortOrder === 'asc' ? '↑ Tăng' : '↓ Giảm'}
          </button>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">VIP</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Liên hệ</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Tổng chi tiêu</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Đơn hàng</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Hoạt động</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCustomers.map(customer => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold
                                    bg-gradient-to-br from-blue-500 to-purple-500`}>
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.code} {customer.company && `• ${customer.company}`}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <VipBadge tier={customer.vipTier} size="sm" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      {customer.email && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[150px]">{customer.email}</span>
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{customer.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {customer.totalOrders}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {customer.lastContactAt ? (
                      <span className="text-sm text-gray-500">{formatTimeAgo(customer.lastContactAt)}</span>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa liên hệ</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => openCustomerModal(customer, 'view')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => openCustomerModal(customer, 'edit')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button 
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>Không tìm thấy khách hàng nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={selectedCustomer || undefined}
        mode={modalMode}
      />
    </div>
  );
}
