// ============================================================================
// MODULE TEMPLATE GENERATOR - CODE TEMPLATES
// GoldenEnergy HOME Platform - Template Definitions
// ============================================================================

import type {
  ModuleTemplate,
  EntityDefinition,
  PageDefinition,
  TemplateContext,
  RegisteredTemplate,
  TemplateType,
} from './types';
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toUpperSnakeCase,
  pluralize,
  getTsType,
  getZodSchema,
  indent,
} from './helpers';

// ============================================================================
// TYPES TEMPLATE
// ============================================================================

function generateTypesTemplate(ctx: TemplateContext): string {
  const { module } = ctx;
  const lines: string[] = [];

  lines.push(`// ============================================================================`);
  lines.push(`// ${module.metadata.name.toUpperCase()} MODULE - TYPE DEFINITIONS`);
  lines.push(`// GoldenEnergy HOME Platform - Auto-generated types`);
  lines.push(`// ============================================================================`);
  lines.push(``);

  // Generate entity types
  for (const entity of module.entities) {
    const entityName = toPascalCase(entity.name);
    
    lines.push(`// ============================================================================`);
    lines.push(`// ${entityName.toUpperCase()} TYPES`);
    lines.push(`// ============================================================================`);
    lines.push(``);
    
    // Main interface
    lines.push(`/** ${entity.description || entity.displayName} */`);
    lines.push(`export interface ${entityName} {`);
    
    for (const field of entity.fields) {
      const tsType = field.type === 'enum' && field.enumValues
        ? field.enumValues.map(v => `'${v}'`).join(' | ')
        : getTsType(field.type);
      const optional = field.nullable ? '?' : '';
      
      if (field.description) {
        lines.push(`  /** ${field.description} */`);
      }
      lines.push(`  ${field.name}${optional}: ${tsType};`);
    }
    
    // Add timestamps if configured
    if (entity.timestamps) {
      lines.push(`  createdAt: Date;`);
      lines.push(`  updatedAt: Date;`);
    }
    
    // Add soft delete if configured
    if (entity.softDelete) {
      lines.push(`  deletedAt?: Date | null;`);
    }
    
    lines.push(`}`);
    lines.push(``);
    
    // Create input type
    lines.push(`/** Create ${entity.displayName} input */`);
    lines.push(`export interface Create${entityName}Input {`);
    for (const field of entity.fields.filter(f => !f.system)) {
      const tsType = field.type === 'enum' && field.enumValues
        ? field.enumValues.map(v => `'${v}'`).join(' | ')
        : getTsType(field.type);
      const optional = !field.validation?.required || field.defaultValue !== undefined ? '?' : '';
      lines.push(`  ${field.name}${optional}: ${tsType};`);
    }
    lines.push(`}`);
    lines.push(``);
    
    // Update input type
    lines.push(`/** Update ${entity.displayName} input */`);
    lines.push(`export type Update${entityName}Input = Partial<Create${entityName}Input>;`);
    lines.push(``);
    
    // List filters type
    lines.push(`/** ${entity.displayName} list filters */`);
    lines.push(`export interface ${entityName}Filters {`);
    lines.push(`  search?: string;`);
    for (const field of entity.fields.filter(f => f.filterable)) {
      const tsType = getTsType(field.type);
      lines.push(`  ${field.name}?: ${tsType};`);
    }
    lines.push(`  page?: number;`);
    lines.push(`  pageSize?: number;`);
    lines.push(`  sortBy?: string;`);
    lines.push(`  sortOrder?: 'asc' | 'desc';`);
    lines.push(`}`);
    lines.push(``);
  }

  // Generate enums for enum fields
  lines.push(`// ============================================================================`);
  lines.push(`// ENUMS`);
  lines.push(`// ============================================================================`);
  lines.push(``);

  for (const entity of module.entities) {
    for (const field of entity.fields.filter(f => f.type === 'enum' && f.enumValues)) {
      const enumName = toPascalCase(entity.name) + toPascalCase(field.name);
      lines.push(`export const ${enumName}Values = [`);
      for (const value of field.enumValues!) {
        lines.push(`  '${value}',`);
      }
      lines.push(`] as const;`);
      lines.push(``);
      lines.push(`export type ${enumName} = typeof ${enumName}Values[number];`);
      lines.push(``);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// STORE TEMPLATE
// ============================================================================

function generateStoreTemplate(ctx: TemplateContext): string {
  const { module } = ctx;
  const lines: string[] = [];
  const moduleName = toPascalCase(module.metadata.id);
  const moduleNameCamel = toCamelCase(module.metadata.id);

  lines.push(`// ============================================================================`);
  lines.push(`// ${module.metadata.name.toUpperCase()} MODULE - ZUSTAND STORE`);
  lines.push(`// GoldenEnergy HOME Platform - Auto-generated store`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`import { create } from 'zustand';`);
  lines.push(`import { devtools, persist } from 'zustand/middleware';`);
  lines.push(`import type {`);
  
  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    lines.push(`  ${name},`);
    lines.push(`  Create${name}Input,`);
    lines.push(`  Update${name}Input,`);
    lines.push(`  ${name}Filters,`);
  }
  
  lines.push(`} from './types';`);
  lines.push(``);

  // State interface
  lines.push(`// ============================================================================`);
  lines.push(`// STATE INTERFACE`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`export interface ${moduleName}State {`);
  
  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    const nameCamel = toCamelCase(entity.name);
    const namePlural = pluralize(nameCamel);
    
    lines.push(`  // ${entity.displayName}`);
    lines.push(`  ${namePlural}: ${name}[];`);
    lines.push(`  selected${name}: ${name} | null;`);
    lines.push(`  ${nameCamel}Loading: boolean;`);
    lines.push(`  ${nameCamel}Error: string | null;`);
    lines.push(`  ${nameCamel}Filters: ${name}Filters;`);
    lines.push(``);
  }
  
  lines.push(`}`);
  lines.push(``);

  // Actions interface
  lines.push(`export interface ${moduleName}Actions {`);
  
  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    const nameCamel = toCamelCase(entity.name);
    const namePlural = pluralize(nameCamel);
    
    lines.push(`  // ${entity.displayName} actions`);
    lines.push(`  fetch${pluralize(name)}: (filters?: ${name}Filters) => Promise<void>;`);
    lines.push(`  fetch${name}ById: (id: string) => Promise<void>;`);
    lines.push(`  create${name}: (input: Create${name}Input) => Promise<${name}>;`);
    lines.push(`  update${name}: (id: string, input: Update${name}Input) => Promise<${name}>;`);
    lines.push(`  delete${name}: (id: string) => Promise<void>;`);
    lines.push(`  setSelected${name}: (${nameCamel}: ${name} | null) => void;`);
    lines.push(`  set${name}Filters: (filters: Partial<${name}Filters>) => void;`);
    lines.push(`  reset${name}State: () => void;`);
    lines.push(``);
  }
  
  lines.push(`}`);
  lines.push(``);

  // Initial state
  lines.push(`// ============================================================================`);
  lines.push(`// INITIAL STATE`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`const initialState: ${moduleName}State = {`);
  
  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    const nameCamel = toCamelCase(entity.name);
    const namePlural = pluralize(nameCamel);
    
    lines.push(`  ${namePlural}: [],`);
    lines.push(`  selected${name}: null,`);
    lines.push(`  ${nameCamel}Loading: false,`);
    lines.push(`  ${nameCamel}Error: null,`);
    lines.push(`  ${nameCamel}Filters: { page: 1, pageSize: 20 },`);
  }
  
  lines.push(`};`);
  lines.push(``);

  // Store
  lines.push(`// ============================================================================`);
  lines.push(`// STORE`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`type ${moduleName}Store = ${moduleName}State & ${moduleName}Actions;`);
  lines.push(``);
  lines.push(`export const use${moduleName}Store = create<${moduleName}Store>()(`);
  lines.push(`  devtools(`);
  lines.push(`    persist(`);
  lines.push(`      (set, get) => ({`);
  lines.push(`        ...initialState,`);
  lines.push(``);

  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    const nameCamel = toCamelCase(entity.name);
    const namePlural = pluralize(nameCamel);
    const nameUpper = toUpperSnakeCase(entity.name);
    
    lines.push(`        // ${entity.displayName} actions`);
    lines.push(`        fetch${pluralize(name)}: async (filters) => {`);
    lines.push(`          set({ ${nameCamel}Loading: true, ${nameCamel}Error: null });`);
    lines.push(`          try {`);
    lines.push(`            // TODO: Implement API call`);
    lines.push(`            const ${namePlural}: ${name}[] = [];`);
    lines.push(`            set({ ${namePlural}, ${nameCamel}Loading: false });`);
    lines.push(`          } catch (error) {`);
    lines.push(`            set({ ${nameCamel}Error: error instanceof Error ? error.message : 'Failed to fetch', ${nameCamel}Loading: false });`);
    lines.push(`          }`);
    lines.push(`        },`);
    lines.push(``);
    lines.push(`        fetch${name}ById: async (id) => {`);
    lines.push(`          set({ ${nameCamel}Loading: true, ${nameCamel}Error: null });`);
    lines.push(`          try {`);
    lines.push(`            // TODO: Implement API call`);
    lines.push(`            const ${nameCamel}: ${name} | null = null;`);
    lines.push(`            set({ selected${name}: ${nameCamel}, ${nameCamel}Loading: false });`);
    lines.push(`          } catch (error) {`);
    lines.push(`            set({ ${nameCamel}Error: error instanceof Error ? error.message : 'Failed to fetch', ${nameCamel}Loading: false });`);
    lines.push(`          }`);
    lines.push(`        },`);
    lines.push(``);
    lines.push(`        create${name}: async (input) => {`);
    lines.push(`          set({ ${nameCamel}Loading: true, ${nameCamel}Error: null });`);
    lines.push(`          try {`);
    lines.push(`            // TODO: Implement API call`);
    lines.push(`            const ${nameCamel} = { ...input } as ${name};`);
    lines.push(`            set((state) => ({`);
    lines.push(`              ${namePlural}: [...state.${namePlural}, ${nameCamel}],`);
    lines.push(`              ${nameCamel}Loading: false,`);
    lines.push(`            }));`);
    lines.push(`            return ${nameCamel};`);
    lines.push(`          } catch (error) {`);
    lines.push(`            set({ ${nameCamel}Error: error instanceof Error ? error.message : 'Failed to create', ${nameCamel}Loading: false });`);
    lines.push(`            throw error;`);
    lines.push(`          }`);
    lines.push(`        },`);
    lines.push(``);
    lines.push(`        update${name}: async (id, input) => {`);
    lines.push(`          set({ ${nameCamel}Loading: true, ${nameCamel}Error: null });`);
    lines.push(`          try {`);
    lines.push(`            // TODO: Implement API call`);
    lines.push(`            const updated = { ...input } as ${name};`);
    lines.push(`            set((state) => ({`);
    lines.push(`              ${namePlural}: state.${namePlural}.map((item) => item.id === id ? { ...item, ...updated } : item),`);
    lines.push(`              ${nameCamel}Loading: false,`);
    lines.push(`            }));`);
    lines.push(`            return updated;`);
    lines.push(`          } catch (error) {`);
    lines.push(`            set({ ${nameCamel}Error: error instanceof Error ? error.message : 'Failed to update', ${nameCamel}Loading: false });`);
    lines.push(`            throw error;`);
    lines.push(`          }`);
    lines.push(`        },`);
    lines.push(``);
    lines.push(`        delete${name}: async (id) => {`);
    lines.push(`          set({ ${nameCamel}Loading: true, ${nameCamel}Error: null });`);
    lines.push(`          try {`);
    lines.push(`            // TODO: Implement API call`);
    lines.push(`            set((state) => ({`);
    lines.push(`              ${namePlural}: state.${namePlural}.filter((item) => item.id !== id),`);
    lines.push(`              ${nameCamel}Loading: false,`);
    lines.push(`            }));`);
    lines.push(`          } catch (error) {`);
    lines.push(`            set({ ${nameCamel}Error: error instanceof Error ? error.message : 'Failed to delete', ${nameCamel}Loading: false });`);
    lines.push(`            throw error;`);
    lines.push(`          }`);
    lines.push(`        },`);
    lines.push(``);
    lines.push(`        setSelected${name}: (${nameCamel}) => set({ selected${name}: ${nameCamel} }),`);
    lines.push(``);
    lines.push(`        set${name}Filters: (filters) => set((state) => ({`);
    lines.push(`          ${nameCamel}Filters: { ...state.${nameCamel}Filters, ...filters },`);
    lines.push(`        })),`);
    lines.push(``);
    lines.push(`        reset${name}State: () => set({`);
    lines.push(`          ${namePlural}: [],`);
    lines.push(`          selected${name}: null,`);
    lines.push(`          ${nameCamel}Loading: false,`);
    lines.push(`          ${nameCamel}Error: null,`);
    lines.push(`          ${nameCamel}Filters: { page: 1, pageSize: 20 },`);
    lines.push(`        }),`);
    lines.push(``);
  }

  lines.push(`      }),`);
  lines.push(`      {`);
  lines.push(`        name: '${moduleNameCamel}-storage',`);
  lines.push(`        partialize: (state) => ({}), // Don't persist any state by default`);
  lines.push(`      }`);
  lines.push(`    ),`);
  lines.push(`    { name: '${moduleName}Store', enabled: process.env.NODE_ENV === 'development' }`);
  lines.push(`  )`);
  lines.push(`);`);

  return lines.join('\n');
}

