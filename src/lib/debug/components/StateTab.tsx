// ============================================================================
// DEVELOPER DEBUG PANEL - STATE TAB COMPONENT
// GoldenEnergy HOME Platform - State Inspector
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useDebugStore } from '../store';
import type { StoreSnapshot, StateDiff } from '../types';

// ============================================================================
// JSON TREE VIEWER
// ============================================================================

interface JsonTreeProps {
  data: unknown;
  depth?: number;
  expanded?: boolean;
}

function JsonTree({ data, depth = 0, expanded: defaultExpanded = true }: JsonTreeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded && depth < 2);

  if (data === null) {
    return <span className="text-orange-400">null</span>;
  }

  if (data === undefined) {
    return <span className="text-gray-500">undefined</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-purple-400">{data.toString()}</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-green-400">{data}</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-yellow-400">"{data}"</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-400">[]</span>;
    }

    return (
      <div>
        <span
          className="cursor-pointer text-gray-400 hover:text-gray-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'} Array({data.length})
        </span>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-700 pl-2">
            {data.map((item, index) => (
              <div key={index} className="flex">
                <span className="text-gray-500 mr-2">{index}:</span>
                <JsonTree data={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-gray-400">{'{}'}</span>;
    }

    return (
      <div>
        <span
          className="cursor-pointer text-gray-400 hover:text-gray-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▼' : '▶'} Object({entries.length})
        </span>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-700 pl-2">
            {entries.map(([key, value]) => (
              <div key={key} className="flex">
                <span className="text-cyan-400 mr-2">{key}:</span>
                <JsonTree data={value} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <span className="text-gray-400">{String(data)}</span>;
}

// ============================================================================
// DIFF VIEWER
// ============================================================================

interface DiffViewerProps {
  diffs: StateDiff[];
}

function DiffViewer({ diffs }: DiffViewerProps) {
  if (diffs.length === 0) {
    return <span className="text-gray-500 text-xs">No changes</span>;
  }

  return (
    <div className="space-y-1">
      {diffs.map((diff, index) => (
        <div key={index} className="text-xs font-mono">
          <span
            className={`${
              diff.type === 'add'
                ? 'text-green-400'
                : diff.type === 'remove'
                  ? 'text-red-400'
                  : 'text-yellow-400'
            }`}
          >
            {diff.type === 'add' ? '+' : diff.type === 'remove' ? '-' : '~'}
          </span>{' '}
          <span className="text-cyan-400">{diff.path}:</span>{' '}
          {diff.type !== 'add' && (
            <span className="text-red-300 line-through">
              {JSON.stringify(diff.oldValue)}
            </span>
          )}{' '}
          {diff.type !== 'remove' && (
            <span className="text-green-300">{JSON.stringify(diff.newValue)}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// SNAPSHOT ITEM
// ============================================================================

interface SnapshotItemProps {
  snapshot: StoreSnapshot;
  isSelected: boolean;
  onSelect: () => void;
}

function SnapshotItem({ snapshot, isSelected, onSelect }: SnapshotItemProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 border-b border-gray-700 cursor-pointer hover:bg-gray-800 ${
        isSelected ? 'bg-blue-900/30' : ''
      }`}
    >
      <span className="text-gray-500 text-xs font-mono">
        {formatTime(snapshot.timestamp)}
      </span>
      <span className="text-cyan-400 text-xs font-medium">{snapshot.storeName}</span>
      {snapshot.action && (
        <span className="text-gray-400 text-xs">({snapshot.action})</span>
      )}
      {snapshot.diff && (
        <span className="text-yellow-500 text-xs ml-auto">
          {snapshot.diff.length} changes
        </span>
      )}
    </div>
  );
}

// ============================================================================
// STATE TAB COMPONENT
// ============================================================================

export function StateTab() {
  const storesMap = useDebugStore((state) => state.stores);
  const snapshots = useDebugStore((state) => state.snapshots);
  const clearSnapshots = useDebugStore((state) => state.clearSnapshots);

  // Compute store names in useMemo
  const stores = useMemo(() => Array.from(storesMap.keys()), [storesMap]);

  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'current' | 'history'>('current');

  const filteredSnapshots = useMemo(() => {
    if (!selectedStore) return snapshots;
    return snapshots.filter((s) => s.storeName === selectedStore);
  }, [snapshots, selectedStore]);

  const selectedSnapshot = useMemo(
    () => snapshots.find((s) => s.id === selectedSnapshotId),
    [snapshots, selectedSnapshotId]
  );

  const currentStoreState = useMemo(() => {
    if (!selectedStore) return null;
    const store = storesMap.get(selectedStore);
    return store?.getState() ?? null;
  }, [selectedStore, storesMap]);

  return (
    <div className="flex h-full bg-gray-900">
      {/* Left panel - Store list */}
      <div className="w-48 border-r border-gray-700 flex flex-col">
        <div className="px-3 py-2 border-b border-gray-700 bg-gray-800">
          <span className="text-xs font-medium text-gray-400">Stores</span>
        </div>
        <div className="flex-1 overflow-auto">
          {stores.length === 0 ? (
            <div className="p-3 text-xs text-gray-500">No stores registered</div>
          ) : (
            stores.map((storeName) => (
              <div
                key={storeName}
                onClick={() => setSelectedStore(storeName)}
                className={`px-3 py-2 text-xs cursor-pointer hover:bg-gray-800 ${
                  selectedStore === storeName ? 'bg-blue-900/30 text-white' : 'text-gray-300'
                }`}
              >
                {storeName}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Middle panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('current')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'current'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`px-2 py-1 text-xs rounded ${
                viewMode === 'history'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              History ({filteredSnapshots.length})
            </button>
          </div>
          <div className="flex-1" />
          <button
            onClick={clearSnapshots}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            Clear
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-3">
          {viewMode === 'current' ? (
            selectedStore && currentStoreState ? (
              <div className="text-xs font-mono">
                <JsonTree data={currentStoreState} />
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Select a store to view state</div>
            )
          ) : (
            <div className="flex h-full">
              {/* Snapshot list */}
              <div className="w-64 border-r border-gray-700 overflow-auto">
                {filteredSnapshots.length === 0 ? (
                  <div className="p-3 text-xs text-gray-500">No snapshots</div>
                ) : (
                  filteredSnapshots.map((snapshot) => (
                    <SnapshotItem
                      key={snapshot.id}
                      snapshot={snapshot}
                      isSelected={snapshot.id === selectedSnapshotId}
                      onSelect={() => setSelectedSnapshotId(snapshot.id)}
                    />
                  ))
                )}
              </div>

              {/* Snapshot detail */}
              <div className="flex-1 p-3 overflow-auto">
                {selectedSnapshot ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-2">
                        State at {selectedSnapshot.timestamp.toLocaleString()}
                      </h4>
                      <div className="text-xs font-mono">
                        <JsonTree data={selectedSnapshot.state} />
                      </div>
                    </div>
                    {selectedSnapshot.diff && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-2">Changes</h4>
                        <DiffViewer diffs={selectedSnapshot.diff} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Select a snapshot to view details
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StateTab;
