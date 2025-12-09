// ============================================================================
// MODULE TEMPLATE GENERATOR - BARREL EXPORTS
// GoldenEnergy HOME Platform - Module Code Generator
// ============================================================================

// Types
export type {
  ModuleCategory,
  ModuleStatus,
  ModuleMetadata,
  FieldType,
  FieldValidation,
  EntityField,
  EntityDefinition,
  HttpMethod,
  ParameterSource,
  ApiParameter,
  ApiEndpoint,
  PageLayout,
  ComponentType,
  PageDefinition,
  FormFieldConfig,
  TableColumnConfig,
  PermissionAction,
  PermissionDefinition,
  NavigationItem,
  ModuleTemplate,
  FileGenerationOption,
  GeneratorOptions,
  GeneratedFile,
  GeneratorResult,
  GeneratorError,
  TemplateType,
  RegisteredTemplate,
  TemplateContext,
  TemplateHelpers,
} from './types';

// Helpers
export {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toUpperSnakeCase,
  toSnakeCase,
  pluralize,
  singularize,
  getTsType,
  getPrismaType,
  getZodSchema,
  formatDate,
  indent,
  trimEmptyLines,
  createTemplateHelpers,
} from './helpers';

// Templates
export {
  getTemplate,
  getAllTemplates,
  registerTemplate,
  generateTypesTemplate,
  generateStoreTemplate,
  generateApiTemplate,
  generateIndexTemplate,
} from './templates';

// Generator
export {
  ModuleGenerator,
  generateModule,
  previewGeneration,
  createModuleTemplate,
  createEntityDefinition,
} from './generator';
