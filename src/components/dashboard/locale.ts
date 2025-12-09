// ============================================================================
// DASHBOARD LOCALE - VIETNAMESE
// GoldenEnergy HOME Platform - Localization Strings
// ============================================================================

/**
 * Vietnamese localization for Dashboard components
 * Default language for GoldenEnergy HOME platform
 */
export const dashboardLocale = {
  // Page titles
  title: 'Bảng điều khiển',
  subtitle: 'Tổng quan hệ thống GoldenEnergy HOME',
  welcome: 'Chào mừng trở lại',
  
  // Sections
  sections: {
    systemOverview: 'Tổng quan hệ thống',
    systemOverviewDesc: 'Các chỉ số quan trọng của toàn bộ hệ thống',
    personalWorkspace: 'Không gian làm việc',
    personalWorkspaceDesc: 'Công việc và hoạt động cá nhân của bạn',
    moduleAnalytics: 'Phân tích module',
    moduleAnalyticsDesc: 'Biểu đồ và thống kê chi tiết theo module',
    activityTimeline: 'Dòng thời gian hoạt động',
    activityTimelineDesc: 'Hoạt động gần đây trong hệ thống',
  },

  // KPI Cards
  kpis: {
    totalEmployees: 'Tổng nhân viên',
    newLeadsToday: 'Lead mới hôm nay',
    lowStockItems: 'Sản phẩm sắp hết',
    pendingApprovals: 'Chờ phê duyệt',
    revenueThisMonth: 'Doanh thu tháng này',
    activeProjects: 'Dự án đang triển khai',
    tasksOverdue: 'Công việc quá hạn',
    upcomingMeetings: 'Cuộc họp sắp tới',
  },

  // Task List
  tasks: {
    title: 'Công việc của tôi',
    overdue: 'Quá hạn',
    dueToday: 'Hôm nay',
    upcoming: 'Sắp tới',
    completed: 'Hoàn thành',
    noTasks: 'Không có công việc nào',
    viewAll: 'Xem tất cả',
    priority: {
      urgent: 'Khẩn cấp',
      high: 'Cao',
      medium: 'Trung bình',
      low: 'Thấp',
    },
  },

  // Activity Feed
  activities: {
    title: 'Hoạt động gần đây',
    noActivities: 'Không có hoạt động nào',
    viewAll: 'Xem tất cả',
    loadMore: 'Tải thêm',
    filterByModule: 'Lọc theo module',
    allModules: 'Tất cả module',
    actions: {
      created: 'đã tạo',
      updated: 'đã cập nhật',
      deleted: 'đã xóa',
      approved: 'đã phê duyệt',
      rejected: 'đã từ chối',
      assigned: 'đã giao',
      completed: 'đã hoàn thành',
      commented: 'đã bình luận',
      uploaded: 'đã tải lên',
      downloaded: 'đã tải xuống',
    },
  },

  // Quick Actions
  quickActions: {
    title: 'Thao tác nhanh',
    createLead: 'Tạo Lead mới',
    createTask: 'Tạo công việc',
    createInvoice: 'Tạo hóa đơn',
    checkIn: 'Chấm công',
    createProject: 'Tạo dự án',
    addEmployee: 'Thêm nhân viên',
    createProduct: 'Tạo sản phẩm',
    scheduleEvent: 'Lên lịch sự kiện',
  },

  // Charts
  charts: {
    trend: 'Xu hướng',
    distribution: 'Phân bố',
    comparison: 'So sánh',
    loading: 'Đang tải biểu đồ...',
    noData: 'Không có dữ liệu',
    timeRanges: {
      '7d': '7 ngày',
      '30d': '30 ngày',
      '90d': '90 ngày',
      '1y': '1 năm',
    },
  },

  // Calendar Preview
  calendar: {
    title: 'Lịch',
    today: 'Hôm nay',
    noEvents: 'Không có sự kiện',
    viewCalendar: 'Xem lịch đầy đủ',
  },

  // Notifications
  notifications: {
    title: 'Thông báo',
    markAllRead: 'Đánh dấu tất cả đã đọc',
    noNotifications: 'Không có thông báo mới',
    viewAll: 'Xem tất cả',
  },

  // Date ranges
  dateRanges: {
    today: 'Hôm nay',
    yesterday: 'Hôm qua',
    last7Days: '7 ngày qua',
    last30Days: '30 ngày qua',
    thisMonth: 'Tháng này',
    lastMonth: 'Tháng trước',
    thisQuarter: 'Quý này',
    thisYear: 'Năm nay',
    custom: 'Tùy chỉnh',
  },

  // Settings
  settings: {
    title: 'Cài đặt Dashboard',
    description: 'Tùy chỉnh giao diện và widget hiển thị',
    tabs: {
      widgets: 'Widget',
      layout: 'Bố cục',
      preferences: 'Tùy chọn',
    },
    toggleWidget: 'Bật/tắt widget',
    dragToReorder: 'Kéo để sắp xếp lại',
    noWidgets: 'Không có widget nào',
    selectLayout: 'Chọn bố cục',
    layouts: {
      default: 'Mặc định',
      compact: 'Thu gọn',
      analytics: 'Phân tích',
      minimal: 'Tối giản',
    },
    defaultDateRange: 'Khoảng thời gian mặc định',
    selectDateRange: 'Chọn khoảng thời gian',
    refreshInterval: 'Tần suất làm mới',
    refresh: {
      manual: 'Thủ công',
      auto: 'Tự động',
    },
    compactMode: 'Chế độ thu gọn',
    compactModeDesc: 'Hiển thị nhiều thông tin hơn trong không gian nhỏ hơn',
    showNotifications: 'Hiển thị thông báo',
    showNotificationsDesc: 'Nhận thông báo trực tiếp trên dashboard',
    reset: 'Đặt lại',
    save: 'Lưu thay đổi',
  },

  // Permissions
  permissions: {
    noAccess: 'Bạn không có quyền xem Dashboard',
    noAccessDesc: 'Vui lòng liên hệ quản trị viên để được cấp quyền',
    sensitiveDataMasked: 'Dữ liệu nhạy cảm',
  },

  // Loading states
  loading: {
    dashboard: 'Đang tải dashboard...',
    widgets: 'Đang tải widget...',
    data: 'Đang tải dữ liệu...',
  },

  // Errors
  errors: {
    loadFailed: 'Không thể tải dữ liệu',
    saveFailed: 'Không thể lưu thay đổi',
    retry: 'Thử lại',
  },

  // Empty states
  empty: {
    title: 'Chưa có dữ liệu',
    description: 'Dữ liệu sẽ xuất hiện khi bạn bắt đầu sử dụng hệ thống',
  },

  // Tooltips
  tooltips: {
    refresh: 'Làm mới dữ liệu',
    settings: 'Cài đặt dashboard',
    fullscreen: 'Toàn màn hình',
    export: 'Xuất báo cáo',
    help: 'Trợ giúp',
  },

  // Module names
  modules: {
    crm: 'CRM',
    hrm: 'Nhân sự',
    projects: 'Dự án',
    inventory: 'Kho hàng',
    finance: 'Tài chính',
    admin: 'Quản trị',
  },

  // Comparison labels
  comparison: {
    vsLastPeriod: 'so với kỳ trước',
    increase: 'Tăng',
    decrease: 'Giảm',
    noChange: 'Không đổi',
  },
};

// Type for locale keys
export type DashboardLocaleKey = keyof typeof dashboardLocale;

// Export default
export default dashboardLocale;
