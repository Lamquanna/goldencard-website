'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/crm-config';
import type { Deal, DealProduct } from '@/lib/crm-advanced-features';

interface DealTrackerProps {
  leadId: string;
  leadName: string;
  onClose: () => void;
}

export default function DealTracker({ leadId, leadName, onClose }: DealTrackerProps) {
  const [deal, setDeal] = useState<Partial<Deal>>({
    lead_id: leadId,
    name: `Hệ thống điện mặt trời cho ${leadName}`,
    value: 0,
    currency: 'VND',
    stage: 'qualified',
    probability: 50,
    expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    products: [],
    commission_rate: 10,
  });

  const [products, setProducts] = useState<DealProduct[]>([
    {
      id: '1',
      name: 'Tấm pin mặt trời 550W',
      category: 'solar_panel',
      quantity: 20,
      unit_price: 3500000,
      discount: 5,
      subtotal: 0,
      tax: 10,
      total: 0,
    },
    {
      id: '2',
      name: 'Biến tần Huawei 15kW',
      category: 'inverter',
      quantity: 1,
      unit_price: 45000000,
      discount: 0,
      subtotal: 0,
      tax: 10,
      total: 0,
    },
    {
      id: '3',
      name: 'Lắp đặt & vận hành',
      category: 'installation',
      quantity: 1,
      unit_price: 25000000,
      discount: 0,
      subtotal: 0,
      tax: 10,
      total: 0,
    },
  ]);

  // Calculate totals
  const calculateProduct = (product: DealProduct) => {
    const subtotal = product.quantity * product.unit_price * (1 - product.discount / 100);
    const total = subtotal * (1 + product.tax / 100);
    return { ...product, subtotal, total };
  };

  const updatedProducts = products.map(calculateProduct);
  const totalValue = updatedProducts.reduce((sum, p) => sum + p.total, 0);
  const commissionValue = totalValue * (deal.commission_rate || 0) / 100;
  const weightedValue = totalValue * (deal.probability || 0) / 100;

  const PRODUCT_CATEGORIES = [
    { value: 'solar_panel', label: 'Tấm Pin Mặt Trời', icon: '☀️' },
    { value: 'inverter', label: 'Biến Tần', icon: '⚡' },
    { value: 'battery', label: 'Pin Lưu Trữ', icon: '🔋' },
    { value: 'installation', label: 'Lắp Đặt', icon: '🔧' },
    { value: 'maintenance', label: 'Bảo Trì', icon: '🛠️' },
    { value: 'other', label: 'Khác', icon: '📦' },
  ];

  const DEAL_STAGES = [
    { value: 'lead', label: 'Lead Mới', color: 'bg-gray-500', probability: 10 },
    { value: 'qualified', label: 'Đã Xác Định', color: 'bg-blue-500', probability: 25 },
    { value: 'proposal', label: 'Đã Báo Giá', color: 'bg-purple-500', probability: 50 },
    { value: 'negotiation', label: 'Đang Thương Lượng', color: 'bg-orange-500', probability: 75 },
    { value: 'won', label: 'Thành Công', color: 'bg-green-500', probability: 100 },
    { value: 'lost', label: 'Thất Bại', color: 'bg-red-500', probability: 0 },
  ];

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        id: Date.now().toString(),
        name: '',
        category: 'other',
        quantity: 1,
        unit_price: 0,
        discount: 0,
        subtotal: 0,
        tax: 10,
        total: 0,
      },
    ]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleProductChange = (id: string, field: keyof DealProduct, value: any) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleStageChange = (stage: string) => {
    const stageConfig = DEAL_STAGES.find(s => s.value === stage);
    setDeal({
      ...deal,
      stage: stage as Deal['stage'],
      probability: stageConfig?.probability || deal.probability,
    });
  };

  const handleSave = async () => {
    const fullDeal: Deal = {
      id: Date.now().toString(),
      lead_id: leadId,
      name: deal.name || '',
      value: totalValue,
      currency: 'VND',
      stage: deal.stage || 'qualified',
      probability: deal.probability || 50,
      expected_close_date: deal.expected_close_date || '',
      products: updatedProducts,
      total_value: totalValue,
      commission_rate: deal.commission_rate || 10,
      commission_value: commissionValue,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // TODO: Save to API
    console.log('Saving deal:', fullDeal);
    alert('Deal đã được lưu!');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1">💰 Deal Tracking</h2>
              <p className="text-green-100 text-sm">Quản lý cơ hội bán hàng & dự báo doanh thu</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Deal Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Deal
              </label>
              <input
                type="text"
                value={deal.name}
                onChange={(e) => setDeal({ ...deal, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="VD: Hệ thống 50kW cho Nhà máy ABC"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày Dự Kiến Chốt
              </label>
              <input
                type="date"
                value={deal.expected_close_date}
                onChange={(e) => setDeal({ ...deal, expected_close_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                value={deal.stage}
                onChange={(e) => handleStageChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {DEAL_STAGES.map(stage => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác Suất Thành Công (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={deal.probability}
                onChange={(e) => setDeal({ ...deal, probability: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hoa Hồng (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={deal.commission_rate}
                onChange={(e) => setDeal({ ...deal, commission_rate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Products */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Sản Phẩm & Dịch Vụ</h3>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
              >
                ➕ Thêm Sản Phẩm
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sản Phẩm</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Loại</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">SL</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Đơn Giá</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Giảm (%)</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Thuế (%)</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Thành Tiền</th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => {
                    const calculated = calculateProduct(product);
                    return (
                      <tr key={product.id} className="border-t border-gray-200">
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="Tên sản phẩm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={product.category}
                            onChange={(e) => handleProductChange(product.id, 'category', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {PRODUCT_CATEGORIES.map(cat => (
                              <option key={cat.value} value={cat.value}>
                                {cat.icon} {cat.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleProductChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            value={product.unit_price}
                            onChange={(e) => handleProductChange(product.id, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-28 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={product.discount}
                            onChange={(e) => handleProductChange(product.id, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={product.tax}
                            onChange={(e) => handleProductChange(product.id, 'tax', parseFloat(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                          />
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatCurrency(calculated.total)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleRemoveProduct(product.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Tóm Tắt Deal</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Tổng Giá Trị</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(totalValue)}
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Weighted Value</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(weightedValue)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ({deal.probability}% xác suất)
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Hoa Hồng</div>
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(commissionValue)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ({deal.commission_rate}%)
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Stage</div>
                <div className="text-sm font-bold text-gray-900">
                  {DEAL_STAGES.find(s => s.value === deal.stage)?.label}
                </div>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                  DEAL_STAGES.find(s => s.value === deal.stage)?.color
                } text-white`}>
                  {deal.probability}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg"
          >
            💾 Lưu Deal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
