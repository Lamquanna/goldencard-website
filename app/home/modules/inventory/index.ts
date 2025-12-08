/**
 * Inventory Module - Quản lý kho
 * Products, Warehouses, Stock movements, Alerts, Inventory reports
 */

import type { ModuleManifest } from '../../types'

// =============================================================================
// MODULE MANIFEST
// =============================================================================

export const InventoryModuleManifest: ModuleManifest = {
  id: 'inventory',
  name: 'Inventory Management',
  nameVi: 'Quản lý kho',
  version: '1.0.0',
  description: 'Manage products, warehouses and stock movements',
  descriptionVi: 'Quản lý sản phẩm, kho hàng và xuất nhập tồn',
  icon: 'Package',
  color: '#F59E0B', // Amber
  category: 'operations',
  basePath: '/home/inventory',
  author: 'Golden Energy',
  routes: [
    { path: '/home/inventory', name: 'Overview', nameVi: 'Tổng quan', icon: 'Package' },
    { path: '/home/inventory/products', name: 'Products', nameVi: 'Sản phẩm', icon: 'Box' },
    { path: '/home/inventory/warehouses', name: 'Warehouses', nameVi: 'Kho hàng', icon: 'Warehouse' },
    { path: '/home/inventory/stock-in', name: 'Stock In', nameVi: 'Nhập kho', icon: 'ArrowDownToLine' },
    { path: '/home/inventory/stock-out', name: 'Stock Out', nameVi: 'Xuất kho', icon: 'ArrowUpFromLine' },
    { path: '/home/inventory/transfers', name: 'Transfers', nameVi: 'Chuyển kho', icon: 'ArrowLeftRight' },
    { path: '/home/inventory/adjustments', name: 'Adjustments', nameVi: 'Điều chỉnh', icon: 'RefreshCw' },
    { path: '/home/inventory/reports', name: 'Reports', nameVi: 'Báo cáo', icon: 'FileBarChart' },
  ],
  permissions: [
    { 
      id: 'inventory.view', 
      name: 'View Inventory', 
      nameVi: 'Xem kho',
      description: 'View products and stock levels',
      resource: 'inventory',
      actions: ['read']
    },
    { 
      id: 'inventory.product.manage', 
      name: 'Manage Products', 
      nameVi: 'Quản lý sản phẩm',
      description: 'Create, edit, delete products',
      resource: 'product',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'inventory.warehouse.manage', 
      name: 'Manage Warehouses', 
      nameVi: 'Quản lý kho',
      description: 'Create, edit, delete warehouses',
      resource: 'warehouse',
      actions: ['create', 'update', 'delete']
    },
    { 
      id: 'inventory.stock.in', 
      name: 'Stock In', 
      nameVi: 'Nhập kho',
      description: 'Create stock in transactions',
      resource: 'stock_movement',
      actions: ['create']
    },
    { 
      id: 'inventory.stock.out', 
      name: 'Stock Out', 
      nameVi: 'Xuất kho',
      description: 'Create stock out transactions',
      resource: 'stock_movement',
      actions: ['create']
    },
    { 
      id: 'inventory.transfer', 
      name: 'Transfer Stock', 
      nameVi: 'Chuyển kho',
      description: 'Create stock transfers between warehouses',
      resource: 'stock_transfer',
      actions: ['create', 'update']
    },
    { 
      id: 'inventory.adjust', 
      name: 'Adjust Stock', 
      nameVi: 'Điều chỉnh tồn kho',
      description: 'Make stock adjustments',
      resource: 'stock_adjustment',
      actions: ['create']
    },
    { 
      id: 'inventory.report', 
      name: 'View Reports', 
      nameVi: 'Xem báo cáo',
      description: 'Access inventory reports',
      resource: 'report',
      actions: ['read']
    },
  ],
  settings: [
    {
      key: 'low_stock_threshold',
      type: 'number',
      label: 'Low Stock Alert Threshold',
      labelVi: 'Ngưỡng cảnh báo tồn kho thấp',
      defaultValue: 10,
    },
    {
      key: 'enable_barcode',
      type: 'boolean',
      label: 'Enable Barcode Scanning',
      labelVi: 'Bật quét mã vạch',
      defaultValue: true,
    },
    {
      key: 'enable_batch_tracking',
      type: 'boolean',
      label: 'Enable Batch/Lot Tracking',
      labelVi: 'Theo dõi lô hàng',
      defaultValue: false,
    },
    {
      key: 'enable_serial_number',
      type: 'boolean',
      label: 'Enable Serial Number Tracking',
      labelVi: 'Theo dõi số serial',
      defaultValue: false,
    },
    {
      key: 'default_unit',
      type: 'select',
      label: 'Default Unit of Measure',
      labelVi: 'Đơn vị tính mặc định',
      defaultValue: 'piece',
      options: [
        { value: 'piece', label: 'Piece (Cái)' },
        { value: 'kg', label: 'Kilogram (Kg)' },
        { value: 'liter', label: 'Liter (Lít)' },
        { value: 'meter', label: 'Meter (Mét)' },
        { value: 'box', label: 'Box (Thùng)' },
      ]
    },
  ],
  hooks: {
    onActivate: async () => { console.log('Inventory module activated') },
    onDeactivate: async () => { console.log('Inventory module deactivated') },
  },
  defaultRoles: ['admin', 'warehouse_manager', 'warehouse_staff'],
  dependencies: [],
}

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type ProductStatus = 'active' | 'inactive' | 'discontinued'
export type MovementType = 'in' | 'out' | 'transfer' | 'adjustment' | 'return'
export type AdjustmentReason = 'damaged' | 'expired' | 'lost' | 'found' | 'count_correction' | 'other'

