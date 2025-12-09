// =============================================================================
// HOME PLATFORM - Global Search Engine
// Universal search across all modules
// =============================================================================

import { SearchResult, SearchOptions } from '../types';
import { getRegistry } from './pluginEngine';

// -----------------------------------------------------------------------------
// Search Provider Interface
// -----------------------------------------------------------------------------

export interface SearchProvider {
  moduleId: string;
  search: (query: string, options?: SearchProviderOptions) => Promise<SearchResult[]>;
  getSuggestions?: (query: string) => Promise<string[]>;
}

export interface SearchProviderOptions {
  limit?: number;
  userId?: string;
  workspaceId?: string;
}

// -----------------------------------------------------------------------------
// Search Engine
// -----------------------------------------------------------------------------

class GlobalSearchEngine {
  private providers: Map<string, SearchProvider> = new Map();
  private recentSearches: string[] = [];
  private maxRecentSearches = 10;

  // Register a search provider from a module
  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.moduleId, provider);
    console.log(`🔍 Search provider registered: ${provider.moduleId}`);
  }

  // Unregister a search provider
  unregisterProvider(moduleId: string): void {
    this.providers.delete(moduleId);
  }

  // Perform global search
  async search(options: SearchOptions): Promise<SearchResult[]> {
    const { query, modules, types, limit = 20 } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Add to recent searches
    this.addRecentSearch(query);

    // Search in navigation/commands first
    const navigationResults = this.searchNavigation(normalizedQuery);
    results.push(...navigationResults);

    // Search across all registered providers
    const providerPromises: Promise<SearchResult[]>[] = [];

    for (const [moduleId, provider] of this.providers) {
      // Skip if specific modules requested and this isn't one of them
      if (modules && modules.length > 0 && !modules.includes(moduleId)) {
        continue;
      }

      // Check if module is active
      const module = getRegistry().get(moduleId);
      if (!module || module.status !== 'active') {
        continue;
      }

      providerPromises.push(
        provider.search(normalizedQuery, { limit: Math.ceil(limit / this.providers.size) })
          .catch(err => {
            console.error(`Search error in ${moduleId}:`, err);
            return [];
          })
      );
    }

    const providerResults = await Promise.all(providerPromises);
    providerResults.forEach(r => results.push(...r));

    // Filter by types if specified
    let filteredResults = types && types.length > 0
      ? results.filter(r => types.includes(r.type))
      : results;

    // Sort by score
    filteredResults.sort((a, b) => b.score - a.score);

    // Limit results
    return filteredResults.slice(0, limit);
  }

  // Search navigation items (modules, pages, commands)
  private searchNavigation(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const registry = getRegistry();
    const modules = registry.getActive();

    for (const module of modules) {
      // Search module name
      const moduleNameMatch = 
        module.name.toLowerCase().includes(query) ||
        module.nameVi.toLowerCase().includes(query);

      if (moduleNameMatch) {
        results.push({
          id: `module-${module.id}`,
          type: 'module',
          title: module.nameVi,
          subtitle: module.name,
          description: module.descriptionVi,
          icon: module.icon,
          moduleId: module.id,
          moduleName: module.nameVi,
          link: module.basePath,
          score: 100,
        });
      }

      // Search routes
      for (const route of module.routes) {
        const routeMatch =
          route.name.toLowerCase().includes(query) ||
          route.nameVi.toLowerCase().includes(query);

        if (routeMatch) {
          results.push({
            id: `page-${module.id}-${route.path}`,
            type: 'page',
            title: route.nameVi,
            subtitle: `${module.nameVi} → ${route.name}`,
            icon: route.icon || module.icon,
            moduleId: module.id,
            moduleName: module.nameVi,
            link: `${module.basePath}${route.path}`,
            score: 80,
          });
        }
      }
    }

    // Search quick actions
    const quickActions = this.getQuickActions(query);
    results.push(...quickActions);

    return results;
  }

  // Get quick actions based on query
  private getQuickActions(query: string): SearchResult[] {
    const actions: SearchResult[] = [];

    const allActions = [
      { keyword: ['tạo', 'create', 'new', 'thêm', 'add'], action: 'create' },
      { keyword: ['task', 'công việc', 'nhiệm vụ'], type: 'task' },
      { keyword: ['lead', 'khách hàng tiềm năng'], type: 'lead' },
      { keyword: ['project', 'dự án'], type: 'project' },
      { keyword: ['meeting', 'họp', 'lịch'], type: 'meeting' },
    ];

    // Create task
    if (['tạo task', 'create task', 'new task', 'thêm công việc'].some(k => query.includes(k.toLowerCase()))) {
      actions.push({
        id: 'action-create-task',
        type: 'action',
        title: 'Tạo Task mới',
        subtitle: 'Tạo công việc mới',
        icon: '📝',
        link: '/erp/tasks?action=create',
        score: 95,
      });
    }

    // Create lead
    if (['tạo lead', 'create lead', 'new lead', 'thêm lead'].some(k => query.includes(k.toLowerCase()))) {
      actions.push({
        id: 'action-create-lead',
        type: 'action',
        title: 'Tạo Lead mới',
        subtitle: 'Thêm khách hàng tiềm năng',
        icon: '👤',
        link: '/erp/crm/leads?action=create',
        score: 95,
      });
    }

    // Create project
    if (['tạo project', 'create project', 'new project', 'dự án mới'].some(k => query.includes(k.toLowerCase()))) {
      actions.push({
        id: 'action-create-project',
        type: 'action',
        title: 'Tạo Dự án mới',
        subtitle: 'Tạo project mới',
        icon: '📁',
        link: '/erp/projects?action=create',
        score: 95,
      });
    }

    return actions;
  }

  // Get suggestions for autocomplete
  async getSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return this.recentSearches;
    }

    const suggestions = new Set<string>();

    // Add matching recent searches
    this.recentSearches
      .filter(s => s.toLowerCase().includes(query.toLowerCase()))
      .forEach(s => suggestions.add(s));

    // Get suggestions from providers
    for (const [moduleId, provider] of this.providers) {
      if (provider.getSuggestions) {
        const moduleSuggestions = await provider.getSuggestions(query).catch(() => []);
        moduleSuggestions.forEach(s => suggestions.add(s));
      }
    }

    return Array.from(suggestions).slice(0, 10);
  }

  // Add to recent searches
  private addRecentSearch(query: string): void {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(s => s !== normalizedQuery);

    // Add to beginning
    this.recentSearches.unshift(normalizedQuery);

    // Keep only max items
    if (this.recentSearches.length > this.maxRecentSearches) {
      this.recentSearches.pop();
    }
  }

  // Get recent searches
  getRecentSearches(): string[] {
    return [...this.recentSearches];
  }

  // Clear recent searches
  clearRecentSearches(): void {
    this.recentSearches = [];
  }
}

// -----------------------------------------------------------------------------
// Singleton Instance
// -----------------------------------------------------------------------------

let searchEngineInstance: GlobalSearchEngine | null = null;

export function getSearchEngine(): GlobalSearchEngine {
  if (!searchEngineInstance) {
    searchEngineInstance = new GlobalSearchEngine();
  }
  return searchEngineInstance;
}

// Export class
export { GlobalSearchEngine };

// -----------------------------------------------------------------------------
// Search Result Helpers
// -----------------------------------------------------------------------------

export function createSearchResult(
  partial: Partial<SearchResult> & Pick<SearchResult, 'id' | 'type' | 'title' | 'link'>
): SearchResult {
  return {
    score: 50,
    ...partial,
  };
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
