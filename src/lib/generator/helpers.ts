// ============================================================================
// MODULE TEMPLATE GENERATOR - HELPER UTILITIES
// GoldenEnergy HOME Platform - Template Helper Functions
// ============================================================================

import type { FieldType, EntityField, TemplateHelpers } from './types';

// ============================================================================
// STRING CASE CONVERSIONS
// ============================================================================

/**
 * Convert string to PascalCase
 * @example "hello-world" -> "HelloWorld"
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/**
 * Convert string to camelCase
 * @example "hello-world" -> "helloWorld"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert string to kebab-case
 * @example "HelloWorld" -> "hello-world"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to UPPER_SNAKE_CASE
 * @example "helloWorld" -> "HELLO_WORLD"
 */
export function toUpperSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toUpperCase();
}

/**
 * Convert string to snake_case
 * @example "helloWorld" -> "hello_world"
 */
export function toSnakeCase(str: string): string {
  return toUpperSnakeCase(str).toLowerCase();
}

// ============================================================================
// PLURALIZATION (Simple English rules)
// ============================================================================

const IRREGULAR_PLURALS: Record<string, string> = {
  person: 'people',
  child: 'children',
  man: 'men',
  woman: 'women',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  goose: 'geese',
  ox: 'oxen',
  leaf: 'leaves',
  life: 'lives',
  knife: 'knives',
  wife: 'wives',
  self: 'selves',
  elf: 'elves',
  loaf: 'loaves',
  potato: 'potatoes',
  tomato: 'tomatoes',
  cactus: 'cacti',
  focus: 'foci',
  fungus: 'fungi',
  nucleus: 'nuclei',
  syllabus: 'syllabi',
  analysis: 'analyses',
  diagnosis: 'diagnoses',
  oasis: 'oases',
  thesis: 'theses',
  crisis: 'crises',
  phenomenon: 'phenomena',
  criterion: 'criteria',
  datum: 'data',
};

const UNCOUNTABLE_WORDS = new Set([
  'sheep',
  'fish',
  'deer',
  'moose',
  'swine',
  'buffalo',
  'shrimp',
  'trout',
  'aircraft',
  'spacecraft',
  'series',
  'species',
  'news',
  'information',
  'equipment',
  'rice',
  'money',
  'furniture',
  'luggage',
  'jewelry',
  'homework',
  'advice',
  'knowledge',
]);

/**
 * Pluralize a word
 */
export function pluralize(word: string): string {
  const lower = word.toLowerCase();
  
  // Check uncountable
  if (UNCOUNTABLE_WORDS.has(lower)) {
    return word;
  }
  
  // Check irregular
  if (IRREGULAR_PLURALS[lower]) {
    // Preserve original case
    if (word[0] === word[0].toUpperCase()) {
      return IRREGULAR_PLURALS[lower].charAt(0).toUpperCase() + IRREGULAR_PLURALS[lower].slice(1);
    }
    return IRREGULAR_PLURALS[lower];
  }
  
  // Apply regular rules
  if (lower.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(lower[lower.length - 2])) {
    return word.slice(0, -1) + 'ies';
  }
  if (lower.endsWith('s') || lower.endsWith('x') || lower.endsWith('z') || 
      lower.endsWith('ch') || lower.endsWith('sh')) {
    return word + 'es';
  }
  if (lower.endsWith('f')) {
    return word.slice(0, -1) + 'ves';
  }
  if (lower.endsWith('fe')) {
    return word.slice(0, -2) + 'ves';
  }
  
  return word + 's';
}

/**
 * Singularize a word (basic implementation)
 */
export function singularize(word: string): string {
  const lower = word.toLowerCase();
  
  // Check uncountable
  if (UNCOUNTABLE_WORDS.has(lower)) {
    return word;
  }
  
  // Check irregular (reverse lookup)
  for (const [singular, plural] of Object.entries(IRREGULAR_PLURALS)) {
    if (plural === lower) {
      if (word[0] === word[0].toUpperCase()) {
        return singular.charAt(0).toUpperCase() + singular.slice(1);
      }
      return singular;
    }
  }
  
  // Apply regular rules (reverse)
  if (lower.endsWith('ies')) {
    return word.slice(0, -3) + 'y';
  }
  if (lower.endsWith('ves')) {
    return word.slice(0, -3) + 'f';
  }
  if (lower.endsWith('es') && (
    lower.endsWith('sses') || lower.endsWith('xes') || lower.endsWith('zes') ||
    lower.endsWith('ches') || lower.endsWith('shes')
  )) {
    return word.slice(0, -2);
  }
  if (lower.endsWith('s') && !lower.endsWith('ss')) {
    return word.slice(0, -1);
  }
  
  return word;
}

