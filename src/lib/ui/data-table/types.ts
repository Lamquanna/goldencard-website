// ============================================================================
// UI LIBRARY - DATA TABLE - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Advanced Data Table Types
// ============================================================================

import React from 'react';

// ============================================================================
// COLUMN TYPES
// ============================================================================

/** Column definition */
export interface ColumnDef<T> {
  /** Unique column identifier */
  id: string;
  /** Column header */
  header: string | React.ReactNode | ((props: HeaderRenderProps<T>) => React.ReactNode);
  /** Accessor key or function */
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  /** Cell renderer */
  cell?: (props: CellRenderProps<T>) => React.ReactNode;
  /** Footer renderer */
  footer?: string | React.ReactNode | ((props: FooterRenderProps<T>) => React.ReactNode);
  /** Column width */
  width?: number | string;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Is column sortable */
  sortable?: boolean;
  /** Custom sort function */
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
  /** Is column filterable */
  filterable?: boolean;
  /** Filter type */
  filterType?: FilterType;
  /** Filter options (for select filter) */
  filterOptions?: FilterOption[];
  /** Is column resizable */
  resizable?: boolean;
  /** Is column visible by default */
  visible?: boolean;
  /** Is column pinned */
  pinned?: 'left' | 'right';
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Enable column grouping */
  enableGrouping?: boolean;
  /** Aggregation function for grouping */
  aggregationFn?: AggregationFn;
  /** Custom class name */
  className?: string;
  /** Header class name */
  headerClassName?: string;
  /** Cell class name */
  cellClassName?: string | ((props: CellRenderProps<T>) => string);
  /** Meta data */
  meta?: Record<string, unknown>;
}

/** Column group */
export interface ColumnGroup<T> {
  id: string;
  header: string | React.ReactNode;
  columns: (ColumnDef<T> | ColumnGroup<T>)[];
}

// ============================================================================
// RENDER PROPS
// ============================================================================

/** Header render props */
export interface HeaderRenderProps<T> {
  column: ColumnDef<T>;
  table: TableInstance<T>;
}

/** Cell render props */
export interface CellRenderProps<T> {
  row: T;
  rowIndex: number;
  column: ColumnDef<T>;
  value: unknown;
  table: TableInstance<T>;
}

/** Footer render props */
export interface FooterRenderProps<T> {
  column: ColumnDef<T>;
  data: T[];
  table: TableInstance<T>;
}

// ============================================================================
// SORTING
// ============================================================================

/** Sort direction */
export type SortDirection = 'asc' | 'desc';

/** Sort state */
export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/** Multi-sort state */
export type SortingState = SortState[];

// ============================================================================
// FILTERING
// ============================================================================

/** Filter type */
export type FilterType = 
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'dateRange'
  | 'boolean'
  | 'custom';

/** Filter option */
export interface FilterOption {
  value: string | number;
  label: string;
}

/** Filter value */
export interface FilterValue {
  columnId: string;
  value: unknown;
  operator?: FilterOperator;
}

/** Filter operator */
export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterOrEqual'
  | 'lessOrEqual'
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

/** Filter state */
export type FilteringState = FilterValue[];

/** Global filter state */
export interface GlobalFilterState {
  value: string;
  columns?: string[];
}

// ============================================================================
// PAGINATION
// ============================================================================

/** Pagination state */
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

/** Pagination info */
export interface PaginationInfo {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
}

// ============================================================================
// ROW SELECTION
// ============================================================================

/** Selection mode */
export type SelectionMode = 'single' | 'multiple' | 'none';

/** Row selection state */
export interface RowSelectionState {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}

// ============================================================================
// ROW EXPANSION
// ============================================================================

/** Row expansion state */
export interface RowExpansionState {
  expandedIds: Set<string>;
}

// ============================================================================
// GROUPING
// ============================================================================

/** Grouping state */
export interface GroupingState {
  groupBy: string[];
}

