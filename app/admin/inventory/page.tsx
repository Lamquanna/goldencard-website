// ============================================================================
// INVENTORY MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Kho hàng</h1>
        <p className="text-gray-500 mt-1">Quản lý vật tư, thiết bị và tồn kho</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Tổng SKU</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">248</p>
          <p className="text-sm text-gray-500 mt-1">12 danh mục</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Giá trị tồn kho</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">12.5 tỷ</p>
          <p className="text-sm text-gray-500 mt-1">+2.1 tỷ tháng này</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Sắp hết hàng</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">15</p>
          <p className="text-sm text-gray-500 mt-1">Cần nhập thêm</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Đơn đặt hàng</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
          <p className="text-sm text-gray-500 mt-1">Đang chờ nhận</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Danh sách vật tư</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
                Nhập kho
              </button>
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
                + Thêm mới
              </button>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã SP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn kho</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { code: 'PV-001', name: 'Tấm pin mặt trời 550W', stock: 1250, status: 'Còn hàng' },
                  { code: 'INV-002', name: 'Inverter 50kW', stock: 45, status: 'Còn hàng' },
                  { code: 'CBL-003', name: 'Cáp DC 6mm2', stock: 15000, status: 'Còn hàng' },
                  { code: 'MNT-004', name: 'Khung nhôm rail', stock: 120, status: 'Sắp hết' },
                  { code: 'ACC-005', name: 'MC4 Connector', stock: 50, status: 'Sắp hết' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{item.code}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.stock.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.status === 'Còn hàng' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Danh mục sản phẩm</h3>
          <div className="space-y-3">
            {[
              { name: 'Tấm pin mặt trời', count: 45, icon: '☀️' },
              { name: 'Inverter', count: 32, icon: '⚡' },
              { name: 'Cáp điện', count: 28, icon: '🔌' },
              { name: 'Khung & Rail', count: 40, icon: '🏗️' },
              { name: 'Phụ kiện kết nối', count: 55, icon: '🔧' },
              { name: 'Thiết bị giám sát', count: 18, icon: '📊' },
              { name: 'Pin lưu trữ', count: 15, icon: '🔋' },
              { name: 'Thiết bị bảo vệ', count: 15, icon: '🛡️' },
            ].map((cat, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-500">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Đơn đặt hàng đang chờ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { supplier: 'JA Solar', items: 500, total: '1.5 tỷ', eta: '25/01/2024' },
            { supplier: 'Huawei', items: 20, total: '800 triệu', eta: '28/01/2024' },
            { supplier: 'Tongwei', items: 1000, total: '2.8 tỷ', eta: '05/02/2024' },
            { supplier: 'Growatt', items: 30, total: '450 triệu', eta: '10/02/2024' },
          ].map((order, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 text-sm">{order.supplier}</h4>
              <div className="mt-2 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Số lượng:</span>
                  <span className="font-medium text-gray-900">{order.items} items</span>
                </div>
                <div className="flex justify-between">
                  <span>Giá trị:</span>
                  <span className="font-medium text-gray-900">{order.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dự kiến:</span>
                  <span className="font-medium text-gray-900">{order.eta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
