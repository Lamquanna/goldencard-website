/**
 * Global Search - Search Across All Modules
 * 
 * Unified search system that queries CRM leads, HR employees,
 * Projects, Products, Invoices, and more.
 * Launch via Cmd+K.
 */

import { SearchResult, SearchQuery } from './types';
import { moduleRegistry } from './module-registry';

type SearchProvider = {
  moduleId: string;
  name: string;
  icon: string;
  search: (query: string, limit: number) => Promise<SearchResult[]>;
};

type SearchResultGroup = {
  moduleId: string;
  moduleName: string;
  icon: string;
  results: SearchResult[];
};

interface RecentSearch {
  query: string;
  timestamp: Date;
}

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  shortcut?: string;
  keywords: string[];
  action: () => void | Promise<void>;
  moduleId?: string;
}

class GlobalSearchSystem {
  private providers: Map<string, SearchProvider> = new Map();
  private recentSearches: RecentSearch[] = [];
  private quickActions: QuickAction[] = [];
  private maxRecentSearches = 10;
  private searchCache: Map<string, { results: SearchResultGroup[]; timestamp: number }> = new Map();
  private cacheTTL = 30000; // 30 seconds

  // ============================================
  // Provider Management
  // ============================================

  /**
   * Register a search provider for a module
   */
  registerProvider(provider: SearchProvider): void {
    this.providers.set(provider.moduleId, provider);
  }

  /**
   * Unregister a search provider
   */
  unregisterProvider(moduleId: string): void {
    this.providers.delete(moduleId);
  }

  /**
   * Get all registered providers
   */
  getProviders(): SearchProvider[] {
    return Array.from(this.providers.values());
  }

  // ============================================
  // Search Execution
  // ============================================

  /**
   * Execute search across all modules
   */
  async search(options: SearchQuery): Promise<SearchResultGroup[]> {
    const { query, modules, limit = 5 } = options;

    if (!query || query.trim().length < 2) {
      return [];
    }

    const normalizedQuery = query.trim().toLowerCase();

    // Check cache
    const cacheKey = `${normalizedQuery}:${modules?.join(',') || 'all'}:${limit}`;
    const cached = this.searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.results;
    }

    // Determine which providers to use
    let activeProviders = Array.from(this.providers.values());
    
    if (modules && modules.length > 0) {
      activeProviders = activeProviders.filter(p => modules.includes(p.moduleId));
    }

    // Filter to enabled modules only
    activeProviders = activeProviders.filter(p => moduleRegistry.isEnabled(p.moduleId));

    // Execute searches in parallel
    const searchPromises = activeProviders.map(async (provider) => {
      try {
        const results = await provider.search(normalizedQuery, limit);
        return {
          moduleId: provider.moduleId,
          moduleName: provider.name,
          icon: provider.icon,
          results: results.slice(0, limit),
        };
      } catch (error) {
        console.error(`Search error in ${provider.moduleId}:`, error);
        return {
          moduleId: provider.moduleId,
          moduleName: provider.name,
          icon: provider.icon,
          results: [],
        };
      }
    });

    const results = await Promise.all(searchPromises);
    
    // Filter out empty results and sort by result count
    const filteredResults = results
      .filter(group => group.results.length > 0)
      .sort((a, b) => b.results.length - a.results.length);

    // Cache results
    this.searchCache.set(cacheKey, { results: filteredResults, timestamp: Date.now() });

    // Add to recent searches
    this.addRecentSearch(query);

