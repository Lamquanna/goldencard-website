// ============================================================================
// FINANCE MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

'use client';

import { useState } from 'react';

// Mock data
const INITIAL_TRANSACTIONS = [
  { id: 1, date: '20/01/2024', desc: 'Thanh toán dự án Solar ABC', type: 'Thu', amount: '1,500,000,000' },
  { id: 2, date: '19/01/2024', desc: 'Mua tấm pin JA Solar', type: 'Chi', amount: '-850,000,000' },
  { id: 3, date: '18/01/2024', desc: 'Lương nhân viên tháng 1', type: 'Chi', amount: '-450,000,000' },
  { id: 4, date: '17/01/2024', desc: 'Tạm ứng dự án XYZ', type: 'Thu', amount: '2,000,000,000' },
  { id: 5, date: '16/01/2024', desc: 'Mua inverter Huawei', type: 'Chi', amount: '-320,000,000' },
];

export default function FinancePage() {
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ desc: '', type: 'Thu', amount: '' });

  const handleAddTransaction = () => {
    if (!newTransaction.desc || !newTransaction.amount) {
      alert('Vui lòng nhập mô tả và số tiền');
      return;
    }
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    const transaction = {
      id: Date.now(),
      date: dateStr,
      desc: newTransaction.desc,
      type: newTransaction.type,
      amount: newTransaction.type === 'Chi' ? `-${newTransaction.amount}` : newTransaction.amount,
    };
    setTransactions([transaction, ...transactions]);
    setNewTransaction({ desc: '', type: 'Thu', amount: '' });
    setShowAddForm(false);
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa giao dịch này?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Tài chính</h1>
        <p className="text-gray-500 mt-1">Theo dõi doanh thu, chi phí và báo cáo tài chính</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Doanh thu tháng</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">8.5 tỷ</p>
          <p className="text-sm text-green-500 mt-1">↑ 15% so với tháng trước</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Chi phí tháng</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">6.2 tỷ</p>
          <p className="text-sm text-red-500 mt-1">↑ 8% so với tháng trước</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Lợi nhuận gộp</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">2.3 tỷ</p>
          <p className="text-sm text-purple-500 mt-1">27% biên lợi nhuận</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Công nợ phải thu</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">4.8 tỷ</p>
          <p className="text-sm text-gray-500 mt-1">12 hóa đơn chưa thanh toán</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Doanh thu theo tháng (2024)</h3>
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {[
              { month: 'T1', value: 6.5 },
              { month: 'T2', value: 5.8 },
              { month: 'T3', value: 7.2 },
              { month: 'T4', value: 6.9 },
              { month: 'T5', value: 8.1 },
              { month: 'T6', value: 7.5 },
              { month: 'T7', value: 8.8 },
              { month: 'T8', value: 9.2 },
              { month: 'T9', value: 8.5 },
              { month: 'T10', value: 9.8 },
              { month: 'T11', value: 10.2 },
              { month: 'T12', value: 8.5 },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-sm hover:from-yellow-600 hover:to-yellow-500 transition-colors cursor-pointer"
                  style={{ height: `${(item.value / 12) * 200}px` }}
                  title={`${item.value} tỷ`}
                />
                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Cơ cấu chi phí</h3>
          <div className="space-y-4">
            {[
              { name: 'Nguyên vật liệu', value: 65, amount: '4.03 tỷ', color: 'bg-blue-500' },
              { name: 'Nhân công', value: 15, amount: '930 triệu', color: 'bg-green-500' },
              { name: 'Vận chuyển', value: 8, amount: '496 triệu', color: 'bg-yellow-500' },
              { name: 'Marketing', value: 5, amount: '310 triệu', color: 'bg-purple-500' },
              { name: 'Quản lý', value: 4, amount: '248 triệu', color: 'bg-pink-500' },
              { name: 'Khác', value: 3, amount: '186 triệu', color: 'bg-gray-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="font-medium text-gray-900">{item.amount} ({item.value}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Giao dịch gần đây</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
          >
            + Tạo giao dịch
          </button>
        </div>

        {/* Add Transaction Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Tạo giao dịch mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Mô tả giao dịch"
                value={newTransaction.desc}
                onChange={(e) => setNewTransaction({...newTransaction, desc: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <select
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Thu">Thu</option>
                <option value="Chi">Chi</option>
              </select>
              <input
                type="text"
                placeholder="Số tiền (VNĐ)"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={handleAddTransaction} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Lưu</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Hủy</button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((trans) => (
                <tr key={trans.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{trans.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{trans.desc}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      trans.type === 'Thu' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {trans.type}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium text-right ${
                    trans.type === 'Thu' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trans.type === 'Thu' ? '+' : ''}{trans.amount} đ
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteTransaction(trans.id)}
                      className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Công nợ phải thu</h3>
          <div className="space-y-3">
            {[
              { customer: 'Công ty ABC', amount: '1.5 tỷ', due: '25/01/2024', status: 'Quá hạn' },
              { customer: 'Nhà máy XYZ', amount: '2.0 tỷ', due: '30/01/2024', status: 'Sắp đến hạn' },
              { customer: 'Tập đoàn 123', amount: '1.3 tỷ', due: '15/02/2024', status: 'Bình thường' },
            ].map((debt, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{debt.customer}</p>
                  <p className="text-xs text-gray-500">Hạn: {debt.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{debt.amount}</p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    debt.status === 'Quá hạn' ? 'bg-red-100 text-red-700' :
                    debt.status === 'Sắp đến hạn' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {debt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Công nợ phải trả</h3>
          <div className="space-y-3">
            {[
              { supplier: 'JA Solar', amount: '800 triệu', due: '28/01/2024', status: 'Sắp đến hạn' },
              { supplier: 'Huawei', amount: '450 triệu', due: '05/02/2024', status: 'Bình thường' },
              { supplier: 'Tongwei', amount: '1.2 tỷ', due: '20/02/2024', status: 'Bình thường' },
            ].map((debt, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{debt.supplier}</p>
                  <p className="text-xs text-gray-500">Hạn: {debt.due}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{debt.amount}</p>
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                    debt.status === 'Quá hạn' ? 'bg-red-100 text-red-700' :
                    debt.status === 'Sắp đến hạn' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {debt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
