'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  X, 
  Clock, 
  ArrowRight,
  Command,
  Filter,
  Loader2 
} from 'lucide-react'
import { useGlobalSearch, commandPaletteItems, type SearchResult, type SearchableModule } from '@/app/erp/core/global-search'
import { useHotkeys, useOnClickOutside } from '@/lib/hooks/useDebounce'

interface GlobalSearchProps {
  isOpen?: boolean
  onClose?: () => void
}

export function GlobalSearchModal({ isOpen = false, onClose }: GlobalSearchProps) {
  const router = useRouter()
  const modalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const {
    query,
    setQuery,
    results,
    suggestions,
    loading,
    selectedModules,
    setSelectedModules,
    recentSearches,
  } = useGlobalSearch()

  // Close on click outside
  useOnClickOutside(modalRef, () => onClose?.())

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : commandPaletteItems.slice(0, 6)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % items.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results.length > 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex])
        } else if (commandPaletteItems[selectedIndex]) {
          const item = commandPaletteItems[selectedIndex]
          if (item.url) {
            router.push(item.url)
            onClose?.()
          }
        }
        break
      case 'Escape':
        onClose?.()
        break
    }
  }, [results, selectedIndex, onClose, router])

  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    onClose?.()
  }

  const toggleModule = (module: SearchableModule) => {
    setSelectedModules(prev => 
      prev.includes(module)
        ? prev.filter(m => m !== module)
        : [...prev, module]
    )
  }

  const modules: { id: SearchableModule; name: string; icon: string }[] = [
    { id: 'crm', name: 'CRM', icon: '💼' },
    { id: 'hrm', name: 'HRM', icon: '👥' },
    { id: 'project', name: 'Projects', icon: '📁' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'finance', name: 'Finance', icon: '💰' },
    { id: 'files', name: 'Files', icon: '📂' },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[15vh]">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm... (leads, tasks, invoices...)"
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400"
          />
          {loading && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${
              selectedModules.length > 0 ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Module Filters */}
        {showFilters && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => toggleModule(module.id)}
                className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors ${
                  selectedModules.includes(module.id)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span>{module.icon}</span>
                <span>{module.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {/* Search Results */}
          {query.length >= 2 && results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-1.5">
                Kết quả ({results.length})
              </div>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-xl">{result.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </div>
                    {result.description && (
                      <div className="text-sm text-gray-500 truncate">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                    {result.module}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {query.length >= 2 && suggestions.length > 0 && results.length === 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-1.5">
                Gợi ý
              </div>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuery(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* No Query - Show Quick Actions & Recent */}
          {query.length < 2 && (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 px-3 py-1.5 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    Tìm kiếm gần đây
                  </div>
                  {recentSearches.slice(0, 5).map((search) => (
                    <button
                      key={search}
                      onClick={() => setQuery(search)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 px-3 py-1.5">
                  Điều hướng nhanh
                </div>
                {commandPaletteItems.filter(i => i.type === 'navigation').slice(0, 6).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.url) {
                        router.push(item.url)
                        onClose?.()
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      index === selectedIndex && query.length < 2
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.titleVi}
                      </div>
                    </div>
                    {item.shortcut && (
                      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* No Results */}
          {query.length >= 2 && results.length === 0 && suggestions.length === 0 && !loading && (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">
                <Search className="w-12 h-12 mx-auto" />
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Không tìm thấy kết quả cho "{query}"
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↓</kbd>
              Di chuyển
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Enter</kbd>
              Chọn
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">Esc</kbd>
              Đóng
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3.5 h-3.5" />
            <span>+ K để mở</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Search Trigger Button
export function SearchTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  // Cmd+K / Ctrl+K to open
  useHotkeys([
    { key: 'k', meta: true, callback: () => setIsOpen(true) },
    { key: 'k', ctrl: true, callback: () => setIsOpen(true) },
  ])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm text-gray-500 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Tìm kiếm...</span>
        <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 rounded shadow-sm">
          ⌘K
        </kbd>
      </button>
      
      <GlobalSearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
