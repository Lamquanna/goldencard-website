// Type cho BusinessLocation gốc (giữ lại cho compatibility)
export interface BusinessLocation {
  id: string;
  type: 'headquarters' | 'branch' | 'warehouse' | 'service';
  name: string;
  address: {
    street: string;
    district: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours: {
    monday?: { open: string; close: string } | { closed: true };
    tuesday?: { open: string; close: string } | { closed: true };
    wednesday?: { open: string; close: string } | { closed: true };
    thursday?: { open: string; close: string } | { closed: true };
    friday?: { open: string; close: string } | { closed: true };
    saturday?: { open: string; close: string } | { closed: true };
    sunday?: { open: string; close: string } | { closed: true };
  };
  services?: string[];
  features?: string[];
  images?: string[];
  stats?: {
    projectsCompleted?: number;
    customersServed?: number;
    rating?: number;
  };
}

// Type đơn giản cho MapSection
export type LocationType = 'headquarters' | 'branch' | 'warehouse' | 'service';

export interface Location {
  id: string;
  type: LocationType;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  email?: string;
  operatingHours?: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  services?: string[];
}

// Config cho các loại location
export const LOCATION_TYPE_CONFIG: Record<LocationType, { label: string; color: string; icon: string }> = {
  headquarters: { label: 'Trụ sở chính', color: '#059669', icon: '🏢' },
  branch: { label: 'Chi nhánh', color: '#2563EB', icon: '🏬' },
  warehouse: { label: 'Kho hàng', color: '#D97706', icon: '📦' },
  service: { label: 'Trung tâm dịch vụ', color: '#7C3AED', icon: '🔧' },
};

// Thông tin công ty
export const GOLDENENERGY_INFO = {
  companyName: 'Golden Energy Vietnam',
  description: 'Đơn vị tiên phong trong lĩnh vực năng lượng tái tạo tại Việt Nam',
  phone: '+84 333 142 888',
  email: 'sales@goldenenergy.vn',
  website: 'www.goldenenergy.vn',
};

// Danh sách locations đơn giản cho MapSection
export const locations: Location[] = [
  {
    id: 'hq-hcm',
    type: 'headquarters',
    name: 'Golden Energy - Trụ Sở Chính',
    address: 'A2206-A2207 Tháp A, Sunrise Riverside, Phước Kiến, Nhà Bè, TP. Hồ Chí Minh',
    coordinates: {
      lat: 10.6865,
      lng: 106.7532,
    },
    phone: '+84 333 142 888',
    email: 'sales@goldenenergy.vn',
    operatingHours: {
      weekday: '08:00 - 17:30',
      saturday: '08:00 - 17:30',
      sunday: 'Nghỉ',
    },
    services: [
      'Tư vấn hệ thống năng lượng mặt trời',
      'Thiết kế & lắp đặt',
      'Bảo trì & sửa chữa',
    ],
  },
  {
    id: 'branch-txs',
    type: 'branch',
    name: 'Golden Energy - Văn Phòng Đại Diện',
    address: '625 Trần Xuân Soạn, Phường Tân Hưng, Quận 7, TP. Hồ Chí Minh',
    coordinates: {
      lat: 10.7328,
      lng: 106.7219,
    },
    phone: '+84 333 142 888',
    email: 'sales@goldenenergy.vn',
    operatingHours: {
      weekday: '08:00 - 17:30',
      saturday: '08:00 - 17:30',
      sunday: 'Nghỉ',
    },
    services: [
      'Tư vấn khách hàng',
      'Hỗ trợ kỹ thuật',
    ],
  },
  {
    id: 'warehouse-nvl',
    type: 'warehouse',
    name: 'Golden Energy - Kho Hàng',
    address: '354/2/3 Nguyễn Văn Linh, Phường Bình Thuận, Quận 7, TP. Hồ Chí Minh',
    coordinates: {
      lat: 10.7381,
      lng: 106.7071,
    },
    phone: '+84 333 142 888',
    email: 'warehouse@goldenenergy.vn',
    operatingHours: {
      weekday: '08:00 - 17:30',
      saturday: '08:00 - 17:30',
      sunday: 'Nghỉ',
    },
    services: [
      'Kho vật tư năng lượng',
      'Trung tâm phân phối',
    ],
  },
];

// Chỉ giữ lại thông tin thật của GoldenEnergy
export const locationsData: BusinessLocation[] = [
  // Trụ sở chính - Sunrise Riverside
  {
    id: 'hq-hcm',
    type: 'headquarters',
    name: 'Golden Energy - Trụ Sở Chính',
    address: {
      street: 'A2206-A2207 Tháp A, Sunrise Riverside',
      district: 'Phước Kiến, Nhà Bè',
      city: 'TP. Hồ Chí Minh',
      country: 'Vietnam',
      postalCode: '700000',
    },
    coordinates: {
      lat: 10.7217334,
      lng: 106.7029635,
    },
    contact: {
      phone: '+84 333 142 888',
      email: 'sales@goldenenergy.vn',
      website: 'https://www.goldenenergy.vn',
    },
    hours: {
      monday: { open: '08:00', close: '17:30' },
      tuesday: { open: '08:00', close: '17:30' },
      wednesday: { open: '08:00', close: '17:30' },
      thursday: { open: '08:00', close: '17:30' },
      friday: { open: '08:00', close: '17:30' },
      saturday: { open: '08:00', close: '17:30' },
      sunday: { closed: true },
    },
    services: [
      'Tư vấn hệ thống năng lượng mặt trời',
      'Thiết kế & lắp đặt',
      'Bảo trì & sửa chữa',
    ],
    features: [
      'Showroom',
      'Văn phòng',
    ],
    images: [],
  },
];

// Helper functions
export function getLocationsByType(type: BusinessLocation['type']) {
  return locationsData.filter(location => location.type === type);
}

export function getHeadquarters() {
  return locationsData.find(location => location.type === 'headquarters');
}

export function getBranches() {
  return getLocationsByType('branch');
}

export function getWarehouses() {
  return getLocationsByType('warehouse');
}

export function getServiceCenters() {
  return getLocationsByType('service');
}
