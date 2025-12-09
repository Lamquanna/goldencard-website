// ============================================================================
// DEVELOPER DEBUG PANEL - PERFORMANCE TAB COMPONENT
// GoldenEnergy HOME Platform - Performance Metrics Viewer
// ============================================================================

'use client';

import React, { useMemo, useState } from 'react';
import { useDebugStore } from '../store';
import type { ComponentRenderInfo, PerformanceMetric, MemoryInfo } from '../types';

// ============================================================================
// METRIC CARD
// ============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  const trendColor = trend === 'up' ? 'text-red-400' : trend === 'down' ? 'text-green-400' : 'text-gray-400';
  
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className="text-lg font-semibold text-white">{value}</div>
      {subtitle && (
        <div className={`text-xs ${trendColor}`}>{subtitle}</div>
      )}
    </div>
  );
}

// ============================================================================
// RENDER CHART (Simple bar visualization)
// ============================================================================

interface RenderChartProps {
  renders: ComponentRenderInfo[];
  maxRenders: number;
}

function RenderChart({ renders, maxRenders }: RenderChartProps) {
  return (
    <div className="space-y-2">
      {renders.map((render) => {
        const percentage = Math.min((render.renderCount / maxRenders) * 100, 100);
        const isSlowRender = render.averageRenderTime > 16; // > 16ms is slow
        
        return (
          <div key={render.componentName} className="flex items-center gap-2">
            <span className="text-xs text-gray-300 w-32 truncate" title={render.componentName}>
              {render.componentName}
            </span>
            <div className="flex-1 h-4 bg-gray-700 rounded overflow-hidden">
              <div
                className={`h-full ${isSlowRender ? 'bg-orange-500' : 'bg-blue-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 w-20 text-right">
              {render.renderCount}x ({render.averageRenderTime.toFixed(1)}ms)
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// MEMORY CHART (Simple line visualization)
// ============================================================================

interface MemoryChartProps {
  history: MemoryInfo[];
}

function MemoryChart({ history }: MemoryChartProps) {
  if (history.length < 2) {
    return <div className="text-gray-500 text-xs">Collecting memory data...</div>;
  }

  const maxMemory = Math.max(...history.map((m) => m.usedJSHeapSize));
  const minMemory = Math.min(...history.map((m) => m.usedJSHeapSize));
  const range = maxMemory - minMemory || 1;

  const formatBytes = (bytes: number) => {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>Memory Usage</span>
        <span>
          {formatBytes(history[history.length - 1]?.usedJSHeapSize || 0)} / {' '}
          {formatBytes(history[0]?.jsHeapSizeLimit || 0)}
        </span>
      </div>
      <div className="h-20 bg-gray-800 rounded relative overflow-hidden">
        <svg className="w-full h-full" viewBox={`0 0 ${history.length} 100`} preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={history
              .map((m, i) => {
                const y = 100 - ((m.usedJSHeapSize - minMemory) / range) * 80 - 10;
                return `${i},${y}`;
              })
              .join(' ')}
          />
        </svg>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{formatBytes(minMemory)}</span>
        <span>{formatBytes(maxMemory)}</span>
      </div>
    </div>
  );
}

// ============================================================================
// METRIC TABLE
// ============================================================================

interface MetricTableProps {
  metrics: PerformanceMetric[];
}

function MetricTable({ metrics }: MetricTableProps) {
  if (metrics.length === 0) {
    return <div className="text-gray-500 text-xs">No metrics recorded</div>;
  }

  return (
    <div className="overflow-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="text-left py-2 px-2">Name</th>
            <th className="text-left py-2 px-2">Category</th>
            <th className="text-right py-2 px-2">Value</th>
            <th className="text-right py-2 px-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {metrics.slice(0, 50).map((metric) => (
            <tr key={metric.id} className="border-b border-gray-800 hover:bg-gray-800">
              <td className="py-2 px-2 text-gray-200">{metric.name}</td>
              <td className="py-2 px-2 text-gray-400">{metric.category}</td>
              <td className="py-2 px-2 text-right text-cyan-400">
                {metric.value.toFixed(2)} {metric.unit}
              </td>
              <td className="py-2 px-2 text-right text-gray-500">
                {metric.timestamp.toLocaleTimeString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// PERFORMANCE TAB COMPONENT
// ============================================================================

export function PerformanceTab() {
  const metrics = useDebugStore((state) => state.metrics);
  const componentRenders = useDebugStore((state) => state.componentRenders);
  const memoryHistory = useDebugStore((state) => state.memoryHistory);
  const clearMetrics = useDebugStore((state) => state.clearMetrics);

  const [activeView, setActiveView] = useState<'overview' | 'renders' | 'metrics' | 'memory'>('overview');

  const renderData = useMemo(() => {
    const renders = Array.from(componentRenders.values());
    const sorted = renders.sort((a, b) => b.renderCount - a.renderCount);
    const maxRenders = Math.max(...renders.map((r) => r.renderCount), 1);
    return { renders: sorted.slice(0, 20), maxRenders };
  }, [componentRenders]);

  const stats = useMemo(() => {
    const renders = Array.from(componentRenders.values());
    const totalRenders = renders.reduce((sum, r) => sum + r.renderCount, 0);
    const avgRenderTime = renders.length > 0
      ? renders.reduce((sum, r) => sum + r.averageRenderTime, 0) / renders.length
      : 0;
    const slowRenders = renders.filter((r) => r.averageRenderTime > 16).length;
    
    const lastMemory = memoryHistory[memoryHistory.length - 1];
    const memoryUsage = lastMemory
      ? (lastMemory.usedJSHeapSize / lastMemory.jsHeapSizeLimit) * 100
      : 0;

    return { totalRenders, avgRenderTime, slowRenders, memoryUsage };
  }, [componentRenders, memoryHistory]);

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-1">
          {(['overview', 'renders', 'metrics', 'memory'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-2 py-1 text-xs rounded capitalize ${
                activeView === view
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {view}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={clearMetrics}
          className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
        >
          Clear
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        {activeView === 'overview' && (
          <div className="space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-3">
              <MetricCard
                title="Total Renders"
                value={stats.totalRenders}
              />
              <MetricCard
                title="Avg Render Time"
                value={`${stats.avgRenderTime.toFixed(2)}ms`}
                trend={stats.avgRenderTime > 16 ? 'up' : 'neutral'}
              />
              <MetricCard
                title="Slow Components"
                value={stats.slowRenders}
                subtitle={stats.slowRenders > 0 ? '> 16ms' : 'All good'}
                trend={stats.slowRenders > 0 ? 'up' : 'neutral'}
              />
              <MetricCard
                title="Memory Usage"
                value={`${stats.memoryUsage.toFixed(1)}%`}
                trend={stats.memoryUsage > 80 ? 'up' : 'neutral'}
              />
            </div>

            {/* Quick views */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-400 mb-3">Top Components</h4>
                <RenderChart
                  renders={renderData.renders.slice(0, 5)}
                  maxRenders={renderData.maxRenders}
                />
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-400 mb-3">Memory Trend</h4>
                <MemoryChart history={memoryHistory.slice(-50)} />
              </div>
            </div>
          </div>
        )}

        {activeView === 'renders' && (
          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-xs font-medium text-gray-400 mb-3">
              Component Renders ({renderData.renders.length})
            </h4>
            <RenderChart
              renders={renderData.renders}
              maxRenders={renderData.maxRenders}
            />
          </div>
        )}

        {activeView === 'metrics' && (
          <MetricTable metrics={metrics} />
        )}

        {activeView === 'memory' && (
          <div className="space-y-4">
            <MemoryChart history={memoryHistory} />
            {memoryHistory.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-400 mb-3">Memory Details</h4>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="text-gray-400">Used Heap</div>
                    <div className="text-white">
                      {((memoryHistory[memoryHistory.length - 1]?.usedJSHeapSize || 0) / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Total Heap</div>
                    <div className="text-white">
                      {((memoryHistory[memoryHistory.length - 1]?.totalJSHeapSize || 0) / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Heap Limit</div>
                    <div className="text-white">
                      {((memoryHistory[memoryHistory.length - 1]?.jsHeapSizeLimit || 0) / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceTab;
