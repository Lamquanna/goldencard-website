'use client';

import { useState, useMemo } from 'react';
import {
  Calculator, Search, Plus, Filter, MoreHorizontal,
  FileText, Download, Upload, TrendingUp, TrendingDown,
  DollarSign, CreditCard, Receipt, PieChart, BarChart3,
  ArrowUpRight, ArrowDownRight, Calendar, Clock, CheckCircle,
  XCircle, AlertTriangle, Eye, Edit2, Trash2, Printer,
  Building, User, FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// TYPES
// ============================================
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: string;
  reference?: string;
  customer?: { id: string; name: string };
  project?: { id: string; name: string };
  attachments?: string[];
  createdBy: string;
  createdAt: Date;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'sales' | 'purchase';
  customer: { id: string; name: string; email?: string };
  items: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issueDate: Date;
  paidDate?: Date;
  notes?: string;
}

// ============================================
// MOCK DATA
// ============================================
const EXPENSE_CATEGORIES = [
  'Vật tư thiết bị', 'Nhân công', 'Vận chuyển', 'Marketing', 'Văn phòng', 'Bảo hiểm', 'Thuế', 'Khác'
];

const INCOME_CATEGORIES = [
  'Lắp đặt Solar', 'Bảo trì', 'Tư vấn', 'Phụ kiện', 'Khác'
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'trans-001',
    type: 'income',
    category: 'Lắp đặt Solar',
    amount: 550000000,
    description: 'Dự án lắp đặt 50kW - Công ty ABC',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'completed',
    paymentMethod: 'Chuyển khoản',
    reference: 'INV-2024-001',
    customer: { id: 'cust-001', name: 'Công ty TNHH ABC' },
    project: { id: 'proj-001', name: 'Solar Rooftop ABC' },
    createdBy: 'Nguyễn Văn A',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'trans-002',
    type: 'expense',
    category: 'Vật tư thiết bị',
    amount: 320000000,
    description: 'Mua 100 tấm pin JA Solar 550W',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'completed',
    paymentMethod: 'Chuyển khoản',
    reference: 'PO-2024-015',
    createdBy: 'Trần Thị B',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'trans-003',
    type: 'income',
    category: 'Bảo trì',
    amount: 15000000,
    description: 'Phí bảo trì hệ thống Q2/2024',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'pending',
    paymentMethod: 'Tiền mặt',
    customer: { id: 'cust-002', name: 'Nhà máy XYZ' },
    createdBy: 'Nguyễn Văn A',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'trans-004',
    type: 'expense',
    category: 'Nhân công',
    amount: 45000000,
    description: 'Lương thợ lắp đặt tháng 6',
    date: new Date(),
    status: 'completed',
    paymentMethod: 'Chuyển khoản',
    createdBy: 'Kế toán',
    createdAt: new Date(),
  },
  {
    id: 'trans-005',
    type: 'expense',
    category: 'Vận chuyển',
    amount: 8500000,
    description: 'Vận chuyển vật tư dự án DEF',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'completed',
    paymentMethod: 'Tiền mặt',
    project: { id: 'proj-002', name: 'Solar DEF Factory' },
    createdBy: 'Phạm Văn C',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    type: 'sales',
    customer: { id: 'cust-001', name: 'Công ty TNHH ABC', email: 'contact@abc.com.vn' },
    items: [
      { description: 'Hệ thống Solar 50kW', quantity: 1, unitPrice: 450000000, total: 450000000 },
      { description: 'Phí lắp đặt', quantity: 1, unitPrice: 50000000, total: 50000000 },
      { description: 'Phí khảo sát', quantity: 1, unitPrice: 5000000, total: 5000000 },
    ],
    subtotal: 505000000,
    tax: 50500000,
    total: 555500000,
    status: 'paid',
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    paidDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2024-002',
    type: 'sales',
    customer: { id: 'cust-002', name: 'Nhà máy XYZ', email: 'info@xyz.vn' },
    items: [
      { description: 'Hệ thống Solar 100kW', quantity: 1, unitPrice: 850000000, total: 850000000 },
      { description: 'Inverter Huawei 100KTL', quantity: 1, unitPrice: 120000000, total: 120000000 },
    ],
    subtotal: 970000000,
    tax: 97000000,
    total: 1067000000,
    status: 'sent',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2024-003',
    type: 'sales',
    customer: { id: 'cust-003', name: 'KCN Long Hậu', email: 'invest@longhau.vn' },
    items: [
      { description: 'Hệ thống Solar 500kW', quantity: 1, unitPrice: 3500000000, total: 3500000000 },
    ],
    subtotal: 3500000000,
    tax: 350000000,
    total: 3850000000,
    status: 'draft',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    issueDate: new Date(),
  },
];