/** Aggregation function */
export type AggregationFn = 
  | 'sum'
  | 'min'
  | 'max'
  | 'count'
  | 'mean'
  | 'median'
  | 'unique'
  | 'uniqueCount'
  | ((values: unknown[]) => unknown);

// ============================================================================
// COLUMN VISIBILITY
// ============================================================================

/** Column visibility state */
export type ColumnVisibilityState = Record<string, boolean>;

// ============================================================================
// COLUMN ORDER
// ============================================================================

/** Column order state */
export type ColumnOrderState = string[];

// ============================================================================
// COLUMN SIZING
// ============================================================================

/** Column sizing state */
export type ColumnSizingState = Record<string, number>;

// ============================================================================
// TABLE INSTANCE
// ============================================================================

/** Table instance (API) */
export interface TableInstance<T> {
  // Data
  data: T[];
  columns: ColumnDef<T>[];
  
  // State
  sorting: SortingState;
  filtering: FilteringState;
  globalFilter: GlobalFilterState;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
  rowExpansion: RowExpansionState;
  grouping: GroupingState;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
  
  // Computed
  rows: TableRow<T>[];
  flatRows: TableRow<T>[];
  paginationInfo: PaginationInfo;
  visibleColumns: ColumnDef<T>[];
  
  // Sorting
  setSorting: (sorting: SortingState | ((prev: SortingState) => SortingState)) => void;
  toggleSort: (columnId: string, desc?: boolean) => void;
  clearSort: () => void;
  
  // Filtering
  setFiltering: (filtering: FilteringState | ((prev: FilteringState) => FilteringState)) => void;
  setColumnFilter: (columnId: string, value: unknown) => void;
  clearColumnFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  setGlobalFilter: (value: string) => void;
  
  // Pagination
  setPagination: (pagination: PaginationState | ((prev: PaginationState) => PaginationState)) => void;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  
  // Row selection
  setRowSelection: (selection: RowSelectionState | ((prev: RowSelectionState) => RowSelectionState)) => void;
  toggleRowSelection: (rowId: string) => void;
  selectRow: (rowId: string) => void;
  deselectRow: (rowId: string) => void;
  selectAllRows: () => void;
  deselectAllRows: () => void;
  toggleAllRowsSelection: () => void;
  getSelectedRows: () => T[];
  
  // Row expansion
  setRowExpansion: (expansion: RowExpansionState | ((prev: RowExpansionState) => RowExpansionState)) => void;
  toggleRowExpansion: (rowId: string) => void;
  expandRow: (rowId: string) => void;
  collapseRow: (rowId: string) => void;
  expandAllRows: () => void;
  collapseAllRows: () => void;
  
  // Grouping
  setGrouping: (grouping: GroupingState | ((prev: GroupingState) => GroupingState)) => void;
  toggleGroupBy: (columnId: string) => void;
  clearGrouping: () => void;
  
  // Column visibility
  setColumnVisibility: (visibility: ColumnVisibilityState | ((prev: ColumnVisibilityState) => ColumnVisibilityState)) => void;
  toggleColumnVisibility: (columnId: string) => void;
  showColumn: (columnId: string) => void;
  hideColumn: (columnId: string) => void;
  showAllColumns: () => void;
  hideAllColumns: () => void;
  
  // Column order
  setColumnOrder: (order: ColumnOrderState | ((prev: ColumnOrderState) => ColumnOrderState)) => void;
  moveColumn: (columnId: string, toIndex: number) => void;
  
  // Column sizing
  setColumnSizing: (sizing: ColumnSizingState | ((prev: ColumnSizingState) => ColumnSizingState)) => void;
  setColumnSize: (columnId: string, size: number) => void;
  resetColumnSizing: () => void;
  
  // Utils
  getRowId: (row: T) => string;
  getCellValue: (row: T, columnId: string) => unknown;
  resetState: () => void;
}

/** Table row */
export interface TableRow<T> {
  id: string;
  original: T;
  index: number;
  depth: number;
  isGrouped: boolean;
  isExpanded: boolean;
  isSelected: boolean;
  subRows?: TableRow<T>[];
  groupValue?: unknown;
  aggregatedValues?: Record<string, unknown>;
}

