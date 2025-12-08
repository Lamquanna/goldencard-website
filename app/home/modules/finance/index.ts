/**
 * Finance Module - Quản lý tài chính
 * Invoices, Payments, Expenses, Reports, Cash flow
 */

import type { ModuleManifest } from '../../types'

// =============================================================================
// MODULE MANIFEST
// =============================================================================

export const FinanceModuleManifest: ModuleManifest = {
  id: 'finance',
  name: 'Finance & Accounting',
  nameVi: 'Kế toán & Tài chính',
  version: '1.0.0',
  description: 'Manage invoices, payments, expenses and financial reports',
  descriptionVi: 'Quản lý hóa đơn, thanh toán, chi phí và báo cáo tài chính',
  icon: 'Wallet',
  color: '#8B5CF6', // Violet
  category: 'finance',
  basePath: '/home/finance',
  author: 'Golden Energy',
  routes: [
    { path: '/home/finance', name: 'Overview', nameVi: 'Tổng quan', icon: 'Wallet' },
    { path: '/home/finance/invoices', name: 'Invoices', nameVi: 'Hóa đơn', icon: 'FileText' },
    { path: '/home/finance/payments', name: 'Payments', nameVi: 'Thanh toán', icon: 'CreditCard' },
    { path: '/home/finance/expenses', name: 'Expenses', nameVi: 'Chi phí', icon: 'Receipt' },
    { path: '/home/finance/budgets', name: 'Budgets', nameVi: 'Ngân sách', icon: 'PiggyBank' },
    { path: '/home/finance/reports', name: 'Reports', nameVi: 'Báo cáo', icon: 'BarChart3' },
  ],
  permissions: [
    { 
      id: 'finance.view', 
      name: 'View Finance', 
      nameVi: 'Xem tài chính',
      description: 'View financial data and reports',
      resource: 'finance',
      actions: ['read']
    },
    { 
      id: 'finance.invoice.manage', 
      name: 'Manage Invoices', 
      nameVi: 'Quản lý hóa đơn',
      description: 'Create, edit, delete invoices',
      resource: 'invoice',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'finance.payment.manage', 
      name: 'Manage Payments', 
      nameVi: 'Quản lý thanh toán',
      description: 'Record and manage payments',
      resource: 'payment',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'finance.expense.manage', 
      name: 'Manage Expenses', 
      nameVi: 'Quản lý chi phí',
      description: 'Create and manage expenses',
      resource: 'expense',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'finance.budget.manage', 
      name: 'Manage Budgets', 
      nameVi: 'Quản lý ngân sách',
      description: 'Create and manage budgets',
      resource: 'budget',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'finance.report.view', 
      name: 'View Reports', 
      nameVi: 'Xem báo cáo',
      description: 'Access financial reports',
      resource: 'report',
      actions: ['read']
    },
    { 
      id: 'finance.approve', 
      name: 'Approve Transactions', 
      nameVi: 'Duyệt giao dịch',
      description: 'Approve expenses and payments',
      resource: 'transaction',
      actions: ['update']
    },
  ],
  settings: [
    {
      key: 'default_currency',
      type: 'select',
      label: 'Default Currency',
      labelVi: 'Đơn vị tiền tệ',
      defaultValue: 'VND',
      options: [
        { value: 'VND', label: 'VND - Vietnamese Dong' },
        { value: 'USD', label: 'USD - US Dollar' },
        { value: 'EUR', label: 'EUR - Euro' },
      ]
    },
    {
      key: 'tax_rate',
      type: 'number',
      label: 'Default Tax Rate (%)',
      labelVi: 'Thuế GTGT (%)',
      defaultValue: 10,
    },
    {
      key: 'invoice_prefix',
      type: 'string',
      label: 'Invoice Prefix',
      labelVi: 'Tiền tố hóa đơn',
      defaultValue: 'INV-',
    },
    {
      key: 'payment_terms',
      type: 'number',
      label: 'Default Payment Terms (days)',
      labelVi: 'Hạn thanh toán (ngày)',
      defaultValue: 30,
    },
    {
      key: 'require_approval',
      type: 'boolean',
      label: 'Require Approval for Expenses',
      labelVi: 'Yêu cầu duyệt chi phí',
      defaultValue: true,
    },
  ],
  hooks: {
    onActivate: async () => { console.log('Finance module activated') },
    onDeactivate: async () => { console.log('Finance module deactivated') },
  },
  defaultRoles: ['admin', 'accountant', 'finance_manager'],
  dependencies: [],
}

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'credit_card' | 'momo' | 'vnpay' | 'zalopay' | 'other'
export type ExpenseStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'paid'
export type ExpenseCategory = 'office' | 'travel' | 'equipment' | 'marketing' | 'salary' | 'utilities' | 'supplies' | 'other'

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; labelVi: string; color: string }> = {
  draft: { label: 'Draft', labelVi: 'Nháp', color: 'bg-gray-100 text-gray-800' },
  sent: { label: 'Sent', labelVi: 'Đã gửi', color: 'bg-blue-100 text-blue-800' },
  viewed: { label: 'Viewed', labelVi: 'Đã xem', color: 'bg-purple-100 text-purple-800' },
  paid: { label: 'Paid', labelVi: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
  partial: { label: 'Partial', labelVi: 'Thanh toán một phần', color: 'bg-yellow-100 text-yellow-800' },
  overdue: { label: 'Overdue', labelVi: 'Quá hạn', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Cancelled', labelVi: 'Đã hủy', color: 'bg-gray-100 text-gray-600' },
}

export const EXPENSE_CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; labelVi: string; icon: string }> = {
  office: { label: 'Office', labelVi: 'Văn phòng', icon: 'Building' },
  travel: { label: 'Travel', labelVi: 'Công tác', icon: 'Plane' },
  equipment: { label: 'Equipment', labelVi: 'Thiết bị', icon: 'Laptop' },
  marketing: { label: 'Marketing', labelVi: 'Marketing', icon: 'Megaphone' },
  salary: { label: 'Salary', labelVi: 'Lương', icon: 'Users' },
  utilities: { label: 'Utilities', labelVi: 'Tiện ích', icon: 'Zap' },
  supplies: { label: 'Supplies', labelVi: 'Vật tư', icon: 'Package' },
  other: { label: 'Other', labelVi: 'Khác', icon: 'MoreHorizontal' },
}

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string; labelVi: string; icon: string }> = {
  cash: { label: 'Cash', labelVi: 'Tiền mặt', icon: 'Banknote' },
  bank_transfer: { label: 'Bank Transfer', labelVi: 'Chuyển khoản', icon: 'Building2' },
  credit_card: { label: 'Credit Card', labelVi: 'Thẻ tín dụng', icon: 'CreditCard' },
  momo: { label: 'MoMo', labelVi: 'Ví MoMo', icon: 'Wallet' },
  vnpay: { label: 'VNPay', labelVi: 'VNPay', icon: 'QrCode' },
  zalopay: { label: 'ZaloPay', labelVi: 'ZaloPay', icon: 'Wallet' },
  other: { label: 'Other', labelVi: 'Khác', icon: 'MoreHorizontal' },
}

