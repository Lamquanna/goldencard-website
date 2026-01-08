"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const reportTypes = [
  { id: 'attendance', name: 'Báo cáo Chấm công', icon: '📊', description: 'Thống kê chấm công theo tháng/quý/năm' },
  { id: 'leave', name: 'Báo cáo Nghỉ phép', icon: '📅', description: 'Tổng hợp nghỉ phép của nhân viên' },
  { id: 'overtime', name: 'Báo cáo Tăng ca', icon: '⏰', description: 'Thống kê giờ tăng ca' },
  { id: 'salary', name: 'Báo cáo Lương', icon: '💰', description: 'Tổng hợp chi phí lương' },
  { id: 'headcount', name: 'Báo cáo Nhân sự', icon: '👥', description: 'Biến động nhân sự theo thời gian' },
  { id: 'performance', name: 'Báo cáo Hiệu suất', icon: '📈', description: 'Đánh giá hiệu suất nhân viên' },
];

export default function HRMReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '2025-12-01', to: '2025-12-31' });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedReport) {
      fetchReportData(selectedReport);
    }
  }, [selectedReport, dateRange]);

  const fetchReportData = async (reportId: string) => {
    if (reportId === 'salary' || reportId === 'performance') {
      // These reports are not implemented yet
      setReportData({ notImplemented: true });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/erp/hrm/reports/${reportId}?from=${dateRange.from}&to=${dateRange.to}`
      );
      if (response.ok) {
        const result = await response.json();
        setReportData(result.data);
      } else {
        console.error('Failed to fetch report data');
        setReportData(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo Nhân sự</h1>
          <p className="text-gray-500 mt-1">Xem và xuất các báo cáo nhân sự</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Từ:</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Đến:</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            />
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <motion.button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-5 bg-white rounded-xl border text-left transition-all ${
              selectedReport === report.id
                ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/20'
                : 'border-gray-200 hover:border-[#D4AF37]/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{report.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{report.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Report Preview */}
      {selectedReport && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
              <p className="mt-4 text-gray-500">Đang tải báo cáo...</p>
            </div>
          ) : reportData?.notImplemented ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Báo cáo chưa khả dụng</h3>
              <p className="text-gray-500">Báo cáo này sẽ được triển khai trong phiên bản tiếp theo.</p>
            </div>
          ) : !reportData ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có dữ liệu</h3>
              <p className="text-gray-500">Chưa có dữ liệu báo cáo trong khoảng thời gian này.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {reportTypes.find(r => r.id === selectedReport)?.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Kỳ báo cáo: {dateRange.from} - {dateRange.to}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { window.print(); }}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    In
                  </button>
                  <button 
                    onClick={() => {
                      alert('Đang xuất báo cáo nhân sự ra Excel...\n\nFile Excel sẽ chứa:\n- Dữ liệu từ database\n- Biểu đồ và thống kê\n- Định dạng chuyên nghiệp\n\nTính năng xuất Excel đang được phát triển.');
                    }}
                    className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg text-sm hover:bg-[#B8960A] transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Xuất Excel
                  </button>
                </div>
              </div>

              {/* Attendance Report */}
              {selectedReport === 'attendance' && reportData.summary && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng ngày công</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.total_working_days || 0} ngày</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Đi làm đúng giờ</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.on_time_rate || 0}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Đi trễ</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.late_rate || 0}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Vắng mặt</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.absent_rate || 0}%</p>
                      </div>
                    </div>
                  </div>
                  {reportData.weeklyData && reportData.weeklyData.length > 0 && (
                    <div className="p-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4">Chi tiết theo tuần</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Tuần</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Đúng giờ</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Đi trễ</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Vắng mặt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.weeklyData.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 px-4 text-gray-900">{row.week}</td>
                                <td className="py-3 px-4 text-right text-green-600">{row.onTime}</td>
                                <td className="py-3 px-4 text-right text-yellow-600">{row.late}</td>
                                <td className="py-3 px-4 text-right text-red-600">{row.absent}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Leave Report */}
              {selectedReport === 'leave' && reportData.summary && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng đơn</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.total_requests || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Chờ duyệt</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">{reportData.summary.pending || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Đã duyệt</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{reportData.summary.approved || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Từ chối</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{reportData.summary.rejected || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng ngày nghỉ</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.total_days_taken || 0}</p>
                      </div>
                    </div>
                  </div>
                  {reportData.byType && reportData.byType.length > 0 && (
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Theo loại nghỉ phép</h3>
                      <div className="space-y-2">
                        {reportData.byType.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">{item.leave_type}</span>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900">{item.total_days} ngày</span>
                              <span className="text-sm text-gray-500 ml-2">({item.count} đơn)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Overtime Report */}
              {selectedReport === 'overtime' && reportData.summary && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng đơn</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.total_requests || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Đã duyệt</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{reportData.summary.approved || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng giờ</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{reportData.summary.total_hours || 0}h</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Chi phí</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{(reportData.summary.total_cost || 0).toLocaleString()}đ</p>
                      </div>
                    </div>
                  </div>
                  {reportData.byEmployee && reportData.byEmployee.length > 0 && (
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Top 10 nhân viên tăng ca nhiều nhất</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Nhân viên</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Mã NV</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Tổng giờ</th>
                              <th className="text-right py-3 px-4 font-medium text-gray-700">Chi phí</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.byEmployee.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-gray-100 last:border-0">
                                <td className="py-3 px-4 text-gray-900">{row.employee_name}</td>
                                <td className="py-3 px-4 text-right text-gray-600">{row.employee_code}</td>
                                <td className="py-3 px-4 text-right text-gray-900">{row.total_hours}h</td>
                                <td className="py-3 px-4 text-right text-gray-900">{Number(row.total_amount).toLocaleString()}đ</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Headcount Report */}
              {selectedReport === 'headcount' && reportData && (
                <>
                  <div className="p-6 border-b border-gray-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tổng nhân sự</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">
                          {reportData.byStatus?.reduce((sum: number, item: any) => sum + Number(item.count), 0) || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Đang làm việc</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">
                          {reportData.byStatus?.find((s: any) => s.status === 'active')?.count || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Tuyển mới</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{reportData.newHires || 0}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Nghỉ việc</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{reportData.terminations || 0}</p>
                      </div>
                    </div>
                  </div>
                  {reportData.byDepartment && reportData.byDepartment.length > 0 && (
                    <div className="p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Theo phòng ban</h3>
                      <div className="space-y-2">
                        {reportData.byDepartment.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-900">{item.department}</span>
                            <span className="font-semibold text-gray-900">{item.count} người</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
