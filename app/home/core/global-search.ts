/**
 * HOME Platform - Global Search Engine
 * Search across all modules with autocomplete
 */

// =============================================================================
// SEARCH TYPES
// =============================================================================

export type SearchableModule = 
  | 'crm'
  | 'hrm'
  | 'project'
  | 'inventory'
  | 'finance'
  | 'files'

export interface SearchResult {
  id: string
  type: string
  module: SearchableModule
  title: string
  description?: string
  url: string
  icon?: string
  highlight?: string
  metadata?: Record<string, unknown>
  score: number
}

export interface SearchIndex {
  id: string
  module: SearchableModule
  type: string
  title: string
  content: string
  keywords: string[]
  url: string
  metadata?: Record<string, unknown>
  updatedAt: Date
}

export interface SearchQuery {
  query: string
  modules?: SearchableModule[]
  types?: string[]
  limit?: number
}

// =============================================================================
// SEARCH ENGINE
// =============================================================================

class GlobalSearchEngine {
  private index: Map<string, SearchIndex> = new Map()
  private moduleConfigs: Map<SearchableModule, ModuleSearchConfig> = new Map()

  constructor() {
    this.initializeModuleConfigs()
  }

  // Configure search for each module
  private initializeModuleConfigs() {
    this.moduleConfigs.set('crm', {
      types: [
        { type: 'lead', label: 'Lead', labelVi: 'Lead', icon: '👤' },
        { type: 'customer', label: 'Customer', labelVi: 'Khách hàng', icon: '🏢' },
        { type: 'deal', label: 'Deal', labelVi: 'Cơ hội', icon: '💼' },
      ],
      baseUrl: '/home/crm',
    })

    this.moduleConfigs.set('hrm', {
      types: [
        { type: 'employee', label: 'Employee', labelVi: 'Nhân viên', icon: '👔' },
        { type: 'leave', label: 'Leave Request', labelVi: 'Đơn nghỉ phép', icon: '🏖️' },
        { type: 'attendance', label: 'Attendance', labelVi: 'Chấm công', icon: '⏰' },
      ],
      baseUrl: '/home/hrm',
    })

    this.moduleConfigs.set('project', {
      types: [
        { type: 'project', label: 'Project', labelVi: 'Dự án', icon: '📁' },
        { type: 'task', label: 'Task', labelVi: 'Công việc', icon: '✅' },
        { type: 'milestone', label: 'Milestone', labelVi: 'Mốc tiến độ', icon: '🎯' },
      ],
      baseUrl: '/home/projects',
    })

    this.moduleConfigs.set('inventory', {
      types: [
        { type: 'product', label: 'Product', labelVi: 'Sản phẩm', icon: '📦' },
        { type: 'stock', label: 'Stock', labelVi: 'Tồn kho', icon: '🏭' },
        { type: 'supplier', label: 'Supplier', labelVi: 'Nhà cung cấp', icon: '🚚' },
      ],
      baseUrl: '/home/inventory',
    })

    this.moduleConfigs.set('finance', {
      types: [
        { type: 'invoice', label: 'Invoice', labelVi: 'Hóa đơn', icon: '📄' },
        { type: 'expense', label: 'Expense', labelVi: 'Chi phí', icon: '💸' },
        { type: 'payment', label: 'Payment', labelVi: 'Thanh toán', icon: '💳' },
      ],
      baseUrl: '/home/finance',
    })

    this.moduleConfigs.set('files', {
      types: [
        { type: 'document', label: 'Document', labelVi: 'Tài liệu', icon: '📝' },
        { type: 'folder', label: 'Folder', labelVi: 'Thư mục', icon: '📂' },
        { type: 'image', label: 'Image', labelVi: 'Hình ảnh', icon: '🖼️' },
      ],
      baseUrl: '/home/files',
    })
  }

  // Index a document
  indexDocument(doc: Omit<SearchIndex, 'updatedAt'>) {
    const key = `${doc.module}:${doc.type}:${doc.id}`
    this.index.set(key, {
      ...doc,
      updatedAt: new Date(),
    })
  }

  // Remove a document from index
  removeDocument(module: SearchableModule, type: string, id: string) {
    const key = `${module}:${type}:${id}`
    this.index.delete(key)
  }

