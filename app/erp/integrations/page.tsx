'use client';

import React, { useState } from 'react';
import {
  Plug,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

// =============================================================================
// TYPES & DATA
// =============================================================================

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'communication' | 'payment' | 'shipping' | 'cloud_storage' | 'analytics' | 'crm' | 'other';
  logo: string;
  status: 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  connectedAt?: string;
  lastSync?: string;
  config?: any;
}

const mockIntegrations: Integration[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Gửi và nhận email thông qua Gmail',
    category: 'communication',
    logo: '📧',
    status: 'connected',
    isActive: true,
    connectedAt: '2025-01-15',
    lastSync: '2025-12-17 08:30',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Nhận thông báo qua Slack',
    category: 'communication',
    logo: '💬',
    status: 'connected',
    isActive: true,
    connectedAt: '2025-02-01',
    lastSync: '2025-12-17 08:25',
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    description: 'Lưu trữ file trên Google Drive',
    category: 'cloud_storage',
    logo: '☁️',
    status: 'connected',
    isActive: true,
    connectedAt: '2025-01-20',
    lastSync: '2025-12-17 07:45',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Xử lý thanh toán quốc tế',
    category: 'payment',
    logo: '💳',
    status: 'disconnected',
    isActive: false,
  },
  {
    id: 'vnpay',
    name: 'VNPay',
    description: 'Cổng thanh toán Việt Nam',
    category: 'payment',
    logo: '💰',
    status: 'connected',
    isActive: true,
    connectedAt: '2025-03-10',
    lastSync: '2025-12-17 06:00',
  },
  {
    id: 'ghtk',
    name: 'Giao hàng tiết kiệm',
    description: 'Vận chuyển và tra cứu đơn hàng',
    category: 'shipping',
    logo: '🚚',
    status: 'connected',
    isActive: true,
    connectedAt: '2025-02-15',
    lastSync: '2025-12-17 08:00',
  },
  {
    id: 'ga',
    name: 'Google Analytics',
    description: 'Phân tích dữ liệu website',
    category: 'analytics',
    logo: '📊',
    status: 'connected',
    isActive: true,
    connectedAt: '2025-01-10',
    lastSync: '2025-12-17 08:20',
  },
  {
    id: 'zalo',
    name: 'Zalo OA',
    description: 'Gửi tin nhắn qua Zalo Official Account',
    category: 'communication',
    logo: '📱',
    status: 'error',
    isActive: false,
    connectedAt: '2025-04-01',
  },
  {
    id: 'momo',
    name: 'MoMo',
    description: 'Thanh toán qua ví MoMo',
    category: 'payment',
    logo: '🎀',
    status: 'disconnected',
    isActive: false,
  },
];

