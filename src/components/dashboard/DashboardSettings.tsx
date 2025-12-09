// ============================================================================
// DASHBOARD SETTINGS COMPONENT
// GoldenEnergy HOME Platform - Widget Visibility & Layout Settings
// ============================================================================

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  Layout,
  Palette,
  Bell,
  Clock,
  GripVertical,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Dashboard Store & Types
import { useDashboardStore } from '@/modules/dashboard/store';
import type { Widget, DateRangePreset } from '@/modules/dashboard/types';

// Localization
import { dashboardLocale as t } from './locale';

// ============================================================================
// TYPES
// ============================================================================

interface WidgetSettingsItemProps {
  widget: Widget;
  onToggle: (id: string) => void;
}

interface DashboardSettingsProps {
  trigger?: React.ReactNode;
  className?: string;
}

// ============================================================================
// WIDGET SETTINGS ITEM
// ============================================================================

function WidgetSettingsItem({ widget, onToggle }: WidgetSettingsItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border',
        'bg-white dark:bg-gray-800',
        'border-gray-200 dark:border-gray-700',
        'hover:border-amber-300 dark:hover:border-amber-600',
        'transition-colors duration-200'
      )}
    >
      <div className="flex items-center gap-3">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={t.settings.dragToReorder}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {widget.title}
          </p>
          {widget.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {widget.description}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {widget.isVisible ? (
          <Eye className="w-4 h-4 text-green-500" />
        ) : (
          <EyeOff className="w-4 h-4 text-gray-400" />
        )}
        <Switch
          checked={widget.isVisible}
          onCheckedChange={() => onToggle(widget.id)}
          aria-label={`${t.settings.toggleWidget} ${widget.title}`}
        />
      </div>
    </motion.div>
  );
}

// ============================================================================
// LAYOUT PRESETS
// ============================================================================

const LAYOUT_PRESETS = [
  { id: 'default', name: t.settings.layouts.default, icon: Layout },
  { id: 'compact', name: t.settings.layouts.compact, icon: Layout },
  { id: 'analytics', name: t.settings.layouts.analytics, icon: Layout },
  { id: 'minimal', name: t.settings.layouts.minimal, icon: Layout },
];

const DATE_RANGE_OPTIONS: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: t.dateRanges.today },
  { value: 'yesterday', label: t.dateRanges.yesterday },
  { value: 'this_week', label: t.dateRanges.last7Days },
  { value: 'last_week', label: t.dateRanges.last30Days },
  { value: 'this_month', label: t.dateRanges.thisMonth },
  { value: 'last_month', label: t.dateRanges.lastMonth },
  { value: 'this_quarter', label: t.dateRanges.thisQuarter },
  { value: 'this_year', label: t.dateRanges.thisYear },
];