// ============================================================================
// TYPE MAPPING
// ============================================================================

/**
 * Get TypeScript type from field type
 */
export function getTsType(fieldType: FieldType): string {
  const typeMap: Record<FieldType, string> = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    date: 'Date',
    datetime: 'Date',
    enum: 'string', // Will be overridden with actual enum values
    relation: 'string', // Will be the related ID type
    json: 'Record<string, unknown>',
    text: 'string',
    email: 'string',
    phone: 'string',
    url: 'string',
    uuid: 'string',
    money: 'number',
  };
  
  return typeMap[fieldType] || 'unknown';
}

/**
 * Get Prisma type from field type
 */
export function getPrismaType(fieldType: FieldType): string {
  const typeMap: Record<FieldType, string> = {
    string: 'String',
    number: 'Int',
    boolean: 'Boolean',
    date: 'DateTime',
    datetime: 'DateTime',
    enum: 'String',
    relation: 'String',
    json: 'Json',
    text: 'String',
    email: 'String',
    phone: 'String',
    url: 'String',
    uuid: 'String',
    money: 'Decimal',
  };
  
  return typeMap[fieldType] || 'String';
}

/**
 * Get Zod schema from field definition
 */
export function getZodSchema(field: EntityField): string {
  let schema = '';
  const v = field.validation;
  
  switch (field.type) {
    case 'string':
    case 'text':
      schema = 'z.string()';
      if (v?.minLength) schema += `.min(${v.minLength})`;
      if (v?.maxLength) schema += `.max(${v.maxLength})`;
      if (v?.pattern) schema += `.regex(/${v.pattern}/)`;
      break;
      
    case 'email':
      schema = 'z.string().email()';
      break;
      
    case 'url':
      schema = 'z.string().url()';
      break;
      
    case 'phone':
      schema = 'z.string()'; // Could add phone validation
      break;
      
    case 'uuid':
      schema = 'z.string().uuid()';
      break;
      
    case 'number':
    case 'money':
      schema = 'z.number()';
      if (v?.min !== undefined) schema += `.min(${v.min})`;
      if (v?.max !== undefined) schema += `.max(${v.max})`;
      break;
      
    case 'boolean':
      schema = 'z.boolean()';
      break;
      
    case 'date':
    case 'datetime':
      schema = 'z.date()';
      break;
      
    case 'enum':
      if (field.enumValues && field.enumValues.length > 0) {
        const values = field.enumValues.map(v => `'${v}'`).join(', ');
        schema = `z.enum([${values}])`;
      } else {
        schema = 'z.string()';
      }
      break;
      
    case 'json':
      schema = 'z.record(z.unknown())';
      break;
      
    case 'relation':
      schema = 'z.string()'; // Related ID
      break;
      
    default:
      schema = 'z.unknown()';
  }
  
  // Add optional/nullable
  if (field.nullable) {
    schema += '.nullable()';
  }
  if (!v?.required && !field.system) {
    schema += '.optional()';
  }
  
  return schema;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format date as ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Indent text with spaces
 */
export function indent(text: string, spaces: number): string {
  const indentStr = ' '.repeat(spaces);
  return text.split('\n').map(line => indentStr + line).join('\n');
}

/**
 * Strip leading/trailing empty lines
 */
export function trimEmptyLines(text: string): string {
  const lines = text.split('\n');
  let start = 0;
  let end = lines.length - 1;
  
  while (start < lines.length && lines[start].trim() === '') start++;
  while (end > start && lines[end].trim() === '') end--;
  
  return lines.slice(start, end + 1).join('\n');
}

// ============================================================================
// CREATE TEMPLATE HELPERS
// ============================================================================

/**
 * Create template helpers object
 */
export function createTemplateHelpers(): TemplateHelpers {
  return {
    toPascalCase,
    toCamelCase,
    toKebabCase,
    toUpperSnakeCase,
    pluralize,
    singularize,
    getTsType,
    getZodSchema,
    formatDate,
    indent,
  };
}
