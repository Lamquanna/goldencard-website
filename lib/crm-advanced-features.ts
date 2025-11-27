/**
 * CRM Advanced Features Configuration
 * Tham khảo từ: HubSpot, Salesforce, Pipedrive, Zoho CRM
 */

// Email Templates for automation
export const EMAIL_TEMPLATES = {
  WELCOME: {
    id: 'welcome',
    name: 'Email Chào Mừng',
    subject: 'Chào mừng đến với GoldenEnergy',
    body: `Xin chào {{name}},

Cảm ơn bạn đã quan tâm đến GoldenEnergy! Chúng tôi rất vui được hỗ trợ bạn.

Đội ngũ tư vấn của chúng tôi sẽ liên hệ với bạn trong vòng 24h.

Trân trọng,
GoldenEnergy Team`,
    variables: ['name', 'email', 'phone'],
  },
  FOLLOW_UP: {
    id: 'follow_up',
    name: 'Email Theo Dõi',
    subject: 'Theo dõi yêu cầu tư vấn của bạn',
    body: `Xin chào {{name}},

Tôi là {{agent_name}} từ GoldenEnergy. Tôi đã gửi email cho bạn vào {{last_contact_date}}.

Bạn có muốn trao đổi thêm về giải pháp năng lượng mặt trời không?

Thời gian nào thuận tiện cho bạn?

Trân trọng,
{{agent_name}}`,
    variables: ['name', 'agent_name', 'last_contact_date'],
  },
  QUOTE_SENT: {
    id: 'quote_sent',
    name: 'Gửi Báo Giá',
    subject: 'Báo giá hệ thống điện mặt trời',
    body: `Xin chào {{name}},

Đính kèm là báo giá chi tiết cho hệ thống điện mặt trời {{system_size}}kW.

Tổng giá trị: {{total_value}} VNĐ
Thời gian hoàn vốn: {{roi_months}} tháng
Tiết kiệm điện hàng năm: {{annual_savings}} VNĐ

Vui lòng xem chi tiết trong file đính kèm.

Trân trọng,
{{agent_name}}`,
    variables: ['name', 'system_size', 'total_value', 'roi_months', 'annual_savings', 'agent_name'],
  },
  CONTRACT_REMINDER: {
    id: 'contract_reminder',
    name: 'Nhắc Nhở Ký Hợp Đồng',
    subject: 'Nhắc nhở: Hợp đồng chờ ký kết',
    body: `Xin chào {{name}},

Hợp đồng lắp đặt hệ thống điện mặt trời đã được chuẩn bị.

Giá trị hợp đồng: {{contract_value}} VNĐ
Ngày bắt đầu thi công: {{start_date}}

Vui lòng xác nhận để chúng tôi tiến hành.

Trân trọng,
{{agent_name}}`,
    variables: ['name', 'contract_value', 'start_date', 'agent_name'],
  },
};

// SMS Templates
export const SMS_TEMPLATES = {
  APPOINTMENT: {
    id: 'appointment',
    name: 'Lịch Hẹn',
    body: 'GoldenEnergy: Lịch hẹn khảo sát {{date}} lúc {{time}}. XN: {{confirmation_link}}',
  },
  QUICK_FOLLOW: {
    id: 'quick_follow',
    name: 'Theo Dõi Nhanh',
    body: 'GoldenEnergy: Cảm ơn {{name}} đã liên hệ. Chúng tôi sẽ gọi lại trong 15 phút.',
  },
  QUOTE_READY: {
    id: 'quote_ready',
    name: 'Báo Giá Sẵn Sàng',
    body: 'GoldenEnergy: Báo giá {{system_size}}kW đã sẵn sàng. Xem tại: {{link}}',
  },
};

// Automation Rules (trigger → actions)
export const AUTOMATION_RULES = [
  {
    id: 'auto_welcome',
    name: 'Tự Động Gửi Email Chào Mừng',
    trigger: {
      type: 'lead_created',
      condition: 'source = "website"',
    },
    actions: [
      {
        type: 'send_email',
        template: 'WELCOME',
        delay: 0, // immediate
      },
      {
        type: 'send_sms',
        template: 'QUICK_FOLLOW',
        delay: 0,
      },
      {
        type: 'assign_to_agent',
        strategy: 'round_robin', // hoặc 'by_region', 'by_expertise'
      },
      {
        type: 'add_tag',
        tags: ['new_lead', 'website'],
      },
    ],
    enabled: true,
  },
  {
    id: 'auto_follow_up',
    name: 'Tự Động Theo Dõi Sau 3 Ngày',
    trigger: {
      type: 'lead_no_activity',
      condition: 'days_since_last_contact >= 3',
    },
    actions: [
      {
        type: 'send_email',
        template: 'FOLLOW_UP',
        delay: 0,
      },
      {
        type: 'create_task',
        title: 'Gọi điện theo dõi',
        priority: 'high',
        due_in_days: 1,
      },
    ],
    enabled: true,
  },
  {
    id: 'auto_qualify_hot',
    name: 'Tự Động Đánh Dấu Lead Hot',
    trigger: {
      type: 'lead_score_changed',
      condition: 'score >= 80',
    },
    actions: [
      {
        type: 'move_to_stage',
        stage: 'qualified',
      },
      {
        type: 'notify_sales_manager',
        message: 'Lead HOT: {{lead_name}} - Score {{score}}',
      },
      {
        type: 'add_tag',
        tags: ['hot_lead', 'priority'],
      },
    ],
    enabled: true,
  },
  {
    id: 'auto_contract_reminder',
    name: 'Nhắc Nhở Ký Hợp Đồng',
    trigger: {
      type: 'lead_in_stage',
      condition: 'stage = "proposal" AND days_in_stage >= 7',
    },
    actions: [
      {
        type: 'send_email',
        template: 'CONTRACT_REMINDER',
        delay: 0,
      },
      {
        type: 'create_task',
        title: 'Gọi nhắc ký hợp đồng',
        priority: 'high',
        due_in_days: 1,
      },
    ],
    enabled: true,
  },
];

