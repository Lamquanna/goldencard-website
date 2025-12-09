// ============================================================================
// FINANCE MODULE - TYPE DEFINITIONS
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum InvoiceType {
  SALES = 'SALES',
  PURCHASE = 'PURCHASE',
  CREDIT_NOTE = 'CREDIT_NOTE',
  DEBIT_NOTE = 'DEBIT_NOTE',
  PROFORMA = 'PROFORMA',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum ExpenseCategory {
  OPERATIONS = 'OPERATIONS',
  MARKETING = 'MARKETING',
  SALARY = 'SALARY',
  UTILITIES = 'UTILITIES',
  RENT = 'RENT',
  EQUIPMENT = 'EQUIPMENT',
  TRAVEL = 'TRAVEL',
  SUPPLIES = 'SUPPLIES',
  INSURANCE = 'INSURANCE',
  TAX = 'TAX',
  OTHER = 'OTHER',
}

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  CHECK = 'CHECK',
  MOMO = 'MOMO',
  VNPAY = 'VNPAY',
  ZALOPAY = 'ZALOPAY',
  OTHER = 'OTHER',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

// ============================================================================
// STATUS CONFIGS
// ============================================================================

export const INVOICE_STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string; bgColor: string }
> = {
  [InvoiceStatus.DRAFT]: {
    label: 'Nháp',
    color: 'text-zinc-700 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
  },
  [InvoiceStatus.PENDING]: {
    label: 'Chờ xử lý',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  [InvoiceStatus.SENT]: {
    label: 'Đã gửi',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  [InvoiceStatus.PARTIALLY_PAID]: {
    label: 'Thanh toán một phần',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
  [InvoiceStatus.PAID]: {
    label: 'Đã thanh toán',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  [InvoiceStatus.OVERDUE]: {
    label: 'Quá hạn',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
  [InvoiceStatus.CANCELLED]: {
    label: 'Đã hủy',
    color: 'text-zinc-500 dark:text-zinc-500',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
  },
  [InvoiceStatus.REFUNDED]: {
    label: 'Đã hoàn tiền',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
};

export const INVOICE_TYPE_CONFIG: Record<
  InvoiceType,
  { label: string; color: string }
> = {
  [InvoiceType.SALES]: { label: 'Hóa đơn bán hàng', color: 'text-emerald-600' },
  [InvoiceType.PURCHASE]: { label: 'Hóa đơn mua hàng', color: 'text-blue-600' },
  [InvoiceType.CREDIT_NOTE]: { label: 'Phiếu ghi có', color: 'text-purple-600' },
  [InvoiceType.DEBIT_NOTE]: { label: 'Phiếu ghi nợ', color: 'text-orange-600' },
  [InvoiceType.PROFORMA]: { label: 'Hóa đơn tạm', color: 'text-zinc-600' },
};

export const EXPENSE_STATUS_CONFIG: Record<
  ExpenseStatus,
  { label: string; color: string; bgColor: string }
> = {
  [ExpenseStatus.PENDING]: {
    label: 'Chờ duyệt',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  [ExpenseStatus.APPROVED]: {
    label: 'Đã duyệt',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  [ExpenseStatus.REJECTED]: {
    label: 'Từ chối',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
  [ExpenseStatus.PAID]: {
    label: 'Đã chi',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  [ExpenseStatus.CANCELLED]: {
    label: 'Đã hủy',
    color: 'text-zinc-500 dark:text-zinc-500',
    bgColor: 'bg-zinc-100 dark:bg-zinc-800',
  },
};

export const EXPENSE_CATEGORY_CONFIG: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string }
> = {
  [ExpenseCategory.OPERATIONS]: { label: 'Vận hành', icon: 'settings', color: 'bg-blue-500' },
  [ExpenseCategory.MARKETING]: { label: 'Marketing', icon: 'megaphone', color: 'bg-pink-500' },
  [ExpenseCategory.SALARY]: { label: 'Lương', icon: 'users', color: 'bg-emerald-500' },
  [ExpenseCategory.UTILITIES]: { label: 'Tiện ích', icon: 'zap', color: 'bg-amber-500' },
  [ExpenseCategory.RENT]: { label: 'Thuê', icon: 'home', color: 'bg-purple-500' },
  [ExpenseCategory.EQUIPMENT]: { label: 'Thiết bị', icon: 'monitor', color: 'bg-cyan-500' },
  [ExpenseCategory.TRAVEL]: { label: 'Đi lại', icon: 'car', color: 'bg-orange-500' },
  [ExpenseCategory.SUPPLIES]: { label: 'Vật tư', icon: 'package', color: 'bg-lime-500' },
  [ExpenseCategory.INSURANCE]: { label: 'Bảo hiểm', icon: 'shield', color: 'bg-indigo-500' },
  [ExpenseCategory.TAX]: { label: 'Thuế', icon: 'receipt', color: 'bg-red-500' },
  [ExpenseCategory.OTHER]: { label: 'Khác', icon: 'more-horizontal', color: 'bg-zinc-500' },
};

export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  [PaymentMethod.CASH]: { label: 'Tiền mặt', icon: 'banknote' },
  [PaymentMethod.BANK_TRANSFER]: { label: 'Chuyển khoản', icon: 'building-2' },
  [PaymentMethod.CREDIT_CARD]: { label: 'Thẻ tín dụng', icon: 'credit-card' },
  [PaymentMethod.DEBIT_CARD]: { label: 'Thẻ ghi nợ', icon: 'credit-card' },
  [PaymentMethod.CHECK]: { label: 'Séc', icon: 'file-text' },
  [PaymentMethod.MOMO]: { label: 'MoMo', icon: 'smartphone' },
  [PaymentMethod.VNPAY]: { label: 'VNPay', icon: 'smartphone' },
  [PaymentMethod.ZALOPAY]: { label: 'ZaloPay', icon: 'smartphone' },
  [PaymentMethod.OTHER]: { label: 'Khác', icon: 'wallet' },
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface Invoice {
  id: string;
  code: string;
  type: InvoiceType;
  status: InvoiceStatus;
  
  // Customer/Supplier
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxId?: string;
  
  // Supplier (for purchase invoices)
  supplierId?: string;
  supplierName?: string;
  
  // Items
  items: InvoiceItem[];
  
  // Amounts
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  currency: string;
  exchangeRate?: number;
  
  // Dates
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  
  // Payment
  paymentTerms?: string;
  paymentMethod?: PaymentMethod;
  payments?: Payment[];
  
  // References
  projectId?: string;
  projectName?: string;
  orderId?: string;
  orderCode?: string;
  
  // Notes
  notes?: string;
  internalNotes?: string;
  termsAndConditions?: string;
  
  // Attachments
  attachments?: string[];
  
  // Metadata
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  productSku?: string;
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate: number;
  taxAmount: number;
  discountPercent?: number;
  discountAmount: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paidAt: string;
  createdBy?: string;
  createdByName?: string;
}

export interface Expense {
  id: string;
  code: string;
  category: ExpenseCategory;
  status: ExpenseStatus;
  
  // Details
  title: string;
  description?: string;
  
  // Amount
  amount: number;
  taxAmount?: number;
  total: number;
  currency: string;
  
  // Vendor
  vendorId?: string;
  vendorName?: string;
  
  // Payment
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paidAt?: string;
  
  // Dates
  expenseDate: string;
  
  // Requester
  requestedBy: string;
  requestedByName?: string;
  requestedAt: string;
  
  // Approver
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // References
  projectId?: string;
  projectName?: string;
  departmentId?: string;
  departmentName?: string;
  
  // Attachments
  receipts?: string[];
  attachments?: string[];
  
  // Metadata
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  code: string;
  type: TransactionType;
  
  // Account
  accountId: string;
  accountName: string;
  
  // Amount
  amount: number;
  currency: string;
  balanceAfter?: number;
  
  // Counterparty
  counterpartyId?: string;
  counterpartyName?: string;
  
  // Reference
  referenceType?: 'INVOICE' | 'EXPENSE' | 'TRANSFER' | 'MANUAL';
  referenceId?: string;
  referenceCode?: string;
  
  // Details
  description?: string;
  notes?: string;
  
  // Date
  transactionDate: string;
  createdAt: string;
  createdBy?: string;
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'CASH' | 'BANK' | 'CREDIT' | 'RECEIVABLE' | 'PAYABLE' | 'OTHER';
  
  // Balance
  balance: number;
  currency: string;
  
  // Bank details
  bankName?: string;
  bankBranch?: string;
  accountNumber?: string;
  
  // Status
  isActive: boolean;
  isDefault?: boolean;
  
  // Metadata
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface InvoiceFilters {
  search?: string;
  type?: InvoiceType;
  status?: InvoiceStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface ExpenseFilters {
  search?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  requestedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionFilters {
  search?: string;
  type?: TransactionType;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ============================================================================
// FINANCE STATE
// ============================================================================

export interface FinanceState {
  // Data
  invoices: Invoice[];
  expenses: Expense[];
  transactions: Transaction[];
  accounts: Account[];
  
  // Selected
  selectedInvoice: Invoice | null;
  selectedExpense: Expense | null;
  selectedTransaction: Transaction | null;
  
  // Filters
  invoiceFilters: InvoiceFilters;
  expenseFilters: ExpenseFilters;
  transactionFilters: TransactionFilters;
  
  // UI State
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// FINANCE ACTIONS
// ============================================================================

export interface FinanceActions {
  // Invoices
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  selectInvoice: (invoice: Invoice | string | null) => void;
  
  // Expenses
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  selectExpense: (expense: Expense | string | null) => void;
  approveExpense: (id: string, approvedBy: string, approvedByName?: string) => void;
  rejectExpense: (id: string, rejectionReason: string) => void;
  
  // Transactions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  selectTransaction: (transaction: Transaction | string | null) => void;
  
  // Accounts
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Filters
  setInvoiceFilters: (filters: Partial<InvoiceFilters>) => void;
  setExpenseFilters: (filters: Partial<ExpenseFilters>) => void;
  setTransactionFilters: (filters: Partial<TransactionFilters>) => void;
  clearInvoiceFilters: () => void;
  clearExpenseFilters: () => void;
  clearTransactionFilters: () => void;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

// ============================================================================
// REPORT TYPES
// ============================================================================

export interface FinancialSummary {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  invoiceCount: number;
  expenseCount: number;
  paidInvoices: number;
  overdueInvoices: number;
  pendingExpenses: number;
}

export interface CashFlowItem {
  date: string;
  income: number;
  expense: number;
  net: number;
  balance: number;
}

export interface ExpenseByCategory {
  category: ExpenseCategory;
  label: string;
  amount: number;
  percentage: number;
  count: number;
}
