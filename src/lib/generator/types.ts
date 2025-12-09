// ============================================================================
// MODULE TEMPLATE GENERATOR - TYPE DEFINITIONS
// GoldenEnergy HOME Platform - Standardized Module Scaffolding
// ============================================================================

// ============================================================================
// MODULE METADATA TYPES
// ============================================================================

/** Module category */
export type ModuleCategory =
  | 'core'
  | 'crm'
  | 'hrm'
  | 'projects'
  | 'inventory'
  | 'finance'
  | 'admin'
  | 'custom';

/** Module status */
export type ModuleStatus = 'draft' | 'development' | 'testing' | 'production' | 'deprecated';

/** Module metadata */
export interface ModuleMetadata {
  /** Unique module ID (kebab-case) */
  id: string;
  /** Display name */
  name: string;
  /** Module description */
  description: string;
  /** Version (semver) */
  version: string;
  /** Module category */
  category: ModuleCategory;
  /** Current status */
  status: ModuleStatus;
  /** Author/team */
  author?: string;
  /** Module icon (Lucide icon name) */
  icon?: string;
  /** Module color (Tailwind color) */
  color?: string;
  /** Dependencies on other modules */
  dependencies?: string[];
  /** Tags for search/categorization */
  tags?: string[];
  /** Creation date */
  createdAt?: Date;
  /** Last update date */
  updatedAt?: Date;
}

// ============================================================================
// ENTITY/MODEL TYPES
// ============================================================================

/** Field type */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'enum'
  | 'relation'
  | 'json'
  | 'text'
  | 'email'
  | 'phone'
  | 'url'
  | 'uuid'
  | 'money';

/** Field validation rule */
export interface FieldValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  email?: boolean;
  url?: boolean;
  custom?: string; // Custom validation function name
}

/** Entity field definition */
export interface EntityField {
  /** Field name (camelCase) */
  name: string;
  /** Display label */
  label: string;
  /** Field type */
  type: FieldType;
  /** Default value */
  defaultValue?: unknown;
  /** Is this field nullable? */
  nullable?: boolean;
  /** Is this field unique? */
  unique?: boolean;
  /** Is this field indexed? */
  indexed?: boolean;
  /** Enum values (for enum type) */
  enumValues?: string[];
  /** Relation config (for relation type) */
  relation?: {
    model: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
    foreignKey?: string;
  };
  /** Field validation */
  validation?: FieldValidation;
  /** Field description */
  description?: string;
  /** Should this field be searchable? */
  searchable?: boolean;
  /** Should this field be sortable? */
  sortable?: boolean;
  /** Should this field be filterable? */
  filterable?: boolean;
  /** Is this a system field (not editable by user)? */
  system?: boolean;
}

/** Entity definition */
export interface EntityDefinition {
  /** Entity name (PascalCase) */
  name: string;
  /** Display name (singular) */
  displayName: string;
  /** Display name (plural) */
  displayNamePlural: string;
  /** Entity description */
  description?: string;
  /** Entity fields */
  fields: EntityField[];
  /** Primary key field(s) */
  primaryKey?: string | string[];
  /** Soft delete field */
  softDelete?: boolean;
  /** Timestamp fields */
  timestamps?: boolean;
  /** Table name override */
  tableName?: string;
}

// ============================================================================
// API ENDPOINT TYPES
// ============================================================================

/** HTTP method */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** API parameter source */
export type ParameterSource = 'path' | 'query' | 'body' | 'header';

/** API parameter definition */
export interface ApiParameter {
  name: string;
  type: string;
  source: ParameterSource;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
}

/** API endpoint definition */
export interface ApiEndpoint {
  /** Endpoint name */
  name: string;
  /** HTTP method */
  method: HttpMethod;
  /** URL path (relative to module base) */
  path: string;
  /** Description */
  description?: string;
  /** Parameters */
  parameters?: ApiParameter[];
  /** Request body type */
  requestBody?: string;
  /** Response type */
  responseType?: string;
  /** Requires authentication */
  auth?: boolean;
  /** Required permissions */
  permissions?: string[];
  /** Rate limit */
  rateLimit?: {
    requests: number;
    window: number; // seconds
  };
}

// ============================================================================
// UI COMPONENT TYPES
// ============================================================================

/** Page layout type */
export type PageLayout = 'list' | 'detail' | 'form' | 'dashboard' | 'settings' | 'custom';

/** Component type */
export type ComponentType =
  | 'page'
  | 'form'
  | 'table'
  | 'card'
  | 'modal'
  | 'sidebar'
  | 'widget'
  | 'chart';

/** Page definition */
export interface PageDefinition {
  /** Page name (kebab-case) */
  name: string;
  /** Page title */
  title: string;
  /** Page path (relative to module) */
  path: string;
  /** Page layout type */
  layout: PageLayout;
  /** Page description */
  description?: string;
  /** Related entity */
  entity?: string;
  /** Parent page (for nested routes) */
  parent?: string;
  /** Is this the index page? */
  index?: boolean;
  /** Page permissions */
  permissions?: string[];
  /** Page components */
  components?: string[];
}

/** Form field UI config */
export interface FormFieldConfig {
  /** Field name */
  name: string;
  /** Component type override */
  component?: string;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  helpText?: string;
  /** Is hidden? */
  hidden?: boolean;
  /** Is disabled? */
  disabled?: boolean;
  /** Is read-only? */
  readOnly?: boolean;
  /** Column span (1-12) */
  colSpan?: number;
  /** Row position */
  row?: number;
}

