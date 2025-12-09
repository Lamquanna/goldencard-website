// ============================================================================
// CHART CARD COMPONENT
// GoldenEnergy HOME Platform - Dashboard Widget
// ============================================================================

'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ChartCardProps, ChartDataPoint, ChartSeries } from './types';

// ============================================================================
// SKELETON LOADER
// ============================================================================

function ChartCardSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
      <div className="space-y-3">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="mt-4" style={{ height }}>
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// SIMPLE BAR CHART
// ============================================================================

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height: number;
  showLabels?: boolean;
}

function SimpleBarChart({ data, height, showLabels = true }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  
  return (
    <div className="flex items-end justify-between gap-2 h-full px-2">
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 30);
        
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: barHeight }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={cn(
                'w-full max-w-[40px] rounded-t-md',
                item.color || 'bg-gradient-to-t from-yellow-500 to-yellow-400'
              )}
              style={{ 
                backgroundColor: item.color ? undefined : undefined,
                background: item.color || 'linear-gradient(to top, #eab308, #facc15)'
              }}
              title={`${item.label}: ${item.value.toLocaleString('vi-VN')}`}
            />
            {showLabels && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate max-w-full">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// SIMPLE LINE CHART (Sparkline)
// ============================================================================

interface SimpleLineChartProps {
  data: number[];
  height: number;
  color?: string;
}

function SimpleLineChart({ data, height, color = '#eab308' }: SimpleLineChartProps) {
  const { path, area } = useMemo(() => {
    if (data.length < 2) return { path: '', area: '' };
    
    const maxValue = Math.max(...data, 1);
    const minValue = Math.min(...data, 0);
    const range = maxValue - minValue || 1;
    
    const width = 100;
    const padding = 5;
    const usableHeight = height - padding * 2;
    const usableWidth = width - padding * 2;
    
    const points = data.map((value, index) => ({
      x: padding + (index / (data.length - 1)) * usableWidth,
      y: padding + usableHeight - ((value - minValue) / range) * usableHeight,
    }));
    
    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
    
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
    
    return { path: pathD, area: areaD };
  }, [data, height]);
  
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
      {/* Area fill */}
      <path
        d={area}
        fill={color}
        fillOpacity={0.1}
      />
      {/* Line */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1 }}
      />
    </svg>
  );
}

// ============================================================================
// SIMPLE PIE CHART
// ============================================================================

interface SimplePieChartProps {
  data: ChartDataPoint[];
  size: number;
  showLegend?: boolean;
}

function SimplePieChart({ data, size, showLegend = true }: SimplePieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  
  const segments = useMemo(() => {
    let currentAngle = -90; // Start from top
    const radius = size / 2 - 10;
    const center = size / 2;
    
    return data.map((item, index) => {
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      
      const defaultColors = ['#eab308', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];
      
      return {
        path,
        color: item.color || defaultColors[index % defaultColors.length],
        label: item.label,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(1),
      };
    });
  }, [data, size, total]);
  
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size}>
        {segments.map((segment, index) => (
          <motion.path
            key={index}
            d={segment.path}
            fill={segment.color}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{segment.label}: {segment.value.toLocaleString('vi-VN')} ({segment.percentage}%)</title>
          </motion.path>
        ))}
      </svg>
      
      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {segment.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {segment.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE DONUT CHART
// ============================================================================

interface SimpleDonutChartProps {
  data: ChartDataPoint[];
  size: number;
  showLegend?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
}

function SimpleDonutChart({ 
  data, 
  size, 
  showLegend = true,
  centerLabel,
  centerValue 
}: SimpleDonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size / 2 - 10;
  const innerRadius = radius * 0.6;
  const center = size / 2;
  
  const segments = useMemo(() => {
    let currentAngle = -90;
    
    return data.map((item, index) => {
      const angle = (item.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;
      
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);
      
      const ix1 = center + innerRadius * Math.cos(startRad);
      const iy1 = center + innerRadius * Math.sin(startRad);
      const ix2 = center + innerRadius * Math.cos(endRad);
      const iy2 = center + innerRadius * Math.sin(endRad);
      
      const largeArc = angle > 180 ? 1 : 0;
      
      const path = `
        M ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${ix2} ${iy2}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}
        Z
      `;
      
      const defaultColors = ['#eab308', '#3b82f6', '#22c55e', '#ef4444', '#8b5cf6', '#f97316'];
      
      return {
        path,
        color: item.color || defaultColors[index % defaultColors.length],
        label: item.label,
        value: item.value,
        percentage: ((item.value / total) * 100).toFixed(1),
      };
    });
  }, [data, size, total, radius, innerRadius, center]);
  
  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg width={size} height={size}>
          {segments.map((segment, index) => (
            <motion.path
              key={index}
              d={segment.path}
              fill={segment.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="hover:opacity-80 transition-opacity cursor-pointer"
            >
              <title>{segment.label}: {segment.value.toLocaleString('vi-VN')} ({segment.percentage}%)</title>
            </motion.path>
          ))}
        </svg>
        
        {/* Center label */}
        {(centerLabel || centerValue) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {typeof centerValue === 'number' ? centerValue.toLocaleString('vi-VN') : centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>
      
      {showLegend && (
        <div className="space-y-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {segment.label}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {segment.percentage}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

function isChartDataPoints(data: ChartDataPoint[] | ChartSeries[]): data is ChartDataPoint[] {
  return data.length > 0 && 'label' in data[0];
}

export function ChartCard({
  title,
  subtitle,
  chartType,
  data,
  labels,
  height = 200,
  showLegend = true,
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  className,
}: ChartCardProps) {
  if (loading) {
    return <ChartCardSkeleton height={height} />;
  }
  
  const isEmpty = !data || data.length === 0;
  
  // Convert series data to points if needed
  const chartData = useMemo(() => {
    if (isEmpty) return [];
    if (isChartDataPoints(data)) return data;
    
    // Convert series to data points using labels
    const series = data as ChartSeries[];
    if (series.length === 0 || !series[0].data) return [];
    
    return series[0].data.map((value, index) => ({
      label: labels?.[index] || `${index + 1}`,
      value,
      color: series[0].color,
    }));
  }, [data, labels, isEmpty]);
  
  // Get series data for line charts
  const seriesData = useMemo(() => {
    if (isEmpty) return [];
    if (!isChartDataPoints(data)) {
      const series = data as ChartSeries[];
      return series[0]?.data || [];
    }
    return data.map((d) => d.value);
  }, [data, isEmpty]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
      
      {/* Chart */}
      <div style={{ height }}>
        {isEmpty ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            {emptyMessage}
          </div>
        ) : chartType === 'bar' ? (
          <SimpleBarChart data={chartData} height={height} />
        ) : chartType === 'line' || chartType === 'area' || chartType === 'sparkline' ? (
          <SimpleLineChart data={seriesData} height={height} />
        ) : chartType === 'pie' ? (
          <SimplePieChart data={chartData} size={Math.min(height, 200)} showLegend={showLegend} />
        ) : chartType === 'donut' ? (
          <SimpleDonutChart data={chartData} size={Math.min(height, 200)} showLegend={showLegend} />
        ) : (
          <SimpleBarChart data={chartData} height={height} />
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ChartCard;
