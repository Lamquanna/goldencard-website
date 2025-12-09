// ============================================================================
// DEVELOPER DEBUG PANEL - SETTINGS TAB COMPONENT
// GoldenEnergy HOME Platform - Debug Panel Configuration
// ============================================================================

'use client';

import React from 'react';
import { useDebugStore } from '../store';
import type { PanelPosition, DebugPanelConfig } from '../types';

// ============================================================================
// TOGGLE SWITCH
// ============================================================================

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ enabled, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-start justify-between py-2">
      <div>
        <div className="text-sm text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          enabled ? 'bg-blue-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// ============================================================================
// NUMBER INPUT
// ============================================================================

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
  min?: number;
  max?: number;
}

function NumberInput({ value, onChange, label, description, min, max }: NumberInputProps) {
  return (
    <div className="flex items-start justify-between py-2">
      <div>
        <div className="text-sm text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-20 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white text-right focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

// ============================================================================
// SELECT INPUT
// ============================================================================

interface SelectInputProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  label: string;
  options: { value: T; label: string }[];
  description?: string;
}

function SelectInput<T extends string>({
  value,
  onChange,
  label,
  options,
  description,
}: SelectInputProps<T>) {
  return (
    <div className="flex items-start justify-between py-2">
      <div>
        <div className="text-sm text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// SECTION HEADER
// ============================================================================

interface SectionHeaderProps {
  title: string;
}

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-4 pb-2 border-b border-gray-700">
      {title}
    </h3>
  );
}

// ============================================================================
// SETTINGS TAB COMPONENT
// ============================================================================

export function SettingsTab() {
  const config = useDebugStore((state) => state.config);
  const setConfig = useDebugStore((state) => state.setConfig);
  const reset = useDebugStore((state) => state.reset);

  const updateConsole = (updates: Partial<DebugPanelConfig['console']>) => {
    setConfig({ console: { ...config.console, ...updates } });
  };

  const updateNetwork = (updates: Partial<DebugPanelConfig['network']>) => {
    setConfig({ network: { ...config.network, ...updates } });
  };

  const updateState = (updates: Partial<DebugPanelConfig['state']>) => {
    setConfig({ state: { ...config.state, ...updates } });
  };

  const updatePerformance = (updates: Partial<DebugPanelConfig['performance']>) => {
    setConfig({ performance: { ...config.performance, ...updates } });
  };

  const positionOptions: { value: PanelPosition; label: string }[] = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'right', label: 'Right' },
    { value: 'left', label: 'Left' },
    { value: 'floating', label: 'Floating' },
  ];

  return (
    <div className="h-full overflow-auto bg-gray-900">
      <div className="p-4 max-w-2xl space-y-2">
        {/* General Settings */}
        <SectionHeader title="General" />
        
        <ToggleSwitch
          label="Enable Debug Panel"
          description="Toggle the debug panel on/off"
          enabled={config.enabled}
          onChange={(enabled) => setConfig({ enabled })}
        />

        <SelectInput
          label="Panel Position"
          description="Where the debug panel appears"
          value={config.position}
          onChange={(position) => setConfig({ position })}
          options={positionOptions}
        />

        <NumberInput
          label="Panel Height"
          description="Height when positioned at bottom (px)"
          value={config.height}
          onChange={(height) => setConfig({ height })}
          min={100}
          max={800}
        />

        <NumberInput
          label="Panel Width"
          description="Width when positioned on sides (px)"
          value={config.width}
          onChange={(width) => setConfig({ width })}
          min={200}
          max={800}
        />

        {/* Console Settings */}
        <SectionHeader title="Console" />

        <NumberInput
          label="Max Log Entries"
          description="Maximum number of logs to keep"
          value={config.console.maxEntries}
          onChange={(maxEntries) => updateConsole({ maxEntries })}
          min={100}
          max={2000}
        />

        <ToggleSwitch
          label="Show Timestamp"
          description="Display timestamp for each log entry"
          enabled={config.console.showTimestamp}
          onChange={(showTimestamp) => updateConsole({ showTimestamp })}
        />

        <ToggleSwitch
          label="Show Category"
          description="Display category for each log entry"
          enabled={config.console.showCategory}
          onChange={(showCategory) => updateConsole({ showCategory })}
        />

        <ToggleSwitch
          label="Preserve on Navigate"
          description="Keep logs when navigating between pages"
          enabled={config.console.preserveOnNavigate}
          onChange={(preserveOnNavigate) => updateConsole({ preserveOnNavigate })}
        />

        {/* Network Settings */}
        <SectionHeader title="Network" />

        <NumberInput
          label="Max Requests"
          description="Maximum number of requests to keep"
          value={config.network.maxEntries}
          onChange={(maxEntries) => updateNetwork({ maxEntries })}
          min={50}
          max={500}
        />

        <ToggleSwitch
          label="Capture Request Body"
          description="Store request body content"
          enabled={config.network.captureRequestBody}
          onChange={(captureRequestBody) => updateNetwork({ captureRequestBody })}
        />

        <ToggleSwitch
          label="Capture Response Body"
          description="Store response body content"
          enabled={config.network.captureResponseBody}
          onChange={(captureResponseBody) => updateNetwork({ captureResponseBody })}
        />

        {/* State Settings */}
        <SectionHeader title="State" />

        <NumberInput
          label="Max Snapshots"
          description="Maximum number of state snapshots"
          value={config.state.maxSnapshots}
          onChange={(maxSnapshots) => updateState({ maxSnapshots })}
          min={10}
          max={200}
        />

        <ToggleSwitch
          label="Auto Capture"
          description="Automatically capture state changes"
          enabled={config.state.autoCapture}
          onChange={(autoCapture) => updateState({ autoCapture })}
        />

        {/* Performance Settings */}
        <SectionHeader title="Performance" />

        <ToggleSwitch
          label="Track Renders"
          description="Track component render times"
          enabled={config.performance.enableRenderTracking}
          onChange={(enableRenderTracking) => updatePerformance({ enableRenderTracking })}
        />

        <ToggleSwitch
          label="Track Memory"
          description="Track memory usage (Chrome only)"
          enabled={config.performance.enableMemoryTracking}
          onChange={(enableMemoryTracking) => updatePerformance({ enableMemoryTracking })}
        />

        <NumberInput
          label="Sample Rate (ms)"
          description="How often to sample performance metrics"
          value={config.performance.sampleRate}
          onChange={(sampleRate) => updatePerformance({ sampleRate })}
          min={100}
          max={10000}
        />

        {/* Reset */}
        <SectionHeader title="Reset" />
        
        <div className="pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded"
          >
            Reset All Data
          </button>
          <p className="text-xs text-gray-500 mt-2">
            This will clear all logs, requests, snapshots, and metrics. Settings will be preserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;
