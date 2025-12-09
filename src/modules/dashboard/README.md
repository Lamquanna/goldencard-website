# Dashboard Module

## Overview

The Dashboard module provides the main home page for the GoldenEnergy HOME platform, displaying aggregated data from all enabled modules with RBAC-controlled access.

## Architecture

```
src/modules/dashboard/
├── index.ts          # Barrel exports
├── types.ts          # TypeScript definitions
├── store.ts          # Zustand state management
├── services.ts       # API service classes
├── api.ts            # Aggregated data fetching
└── __tests__/        # Unit tests

src/components/dashboard/
├── DashboardHome.tsx       # Main dashboard page
├── DashboardSettings.tsx   # Settings sheet
├── SummaryCard.tsx         # KPI metric card
├── ChartCard.tsx           # Chart widget
├── TaskList.tsx            # Personal tasks
├── ActivityFeed.tsx        # Activity timeline
├── QuickActions.tsx        # Quick action buttons
├── WidgetWrapper.tsx       # Draggable widget container
├── CalendarPreview.tsx     # Calendar widget
├── NotificationPanel.tsx   # Notifications
├── locale.ts               # Vietnamese strings
└── __tests__/              # Component tests
```

## Data Flow

### Fetching Data

The dashboard fetches data from multiple module stores using the `dashboardAPI`:

```typescript
import { dashboardAPI } from '@/modules/dashboard/api';

// Fetch all overview data in parallel
const data = await dashboardAPI.fetchOverview(userId);

// Or fetch specific data
const kpis = await dashboardAPI.fetchKPIs();
const analytics = await dashboardAPI.fetchModuleAnalytics('crm', '30d');
```

### Module Integration

The dashboard integrates with these module stores:

- **CRM** (`@/modules/crm/store`) - Leads, deals, contacts
- **HRM** (`@/modules/hrm/store`) - Employees, attendance
- **Projects** (`@/modules/projects/store`) - Projects, tasks
- **Inventory** (`@/modules/inventory/store`) - Products, stock
- **Finance** (`@/modules/finance/store`) - Invoices, expenses
- **Admin** (`@/modules/admin/store`) - System settings

### RBAC Integration

All data access is guarded by RBAC checks:

```typescript
import { hasPermission, hasModuleAccess } from '@/core/rbac';

// Check module access
if (hasModuleAccess(user, 'crm')) {
  // Render CRM widgets
}

// Check specific permission
if (hasPermission(user, 'finance.view_sensitive')) {
  // Show actual amounts
} else {
  // Show masked values
}
```

## Adding New Widgets

### 1. Define Widget Type

Add to `types.ts`:

```typescript
export type WidgetType =
  | 'existing_types'
  | 'your_new_widget';

export interface YourWidgetConfig {
  type: 'your_new_widget';
  // config options
}
```

### 2. Create Widget Component

Create `YourWidget.tsx`:

```typescript
'use client';

import { WidgetWrapper } from './WidgetWrapper';
import type { Widget } from '@/modules/dashboard/types';

interface YourWidgetProps {
  widget: Widget;
  onRefresh?: () => void;
}

export function YourWidget({ widget, onRefresh }: YourWidgetProps) {
  return (
    <WidgetWrapper
      widget={widget}
      onRefresh={onRefresh}
    >
      {/* Widget content */}
    </WidgetWrapper>
  );
}
```

### 3. Register Widget in DashboardHome

Add to the widget renderer in `DashboardHome.tsx`:

```typescript
case 'your_new_widget':
  return <YourWidget widget={widget} />;
```

### 4. Add Default Widget

Add to default widgets in `store.ts`:

```typescript
const DEFAULT_WIDGETS: Widget[] = [
  // ...existing widgets
  {
    id: 'your-widget',
    type: 'your_new_widget',
    title: 'Your Widget',
    size: 'medium',
    position: { x: 0, y: 0, w: 4, h: 3 },
    config: { type: 'your_new_widget' },
    isVisible: true,
  },
];
```

## Localization

All UI text uses the locale system:

```typescript
import { dashboardLocale as t } from './locale';

// Use in component
<h1>{t.title}</h1>
<p>{t.sections.systemOverview}</p>
```

To add new strings, edit `locale.ts` and `src/locales/vi/dashboard.json`.

## Performance Considerations

1. **Lazy Loading**: Charts load only when visible (Intersection Observer)
2. **Batched Fetches**: Use `Promise.all` for parallel requests
3. **Selectors**: Use Zustand selectors to prevent unnecessary re-renders
4. **Caching**: API responses cached via middleware

```typescript
// Good: Use selectors
const visibleWidgets = useDashboardStore(selectVisibleWidgets);

// Avoid: Selecting entire state
const store = useDashboardStore();
```

## Testing

Run tests:

```bash
# Store tests
npx vitest run src/modules/dashboard/__tests__/store.spec.ts

# Component tests
npx vitest run src/components/dashboard/__tests__/DashboardHome.spec.ts
```

## API Endpoints

The dashboard expects these API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard/overview` | GET | System overview KPIs |
| `/api/dashboard/tasks/summary` | GET | User task summary |
| `/api/dashboard/activities` | GET | Recent activities |
| `/api/dashboard/calendar/upcoming` | GET | Upcoming events |
| `/api/dashboard/analytics/:module` | GET | Module analytics |
| `/api/dashboard/kpis` | GET | All KPI values |
| `/api/dashboard/layouts` | GET/PUT | User layouts |
| `/api/dashboard/preferences` | GET/PUT | User preferences |
| `/api/dashboard/widgets/:id` | PUT | Widget config |

If an endpoint is unavailable, the API falls back to mock data.

## Configuration

Dashboard behavior can be configured via preferences:

```typescript
interface DashboardPreferences {
  refreshInterval: number;    // Auto-refresh interval (seconds)
  compactMode: boolean;       // Compact widget display
  showNotifications: boolean; // Show notification widget
  defaultDateRange: string;   // Default time filter
  pinnedWidgets: string[];    // Always-visible widgets
}
```
