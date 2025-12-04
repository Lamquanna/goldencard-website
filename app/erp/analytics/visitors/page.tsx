'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, TrendingUp, Users, MapPin, Search,
  ExternalLink, BarChart3, PieChart, Globe2
} from 'lucide-react';

interface VisitorData {
  country: string;
  countryCode: string;
  city: string;
  visitors: number;
  percentage: number;
  flag?: string;
}

interface SourceData {
  source: string;
  medium?: string;
  visitors: number;
  percentage: number;
  icon?: string;
}

interface VisitorStats {
  totalVisitors: number;
  uniqueCountries: number;
  topCountry: string;
  topSource: string;
  change: {
    visitors: number;
    countries: number;
  };
}

// Country code to flag emoji mapping
const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

// Mock data for demonstration - Replace with actual API calls
const MOCK_VISITOR_DATA: VisitorData[] = [
  { country: 'Vietnam', countryCode: 'VN', city: 'Ho Chi Minh City', visitors: 1250, percentage: 45.2 },
  { country: 'United States', countryCode: 'US', city: 'New York', visitors: 380, percentage: 13.7 },
  { country: 'China', countryCode: 'CN', city: 'Beijing', visitors: 295, percentage: 10.7 },
  { country: 'South Korea', countryCode: 'KR', city: 'Seoul', visitors: 220, percentage: 8.0 },
  { country: 'Japan', countryCode: 'JP', city: 'Tokyo', visitors: 185, percentage: 6.7 },
  { country: 'Singapore', countryCode: 'SG', city: 'Singapore', visitors: 145, percentage: 5.2 },
  { country: 'Thailand', countryCode: 'TH', city: 'Bangkok', visitors: 120, percentage: 4.3 },
  { country: 'Germany', countryCode: 'DE', city: 'Berlin', visitors: 95, percentage: 3.4 },
  { country: 'Australia', countryCode: 'AU', city: 'Sydney', visitors: 48, percentage: 1.7 },
  { country: 'United Kingdom', countryCode: 'GB', city: 'London', visitors: 32, percentage: 1.1 },
];

const MOCK_SOURCE_DATA: SourceData[] = [
  { source: 'Google Search', medium: 'organic', visitors: 1450, percentage: 52.4, icon: '🔍' },
  { source: 'Direct', medium: 'none', visitors: 620, percentage: 22.4, icon: '🔗' },
  { source: 'Facebook', medium: 'social', visitors: 340, percentage: 12.3, icon: '👥' },
  { source: 'Google Ads', medium: 'cpc', visitors: 185, percentage: 6.7, icon: '💰' },
  { source: 'LinkedIn', medium: 'social', visitors: 95, percentage: 3.4, icon: '💼' },
  { source: 'Email', medium: 'email', visitors: 78, percentage: 2.8, icon: '📧' },
];

const MOCK_STATS: VisitorStats = {
  totalVisitors: 2768,
  uniqueCountries: 24,
  topCountry: 'Vietnam',
  topSource: 'Google Search',
  change: {
    visitors: 15.3,
    countries: 3,
  },
};

export default function VisitorAnalyticsPage() {
  const [visitorData, setVisitorData] = useState<VisitorData[]>(MOCK_VISITOR_DATA);
  const [sourceData, setSourceData] = useState<SourceData[]>(MOCK_SOURCE_DATA);
  const [stats, setStats] = useState<VisitorStats>(MOCK_STATS);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchVisitorAnalytics();
  }, [dateRange]);

  const fetchVisitorAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // const [geoRes, sourcesRes] = await Promise.all([
      //   fetch(`/api/analytics/geographic?range=${dateRange}`),
      //   fetch(`/api/analytics/sources?range=${dateRange}`)
      // ]);
      
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Add flags to visitor data
      const dataWithFlags = visitorData.map(item => ({
        ...item,
        flag: getCountryFlag(item.countryCode)
      }));
      
      setVisitorData(dataWithFlags);
    } catch (error) {
      console.error('Failed to fetch visitor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = visitorData.filter(item =>
    item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Đang tải dữ liệu khách truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                           flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Phân tích khách truy cập</h1>
                <p className="text-sm text-gray-500">Theo dõi nguồn gốc và hành vi khách truy cập website</p>
              </div>
            </div>
            
            {/* Date Range Selector */}
            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dateRange === range
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {range === '7d' && '7 ngày'}
                  {range === '30d' && '30 ngày'}
                  {range === '90d' && '90 ngày'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {stats.change.visitors > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  +{stats.change.visitors}%
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalVisitors.toLocaleString()}</h3>
            <p className="text-sm text-gray-500 mt-1">Tổng khách truy cập</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Globe2 className="w-6 h-6 text-purple-600" />
              </div>
              {stats.change.countries > 0 && (
                <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  +{stats.change.countries}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stats.uniqueCountries}</h3>
            <p className="text-sm text-gray-500 mt-1">Quốc gia</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{stats.topCountry}</h3>
            <p className="text-sm text-gray-500 mt-1">Quốc gia hàng đầu</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{stats.topSource}</h3>
            <p className="text-sm text-gray-500 mt-1">Nguồn traffic chính</p>
          </motion.div>
        </div>

        {/* Main Content - Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Phân bố địa lý
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm quốc gia..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredVisitors.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50 p-4 rounded-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{item.flag}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{item.country}</div>
                          {item.city && (
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {item.city}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{item.visitors.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Nguồn traffic
              </h2>
              <p className="text-sm text-gray-500 mt-1">Khách tìm thấy website qua kênh nào</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {sourceData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-gray-50 p-4 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{item.source}</div>
                          {item.medium && (
                            <div className="text-sm text-gray-500 capitalize">{item.medium}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{item.visitors.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Source Categories Summary */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Tóm tắt theo loại</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {sourceData.filter(s => s.medium === 'organic').reduce((sum, s) => sum + s.visitors, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Tìm kiếm tự nhiên</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {sourceData.filter(s => s.medium === 'social').reduce((sum, s) => sum + s.visitors, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Mạng xã hội</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {sourceData.filter(s => s.medium === 'cpc').reduce((sum, s) => sum + s.visitors, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Quảng cáo</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {sourceData.filter(s => s.medium === 'none').reduce((sum, s) => sum + s.visitors, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Truy cập trực tiếp</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <PieChart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Về dữ liệu phân tích</h3>
              <p className="text-sm text-blue-800">
                Hệ thống theo dõi tự động các khách truy cập website, bao gồm:
              </p>
              <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li><strong>Vị trí địa lý:</strong> Quốc gia và thành phố của khách truy cập (dựa trên IP address)</li>
                <li><strong>Nguồn traffic:</strong> Họ tìm thấy website qua Google, Facebook, quảng cáo, hay truy cập trực tiếp</li>
                <li><strong>UTM tracking:</strong> Theo dõi hiệu quả của các chiến dịch marketing cụ thể</li>
                <li><strong>Thời gian thực:</strong> Dữ liệu được cập nhật liên tục và có thể lọc theo khoảng thời gian</li>
              </ul>
              <p className="text-sm text-blue-700 mt-3">
                💡 <strong>Mẹo:</strong> Sử dụng thông tin này để tối ưu hóa nội dung theo khu vực và đầu tư vào các kênh marketing hiệu quả nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