    return filteredResults;
  }

  /**
   * Search within a specific module
   */
  async searchModule(moduleId: string, query: string, limit: number = 10): Promise<SearchResult[]> {
    const provider = this.providers.get(moduleId);
    if (!provider) {
      throw new Error(`No search provider for module "${moduleId}"`);
    }

    if (!moduleRegistry.isEnabled(moduleId)) {
      return [];
    }

    return provider.search(query, limit);
  }

  /**
   * Get flattened search results (all modules combined)
   */
  async searchFlat(query: string, limit: number = 20): Promise<SearchResult[]> {
    const groups = await this.search({ query, limit: Math.ceil(limit / this.providers.size) });
    
    // Flatten and sort by score
    return groups
      .flatMap(group => group.results)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // ============================================
  // Quick Actions
  // ============================================

  /**
   * Register a quick action
   */
  registerQuickAction(action: QuickAction): void {
    // Remove existing action with same ID
    this.quickActions = this.quickActions.filter(a => a.id !== action.id);
    this.quickActions.push(action);
  }

  /**
   * Unregister a quick action
   */
  unregisterQuickAction(actionId: string): void {
    this.quickActions = this.quickActions.filter(a => a.id !== actionId);
  }

  /**
   * Search quick actions
   */
  searchQuickActions(query: string): QuickAction[] {
    if (!query || query.trim().length === 0) {
      return this.quickActions.slice(0, 10);
    }

    const normalizedQuery = query.trim().toLowerCase();

    return this.quickActions
      .filter(action => {
        // Filter by module if action has one
        if (action.moduleId && !moduleRegistry.isEnabled(action.moduleId)) {
          return false;
        }

        // Search in label, description, and keywords
        const searchText = [
          action.label,
          action.description || '',
          ...action.keywords,
        ].join(' ').toLowerCase();

        return searchText.includes(normalizedQuery) ||
          normalizedQuery.split(' ').every(term => searchText.includes(term));
      })
      .slice(0, 10);
  }

  /**
   * Execute a quick action
   */
  async executeQuickAction(actionId: string): Promise<void> {
    const action = this.quickActions.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Quick action "${actionId}" not found`);
    }

    await action.action();
  }

  /**
   * Get all quick actions for a module
   */
  getQuickActionsForModule(moduleId: string): QuickAction[] {
    return this.quickActions.filter(a => a.moduleId === moduleId);
  }

  // ============================================
  // Recent Searches
  // ============================================

  /**
   * Add to recent searches
   */
  private addRecentSearch(query: string): void {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter(
      s => s.query.toLowerCase() !== normalizedQuery.toLowerCase()
    );

    // Add to beginning
    this.recentSearches.unshift({
      query: normalizedQuery,
      timestamp: new Date(),
    });

    // Trim to max size
    if (this.recentSearches.length > this.maxRecentSearches) {
      this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
    }
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): RecentSearch[] {
    return [...this.recentSearches];
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.recentSearches = [];
  }

  /**
   * Remove a specific recent search
   */
  removeRecentSearch(query: string): void {
    this.recentSearches = this.recentSearches.filter(
      s => s.query.toLowerCase() !== query.toLowerCase()
    );
  }

  // ============================================
  // Suggestions
  // ============================================

  /**
   * Get search suggestions based on query
   */
  getSuggestions(query: string): string[] {
    if (!query || query.trim().length < 2) {
      return this.recentSearches.map(s => s.query);
    }

    const normalizedQuery = query.trim().toLowerCase();
    
    // Combine recent searches with quick action keywords
    const suggestions = new Set<string>();

    // Add matching recent searches
    this.recentSearches
      .filter(s => s.query.toLowerCase().includes(normalizedQuery))
      .forEach(s => suggestions.add(s.query));

    // Add matching quick action labels
    this.quickActions
      .filter(a => a.label.toLowerCase().includes(normalizedQuery))
      .forEach(a => suggestions.add(a.label));

    return Array.from(suggestions).slice(0, 10);
  }

  // ============================================
  // Cache Management
  // ============================================

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
  }

  /**
   * Set cache TTL
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }

  // ============================================
  // Utility
  // ============================================

  /**
   * Highlight search term in text
   */
  static highlight(text: string, query: string): string {
    if (!query) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Calculate search relevance score
   */
  static calculateScore(text: string, query: string): number {
    if (!text || !query) return 0;

    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();

    let score = 0;

    // Exact match bonus
    if (normalizedText === normalizedQuery) {
      score += 100;
    }

    // Starts with bonus
    if (normalizedText.startsWith(normalizedQuery)) {
      score += 50;
    }

    // Contains bonus
    if (normalizedText.includes(normalizedQuery)) {
      score += 25;
    }

    // Word match bonus
    const words = normalizedText.split(/\s+/);
    const queryWords = normalizedQuery.split(/\s+/);
    
    queryWords.forEach(qWord => {
      if (words.some(w => w === qWord)) {
        score += 20;
      } else if (words.some(w => w.startsWith(qWord))) {
        score += 10;
      } else if (words.some(w => w.includes(qWord))) {
        score += 5;
      }
    });

    return score;
  }
}

// Singleton instance
export const globalSearch = new GlobalSearchSystem();

// Default quick actions
globalSearch.registerQuickAction({
  id: 'create-lead',
  label: 'Create New Lead',
  description: 'Add a new lead to CRM',
  icon: 'UserPlus',
  keywords: ['add', 'new', 'lead', 'crm', 'customer'],
  moduleId: 'crm',
  action: () => {
    // Navigation would be handled by the UI
    console.log('Navigate to create lead');
  },
});

globalSearch.registerQuickAction({
  id: 'create-task',
  label: 'Create New Task',
  description: 'Add a new task to a project',
  icon: 'CheckSquare',
  keywords: ['add', 'new', 'task', 'project', 'todo'],
  moduleId: 'project',
  action: () => {
    console.log('Navigate to create task');
  },
});

globalSearch.registerQuickAction({
  id: 'create-invoice',
  label: 'Create New Invoice',
  description: 'Create a new invoice',
  icon: 'FileText',
  keywords: ['add', 'new', 'invoice', 'bill', 'finance'],
  moduleId: 'finance',
  action: () => {
    console.log('Navigate to create invoice');
  },
});

globalSearch.registerQuickAction({
  id: 'view-dashboard',
  label: 'Go to Dashboard',
  description: 'View main dashboard',
  icon: 'LayoutDashboard',
  shortcut: 'g d',
  keywords: ['home', 'dashboard', 'main', 'overview'],
  action: () => {
    console.log('Navigate to dashboard');
  },
});

export type { SearchProvider, SearchResultGroup, RecentSearch, QuickAction };
