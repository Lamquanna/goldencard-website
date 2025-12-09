// ============================================================================
// DASHBOARD HOME MODULE - ZUSTAND STORE
// GoldenEnergy HOME Platform - Dashboard State Management
// ============================================================================

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { WritableDraft } from 'immer';
import type {
  Widget,
  WidgetPosition,
  DashboardLayout,
  GridConfig,
  TaskSummary,
  RecentActivity,
  DashboardNotification,
  KPIValue,
  QuickReport,
  DashboardFilter,
  DashboardPreferences,
  DateRangePreset,
  CreateWidgetDto,
  UpdateWidgetDto,
} from './types';
import { DEFAULT_GRID_CONFIG } from './types';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface DashboardState {
  // Layouts
  layouts: DashboardLayout[];
  currentLayoutId: string | null;
  
  // Widgets
  widgets: Widget[];
  widgetData: Map<string, unknown>;
  loadingWidgets: Set<string>;
  
  // Data
  taskSummary: TaskSummary | null;
  recentActivities: RecentActivity[];
  notifications: DashboardNotification[];
  unreadCount: number;
  kpiValues: KPIValue[];
  quickReports: QuickReport[];
  
  // Filters & Preferences
  filter: DashboardFilter;
  preferences: DashboardPreferences | null;
  
  // UI State
  isEditMode: boolean;
  selectedWidgetId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface DashboardActions {
  // Layout actions
  setLayouts: (layouts: DashboardLayout[]) => void;
  setCurrentLayout: (layoutId: string) => void;
  addLayout: (layout: DashboardLayout) => void;
  updateLayout: (id: string, updates: Partial<DashboardLayout>) => void;
  deleteLayout: (id: string) => void;
  duplicateLayout: (id: string, newName: string) => void;
  setDefaultLayout: (id: string) => void;
  
  // Widget actions
  setWidgets: (widgets: Widget[]) => void;
  addWidget: (dto: CreateWidgetDto) => void;
  updateWidget: (id: string, dto: UpdateWidgetDto) => void;
  removeWidget: (id: string) => void;
  moveWidget: (id: string, position: WidgetPosition) => void;
  resizeWidget: (id: string, size: { w: number; h: number }) => void;
  toggleWidgetVisibility: (id: string) => void;
  refreshWidget: (id: string) => void;
  setWidgetData: (id: string, data: unknown) => void;
  setWidgetLoading: (id: string, loading: boolean) => void;
  
  // Data actions
  setTaskSummary: (summary: TaskSummary) => void;
  setRecentActivities: (activities: RecentActivity[]) => void;
  addActivity: (activity: RecentActivity) => void;
  setNotifications: (notifications: DashboardNotification[]) => void;
  addNotification: (notification: DashboardNotification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  setKPIValues: (values: KPIValue[]) => void;
  updateKPIValue: (kpiId: string, value: Partial<KPIValue>) => void;
  setQuickReports: (reports: QuickReport[]) => void;
  
  // Filter actions
  setFilter: (filter: Partial<DashboardFilter>) => void;
  setDateRange: (preset: DateRangePreset) => void;
  resetFilter: () => void;
  
  // Preference actions
  setPreferences: (preferences: DashboardPreferences) => void;
  updatePreferences: (updates: Partial<DashboardPreferences>) => void;
  addFavoriteWidget: (widgetType: string) => void;
  removeFavoriteWidget: (widgetType: string) => void;
  pinAction: (actionId: string) => void;
  unpinAction: (actionId: string) => void;
  
  // UI actions
  toggleEditMode: () => void;
  setSelectedWidgetId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const getDefaultDateRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    start: startOfMonth.toISOString(),
    end: now.toISOString(),
    preset: 'this_month' as DateRangePreset,
  };
};

const initialState: DashboardState = {
  layouts: [],
  currentLayoutId: null,
  widgets: [],
  widgetData: new Map(),
  loadingWidgets: new Set(),
  taskSummary: null,
  recentActivities: [],
  notifications: [],
  unreadCount: 0,
  kpiValues: [],
  quickReports: [],
  filter: {
    dateRange: getDefaultDateRange(),
  },
  preferences: null,
  isEditMode: false,
  selectedWidgetId: null,
  isLoading: false,
  error: null,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function calculateNextPosition(widgets: Widget[], gridConfig: GridConfig): WidgetPosition {
  if (widgets.length === 0) {
    return { x: 0, y: 0, w: 4, h: 3 };
  }

  // Find the lowest available position
  const maxY = Math.max(...widgets.map((w) => w.position.y + w.position.h));
  return { x: 0, y: maxY, w: 4, h: 3 };
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // ============================================
          // LAYOUT ACTIONS
          // ============================================

          setLayouts: (layouts) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.layouts = layouts as WritableDraft<DashboardLayout>[];
              },
              false,
              'dashboard/setLayouts'
            );
          },

          setCurrentLayout: (layoutId) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.currentLayoutId = layoutId;
                const layout = state.layouts.find((l) => l.id === layoutId);
                if (layout) {
                  state.widgets = layout.widgets as WritableDraft<Widget>[];
                }
              },
              false,
              'dashboard/setCurrentLayout'
            );
          },

          addLayout: (layout) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.layouts.push(layout as WritableDraft<DashboardLayout>);
              },
              false,
              'dashboard/addLayout'
            );
          },

          updateLayout: (id, updates) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.layouts.findIndex((l) => l.id === id);
                if (index !== -1) {
                  Object.assign(state.layouts[index], updates);
                  state.layouts[index].updatedAt = new Date().toISOString();
                }
              },
              false,
              'dashboard/updateLayout'
            );
          },

          deleteLayout: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.layouts = state.layouts.filter((l) => l.id !== id);
                if (state.currentLayoutId === id) {
                  const defaultLayout = state.layouts.find((l) => l.isDefault);
                  state.currentLayoutId = defaultLayout?.id || state.layouts[0]?.id || null;
                }
              },
              false,
              'dashboard/deleteLayout'
            );
          },

          duplicateLayout: (id, newName) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const layout = state.layouts.find((l) => l.id === id);
                if (layout) {
                  const newLayout: DashboardLayout = {
                    ...JSON.parse(JSON.stringify(layout)),
                    id: generateId(),
                    name: newName,
                    isDefault: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  state.layouts.push(newLayout as WritableDraft<DashboardLayout>);
                }
              },
              false,
              'dashboard/duplicateLayout'
            );
          },

          setDefaultLayout: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.layouts.forEach((l) => {
                  l.isDefault = l.id === id;
                });
              },
              false,
              'dashboard/setDefaultLayout'
            );
          },

          // ============================================
          // WIDGET ACTIONS
          // ============================================

          setWidgets: (widgets) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.widgets = widgets as WritableDraft<Widget>[];
              },
              false,
              'dashboard/setWidgets'
            );
          },

          addWidget: (dto) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const position = dto.position
                  ? { x: dto.position.x || 0, y: dto.position.y || 0, w: dto.position.w || 4, h: dto.position.h || 3 }
                  : calculateNextPosition(state.widgets as Widget[], DEFAULT_GRID_CONFIG);
                
                const newWidget: Widget = {
                  id: generateId(),
                  type: dto.type,
                  title: dto.title,
                  description: dto.description,
                  size: dto.size || 'medium',
                  position,
                  config: dto.config,
                  isVisible: true,
                };
                state.widgets.push(newWidget as WritableDraft<Widget>);
              },
              false,
              'dashboard/addWidget'
            );
          },

          updateWidget: (id, dto) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.widgets.findIndex((w) => w.id === id);
                if (index !== -1) {
                  if (dto.title !== undefined) state.widgets[index].title = dto.title;
                  if (dto.description !== undefined) state.widgets[index].description = dto.description;
                  if (dto.size !== undefined) state.widgets[index].size = dto.size;
                  if (dto.isVisible !== undefined) state.widgets[index].isVisible = dto.isVisible;
                  if (dto.refreshInterval !== undefined) state.widgets[index].refreshInterval = dto.refreshInterval;
                  if (dto.config) {
                    Object.assign(state.widgets[index].config, dto.config);
                  }
                  if (dto.position) {
                    Object.assign(state.widgets[index].position, dto.position);
                  }
                }
              },
              false,
              'dashboard/updateWidget'
            );
          },

          removeWidget: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.widgets = state.widgets.filter((w) => w.id !== id);
                state.widgetData.delete(id);
                state.loadingWidgets.delete(id);
                if (state.selectedWidgetId === id) {
                  state.selectedWidgetId = null;
                }
              },
              false,
              'dashboard/removeWidget'
            );
          },

          moveWidget: (id, position) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.widgets.findIndex((w) => w.id === id);
                if (index !== -1) {
                  state.widgets[index].position = position;
                }
              },
              false,
              'dashboard/moveWidget'
            );
          },

          resizeWidget: (id, size) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.widgets.findIndex((w) => w.id === id);
                if (index !== -1) {
                  state.widgets[index].position.w = size.w;
                  state.widgets[index].position.h = size.h;
                }
              },
              false,
              'dashboard/resizeWidget'
            );
          },

          toggleWidgetVisibility: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.widgets.findIndex((w) => w.id === id);
                if (index !== -1) {
                  state.widgets[index].isVisible = !state.widgets[index].isVisible;
                }
              },
              false,
              'dashboard/toggleWidgetVisibility'
            );
          },

          refreshWidget: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.widgets.findIndex((w) => w.id === id);
                if (index !== -1) {
                  state.widgets[index].lastRefreshed = new Date().toISOString();
                }
              },
              false,
              'dashboard/refreshWidget'
            );
          },

          setWidgetData: (id, data) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.widgetData.set(id, data);
              },
              false,
              'dashboard/setWidgetData'
            );
          },

          setWidgetLoading: (id, loading) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                if (loading) {
                  state.loadingWidgets.add(id);
                } else {
                  state.loadingWidgets.delete(id);
                }
              },
              false,
              'dashboard/setWidgetLoading'
            );
          },

          // ============================================
          // DATA ACTIONS
          // ============================================

          setTaskSummary: (summary) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.taskSummary = summary;
              },
              false,
              'dashboard/setTaskSummary'
            );
          },

          setRecentActivities: (activities) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.recentActivities = activities as WritableDraft<RecentActivity>[];
              },
              false,
              'dashboard/setRecentActivities'
            );
          },

          addActivity: (activity) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.recentActivities.unshift(activity as WritableDraft<RecentActivity>);
                // Keep only last 100 activities
                if (state.recentActivities.length > 100) {
                  state.recentActivities = state.recentActivities.slice(0, 100);
                }
              },
              false,
              'dashboard/addActivity'
            );
          },

          setNotifications: (notifications) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.notifications = notifications as WritableDraft<DashboardNotification>[];
                state.unreadCount = notifications.filter((n) => !n.isRead).length;
              },
              false,
              'dashboard/setNotifications'
            );
          },

          addNotification: (notification) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.notifications.unshift(notification as WritableDraft<DashboardNotification>);
                if (!notification.isRead) {
                  state.unreadCount++;
                }
              },
              false,
              'dashboard/addNotification'
            );
          },

          markNotificationRead: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const notification = state.notifications.find((n) => n.id === id);
                if (notification && !notification.isRead) {
                  notification.isRead = true;
                  state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
              },
              false,
              'dashboard/markNotificationRead'
            );
          },

          markAllNotificationsRead: () => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.notifications.forEach((n) => {
                  n.isRead = true;
                });
                state.unreadCount = 0;
              },
              false,
              'dashboard/markAllNotificationsRead'
            );
          },

          removeNotification: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.notifications.findIndex((n) => n.id === id);
                if (index !== -1) {
                  if (!state.notifications[index].isRead) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                  }
                  state.notifications.splice(index, 1);
                }
              },
              false,
              'dashboard/removeNotification'
            );
          },

          setKPIValues: (values) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.kpiValues = values as WritableDraft<KPIValue>[];
              },
              false,
              'dashboard/setKPIValues'
            );
          },

          updateKPIValue: (kpiId, value) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const index = state.kpiValues.findIndex((v) => v.kpiId === kpiId);
                if (index !== -1) {
                  Object.assign(state.kpiValues[index], value);
                }
              },
              false,
              'dashboard/updateKPIValue'
            );
          },

          setQuickReports: (reports) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.quickReports = reports as WritableDraft<QuickReport>[];
              },
              false,
              'dashboard/setQuickReports'
            );
          },

          // ============================================
          // FILTER ACTIONS
          // ============================================

          setFilter: (filter) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                Object.assign(state.filter, filter);
              },
              false,
              'dashboard/setFilter'
            );
          },

          setDateRange: (preset) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                const now = new Date();
                let start: Date;
                let end: Date = now;

                switch (preset) {
                  case 'today':
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                  case 'yesterday':
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
                    break;
                  case 'this_week':
                    const dayOfWeek = now.getDay();
                    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
                    break;
                  case 'last_week':
                    const lastWeekStart = now.getDate() - now.getDay() - 7;
                    start = new Date(now.getFullYear(), now.getMonth(), lastWeekStart);
                    end = new Date(now.getFullYear(), now.getMonth(), lastWeekStart + 6, 23, 59, 59);
                    break;
                  case 'this_month':
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                  case 'last_month':
                    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                    break;
                  case 'this_quarter':
                    const quarterStart = Math.floor(now.getMonth() / 3) * 3;
                    start = new Date(now.getFullYear(), quarterStart, 1);
                    break;
                  case 'last_quarter':
                    const lastQuarterStart = Math.floor(now.getMonth() / 3) * 3 - 3;
                    start = new Date(now.getFullYear(), lastQuarterStart, 1);
                    end = new Date(now.getFullYear(), lastQuarterStart + 3, 0, 23, 59, 59);
                    break;
                  case 'this_year':
                    start = new Date(now.getFullYear(), 0, 1);
                    break;
                  case 'last_year':
                    start = new Date(now.getFullYear() - 1, 0, 1);
                    end = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
                    break;
                  default:
                    start = new Date(now.getFullYear(), now.getMonth(), 1);
                }

                state.filter.dateRange = {
                  start: start.toISOString(),
                  end: end.toISOString(),
                  preset,
                };
              },
              false,
              'dashboard/setDateRange'
            );
          },

          resetFilter: () => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.filter = {
                  dateRange: getDefaultDateRange(),
                };
              },
              false,
              'dashboard/resetFilter'
            );
          },

          // ============================================
          // PREFERENCE ACTIONS
          // ============================================

          setPreferences: (preferences) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.preferences = preferences;
              },
              false,
              'dashboard/setPreferences'
            );
          },

          updatePreferences: (updates) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                if (state.preferences) {
                  Object.assign(state.preferences, updates);
                }
              },
              false,
              'dashboard/updatePreferences'
            );
          },

          addFavoriteWidget: (widgetType) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                if (state.preferences && !state.preferences.favoriteWidgets.includes(widgetType)) {
                  state.preferences.favoriteWidgets.push(widgetType);
                }
              },
              false,
              'dashboard/addFavoriteWidget'
            );
          },

          removeFavoriteWidget: (widgetType) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                if (state.preferences) {
                  state.preferences.favoriteWidgets = state.preferences.favoriteWidgets.filter(
                    (w) => w !== widgetType
                  );
                }
              },
              false,
              'dashboard/removeFavoriteWidget'
            );
          },

          pinAction: (actionId) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                if (state.preferences && !state.preferences.pinnedActions.includes(actionId)) {
                  state.preferences.pinnedActions.push(actionId);
                }
              },
              false,
              'dashboard/pinAction'
            );
          },

          unpinAction: (actionId) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                if (state.preferences) {
                  state.preferences.pinnedActions = state.preferences.pinnedActions.filter(
                    (a) => a !== actionId
                  );
                }
              },
              false,
              'dashboard/unpinAction'
            );
          },

          // ============================================
          // UI ACTIONS
          // ============================================

          toggleEditMode: () => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.isEditMode = !state.isEditMode;
                if (!state.isEditMode) {
                  state.selectedWidgetId = null;
                }
              },
              false,
              'dashboard/toggleEditMode'
            );
          },

          setSelectedWidgetId: (id) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.selectedWidgetId = id;
              },
              false,
              'dashboard/setSelectedWidgetId'
            );
          },

          setLoading: (loading) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.isLoading = loading;
              },
              false,
              'dashboard/setLoading'
            );
          },

          setError: (error) => {
            set(
              (state: WritableDraft<DashboardState>) => {
                state.error = error;
              },
              false,
              'dashboard/setError'
            );
          },

          reset: () => {
            set(
              () => initialState,
              false,
              'dashboard/reset'
            );
          },
        }))
      ),
      {
        name: 'dashboard-storage',
        partialize: (state) => ({
          currentLayoutId: state.currentLayoutId,
          preferences: state.preferences,
          filter: state.filter,
        }),
      }
    ),
    { name: 'DashboardStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

/** Get current layout */
export const selectCurrentLayout = (state: DashboardStore) =>
  state.layouts.find((l) => l.id === state.currentLayoutId);

/** Get visible widgets */
export const selectVisibleWidgets = (state: DashboardStore) =>
  state.widgets.filter((w) => w.isVisible);

/** Get widget by ID */
export const selectWidgetById = (id: string) => (state: DashboardStore) =>
  state.widgets.find((w) => w.id === id);

/** Get widget data */
export const selectWidgetData = (id: string) => (state: DashboardStore) =>
  state.widgetData.get(id);

/** Check if widget is loading */
export const selectIsWidgetLoading = (id: string) => (state: DashboardStore) =>
  state.loadingWidgets.has(id);

/** Get unread notifications */
export const selectUnreadNotifications = (state: DashboardStore) =>
  state.notifications.filter((n) => !n.isRead);

/** Get notifications by category */
export const selectNotificationsByCategory = (category: string) => (state: DashboardStore) =>
  state.notifications.filter((n) => n.category === category);

/** Get KPI value by ID */
export const selectKPIValue = (kpiId: string) => (state: DashboardStore) =>
  state.kpiValues.find((v) => v.kpiId === kpiId);

/** Check if in edit mode */
export const selectIsEditMode = (state: DashboardStore) => state.isEditMode;

/** Get pinned actions */
export const selectPinnedActions = (state: DashboardStore) =>
  state.preferences?.pinnedActions || [];
