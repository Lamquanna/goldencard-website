// ============================================================================
// UI LIBRARY - FORM BUILDER - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Dynamic Form Builder Types
// ============================================================================

// ============================================================================
// FIELD TYPES
// ============================================================================

/** Field types supported by form builder */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'rating'
  | 'file'
  | 'image'
  | 'color'
  | 'rich_text'
  | 'markdown'
  | 'code'
  | 'json'
  | 'currency'
  | 'percentage'
  | 'autocomplete'
  | 'combobox'
  | 'tags'
  | 'address'
  | 'location'
  | 'signature'
  | 'hidden'
  | 'group'
  | 'array'
  | 'custom';

// ============================================================================
// FIELD CONFIGURATION
// ============================================================================

/** Base field configuration */
export interface BaseFieldConfig {
  /** Unique field identifier */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: FieldType;
  /** Help text/description */
  description?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Default value */
  defaultValue?: unknown;
  /** Is field required */
  required?: boolean;
  /** Is field disabled */
  disabled?: boolean;
  /** Is field readonly */
  readOnly?: boolean;
  /** Is field hidden */
  hidden?: boolean;
  /** Custom CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Validation rules */
  validation?: ValidationRule[];
  /** Conditional visibility */
  conditions?: FieldCondition[];
  /** Field width (grid columns) */
  width?: 1 | 2 | 3 | 4 | 6 | 12;
  /** Custom render function */
  render?: (props: FieldRenderProps) => React.ReactNode;
}

/** Text field config */
export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'email' | 'password' | 'phone' | 'url';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  prefix?: string;
  suffix?: string;
  showCount?: boolean;
}

/** Textarea field config */
export interface TextareaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  rows?: number;
  minRows?: number;
  maxRows?: number;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

/** Number field config */
export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number' | 'currency' | 'percentage';
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  prefix?: string;
  suffix?: string;
  thousandSeparator?: boolean;
}

/** Date/time field config */
export interface DateTimeFieldConfig extends BaseFieldConfig {
  type: 'date' | 'time' | 'datetime';
  minDate?: string;
  maxDate?: string;
  format?: string;
  showTime?: boolean;
  disabledDates?: string[];
  disabledDays?: number[];
}

/** Select field config */
export interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select' | 'multiselect' | 'radio' | 'checkbox';
  options: SelectOption[];
  optionsSource?: OptionsSource;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  groupBy?: string;
  maxSelection?: number;
}

/** Select option */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/** Options source for dynamic loading */
export interface OptionsSource {
  type: 'api' | 'store' | 'static';
  endpoint?: string;
  storeSelector?: string;
  params?: Record<string, unknown>;
  labelField?: string;
  valueField?: string;
  dependsOn?: string[];
}

/** File upload field config */
export interface FileFieldConfig extends BaseFieldConfig {
  type: 'file' | 'image';
  accept?: string[];
  maxSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  uploadUrl?: string;
  preview?: boolean;
  crop?: boolean;
  cropAspectRatio?: number;
}

/** Slider field config */
export interface SliderFieldConfig extends BaseFieldConfig {
  type: 'slider';
  min?: number;
  max?: number;
  step?: number;
  range?: boolean;
  marks?: SliderMark[];
  showValue?: boolean;
}

/** Slider mark */
export interface SliderMark {
  value: number;
  label?: string;
}

/** Rating field config */
export interface RatingFieldConfig extends BaseFieldConfig {
  type: 'rating';
  count?: number;
  allowHalf?: boolean;
  character?: string;
  color?: string;
}

/** Autocomplete field config */
export interface AutocompleteFieldConfig extends BaseFieldConfig {
  type: 'autocomplete' | 'combobox' | 'tags';
  source: OptionsSource;
  minChars?: number;
  debounce?: number;
  maxItems?: number;
  allowCustom?: boolean;
  createLabel?: string;
}

