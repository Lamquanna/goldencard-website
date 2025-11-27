// TypeScript types for Inventory Module
// Designed for Renewable Energy equipment & materials

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type ItemType = 
  | 'solar_panel'
  | 'wind_turbine'
  | 'inverter'
  | 'cable'
  | 'iot_device'
  | 'battery'
  | 'mounting_structure'
  | 'transformer'
  | 'switchgear'
  | 'meter'
  | 'tools'
  | 'consumable'
  | 'other';

export type StockTransactionType = 'in' | 'out' | 'adjustment' | 'transfer';

export type StockOutReason = 
  | 'project_usage'
  | 'sale'
  | 'return_to_supplier'
  | 'damaged'
  | 'lost'
  | 'other';

export type StockInReason = 
  | 'purchase'
  | 'return_from_project'
  | 'return_from_customer'
  | 'adjustment'
  | 'transfer_in'
  | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ============================================
// WAREHOUSE / LOCATION
// ============================================

export interface Warehouse {
  id: string;
  name: string;
  code: string;                    // e.g., "WH-HCM-01"
  type: 'main' | 'branch' | 'project_site';
  
  address: string;
  city?: string;
  province?: string;
  country: string;
  
  latitude?: number;
  longitude?: number;
  
  manager_id?: string;
  manager_name?: string;
  phone?: string;
  
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// ============================================
// SUPPLIER
// ============================================

export interface Supplier {
  id: string;
  name: string;
  code?: string;
  
  contact_person?: string;
  phone?: string;
  email?: string;
  
  address?: string;
  country?: string;
  
  tax_id?: string;
  payment_terms?: string;
  
  category?: string[];             // Types of products they supply
  rating?: number;                 // 1-5
  
  is_active: boolean;
  
  created_at: string;
  updated_at: string;
}

// ============================================
// ITEM (MASTER DATA)
// ============================================

export interface InventoryItem {
  id: string;
  item_code: string;               // SKU/Part number
  name: string;
  description?: string;
  
  type: ItemType;
  category?: string;               // Sub-category
  brand?: string;
  model?: string;
  
  // Specifications
  specifications?: Record<string, string | number>;
  
  // Supplier
  supplier_id?: string;
  supplier_name?: string;
  
  // Batch tracking
  batch_number?: string;
  serial_number?: string;
  barcode?: string;
  qr_code?: string;
  
  // Unit & Pricing
  unit: string;                    // pcs, m, kg, etc.
  unit_price?: number;
  currency?: string;
  
  // Stock levels
  opening_stock: number;           // Initial stock when item created
  current_stock: number;           // Real-time stock
  reserved_stock: number;          // Reserved for projects
  available_stock: number;         // current - reserved
  
  // Alerts
  min_stock_alert: number;         // Alert when below this
  max_stock_level?: number;        // Maximum capacity
  reorder_quantity?: number;       // Suggested reorder qty
  
  // Location
  warehouse_id: string;
  warehouse_name?: string;
  location_in_warehouse?: string;  // Shelf/Bin location
  
  // Warranty & Expiry
  warranty_months?: number;
  expiry_date?: string;
  
  // Images
  image_url?: string;
  images?: string[];
  
  // Status
  is_active: boolean;
  
  // Metadata
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Computed
  stock_value?: number;            // current_stock * unit_price
  is_low_stock?: boolean;
}

// ============================================
// STOCK IN (NHẬP KHO)
// ============================================

export interface StockIn {
  id: string;
  transaction_code: string;        // e.g., "SI-2024-001"
  
  item_id: string;
  item_code?: string;
  item_name?: string;
  
  warehouse_id: string;
  warehouse_name?: string;
  
  quantity: number;
  unit?: string;
  unit_price?: number;
  total_value?: number;
  
  reason: StockInReason;
  reference_number?: string;       // PO number, invoice, etc.
  
  supplier_id?: string;
  supplier_name?: string;
  
  // Batch info
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  
  note?: string;
  attachments?: StockAttachment[];
  
  // Approval (if needed)
  requires_approval: boolean;
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_at?: string;
  
  // User
  created_by: string;
  created_by_name?: string;
  created_at: string;
  
  // Stock snapshot
  stock_before: number;
  stock_after: number;
}

// ============================================
// STOCK OUT (XUẤT KHO)
// ============================================

export interface StockOut {
  id: string;
  transaction_code: string;        // e.g., "SO-2024-001"
  
  item_id: string;
  item_code?: string;
  item_name?: string;
  
  warehouse_id: string;
  warehouse_name?: string;
  
  quantity: number;
  unit?: string;
  unit_price?: number;
  total_value?: number;
  
  reason: StockOutReason;
  
  // Destination
  project_id?: string;             // If for project
  project_name?: string;
  task_id?: string;                // Specific task
  
  receiver_id?: string;            // Person receiving
  receiver_name?: string;
  receiver_department?: string;
  
  delivery_address?: string;
  
  note?: string;
  attachments?: StockAttachment[];
  
