// ============================================================================
// MODULE TEMPLATE GENERATOR - MAIN GENERATOR
// GoldenEnergy HOME Platform - Module Code Generator
// ============================================================================

import type {
  ModuleTemplate,
  GeneratorOptions,
  GeneratorResult,
  GeneratedFile,
  GeneratorError,
  TemplateContext,
} from './types';
import { createTemplateHelpers, toKebabCase } from './helpers';
import {
  generateTypesTemplate,
  generateStoreTemplate,
  generateApiTemplate,
  generateIndexTemplate,
} from './templates';

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const defaultOptions: GeneratorOptions = {
  outputDir: './src/modules',
  types: { enabled: true },
  store: { enabled: true },
  api: { enabled: true },
  components: { enabled: true },
  pages: { enabled: true },
  tests: { enabled: false },
  stories: { enabled: false },
  i18n: { enabled: false },
  overwrite: false,
  dryRun: false,
  verbose: false,
};

// ============================================================================
// GENERATOR CLASS
// ============================================================================

export class ModuleGenerator {
  private options: GeneratorOptions;
  private files: GeneratedFile[] = [];
  private errors: GeneratorError[] = [];
  private warnings: string[] = [];

  constructor(options: Partial<GeneratorOptions> = {}) {
    this.options = { ...defaultOptions, ...options };
  }

  /**
   * Generate module files from template
   */
  async generate(template: ModuleTemplate): Promise<GeneratorResult> {
    const startTime = performance.now();
    this.files = [];
    this.errors = [];
    this.warnings = [];

    try {
      // Validate template
      this.validateTemplate(template);
      if (this.errors.length > 0) {
        return this.createResult(startTime);
      }

      // Create template context
      const context = this.createContext(template);
      const moduleDir = `${this.options.outputDir}/${toKebabCase(template.metadata.id)}`;

      // Generate types
      if (this.options.types.enabled) {
        this.generateFile(
          `${moduleDir}/types.ts`,
          generateTypesTemplate(context),
          'types'
        );
      }

      // Generate store
      if (this.options.store.enabled) {
        this.generateFile(
          `${moduleDir}/store.ts`,
          generateStoreTemplate(context),
          'store'
        );
      }

      // Generate API
      if (this.options.api.enabled) {
        this.generateFile(
          `${moduleDir}/api.ts`,
          generateApiTemplate(context),
          'api'
        );
      }

      // Generate index
      this.generateFile(
        `${moduleDir}/index.ts`,
        generateIndexTemplate(context),
        'index'
      );

      // Log summary if verbose
      if (this.options.verbose) {
        this.logSummary();
      }

    } catch (error) {
      this.errors.push({
        code: 'GENERATOR_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error,
      });
    }

    return this.createResult(startTime);
  }

  /**
   * Validate module template
   */
  private validateTemplate(template: ModuleTemplate): void {
    // Check metadata
    if (!template.metadata.id) {
      this.errors.push({
        code: 'INVALID_METADATA',
        message: 'Module ID is required',
      });
    }

    if (!template.metadata.name) {
      this.errors.push({
        code: 'INVALID_METADATA',
        message: 'Module name is required',
      });
    }

    // Check entities
    if (!template.entities || template.entities.length === 0) {
      this.warnings.push('No entities defined in template');
    }

    for (const entity of template.entities) {
      if (!entity.name) {
        this.errors.push({
          code: 'INVALID_ENTITY',
          message: 'Entity name is required',
        });
      }

      if (!entity.fields || entity.fields.length === 0) {
        this.warnings.push(`Entity "${entity.name}" has no fields defined`);
      }

      // Check for id field
      const hasId = entity.fields.some(f => f.name === 'id');
      if (!hasId) {
        this.warnings.push(`Entity "${entity.name}" has no "id" field - consider adding one`);
      }
    }
  }

  /**
   * Create template context
   */
  private createContext(template: ModuleTemplate): TemplateContext {
    return {
      module: template,
      options: this.options,
      helpers: createTemplateHelpers(),
    };
  }

  /**
   * Generate a file (add to files list)
   */
  private generateFile(
    path: string,
    content: string,
    type: GeneratedFile['type']
  ): void {
    // In dry run mode, just add to list without actual write
    const action: GeneratedFile['action'] = this.options.dryRun ? 'skipped' : 'created';

    this.files.push({
      path,
      content,
      type,
      action,
    });

    if (this.options.verbose) {
      console.log(`[${action.toUpperCase()}] ${path}`);
    }
  }

  /**
   * Create result object
   */
  private createResult(startTime: number): GeneratorResult {
    return {
      success: this.errors.length === 0,
      files: this.files,
      errors: this.errors,
      warnings: this.warnings,
      duration: performance.now() - startTime,
    };
  }

  /**
   * Log generation summary
   */
  private logSummary(): void {
    console.log('\n=== Generation Summary ===');
    console.log(`Files: ${this.files.length}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    
    if (this.files.length > 0) {
      console.log('\nGenerated files:');
      for (const file of this.files) {
        console.log(`  - ${file.path} (${file.type})`);
      }
    }

    if (this.warnings.length > 0) {
      console.log('\nWarnings:');
      for (const warning of this.warnings) {
        console.log(`  ⚠ ${warning}`);
      }
    }

    if (this.errors.length > 0) {
      console.log('\nErrors:');
      for (const error of this.errors) {
        console.log(`  ✗ ${error.message}`);
      }
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Generate module from template with default options
 */
export async function generateModule(
  template: ModuleTemplate,
  options?: Partial<GeneratorOptions>
): Promise<GeneratorResult> {
  const generator = new ModuleGenerator(options);
  return generator.generate(template);
}

/**
 * Preview generation (dry run)
 */
export async function previewGeneration(
  template: ModuleTemplate,
  options?: Partial<GeneratorOptions>
): Promise<GeneratorResult> {
  const generator = new ModuleGenerator({ ...options, dryRun: true });
  return generator.generate(template);
}

/**
 * Create a basic module template
 */
export function createModuleTemplate(
  id: string,
  name: string,
  options: Partial<ModuleTemplate> = {}
): ModuleTemplate {
  return {
    metadata: {
      id,
      name,
      description: options.metadata?.description || `${name} module`,
      version: options.metadata?.version || '1.0.0',
      category: options.metadata?.category || 'custom',
      status: options.metadata?.status || 'draft',
      ...options.metadata,
    },
    entities: options.entities || [],
    endpoints: options.endpoints || [],
    pages: options.pages || [],
    permissions: options.permissions || [],
    navigation: options.navigation || [],
    ...options,
  };
}

/**
 * Create an entity definition
 */
export function createEntityDefinition(
  name: string,
  displayName: string,
  fields: ModuleTemplate['entities'][0]['fields'],
  options: Partial<ModuleTemplate['entities'][0]> = {}
): ModuleTemplate['entities'][0] {
  return {
    name,
    displayName,
    displayNamePlural: options.displayNamePlural || displayName + 's',
    fields: [
      {
        name: 'id',
        label: 'ID',
        type: 'uuid',
        system: true,
        validation: { required: true },
      },
      ...fields,
    ],
    timestamps: options.timestamps ?? true,
    softDelete: options.softDelete ?? false,
    ...options,
  };
}
