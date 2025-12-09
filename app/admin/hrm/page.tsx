// ============================================================================
// HRM MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

export default function HRMPage() {
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
            <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">2 chờ duyệt</span>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Nguyễn Văn A', type: 'Nghỉ phép năm', days: 3, date: '20/01 - 22/01' },
              { name: 'Trần Thị B', type: 'Nghỉ việc riêng', days: 1, date: '25/01' },
            ].map((leave, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{leave.name}</p>
                  <p className="text-xs text-gray-500">{leave.type} • {leave.days} ngày • {leave.date}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200">
                    Duyệt
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200">
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Danh sách nhân viên</h3>
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
            + Thêm nhân viên
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nhân viên</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng ban</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chức vụ</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { name: 'Nguyễn Văn A', dept: 'Kinh doanh', position: 'Trưởng phòng', status: 'Đang làm' },
                { name: 'Trần Thị B', dept: 'Kỹ thuật', position: 'Kỹ sư', status: 'Đang làm' },
                { name: 'Lê Văn C', dept: 'Tài chính', position: 'Kế toán', status: 'Nghỉ phép' },
              ].map((emp, i) => (
                <tr key={i} className="hover:bg-gray-50">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
