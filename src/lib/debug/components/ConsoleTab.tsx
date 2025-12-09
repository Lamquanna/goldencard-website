// ============================================================================
// DEVELOPER DEBUG PANEL - CONSOLE TAB COMPONENT
// GoldenEnergy HOME Platform - Debug Console/Log Viewer
// ============================================================================

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useDebugStore } from '../store';
import type { LogLevel, LogEntry } from '../types';

// ============================================================================
// LOG LEVEL BADGE
// ============================================================================

interface LogLevelBadgeProps {
  level: LogLevel;
}

function LogLevelBadge({ level }: LogLevelBadgeProps) {
  const colorMap: Record<LogLevel, string> = {
    debug: 'bg-gray-500 text-white',
    info: 'bg-blue-500 text-white',
    warn: 'bg-yellow-500 text-black',
    error: 'bg-red-500 text-white',
    trace: 'bg-purple-500 text-white',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase ${colorMap[level]}`}
    >
      {level}
    </span>
  );
}

// ============================================================================
// LOG ENTRY COMPONENT
// ============================================================================

interface LogEntryRowProps {
  entry: LogEntry;
  showTimestamp: boolean;
  showCategory: boolean;
}

function LogEntryRow({ entry, showTimestamp, showCategory }: LogEntryRowProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });
  };

  const hasData = entry.data !== undefined;

  return (
    <div
      className={`flex flex-col border-b border-gray-700 hover:bg-gray-800 ${
        entry.level === 'error' ? 'bg-red-900/20' : ''
      } ${entry.level === 'warn' ? 'bg-yellow-900/20' : ''}`}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 cursor-pointer"
        onClick={() => hasData && setExpanded(!expanded)}
      >
        {showTimestamp && (
          <span className="text-gray-500 text-xs font-mono whitespace-nowrap">
            {formatTime(entry.timestamp)}
          </span>
        )}
        <LogLevelBadge level={entry.level} />
        {showCategory && (
          <span className="text-cyan-400 text-xs font-mono">[{entry.category}]</span>
        )}
        <span className="text-gray-200 text-sm flex-1 truncate">{entry.message}</span>
        {hasData && (
          <span className="text-gray-500 text-xs">
            {expanded ? '▼' : '▶'}
          </span>
        )}
      </div>
      {expanded && hasData && (
        <div className="px-4 py-2 bg-gray-900 border-t border-gray-700">
          <pre className="text-xs text-gray-300 overflow-auto max-h-40 font-mono">
            {JSON.stringify(entry.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONSOLE TAB COMPONENT
// ============================================================================

export function ConsoleTab() {
  const allLogs = useDebugStore((state) => state.logs);
  const logFilter = useDebugStore((state) => state.logFilter);
  const config = useDebugStore((state) => state.config);
  const setLogFilter = useDebugStore((state) => state.setLogFilter);
  const clearLogs = useDebugStore((state) => state.clearLogs);
  const exportLogs = useDebugStore((state) => state.exportLogs);

  const [searchQuery, setSearchQuery] = useState(logFilter.searchQuery);

  // Filter logs in useMemo to avoid infinite loop
  const logs = useMemo(() => {
    return allLogs.filter((log) => {
      if (!logFilter.levels.includes(log.level)) return false;
      if (logFilter.categories.length > 0 && !logFilter.categories.includes(log.category)) return false;
      if (logFilter.searchQuery && !log.message.toLowerCase().includes(logFilter.searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allLogs, logFilter]);

  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'trace'];

  const handleLevelToggle = useCallback(
    (level: LogLevel) => {
      const newLevels = logFilter.levels.includes(level)
        ? logFilter.levels.filter((l) => l !== level)
        : [...logFilter.levels, level];
      setLogFilter({ levels: newLevels });
    },
    [logFilter.levels, setLogFilter]
  );

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setLogFilter({ searchQuery: e.target.value });
    },
    [setLogFilter]
  );

  const handleExport = useCallback(() => {
    const data = exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportLogs]);

  const logCounts = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        acc[log.level] = (acc[log.level] || 0) + 1;
        return acc;
      },
      {} as Record<LogLevel, number>
    );
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800">
        {/* Level filters */}
        <div className="flex items-center gap-1">
          {levels.map((level) => (
            <button
              key={level}
              onClick={() => handleLevelToggle(level)}
              className={`px-2 py-1 text-xs rounded ${
                logFilter.levels.includes(level)
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {level} ({logCounts[level] || 0})
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 mx-2">
          <input
            type="text"
            placeholder="Filter logs..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Actions */}
        <button
          onClick={clearLogs}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          Clear
        </button>
        <button
          onClick={handleExport}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          Export
        </button>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-auto">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            No logs to display
          </div>
        ) : (
          logs.map((entry) => (
            <LogEntryRow
              key={entry.id}
              entry={entry}
              showTimestamp={config.console.showTimestamp}
              showCategory={config.console.showCategory}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ConsoleTab;