/** Group field config */
export interface GroupFieldConfig extends BaseFieldConfig {
  type: 'group';
  fields: FieldConfig[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  border?: boolean;
}

/** Array field config */
export interface ArrayFieldConfig extends BaseFieldConfig {
  type: 'array';
  itemField: FieldConfig;
  minItems?: number;
  maxItems?: number;
  addLabel?: string;
  removeLabel?: string;
  sortable?: boolean;
  confirmRemove?: boolean;
}

/** Custom field config */
export interface CustomFieldConfig extends BaseFieldConfig {
  type: 'custom';
  component: string | React.ComponentType<FieldRenderProps>;
  props?: Record<string, unknown>;
}

/** Union type for all field configs */
export type FieldConfig =
  | TextFieldConfig
  | TextareaFieldConfig
  | NumberFieldConfig
  | DateTimeFieldConfig
  | SelectFieldConfig
  | FileFieldConfig
  | SliderFieldConfig
  | RatingFieldConfig
  | AutocompleteFieldConfig
  | GroupFieldConfig
  | ArrayFieldConfig
  | CustomFieldConfig
  | (BaseFieldConfig & { type: FieldType });

// ============================================================================
// VALIDATION
// ============================================================================

/** Validation rule */
export interface ValidationRule {
  type: ValidationType;
  value?: unknown;
  message?: string;
}

/** Validation types */
export type ValidationType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'phone'
  | 'date'
  | 'custom';

/** Validation error */
export interface ValidationError {
  field: string;
  type: ValidationType;
  message: string;
}

/** Custom validator function */
export type CustomValidator = (
  value: unknown,
  formValues: Record<string, unknown>,
  fieldConfig: FieldConfig
) => string | null | Promise<string | null>;

// ============================================================================
// CONDITIONS
// ============================================================================

/** Field condition for conditional visibility/behavior */
export interface FieldCondition {
  /** Field to check */
  field: string;
  /** Condition operator */
  operator: ConditionOperator;
  /** Value to compare */
  value: unknown;
  /** Action when condition is met */
  action: ConditionAction;
}

/** Condition operators */
export type ConditionOperator =
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
  | 'isEmpty'
  | 'isNotEmpty'
  | 'in'
  | 'notIn';

/** Condition actions */
export type ConditionAction = 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'unrequire';

// ============================================================================
// FORM SCHEMA
// ============================================================================

/** Form schema definition */
export interface FormSchema {
  /** Schema ID */
  id: string;
  /** Schema name */
  name: string;
  /** Schema description */
  description?: string;
  /** Form fields */
  fields: FieldConfig[];
  /** Form layout */
  layout?: FormLayout;
  /** Default values */
  defaultValues?: Record<string, unknown>;
  /** Global validation */
  validation?: FormValidation;
  /** Submit configuration */
  submit?: SubmitConfig;
  /** Form metadata */
  metadata?: Record<string, unknown>;
}

/** Form layout configuration */
export interface FormLayout {
  /** Layout type */
  type: 'vertical' | 'horizontal' | 'inline' | 'grid';
  /** Grid columns */
  columns?: number;
  /** Label placement */
  labelPosition?: 'top' | 'left' | 'right';
  /** Label width */
  labelWidth?: number | string;
  /** Gap between fields */
  gap?: number | string;
  /** Sections */
  sections?: FormSection[];
}

/** Form section */
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[]; // field names in this section
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  icon?: string;
}

/** Form-level validation */
export interface FormValidation {
  /** Validate all fields on blur */
  validateOnBlur?: boolean;
  /** Validate all fields on change */
  validateOnChange?: boolean;
  /** Validate on submit */
  validateOnSubmit?: boolean;
  /** Custom form validator */
  customValidator?: (values: Record<string, unknown>) => Record<string, string> | null;
}

/** Submit configuration */
export interface SubmitConfig {
  /** Submit button label */
  label?: string;
  /** Loading label */
  loadingLabel?: string;
  /** Submit action */
  action?: 'api' | 'custom';
  /** API endpoint */
  endpoint?: string;
  /** HTTP method */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Transform values before submit */
  transform?: (values: Record<string, unknown>) => Record<string, unknown>;
  /** Success message */
  successMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Redirect on success */
  redirectTo?: string;
}

// ============================================================================
// RENDER PROPS
// ============================================================================

/** Props passed to custom field renderers */
export interface FieldRenderProps {
  field: FieldConfig;
  value: unknown;
  error?: string;
  touched: boolean;
  disabled: boolean;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  onFocus: () => void;
}

/** Form render props */
export interface FormRenderProps {
  /** Form values */
  values: Record<string, unknown>;
  /** Form errors */
  errors: Record<string, string>;
  /** Touched fields */
  touched: Record<string, boolean>;
  /** Form dirty state */
  isDirty: boolean;
  /** Form submitting state */
  isSubmitting: boolean;
  /** Form valid state */
  isValid: boolean;
  /** Set field value */
  setFieldValue: (name: string, value: unknown) => void;
  /** Set field touched */
  setFieldTouched: (name: string, touched?: boolean) => void;
  /** Set field error */
  setFieldError: (name: string, error: string) => void;
  /** Reset form */
  reset: () => void;
  /** Submit form */
  submit: () => Promise<void>;
}

// ============================================================================
// FORM STATE
// ============================================================================

/** Form state */
export interface FormState {
  /** Current values */
  values: Record<string, unknown>;
  /** Initial values */
  initialValues: Record<string, unknown>;
  /** Field errors */
  errors: Record<string, string>;
  /** Touched fields */
  touched: Record<string, boolean>;
  /** Is form dirty */
  isDirty: boolean;
  /** Is form submitting */
  isSubmitting: boolean;
  /** Submit count */
  submitCount: number;
  /** Visible fields (based on conditions) */
  visibleFields: string[];
  /** Enabled fields (based on conditions) */
  enabledFields: string[];
}

// ============================================================================
// FORM BUILDER CONTEXT
// ============================================================================

/** Form builder context value */
export interface FormBuilderContextValue {
  /** Form schema */
  schema: FormSchema;
  /** Form state */
  state: FormState;
  /** Register custom component */
  registerComponent: (type: string, component: React.ComponentType<FieldRenderProps>) => void;
  /** Register custom validator */
  registerValidator: (type: string, validator: CustomValidator) => void;
  /** Get field config */
  getFieldConfig: (name: string) => FieldConfig | undefined;
  /** Get field value */
  getFieldValue: (name: string) => unknown;
  /** Set field value */
  setFieldValue: (name: string, value: unknown) => void;
  /** Validate field */
  validateField: (name: string) => Promise<string | null>;
  /** Validate form */
  validateForm: () => Promise<boolean>;
}