// =============================================================================
// INTERFACES
// =============================================================================

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  taxCode?: string
  type: 'individual' | 'company'
}

export interface Invoice {
  id: string
  invoiceNumber: string
  
  // Customer
  customerId?: string
  customer?: Customer
  customerName: string
  customerEmail?: string
  customerAddress?: string
  customerTaxCode?: string
  
  // Status & Dates
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  
  // Items
  items: InvoiceItem[]
  
  // Totals
  subtotal: number
  taxRate: number
  taxAmount: number
  discountAmount: number
  total: number
  paidAmount: number
  balanceDue: number
  
  currency: string
  
  // Notes
  notes?: string
  terms?: string
  
  // Tracking
  createdById: string
  createdBy?: { id: string; name: string }
  
  createdAt: Date
  updatedAt: Date
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  
  description: string
  quantity: number
  unitPrice: number
  amount: number
  
  // Reference
  productId?: string
  productSku?: string
}

export interface Payment {
  id: string
  paymentNumber: string
  
  // Reference
  invoiceId?: string
  invoice?: Invoice
  
  // Details
  amount: number
  currency: string
  method: PaymentMethod
  
  // Status
  status: PaymentStatus
  
  // Dates
  paymentDate: Date
  
  // Notes
  reference?: string
  notes?: string
  
  // User
  receivedById: string
  receivedBy?: { id: string; name: string }
  
  createdAt: Date
}

export interface Expense {
  id: string
  expenseNumber: string
  
  // Details
  title: string
  description?: string
  category: ExpenseCategory
  
  // Amount
  amount: number
  currency: string
  taxAmount?: number
  
  // Status
  status: ExpenseStatus
  
  // Dates
  expenseDate: Date
  
  // Attachments
  attachments?: string[]
  receiptUrl?: string
  
  // Vendor
  vendorName?: string
  vendorTaxCode?: string
  
