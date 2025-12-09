import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Draft } from 'immer';
import {
  FinanceState,
  FinanceActions,
  Invoice,
  Expense,
  Transaction,
  Account,
  InvoiceFilters,
  ExpenseFilters,
  TransactionFilters,
  InvoiceStatus,
  InvoiceType,
  ExpenseStatus,
  ExpenseCategory,
  TransactionType,
} from './types';

// Type alias for WritableDraft
type WritableDraft<T> = Draft<T>;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: FinanceState = {
  invoices: [],
  expenses: [],
  transactions: [],
  accounts: [],
  selectedInvoice: null,
  selectedExpense: null,
  selectedTransaction: null,
  invoiceFilters: {},
  expenseFilters: {},
  transactionFilters: {},
  isLoading: false,
  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useFinanceStore = create<FinanceState & FinanceActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ==================== INVOICES ====================
        setInvoices: (invoices: Invoice[]) =>
          set((state: WritableDraft<FinanceState>) => {
            state.invoices = invoices as WritableDraft<Invoice>[];
          }),

        addInvoice: (invoice: Invoice) =>
          set((state: WritableDraft<FinanceState>) => {
            state.invoices.push(invoice as WritableDraft<Invoice>);
          }),

        updateInvoice: (id: string, updates: Partial<Invoice>) =>
          set((state: WritableDraft<FinanceState>) => {
            const index = state.invoices.findIndex((i: Draft<Invoice>) => i.id === id);
            if (index !== -1) {
              Object.assign(state.invoices[index], updates);
            }
          }),

        deleteInvoice: (id: string) =>
          set((state: WritableDraft<FinanceState>) => {
            state.invoices = state.invoices.filter((i: Draft<Invoice>) => i.id !== id);
          }),

        selectInvoice: (invoice: Invoice | string | null) =>
          set((state: WritableDraft<FinanceState>) => {
            if (typeof invoice === 'string') {
              const found = state.invoices.find((i: Draft<Invoice>) => i.id === invoice);
              state.selectedInvoice = found ? (found as WritableDraft<Invoice>) : null;
            } else {
              state.selectedInvoice = invoice as WritableDraft<Invoice> | null;
            }
          }),

        // ==================== EXPENSES ====================
        setExpenses: (expenses: Expense[]) =>
          set((state: WritableDraft<FinanceState>) => {
            state.expenses = expenses as WritableDraft<Expense>[];
          }),

        addExpense: (expense: Expense) =>
          set((state: WritableDraft<FinanceState>) => {
            state.expenses.push(expense as WritableDraft<Expense>);
          }),

        updateExpense: (id: string, updates: Partial<Expense>) =>
          set((state: WritableDraft<FinanceState>) => {
            const index = state.expenses.findIndex((e: Draft<Expense>) => e.id === id);
            if (index !== -1) {
              Object.assign(state.expenses[index], updates);
            }
          }),

        deleteExpense: (id: string) =>
          set((state: WritableDraft<FinanceState>) => {
            state.expenses = state.expenses.filter((e: Draft<Expense>) => e.id !== id);
          }),

        selectExpense: (expense: Expense | string | null) =>
          set((state: WritableDraft<FinanceState>) => {
            if (typeof expense === 'string') {
              const found = state.expenses.find((e: Draft<Expense>) => e.id === expense);
              state.selectedExpense = found ? (found as WritableDraft<Expense>) : null;
            } else {
              state.selectedExpense = expense as WritableDraft<Expense> | null;
            }
          }),

        approveExpense: (id: string, approvedBy: string, approvedByName?: string) =>
          set((state: WritableDraft<FinanceState>) => {
            const expense = state.expenses.find((e: Draft<Expense>) => e.id === id);
            if (expense) {
              expense.status = ExpenseStatus.APPROVED;
              expense.approvedBy = approvedBy;
              expense.approvedByName = approvedByName;
              expense.approvedAt = new Date().toISOString();
            }
          }),

        rejectExpense: (id: string, rejectionReason: string) =>
          set((state: WritableDraft<FinanceState>) => {
            const expense = state.expenses.find((e: Draft<Expense>) => e.id === id);
            if (expense) {
              expense.status = ExpenseStatus.REJECTED;
              expense.rejectionReason = rejectionReason;
            }
          }),

        // ==================== TRANSACTIONS ====================
        setTransactions: (transactions: Transaction[]) =>
          set((state: WritableDraft<FinanceState>) => {
            state.transactions = transactions as WritableDraft<Transaction>[];
          }),

        addTransaction: (transaction: Transaction) =>
          set((state: WritableDraft<FinanceState>) => {
            state.transactions.push(transaction as WritableDraft<Transaction>);
          }),

        deleteTransaction: (id: string) =>
          set((state: WritableDraft<FinanceState>) => {
            state.transactions = state.transactions.filter((t: Draft<Transaction>) => t.id !== id);
          }),

        selectTransaction: (transaction: Transaction | string | null) =>
          set((state: WritableDraft<FinanceState>) => {
            if (typeof transaction === 'string') {
              const found = state.transactions.find((t: Draft<Transaction>) => t.id === transaction);
              state.selectedTransaction = found
                ? (found as WritableDraft<Transaction>)
                : null;
            } else {
              state.selectedTransaction = transaction as WritableDraft<Transaction> | null;
            }
          }),

        // ==================== ACCOUNTS ====================
        setAccounts: (accounts: Account[]) =>
          set((state: WritableDraft<FinanceState>) => {
            state.accounts = accounts as WritableDraft<Account>[];
          }),

        addAccount: (account: Account) =>
          set((state: WritableDraft<FinanceState>) => {
            state.accounts.push(account as WritableDraft<Account>);
          }),

        updateAccount: (id: string, updates: Partial<Account>) =>
          set((state: WritableDraft<FinanceState>) => {
            const index = state.accounts.findIndex((a: Draft<Account>) => a.id === id);
            if (index !== -1) {
              Object.assign(state.accounts[index], updates);
            }
          }),

        deleteAccount: (id: string) =>
          set((state: WritableDraft<FinanceState>) => {
            state.accounts = state.accounts.filter((a: Draft<Account>) => a.id !== id);
          }),

        // ==================== FILTERS ====================
        setInvoiceFilters: (filters: Partial<InvoiceFilters>) =>
          set((state: WritableDraft<FinanceState>) => {
            state.invoiceFilters = { ...state.invoiceFilters, ...filters };
          }),

        setExpenseFilters: (filters: Partial<ExpenseFilters>) =>
          set((state: WritableDraft<FinanceState>) => {
            state.expenseFilters = { ...state.expenseFilters, ...filters };
          }),

        setTransactionFilters: (filters: Partial<TransactionFilters>) =>
          set((state: WritableDraft<FinanceState>) => {
            state.transactionFilters = { ...state.transactionFilters, ...filters };
          }),

        clearInvoiceFilters: () =>
          set((state: WritableDraft<FinanceState>) => {
            state.invoiceFilters = {};
          }),

        clearExpenseFilters: () =>
          set((state: WritableDraft<FinanceState>) => {
            state.expenseFilters = {};
          }),

        clearTransactionFilters: () =>
          set((state: WritableDraft<FinanceState>) => {
            state.transactionFilters = {};
          }),

        // ==================== UI ====================
        setLoading: (loading: boolean) =>
          set((state: WritableDraft<FinanceState>) => {
            state.isLoading = loading;
          }),

        setError: (error: string | null) =>
          set((state: WritableDraft<FinanceState>) => {
            state.error = error;
          }),

        reset: () => set(() => initialState),
      })),
      {
        name: 'finance-storage',
        partialize: (state) => ({
          invoiceFilters: state.invoiceFilters,
          expenseFilters: state.expenseFilters,
          transactionFilters: state.transactionFilters,
        }),
      }
    ),
    { name: 'FinanceStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectFilteredInvoices = (state: FinanceState): Invoice[] => {
  const { invoices, invoiceFilters } = state;

  return invoices.filter((invoice) => {
    // Search
    if (invoiceFilters.search) {
      const search = invoiceFilters.search.toLowerCase();
      const matchesSearch =
        invoice.code.toLowerCase().includes(search) ||
        invoice.customerName?.toLowerCase().includes(search) ||
        invoice.supplierName?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Type
    if (invoiceFilters.type && invoice.type !== invoiceFilters.type) {
      return false;
    }

    // Status
    if (invoiceFilters.status && invoice.status !== invoiceFilters.status) {
      return false;
    }

    // Customer
    if (invoiceFilters.customerId && invoice.customerId !== invoiceFilters.customerId) {
      return false;
    }

    // Date range
    if (invoiceFilters.dateFrom) {
      const fromDate = new Date(invoiceFilters.dateFrom);
      const invoiceDate = new Date(invoice.issueDate);
      if (invoiceDate < fromDate) return false;
    }

    if (invoiceFilters.dateTo) {
      const toDate = new Date(invoiceFilters.dateTo);
      const invoiceDate = new Date(invoice.issueDate);
      if (invoiceDate > toDate) return false;
    }

    // Amount range
    if (invoiceFilters.minAmount !== undefined && invoice.total < invoiceFilters.minAmount) {
      return false;
    }

    if (invoiceFilters.maxAmount !== undefined && invoice.total > invoiceFilters.maxAmount) {
      return false;
    }

    return true;
  });
};

export const selectFilteredExpenses = (state: FinanceState): Expense[] => {
  const { expenses, expenseFilters } = state;

  return expenses.filter((expense) => {
    // Search
    if (expenseFilters.search) {
      const search = expenseFilters.search.toLowerCase();
      const matchesSearch =
        expense.code.toLowerCase().includes(search) ||
        expense.title.toLowerCase().includes(search) ||
        expense.vendorName?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Category
    if (expenseFilters.category && expense.category !== expenseFilters.category) {
      return false;
    }

    // Status
    if (expenseFilters.status && expense.status !== expenseFilters.status) {
      return false;
    }

    // Requested by
    if (expenseFilters.requestedBy && expense.requestedBy !== expenseFilters.requestedBy) {
      return false;
    }

    // Date range
    if (expenseFilters.dateFrom) {
      const fromDate = new Date(expenseFilters.dateFrom);
      const expenseDate = new Date(expense.expenseDate);
      if (expenseDate < fromDate) return false;
    }

    if (expenseFilters.dateTo) {
      const toDate = new Date(expenseFilters.dateTo);
      const expenseDate = new Date(expense.expenseDate);
      if (expenseDate > toDate) return false;
    }

    // Amount range
    if (expenseFilters.minAmount !== undefined && expense.total < expenseFilters.minAmount) {
      return false;
    }

    if (expenseFilters.maxAmount !== undefined && expense.total > expenseFilters.maxAmount) {
      return false;
    }

    return true;
  });
};

export const selectFilteredTransactions = (state: FinanceState): Transaction[] => {
  const { transactions, transactionFilters } = state;

  return transactions.filter((transaction) => {
    // Search
    if (transactionFilters.search) {
      const search = transactionFilters.search.toLowerCase();
      const matchesSearch =
        transaction.code.toLowerCase().includes(search) ||
        transaction.description?.toLowerCase().includes(search) ||
        transaction.counterpartyName?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Type
    if (transactionFilters.type && transaction.type !== transactionFilters.type) {
      return false;
    }

    // Account
    if (transactionFilters.accountId && transaction.accountId !== transactionFilters.accountId) {
      return false;
    }

    // Date range
    if (transactionFilters.dateFrom) {
      const fromDate = new Date(transactionFilters.dateFrom);
      const transactionDate = new Date(transaction.transactionDate);
      if (transactionDate < fromDate) return false;
    }

    if (transactionFilters.dateTo) {
      const toDate = new Date(transactionFilters.dateTo);
      const transactionDate = new Date(transaction.transactionDate);
      if (transactionDate > toDate) return false;
    }

    return true;
  });
};

export const selectFinanceStats = (state: FinanceState) => {
  const { invoices, expenses, accounts } = state;

  // Invoice stats
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === InvoiceStatus.PAID).length;
  const overdueInvoices = invoices.filter((i) => i.status === InvoiceStatus.OVERDUE).length;
  const pendingInvoices = invoices.filter(
    (i) => i.status === InvoiceStatus.PENDING || i.status === InvoiceStatus.SENT
  ).length;

  const totalRevenue = invoices
    .filter((i) => i.type === InvoiceType.SALES && i.status === InvoiceStatus.PAID)
    .reduce((sum, i) => sum + i.paidAmount, 0);

  const totalReceivable = invoices
    .filter((i) => i.type === InvoiceType.SALES && i.dueAmount > 0)
    .reduce((sum, i) => sum + i.dueAmount, 0);

  // Expense stats
  const totalExpenses = expenses.length;
  const pendingExpenses = expenses.filter((e) => e.status === ExpenseStatus.PENDING).length;
  const approvedExpenses = expenses.filter((e) => e.status === ExpenseStatus.APPROVED).length;

  const totalExpenseAmount = expenses
    .filter((e) => e.status === ExpenseStatus.PAID)
    .reduce((sum, e) => sum + e.total, 0);

  // Account stats
  const totalBalance = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + a.balance, 0);

  return {
    totalInvoices,
    paidInvoices,
    overdueInvoices,
    pendingInvoices,
    totalRevenue,
    totalReceivable,
    totalExpenses,
    pendingExpenses,
    approvedExpenses,
    totalExpenseAmount,
    totalBalance,
    netIncome: totalRevenue - totalExpenseAmount,
  };
};

export const selectExpensesByCategory = (state: FinanceState) => {
  const { expenses } = state;
  const categoryMap = new Map<ExpenseCategory, number>();

  expenses
    .filter((e) => e.status === ExpenseStatus.PAID)
    .forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.total);
    });

  const total = Array.from(categoryMap.values()).reduce((sum, val) => sum + val, 0);

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
  }));
};

export const selectRecentInvoices = (state: FinanceState, limit = 10): Invoice[] => {
  return [...state.invoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const selectRecentExpenses = (state: FinanceState, limit = 10): Expense[] => {
  return [...state.expenses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const selectOverdueInvoices = (state: FinanceState): Invoice[] => {
  return state.invoices.filter((i) => i.status === InvoiceStatus.OVERDUE);
};

export const selectPendingExpenses = (state: FinanceState): Expense[] => {
  return state.expenses.filter((e) => e.status === ExpenseStatus.PENDING);
};
