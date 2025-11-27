'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import HeatmapViewer from '@/components/HeatmapViewer';

interface AnalyticsStats {
  pageViews: number;
  uniqueVisitors: number;
  avgDuration: string;
  bounceRate: string;
  change: {
    pageViews: number;
    uniqueVisitors: number;
    avgDuration: number;
    bounceRate: number;
  };
}

interface PageData {
  page_path: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  avg_duration: number;
  bounce_rate: number;
}

interface GeoData {
  country: string;
  city: string;
  visitors: number;
  percentage: number;
}

interface SourceData {
  source: string;
  visitors: number;
  percentage: number;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [geoData, setGeoData] = useState<GeoData[]>([]);
  const [sourceData, setSourceData] = useState<SourceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedPage, setSelectedPage] = useState<string>('/');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const [overviewRes, pagesRes, geoRes, sourcesRes] = await Promise.all([
        fetch(`/api/analytics/overview?range=${dateRange}`),
        fetch(`/api/analytics/pages?range=${dateRange}`),
        fetch(`/api/analytics/geographic?range=${dateRange}`),
        fetch(`/api/analytics/sources?range=${dateRange}`)
      ]);

      const [overview, pages, geo, sources] = await Promise.all([
        overviewRes.json(),
        pagesRes.json(),
        geoRes.json(),
        sourcesRes.json()
      ]);

      setStats(overview);
      setPages(pages.data || []);
      setGeoData(geo.data || []);
      setSourceData(sources.data || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDuration(seconds: number): string {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}m ${secs}s`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor your website performance and user behavior</p>
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range === '7d' && 'Last 7 days'}
                {range === '30d' && 'Last 30 days'}
                {range === '90d' && 'Last 90 days'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats && (
            <>
              <MetricCard
                title="Page Views"
                value={stats.pageViews.toLocaleString()}
                change={stats.change.pageViews}
                icon="📊"
              />
              <MetricCard
                title="Unique Visitors"
                value={stats.uniqueVisitors.toLocaleString()}
                change={stats.change.uniqueVisitors}
                icon="👥"
              />
              <MetricCard
                title="Avg Time on Site"
                value={stats.avgDuration}
                change={stats.change.avgDuration}
                icon="⏱️"
              />
              <MetricCard
                title="Bounce Rate"
                value={stats.bounceRate}
                change={stats.change.bounceRate}
                isInverted
                icon="↩️"
              />
            </>
          )}
        </div>

        {/* Page Performance Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Pages</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bounce Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pages.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{page.page_title || page.page_path}</div>
                        <div className="text-sm text-gray-500">{page.page_path}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.unique_visitors.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDuration(page.avg_duration)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(page.bounce_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedPage(page.page_path)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Heatmap
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Heatmap Section */}
        {selectedPage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Click Heatmap: {selectedPage}</h2>
            </div>
            <div className="relative h-[600px]">
              <HeatmapViewer pagePath={selectedPage} className="w-full h-full" />
            </div>
          </motion.div>
        )}

        {/* Geographic & Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Distribution */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Geographic Distribution</h2>
            </div>
            <div className="p-6 space-y-4">
              {geoData.map((geo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{geo.country}</span>
                      {geo.city && <span className="text-sm text-gray-500">• {geo.city}</span>}
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${geo.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{geo.visitors.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{geo.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Traffic Sources</h2>
            </div>
            <div className="p-6 space-y-4">
              {sourceData.map((source, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">{source.source}</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-sm font-medium text-gray-900">{source.visitors.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{source.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({
  title,
  value,
  change,
  isInverted = false,
  icon
}: {
  title: string;
  value: string;
  change: number;
  isInverted?: boolean;
  icon: string;
}) {
  const isPositive = isInverted ? change < 0 : change > 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeIcon = isPositive ? '↑' : '↓';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <div className="flex items-center mt-2">
            <span className={`text-sm font-medium ${changeColor}`}>
              {changeIcon} {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </motion.div>
  );
}
