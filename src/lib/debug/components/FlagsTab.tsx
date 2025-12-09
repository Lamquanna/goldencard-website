// ============================================================================
// DEVELOPER DEBUG PANEL - FEATURE FLAGS TAB COMPONENT
// GoldenEnergy HOME Platform - Feature Flag Management
// ============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useDebugStore } from '../store';
import type { FeatureFlag, FeatureFlagOverride } from '../types';

// ============================================================================
// FLAG ITEM COMPONENT
// ============================================================================

interface FlagItemProps {
  flag: FeatureFlag;
  override?: FeatureFlagOverride;
  isEnabled: boolean;
  onToggleOverride: (enabled: boolean) => void;
  onClearOverride: () => void;
}

function FlagItem({ flag, override, isEnabled, onToggleOverride, onClearOverride }: FlagItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasExpiredOverride = override?.expiresAt && new Date() > override.expiresAt;

  return (
    <div className="border-b border-gray-700 hover:bg-gray-800">
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Toggle */}
        <button
          onClick={() => onToggleOverride(!isEnabled)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            isEnabled ? 'bg-green-500' : 'bg-gray-600'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              isEnabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white font-medium">{flag.name}</span>
            <span className="text-xs text-gray-500 font-mono">{flag.id}</span>
            {override && !hasExpiredOverride && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                Override
              </span>
            )}
          </div>
          {flag.description && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">{flag.description}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {override && (
            <button
              onClick={onClearOverride}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded hover:bg-gray-700"
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="px-3 pb-3 text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2 bg-gray-800 rounded p-2">
            <div>
              <span className="text-gray-400">Default:</span>{' '}
              <span className={flag.defaultValue ? 'text-green-400' : 'text-red-400'}>
                {flag.defaultValue ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Current:</span>{' '}
              <span className={isEnabled ? 'text-green-400' : 'text-red-400'}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {flag.environment && (
              <div className="col-span-2">
                <span className="text-gray-400">Environments:</span>{' '}
                <span className="text-cyan-400">{flag.environment.join(', ')}</span>
              </div>
            )}
            {override?.expiresAt && (
              <div className="col-span-2">
                <span className="text-gray-400">Override expires:</span>{' '}
                <span className={hasExpiredOverride ? 'text-red-400' : 'text-yellow-400'}>
                  {override.expiresAt.toLocaleString()}
                  {hasExpiredOverride && ' (expired)'}
                </span>
              </div>
            )}
          </div>
          {flag.metadata && Object.keys(flag.metadata).length > 0 && (
            <div className="bg-gray-800 rounded p-2">
              <span className="text-gray-400">Metadata:</span>
              <pre className="text-gray-300 mt-1 font-mono">
                {JSON.stringify(flag.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADD FLAG DIALOG
// ============================================================================

interface AddFlagDialogProps {
  onAdd: (flag: FeatureFlag) => void;
  onClose: () => void;
}

function AddFlagDialog({ onAdd, onClose }: AddFlagDialogProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !name.trim()) return;

    onAdd({
      id: id.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      enabled: defaultValue,
      defaultValue,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-lg p-4 w-96 space-y-4"
      >
        <h3 className="text-lg font-medium text-white">Add Feature Flag</h3>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">ID</label>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="my-feature-flag"
            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Feature Flag"
            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description..."
            className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500 h-20 resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="defaultValue"
            checked={defaultValue}
            onChange={(e) => setDefaultValue(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="defaultValue" className="text-sm text-gray-300">
            Enabled by default
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!id.trim() || !name.trim()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Flag
          </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// FEATURE FLAGS TAB COMPONENT
// ============================================================================

export function FlagsTab() {
  const featureFlags = useDebugStore((state) => state.featureFlags);
  const flagOverrides = useDebugStore((state) => state.flagOverrides);
  const isFlagEnabled = useDebugStore((state) => state.isFlagEnabled);
  const registerFlag = useDebugStore((state) => state.registerFlag);
  const setFlagOverride = useDebugStore((state) => state.setFlagOverride);
  const clearFlagOverride = useDebugStore((state) => state.clearFlagOverride);
  const clearAllOverrides = useDebugStore((state) => state.clearAllOverrides);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOverrides, setFilterOverrides] = useState(false);

  const flags = useMemo(() => {
    let list = Array.from(featureFlags.values());

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.id.toLowerCase().includes(query) ||
          f.name.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query)
      );
    }

    // Filter by overrides
    if (filterOverrides) {
      list = list.filter((f) => flagOverrides.has(f.id));
    }

    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [featureFlags, flagOverrides, searchQuery, filterOverrides]);

  const overrideCount = flagOverrides.size;

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search flags..."
          className="flex-1 px-3 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={() => setFilterOverrides(!filterOverrides)}
          className={`px-2 py-1 text-xs rounded ${
            filterOverrides ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'
          }`}
        >
          Overrides ({overrideCount})
        </button>
        <button
          onClick={clearAllOverrides}
          disabled={overrideCount === 0}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded disabled:opacity-50"
        >
          Reset All
        </button>
        <button
          onClick={() => setShowAddDialog(true)}
          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
        >
          Add Flag
        </button>
      </div>

      {/* Flags list */}
      <div className="flex-1 overflow-auto">
        {flags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-sm">No feature flags found</p>
            <button
              onClick={() => setShowAddDialog(true)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Add your first flag
            </button>
          </div>
        ) : (
          flags.map((flag) => (
            <FlagItem
              key={flag.id}
              flag={flag}
              override={flagOverrides.get(flag.id)}
              isEnabled={isFlagEnabled(flag.id)}
              onToggleOverride={(enabled) => setFlagOverride(flag.id, enabled)}
              onClearOverride={() => clearFlagOverride(flag.id)}
            />
          ))
        )}
      </div>

      {/* Add dialog */}
      {showAddDialog && (
        <AddFlagDialog
          onAdd={registerFlag}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  );
}

export default FlagsTab;