  // Search across all indexed documents
  search(query: SearchQuery): SearchResult[] {
    const searchTerms = this.tokenize(query.query.toLowerCase())
    const results: SearchResult[] = []

    this.index.forEach((doc) => {
      // Filter by modules
      if (query.modules?.length && !query.modules.includes(doc.module)) {
        return
      }

      // Filter by types
      if (query.types?.length && !query.types.includes(doc.type)) {
        return
      }

      // Calculate score
      const score = this.calculateScore(doc, searchTerms)
      if (score > 0) {
        const config = this.moduleConfigs.get(doc.module)
        const typeConfig = config?.types.find(t => t.type === doc.type)

        results.push({
          id: doc.id,
          type: doc.type,
          module: doc.module,
          title: doc.title,
          description: doc.content.substring(0, 200),
          url: doc.url,
          icon: typeConfig?.icon,
          highlight: this.highlightMatch(doc.content, searchTerms),
          metadata: doc.metadata,
          score,
        })
      }
    })

    // Sort by score and limit
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, query.limit || 20)
  }

  // Tokenize search query
  private tokenize(query: string): string[] {
    return query
      .split(/\s+/)
      .filter(term => term.length >= 2)
      .map(term => term.toLowerCase())
  }

  // Calculate relevance score
  private calculateScore(doc: SearchIndex, searchTerms: string[]): number {
    let score = 0
    const titleLower = doc.title.toLowerCase()
    const contentLower = doc.content.toLowerCase()
    const keywordsLower = doc.keywords.map(k => k.toLowerCase())

    searchTerms.forEach(term => {
      // Title matches (highest weight)
      if (titleLower.includes(term)) {
        score += titleLower.startsWith(term) ? 100 : 50
      }

      // Keyword matches (high weight)
      if (keywordsLower.some(k => k.includes(term))) {
        score += 30
      }

      // Content matches (lower weight)
      if (contentLower.includes(term)) {
        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length
        score += Math.min(matches * 5, 20)
      }
    })

    return score
  }

  // Highlight matching text
  private highlightMatch(content: string, searchTerms: string[]): string {
    let highlighted = content.substring(0, 200)
    
    searchTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi')
      highlighted = highlighted.replace(regex, '**$1**')
    })

    return highlighted
  }

  // Get autocomplete suggestions
  autocomplete(query: string, limit: number = 10): string[] {
    const suggestions = new Set<string>()
    const queryLower = query.toLowerCase()

    this.index.forEach((doc) => {
      // Add matching titles
      if (doc.title.toLowerCase().includes(queryLower)) {
        suggestions.add(doc.title)
      }

      // Add matching keywords
      doc.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower)) {
          suggestions.add(keyword)
        }
      })
    })

    return Array.from(suggestions).slice(0, limit)
  }

  // Get recent searches (stored in localStorage)
  getRecentSearches(): string[] {
    if (typeof window === 'undefined') return []
    const recent = localStorage.getItem('recent_searches')
    return recent ? JSON.parse(recent) : []
  }

  // Add to recent searches
  addRecentSearch(query: string) {
    if (typeof window === 'undefined') return
    const recent = this.getRecentSearches()
    const filtered = recent.filter(s => s !== query)
    filtered.unshift(query)
    localStorage.setItem('recent_searches', JSON.stringify(filtered.slice(0, 10)))
  }

  // Get module config
  getModuleConfig(module: SearchableModule): ModuleSearchConfig | undefined {
    return this.moduleConfigs.get(module)
  }

  // Get all module configs
  getAllModuleConfigs(): Map<SearchableModule, ModuleSearchConfig> {
    return this.moduleConfigs
  }
}

// =============================================================================
// MODULE CONFIG TYPE
// =============================================================================

interface ModuleSearchConfig {
  types: {
    type: string
    label: string
    labelVi: string
    icon: string
  }[]
  baseUrl: string
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const globalSearch = new GlobalSearchEngine()

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useDebounce } from '@/lib/hooks/useDebounce'

export function useGlobalSearch(debounceMs: number = 300) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedModules, setSelectedModules] = useState<SearchableModule[]>([])

  const debouncedQuery = useDebounce(query, debounceMs)

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults([])
      setSuggestions([])
      return
    }

    setLoading(true)
    
    // Simulate async search (real implementation would call API)
    setTimeout(() => {
      const searchResults = globalSearch.search({
        query: q,
        modules: selectedModules.length > 0 ? selectedModules : undefined,
      })
      setResults(searchResults)
      setSuggestions(globalSearch.autocomplete(q))
      setLoading(false)
      
      // Add to recent searches
      if (searchResults.length > 0) {
        globalSearch.addRecentSearch(q)
      }
    }, 100)
  }, [selectedModules])

  useEffect(() => {
    search(debouncedQuery)
  }, [debouncedQuery, search])

  const recentSearches = useMemo(() => {
    return globalSearch.getRecentSearches()
  }, [])

  return {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    selectedModules,
    setSelectedModules,
    recentSearches,
    search: () => search(query),
  }
}

// =============================================================================
// SEARCH COMMAND PALETTE (Cmd+K)
// =============================================================================

export interface CommandPaletteItem {
  id: string
  type: 'action' | 'navigation' | 'search'
  title: string
  titleVi: string
  description?: string
  icon?: string
  shortcut?: string
  action?: () => void
  url?: string
}

export const commandPaletteItems: CommandPaletteItem[] = [
  // Navigation
  { id: 'nav-dashboard', type: 'navigation', title: 'Go to Dashboard', titleVi: 'Đi đến Dashboard', icon: '🏠', url: '/home', shortcut: 'g d' },
  { id: 'nav-crm', type: 'navigation', title: 'Go to CRM', titleVi: 'Đi đến CRM', icon: '💼', url: '/home/crm', shortcut: 'g c' },
  { id: 'nav-hrm', type: 'navigation', title: 'Go to HRM', titleVi: 'Đi đến HRM', icon: '👥', url: '/home/hrm', shortcut: 'g h' },
  { id: 'nav-projects', type: 'navigation', title: 'Go to Projects', titleVi: 'Đi đến Dự án', icon: '📁', url: '/home/projects', shortcut: 'g p' },
  { id: 'nav-inventory', type: 'navigation', title: 'Go to Inventory', titleVi: 'Đi đến Kho', icon: '📦', url: '/home/inventory', shortcut: 'g i' },
  { id: 'nav-finance', type: 'navigation', title: 'Go to Finance', titleVi: 'Đi đến Tài chính', icon: '💰', url: '/home/finance', shortcut: 'g f' },
  
  // Quick Actions
  { id: 'action-new-lead', type: 'action', title: 'Create New Lead', titleVi: 'Tạo Lead mới', icon: '➕', shortcut: 'n l' },
  { id: 'action-new-task', type: 'action', title: 'Create New Task', titleVi: 'Tạo Task mới', icon: '✅', shortcut: 'n t' },
  { id: 'action-new-invoice', type: 'action', title: 'Create New Invoice', titleVi: 'Tạo Hóa đơn mới', icon: '📄', shortcut: 'n i' },
]
