"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

const reportTypes = [
  { id: 'attendance', name: 'Báo cáo Chấm công', icon: '📊', description: 'Thống kê chấm công theo tháng/quý/năm' },
  { id: 'leave', name: 'Báo cáo Nghỉ phép', icon: '📅', description: 'Tổng hợp nghỉ phép của nhân viên' },
  { id: 'overtime', name: 'Báo cáo Tăng ca', icon: '⏰', description: 'Thống kê giờ tăng ca' },
  { id: 'salary', name: 'Báo cáo Lương', icon: '💰', description: 'Tổng hợp chi phí lương' },
  { id: 'headcount', name: 'Báo cáo Nhân sự', icon: '👥', description: 'Biến động nhân sự theo thời gian' },
  { id: 'performance', name: 'Báo cáo Hiệu suất', icon: '📈', description: 'Đánh giá hiệu suất nhân viên' },
];

const mockReportData = {
  attendance: {
    title: 'Báo cáo Chấm công - Tháng 12/2025',
    summary: [
      { label: 'Tổng ngày công', value: '22 ngày' },
      { label: 'Đi làm đúng giờ', value: '95.2%' },
      { label: 'Đi trễ', value: '4.8%' },
      { label: 'Vắng mặt', value: '2.1%' },
    ],
    data: [
      { name: 'Tuần 1', onTime: 95, late: 3, absent: 2 },
      { name: 'Tuần 2', onTime: 92, late: 5, absent: 3 },
      { name: 'Tuần 3', onTime: 97, late: 2, absent: 1 },
      { name: 'Tuần 4', onTime: 94, late: 4, absent: 2 },
    ],
  },
};

export default function HRMReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ from: '2025-12-01', to: '2025-12-31' });

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
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {mockReportData.attendance.title}
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
                  alert('Đang xuất báo cáo nhân sự ra Excel...\n\nFile Excel sẽ chứa:\n- Báo cáo chấm công\n- Tổng số ngày làm, nghỉ phép\n- Thống kê theo nhân viên\n- Biểu đồ tổng hợp\n\nTính năng xuất file thực tế sẽ được tích hợp khi kết nối database.');
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

          {/* Summary Cards */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockReportData.attendance.summary.map((item, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Biểu đồ theo tuần</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Biểu đồ thống kê</p>
                <p className="text-sm">(Tích hợp thư viện charts sau)</p>
              </div>
            </div>
          </div>

          {/* Data Table */}
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
                  {mockReportData.attendance.data.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 px-4 text-gray-900">{row.name}</td>
                      <td className="py-3 px-4 text-right text-green-600">{row.onTime}%</td>
                      <td className="py-3 px-4 text-right text-yellow-600">{row.late}%</td>
                      <td className="py-3 px-4 text-right text-red-600">{row.absent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