// ============================================================================
// TABLE OPTIONS
// ============================================================================

/** Table options */
export interface TableOptions<T> {
  /** Data array */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Get row ID */
  getRowId?: (row: T) => string;
  /** Initial state */
  initialState?: Partial<TableState>;
  /** Enable manual sorting (server-side) */
  manualSorting?: boolean;
  /** Enable manual filtering (server-side) */
  manualFiltering?: boolean;
  /** Enable manual pagination (server-side) */
  manualPagination?: boolean;
  /** Total row count (for manual pagination) */
  totalRows?: number;
  /** Selection mode */
  selectionMode?: SelectionMode;
  /** Enable row expansion */
  enableRowExpansion?: boolean;
  /** Get sub rows */
  getSubRows?: (row: T) => T[] | undefined;
  /** Enable grouping */
  enableGrouping?: boolean;
  /** Enable column resizing */
  enableColumnResizing?: boolean;
  /** Enable column reordering */
  enableColumnReordering?: boolean;
  /** Enable virtualization */
  enableVirtualization?: boolean;
  /** Row height (for virtualization) */
  rowHeight?: number;
  /** Overscan count (for virtualization) */
  overscan?: number;
  /** On state change */
  onStateChange?: (state: TableState) => void;
  /** On sorting change */
  onSortingChange?: (sorting: SortingState) => void;
  /** On filtering change */
  onFilteringChange?: (filtering: FilteringState) => void;
  /** On pagination change */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** On row selection change */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** On row click */
  onRowClick?: (row: T, event: React.MouseEvent) => void;
  /** On row double click */
  onRowDoubleClick?: (row: T, event: React.MouseEvent) => void;
}

/** Table state */
export interface TableState {
  sorting: SortingState;
  filtering: FilteringState;
  globalFilter: GlobalFilterState;
  pagination: PaginationState;
  rowSelection: RowSelectionState;
  rowExpansion: RowExpansionState;
  grouping: GroupingState;
  columnVisibility: ColumnVisibilityState;
  columnOrder: ColumnOrderState;
  columnSizing: ColumnSizingState;
}

// ============================================================================
// TABLE PROPS
// ============================================================================

/** Table component props */
export interface DataTableProps<T> {
  /** Table instance */
  table: TableInstance<T>;
  /** Loading state */
  loading?: boolean;
  /** Empty message */
  emptyMessage?: string | React.ReactNode;
  /** Error message */
  error?: string | React.ReactNode;
  /** Show pagination */
  showPagination?: boolean;
  /** Show column visibility toggle */
  showColumnToggle?: boolean;
  /** Show global filter */
  showGlobalFilter?: boolean;
  /** Show density toggle */
  showDensityToggle?: boolean;
  /** Show export button */
  showExport?: boolean;
  /** Export formats */
  exportFormats?: ('csv' | 'excel' | 'pdf')[];
  /** On export */
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  /** Table density */
  density?: 'compact' | 'normal' | 'comfortable';
  /** Stripe rows */
  striped?: boolean;
  /** Hoverable rows */
  hoverable?: boolean;
  /** Bordered */
  bordered?: boolean;
  /** Sticky header */
  stickyHeader?: boolean;
  /** Table height (for sticky header / virtualization) */
  height?: number | string;
  /** Custom class name */
  className?: string;
  /** Row class name */
  rowClassName?: string | ((row: T, index: number) => string);
  /** Header class name */
  headerClassName?: string;
  /** Body class name */
  bodyClassName?: string;
  /** Footer class name */
  footerClassName?: string;
  /** Render row expansion content */
  renderExpansion?: (row: T) => React.ReactNode;
  /** Render row actions */
  renderRowActions?: (row: T) => React.ReactNode;
  /** Toolbar content */
  toolbar?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

/** Export options */
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filename?: string;
  columns?: string[];
  includeHeaders?: boolean;
  selectedOnly?: boolean;
}