// Deal/Revenue Tracking
export interface Deal {
  id: string;
  lead_id: string;
  name: string; // e.g., "Hệ thống 50kW cho Nhà máy ABC"
  value: number; // VNĐ
  currency: 'VND' | 'USD';
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  probability: number; // 0-100%
  expected_close_date: string;
  actual_close_date?: string;
  products: DealProduct[];
  total_value: number;
  commission_rate: number; // %
  commission_value: number;
  created_at: string;
  updated_at: string;
}

export interface DealProduct {
  id: string;
  name: string;
  category: 'solar_panel' | 'inverter' | 'battery' | 'installation' | 'maintenance' | 'other';
  quantity: number;
  unit_price: number;
  discount: number; // %
  subtotal: number;
  tax: number; // %
  total: number;
}

// Forecasting
export interface RevenueForecast {
  period: 'month' | 'quarter' | 'year';
  start_date: string;
  end_date: string;
  pipeline_value: number; // Tổng giá trị deals trong pipeline
  weighted_value: number; // Pipeline value * probability
  expected_revenue: number; // Based on historical conversion
  actual_revenue: number; // Đã thành công
  variance: number; // expected - actual
  deals_count: number;
  won_deals_count: number;
  conversion_rate: number; // %
}

// Call Logging
export interface CallLog {
  id: string;
  lead_id: string;
  agent_id: string;
  type: 'outbound' | 'inbound';
  status: 'completed' | 'missed' | 'voicemail' | 'busy';
  duration: number; // seconds
  notes: string;
  outcome: 'interested' | 'not_interested' | 'callback' | 'no_answer' | 'wrong_number';
  follow_up_date?: string;
  recording_url?: string;
  timestamp: string;
}

// Task Management (CRM/ERP)
export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'site_visit' | 'quote' | 'contract' | 'other';
  related_to: {
    type: 'lead' | 'deal' | 'project';
    id: string;
  };
  assigned_to: string; // user_id
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string;
  completed_date?: string;
  reminder_before: number; // minutes
  created_at: string;
  updated_at: string;
}

// Advanced Filters
export interface FilterConfig {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: string | number | string[] | number[];
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterConfig[];
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  shared: boolean; // Share với team
  created_by: string;
}

// Bulk Actions
export const BULK_ACTIONS = [
  {
    id: 'assign_to_agent',
    name: 'Phân Công Cho Agent',
    icon: '👤',
    requiresInput: true,
    inputType: 'agent_select',
  },
  {
    id: 'change_stage',
    name: 'Chuyển Stage',
    icon: '🔄',
    requiresInput: true,
    inputType: 'stage_select',
  },
  {
    id: 'add_tags',
    name: 'Thêm Tags',
    icon: '🏷️',
    requiresInput: true,
    inputType: 'tag_multi_select',
  },
  {
    id: 'send_bulk_email',
    name: 'Gửi Email Hàng Loạt',
    icon: '📧',
    requiresInput: true,
    inputType: 'email_template_select',
  },
  {
    id: 'export_selected',
    name: 'Xuất Ra Excel',
    icon: '📊',
    requiresInput: false,
  },
  {
    id: 'delete_selected',
    name: 'Xóa',
    icon: '🗑️',
    requiresInput: false,
    requiresConfirmation: true,
  },
];

// Reports & Analytics
export interface Report {
  id: string;
  name: string;
  type: 'sales' | 'activity' | 'forecast' | 'performance' | 'custom';
  metrics: ReportMetric[];
  filters: FilterConfig[];
  date_range: {
    start: string;
    end: string;
    preset?: '7days' | '30days' | '90days' | 'quarter' | 'year' | 'custom';
  };
  group_by?: string[];
  visualization: 'table' | 'line_chart' | 'bar_chart' | 'pie_chart' | 'funnel';
}

export interface ReportMetric {
  name: string;
  field: string;
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
  format?: 'number' | 'currency' | 'percentage';
}

// Integration Settings
export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'calendar' | 'accounting' | 'marketing' | 'analytics';
  provider: string; // 'gmail', 'outlook', 'twilio', 'mailchimp', etc.
  enabled: boolean;
  config: Record<string, any>;
  last_sync?: string;
}

// Export tất cả configurations
export const CRM_ADVANCED_CONFIG = {
  email_templates: EMAIL_TEMPLATES,
  sms_templates: SMS_TEMPLATES,
  automation_rules: AUTOMATION_RULES,
  bulk_actions: BULK_ACTIONS,
};
