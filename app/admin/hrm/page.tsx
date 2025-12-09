// ============================================================================
// HRM MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

'use client';

import { useState } from 'react';

// Mock data
const INITIAL_LEAVES = [
  { id: 1, name: 'Nguyễn Văn A', type: 'Nghỉ phép năm', days: 3, date: '20/01 - 22/01', status: 'pending' },
  { id: 2, name: 'Trần Thị B', type: 'Nghỉ việc riêng', days: 1, date: '25/01', status: 'pending' },
];

const INITIAL_EMPLOYEES = [
  { id: 1, name: 'Nguyễn Văn A', dept: 'Kinh doanh', position: 'Trưởng phòng', status: 'Đang làm' },
  { id: 2, name: 'Trần Thị B', dept: 'Kỹ thuật', position: 'Kỹ sư', status: 'Đang làm' },
  { id: 3, name: 'Lê Văn C', dept: 'Tài chính', position: 'Kế toán', status: 'Nghỉ phép' },
];

export default function HRMPage() {
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: '', dept: 'Kinh doanh', position: '', status: 'Đang làm' });

  const handleApproveLeave = (id: number) => {
    setLeaves(leaves.filter(l => l.id !== id));
    alert('Đã duyệt đơn nghỉ phép');
  };

  const handleRejectLeave = (id: number) => {
    setLeaves(leaves.filter(l => l.id !== id));
    alert('Đã từ chối đơn nghỉ phép');
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.position) {
      alert('Vui lòng nhập tên và chức vụ');
      return;
    }
    const employee = { id: Date.now(), ...newEmployee };
    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', dept: 'Kinh doanh', position: '', status: 'Đang làm' });
    setShowAddForm(false);
  };

  const handleDeleteEmployee = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HRM - Quản lý Nhân sự</h1>
        <p className="text-gray-500 mt-1">Quản lý nhân viên, phòng ban và chấm công</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Tổng nhân viên</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">85</p>
          <p className="text-sm text-gray-500 mt-1">8 phòng ban</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Đi làm hôm nay</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">78</p>
          <p className="text-sm text-gray-500 mt-1">92% đúng giờ</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Nghỉ phép</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">5</p>
          <p className="text-sm text-gray-500 mt-1">2 chờ duyệt</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Tuyển dụng</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
          <p className="text-sm text-gray-500 mt-1">Vị trí đang mở</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Phòng ban</h3>
          <div className="space-y-3">
            {[
              { name: 'Kinh doanh', count: 20, color: 'bg-blue-500' },
              { name: 'Kỹ thuật', count: 25, color: 'bg-green-500' },
              { name: 'Tài chính', count: 10, color: 'bg-yellow-500' },
              { name: 'Nhân sự', count: 8, color: 'bg-purple-500' },
              { name: 'Marketing', count: 12, color: 'bg-pink-500' },
              { name: 'Vận hành', count: 10, color: 'bg-orange-500' },
            ].map((dept, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                  <span className="text-sm text-gray-700">{dept.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{dept.count} người</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Đơn nghỉ phép chờ duyệt</h3>
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{leaves.length} chờ duyệt</span>
          </div>
          <div className="space-y-3">
            {leaves.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Không có đơn nghỉ phép nào</p>
            ) : (
              leaves.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{leave.name}</p>
                    <p className="text-xs text-gray-500">{leave.type} • {leave.days} ngày • {leave.date}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveLeave(leave.id)}
                      className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                    >
                      Duyệt
                    </button>
                    <button 
                      onClick={() => handleRejectLeave(leave.id)}
                      className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Danh sách nhân viên</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
          >
            + Thêm nhân viên
          </button>
        </div>

        {/* Add Employee Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Thêm nhân viên mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Họ tên"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <select
                value={newEmployee.dept}
                onChange={(e) => setNewEmployee({...newEmployee, dept: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Kỹ thuật">Kỹ thuật</option>
                <option value="Tài chính">Tài chính</option>
                <option value="Nhân sự">Nhân sự</option>
                <option value="Marketing">Marketing</option>
              </select>
              <input
                type="text"
                placeholder="Chức vụ"
                value={newEmployee.position}
                onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <select
                value={newEmployee.status}
                onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Đang làm">Đang làm</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
              </select>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={handleAddEmployee} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Lưu</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Hủy</button>
            </div>
          </div>
        )}

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chức vụ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                        {emp.name.split(' ').pop()?.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{emp.dept}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{emp.position}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      emp.status === 'Đang làm' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDeleteEmployee(emp.id)}
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
    </div>
  );
}
