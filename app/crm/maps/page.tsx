'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Building2, Warehouse, Sun, Wind, Layers, Navigation,
  Search, Filter, Plus, ChevronDown, Eye, X, Maximize2, Phone, Mail
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

// ============================================
// TYPES
// ============================================

type LocationType = 'hq' | 'office' | 'warehouse' | 'project_solar' | 'project_wind' | 'client';

interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  address: string;
  province: string;
  lat: number;
  lng: number;
  phone?: string;
  email?: string;
  capacity_kw?: number;
  status?: 'active' | 'construction' | 'planning';
  description?: string;
}

// ============================================
// MOCK DATA
// ============================================

const mockLocations: MapLocation[] = [
  // Headquarters & Offices
  {
    id: 'loc-001',
    name: 'GoldenEnergy HQ',
    type: 'hq',
    address: '123 Nguyễn Văn Linh, Quận 7',
    province: 'TP. Hồ Chí Minh',
    lat: 10.7367,
    lng: 106.7012,
    phone: '028 1234 5678',
    email: 'info@goldenenergy.vn',
    description: 'Trụ sở chính GoldenEnergy'
  },
  {
    id: 'loc-002',
    name: 'Văn phòng Hà Nội',
    type: 'office',
    address: '456 Láng Hạ, Đống Đa',
    province: 'Hà Nội',
    lat: 21.0168,
    lng: 105.8119,
    phone: '024 9876 5432',
    description: 'Chi nhánh miền Bắc'
  },
  {
    id: 'loc-003',
    name: 'Văn phòng Đà Nẵng',
    type: 'office',
    address: '789 Nguyễn Văn Linh, Hải Châu',
    province: 'Đà Nẵng',
    lat: 16.0544,
    lng: 108.2022,
    phone: '0236 123 4567',
    description: 'Chi nhánh miền Trung'
  },
  // Warehouses
  {
    id: 'loc-004',
    name: 'Kho HCM - Thủ Đức',
    type: 'warehouse',
    address: '123 Đường XYZ, Thủ Đức',
    province: 'TP. Hồ Chí Minh',
    lat: 10.8540,
    lng: 106.7596,
    description: 'Kho chính miền Nam'
  },
  {
    id: 'loc-005',
    name: 'Kho Bình Dương',
    type: 'warehouse',
    address: 'KCN VSIP II',
    province: 'Bình Dương',
    lat: 11.0183,
    lng: 106.6100,
    description: 'Kho phụ'
  },
  // Solar Projects
  {
    id: 'loc-006',
    name: 'Solar Farm Bình Thuận 50MW',
    type: 'project_solar',
    address: 'Xã Sông Bình, Huyện Bắc Bình',
    province: 'Bình Thuận',
    lat: 11.4285,
    lng: 108.2394,
    capacity_kw: 50000,
    status: 'construction',
    description: 'Dự án điện mặt trời lớn nhất'
  },
  {
    id: 'loc-007',
    name: 'Solar Rooftop AEON Mall',
    type: 'project_solar',
    address: '30 Bờ Bao Tân Thắng, Tân Phú',
    province: 'TP. Hồ Chí Minh',
    lat: 10.8001,
    lng: 106.6297,
    capacity_kw: 2500,
    status: 'construction',
    description: 'Hệ thống áp mái cho AEON'
  },
  {
    id: 'loc-008',
    name: 'Solar Farm Long An',
    type: 'project_solar',
    address: 'Huyện Đức Huệ',
    province: 'Long An',
    lat: 10.8453,
    lng: 106.3001,
    capacity_kw: 100000,
    status: 'active',
    description: 'Đang vận hành O&M'
  },
  // Wind Projects
  {
    id: 'loc-009',
    name: 'Wind Farm Ninh Thuận 30MW',
    type: 'project_wind',
    address: 'Xã Phước Hữu, Huyện Ninh Phước',
    province: 'Ninh Thuận',
    lat: 11.5642,
    lng: 108.9877,
    capacity_kw: 30000,
    status: 'planning',
    description: 'Dự án điện gió đang lên kế hoạch'
  },
  {
    id: 'loc-010',
    name: 'Wind Farm Bạc Liêu',
    type: 'project_wind',
    address: 'Vĩnh Trạch Đông',
    province: 'Bạc Liêu',
    lat: 9.2840,
    lng: 105.7257,
    capacity_kw: 99200,
    status: 'active',
    description: 'Trang trại gió ven biển'
  },
];

