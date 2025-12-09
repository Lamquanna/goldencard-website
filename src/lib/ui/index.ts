// ============================================================================
// UI LIBRARY - INDEX (BARREL EXPORTS)
// GoldenEnergy HOME Platform - UI Library Entry Point
// ============================================================================

// ============================================================================
// FORM BUILDER
// ============================================================================

export type {
  // Field Types
  FieldType,
  BaseFieldConfig,
  TextFieldConfig,
  TextareaFieldConfig,
  NumberFieldConfig,
  DateTimeFieldConfig,
  SelectFieldConfig,
  SelectOption,
  OptionsSource,
  FileFieldConfig,
  SliderFieldConfig,
  SliderMark,
  RatingFieldConfig,
  AutocompleteFieldConfig,
  GroupFieldConfig,
  ArrayFieldConfig,
  CustomFieldConfig,
  FieldConfig,
  
  // Validation
  ValidationRule,
  ValidationType,
  ValidationError,
  CustomValidator,
  
  // Conditions
  FieldCondition,
  ConditionOperator,
  ConditionAction,
  
  // Form Schema
  FormSchema,
  FormLayout,
  FormSection,
  FormValidation,
  SubmitConfig,
  
  // Render Props
  FieldRenderProps,
  FormRenderProps,
  
  // State
  FormState,
  FormBuilderContextValue,
} from './form-builder/types';

// ============================================================================
// MODAL MANAGER
// ============================================================================

export type {
  ModalSize,
  ModalPosition,
  ModalId,
  ModalConfig,
  ModalAnimation,
  ModalRenderProps,
  ModalState,
  ModalManagerState,
  ConfirmConfig,
  ConfirmResult,
  AlertConfig,
  PromptConfig,
  PromptResult,
  ModalManagerContextValue,
  DrawerPosition,
  DrawerConfig,
  SheetSnapPoint,
  SheetConfig,
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from './modal-manager/types';

export {
  useModalStore,
  useModal,
  useModalState,
  useIsModalOpen,
  selectModals,
  selectStack,
  selectHasOpenModal,
  selectModalCount,
  selectTopModalId,
} from './modal-manager/store';

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

export type {
  ToastType,
  ToastPosition,
  ToastId,
  ToastConfig,
  ToastAction,
  ToastState,
} from './toast';

export {
  useToastStore,
  useToast,
  toast,
  selectToastsByPosition,
  selectToastCount,
  selectHasToasts,
} from './toast';

// ============================================================================
// DATA TABLE
// ============================================================================

export type {
  // Column
  ColumnDef,
  ColumnGroup,
  HeaderRenderProps,
  CellRenderProps,
  FooterRenderProps,
  
  // Sorting
  SortDirection,
  SortState,
  SortingState,
  
  // Filtering
  FilterType,
  FilterOption,
  FilterValue,
  FilterOperator,
  FilteringState,
  GlobalFilterState,
  
  // Pagination
  PaginationState,
  PaginationInfo,
  
  // Selection
  SelectionMode,
  RowSelectionState,
  
  // Expansion
  RowExpansionState,
  
  // Grouping
  GroupingState,
  AggregationFn,
  
  // Column State
  ColumnVisibilityState,
  ColumnOrderState,
  ColumnSizingState,
  
  // Table
  TableInstance,
  TableRow,
  TableOptions,
  TableState,
  DataTableProps,
  ExportOptions,
} from './data-table/types';