/** Table column UI config */
export interface TableColumnConfig {
  /** Field name */
  name: string;
  /** Column header */
  header?: string;
  /** Column width */
  width?: string | number;
  /** Cell alignment */
  align?: 'left' | 'center' | 'right';
  /** Cell formatter */
  formatter?: string;
  /** Is hidden by default? */
  hidden?: boolean;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

/** Permission action */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export' | 'import' | 'admin';

/** Permission definition */
export interface PermissionDefinition {
  /** Permission ID */
  id: string;
  /** Permission name */
  name: string;
  /** Permission description */
  description?: string;
  /** Related entity */
  entity?: string;
  /** Permission action */
  action: PermissionAction;
}

// ============================================================================
// NAVIGATION TYPES
// ============================================================================

/** Navigation item */
export interface NavigationItem {
  /** Item ID */
  id: string;
  /** Display label */
  label: string;
  /** Link path */
  path?: string;
  /** Icon name */
  icon?: string;
  /** Badge text */
  badge?: string;
  /** Is divider? */
  divider?: boolean;
  /** Child items */
  children?: NavigationItem[];
  /** Required permissions */
  permissions?: string[];
}

// ============================================================================
// MODULE TEMPLATE TYPES
// ============================================================================

/** Module template definition */
export interface ModuleTemplate {
  /** Module metadata */
  metadata: ModuleMetadata;
  /** Entity definitions */
  entities: EntityDefinition[];
  /** API endpoints */
  endpoints: ApiEndpoint[];
  /** Page definitions */
  pages: PageDefinition[];
  /** Permission definitions */
  permissions: PermissionDefinition[];
  /** Navigation items */
  navigation: NavigationItem[];
  /** Form field configs */
  formConfigs?: Record<string, FormFieldConfig[]>;
  /** Table column configs */
  tableConfigs?: Record<string, TableColumnConfig[]>;
}

// ============================================================================
// GENERATOR OPTIONS
// ============================================================================

/** File generation option */
export interface FileGenerationOption {
  /** Should generate this file type? */
  enabled: boolean;
  /** Custom template override */
  template?: string;
  /** Output path override */
  outputPath?: string;
}

/** Generator options */
export interface GeneratorOptions {
  /** Output base directory */
  outputDir: string;
  /** Types file generation */
  types: FileGenerationOption;
  /** Store file generation */
  store: FileGenerationOption;
  /** API file generation */
  api: FileGenerationOption;
  /** Components generation */
  components: FileGenerationOption;
  /** Pages generation */
  pages: FileGenerationOption;
  /** Tests generation */
  tests: FileGenerationOption;
  /** Storybook stories generation */
  stories: FileGenerationOption;
  /** i18n translations generation */
  i18n: FileGenerationOption;
  /** Override existing files? */
  overwrite: boolean;
  /** Dry run (don't write files)? */
  dryRun: boolean;
  /** Verbose logging? */
  verbose: boolean;
}

// ============================================================================
// GENERATOR OUTPUT TYPES
// ============================================================================

/** Generated file info */
export interface GeneratedFile {
  /** File path (relative to output dir) */
  path: string;
  /** File content */
  content: string;
  /** File type */
  type: 'types' | 'store' | 'api' | 'component' | 'page' | 'test' | 'story' | 'i18n' | 'index';
  /** Was file created or updated? */
  action: 'created' | 'updated' | 'skipped';
}

/** Generator result */
export interface GeneratorResult {
  /** Was generation successful? */
  success: boolean;
  /** Generated files */
  files: GeneratedFile[];
  /** Errors encountered */
  errors: GeneratorError[];
  /** Warnings */
  warnings: string[];
  /** Generation duration (ms) */
  duration: number;
}

/** Generator error */
export interface GeneratorError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Related file path */
  file?: string;
  /** Error details */
  details?: unknown;
}

// ============================================================================
// TEMPLATE REGISTRY TYPES
// ============================================================================

/** Template type */
export type TemplateType =
  | 'types'
  | 'store'
  | 'api'
  | 'list-page'
  | 'detail-page'
  | 'form-page'
  | 'form-component'
  | 'table-component'
  | 'card-component'
  | 'modal-component'
  | 'test'
  | 'story'
  | 'i18n';

/** Registered template */
export interface RegisteredTemplate {
  /** Template type */
  type: TemplateType;
  /** Template name */
  name: string;
  /** Template description */
  description?: string;
  /** Template content/function */
  render: (context: TemplateContext) => string;
}

/** Template context */
export interface TemplateContext {
  /** Module template */
  module: ModuleTemplate;
  /** Current entity (if applicable) */
  entity?: EntityDefinition;
  /** Current page (if applicable) */
  page?: PageDefinition;
  /** Generator options */
  options: GeneratorOptions;
  /** Helper utilities */
  helpers: TemplateHelpers;
}

/** Template helper utilities */
export interface TemplateHelpers {
  /** Convert to PascalCase */
  toPascalCase: (str: string) => string;
  /** Convert to camelCase */
  toCamelCase: (str: string) => string;
  /** Convert to kebab-case */
  toKebabCase: (str: string) => string;
  /** Convert to UPPER_SNAKE_CASE */
  toUpperSnakeCase: (str: string) => string;
  /** Pluralize a word */
  pluralize: (str: string) => string;
  /** Singularize a word */
  singularize: (str: string) => string;
  /** Get TypeScript type from field type */
  getTsType: (fieldType: FieldType) => string;
  /** Get Zod schema from field definition */
  getZodSchema: (field: EntityField) => string;
  /** Format date */
  formatDate: (date: Date) => string;
  /** Indent text */
  indent: (text: string, spaces: number) => string;
}