// ============================================
// CONFIG
// ============================================

const locationTypeConfig: Record<LocationType, { 
  label: string; 
  icon: React.ElementType; 
  color: string; 
  bgColor: string;
  markerColor: string;
}> = {
  hq: { label: 'Trụ sở chính', icon: Building2, color: 'text-red-600', bgColor: 'bg-red-100', markerColor: '#dc2626' },
  office: { label: 'Văn phòng', icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-100', markerColor: '#2563eb' },
  warehouse: { label: 'Kho', icon: Warehouse, color: 'text-purple-600', bgColor: 'bg-purple-100', markerColor: '#9333ea' },
  project_solar: { label: 'Dự án Solar', icon: Sun, color: 'text-yellow-600', bgColor: 'bg-yellow-100', markerColor: '#ca8a04' },
  project_wind: { label: 'Dự án Wind', icon: Wind, color: 'text-cyan-600', bgColor: 'bg-cyan-100', markerColor: '#0891b2' },
  client: { label: 'Khách hàng', icon: MapPin, color: 'text-green-600', bgColor: 'bg-green-100', markerColor: '#16a34a' },
};

const statusConfig = {
  active: { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' },
  construction: { label: 'Đang thi công', color: 'bg-yellow-100 text-yellow-700' },
  planning: { label: 'Lên kế hoạch', color: 'bg-blue-100 text-blue-700' },
};

// ============================================
// COMPONENT
// ============================================

export default function MapsPage() {
  const [locations, setLocations] = useState<MapLocation[]>(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilters, setTypeFilters] = useState<LocationType[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  const { hasPermission } = useAuthStore();
  const canCreate = hasPermission('maps', 'create');

  // Filter locations
  const filteredLocations = locations.filter(loc => {
    const matchSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       loc.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       loc.province.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilters.length === 0 || typeFilters.includes(loc.type);
    return matchSearch && matchType;
  });

  // Toggle type filter
  const toggleTypeFilter = (type: LocationType) => {
    setTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Stats
  const stats = {
    total: locations.length,
    offices: locations.filter(l => l.type === 'hq' || l.type === 'office').length,
    warehouses: locations.filter(l => l.type === 'warehouse').length,
    projects: locations.filter(l => l.type === 'project_solar' || l.type === 'project_wind').length,
    totalCapacity: locations.reduce((sum, l) => sum + (l.capacity_kw || 0), 0),
  };

  // Get center of Vietnam
  const vietnamCenter = { lat: 16.0, lng: 107.5 };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bản đồ</h1>
              <p className="text-sm text-gray-500 mt-1">
                {stats.total} địa điểm · {stats.projects} dự án · {(stats.totalCapacity / 1000).toFixed(0)} MW tổng công suất
              </p>
            </div>
            
            {canCreate && (
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600">
                <Plus size={18} />
                <span>Thêm địa điểm</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className={`w-96 bg-white rounded-xl shadow-sm overflow-hidden flex flex-col ${isFullscreen ? 'hidden' : ''}`}>
            {/* Search & Filters */}
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm địa điểm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              
              {/* Type Filters */}
              <div className="flex flex-wrap gap-2 mt-3">
                {Object.entries(locationTypeConfig).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => toggleTypeFilter(type as LocationType)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      typeFilters.includes(type as LocationType)
                        ? `${config.bgColor} ${config.color}`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <config.icon size={12} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Locations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredLocations.map(location => {
                const config = locationTypeConfig[location.type];
                const isSelected = selectedLocation?.id === location.id;
                
                return (
                  <div
                    key={location.id}
                    onClick={() => setSelectedLocation(location)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      isSelected ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.bgColor}`}>
                        <config.icon className={config.color} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{location.name}</h4>
                        <p className="text-sm text-gray-500 truncate">{location.address}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{location.province}</span>
                          {location.status && (
                            <span className={`text-xs px-1.5 py-0.5 rounded ${statusConfig[location.status].color}`}>
                              {statusConfig[location.status].label}
                            </span>
                          )}
                        </div>
                        {location.capacity_kw && (
                          <p className="text-xs text-gray-500 mt-1">
                            ⚡ {location.capacity_kw >= 1000 ? `${location.capacity_kw / 1000} MW` : `${location.capacity_kw} kW`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredLocations.length === 0 && (
                <div className="p-8 text-center">
                  <MapPin className="mx-auto text-gray-300" size={48} />
                  <p className="text-gray-500 mt-2">Không tìm thấy địa điểm</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div 
            ref={mapContainerRef}
            className={`flex-1 bg-white rounded-xl shadow-sm overflow-hidden relative ${isFullscreen ? 'fixed inset-4 z-30' : 'h-[calc(100vh-12rem)]'}`}
          >
            {/* Map Placeholder - In real app, use Leaflet/Mapbox */}
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative">
              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 z-10"
              >
                {isFullscreen ? <X size={20} /> : <Maximize2 size={20} />}
              </button>

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 z-10">
                <p className="text-xs font-medium text-gray-700 mb-2">Chú thích</p>
                <div className="space-y-1.5">
                  {Object.entries(locationTypeConfig).map(([type, config]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: config.markerColor }}
                      ></div>
                      <span className="text-xs text-gray-600">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Map with markers */}
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Vietnam outline placeholder */}
                <div className="text-gray-300 text-9xl">🗺️</div>
                
                {/* Markers */}
                <div className="absolute inset-0">
                  {filteredLocations.map((location, idx) => {
                    const config = locationTypeConfig[location.type];
                    // Simple positioning based on lat/lng (simplified)
                    const left = ((location.lng - 102) / 12) * 100;
                    const top = ((23 - location.lat) / 15) * 100;
                    
                    return (
                      <div
                        key={location.id}
                        onClick={() => setSelectedLocation(location)}
                        className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 ${
                          selectedLocation?.id === location.id ? 'scale-125 z-10' : ''
                        }`}
                        style={{ left: `${left}%`, top: `${top}%` }}
                        title={location.name}
                      >
                        <div 
                          className={`p-1.5 rounded-full shadow-lg ${
                            selectedLocation?.id === location.id ? 'ring-4 ring-yellow-300' : ''
                          }`}
                          style={{ backgroundColor: config.markerColor }}
                        >
                          <config.icon className="text-white" size={16} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Location Popup */}
                {selectedLocation && (
                  <div className="absolute bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg overflow-hidden z-20">
                    <div className={`p-3 ${locationTypeConfig[selectedLocation.type].bgColor}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = locationTypeConfig[selectedLocation.type].icon;
                            return <Icon className={locationTypeConfig[selectedLocation.type].color} size={20} />;
                          })()}
                          <span className={`text-sm font-medium ${locationTypeConfig[selectedLocation.type].color}`}>
                            {locationTypeConfig[selectedLocation.type].label}
                          </span>
                        </div>
                        <button 
                          onClick={() => setSelectedLocation(null)}
                          className="p-1 hover:bg-white/50 rounded"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{selectedLocation.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{selectedLocation.address}</p>
                      <p className="text-sm text-gray-500">{selectedLocation.province}</p>
                      
                      {selectedLocation.description && (
                        <p className="text-sm text-gray-600 mt-2">{selectedLocation.description}</p>
                      )}

                      {selectedLocation.capacity_kw && (
                        <div className="mt-2 flex items-center gap-1 text-sm">
                          <span className="text-gray-500">Công suất:</span>
                          <span className="font-medium text-yellow-600">
                            {selectedLocation.capacity_kw >= 1000 
                              ? `${selectedLocation.capacity_kw / 1000} MW` 
                              : `${selectedLocation.capacity_kw} kW`}
                          </span>
                        </div>
                      )}

                      {selectedLocation.status && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-1 rounded ${statusConfig[selectedLocation.status].color}`}>
                            {statusConfig[selectedLocation.status].label}
                          </span>
                        </div>
                      )}

                      {(selectedLocation.phone || selectedLocation.email) && (
                        <div className="mt-3 pt-3 border-t space-y-1">
                          {selectedLocation.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <a href={`tel:${selectedLocation.phone}`} className="hover:text-yellow-600">
                                {selectedLocation.phone}
                              </a>
                            </div>
                          )}
                          {selectedLocation.email && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <a href={`mailto:${selectedLocation.email}`} className="hover:text-yellow-600">
                                {selectedLocation.email}
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-400">
                          Tọa độ: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                        </p>
                      </div>

                      <button className="mt-3 w-full py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 flex items-center justify-center gap-2">
                        <Navigation size={16} />
                        Chỉ đường
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Note for real implementation */}
              <div className="absolute top-4 left-4 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-lg text-xs z-10">
                💡 Tích hợp Leaflet/Mapbox để hiển thị bản đồ thực
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