const REFRESH_INTERVALS = [
  { value: 0, label: t.settings.refresh.manual },
  { value: 30, label: '30 giây' },
  { value: 60, label: '1 phút' },
  { value: 300, label: '5 phút' },
  { value: 600, label: '10 phút' },
  { value: 1800, label: '30 phút' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DashboardSettings({ trigger, className }: DashboardSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('widgets');
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store selectors
  const widgets = useDashboardStore((state) => state.widgets);
  const preferences = useDashboardStore((state) => state.preferences);
  const filter = useDashboardStore((state) => state.filter);
  const currentLayoutId = useDashboardStore((state) => state.currentLayoutId);
  
  // Store actions
  const toggleWidgetVisibility = useDashboardStore((state) => state.toggleWidgetVisibility);
  const setCurrentLayout = useDashboardStore((state) => state.setCurrentLayout);
  const setDateRange = useDashboardStore((state) => state.setDateRange);
  const setPreferences = useDashboardStore((state) => state.setPreferences);
  
  // Local state for unsaved changes
  const [localRefreshInterval, setLocalRefreshInterval] = useState(
    preferences?.refreshInterval ?? 300
  );
  const [localCompactMode, setLocalCompactMode] = useState(
    preferences?.compactMode ?? false
  );
  const [localShowWelcome, setLocalShowWelcome] = useState(
    preferences?.showWelcomeMessage ?? true
  );

  // Handlers
  const handleToggleWidget = useCallback((id: string) => {
    toggleWidgetVisibility(id);
    setHasChanges(true);
  }, [toggleWidgetVisibility]);

  const handleLayoutChange = useCallback((layoutId: string) => {
    setCurrentLayout(layoutId);
    setHasChanges(true);
  }, [setCurrentLayout]);

  const handleDateRangeChange = useCallback((preset: DateRangePreset) => {
    setDateRange(preset);
  }, [setDateRange]);

  const handleSave = useCallback(async () => {
    if (setPreferences && preferences) {
      setPreferences({
        ...preferences,
        refreshInterval: localRefreshInterval,
        compactMode: localCompactMode,
        showWelcomeMessage: localShowWelcome,
      });
    }
    setHasChanges(false);
    setIsOpen(false);
  }, [
    localRefreshInterval,
    localCompactMode,
    localShowWelcome,
    setPreferences,
    preferences,
  ]);

  const handleReset = useCallback(() => {
    setLocalRefreshInterval(300);
    setLocalCompactMode(false);
    setLocalShowWelcome(true);
    setHasChanges(false);
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className={cn('gap-2', className)}
            aria-label={t.settings.title}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">{t.settings.title}</span>
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-500" />
            {t.settings.title}
          </SheetTitle>
          <SheetDescription>
            {t.settings.description}
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="widgets" className="text-xs sm:text-sm">
              {t.settings.tabs.widgets}
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs sm:text-sm">
              {t.settings.tabs.layout}
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs sm:text-sm">
              {t.settings.tabs.preferences}
            </TabsTrigger>
          </TabsList>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {widgets.map((widget) => (
                    <WidgetSettingsItem
                      key={widget.id}
                      widget={widget}
                      onToggle={handleToggleWidget}
                    />
                  ))}
                </AnimatePresence>
              </div>
              
              {widgets.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t.settings.noWidgets}
                </div>
              )}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="mt-4 space-y-4">
            <div className="space-y-3">
              <Label>{t.settings.selectLayout}</Label>
              <div className="grid grid-cols-2 gap-3">
                {LAYOUT_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  const isActive = currentLayoutId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleLayoutChange(preset.id)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-lg border text-left',
                        'transition-all duration-200',
                        isActive
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-amber-300'
                      )}
                      aria-pressed={isActive}
                    >
                      <Icon className={cn(
                        'w-5 h-5',
                        isActive ? 'text-amber-500' : 'text-gray-400'
                      )} />
                      <span className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'
                      )}>
                        {preset.name}
                      </span>
                      {isActive && (
                        <Check className="w-4 h-4 text-amber-500 ml-auto" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>{t.settings.defaultDateRange}</Label>
              <Select
                value={filter.dateRange?.preset || 'this_month'}
                onValueChange={(v) => handleDateRangeChange(v as DateRangePreset)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.settings.selectDateRange} />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-4 space-y-6">
            {/* Refresh Interval */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {t.settings.refreshInterval}
                </Label>
                <span className="text-sm text-gray-500">
                  {REFRESH_INTERVALS.find((r) => r.value === localRefreshInterval)?.label}
                </span>
              </div>
              <Select
                value={String(localRefreshInterval)}
                onValueChange={(v) => {
                  setLocalRefreshInterval(Number(v));
                  setHasChanges(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFRESH_INTERVALS.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Compact Mode */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  {t.settings.compactMode}
                </Label>
                <p className="text-xs text-gray-500">
                  {t.settings.compactModeDesc}
                </p>
              </div>
              <Switch
                checked={localCompactMode}
                onCheckedChange={(checked) => {
                  setLocalCompactMode(checked);
                  setHasChanges(true);
                }}
                aria-label={t.settings.compactMode}
              />
            </div>

            <Separator />

            {/* Show Welcome Message */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gray-400" />
                  {t.settings.showNotifications}
                </Label>
                <p className="text-xs text-gray-500">
                  {t.settings.showNotificationsDesc}
                </p>
              </div>
              <Switch
                checked={localShowWelcome}
                onCheckedChange={(checked) => {
                  setLocalShowWelcome(checked);
                  setHasChanges(true);
                }}
                aria-label={t.settings.showNotifications}
              />
            </div>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {t.settings.reset}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="gap-2 bg-amber-500 hover:bg-amber-600"
          >
            <Save className="w-4 h-4" />
            {t.settings.save}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default DashboardSettings;
