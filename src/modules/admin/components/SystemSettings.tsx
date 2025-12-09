'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Settings,
  Shield,
  Bell,
  Plug,
  Palette,
  Mail,
  HardDrive,
  Database,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  ChevronRight,
  Lock,
  Globe,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAdminStore, selectSettingsByCategory } from '../store';
import {
  SystemSetting,
  SettingCategory,
  SettingType,
  SETTING_CATEGORY_CONFIG,
} from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface SystemSettingsProps {
  onSave?: (settings: SystemSetting[]) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCategoryIcon = (category: SettingCategory) => {
  const icons: Record<SettingCategory, React.ReactNode> = {
    [SettingCategory.GENERAL]: <Settings className="h-4 w-4" />,
    [SettingCategory.SECURITY]: <Shield className="h-4 w-4" />,
    [SettingCategory.NOTIFICATIONS]: <Bell className="h-4 w-4" />,
    [SettingCategory.INTEGRATIONS]: <Plug className="h-4 w-4" />,
    [SettingCategory.APPEARANCE]: <Palette className="h-4 w-4" />,
    [SettingCategory.EMAIL]: <Mail className="h-4 w-4" />,
    [SettingCategory.STORAGE]: <HardDrive className="h-4 w-4" />,
    [SettingCategory.BACKUP]: <Database className="h-4 w-4" />,
  };
  return icons[category];
};

// ============================================================================
// SETTING FIELD
// ============================================================================

interface SettingFieldProps {
  setting: SystemSetting;
  onChange: (value: SystemSetting['value']) => void;
}

function SettingField({ setting, onChange }: SettingFieldProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [localValue, setLocalValue] = useState(setting.value);

  const handleChange = useCallback(
    (newValue: SystemSetting['value']) => {
      setLocalValue(newValue);
      onChange(newValue);
    },
    [onChange]
  );

  switch (setting.type) {
    case SettingType.BOOLEAN:
      return (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.description && (
              <p className="text-xs text-zinc-500">{setting.description}</p>
            )}
          </div>
          <Switch
            checked={localValue as boolean}
            onCheckedChange={handleChange}
          />
        </div>
      );

    case SettingType.SECRET:
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.isRequired && (
              <Badge variant="outline" className="text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
          {setting.description && (
            <p className="text-xs text-zinc-500">{setting.description}</p>
          )}
          <div className="relative">
            <Input
              type={showSecret ? 'text' : 'password'}
              value={localValue as string}
              onChange={(e) => handleChange(e.target.value)}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full w-10"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      );

    case SettingType.NUMBER:
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.isRequired && (
              <Badge variant="outline" className="text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
          {setting.description && (
            <p className="text-xs text-zinc-500">{setting.description}</p>
          )}
          <Input
            type="number"
            value={localValue as number}
            onChange={(e) => handleChange(parseFloat(e.target.value))}
            min={setting.validation?.min}
            max={setting.validation?.max}
          />
          {setting.validation && (
            <p className="text-xs text-zinc-400">
              {setting.validation.min !== undefined && `Min: ${setting.validation.min}`}
              {setting.validation.min !== undefined &&
                setting.validation.max !== undefined &&
                ' | '}
              {setting.validation.max !== undefined && `Max: ${setting.validation.max}`}
            </p>
          )}
        </div>
      );

    case SettingType.ENUM:
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.isRequired && (
              <Badge variant="outline" className="text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
          {setting.description && (
            <p className="text-xs text-zinc-500">{setting.description}</p>
          )}
          <Select
            value={localValue as string}
            onValueChange={handleChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );

    case SettingType.JSON:
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.isRequired && (
              <Badge variant="outline" className="text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
          {setting.description && (
            <p className="text-xs text-zinc-500">{setting.description}</p>
          )}
          <Textarea
            value={
              typeof localValue === 'object'
                ? JSON.stringify(localValue, null, 2)
                : String(localValue)
            }
            onChange={(e) => {
              try {
                handleChange(JSON.parse(e.target.value));
              } catch {
                // Keep as string if invalid JSON
              }
            }}
            className="font-mono text-sm min-h-[100px]"
          />
        </div>
      );

    case SettingType.STRING:
    default:
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">{setting.label}</Label>
            {setting.isRequired && (
              <Badge variant="outline" className="text-xs">
                Bắt buộc
              </Badge>
            )}
          </div>
          {setting.description && (
            <p className="text-xs text-zinc-500">{setting.description}</p>
          )}
          <Input
            type="text"
            value={localValue as string}
            onChange={(e) => handleChange(e.target.value)}
            pattern={setting.validation?.pattern}
          />
        </div>
      );
  }
}

// ============================================================================
// CATEGORY SECTIONS
// ============================================================================

function GeneralSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông tin hệ thống</CardTitle>
          <CardDescription>Cài đặt cơ bản cho hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tên công ty</Label>
            <Input defaultValue="GoldenEnergy" />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input defaultValue="https://goldenenergy.vn" />
          </div>
          <div className="space-y-2">
            <Label>Múi giờ</Label>
            <Select defaultValue="Asia/Ho_Chi_Minh">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Asia/Ho_Chi_Minh">
                  (UTC+07:00) Hồ Chí Minh
                </SelectItem>
                <SelectItem value="Asia/Bangkok">(UTC+07:00) Bangkok</SelectItem>
                <SelectItem value="Asia/Singapore">
                  (UTC+08:00) Singapore
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ngôn ngữ mặc định</Label>
            <Select defaultValue="vi">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Định dạng</CardTitle>
          <CardDescription>Định dạng ngày tháng, tiền tệ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Định dạng ngày</Label>
            <Select defaultValue="dd/MM/yyyy">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Đơn vị tiền tệ</Label>
            <Select defaultValue="VND">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VND">VND - Đồng Việt Nam</SelectItem>
                <SelectItem value="USD">USD - Đô la Mỹ</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mật khẩu</CardTitle>
          <CardDescription>Chính sách bảo mật mật khẩu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Độ dài tối thiểu</Label>
              <p className="text-xs text-zinc-500">Số ký tự tối thiểu cho mật khẩu</p>
            </div>
            <Input type="number" defaultValue="8" className="w-20" min={6} max={32} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Yêu cầu ký tự đặc biệt</Label>
              <p className="text-xs text-zinc-500">Bắt buộc có ký tự đặc biệt</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Yêu cầu số</Label>
              <p className="text-xs text-zinc-500">Bắt buộc có ít nhất 1 số</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hết hạn mật khẩu</Label>
              <p className="text-xs text-zinc-500">Số ngày trước khi phải đổi mật khẩu</p>
            </div>
            <Input type="number" defaultValue="90" className="w-20" min={0} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Xác thực 2 yếu tố (2FA)</CardTitle>
          <CardDescription>Tăng cường bảo mật tài khoản</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Bắt buộc 2FA cho Admin</Label>
              <p className="text-xs text-zinc-500">Admin phải kích hoạt 2FA</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Bắt buộc 2FA cho tất cả</Label>
              <p className="text-xs text-zinc-500">
                Tất cả người dùng phải kích hoạt 2FA
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Phiên đăng nhập</CardTitle>
          <CardDescription>Quản lý phiên làm việc</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Thời gian timeout (phút)</Label>
              <p className="text-xs text-zinc-500">Tự động đăng xuất sau thời gian không hoạt động</p>
            </div>
            <Input type="number" defaultValue="30" className="w-20" min={5} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Số thiết bị đăng nhập</Label>
              <p className="text-xs text-zinc-500">Số thiết bị tối đa được đăng nhập cùng lúc</p>
            </div>
            <Input type="number" defaultValue="3" className="w-20" min={1} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Giao diện</CardTitle>
          <CardDescription>Tùy chỉnh giao diện hệ thống</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Chế độ màu</Label>
            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                <Sun className="h-6 w-6" />
                <span className="text-sm">Sáng</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center gap-2 h-auto py-4">
                <Moon className="h-6 w-6" />
                <span className="text-sm">Tối</span>
              </Button>
              <Button variant="secondary" className="flex flex-col items-center gap-2 h-auto py-4">
                <Laptop className="h-6 w-6" />
                <span className="text-sm">Hệ thống</span>
              </Button>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label>Màu chủ đạo</Label>
            <div className="grid grid-cols-6 gap-3">
              {['#FFD700', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'].map(
                (color) => (
                  <button
                    key={color}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 border-transparent hover:border-zinc-400 transition-colors',
                      color === '#FFD700' && 'ring-2 ring-zinc-900 ring-offset-2'
                    )}
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sidebar thu gọn mặc định</Label>
              <p className="text-xs text-zinc-500">Sidebar mặc định ở chế độ thu gọn</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hiệu ứng chuyển động</Label>
              <p className="text-xs text-zinc-500">Bật/tắt các hiệu ứng animation</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Logo & Branding</CardTitle>
          <CardDescription>Tùy chỉnh thương hiệu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-amber-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">GE</span>
              </div>
              <p className="text-sm text-zinc-500 mb-2">PNG, JPG hoặc SVG tối đa 2MB</p>
              <Button variant="outline" size="sm">
                Tải lên logo
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Favicon</Label>
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-4 text-center">
              <Button variant="outline" size="sm">
                Tải lên favicon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông báo email</CardTitle>
          <CardDescription>Cài đặt gửi email thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Thông báo đăng nhập mới</Label>
              <p className="text-xs text-zinc-500">Gửi email khi có đăng nhập từ thiết bị mới</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Thông báo thay đổi mật khẩu</Label>
              <p className="text-xs text-zinc-500">Gửi email khi mật khẩu được thay đổi</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Tóm tắt hoạt động hàng ngày</Label>
              <p className="text-xs text-zinc-500">Gửi email tóm tắt hoạt động mỗi ngày</p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Báo cáo hàng tuần</Label>
              <p className="text-xs text-zinc-500">Gửi báo cáo tổng hợp hàng tuần</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Thông báo trong app</CardTitle>
          <CardDescription>Cài đặt thông báo trong ứng dụng</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Push notification</Label>
              <p className="text-xs text-zinc-500">Cho phép gửi push notification</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Âm thanh thông báo</Label>
              <p className="text-xs text-zinc-500">Phát âm thanh khi có thông báo mới</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Desktop notification</Label>
              <p className="text-xs text-zinc-500">Hiển thị thông báo trên desktop</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SystemSettings({ onSave }: SystemSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingCategory>(SettingCategory.GENERAL);
  const [hasChanges, setHasChanges] = useState(false);

  const { settings, updateSetting } = useAdminStore();
  const settingsByCategory = useAdminStore(selectSettingsByCategory);

  const handleSettingChange = useCallback(
    (settingId: string, value: SystemSetting['value']) => {
      updateSetting(settingId, value);
      setHasChanges(true);
    },
    [updateSetting]
  );

  const handleSave = useCallback(() => {
    onSave?.(settings);
    setHasChanges(false);
  }, [onSave, settings]);

  const handleReset = useCallback(() => {
    // Reset logic
    setHasChanges(false);
  }, []);

  const tabs = Object.values(SettingCategory);

  const renderContent = () => {
    switch (activeTab) {
      case SettingCategory.GENERAL:
        return <GeneralSettings />;
      case SettingCategory.SECURITY:
        return <SecuritySettings />;
      case SettingCategory.APPEARANCE:
        return <AppearanceSettings />;
      case SettingCategory.NOTIFICATIONS:
        return <NotificationSettings />;
      default:
        // Dynamic settings from store
        const categorySettings = settingsByCategory[activeTab] || [];
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {SETTING_CATEGORY_CONFIG[activeTab]?.label || activeTab}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {categorySettings.map((setting) => (
                <SettingField
                  key={setting.id}
                  setting={setting}
                  onChange={(value) => handleSettingChange(setting.id, value)}
                />
              ))}
              {categorySettings.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-8">
                  Chưa có cài đặt nào trong mục này
                </p>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Cài đặt hệ thống
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Quản lý cấu hình và tùy chỉnh hệ thống
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Chưa lưu
                </Badge>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu thay đổi
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const config = SETTING_CATEGORY_CONFIG[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                        activeTab === tab
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900'
                      )}
                    >
                      {getCategoryIcon(tab)}
                      <span>{config?.label || tab}</span>
                      <ChevronRight
                        className={cn(
                          'ml-auto h-4 w-4 transition-transform',
                          activeTab === tab && 'rotate-90'
                        )}
                      />
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">{renderContent()}</div>
      </div>
    </div>
  );
}
