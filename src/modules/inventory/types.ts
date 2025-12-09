// ============================================================================
// INVENTORY MODULE - TYPE DEFINITIONS
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DISCONTINUED = 'DISCONTINUED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
}

export enum ProductCategory {
  SOLAR_PANEL = 'SOLAR_PANEL',
  INVERTER = 'INVERTER',
  BATTERY = 'BATTERY',
  MOUNTING = 'MOUNTING',
  CABLE = 'CABLE',
  ACCESSORY = 'ACCESSORY',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER',
}

export enum MovementType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
}

export enum MovementStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum WarehouseType {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH',
  TEMPORARY = 'TEMPORARY',
  VIRTUAL = 'VIRTUAL',
}

export enum UnitOfMeasure {
  PIECE = 'PIECE',
  SET = 'SET',
  METER = 'METER',
  KG = 'KG',
  LITER = 'LITER',
  BOX = 'BOX',
  PALLET = 'PALLET',
}

// ============================================================================
// STATUS CONFIGS
// ============================================================================

export const PRODUCT_STATUS_CONFIG: Record<
  ProductStatus,
  { label: string; color: string; bgColor: string }
> = {
  [ProductStatus.ACTIVE]: {
    label: 'Đang bán',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  [ProductStatus.INACTIVE]: {
    label: 'Tạm ngừng',
    color: 'text-zinc-700 dark:text-zinc-400',
    bgColor: 'bg-zinc-100 dark:bg-zinc-900',
  },
  [ProductStatus.DISCONTINUED]: {
    label: 'Ngừng kinh doanh',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
  [ProductStatus.OUT_OF_STOCK]: {
    label: 'Hết hàng',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  [ProductStatus.LOW_STOCK]: {
    label: 'Sắp hết',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
};

export const CATEGORY_CONFIG: Record<
  ProductCategory,
  { label: string; icon: string; color: string }
> = {
  [ProductCategory.SOLAR_PANEL]: {
    label: 'Pin mặt trời',
    icon: 'sun',
    color: 'bg-amber-500',
  },
  [ProductCategory.INVERTER]: {
    label: 'Inverter',
    icon: 'zap',
    color: 'bg-blue-500',
  },
  [ProductCategory.BATTERY]: {
    label: 'Pin lưu trữ',
    icon: 'battery',
    color: 'bg-emerald-500',
  },
  [ProductCategory.MOUNTING]: {
    label: 'Khung giá đỡ',
    icon: 'layers',
    color: 'bg-zinc-500',
  },
  [ProductCategory.CABLE]: {
    label: 'Dây cáp',
    icon: 'cable',
    color: 'bg-purple-500',
  },
  [ProductCategory.ACCESSORY]: {
    label: 'Phụ kiện',
    icon: 'package',
    color: 'bg-pink-500',
  },
  [ProductCategory.SERVICE]: {
    label: 'Dịch vụ',
    icon: 'wrench',
    color: 'bg-cyan-500',
  },
  [ProductCategory.OTHER]: {
    label: 'Khác',
    icon: 'box',
    color: 'bg-slate-500',
  },
};

export const MOVEMENT_TYPE_CONFIG: Record<
  MovementType,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  [MovementType.IN]: {
    label: 'Nhập kho',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
    icon: 'arrow-down-circle',
  },
  [MovementType.OUT]: {
    label: 'Xuất kho',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    icon: 'arrow-up-circle',
  },
  [MovementType.TRANSFER]: {
    label: 'Chuyển kho',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    icon: 'repeat',
  },
  [MovementType.ADJUSTMENT]: {
    label: 'Điều chỉnh',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
    icon: 'edit',
  },
  [MovementType.RETURN]: {
    label: 'Trả hàng',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
    icon: 'undo',
  },
  [MovementType.DAMAGE]: {
    label: 'Hư hỏng',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
    icon: 'alert-triangle',
  },
};

export const MOVEMENT_STATUS_CONFIG: Record<
  MovementStatus,
  { label: string; color: string; bgColor: string }
> = {
  [MovementStatus.PENDING]: {
    label: 'Chờ duyệt',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  [MovementStatus.APPROVED]: {
    label: 'Đã duyệt',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  [MovementStatus.COMPLETED]: {
    label: 'Hoàn thành',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-950',
  },
  [MovementStatus.CANCELLED]: {
    label: 'Đã hủy',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-950',
  },
};

export const UNIT_CONFIG: Record<UnitOfMeasure, { label: string; abbr: string }> = {
  [UnitOfMeasure.PIECE]: { label: 'Cái', abbr: 'cái' },
  [UnitOfMeasure.SET]: { label: 'Bộ', abbr: 'bộ' },
  [UnitOfMeasure.METER]: { label: 'Mét', abbr: 'm' },
  [UnitOfMeasure.KG]: { label: 'Kilogram', abbr: 'kg' },
  [UnitOfMeasure.LITER]: { label: 'Lít', abbr: 'L' },
  [UnitOfMeasure.BOX]: { label: 'Hộp', abbr: 'hộp' },
  [UnitOfMeasure.PALLET]: { label: 'Pallet', abbr: 'pallet' },
};

// ============================================================================
// INTERFACES
// ============================================================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: ProductCategory;
  status: ProductStatus;
  unit: UnitOfMeasure;
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  currency: string;
  taxRate?: number;
  
  // Stock
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  reorderPoint?: number;
  
  // Attributes
  brand?: string;
  model?: string;
  manufacturer?: string;
  specifications?: Record<string, string>;
  
  // Media
  images?: string[];
  thumbnail?: string;
  documents?: ProductDocument[];
  
  // Tracking
  barcode?: string;
  serialTracking?: boolean;
  batchTracking?: boolean;
  expiryTracking?: boolean;
  
  // Dimensions
  weight?: number;
  weightUnit?: string;
  length?: number;
  width?: number;
  height?: number;
  dimensionUnit?: string;
  
  // Relations
  supplierId?: string;
  supplierName?: string;
  warehouseStocks?: WarehouseStock[];
  
  // Metadata
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ProductDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reservedQuantity: number;
  location?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: WarehouseType;
  description?: string;
  
  // Address
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  // Contact
  phone?: string;
  email?: string;
  managerId?: string;
  managerName?: string;
  
  // Capacity
  totalCapacity?: number;
  usedCapacity?: number;
  capacityUnit?: string;
  
  // Operations
  isActive: boolean;
  operatingHours?: string;
  
  // Stats
  totalProducts: number;
  totalValue: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  code: string;
  type: MovementType;
  status: MovementStatus;
  
  // References
  referenceType?: 'PURCHASE_ORDER' | 'SALES_ORDER' | 'TRANSFER' | 'MANUAL';
  referenceId?: string;
  referenceCode?: string;
  
  // Warehouses
  sourceWarehouseId?: string;
  sourceWarehouseName?: string;
  destinationWarehouseId?: string;
  destinationWarehouseName?: string;
  
  // Items
  items: StockMovementItem[];
  totalItems: number;
  totalQuantity: number;
  totalValue: number;
  
  // Dates
  requestedDate: string;
  scheduledDate?: string;
  completedDate?: string;
  
  // People
  requestedBy: string;
  requestedByName?: string;
  approvedBy?: string;
  approvedByName?: string;
  completedBy?: string;
  completedByName?: string;
  
  // Notes
  reason?: string;
  notes?: string;
  attachments?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface StockMovementItem {
  id: string;
  productId: string;
  productSku: string;
  productName: string;
  quantity: number;
  unit: UnitOfMeasure;
  unitPrice?: number;
  totalPrice?: number;
  
  // Tracking
  serialNumbers?: string[];
  batchNumber?: string;
  expiryDate?: string;
  
  // Location
  sourceLocation?: string;
  destinationLocation?: string;
  
  notes?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  type: 'MANUFACTURER' | 'DISTRIBUTOR' | 'WHOLESALER' | 'OTHER';
  
  // Contact
  contactPerson?: string;
  email?: string;
  phone?: string;
  website?: string;
  
  // Address
  address?: string;
  city?: string;
  country?: string;
  
  // Terms
  paymentTerms?: string;
  deliveryTerms?: string;
  leadTimeDays?: number;
  
  // Rating
  rating?: number;
  totalOrders?: number;
  
  // Status
  isActive: boolean;
  
  // Metadata
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAlert {
  id: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING' | 'EXPIRED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  productId: string;
  productName: string;
  warehouseId?: string;
  warehouseName?: string;
  message: string;
  threshold?: number;
  currentValue: number;
  isRead: boolean;
  isResolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ProductFilters {
  search?: string;
  category?: ProductCategory;
  status?: ProductStatus;
  warehouseId?: string;
  supplierId?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface MovementFilters {
  search?: string;
  type?: MovementType;
  status?: MovementStatus;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface WarehouseFilters {
  search?: string;
  type?: WarehouseType;
  isActive?: boolean;
}

// ============================================================================
// INVENTORY STATE
// ============================================================================

export interface InventoryState {
  // Data
  products: Product[];
  warehouses: Warehouse[];
  movements: StockMovement[];
  suppliers: Supplier[];
  alerts: InventoryAlert[];
  
  // Selected
  selectedProduct: Product | null;
  selectedWarehouse: Warehouse | null;
  selectedMovement: StockMovement | null;
  
  // Filters
  productFilters: ProductFilters;
  movementFilters: MovementFilters;
  warehouseFilters: WarehouseFilters;
  
  // UI State
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// INVENTORY ACTIONS
// ============================================================================

export interface InventoryActions {
  // Products
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  selectProduct: (product: Product | string | null) => void;
  
  // Warehouses
  setWarehouses: (warehouses: Warehouse[]) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;
  deleteWarehouse: (id: string) => void;
  selectWarehouse: (warehouse: Warehouse | string | null) => void;
  
  // Movements
  setMovements: (movements: StockMovement[]) => void;
  addMovement: (movement: StockMovement) => void;
  updateMovement: (id: string, updates: Partial<StockMovement>) => void;
  deleteMovement: (id: string) => void;
  selectMovement: (movement: StockMovement | string | null) => void;
  
  // Suppliers
  setSuppliers: (suppliers: Supplier[]) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  
  // Alerts
  setAlerts: (alerts: InventoryAlert[]) => void;
  markAlertAsRead: (id: string) => void;
  resolveAlert: (id: string) => void;
  
  // Filters
  setProductFilters: (filters: Partial<ProductFilters>) => void;
  setMovementFilters: (filters: Partial<MovementFilters>) => void;
  setWarehouseFilters: (filters: Partial<WarehouseFilters>) => void;
  clearProductFilters: () => void;
  clearMovementFilters: () => void;
  clearWarehouseFilters: () => void;
  
  // UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}