  // Approval (Manager must approve)
  requires_approval: boolean;
  approval_status: ApprovalStatus;
  approved_by?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  // User
  requested_by: string;
  requested_by_name?: string;
  created_at: string;
  
  // Stock snapshot
  stock_before: number;
  stock_after: number;
}

// ============================================
// STOCK ADJUSTMENT
// ============================================

export interface StockAdjustment {
  id: string;
  adjustment_code: string;
  
  item_id: string;
  item_code?: string;
  item_name?: string;
  
  warehouse_id: string;
  
  adjustment_type: 'increase' | 'decrease';
  quantity: number;
  
  reason: 'inventory_count' | 'damage' | 'expiry' | 'correction' | 'other';
  note: string;
  
  approved_by?: string;
  approved_at?: string;
  
  created_by: string;
  created_at: string;
  
  stock_before: number;
  stock_after: number;
}

// ============================================
// STOCK TRANSFER
// ============================================

export interface StockTransfer {
  id: string;
  transfer_code: string;
  
  item_id: string;
  item_code?: string;
  item_name?: string;
  
  from_warehouse_id: string;
  from_warehouse_name?: string;
  
  to_warehouse_id: string;
  to_warehouse_name?: string;
  
  quantity: number;
  
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  
  requested_by: string;
  approved_by?: string;
  received_by?: string;
  
  requested_at: string;
  approved_at?: string;
  shipped_at?: string;
  received_at?: string;
  
  note?: string;
}

// ============================================
// ATTACHMENT
// ============================================

export interface StockAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploaded_by: string;
  uploaded_at: string;
}

// ============================================
// INVENTORY ALERT
// ============================================

export interface InventoryAlert {
  id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  
  alert_type: 'low_stock' | 'overstock' | 'expiring' | 'expired';
  
  current_value: number;
  threshold_value: number;
  
  severity: 'warning' | 'critical';
  
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  
  created_at: string;
}

// ============================================
// API INPUT TYPES
// ============================================

export interface CreateItemInput {
  item_code: string;
  name: string;
  description?: string;
  type: ItemType;
  category?: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, string | number>;
  supplier_id?: string;
  unit: string;
  unit_price?: number;
  opening_stock: number;
  min_stock_alert: number;
  max_stock_level?: number;
  warehouse_id: string;
  location_in_warehouse?: string;
  warranty_months?: number;
  image_url?: string;
}

export interface CreateStockInInput {
  item_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price?: number;
  reason: StockInReason;
  reference_number?: string;
  supplier_id?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  note?: string;
}

export interface CreateStockOutInput {
  item_id: string;
  warehouse_id: string;
  quantity: number;
  reason: StockOutReason;
  project_id?: string;
  task_id?: string;
  receiver_id?: string;
  receiver_name?: string;
  delivery_address?: string;
  note?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const ITEM_TYPES: Record<ItemType, { name: string; icon: string; color: string }> = {
  solar_panel: { name: 'Tấm pin mặt trời', icon: '☀️', color: 'bg-yellow-100 text-yellow-800' },
  wind_turbine: { name: 'Tua-bin gió', icon: '💨', color: 'bg-cyan-100 text-cyan-800' },
  inverter: { name: 'Inverter', icon: '⚡', color: 'bg-purple-100 text-purple-800' },
  cable: { name: 'Cáp điện', icon: '🔌', color: 'bg-gray-100 text-gray-800' },
  iot_device: { name: 'Thiết bị IoT', icon: '📡', color: 'bg-blue-100 text-blue-800' },
  battery: { name: 'Pin lưu trữ', icon: '🔋', color: 'bg-green-100 text-green-800' },
  mounting_structure: { name: 'Khung giá đỡ', icon: '🏗️', color: 'bg-orange-100 text-orange-800' },
  transformer: { name: 'Máy biến áp', icon: '🔺', color: 'bg-red-100 text-red-800' },
  switchgear: { name: 'Tủ điện', icon: '🎛️', color: 'bg-indigo-100 text-indigo-800' },
  meter: { name: 'Đồng hồ đo', icon: '📊', color: 'bg-teal-100 text-teal-800' },
  tools: { name: 'Dụng cụ', icon: '🔧', color: 'bg-amber-100 text-amber-800' },
  consumable: { name: 'Vật tư tiêu hao', icon: '📦', color: 'bg-stone-100 text-stone-800' },
  other: { name: 'Khác', icon: '📋', color: 'bg-slate-100 text-slate-800' },
};

export const STOCK_IN_REASONS: Record<StockInReason, string> = {
  purchase: 'Mua mới',
  return_from_project: 'Trả từ dự án',
  return_from_customer: 'Trả từ khách hàng',
  adjustment: 'Điều chỉnh',
  transfer_in: 'Chuyển kho đến',
  other: 'Khác',
};

export const STOCK_OUT_REASONS: Record<StockOutReason, string> = {
  project_usage: 'Sử dụng cho dự án',
  sale: 'Bán hàng',
  return_to_supplier: 'Trả nhà cung cấp',
  damaged: 'Hư hỏng',
  lost: 'Mất mát',
  other: 'Khác',
};
