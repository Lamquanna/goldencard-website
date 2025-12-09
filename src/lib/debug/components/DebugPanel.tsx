// ============================================================================
// DEVELOPER DEBUG PANEL - MAIN COMPONENT
// GoldenEnergy HOME Platform - Debug Panel Container
// ============================================================================

'use client';

import React, { useEffect, useCallback } from 'react';
import { useDebugStore } from '../store';
import { useMemoryTracker } from '../hooks';
import { ConsoleTab } from './ConsoleTab';
import { NetworkTab } from './NetworkTab';
import { StateTab } from './StateTab';
import { PerformanceTab } from './PerformanceTab';
import { FlagsTab } from './FlagsTab';
import { SettingsTab } from './SettingsTab';
import type { DebugTab, PanelPosition } from '../types';

// ============================================================================
// TAB BUTTON
// ============================================================================

interface TabButtonProps {
  tab: DebugTab;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ tab, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
        isActive
          ? 'border-blue-500 text-white'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

// ============================================================================
// TAB CONTENT
// ============================================================================

interface TabContentProps {
  activeTab: DebugTab;
}

function TabContent({ activeTab }: TabContentProps) {
  switch (activeTab) {
    case 'console':
      return <ConsoleTab />;
    case 'network':
      return <NetworkTab />;
    case 'state':
      return <StateTab />;
    case 'performance':
      return <PerformanceTab />;
    case 'flags':
      return <FlagsTab />;
    case 'settings':
      return <SettingsTab />;
    default:
      return null;
  }
}

// ============================================================================
// POSITION STYLES
// ============================================================================

function getPositionStyles(position: PanelPosition, height: number, width: number, expanded: boolean) {
  if (!expanded) {
    return {
      container: 'fixed bottom-0 right-4 z-[9999]',
      panel: '',
    };
  }

  switch (position) {
    case 'bottom':
      return {
        container: 'fixed bottom-0 left-0 right-0 z-[9999]',
        panel: `h-[${height}px]`,
      };
    case 'right':
      return {
        container: 'fixed top-0 right-0 bottom-0 z-[9999]',
        panel: `w-[${width}px]`,
      };
    case 'left':
      return {
        container: 'fixed top-0 left-0 bottom-0 z-[9999]',
        panel: `w-[${width}px]`,
      };
    case 'floating':
      return {
        container: 'fixed bottom-4 right-4 z-[9999]',
        panel: `w-[${width + 200}px] h-[${height + 100}px]`,
      };
    default:
      return {
        container: 'fixed bottom-0 left-0 right-0 z-[9999]',
        panel: '',
      };
  }
}

// ============================================================================
// DEBUG PANEL COMPONENT
// ============================================================================

export function DebugPanel() {
  const config = useDebugStore((state) => state.config);
  const togglePanel = useDebugStore((state) => state.togglePanel);
  const setActiveTab = useDebugStore((state) => state.setActiveTab);
  const setPosition = useDebugStore((state) => state.setPosition);
  const logs = useDebugStore((state) => state.logs);
  const requests = useDebugStore((state) => state.requests);

  // Track memory usage
  useMemoryTracker(config.performance.sampleRate);

  // Keyboard shortcut to toggle panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel]);

  if (!config.enabled) {
    return null;
  }

  const tabs: { id: DebugTab; label: string }[] = [
    { id: 'console', label: `Console (${logs.length})` },
    { id: 'network', label: `Network (${requests.length})` },
    { id: 'state', label: 'State' },
    { id: 'performance', label: 'Performance' },
    { id: 'flags', label: 'Flags' },
    { id: 'settings', label: 'Settings' },
  ];

  const positionStyles = getPositionStyles(
    config.position,
    config.height,
    config.width,
    config.expanded
  );

  // Collapsed view - just show toggle button
  if (!config.expanded) {
    return (
      <div className={positionStyles.container}>
        <button
          onClick={togglePanel}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-t-lg shadow-lg hover:bg-gray-700 border border-b-0 border-gray-700"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          <span className="text-xs font-medium">Debug</span>
          {logs.filter((l) => l.level === 'error').length > 0 && (
            <span className="w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
      </div>
    );
  }

  // Expanded view
  return (
    <div className={positionStyles.container}>
      <div
        className="bg-gray-900 border-t border-gray-700 shadow-2xl flex flex-col"
        style={{
          height: config.position === 'bottom' ? config.height : '100%',
          width: config.position === 'right' || config.position === 'left' ? config.width : '100%',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-2 border-b border-gray-700 bg-gray-800">
          {/* Tabs */}
          <div className="flex items-center">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                tab={tab.id}
                label={tab.label}
                isActive={config.activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Position selector */}
            <select
              value={config.position}
              onChange={(e) => setPosition(e.target.value as PanelPosition)}
              className="px-2 py-1 text-xs bg-gray-700 border border-gray-600 rounded text-white focus:outline-none"
            >
              <option value="bottom">Bottom</option>
              <option value="right">Right</option>
              <option value="left">Left</option>
              <option value="floating">Float</option>
            </select>

            {/* Close button */}
            <button
              onClick={togglePanel}
              className="p-1 text-gray-400 hover:text-white"
              title="Close (Ctrl+Shift+D)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <TabContent activeTab={config.activeTab} />
        </div>
      </div>
    </div>
  );
}

export default DebugPanel;
