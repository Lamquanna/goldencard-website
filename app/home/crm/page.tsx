'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  Handshake,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  BarChart3,
  PieChart,
  Activity,
  Flame,
  ThermometerSun,
  Snowflake,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

// Types & Config
import type { Lead, Deal, CRMActivity } from '@/app/home/modules/crm';
import { LEAD_STATUS_CONFIG, DEAL_STAGE_CONFIG, getRatingColor } from '@/app/home/modules/crm';

// Mock data for demonstration
const mockStats = {
  totalLeads: 156,
  leadsThisMonth: 42,
  leadsChange: 12.5,
  totalContacts: 89,
  contactsThisMonth: 15,
  contactsChange: 8.3,
  totalDeals: 34,
  dealsThisMonth: 8,
  dealsChange: -5.2,
  pipelineValue: 2450000000,
  wonValue: 850000000,
  conversionRate: 23.5,
};

const mockLeadsByStatus = [
  { status: 'new', count: 28, value: 450000000 },
  { status: 'contacted', count: 35, value: 620000000 },
  { status: 'qualified', count: 22, value: 380000000 },
  { status: 'proposal', count: 18, value: 520000000 },
  { status: 'negotiation', count: 12, value: 480000000 },
];

const mockRecentLeads: Partial<Lead>[] = [
  {
    id: '1',
    name: 'Nguyễn Văn An',
    company: 'ABC Corporation',
    email: 'an.nguyen@abc.com',
    phone: '0901234567',
    status: 'new',
    rating: 'hot',
    score: 85,
    source: 'website',
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Trần Thị Bình',
    company: 'XYZ Trading',
    email: 'binh.tran@xyz.vn',
    phone: '0912345678',
    status: 'contacted',
    rating: 'warm',
    score: 65,
    source: 'referral',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    name: 'Lê Minh Cường',
    company: 'Tech Solutions',
    email: 'cuong.le@tech.vn',
    phone: '0923456789',
    status: 'qualified',
    rating: 'hot',
    score: 92,
    source: 'exhibition',
    createdAt: new Date(Date.now() - 172800000),
  },
];

const mockActivities: CRMActivity[] = [
  {
    id: '1',
    type: 'call',
    title: 'Gọi điện tư vấn',
    description: 'Tư vấn giải pháp năng lượng mặt trời cho nhà máy',
    entityType: 'lead',
    entityId: '1',
    userId: 'user1',
    completedAt: new Date(),
    createdAt: new Date(),
  },
  {
    id: '2',
    type: 'meeting',
    title: 'Họp trình bày giải pháp',
    description: 'Trình bày proposal cho dự án 500kW',
    entityType: 'deal',
    entityId: '1',
    userId: 'user2',
    scheduledAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
  },
  {
    id: '3',
    type: 'email',
    title: 'Gửi báo giá',
    description: 'Báo giá hệ thống điện mặt trời 100kW',
    entityType: 'lead',
    entityId: '2',
    userId: 'user1',
    completedAt: new Date(),
    createdAt: new Date(Date.now() - 3600000),
  },
];

