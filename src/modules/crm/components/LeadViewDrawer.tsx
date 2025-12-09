'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  X,
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Clock,
  Edit,
  Trash2,
  ArrowUpRight,
  MessageSquare,
  FileText,
  CheckCircle2,
  PhoneCall,
  Users,
  Briefcase,
  Activity,
  ExternalLink,
  Copy,
  Check,
  Megaphone,
  Handshake,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useCRMStore } from '../store';
import { Lead, Activity as ActivityType, LeadStatus, LeadSource, ActivityType as ActivityTypeEnum } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface LeadViewDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onConvert?: (lead: Lead) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  NEW: { label: 'Mới', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  CONTACTED: { label: 'Đã liên hệ', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  QUALIFIED: { label: 'Đủ điều kiện', color: 'text-purple-700', bgColor: 'bg-purple-100' },
  PROPOSAL: { label: 'Đề xuất', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  NEGOTIATION: { label: 'Đàm phán', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
  WON: { label: 'Thành công', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  LOST: { label: 'Thất bại', color: 'text-red-700', bgColor: 'bg-red-100' },
  NURTURING: { label: 'Nuôi dưỡng', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
};

const SOURCE_CONFIG: Record<LeadSource, { label: string; icon: React.ReactNode }> = {
  WEBSITE: { label: 'Website', icon: <Globe className="h-4 w-4" /> },
  REFERRAL: { label: 'Giới thiệu', icon: <Users className="h-4 w-4" /> },
  SOCIAL_MEDIA: { label: 'Mạng xã hội', icon: <MessageSquare className="h-4 w-4" /> },
  COLD_CALL: { label: 'Cold call', icon: <PhoneCall className="h-4 w-4" /> },
  EXHIBITION: { label: 'Triển lãm', icon: <Calendar className="h-4 w-4" /> },
  ADVERTISEMENT: { label: 'Quảng cáo', icon: <Megaphone className="h-4 w-4" /> },
  PARTNER: { label: 'Đối tác', icon: <Handshake className="h-4 w-4" /> },
  OTHER: { label: 'Khác', icon: <Tag className="h-4 w-4" /> },
};

const ACTIVITY_CONFIG: Record<ActivityTypeEnum, { icon: React.ReactNode; color: string; bgColor: string }> = {
  CALL: { icon: <PhoneCall className="h-4 w-4" />, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  EMAIL: { icon: <Mail className="h-4 w-4" />, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  MEETING: { icon: <Users className="h-4 w-4" />, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  TASK: { icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  NOTE: { icon: <FileText className="h-4 w-4" />, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  SYSTEM: { icon: <Activity className="h-4 w-4" />, color: 'text-zinc-600', bgColor: 'bg-zinc-100' },
  STATUS_CHANGE: { icon: <Activity className="h-4 w-4" />, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ASSIGNMENT: { icon: <User className="h-4 w-4" />, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  FILE_UPLOAD: { icon: <FileText className="h-4 w-4" />, color: 'text-green-600', bgColor: 'bg-green-100' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatCurrency = (value?: number) => {
  if (!value) return '—';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-zinc-600 bg-zinc-50 border-zinc-200';
};

// ============================================================================
// INFO ROW COMPONENT
// ============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | React.ReactNode;
  copyable?: boolean;
  href?: string;
}

function InfoRow({ icon, label, value, copyable, href }: InfoRowProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
        <div className="flex items-center gap-2">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {value}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-sm text-zinc-900 dark:text-zinc-100">{value}</span>
          )}
          {copyable && typeof value === 'string' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-zinc-400" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? 'Đã sao chép!' : 'Sao chép'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ACTIVITY ITEM COMPONENT
// ============================================================================

interface ActivityItemProps {
  activity: ActivityType;
}

function ActivityItem({ activity }: ActivityItemProps) {
  const config = ACTIVITY_CONFIG[activity.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 py-3"
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          config?.bgColor,
          config?.color
        )}
      >
        {config?.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {activity.title}
            </p>
            {activity.description && (
              <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>
          <span className="text-xs text-zinc-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </span>
        </div>
        {activity.user?.name && (
          <div className="flex items-center gap-1.5 mt-2">
            <Avatar className="h-5 w-5">
              <AvatarImage src={activity.user.avatar} />
              <AvatarFallback className="text-[10px]">
                {getInitials(activity.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-zinc-500">{activity.user.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LeadViewDrawer({
  lead,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onConvert,
}: LeadViewDrawerProps) {
  const { activities } = useCRMStore();

  // Get activities for this lead
  const leadActivities = React.useMemo(() => {
    if (!lead) return [];
    return activities
      .filter((a) => a.entityType === 'lead' && a.entityId === lead.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, lead]);

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  className={cn(
                    'font-medium',
                    STATUS_CONFIG[lead.status]?.bgColor,
                    STATUS_CONFIG[lead.status]?.color
                  )}
                  variant="secondary"
                >
                  {STATUS_CONFIG[lead.status]?.label || lead.status}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {lead.company || lead.name}
              </h2>
              {lead.company && (
                <p className="text-sm text-zinc-500 mt-0.5">{lead.name}</p>
              )}
            </div>

            {/* Score */}
            {lead.score !== undefined && (
              <div
                className={cn(
                  'flex-shrink-0 w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center',
                  getScoreColor(lead.score)
                )}
              >
                <span className="text-xl font-bold">{lead.score}</span>
                <span className="text-[10px]">điểm</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={() => onEdit?.(lead)}>
              <Edit className="mr-2 h-4 w-4" />
              Sửa
            </Button>
            <Button size="sm" variant="outline" onClick={() => onConvert?.(lead)}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Chuyển thành Deal
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete?.(lead)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="activities">
                Hoạt động
                {leadActivities.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                    {leadActivities.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes">Ghi chú</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            {/* Info Tab */}
            <TabsContent value="info" className="p-6 pt-4 m-0">
              <div className="space-y-6">
                {/* Contact Info */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Thông tin liên hệ
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      icon={<Mail className="h-4 w-4" />}
                      label="Email"
                      value={lead.email}
                      copyable
                      href={lead.email ? `mailto:${lead.email}` : undefined}
                    />
                    <InfoRow
                      icon={<Phone className="h-4 w-4" />}
                      label="Điện thoại"
                      value={lead.phone}
                      copyable
                      href={lead.phone ? `tel:${lead.phone}` : undefined}
                    />
                  </div>
                </div>

                <Separator />

                {/* Business Info */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Thông tin kinh doanh
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      icon={<Building2 className="h-4 w-4" />}
                      label="Công ty"
                      value={lead.company}
                    />
                    <InfoRow
                      icon={<User className="h-4 w-4" />}
                      label="Vị trí"
                      value={lead.position}
                    />
                    <InfoRow
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Ngân sách dự kiến"
                      value={formatCurrency(lead.budget)}
                    />
                    <InfoRow
                      icon={SOURCE_CONFIG[lead.source]?.icon || <Tag className="h-4 w-4" />}
                      label="Nguồn"
                      value={SOURCE_CONFIG[lead.source]?.label || lead.source}
                    />
                  </div>
                </div>

                <Separator />

                {/* Assignment */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Phân công
                  </h3>
                  <div className="space-y-1">
                    {lead.assignedTo?.name ? (
                      <div className="flex items-center gap-3 py-2">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={lead.assignedTo.avatar} />
                          <AvatarFallback>{getInitials(lead.assignedTo.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {lead.assignedTo.name}
                          </p>
                          <p className="text-xs text-zinc-500">Người phụ trách</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500">Chưa phân công</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                {lead.tags && lead.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                      Thẻ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    Lịch sử
                  </h3>
                  <div className="space-y-1">
                    <InfoRow
                      icon={<Calendar className="h-4 w-4" />}
                      label="Ngày tạo"
                      value={format(new Date(lead.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    />
                    <InfoRow
                      icon={<Clock className="h-4 w-4" />}
                      label="Cập nhật lần cuối"
                      value={format(new Date(lead.updatedAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    />
                    {lead.lastContactAt && (
                      <InfoRow
                        icon={<PhoneCall className="h-4 w-4" />}
                        label="Liên hệ gần nhất"
                        value={format(new Date(lead.lastContactAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      />
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="p-6 pt-4 m-0">
              {leadActivities.length > 0 ? (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {leadActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Activity className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-500">Chưa có hoạt động nào</p>
                </div>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="p-6 pt-4 m-0">
              {lead.notes ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{lead.notes}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-500">Chưa có ghi chú</p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

export default LeadViewDrawer;
