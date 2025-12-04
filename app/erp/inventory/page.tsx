'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Package, Plus, Search, Filter, ChevronDown, Download, Upload, AlertTriangle,
  ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, MoreHorizontal, Edit2, Trash2,
  Eye, Warehouse, Tag, BarChart3, RefreshCcw, TrendingDown, TrendingUp
} from 'lucide-react';
import { 
  InventoryItem, 
  StockIn, 
  StockOut, 
  Warehouse as WarehouseType,
  ItemType,
  ITEM_TYPES,
  STOCK_IN_REASONS,
  STOCK_OUT_REASONS 
} from '@/lib/types/inventory';
import { useAuthStore } from '@/lib/stores/auth-store';
import * as XLSX from 'xlsx';

// ============================================
// MOCK DATA
// ============================================

const mockWarehouses: WarehouseType[] = [
  { id: 'wh-001', name: 'Kho HCM - Thủ Đức', code: 'WH-HCM-01', type: 'main', address: '123 Đường XYZ, Thủ Đức', city: 'TP. Hồ Chí Minh', province: 'TP. Hồ Chí Minh', country: 'Vietnam', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'wh-002', name: 'Kho Bình Dương', code: 'WH-BD-01', type: 'branch', address: 'KCN VSIP II', city: 'Bình Dương', province: 'Bình Dương', country: 'Vietnam', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'wh-003', name: 'Kho Dự án Bình Thuận', code: 'WH-BT-01', type: 'project_site', address: 'Dự án Solar Farm', city: 'Bình Thuận', province: 'Bình Thuận', country: 'Vietnam', is_active: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
];

const mockItems: InventoryItem[] = [
  {
    id: 'item-001',
    item_code: 'SP-JA-550',
    name: 'Tấm pin JA Solar 550W Mono',
    description: 'Tấm pin năng lượng mặt trời JA Solar Deep Blue 3.0 Pro',
    type: 'solar_panel',
    brand: 'JA Solar',
    model: 'JAM72S30-550/MR',
    unit: 'tấm',
    unit_price: 3500000,
    currency: 'VND',
    opening_stock: 0,
    current_stock: 1250,
    reserved_stock: 200,
    available_stock: 1050,
    min_stock_alert: 100,
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    location_in_warehouse: 'A1-01',
    warranty_months: 144,
    is_active: true,
    is_low_stock: false,
    created_by: 'admin',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-15T00:00:00Z',
    stock_value: 4375000000,
  },
  {
    id: 'item-002',
    item_code: 'INV-HW-100',
    name: 'Inverter Huawei SUN2000-100KTL',
    description: 'Inverter hòa lưới 100kW Huawei',
    type: 'inverter',
    brand: 'Huawei',
    model: 'SUN2000-100KTL-M1',
    unit: 'bộ',
    unit_price: 125000000,
    currency: 'VND',
    opening_stock: 0,
    current_stock: 25,
    reserved_stock: 5,
    available_stock: 20,
    min_stock_alert: 5,
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    location_in_warehouse: 'B2-01',
    warranty_months: 60,
    is_active: true,
    is_low_stock: false,
    created_by: 'admin',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-06-10T00:00:00Z',
    stock_value: 3125000000,
  },
  {
    id: 'item-003',
    item_code: 'CBL-DC-6',
    name: 'Cáp DC Solar 6mm² PV1-F',
    description: 'Cáp chuyên dụng cho điện mặt trời 1500V DC',
    type: 'cable',
    brand: 'Helukabel',
    model: 'SOLARFLEX-X PV1-F',
    unit: 'm',
    unit_price: 35000,
    currency: 'VND',
    opening_stock: 0,
    current_stock: 45000,
    reserved_stock: 10000,
    available_stock: 35000,
    min_stock_alert: 5000,
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    location_in_warehouse: 'C1-01',
    is_active: true,
    is_low_stock: false,
    created_by: 'admin',
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-06-12T00:00:00Z',
    stock_value: 1575000000,
  },
  {
    id: 'item-004',
    item_code: 'IOT-GW-01',
    name: 'IoT Gateway Solar Monitoring',
    description: 'Thiết bị giám sát IoT cho hệ thống điện mặt trời',
    type: 'iot_device',
    brand: 'GoldenEnergy',
    model: 'GE-IOT-GW-01',
    unit: 'bộ',
    unit_price: 8500000,
    currency: 'VND',
    opening_stock: 0,
    current_stock: 8,
    reserved_stock: 3,
    available_stock: 5,
    min_stock_alert: 10,
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    location_in_warehouse: 'D1-01',
    warranty_months: 24,
    is_active: true,
    is_low_stock: true,
    created_by: 'admin',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-06-08T00:00:00Z',
    stock_value: 68000000,
  },
  {
    id: 'item-005',
    item_code: 'BAT-BYD-280',
    name: 'Pin lưu trữ BYD HVS 2.8kWh',
    description: 'Module pin lithium iron phosphate BYD',
    type: 'battery',
    brand: 'BYD',
    model: 'Battery-Box Premium HVS 2.8',
    unit: 'module',
    unit_price: 42000000,
    currency: 'VND',
    opening_stock: 0,
    current_stock: 32,
    reserved_stock: 8,
    available_stock: 24,
    min_stock_alert: 10,
    warehouse_id: 'wh-002',
    warehouse_name: 'Kho Bình Dương',
    location_in_warehouse: 'A1-01',
    warranty_months: 120,
    is_active: true,
    is_low_stock: false,
    created_by: 'admin',
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-06-05T00:00:00Z',
    stock_value: 1344000000,
  },
  {
    id: 'item-006',
    item_code: 'MNT-AL-01',
    name: 'Khung nhôm đỡ tấm pin - Mái tôn',
    description: 'Hệ khung giá đỡ bằng nhôm cho mái tôn',
    type: 'mounting_structure',
    brand: 'Schletter',
    model: 'Rapid16',
    unit: 'bộ',
    unit_price: 850000,
    currency: 'VND',
    opening_stock: 0,
    current_stock: 520,
    reserved_stock: 100,
    available_stock: 420,
    min_stock_alert: 50,
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    location_in_warehouse: 'E1-01',
    warranty_months: 120,
    is_active: true,
    is_low_stock: false,
    created_by: 'admin',
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-06-14T00:00:00Z',
    stock_value: 442000000,
  },
];

const mockStockIn: StockIn[] = [
  {
    id: 'si-001',
    transaction_code: 'SI-2024-0156',
    item_id: 'item-001',
    item_code: 'SP-JA-550',
    item_name: 'Tấm pin JA Solar 550W Mono',
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    quantity: 500,
    unit: 'tấm',
    unit_price: 3500000,
    total_value: 1750000000,
    reason: 'purchase',
    reference_number: 'PO-2024-078',
    supplier_id: 'sup-001',
    supplier_name: 'JA Solar Vietnam',
    batch_number: 'JA2024-06-001',
    requires_approval: false,
    created_by: 'user-001',
    created_by_name: 'Nguyễn Văn A',
    created_at: '2024-06-10T09:30:00Z',
    stock_before: 750,
    stock_after: 1250,
  },
  {
    id: 'si-002',
    transaction_code: 'SI-2024-0157',
    item_id: 'item-002',
    item_code: 'INV-HW-100',
    item_name: 'Inverter Huawei SUN2000-100KTL',
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    quantity: 10,
    unit: 'bộ',
    unit_price: 125000000,
    total_value: 1250000000,
    reason: 'purchase',
    reference_number: 'PO-2024-079',
    supplier_id: 'sup-002',
    supplier_name: 'Huawei Solar',
    requires_approval: false,
    created_by: 'user-001',
    created_by_name: 'Nguyễn Văn A',
    created_at: '2024-06-08T14:15:00Z',
    stock_before: 15,
    stock_after: 25,
  },
];

const mockStockOut: StockOut[] = [
  {
    id: 'so-001',
    transaction_code: 'SO-2024-0089',
    item_id: 'item-001',
    item_code: 'SP-JA-550',
    item_name: 'Tấm pin JA Solar 550W Mono',
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    quantity: 200,
    unit: 'tấm',
    unit_price: 3500000,
    total_value: 700000000,
    reason: 'project_usage',
    project_id: 'proj-002',
    project_name: 'Solar Rooftop AEON Mall',
    receiver_name: 'Trần Văn B',
    receiver_department: 'Thi công',
    requires_approval: true,
    approval_status: 'approved',
    approved_by: 'user-manager',
    approved_by_name: 'Lê Thị Manager',
    approved_at: '2024-06-11T10:00:00Z',
    requested_by: 'user-002',
    requested_by_name: 'Trần Văn B',
    created_at: '2024-06-11T08:30:00Z',
    stock_before: 1450,
    stock_after: 1250,
  },
  {
    id: 'so-002',
    transaction_code: 'SO-2024-0090',
    item_id: 'item-003',
    item_code: 'CBL-DC-6',
    item_name: 'Cáp DC Solar 6mm² PV1-F',
    warehouse_id: 'wh-001',
    warehouse_name: 'Kho HCM - Thủ Đức',
    quantity: 5000,
    unit: 'm',
    total_value: 175000000,
    reason: 'project_usage',
    project_id: 'proj-001',
    project_name: 'Solar Farm Bình Thuận 50MW',
    receiver_name: 'Phạm Văn C',
    requires_approval: true,
    approval_status: 'pending',
    requested_by: 'user-003',
    requested_by_name: 'Phạm Văn C',
    created_at: '2024-06-15T09:00:00Z',
    stock_before: 50000,
    stock_after: 45000,
  },
];

// ============================================
// COMPONENT
// ============================================

type TabType = 'items' | 'stock_in' | 'stock_out' | 'alerts';

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabType>('items');
  const [items, setItems] = useState<InventoryItem[]>(mockItems);
  const [stockInList, setStockInList] = useState<StockIn[]>(mockStockIn);
  const [stockOutList, setStockOutList] = useState<StockOut[]>(mockStockOut);
  const [warehouses] = useState<WarehouseType[]>(mockWarehouses);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ItemType | 'all'>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  
  const { hasPermission } = useAuthStore();
  
  const canCreate = hasPermission('inventory', 'create');
  const canEdit = hasPermission('inventory', 'edit');
  const canDelete = hasPermission('inventory', 'delete');
  const canApprove = hasPermission('inventory', 'approve');

  // Computed values
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.item_code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      const matchWarehouse = warehouseFilter === 'all' || item.warehouse_id === warehouseFilter;
      return matchSearch && matchType && matchWarehouse;
    });
  }, [items, searchQuery, typeFilter, warehouseFilter]);

  const lowStockItems = items.filter(item => item.is_low_stock);
  const pendingApprovals = stockOutList.filter(so => so.approval_status === 'pending');

  // Stats
  const stats = {
    totalItems: items.length,
    totalValue: items.reduce((sum, item) => sum + (item.stock_value || 0), 0),
    lowStock: lowStockItems.length,
    pendingApprovals: pendingApprovals.length,
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) return `${(amount / 1000000000).toFixed(2)} tỷ`;
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(0)} triệu`;
    return amount.toLocaleString('vi-VN');
  };

  // Handle Excel Export
  const handleExportExcel = () => {
    let exportData: any[] = [];
    let sheetName = '';

    if (activeTab === 'items') {
      exportData = filteredItems.map(item => ({
        'Mã hàng': item.item_code,
        'Tên hàng': item.name,
        'Loại': ITEM_TYPES[item.type]?.name || item.type,
        'Kho': item.warehouse_name,
        'Vị trí': item.location_in_warehouse || '',
        'Tồn kho': item.current_stock,
        'Đã đặt': item.reserved_stock,
        'Còn lại': item.available_stock,
        'Đơn vị': item.unit,
        'Đơn giá': item.unit_price || 0,
        'Giá trị': item.stock_value || 0,
        'Mức cảnh báo': item.min_stock_alert,
        'Thương hiệu': item.brand || '',
        'Model': item.model || '',
      }));
      sheetName = 'Danh mục hàng';
    } else if (activeTab === 'stock_in') {
      exportData = stockInList.map(si => ({
        'Mã phiếu': si.transaction_code,
        'Mã hàng': si.item_code,
        'Tên hàng': si.item_name,
        'Kho': si.warehouse_name,
        'Số lượng': si.quantity,
        'Đơn vị': si.unit,
        'Đơn giá': si.unit_price || 0,
        'Tổng giá trị': si.total_value || 0,
        'Lý do': STOCK_IN_REASONS[si.reason],
        'Nhà cung cấp': si.supplier_name || '',
        'Người nhập': si.created_by_name,
        'Ngày nhập': new Date(si.created_at).toLocaleDateString('vi-VN'),
      }));
      sheetName = 'Phiếu nhập';
    } else if (activeTab === 'stock_out') {
      exportData = stockOutList.map(so => ({
        'Mã phiếu': so.transaction_code,
        'Mã hàng': so.item_code,
        'Tên hàng': so.item_name,
        'Kho': so.warehouse_name,
        'Số lượng': so.quantity,
        'Đơn vị': so.unit,
        'Giá trị': so.total_value || 0,
        'Lý do': STOCK_OUT_REASONS[so.reason],
        'Dự án': so.project_name || '',
        'Người yêu cầu': so.requested_by_name || '',
        'Trạng thái': so.approval_status,
        'Ngày xuất': new Date(so.created_at).toLocaleDateString('vi-VN'),
      }));
      sheetName = 'Phiếu xuất';
    } else if (activeTab === 'alerts') {
      exportData = lowStockItems.map(item => ({
        'Mã hàng': item.item_code,
        'Tên hàng': item.name,
        'Kho': item.warehouse_name,
        'Tồn kho': item.current_stock,
        'Mức cảnh báo': item.min_stock_alert,
        'Chênh lệch': item.current_stock - item.min_stock_alert,
        'Đơn vị': item.unit,
      }));
      sheetName = 'Cảnh báo tồn kho';
    }

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename with date
    const filename = `Kho_${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Export
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.totalItems} mặt hàng · Tổng giá trị: {formatCurrency(stats.totalValue)} VND
              </p>
            </div>
            
            {canCreate && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowStockInModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <ArrowDownToLine size={18} />
                  <span>Nhập kho</span>
                </button>
                <button 
                  onClick={() => setShowStockOutModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <ArrowUpFromLine size={18} />
                  <span>Xuất kho</span>
                </button>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                <span className="text-blue-600 text-sm font-medium">Tổng SKU</span>
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{stats.totalItems}</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} />
                <span className="text-green-600 text-sm font-medium">Giá trị kho</span>
              </div>
              <div className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(stats.totalValue)}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-orange-600" size={20} />
                <span className="text-orange-600 text-sm font-medium">Sắp hết hàng</span>
              </div>
              <div className="text-2xl font-bold text-orange-700 mt-1">{stats.lowStock}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <RefreshCcw className="text-purple-600" size={20} />
                <span className="text-purple-600 text-sm font-medium">Chờ duyệt</span>
              </div>
              <div className="text-2xl font-bold text-purple-700 mt-1">{stats.pendingApprovals}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm border">
          {[
            { key: 'items', label: 'Danh mục hàng', icon: Package },
            { key: 'stock_in', label: 'Phiếu nhập', icon: ArrowDownToLine },
            { key: 'stock_out', label: 'Phiếu xuất', icon: ArrowUpFromLine },
            { key: 'alerts', label: 'Cảnh báo', icon: AlertTriangle, badge: stats.lowStock },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key 
                  ? 'bg-yellow-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  activeTab === tab.key ? 'bg-yellow-600' : 'bg-orange-100 text-orange-600'
                }`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Warehouse Filter */}
            <select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">Tất cả kho</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>{wh.name}</option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ItemType | 'all')}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">Tất cả loại</option>
              {Object.entries(ITEM_TYPES).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.name}</option>
              ))}
            </select>

            {/* Export */}
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download size={18} />
              <span>Xuất Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {activeTab === 'items' && (
          <ItemsTable 
            items={filteredItems} 
            canEdit={canEdit}
            canDelete={canDelete}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'stock_in' && (
          <StockInTable 
            stockInList={stockInList}
            formatCurrency={formatCurrency}
          />
        )}

        {activeTab === 'stock_out' && (
          <StockOutTable 
            stockOutList={stockOutList}
            formatCurrency={formatCurrency}
            canApprove={canApprove}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsPanel 
            lowStockItems={lowStockItems}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ItemsTable({ 
  items, 
  canEdit, 
  canDelete,
  formatCurrency 
}: { 
  items: InventoryItem[]; 
  canEdit: boolean;
  canDelete: boolean;
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mã / Tên</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Loại</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Kho</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Tồn kho</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Đã đặt</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Còn lại</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Đơn giá</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Giá trị</th>
              <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map(item => {
              const itemType = ITEM_TYPES[item.type];
              return (
                <tr key={item.id} className="hover:bg-gray-50 group">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        {item.name}
                        {item.is_low_stock && (
                          <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full">
                            Sắp hết
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{item.item_code}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${itemType?.color}`}>
                      {itemType?.icon} {itemType?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div>{item.warehouse_name}</div>
                    <div className="text-xs text-gray-400">{item.location_in_warehouse}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {item.current_stock.toLocaleString()} {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-orange-600">
                    {item.reserved_stock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-medium">
                    {item.available_stock.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-600">
                    {item.unit_price ? formatCurrency(item.unit_price) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {item.stock_value ? formatCurrency(item.stock_value) : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                        <Eye size={16} />
                      </button>
                      {canEdit && (
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                          <Edit2 size={16} />
                        </button>
                      )}
                      {canDelete && (
                        <button className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-2">Không tìm thấy mặt hàng</p>
        </div>
      )}
    </div>
  );
}

function StockInTable({ 
  stockInList,
  formatCurrency 
}: { 
  stockInList: StockIn[];
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mã phiếu</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Sản phẩm</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Kho</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Số lượng</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Giá trị</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Lý do</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Người nhập</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ngày</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {stockInList.map(si => (
            <tr key={si.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <span className="font-mono text-sm text-green-600">{si.transaction_code}</span>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{si.item_name}</div>
                <div className="text-xs text-gray-500">{si.item_code}</div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{si.warehouse_name}</td>
              <td className="px-4 py-3 text-right font-medium text-green-600">
                +{si.quantity.toLocaleString()} {si.unit}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-600">
                {si.total_value ? formatCurrency(si.total_value) : '-'}
              </td>
              <td className="px-4 py-3">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {STOCK_IN_REASONS[si.reason]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{si.created_by_name}</td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(si.created_at).toLocaleDateString('vi-VN')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {stockInList.length === 0 && (
        <div className="text-center py-12">
          <ArrowDownToLine className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-2">Chưa có phiếu nhập nào</p>
        </div>
      )}
    </div>
  );
}

function StockOutTable({ 
  stockOutList,
  formatCurrency,
  canApprove
}: { 
  stockOutList: StockOut[];
  formatCurrency: (amount: number) => string;
  canApprove: boolean;
}) {
  const statusConfig = {
    pending: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
    approved: { label: 'Đã duyệt', color: 'bg-green-100 text-green-700' },
    rejected: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Mã phiếu</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Sản phẩm</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Dự án</th>
            <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">Số lượng</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Trạng thái</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Người yêu cầu</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ngày</th>
            <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {stockOutList.map(so => {
            const status = statusConfig[so.approval_status];
            return (
              <tr key={so.id} className="hover:bg-gray-50 group">
                <td className="px-4 py-3">
                  <span className="font-mono text-sm text-orange-600">{so.transaction_code}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{so.item_name}</div>
                  <div className="text-xs text-gray-500">{so.item_code}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {so.project_name || '-'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-orange-600">
                  -{so.quantity.toLocaleString()} {so.unit}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{so.requested_by_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(so.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-center">
                  {so.approval_status === 'pending' && canApprove && (
                    <div className="flex items-center justify-center gap-1">
                      <button className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg hover:bg-green-600">
                        Duyệt
                      </button>
                      <button className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600">
                        Từ chối
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {stockOutList.length === 0 && (
        <div className="text-center py-12">
          <ArrowUpFromLine className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-2">Chưa có phiếu xuất nào</p>
        </div>
      )}
    </div>
  );
}

function AlertsPanel({ 
  lowStockItems,
  formatCurrency 
}: { 
  lowStockItems: InventoryItem[];
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="space-y-4">
      {lowStockItems.length > 0 ? (
        lowStockItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-orange-500">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-orange-500" size={20} />
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Mã: {item.item_code} · Kho: {item.warehouse_name}
                </p>
              </div>
              <button className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
                Tạo đơn mua
              </button>
            </div>
            <div className="mt-3 flex items-center gap-6 text-sm">
              <div>
                <span className="text-gray-500">Tồn kho:</span>
                <span className="ml-2 font-medium text-orange-600">{item.current_stock.toLocaleString()} {item.unit}</span>
              </div>
              <div>
                <span className="text-gray-500">Tối thiểu:</span>
                <span className="ml-2 font-medium">{item.min_stock_alert.toLocaleString()} {item.unit}</span>
              </div>
              <div>
                <span className="text-gray-500">Đề xuất nhập:</span>
                <span className="ml-2 font-medium text-blue-600">{item.reorder_quantity?.toLocaleString() || item.min_stock_alert * 2} {item.unit}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-lg font-medium text-gray-900">Tất cả hàng đều đủ số lượng</h3>
          <p className="text-gray-500 mt-1">Không có cảnh báo sắp hết hàng</p>
        </div>
      )}
    </div>
  );
}