const mockTopDeals: Partial<Deal>[] = [
  {
    id: '1',
    name: 'Dự án Solar Farm 5MW',
    value: 850000000,
    stage: 'negotiation',
    probability: 90,
    expectedCloseDate: new Date(Date.now() + 604800000),
  },
  {
    id: '2',
    name: 'Hệ thống mái nhà xưởng 500kW',
    value: 420000000,
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: new Date(Date.now() + 1209600000),
  },
  {
    id: '3',
    name: 'Điện mặt trời gia đình Premium',
    value: 180000000,
    stage: 'decision_makers',
    probability: 60,
    expectedCloseDate: new Date(Date.now() + 864000000),
  },
];

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor,
  format = 'number',
}: {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor: string;
  format?: 'number' | 'currency' | 'percent';
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
          notation: 'compact',
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('vi-VN');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold mt-1">{formatValue(value)}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {change > 0 && '+'}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-gray-500">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            <Icon className="h-6 w-6" style={{ color: iconColor }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pipeline Funnel Component
function PipelineFunnel() {
  const maxCount = Math.max(...mockLeadsByStatus.map((s) => s.count));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
        <CardDescription>Phân bổ leads theo giai đoạn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockLeadsByStatus.map((item) => {
            const config = LEAD_STATUS_CONFIG.find((s) => s.id === item.status);
            if (!config) return null;

            const widthPercent = (item.count / maxCount) * 100;

            return (
              <div key={item.status} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                    <span>{config.nameVi}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.count}</Badge>
                    <span className="text-gray-500 text-xs">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        notation: 'compact',
                        maximumFractionDigits: 0,
                      }).format(item.value)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: config.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Tỷ lệ chuyển đổi</p>
            <p className="text-2xl font-bold text-green-600">
              {mockStats.conversionRate}%
            </p>
          </div>
          <Link href="/home/crm/pipeline">
            <Button variant="outline" size="sm">
              Xem Pipeline
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Leads Component
function RecentLeads() {
  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'hot':
        return <Flame className="h-4 w-4 text-red-500" />;
      case 'warm':
        return <ThermometerSun className="h-4 w-4 text-orange-500" />;
      case 'cold':
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Leads mới nhất</CardTitle>
            <CardDescription>Leads được tạo gần đây</CardDescription>
          </div>
          <Link href="/home/crm/leads">
            <Button variant="ghost" size="sm">
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockRecentLeads.map((lead) => {
            const statusConfig = LEAD_STATUS_CONFIG.find(
              (s) => s.id === lead.status
            );

            return (
              <div
                key={lead.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {lead.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{lead.name}</span>
                    {getRatingIcon(lead.rating || 'cold')}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {lead.company}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${statusConfig?.color}20`,
                        color: statusConfig?.color,
                      }}
                    >
                      {statusConfig?.nameVi}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      Score: {lead.score}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {lead.createdAt && new Date(lead.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Top Deals Component
function TopDeals() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Top Deals</CardTitle>
            <CardDescription>Cơ hội có giá trị cao nhất</CardDescription>
          </div>
          <Link href="/home/crm/deals">
            <Button variant="ghost" size="sm">
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTopDeals.map((deal) => {
            const stageConfig = DEAL_STAGE_CONFIG.find(
              (s) => s.id === deal.stage
            );

            return (
              <div
                key={deal.id}
                className="p-3 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{deal.name}</h4>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {stageConfig?.nameVi}
                    </Badge>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                      notation: 'compact',
                      maximumFractionDigits: 0,
                    }).format(deal.value || 0)}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Xác suất thành công</span>
                    <span>{deal.probability}%</span>
                  </div>
                  <Progress value={deal.probability} className="h-1.5" />
                </div>
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    Dự kiến:{' '}
                    {new Date(deal.expectedCloseDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Activities Component
function RecentActivities() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4 text-green-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'task':
        return <CheckCircle2 className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Hoạt động</CardTitle>
            <CardDescription>Lịch sử và sắp tới</CardDescription>
          </div>
          <Link href="/home/crm/activities">
            <Button variant="ghost" size="sm">
              Xem tất cả
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recent">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Gần đây</TabsTrigger>
            <TabsTrigger value="upcoming">Sắp tới</TabsTrigger>
          </TabsList>
          <TabsContent value="recent" className="space-y-3 mt-4">
            {mockActivities
              .filter((a) => a.completedAt)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {activity.completedAt &&
                      new Date(activity.completedAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                  </span>
                </div>
              ))}
          </TabsContent>
          <TabsContent value="upcoming" className="space-y-3 mt-4">
            {mockActivities
              .filter((a) => a.scheduledAt && !a.completedAt)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.scheduledAt &&
                      new Date(activity.scheduledAt).toLocaleDateString('vi-VN')}
                  </Badge>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Main CRM Dashboard Component
export default function CRMDashboard() {
  const [period, setPeriod] = useState('this_month');

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">CRM Dashboard</h1>
          <p className="text-gray-500">Tổng quan hoạt động kinh doanh</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Chọn kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hôm nay</SelectItem>
              <SelectItem value="this_week">Tuần này</SelectItem>
              <SelectItem value="this_month">Tháng này</SelectItem>
              <SelectItem value="this_quarter">Quý này</SelectItem>
              <SelectItem value="this_year">Năm này</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/home/crm/leads">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm Lead
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng Leads"
          value={mockStats.totalLeads}
          change={mockStats.leadsChange}
          changeLabel="so với tháng trước"
          icon={Target}
          iconColor="#3B82F6"
        />
        <StatCard
          title="Contacts"
          value={mockStats.totalContacts}
          change={mockStats.contactsChange}
          changeLabel="so với tháng trước"
          icon={Users}
          iconColor="#10B981"
        />
        <StatCard
          title="Deals đang mở"
          value={mockStats.totalDeals}
          change={mockStats.dealsChange}
          changeLabel="so với tháng trước"
          icon={Handshake}
          iconColor="#8B5CF6"
        />
        <StatCard
          title="Giá trị Pipeline"
          value={mockStats.pipelineValue}
          icon={DollarSign}
          iconColor="#F59E0B"
          format="currency"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Funnel - Takes 1 column */}
        <PipelineFunnel />

        {/* Recent Leads - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentLeads />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Deals */}
        <TopDeals />

        {/* Activities */}
        <RecentActivities />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Leads Hot</p>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="h-5 w-5 text-red-500" />
                  <span className="text-2xl font-bold">
                    {mockRecentLeads.filter((l) => l.rating === 'hot').length}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Cần liên hệ ngay
                </p>
              </div>
              <Link href="/home/crm/leads?rating=hot">
                <Button variant="outline" size="sm">
                  Xem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cần Follow-up</p>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-2xl font-bold">12</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Quá hạn liên hệ
                </p>
              </div>
              <Link href="/home/crm/leads?follow_up=overdue">
                <Button variant="outline" size="sm">
                  Xem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Deals sắp đóng</p>
                <div className="flex items-center gap-2 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-2xl font-bold">5</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Trong 7 ngày tới
                </p>
              </div>
              <Link href="/home/crm/deals?closing=7days">
                <Button variant="outline" size="sm">
                  Xem
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
