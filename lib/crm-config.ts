// Sales Pipeline Stages Configuration
export const PIPELINE_STAGES = [
  {
    id: 'new',
    name: 'Khách Mới',
    nameEn: 'New Lead',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    probability: 10,
    order: 1,
  },
  {
    id: 'contacted',
    name: 'Đã Liên Hệ',
    nameEn: 'Contacted',
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-700',
    probability: 25,
    order: 2,
  },
  {
    id: 'qualified',
    name: 'Tiềm Năng',
    nameEn: 'Qualified',
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    probability: 50,
    order: 3,
  },
  {
    id: 'proposal',
    name: 'Báo Giá',
    nameEn: 'Proposal Sent',
    color: 'yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    probability: 70,
    order: 4,
  },
  {
    id: 'negotiation',
    name: 'Đàm Phán',
    nameEn: 'Negotiation',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    probability: 85,
    order: 5,
  },
  {
    id: 'won',
    name: 'Thành Công',
    nameEn: 'Won',
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    probability: 100,
    order: 6,
    isClosed: true,
    isWon: true,
  },
  {
    id: 'lost',
    name: 'Thất Bại',
    nameEn: 'Lost',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    probability: 0,
    order: 7,
    isClosed: true,
    isWon: false,
  },
] as const;

export type PipelineStageId = typeof PIPELINE_STAGES[number]['id'];

// Lead Scoring Configuration
export const LEAD_SCORING = {
  HOT: {
    min: 80,
    max: 100,
    label: 'Hot Lead',
    labelVi: 'Rất Tiềm Năng',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    icon: '🔥',
    priority: 'urgent',
  },
  WARM: {
    min: 50,
    max: 79,
    label: 'Warm Lead',
    labelVi: 'Tiềm Năng',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: '🌟',
    priority: 'high',
  },
  COLD: {
    min: 0,
    max: 49,
    label: 'Cold Lead',
    labelVi: 'Bình Thường',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: '❄️',
    priority: 'medium',
  },
} as const;

// Scoring Actions
export const SCORING_ACTIONS = {
  PAGE_VIEW: 10,
  FORM_SUBMIT: 60,
  PRICING_PAGE: 30,
  DEMO_REQUEST: 100,
  CASE_STUDY_DOWNLOAD: 40,
  VIDEO_WATCH: 50,
  EMAIL_OPEN: 5,
  EMAIL_CLICK: 15,
  CHAT_INITIATED: 20,
  PHONE_INQUIRY: 80,
} as const;

// Source Multipliers
export const SOURCE_MULTIPLIERS = {
  direct: 1.0,
  organic: 1.2,
  referral: 1.3,
  social: 0.8,
  paid: 1.5,
  email: 1.1,
} as const;

// Calculate Lead Score
export function calculateLeadScore(activities: {
  pageViews?: number;
  formSubmits?: number;
  pricingViews?: number;
  demoRequests?: number;
  emailOpens?: number;
  source?: keyof typeof SOURCE_MULTIPLIERS;
}): number {
  const {
    pageViews = 0,
    formSubmits = 0,
    pricingViews = 0,
    demoRequests = 0,
    emailOpens = 0,
    source = 'direct',
  } = activities;

  const baseScore =
    pageViews * SCORING_ACTIONS.PAGE_VIEW +
    formSubmits * SCORING_ACTIONS.FORM_SUBMIT +
    pricingViews * SCORING_ACTIONS.PRICING_PAGE +
    demoRequests * SCORING_ACTIONS.DEMO_REQUEST +
    emailOpens * SCORING_ACTIONS.EMAIL_OPEN;

  const multiplier = SOURCE_MULTIPLIERS[source] || 1.0;

  return Math.min(Math.round(baseScore * multiplier), 100);
}

// Get Score Category
export function getScoreCategory(score: number) {
  if (score >= LEAD_SCORING.HOT.min) return LEAD_SCORING.HOT;
  if (score >= LEAD_SCORING.WARM.min) return LEAD_SCORING.WARM;
  return LEAD_SCORING.COLD;
}

// Format Currency VND
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

// Activity Types
export const ACTIVITY_TYPES = {
  CALL: {
    id: 'call',
    name: 'Cuộc gọi',
    icon: '📞',
    color: 'green',
  },
  EMAIL: {
    id: 'email',
    name: 'Email',
    icon: '📧',
    color: 'blue',
  },
  CHAT: {
    id: 'chat',
    name: 'Chat',
    icon: '💬',
    color: 'purple',
  },
  MEETING: {
    id: 'meeting',
    name: 'Cuộc họp',
    icon: '🤝',
    color: 'yellow',
  },
  NOTE: {
    id: 'note',
    name: 'Ghi chú',
    icon: '📝',
    color: 'gray',
  },
  TASK: {
    id: 'task',
    name: 'Nhiệm vụ',
    icon: '✅',
    color: 'teal',
  },
  FILE: {
    id: 'file',
    name: 'Tệp đính kèm',
    icon: '📎',
    color: 'indigo',
  },
  STATUS_CHANGE: {
    id: 'status_change',
    name: 'Thay đổi trạng thái',
    icon: '🔄',
    color: 'orange',
  },
  STAGE_CHANGE: {
    id: 'stage_change',
    name: 'Chuyển giai đoạn',
    icon: '➡️',
    color: 'cyan',
  },
  DEAL_UPDATE: {
    id: 'deal_update',
    name: 'Cập nhật deal',
    icon: '💰',
    color: 'emerald',
  },
} as const;

export type ActivityTypeId = keyof typeof ACTIVITY_TYPES;
