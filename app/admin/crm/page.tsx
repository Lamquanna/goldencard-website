// ============================================================================
// CRM MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

export default function CRMPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM - Quản lý Khách hàng</h1>
        <p className="text-gray-500 mt-1">Quản lý khách hàng, leads và cơ hội kinh doanh</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Khách hàng</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">156</p>
          <p className="text-sm text-gray-500 mt-1">+12 tháng này</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Leads</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">48</p>
          <p className="text-sm text-gray-500 mt-1">Đang theo dõi</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Cơ hội</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">23</p>
          <p className="text-sm text-gray-500 mt-1">Giá trị: 5.2 tỷ</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Danh sách khách hàng</h3>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
            + Thêm khách hàng
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Công ty ABC', email: 'contact@abc.vn', phone: '0901234567', status: 'Khách hàng' },
                { name: 'Công ty XYZ', email: 'info@xyz.vn', phone: '0912345678', status: 'Lead' },
                { name: 'Nhà máy 123', email: 'sales@123.vn', phone: '0923456789', status: 'Cơ hội' },
              ].map((customer, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{customer.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{customer.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      customer.status === 'Khách hàng' ? 'bg-green-100 text-green-700' :
                      customer.status === 'Lead' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