  // Approval
  requestedById: string
  requestedBy?: { id: string; name: string }
  approvedById?: string
  approvedBy?: { id: string; name: string }
  approvedAt?: Date
  
  // Notes
  notes?: string
  rejectionReason?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id: string
  name: string
  description?: string
  
  // Period
  startDate: Date
  endDate: Date
  
  // Amount
  plannedAmount: number
  actualAmount: number
  remainingAmount: number
  currency: string
  
  // Category
  category?: ExpenseCategory
  
  // Status
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function formatCurrency(amount: number, currency: string = 'VND'): string {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency 
  }).format(amount)
}

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number, discount: number = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = (subtotal - discount) * (taxRate / 100)
  const total = subtotal - discount + taxAmount
  return { subtotal, taxAmount, total }
}

export function getDaysOverdue(dueDate: Date): number {
  const today = new Date()
  const due = new Date(dueDate)
  const diff = today.getTime() - due.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const MOCK_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Công ty TNHH ABC', email: 'abc@company.vn', phone: '0901234567', type: 'company', taxCode: '0123456789' },
  { id: '2', name: 'Nguyễn Văn A', email: 'nguyena@email.com', phone: '0987654321', type: 'individual' },
  { id: '3', name: 'Công ty CP XYZ', email: 'info@xyz.vn', phone: '0909876543', type: 'company', taxCode: '9876543210' },
]

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    customerName: 'Công ty TNHH ABC',
    customerEmail: 'abc@company.vn',
    customerTaxCode: '0123456789',
    status: 'paid',
    issueDate: new Date('2024-01-10'),
    dueDate: new Date('2024-02-10'),
    paidDate: new Date('2024-01-25'),
    items: [
      { id: '1', invoiceId: '1', description: 'Hệ thống điện mặt trời 10kW', quantity: 1, unitPrice: 150000000, amount: 150000000 },
      { id: '2', invoiceId: '1', description: 'Lắp đặt và vận hành', quantity: 1, unitPrice: 15000000, amount: 15000000 },
    ],
    subtotal: 165000000,
    taxRate: 10,
    taxAmount: 16500000,
    discountAmount: 0,
    total: 181500000,
    paidAmount: 181500000,
    balanceDue: 0,
    currency: 'VND',
    notes: 'Thanh toán qua chuyển khoản',
    createdById: 'user1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    customerId: '3',
    customerName: 'Công ty CP XYZ',
    customerEmail: 'info@xyz.vn',
    customerTaxCode: '9876543210',
    status: 'overdue',
    issueDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    items: [
      { id: '3', invoiceId: '2', description: 'Tấm pin JA Solar 450W', quantity: 50, unitPrice: 3500000, amount: 175000000 },
    ],
    subtotal: 175000000,
    taxRate: 10,
    taxAmount: 17500000,
    discountAmount: 5000000,
    total: 187500000,
    paidAmount: 50000000,
    balanceDue: 137500000,
    currency: 'VND',
    createdById: 'user1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
]

export const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    expenseNumber: 'EXP-2024-001',
    title: 'Công tác Đà Nẵng',
    description: 'Khảo sát dự án điện mặt trời',
    category: 'travel',
    amount: 5500000,
    currency: 'VND',
    status: 'approved',
    expenseDate: new Date('2024-01-20'),
    requestedById: 'user2',
    approvedById: 'user1',
    approvedAt: new Date('2024-01-21'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: '2',
    expenseNumber: 'EXP-2024-002',
    title: 'Văn phòng phẩm tháng 1',
    category: 'office',
    amount: 1200000,
    currency: 'VND',
    status: 'pending_approval',
    expenseDate: new Date('2024-01-25'),
    requestedById: 'user3',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
]

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: '1',
    paymentNumber: 'PAY-2024-001',
    invoiceId: '1',
    amount: 181500000,
    currency: 'VND',
    method: 'bank_transfer',
    status: 'completed',
    paymentDate: new Date('2024-01-25'),
    reference: 'Vietcombank - TK xxx1234',
    receivedById: 'user1',
    createdAt: new Date('2024-01-25'),
  },
  {
    id: '2',
    paymentNumber: 'PAY-2024-002',
    invoiceId: '2',
    amount: 50000000,
    currency: 'VND',
    method: 'bank_transfer',
    status: 'completed',
    paymentDate: new Date('2024-02-01'),
    reference: 'Thanh toán đợt 1',
    receivedById: 'user1',
    createdAt: new Date('2024-02-01'),
  },
]
