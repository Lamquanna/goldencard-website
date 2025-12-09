// ============================================================================
// CRM MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

'use client';

import { useState } from 'react';

// Mock data
const INITIAL_CUSTOMERS = [
  { id: 1, name: 'Công ty ABC', email: 'contact@abc.vn', phone: '0901234567', status: 'Khách hàng' },
  { id: 2, name: 'Công ty XYZ', email: 'info@xyz.vn', phone: '0912345678', status: 'Lead' },
  { id: 3, name: 'Nhà máy 123', email: 'sales@123.vn', phone: '0923456789', status: 'Cơ hội' },
];

export default function CRMPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', status: 'Lead' });

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      alert('Vui lòng nhập tên và email');
      return;
    }
    const customer = {
      id: Date.now(),
      ...newCustomer,
    };
    setCustomers([...customers, customer]);
    setNewCustomer({ name: '', email: '', phone: '', status: 'Lead' });
    setShowAddForm(false);
  };

  const handleDeleteCustomer = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const handleViewCustomer = (customer: typeof INITIAL_CUSTOMERS[0]) => {
    alert(`Chi tiết khách hàng:\n\nTên: ${customer.name}\nEmail: ${customer.email}\nĐiện thoại: ${customer.phone}\nTrạng thái: ${customer.status}`);
  };
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
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
          >
            + Thêm khách hàng
          </button>
        </div>

        {/* Add Customer Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Thêm khách hàng mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tên khách hàng"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="tel"
                placeholder="Điện thoại"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
              />
              <select
                value={newCustomer.status}
                onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
              >
                <option value="Lead">Lead</option>
                <option value="Cơ hội">Cơ hội</option>
                <option value="Khách hàng">Khách hàng</option>
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleAddCustomer}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
              >
                Lưu
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCustomer(customer)}
                        className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                      >
                        Xem
                      </button>
                      <button
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Xóa
                      </button>
                    </div>
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
