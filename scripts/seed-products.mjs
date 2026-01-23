/**
 * Seed 15 sản phẩm mẫu cho Calculator 3 Bát Phở
 * 5 Budget + 5 Standard + 5 Premium
 * 
 * Run: node scripts/seed-products.mjs
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'u5ue9cmp',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// 15 sản phẩm chiến thuật - phủ đầy đủ 3 phân khúc
const PRODUCTS = [
  // ========== BUDGET TIER (5 sản phẩm) ==========
  {
    _type: 'product',
    name: 'Biến tần LuxPower 5kW Hybrid',
    slug: { _type: 'slug', current: 'luxpower-5kw-hybrid-budget' },
    category: 'inverter',
    brand: 'LuxPower',
    model: 'LXP-5K-H',
    tier: 'budget',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 5000,
      efficiency: 95.5,
      warrantyYears: 5,
      voltage: 230,
      current: 21.7,
    },
    price: 15000000, // 15M VND
    description: 'Biến tần lai giá rẻ, phù hợp hộ gia đình nhỏ. Hiệu suất tốt với giá cạnh tranh.',
    features: [
      'Hybrid hòa lưới + lưu trữ',
      'Bảo hành 5 năm',
      'Quá tải 110%',
      'Màn hình LCD',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Tấm pin Risen 450W Mono PERC',
    slug: { _type: 'slug', current: 'risen-450w-mono-budget' },
    category: 'solar-panel',
    brand: 'Risen',
    model: 'RSM144-6-450M',
    tier: 'budget',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 450,
      efficiency: 20.5,
      warrantyYears: 12,
      voltage: 40.8,
      current: 11.03,
      dimensions: { width: 1048, height: 2094, depth: 35 },
      weight: 24.5,
    },
    price: 1200000, // 1.2M VND
    description: 'Tấm pin Mono PERC giá rẻ, hiệu suất ổn định. Lựa chọn kinh tế nhất.',
    features: [
      'Công nghệ PERC',
      'Bảo hành 12 năm sản phẩm',
      'Bảo hành 25 năm công suất',
      'Chịu gió 2400Pa',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Biến tần ThinkPower 3kW On-Grid',
    slug: { _type: 'slug', current: 'thinkpower-3kw-ongrid-budget' },
    category: 'inverter',
    brand: 'ThinkPower',
    model: 'TP-3K-SG',
    tier: 'budget',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 3000,
      efficiency: 96.0,
      warrantyYears: 5,
      voltage: 220,
      current: 13.6,
    },
    price: 7500000, // 7.5M VND
    description: 'Biến tần hòa lưới giá rẻ cho hộ nhỏ. Đơn giản, dễ lắp đặt.',
    features: [
      'Hòa lưới thuần túy',
      'WiFi/4G monitoring',
      'IP65 chống nước',
      'Nhỏ gọn 7kg',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Pin lưu trữ UFO 5kWh LiFePO4',
    slug: { _type: 'slug', current: 'ufo-5kwh-lifepo4-budget' },
    category: 'battery',
    brand: 'UFO',
    model: 'UFO-5.1',
    tier: 'budget',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 5000,
      efficiency: 94.0,
      warrantyYears: 5,
      voltage: 51.2,
      current: 100,
      weight: 45,
    },
    price: 22000000, // 22M VND
    description: 'Pin LiFePO4 giá rẻ, an toàn cao. Dung lượng 5kWh đủ dùng gia đình.',
    features: [
      'Công nghệ LiFePO4',
      '6000 chu kỳ sạc',
      'BMS tích hợp',
      'Song song đến 16 module',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Tấm pin JA Solar 540W N-Type',
    slug: { _type: 'slug', current: 'ja-solar-540w-ntype-budget' },
    category: 'solar-panel',
    brand: 'JA Solar',
    model: 'JAM72S30-540/MR',
    tier: 'budget',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 540,
      efficiency: 20.8,
      warrantyYears: 12,
      voltage: 41.7,
      current: 12.95,
      dimensions: { width: 1134, height: 2278, depth: 30 },
      weight: 28.0,
    },
    price: 1500000, // 1.5M VND
    description: 'Tấm N-Type hiện đại, giá tốt. Công suất lớn 540W tiết kiệm diện tích mái.',
    features: [
      'N-Type Bifacial',
      'Độ suy giảm thấp',
      'Bảo hành 25 năm',
      'Chứng nhận TUV/CE',
    ],
    inStock: true,
    locale: 'vi',
  },

  // ========== STANDARD TIER (5 sản phẩm) ==========
  {
    _type: 'product',
    name: 'Biến tần Huawei 8kW Hybrid',
    slug: { _type: 'slug', current: 'huawei-8kw-hybrid-standard' },
    category: 'inverter',
    brand: 'Huawei',
    model: 'SUN2000-8KTL-M1',
    tier: 'standard',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 8000,
      efficiency: 98.4,
      warrantyYears: 10,
      voltage: 230,
      current: 34.8,
    },
    price: 38000000, // 38M VND
    description: 'Biến tần Huawei tin cậy, hiệu suất cao 98.4%. Lựa chọn phổ biến nhất.',
    features: [
      'Hiệu suất 98.4%',
      'AI MPPT tracking',
      'FusionSolar Cloud',
      'Bảo hành 10 năm',
      'Quá tải 120%',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Tấm pin Longi 585W Hi-MO 6',
    slug: { _type: 'slug', current: 'longi-585w-himo6-standard' },
    category: 'solar-panel',
    brand: 'Longi',
    model: 'LR5-72HTH-585M',
    tier: 'standard',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 585,
      efficiency: 22.5,
      warrantyYears: 15,
      voltage: 44.95,
      current: 13.02,
      dimensions: { width: 1134, height: 2278, depth: 30 },
      weight: 28.6,
    },
    price: 2100000, // 2.1M VND
    description: 'Tấm Longi Hi-MO 6 hiệu suất cao 22.5%. Thương hiệu số 1 thế giới.',
    features: [
      'Hiệu suất 22.5%',
      'PERC Bifacial',
      'Bảo hành 15 năm',
      'Hệ số nhiệt tốt',
      'Độ suy giảm < 2% năm đầu',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Biến tần GoodWe 6kW Hybrid',
    slug: { _type: 'slug', current: 'goodwe-6kw-hybrid-standard' },
    category: 'inverter',
    brand: 'GoodWe',
    model: 'GW6K-ES',
    tier: 'standard',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 6000,
      efficiency: 97.6,
      warrantyYears: 10,
      voltage: 230,
      current: 26.1,
    },
    price: 28000000, // 28M VND
    description: 'Biến tần GoodWe ES series, tích hợp pin tiện lợi. Giá hợp lý, chất lượng tốt.',
    features: [
      'Tích hợp pin sẵn',
      'WiFi/4G/Ethernet',
      'Backup tự động',
      'IP65 chống nước',
      'Bảo hành 10 năm',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Pin lưu trữ Huawei LUNA 10kWh',
    slug: { _type: 'slug', current: 'huawei-luna-10kwh-standard' },
    category: 'battery',
    brand: 'Huawei',
    model: 'LUNA2000-10-S0',
    tier: 'standard',
    brandOrigin: 'China',
    techSpecs: {
      capacity: 10000,
      efficiency: 95.0,
      warrantyYears: 10,
      voltage: 600,
      current: 40,
      weight: 135,
    },
    price: 65000000, // 65M VND
    description: 'Pin Huawei LUNA thông minh, quản lý AI. An toàn, hiệu quả cao.',
    features: [
      'AI quản lý năng lượng',
      'FusionSolar Cloud',
      'Bảo hành 10 năm',
      'Mở rộng đến 30kWh',
      '95% độ sâu xả (DOD)',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Tấm pin Canadian 550W HiKu7',
    slug: { _type: 'slug', current: 'canadian-550w-hiku7-standard' },
    category: 'solar-panel',
    brand: 'Canadian Solar',
    model: 'CS7N-550MS',
    tier: 'standard',
    brandOrigin: 'Canada',
    techSpecs: {
      capacity: 550,
      efficiency: 21.3,
      warrantyYears: 15,
      voltage: 41.8,
      current: 13.16,
      dimensions: { width: 1134, height: 2278, depth: 30 },
      weight: 27.5,
    },
    price: 1950000, // 1.95M VND
    description: 'Tấm Canadian Solar HiKu7 chất lượng Bắc Mỹ. Độ tin cậy cao, bảo hành tốt.',
    features: [
      'Công nghệ HiKu7',
      'Bảo hành 15 năm',
      '25 năm bảo hành công suất',
      'PID-free design',
      'Chứng nhận TUV/UL',
    ],
    inStock: true,
    locale: 'vi',
  },

  // ========== PREMIUM TIER (5 sản phẩm) ==========
  {
    _type: 'product',
    name: 'Micro Inverter Enphase IQ8+ 300W',
    slug: { _type: 'slug', current: 'enphase-iq8-300w-premium' },
    category: 'inverter',
    brand: 'Enphase',
    model: 'IQ8+-72-2-US',
    tier: 'premium',
    brandOrigin: 'USA',
    techSpecs: {
      capacity: 300,
      efficiency: 97.5,
      warrantyYears: 25,
      voltage: 230,
      current: 1.3,
    },
    price: 5200000, // 5.2M VND/cái
    description: 'Micro inverter Enphase hàng đầu thế giới. Từng tấm độc lập, an toàn tối đa.',
    features: [
      'Bảo hành 25 năm',
      'Mỗi tấm 1 inverter',
      'Không có điểm lỗi duy nhất',
      'Enlighten Cloud',
      'Rapid Shutdown',
      'Grid-Forming',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Tấm pin Panasonic 410W HIT+',
    slug: { _type: 'slug', current: 'panasonic-410w-hit-premium' },
    category: 'solar-panel',
    brand: 'Panasonic',
    model: 'EVPV410',
    tier: 'premium',
    brandOrigin: 'Japan',
    techSpecs: {
      capacity: 410,
      efficiency: 21.7,
      warrantyYears: 25,
      voltage: 69.7,
      current: 5.88,
      dimensions: { width: 1053, height: 1590, depth: 35 },
      weight: 19.0,
    },
    price: 4500000, // 4.5M VND
    description: 'Tấm pin Panasonic HIT+ công nghệ Nhật Bản. Hiệu suất cao ở nhiệt độ cao.',
    features: [
      'Công nghệ HIT (Heterojunction)',
      'Hiệu suất 21.7%',
      'Bảo hành 25 năm',
      'Hệ số nhiệt tốt nhất',
      'Độ suy giảm cực thấp',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Biến tần SolarEdge 10kW HD-Wave',
    slug: { _type: 'slug', current: 'solaredge-10kw-hdwave-premium' },
    category: 'inverter',
    brand: 'SolarEdge',
    model: 'SE10K-USR48BNU4',
    tier: 'premium',
    brandOrigin: 'Israel',
    techSpecs: {
      capacity: 10000,
      efficiency: 99.0,
      warrantyYears: 12,
      voltage: 240,
      current: 41.7,
    },
    price: 85000000, // 85M VND
    description: 'Biến tần SolarEdge HD-Wave, hiệu suất 99%. Power optimizer từng tấm.',
    features: [
      'Hiệu suất 99%',
      'Power Optimizer tích hợp',
      'SafeDC™ technology',
      'Monitoring từng tấm',
      'Bảo hành 12 năm',
      'Mở rộng 25 năm',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Pin lưu trữ LG RESU 16kWh Prime',
    slug: { _type: 'slug', current: 'lg-resu-16kwh-premium' },
    category: 'battery',
    brand: 'LG',
    model: 'RESU16H Prime',
    tier: 'premium',
    brandOrigin: 'South Korea',
    techSpecs: {
      capacity: 16000,
      efficiency: 95.0,
      warrantyYears: 10,
      voltage: 400,
      current: 100,
      weight: 190,
    },
    price: 125000000, // 125M VND
    description: 'Pin LG RESU Prime cao cấp. Chất lượng Hàn Quốc, an toàn tuyệt đối.',
    features: [
      'Cell LG Chem',
      '16kWh dung lượng',
      'Bảo hành 10 năm',
      '6000 chu kỳ @ 90% DOD',
      'IP55 ngoài trời',
      'BMS thông minh',
    ],
    inStock: true,
    locale: 'vi',
  },
  {
    _type: 'product',
    name: 'Pin lưu trữ Tesla Powerwall 3 13.5kWh',
    slug: { _type: 'slug', current: 'tesla-powerwall3-135kwh-premium' },
    category: 'battery',
    brand: 'Tesla',
    model: 'Powerwall 3',
    tier: 'premium',
    brandOrigin: 'USA',
    techSpecs: {
      capacity: 13500,
      efficiency: 97.5,
      warrantyYears: 10,
      voltage: 350,
      current: 120,
      weight: 130,
    },
    price: 185000000, // 185M VND
    description: 'Tesla Powerwall 3 huyền thoại. Inverter tích hợp 11.5kW, thiết kế tuyệt đẹp.',
    features: [
      'Inverter tích hợp 11.5kW',
      'Backup toàn nhà',
      'Tesla App điều khiển',
      'Bảo hành 10 năm',
      'Storm Watch AI',
      'Thiết kế sang trọng',
    ],
    inStock: false, // Hàng order
    locale: 'vi',
  },
];

async function seedProducts() {
  console.log('🌱 Bắt đầu seed 15 sản phẩm chiến thuật...\n');

  try {
    for (const product of PRODUCTS) {
      console.log(`📦 Tạo: ${product.name} (${product.tier.toUpperCase()})`);
      
      const result = await client.create(product);
      
      console.log(`   ✅ ID: ${result._id}`);
      console.log(`   💰 Giá: ${(product.price / 1000000).toFixed(1)}M VND`);
      console.log(`   ⚡ Công suất: ${product.techSpecs.capacity}W`);
      console.log(`   🌍 Xuất xứ: ${product.brandOrigin}\n`);
    }

    console.log('✅ HOÀN THÀNH! Seed 15 sản phẩm thành công!\n');
    console.log('📊 Thống kê:');
    console.log(`   💰 Budget: 5 sản phẩm`);
    console.log(`   ⭐ Standard: 5 sản phẩm`);
    console.log(`   👑 Premium: 5 sản phẩm`);
    console.log('\n🔍 Kiểm tra tại: https://goldenenergy.sanity.studio/structure/product\n');

  } catch (error) {
    console.error('❌ Lỗi khi seed:', error.message);
    process.exit(1);
  }
}

seedProducts();