export const PRODUCT_STATUS_CONFIG: Record<ProductStatus, { label: string; labelVi: string; color: string }> = {
  active: { label: 'Active', labelVi: 'Đang bán', color: 'bg-green-100 text-green-800' },
  inactive: { label: 'Inactive', labelVi: 'Ngừng bán', color: 'bg-gray-100 text-gray-800' },
  discontinued: { label: 'Discontinued', labelVi: 'Ngừng sản xuất', color: 'bg-red-100 text-red-800' },
}

export const MOVEMENT_TYPE_CONFIG: Record<MovementType, { label: string; labelVi: string; icon: string; color: string }> = {
  in: { label: 'Stock In', labelVi: 'Nhập kho', icon: 'ArrowDownToLine', color: 'text-green-600' },
  out: { label: 'Stock Out', labelVi: 'Xuất kho', icon: 'ArrowUpFromLine', color: 'text-red-600' },
  transfer: { label: 'Transfer', labelVi: 'Chuyển kho', icon: 'ArrowLeftRight', color: 'text-blue-600' },
  adjustment: { label: 'Adjustment', labelVi: 'Điều chỉnh', icon: 'RefreshCw', color: 'text-orange-600' },
  return: { label: 'Return', labelVi: 'Trả hàng', icon: 'RotateCcw', color: 'text-purple-600' },
}

// =============================================================================
// INTERFACES
// =============================================================================

export interface ProductCategory {
  id: string
  name: string
  nameVi: string
  slug: string
  description?: string
  parentId?: string
  parent?: ProductCategory
  children?: ProductCategory[]
  productCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  sku: string
  name: string
  nameVi?: string
  description?: string
  
  // Category
  categoryId?: string
  category?: ProductCategory
  
  // Pricing
  costPrice: number
  sellingPrice: number
  currency: string
  
  // Stock Info
  unit: string
  minStock: number
  maxStock?: number
  reorderPoint?: number
  
  // Identification
  barcode?: string
  qrCode?: string
  
  // Tracking
  trackBatch: boolean
  trackSerial: boolean
  trackExpiry: boolean
  
  // Status
  status: ProductStatus
  
  // Images
  images: string[]
  thumbnail?: string
  
  // Attributes
  weight?: number
  dimensions?: { length: number; width: number; height: number }
  attributes?: Record<string, string>
  
  // Computed
  totalStock: number
  availableStock: number
  reservedStock: number
  
  createdAt: Date
  updatedAt: Date
}

export interface Warehouse {
  id: string
  code: string
  name: string
  nameVi?: string
  
  // Location
  address: string
  city: string
  province: string
  country: string
  postalCode?: string
  latitude?: number
  longitude?: number
  
