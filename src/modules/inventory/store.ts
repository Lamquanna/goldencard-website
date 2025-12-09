import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Draft } from 'immer';
import {
  InventoryState,
  InventoryActions,
  Product,
  Warehouse,
  StockMovement,
  Supplier,
  InventoryAlert,
  ProductFilters,
  MovementFilters,
  WarehouseFilters,
  ProductStatus,
  MovementType,
  MovementStatus,
} from './types';

// Type alias for WritableDraft
type WritableDraft<T> = Draft<T>;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: InventoryState = {
  products: [],
  warehouses: [],
  movements: [],
  suppliers: [],
  alerts: [],
  selectedProduct: null,
  selectedWarehouse: null,
  selectedMovement: null,
  productFilters: {},
  movementFilters: {},
  warehouseFilters: {},
  isLoading: false,
  error: null,
};

// ============================================================================
// STORE
// ============================================================================

export const useInventoryStore = create<InventoryState & InventoryActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ==================== PRODUCTS ====================
        setProducts: (products: Product[]) =>
          set((state: WritableDraft<InventoryState>) => {
            state.products = products as WritableDraft<Product>[];
          }),

        addProduct: (product: Product) =>
          set((state: WritableDraft<InventoryState>) => {
            state.products.push(product as WritableDraft<Product>);
          }),

        updateProduct: (id: string, updates: Partial<Product>) =>
          set((state: WritableDraft<InventoryState>) => {
            const index = state.products.findIndex((p: Draft<Product>) => p.id === id);
            if (index !== -1) {
              Object.assign(state.products[index], updates);
            }
          }),

        deleteProduct: (id: string) =>
          set((state: WritableDraft<InventoryState>) => {
            state.products = state.products.filter((p: Draft<Product>) => p.id !== id);
          }),

        selectProduct: (product: Product | string | null) =>
          set((state: WritableDraft<InventoryState>) => {
            if (typeof product === 'string') {
              const found = state.products.find((p: Draft<Product>) => p.id === product);
              state.selectedProduct = found ? (found as WritableDraft<Product>) : null;
            } else {
              state.selectedProduct = product as WritableDraft<Product> | null;
            }
          }),

        // ==================== WAREHOUSES ====================
        setWarehouses: (warehouses: Warehouse[]) =>
          set((state: WritableDraft<InventoryState>) => {
            state.warehouses = warehouses as WritableDraft<Warehouse>[];
          }),

        addWarehouse: (warehouse: Warehouse) =>
          set((state: WritableDraft<InventoryState>) => {
            state.warehouses.push(warehouse as WritableDraft<Warehouse>);
          }),

        updateWarehouse: (id: string, updates: Partial<Warehouse>) =>
          set((state: WritableDraft<InventoryState>) => {
            const index = state.warehouses.findIndex((w: Draft<Warehouse>) => w.id === id);
            if (index !== -1) {
              Object.assign(state.warehouses[index], updates);
            }
          }),

        deleteWarehouse: (id: string) =>
          set((state: WritableDraft<InventoryState>) => {
            state.warehouses = state.warehouses.filter((w: Draft<Warehouse>) => w.id !== id);
          }),

        selectWarehouse: (warehouse: Warehouse | string | null) =>
          set((state: WritableDraft<InventoryState>) => {
            if (typeof warehouse === 'string') {
              const found = state.warehouses.find((w: Draft<Warehouse>) => w.id === warehouse);
              state.selectedWarehouse = found ? (found as WritableDraft<Warehouse>) : null;
            } else {
              state.selectedWarehouse = warehouse as WritableDraft<Warehouse> | null;
            }
          }),

        // ==================== MOVEMENTS ====================
        setMovements: (movements: StockMovement[]) =>
          set((state: WritableDraft<InventoryState>) => {
            state.movements = movements as WritableDraft<StockMovement>[];
          }),

        addMovement: (movement: StockMovement) =>
          set((state: WritableDraft<InventoryState>) => {
            state.movements.push(movement as WritableDraft<StockMovement>);
          }),

        updateMovement: (id: string, updates: Partial<StockMovement>) =>
          set((state: WritableDraft<InventoryState>) => {
            const index = state.movements.findIndex((m: Draft<StockMovement>) => m.id === id);
            if (index !== -1) {
              Object.assign(state.movements[index], updates);
            }
          }),

        deleteMovement: (id: string) =>
          set((state: WritableDraft<InventoryState>) => {
            state.movements = state.movements.filter((m: Draft<StockMovement>) => m.id !== id);
          }),

        selectMovement: (movement: StockMovement | string | null) =>
          set((state: WritableDraft<InventoryState>) => {
            if (typeof movement === 'string') {
              const found = state.movements.find((m: Draft<StockMovement>) => m.id === movement);
              state.selectedMovement = found ? (found as WritableDraft<StockMovement>) : null;
            } else {
              state.selectedMovement = movement as WritableDraft<StockMovement> | null;
            }
          }),

        // ==================== SUPPLIERS ====================
        setSuppliers: (suppliers: Supplier[]) =>
          set((state: WritableDraft<InventoryState>) => {
            state.suppliers = suppliers as WritableDraft<Supplier>[];
          }),

        addSupplier: (supplier: Supplier) =>
          set((state: WritableDraft<InventoryState>) => {
            state.suppliers.push(supplier as WritableDraft<Supplier>);
          }),

        updateSupplier: (id: string, updates: Partial<Supplier>) =>
          set((state: WritableDraft<InventoryState>) => {
            const index = state.suppliers.findIndex((s: Draft<Supplier>) => s.id === id);
            if (index !== -1) {
              Object.assign(state.suppliers[index], updates);
            }
          }),

        deleteSupplier: (id: string) =>
          set((state: WritableDraft<InventoryState>) => {
            state.suppliers = state.suppliers.filter((s: Draft<Supplier>) => s.id !== id);
          }),

        // ==================== ALERTS ====================
        setAlerts: (alerts: InventoryAlert[]) =>
          set((state: WritableDraft<InventoryState>) => {
            state.alerts = alerts as WritableDraft<InventoryAlert>[];
          }),

        markAlertAsRead: (id: string) =>
          set((state: WritableDraft<InventoryState>) => {
            const alert = state.alerts.find((a: Draft<InventoryAlert>) => a.id === id);
            if (alert) {
              alert.isRead = true;
            }
          }),

        resolveAlert: (id: string) =>
          set((state: WritableDraft<InventoryState>) => {
            const alert = state.alerts.find((a: Draft<InventoryAlert>) => a.id === id);
            if (alert) {
              alert.isResolved = true;
              alert.resolvedAt = new Date().toISOString();
            }
          }),

        // ==================== FILTERS ====================
        setProductFilters: (filters: Partial<ProductFilters>) =>
          set((state: WritableDraft<InventoryState>) => {
            state.productFilters = { ...state.productFilters, ...filters };
          }),

        setMovementFilters: (filters: Partial<MovementFilters>) =>
          set((state: WritableDraft<InventoryState>) => {
            state.movementFilters = { ...state.movementFilters, ...filters };
          }),

        setWarehouseFilters: (filters: Partial<WarehouseFilters>) =>
          set((state: WritableDraft<InventoryState>) => {
            state.warehouseFilters = { ...state.warehouseFilters, ...filters };
          }),

        clearProductFilters: () =>
          set((state: WritableDraft<InventoryState>) => {
            state.productFilters = {};
          }),

        clearMovementFilters: () =>
          set((state: WritableDraft<InventoryState>) => {
            state.movementFilters = {};
          }),

        clearWarehouseFilters: () =>
          set((state: WritableDraft<InventoryState>) => {
            state.warehouseFilters = {};
          }),

        // ==================== UI ====================
        setLoading: (loading: boolean) =>
          set((state: WritableDraft<InventoryState>) => {
            state.isLoading = loading;
          }),

        setError: (error: string | null) =>
          set((state: WritableDraft<InventoryState>) => {
            state.error = error;
          }),

        reset: () => set(() => initialState),
      })),
      {
        name: 'inventory-storage',
        partialize: (state) => ({
          productFilters: state.productFilters,
          movementFilters: state.movementFilters,
          warehouseFilters: state.warehouseFilters,
        }),
      }
    ),
    { name: 'InventoryStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectFilteredProducts = (state: InventoryState): Product[] => {
  const { products, productFilters } = state;

  return products.filter((product) => {
    // Search
    if (productFilters.search) {
      const search = productFilters.search.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Category
    if (productFilters.category && product.category !== productFilters.category) {
      return false;
    }

    // Status
    if (productFilters.status && product.status !== productFilters.status) {
      return false;
    }

    // Warehouse
    if (productFilters.warehouseId) {
      const hasStock = product.warehouseStocks?.some(
        (ws) => ws.warehouseId === productFilters.warehouseId
      );
      if (!hasStock) return false;
    }

    // Supplier
    if (productFilters.supplierId && product.supplierId !== productFilters.supplierId) {
      return false;
    }

    // Low stock
    if (productFilters.lowStock && product.status !== ProductStatus.LOW_STOCK) {
      return false;
    }

    // Out of stock
    if (productFilters.outOfStock && product.status !== ProductStatus.OUT_OF_STOCK) {
      return false;
    }

    // Price range
    if (productFilters.priceMin !== undefined && product.sellingPrice < productFilters.priceMin) {
      return false;
    }
    if (productFilters.priceMax !== undefined && product.sellingPrice > productFilters.priceMax) {
      return false;
    }

    return true;
  });
};

export const selectFilteredMovements = (state: InventoryState): StockMovement[] => {
  const { movements, movementFilters } = state;

  return movements.filter((movement) => {
    // Search
    if (movementFilters.search) {
      const search = movementFilters.search.toLowerCase();
      const matchesSearch =
        movement.code.toLowerCase().includes(search) ||
        movement.referenceCode?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Type
    if (movementFilters.type && movement.type !== movementFilters.type) {
      return false;
    }

    // Status
    if (movementFilters.status && movement.status !== movementFilters.status) {
      return false;
    }

    // Warehouse
    if (movementFilters.warehouseId) {
      const matchesWarehouse =
        movement.sourceWarehouseId === movementFilters.warehouseId ||
        movement.destinationWarehouseId === movementFilters.warehouseId;
      if (!matchesWarehouse) return false;
    }

    // Date range
    if (movementFilters.dateFrom) {
      const fromDate = new Date(movementFilters.dateFrom);
      const movementDate = new Date(movement.requestedDate);
      if (movementDate < fromDate) return false;
    }

    if (movementFilters.dateTo) {
      const toDate = new Date(movementFilters.dateTo);
      const movementDate = new Date(movement.requestedDate);
      if (movementDate > toDate) return false;
    }

    return true;
  });
};

export const selectFilteredWarehouses = (state: InventoryState): Warehouse[] => {
  const { warehouses, warehouseFilters } = state;

  return warehouses.filter((warehouse) => {
    // Search
    if (warehouseFilters.search) {
      const search = warehouseFilters.search.toLowerCase();
      const matchesSearch =
        warehouse.name.toLowerCase().includes(search) ||
        warehouse.code.toLowerCase().includes(search) ||
        warehouse.address.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Type
    if (warehouseFilters.type && warehouse.type !== warehouseFilters.type) {
      return false;
    }

    // Active
    if (warehouseFilters.isActive !== undefined && warehouse.isActive !== warehouseFilters.isActive) {
      return false;
    }

    return true;
  });
};

export const selectInventoryStats = (state: InventoryState) => {
  const { products, warehouses, movements, alerts } = state;

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === ProductStatus.ACTIVE).length;
  const lowStockProducts = products.filter((p) => p.status === ProductStatus.LOW_STOCK).length;
  const outOfStockProducts = products.filter((p) => p.status === ProductStatus.OUT_OF_STOCK).length;

  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w) => w.isActive).length;

  const totalValue = products.reduce((sum, p) => sum + p.sellingPrice * p.totalStock, 0);
  const totalItems = products.reduce((sum, p) => sum + p.totalStock, 0);

  const pendingMovements = movements.filter((m) => m.status === MovementStatus.PENDING).length;
  const unreadAlerts = alerts.filter((a) => !a.isRead).length;

  return {
    totalProducts,
    activeProducts,
    lowStockProducts,
    outOfStockProducts,
    totalWarehouses,
    activeWarehouses,
    totalValue,
    totalItems,
    pendingMovements,
    unreadAlerts,
  };
};

export const selectProductsByCategory = (state: InventoryState) => {
  const { products } = state;
  const categoryMap = new Map<string, number>();

  products.forEach((product) => {
    const current = categoryMap.get(product.category) || 0;
    categoryMap.set(product.category, current + 1);
  });

  return Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));
};

export const selectLowStockProducts = (state: InventoryState): Product[] => {
  return state.products.filter(
    (p) => p.status === ProductStatus.LOW_STOCK || p.status === ProductStatus.OUT_OF_STOCK
  );
};

export const selectRecentMovements = (state: InventoryState, limit = 10): StockMovement[] => {
  return [...state.movements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const selectUnresolvedAlerts = (state: InventoryState): InventoryAlert[] => {
  return state.alerts.filter((a) => !a.isResolved);
};
