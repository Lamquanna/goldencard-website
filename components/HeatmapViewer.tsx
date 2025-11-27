'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
}

interface HeatmapViewerProps {
  pagePath: string;
  dateRange?: { start: Date; end: Date };
  deviceType?: 'mobile' | 'tablet' | 'desktop' | 'all';
  className?: string;
}

export default function HeatmapViewer({
  pagePath,
  dateRange,
  deviceType = 'all',
  className = ''
}: HeatmapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [opacity, setOpacity] = useState(70);
  const [showOverlay, setShowOverlay] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch heatmap data from API
  useEffect(() => {
    async function fetchHeatmapData() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page_path: pagePath,
          device_type: deviceType,
        });

        if (dateRange) {
          params.append('start_date', dateRange.start.toISOString());
          params.append('end_date', dateRange.end.toISOString());
        }

        const response = await fetch(`/api/analytics/heatmap?${params}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch heatmap data: ${response.statusText}`);
        }

        const data = await response.json();
        setHeatmapData(data.points || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load heatmap data');
        console.error('Heatmap fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHeatmapData();
  }, [pagePath, dateRange, deviceType]);

  // Render heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate grid (100x100)
    const gridSize = 100;
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Create density map
    const densityMap: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));

    // Populate density map from aggregated data
    heatmapData.forEach(point => {
      const gridX = Math.floor(point.x);
      const gridY = Math.floor(point.y);
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        densityMap[gridX][gridY] += point.intensity;
      }
    });

    // Apply Gaussian blur for smoother heatmap
    const blurredMap = applyGaussianBlur(densityMap, 3);

    // Find max density for normalization
    const maxDensity = Math.max(...blurredMap.flat());

    if (maxDensity === 0) {
      return; // No data to display
    }

    // Render heatmap
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const intensity = blurredMap[x][y] / maxDensity;
        
        if (intensity > 0.01) { // Only draw cells with significant activity
          const color = getHeatmapColor(intensity);
          ctx.fillStyle = color;
          ctx.fillRect(
            x * cellWidth,
            y * cellHeight,
            cellWidth,
            cellHeight
          );
        }
      }
    }
  }, [heatmapData, showOverlay]);

  // Gaussian blur implementation
  function applyGaussianBlur(data: number[][], radius: number): number[][] {
    const size = data.length;
    const result: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    // Simple box blur approximation
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        let sum = 0;
        let count = 0;

        for (let dx = -radius; dx <= radius; dx++) {
          for (let dy = -radius; dy <= radius; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
              sum += data[nx][ny];
              count++;
            }
          }
        }

        result[x][y] = sum / count;
      }
    }

    return result;
  }

  // Generate color based on intensity (blue → yellow → red)
  function getHeatmapColor(intensity: number): string {
    // Blue (0) → Cyan (0.25) → Green (0.5) → Yellow (0.75) → Red (1)
    let r, g, b;

    if (intensity < 0.25) {
      // Blue to Cyan
      const t = intensity / 0.25;
      r = 0;
      g = Math.floor(t * 255);
      b = 255;
    } else if (intensity < 0.5) {
      // Cyan to Green
      const t = (intensity - 0.25) / 0.25;
      r = 0;
      g = 255;
      b = Math.floor((1 - t) * 255);
    } else if (intensity < 0.75) {
      // Green to Yellow
      const t = (intensity - 0.5) / 0.25;
      r = Math.floor(t * 255);
      g = 255;
      b = 0;
    } else {
      // Yellow to Red
      const t = (intensity - 0.75) / 0.25;
      r = 255;
      g = Math.floor((1 - t) * 255);
      b = 0;
    }

    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
          showOverlay ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ mixBlendMode: 'multiply' }}
      />

      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 space-y-3 z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Heatmap</span>
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showOverlay ? 'Hide' : 'Show'}
          </button>
        </div>

        {showOverlay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {/* Opacity Slider */}
            <div className="space-y-1">
              <label className="text-xs text-gray-600">
                Opacity: {opacity}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Legend */}
            <div className="space-y-1">
              <span className="text-xs text-gray-600">Intensity</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 rounded" style={{ background: 'rgb(0, 0, 255)' }} />
                <div className="flex-1 h-4 rounded" style={{ 
                  background: 'linear-gradient(to right, rgb(0,0,255), rgb(0,255,255), rgb(0,255,0), rgb(255,255,0), rgb(255,0,0))' 
                }} />
                <div className="w-4 h-4 rounded" style={{ background: 'rgb(255, 0, 0)' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>High</span>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Data Points:</span>
                <span className="font-medium">{heatmapData.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Device:</span>
                <span className="font-medium capitalize">{deviceType}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-20">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="text-sm text-gray-600">Loading heatmap data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90 z-20">
          <div className="text-center space-y-2 p-6">
            <svg className="w-12 h-12 text-red-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-600 font-medium">Failed to load heatmap</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && heatmapData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 z-20">
          <div className="text-center space-y-2 p-6">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">No heatmap data available</p>
            <p className="text-xs text-gray-500">No clicks recorded for this page yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