  // Contact
  managerName?: string
  phone?: string
  email?: string
  
  // Settings
  isDefault: boolean
  isActive: boolean
  capacity?: number
  
  // Stats
  totalProducts: number
  totalValue: number
  
  // Zones/Locations
  zones?: WarehouseZone[]
  
  createdAt: Date
  updatedAt: Date
}

export interface WarehouseZone {
  id: string
  warehouseId: string
  code: string
  name: string
  description?: string
  type: 'storage' | 'receiving' | 'shipping' | 'staging' | 'returns'
  capacity?: number
  currentOccupancy?: number
}

export interface StockLevel {
  id: string
  productId: string
  product?: Product
  warehouseId: string
  warehouse?: Warehouse
  
  // Quantities
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  
  // Location
  zoneId?: string
  zone?: WarehouseZone
  binLocation?: string
  
  // Tracking
  lastMovementAt?: Date
  lastCountedAt?: Date
  
  updatedAt: Date
}

export interface StockMovement {
  id: string
  movementNumber: string
  type: MovementType
  
  // Product
  productId: string
  product?: Product
  
  // Warehouse
  sourceWarehouseId?: string
  sourceWarehouse?: Warehouse
  destinationWarehouseId?: string
  destinationWarehouse?: Warehouse
  
  // Quantities
  quantity: number
  previousQuantity: number
  newQuantity: number
  
  // Batch/Serial
  batchNumber?: string
  serialNumbers?: string[]
  expiryDate?: Date
  
  // Reference
  referenceType?: 'purchase_order' | 'sales_order' | 'transfer_order' | 'adjustment' | 'manual'
  referenceId?: string
  referenceNumber?: string
  
  // Cost
  unitCost?: number
  totalCost?: number
  
  // Adjustment
  adjustmentReason?: AdjustmentReason
  
  // Notes
  notes?: string
  
  // User
  createdById: string
  createdBy?: { id: string; name: string }
  approvedById?: string
  approvedBy?: { id: string; name: string }
  
  // Status
  status: 'draft' | 'pending' | 'approved' | 'completed' | 'cancelled'
  
  createdAt: Date
  completedAt?: Date
}

export interface InventoryCount {
  id: string
  countNumber: string
  
  warehouseId: string
  warehouse?: Warehouse
  
  type: 'full' | 'partial' | 'cycle'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  
  scheduledAt: Date
  startedAt?: Date
  completedAt?: Date
  
  // Stats
  totalItems: number
  countedItems: number
  varianceItems: number
  
  // Users
  assignedToId?: string
  assignedTo?: { id: string; name: string }
  
