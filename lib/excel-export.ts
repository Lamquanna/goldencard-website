import * as XLSX from 'xlsx';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ExcelColumn[],
  filename: string
) {
  // Prepare header row
  const headers = columns.map(col => col.header);
  
  // Prepare data rows
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      // Format dates
      if (value instanceof Date) {
        return value.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      // Format arrays
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      // Format objects
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value ?? '';
    })
  );

  // Create worksheet
  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = columns.map(col => ({ wch: col.width || 15 }));

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');

  // Generate file and download
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// Tasks Export Config
export const tasksExportColumns: ExcelColumn[] = [
  { header: 'ID', key: 'id', width: 12 },
  { header: 'Tiêu đề', key: 'title', width: 40 },
  { header: 'Mô tả', key: 'description', width: 50 },
  { header: 'Loại', key: 'typeLabel', width: 15 },
  { header: 'Trạng thái', key: 'statusLabel', width: 15 },
  { header: 'Mức ưu tiên', key: 'priorityLabel', width: 15 },
  { header: 'Hạn chót', key: 'dueDate', width: 20 },
  { header: 'Người thực hiện', key: 'assignedToName', width: 20 },
  { header: 'Liên kết đến', key: 'relatedToName', width: 25 },
  { header: 'Tags', key: 'tags', width: 25 },
  { header: 'Ngày tạo', key: 'createdAt', width: 20 },
  { header: 'Hoàn thành lúc', key: 'completedAt', width: 20 },
];

// Leads Export Config
export const leadsExportColumns: ExcelColumn[] = [
  { header: 'ID', key: 'id', width: 12 },
  { header: 'Công ty', key: 'company', width: 30 },
  { header: 'Liên hệ', key: 'contact', width: 20 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'Số điện thoại', key: 'phone', width: 15 },
  { header: 'Nguồn', key: 'sourceLabel', width: 15 },
  { header: 'Trạng thái', key: 'statusLabel', width: 15 },
  { header: 'Giá trị', key: 'value', width: 15 },
  { header: 'Công suất (kWp)', key: 'estimatedCapacity', width: 15 },
  { header: 'Loại', key: 'typeLabel', width: 15 },
  { header: 'Ghi chú', key: 'notes', width: 40 },
  { header: 'Người phụ trách', key: 'assignedToName', width: 20 },
  { header: 'Ngày tạo', key: 'createdAt', width: 20 },
  { header: 'Cập nhật lần cuối', key: 'lastActivity', width: 20 },
];

// Attendance Export Config
export const attendanceExportColumns: ExcelColumn[] = [
  { header: 'ID', key: 'id', width: 12 },
  { header: 'Nhân viên', key: 'employeeName', width: 25 },
  { header: 'Phòng ban', key: 'department', width: 20 },
  { header: 'Ngày', key: 'date', width: 15 },
  { header: 'Check In', key: 'checkIn', width: 12 },
  { header: 'Check Out', key: 'checkOut', width: 12 },
  { header: 'Số giờ làm', key: 'workHours', width: 12 },
  { header: 'Trạng thái', key: 'statusLabel', width: 15 },
  { header: 'OT (phút)', key: 'overtime', width: 12 },
  { header: 'Ghi chú', key: 'notes', width: 30 },
];

// Projects Export Config
export const projectsExportColumns: ExcelColumn[] = [
  { header: 'ID', key: 'id', width: 12 },
  { header: 'Tên dự án', key: 'name', width: 35 },
  { header: 'Khách hàng', key: 'client', width: 25 },
  { header: 'Địa điểm', key: 'location', width: 30 },
  { header: 'Loại dự án', key: 'typeLabel', width: 20 },
  { header: 'Trạng thái', key: 'statusLabel', width: 15 },
  { header: 'Công suất (kWp)', key: 'capacity', width: 15 },
  { header: 'Giá trị hợp đồng', key: 'contractValue', width: 18 },
  { header: 'Ngày bắt đầu', key: 'startDate', width: 15 },
  { header: 'Ngày kết thúc dự kiến', key: 'endDate', width: 18 },
  { header: 'Tiến độ (%)', key: 'progress', width: 12 },
  { header: 'PM', key: 'managerName', width: 20 },
];