const availableIntegrations = [
  { id: 'zapier', name: 'Zapier', description: 'Tự động hóa với 5000+ apps', category: 'other', logo: '⚡' },
  { id: 'hubspot', name: 'HubSpot', description: 'CRM và Marketing', category: 'crm', logo: '🎯' },
  { id: 'salesforce', name: 'Salesforce', description: 'Enterprise CRM', category: 'crm', logo: '☁️' },
  { id: 'dropbox', name: 'Dropbox', description: 'Cloud storage', category: 'cloud_storage', logo: '📦' },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function IntegrationCard({ integration, onToggle, onConfigure, onDisconnect }: {
  integration: Integration;
  onToggle: () => void;
  onConfigure: () => void;
  onDisconnect: () => void;
}) {
  const getStatusIcon = () => {
    switch (integration.status) {
      case 'connected': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'disconnected': return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = () => {
    switch (integration.status) {
      case 'connected': return 'Đã kết nối';
      case 'disconnected': return 'Chưa kết nối';
      case 'error': return 'Lỗi';
    }
  };

  const getStatusColor = () => {
    switch (integration.status) {
      case 'connected': return 'bg-green-50 text-green-700';
      case 'disconnected': return 'bg-gray-50 text-gray-700';
      case 'error': return 'bg-red-50 text-red-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{integration.logo}</div>
            <div>
              <CardTitle className="text-base">{integration.name}</CardTitle>
              <CardDescription className="text-xs mt-1">{integration.description}</CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
                  {getStatusIcon()}
                  <span className="ml-1">{getStatusLabel()}</span>
                </Badge>
              </div>
            </div>
          </div>
          <Switch
            checked={integration.isActive}
            onCheckedChange={onToggle}
            disabled={integration.status !== 'connected'}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {integration.connectedAt && (
            <div className="text-xs text-muted-foreground">
              Kết nối: {integration.connectedAt}
            </div>
          )}
          {integration.lastSync && (
            <div className="text-xs text-muted-foreground">
              Đồng bộ: {integration.lastSync}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            {integration.status === 'connected' ? (
              <>
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  <Settings className="h-3 w-3 mr-1" />
                  Cấu hình
                </Button>
                <Button variant="outline" size="sm" onClick={onDisconnect}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Ngắt kết nối
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => {
                if (confirm(`Bạn muốn kết nối với ${integration.name}?\n\nLưu ý: Tính năng này cần cấu hình API key từ nhà cung cấp.`)) {
                  alert(`Vui lòng liên hệ IT để cấu hình tích hợp ${integration.name}`);
                }
              }}>
                <Plug className="h-3 w-3 mr-1" />
                Kết nối
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAvailable, setShowAvailable] = useState(false);

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = search === '' || i.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || i.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.status === 'connected').length,
    active: integrations.filter(i => i.isActive).length,
    error: integrations.filter(i => i.status === 'error').length,
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tích hợp</h1>
          <p className="text-muted-foreground">Kết nối với các dịch vụ bên ngoài</p>
        </div>
        <Button onClick={() => setShowAvailable(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm tích hợp
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Tổng số</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.connected}</div>
            <p className="text-xs text-muted-foreground">Đã kết nối</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <p className="text-xs text-muted-foreground">Lỗi</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm tích hợp..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="communication">Giao tiếp</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="shipping">Vận chuyển</TabsTrigger>
          <TabsTrigger value="cloud_storage">Lưu trữ</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích</TabsTrigger>
        </TabsList>

        <TabsContent value={categoryFilter} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={() => {
                  setIntegrations(integrations.map(i =>
                    i.id === integration.id ? { ...i, isActive: !i.isActive } : i
                  ));
                }}
                onConfigure={() => {
                  alert(`Cấu hình ${integration.name}\n\nAPI Key: ****${integration.id.slice(-4)}\nTrạng thái: Đã kết nối\nĐồng bộ cuối: ${integration.lastSync || 'N/A'}\n\nLiên hệ IT để thay đổi cấu hình.`);
                }}
                onDisconnect={() => {
                  if (confirm(`Ngắt kết nối ${integration.name}?`)) {
                    setIntegrations(integrations.map(i =>
                      i.id === integration.id ? { ...i, status: 'disconnected', isActive: false } : i
                    ));
                  }
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Available Integrations Dialog */}
      <Dialog open={showAvailable} onOpenChange={setShowAvailable}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tích hợp có sẵn</DialogTitle>
            <DialogDescription>Kết nối với các dịch vụ phổ biến</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-4">
            {availableIntegrations.map(int => (
              <Card key={int.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{int.logo}</div>
                    <div className="flex-1">
                      <CardTitle className="text-sm">{int.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">{int.description}</CardDescription>
                      <Button size="sm" className="mt-3" onClick={() => {
                        if (confirm(`Bạn muốn thêm tích hợp ${int.name}?`)) {
                          alert(`Đã gửi yêu cầu tích hợp ${int.name}. IT sẽ liên hệ để hoàn tất cấu hình.`);
                        }
                      }}>
                        <Plug className="h-3 w-3 mr-1" />
                        Kết nối
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