  items: InventoryCountItem[]
  
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface InventoryCountItem {
  id: string
  countId: string
  
  productId: string
  product?: Product
  
  systemQuantity: number
  countedQuantity?: number
  variance?: number
  varianceReason?: string
  
  status: 'pending' | 'counted' | 'verified'
  
  countedAt?: Date
  countedById?: string
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function getStockStatus(current: number, min: number, max?: number): {
  status: 'out_of_stock' | 'low_stock' | 'in_stock' | 'overstock'
  label: string
  labelVi: string
  color: string
} {
  if (current <= 0) {
    return { status: 'out_of_stock', label: 'Out of Stock', labelVi: 'Hết hàng', color: 'bg-red-100 text-red-800' }
  }
  if (current < min) {
    return { status: 'low_stock', label: 'Low Stock', labelVi: 'Tồn thấp', color: 'bg-yellow-100 text-yellow-800' }
  }
  if (max && current > max) {
    return { status: 'overstock', label: 'Overstock', labelVi: 'Tồn dư', color: 'bg-orange-100 text-orange-800' }
  }
  return { status: 'in_stock', label: 'In Stock', labelVi: 'Còn hàng', color: 'bg-green-100 text-green-800' }
}

export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString()} ${unit}`
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const MOCK_CATEGORIES: ProductCategory[] = [
  { id: '1', name: 'Solar Panels', nameVi: 'Tấm pin mặt trời', slug: 'solar-panels', productCount: 15, createdAt: new Date(), updatedAt: new Date() },
  { id: '2', name: 'Inverters', nameVi: 'Bộ biến tần', slug: 'inverters', productCount: 8, createdAt: new Date(), updatedAt: new Date() },
  { id: '3', name: 'Batteries', nameVi: 'Pin lưu trữ', slug: 'batteries', productCount: 12, createdAt: new Date(), updatedAt: new Date() },
  { id: '4', name: 'Mounting Systems', nameVi: 'Hệ khung đỡ', slug: 'mounting', productCount: 20, createdAt: new Date(), updatedAt: new Date() },
  { id: '5', name: 'Cables & Connectors', nameVi: 'Dây cáp & đầu nối', slug: 'cables', productCount: 30, createdAt: new Date(), updatedAt: new Date() },
]

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: '1',
    code: 'WH-HCM',
    name: 'Ho Chi Minh Warehouse',
    nameVi: 'Kho TP.HCM',
    address: '123 Nguyễn Văn Linh, Quận 7',
    city: 'Ho Chi Minh',
    province: 'Ho Chi Minh',
    country: 'Vietnam',
    isDefault: true,
    isActive: true,
    totalProducts: 450,
    totalValue: 2500000000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 'WH-HN',
    name: 'Hanoi Warehouse',
    nameVi: 'Kho Hà Nội',
    address: '456 Cầu Giấy',
    city: 'Hanoi',
    province: 'Hanoi',
    country: 'Vietnam',
    isDefault: false,
    isActive: true,
    totalProducts: 320,
    totalValue: 1800000000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'SP-450-MONO',
    name: 'JA Solar 450W Mono PERC',
    description: 'High efficiency monocrystalline solar panel',
    categoryId: '1',
    costPrice: 2800000,
    sellingPrice: 3500000,
    currency: 'VND',
    unit: 'piece',
    minStock: 50,
    maxStock: 500,
    reorderPoint: 100,
    barcode: '8936012345678',
    trackBatch: true,
    trackSerial: false,
    trackExpiry: false,
    status: 'active',
    images: [],
    totalStock: 245,
    availableStock: 230,
    reservedStock: 15,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    sku: 'INV-5KW-HYB',
    name: 'Growatt 5kW Hybrid Inverter',
    description: 'Hybrid inverter for solar+battery systems',
    categoryId: '2',
    costPrice: 18000000,
    sellingPrice: 22000000,
    currency: 'VND',
    unit: 'piece',
    minStock: 10,
    maxStock: 100,
    reorderPoint: 20,
    barcode: '8936012345679',
    trackBatch: true,
    trackSerial: true,
    trackExpiry: false,
    status: 'active',
    images: [],
    totalStock: 35,
    availableStock: 32,
    reservedStock: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    sku: 'BAT-LIFEPO4-10',
    name: 'LiFePO4 Battery 10kWh',
    description: 'Lithium iron phosphate battery for energy storage',
    categoryId: '3',
    costPrice: 45000000,
    sellingPrice: 55000000,
    currency: 'VND',
    unit: 'piece',
    minStock: 5,
    maxStock: 50,
    reorderPoint: 10,
    trackBatch: true,
    trackSerial: true,
    trackExpiry: false,
    status: 'active',
    images: [],
    totalStock: 18,
    availableStock: 15,
    reservedStock: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const MOCK_MOVEMENTS: StockMovement[] = [
  {
    id: '1',
    movementNumber: 'MOV-2024-001',
    type: 'in',
    productId: '1',
    destinationWarehouseId: '1',
    quantity: 100,
    previousQuantity: 145,
    newQuantity: 245,
    referenceType: 'purchase_order',
    referenceNumber: 'PO-2024-015',
    status: 'completed',
    createdById: 'user1',
    createdAt: new Date('2024-01-15'),
    completedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    movementNumber: 'MOV-2024-002',
    type: 'out',
    productId: '1',
    sourceWarehouseId: '1',
    quantity: 30,
    previousQuantity: 245,
    newQuantity: 215,
    referenceType: 'sales_order',
    referenceNumber: 'SO-2024-042',
    status: 'completed',
    createdById: 'user1',
    createdAt: new Date('2024-01-16'),
    completedAt: new Date('2024-01-16'),
  },
]