// ============================================
// HELPERS
// ============================================
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xử lý', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    case 'completed':
    case 'paid':
      return { label: status === 'paid' ? 'Đã thanh toán' : 'Hoàn thành', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
    case 'draft':
      return { label: 'Nháp', color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
    case 'sent':
      return { label: 'Đã gửi', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
    case 'overdue':
      return { label: 'Quá hạn', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    case 'cancelled':
      return { label: 'Đã hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    default:
      return { label: status, color: 'bg-gray-500/10 text-gray-400 border-gray-500/20' };
  }
};

// ============================================
// MAIN COMPONENT
// ============================================
export default function AccountingPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'invoices'>('overview');
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Stats
  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
    const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'draft').length;
    const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
    const paidInvoices = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
    
    return {
      totalIncome,
      totalExpense,
      profit: totalIncome - totalExpense,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
    };
  }, [transactions, invoices]);

  // Filtered data
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(searchLower) ||
        t.category.toLowerCase().includes(searchLower) ||
        t.customer?.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedType !== 'all') {
      result = result.filter(t => t.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      result = result.filter(t => t.status === selectedStatus);
    }

    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, search, selectedType, selectedStatus]);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(i =>
        i.invoiceNumber.toLowerCase().includes(searchLower) ||
        i.customer.name.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus !== 'all') {
      result = result.filter(i => i.status === selectedStatus);
    }

    return result.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime());
  }, [invoices, search, selectedStatus]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calculator className="w-7 h-7 text-emerald-400" />
              Kế Toán & Tài Chính
            </h1>
            <p className="text-white/60 mt-1">
              Quản lý thu chi, hóa đơn và báo cáo tài chính
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 
                             border border-white/10 text-white/70 hover:bg-white/10 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Nhập dữ liệu</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 
                             border border-white/10 text-white/70 hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" />
              <span>Xuất báo cáo</span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl 
                            bg-gradient-to-r from-emerald-500 to-cyan-500
                            text-white font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              <span>Tạo giao dịch</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400/80 text-sm">Thu nhập</p>
            </div>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(stats.totalIncome)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownRight className="w-4 h-4 text-red-400" />
              <p className="text-red-400/80 text-sm">Chi phí</p>
            </div>
            <p className="text-xl font-bold text-red-400">{formatCurrency(stats.totalExpense)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400/80 text-sm">Lợi nhuận</p>
            </div>
            <p className="text-xl font-bold text-blue-400">{formatCurrency(stats.profit)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-4 h-4 text-amber-400" />
              <p className="text-amber-400/80 text-sm">Hóa đơn chờ</p>
            </div>
            <p className="text-xl font-bold text-amber-400">{stats.pendingInvoices}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <p className="text-purple-400/80 text-sm">Đã thu</p>
            </div>
            <p className="text-xl font-bold text-purple-400">{formatCurrency(stats.paidInvoices)}</p>
          </div>
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-red-400/80 text-sm">Quá hạn</p>
            </div>
            <p className="text-xl font-bold text-red-400">{stats.overdueInvoices}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-4">
          {[
            { id: 'overview', label: 'Tổng quan', icon: PieChart },
            { id: 'transactions', label: 'Giao dịch', icon: CreditCard },
            { id: 'invoices', label: 'Hóa đơn', icon: FileText },
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10
                       text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50
                       transition-colors"
            />
          </div>

          {activeTab === 'transactions' && (
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                       text-white focus:outline-none focus:border-emerald-500/50
                       transition-colors cursor-pointer min-w-[140px]
                       [&>option]:bg-gray-800 [&>option]:text-white"
            >
              <option value="all">Tất cả loại</option>
              <option value="income">Thu nhập</option>
              <option value="expense">Chi phí</option>
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-gray-800 border border-gray-600
                     text-white focus:outline-none focus:border-emerald-500/50
                     transition-colors cursor-pointer min-w-[140px]
                     [&>option]:bg-gray-800 [&>option]:text-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="paid">Đã thanh toán</option>
            <option value="sent">Đã gửi</option>
            <option value="draft">Nháp</option>
            <option value="overdue">Quá hạn</option>
          </select>
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue Chart Placeholder */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                Doanh thu theo tháng
              </h3>
              <div className="h-64 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Biểu đồ doanh thu</p>
                </div>
              </div>
            </div>

            {/* Expense by Category */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-400" />
                Chi phí theo danh mục
              </h3>
              <div className="h-64 flex items-center justify-center text-white/40">
                <div className="text-center">
                  <PieChart className="w-16 h-16 mx-auto mb-2 opacity-50" />
                  <p>Biểu đồ chi phí</p>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                Giao dịch gần đây
              </h3>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        t.type === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                      }`}>
                        {t.type === 'income' ? (
                          <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{t.description}</p>
                        <p className="text-sm text-white/50">{t.category} · {formatDate(t.date)}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Mô tả</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Loại</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Danh mục</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Số tiền</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Ngày</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                    <th className="px-4 py-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTransactions.map((t) => {
                    const statusConfig = getStatusConfig(t.status);
                    return (
                      <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-white font-medium">{t.description}</p>
                            {t.customer && (
                              <p className="text-sm text-white/50">{t.customer.name}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            t.type === 'income' 
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {t.type === 'income' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {t.type === 'income' ? 'Thu nhập' : 'Chi phí'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-white/70">{t.category}</td>
                        <td className="px-4 py-4">
                          <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-white/60">{formatDate(t.date)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-white/60" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Số hóa đơn</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Khách hàng</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Tổng tiền</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Ngày phát hành</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Hạn thanh toán</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Trạng thái</th>
                    <th className="px-4 py-4 text-left text-white/60 font-medium">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredInvoices.map((inv) => {
                    const statusConfig = getStatusConfig(inv.status);
                    return (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-4">
                          <p className="text-blue-400 font-medium">{inv.invoiceNumber}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-white font-medium">{inv.customer.name}</p>
                            {inv.customer.email && (
                              <p className="text-sm text-white/50">{inv.customer.email}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-emerald-400 font-semibold">{formatCurrency(inv.total)}</span>
                        </td>
                        <td className="px-4 py-4 text-white/60">{formatDate(inv.issueDate)}</td>
                        <td className="px-4 py-4 text-white/60">{formatDate(inv.dueDate)}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Xem">
                              <Eye className="w-4 h-4 text-white/60" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="In">
                              <Printer className="w-4 h-4 text-white/60" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors" title="Tải xuống">
                              <Download className="w-4 h-4 text-white/60" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