// ============================================================================
// API TEMPLATE
// ============================================================================

function generateApiTemplate(ctx: TemplateContext): string {
  const { module } = ctx;
  const lines: string[] = [];
  const moduleName = toPascalCase(module.metadata.id);
  const moduleKebab = toKebabCase(module.metadata.id);

  lines.push(`// ============================================================================`);
  lines.push(`// ${module.metadata.name.toUpperCase()} MODULE - API CLIENT`);
  lines.push(`// GoldenEnergy HOME Platform - Auto-generated API`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`import type {`);
  
  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    lines.push(`  ${name},`);
    lines.push(`  Create${name}Input,`);
    lines.push(`  Update${name}Input,`);
    lines.push(`  ${name}Filters,`);
  }
  
  lines.push(`} from './types';`);
  lines.push(``);

  lines.push(`const API_BASE = '/api/${moduleKebab}';`);
  lines.push(``);

  lines.push(`// ============================================================================`);
  lines.push(`// HELPERS`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {`);
  lines.push(`  const response = await fetch(url, {`);
  lines.push(`    headers: {`);
  lines.push(`      'Content-Type': 'application/json',`);
  lines.push(`      ...options?.headers,`);
  lines.push(`    },`);
  lines.push(`    ...options,`);
  lines.push(`  });`);
  lines.push(``);
  lines.push(`  if (!response.ok) {`);
  lines.push(`    const error = await response.json().catch(() => ({ message: 'Request failed' }));`);
  lines.push(`    throw new Error(error.message || 'Request failed');`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  return response.json();`);
  lines.push(`}`);
  lines.push(``);

  lines.push(`function buildQueryString(params: Record<string, unknown>): string {`);
  lines.push(`  const searchParams = new URLSearchParams();`);
  lines.push(`  for (const [key, value] of Object.entries(params)) {`);
  lines.push(`    if (value !== undefined && value !== null && value !== '') {`);
  lines.push(`      searchParams.set(key, String(value));`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`  const str = searchParams.toString();`);
  lines.push(`  return str ? \`?\${str}\` : '';`);
  lines.push(`}`);
  lines.push(``);

  // Generate API for each entity
  for (const entity of module.entities) {
    const name = toPascalCase(entity.name);
    const nameCamel = toCamelCase(entity.name);
    const nameKebab = toKebabCase(entity.name);
    const namePlural = pluralize(nameKebab);

    lines.push(`// ============================================================================`);
    lines.push(`// ${name.toUpperCase()} API`);
    lines.push(`// ============================================================================`);
    lines.push(``);
    lines.push(`export const ${nameCamel}Api = {`);
    lines.push(`  /**`);
    lines.push(`   * List ${entity.displayNamePlural}`);
    lines.push(`   */`);
    lines.push(`  list: async (filters?: ${name}Filters): Promise<{ data: ${name}[]; total: number }> => {`);
    lines.push(`    const query = filters ? buildQueryString(filters as Record<string, unknown>) : '';`);
    lines.push(`    return apiRequest(\`\${API_BASE}/${namePlural}\${query}\`);`);
    lines.push(`  },`);
    lines.push(``);
    lines.push(`  /**`);
    lines.push(`   * Get ${entity.displayName} by ID`);
    lines.push(`   */`);
    lines.push(`  getById: async (id: string): Promise<${name}> => {`);
    lines.push(`    return apiRequest(\`\${API_BASE}/${namePlural}/\${id}\`);`);
    lines.push(`  },`);
    lines.push(``);
    lines.push(`  /**`);
    lines.push(`   * Create ${entity.displayName}`);
    lines.push(`   */`);
    lines.push(`  create: async (input: Create${name}Input): Promise<${name}> => {`);
    lines.push(`    return apiRequest(\`\${API_BASE}/${namePlural}\`, {`);
    lines.push(`      method: 'POST',`);
    lines.push(`      body: JSON.stringify(input),`);
    lines.push(`    });`);
    lines.push(`  },`);
    lines.push(``);
    lines.push(`  /**`);
    lines.push(`   * Update ${entity.displayName}`);
    lines.push(`   */`);
    lines.push(`  update: async (id: string, input: Update${name}Input): Promise<${name}> => {`);
    lines.push(`    return apiRequest(\`\${API_BASE}/${namePlural}/\${id}\`, {`);
    lines.push(`      method: 'PATCH',`);
    lines.push(`      body: JSON.stringify(input),`);
    lines.push(`    });`);
    lines.push(`  },`);
    lines.push(``);
    lines.push(`  /**`);
    lines.push(`   * Delete ${entity.displayName}`);
    lines.push(`   */`);
    lines.push(`  delete: async (id: string): Promise<void> => {`);
    lines.push(`    await apiRequest(\`\${API_BASE}/${namePlural}/\${id}\`, {`);
    lines.push(`      method: 'DELETE',`);
    lines.push(`    });`);
    lines.push(`  },`);
    lines.push(`};`);
    lines.push(``);
  }

  return lines.join('\n');
}

// ============================================================================
// INDEX TEMPLATE
// ============================================================================

function generateIndexTemplate(ctx: TemplateContext): string {
  const { module } = ctx;
  const moduleName = toPascalCase(module.metadata.id);
  const lines: string[] = [];

  lines.push(`// ============================================================================`);
  lines.push(`// ${module.metadata.name.toUpperCase()} MODULE - BARREL EXPORTS`);
  lines.push(`// GoldenEnergy HOME Platform - Auto-generated exports`);
  lines.push(`// ============================================================================`);
  lines.push(``);
  lines.push(`// Types`);
  lines.push(`export * from './types';`);
  lines.push(``);
  lines.push(`// Store`);
  lines.push(`export { use${moduleName}Store } from './store';`);
  lines.push(``);
  lines.push(`// API`);
  
  for (const entity of module.entities) {
    const nameCamel = toCamelCase(entity.name);
    lines.push(`export { ${nameCamel}Api } from './api';`);
  }
  
  lines.push(``);
  lines.push(`// Components`);
  lines.push(`// export * from './components';`);
  lines.push(``);
  lines.push(`// Hooks`);
  lines.push(`// export * from './hooks';`);

  return lines.join('\n');
}

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

const templates: Map<TemplateType, RegisteredTemplate> = new Map([
  ['types', {
    type: 'types',
    name: 'TypeScript Types',
    description: 'Generate TypeScript type definitions for entities',
    render: generateTypesTemplate,
  }],
  ['store', {
    type: 'store',
    name: 'Zustand Store',
    description: 'Generate Zustand store with CRUD operations',
    render: generateStoreTemplate,
  }],
  ['api', {
    type: 'api',
    name: 'API Client',
    description: 'Generate API client functions',
    render: generateApiTemplate,
  }],
]);

export function getTemplate(type: TemplateType): RegisteredTemplate | undefined {
  return templates.get(type);
}

export function getAllTemplates(): RegisteredTemplate[] {
  return Array.from(templates.values());
}

export function registerTemplate(template: RegisteredTemplate): void {
  templates.set(template.type, template);
}

export { generateTypesTemplate, generateStoreTemplate, generateApiTemplate, generateIndexTemplate };
