/**
 * Script to seed pricing packages from PRICE.md into Sanity CMS
 * Run: npm run seed-pricing
 */

import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lhv8h97t',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
});

// Pricing data from PRICE.md
const pricingPackages = [
  // 1 Phase - Residential
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 1: 6kW + Pin 16kWh',
      en: 'Package 1: 6kW + 16kWh Battery',
      zh: '套餐 1: 6kW + 16kWh 电池',
    },
    slug: { current: 'goi-1-6kw-pin-16kwh' },
    category: '1phase',
    capacity: 6,
    priceBeforeVAT: 120,
    priceAfterVAT: 129.6,
    components: [
      {
        name: { vi: 'Tấm Pin 620Wp', en: '620Wp Solar Panel', zh: '620Wp 太阳能板' },
        quantity: '9 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter Hybrid 6KW', en: '6KW Hybrid Inverter', zh: '6KW 混合逆变器' },
        quantity: '1 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 16kWh', en: '16kWh Battery Storage', zh: '16kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Dây, MCB, Phụ kiện', en: 'Wiring, MCB, Accessories', zh: '线缆、断路器、配件' },
        quantity: 'Trọn gói',
        icon: '🔌',
      },
    ],
    suitableFor: {
      vi: 'Hộ gia đình 3-5 người, tiêu thụ 200-300 kWh/tháng',
      en: 'Family of 3-5, consumption 200-300 kWh/month',
      zh: '3-5人家庭，月用电量200-300 kWh',
    },
    monthlyConsumption: { min: 200, max: 300 },
    featured: false,
    order: 1,
    warranty: { panels: 25, inverter: 10, battery: 10 },
    installationTime: { vi: '3-5 ngày', en: '3-5 days', zh: '3-5天' },
    isActive: true,
  },
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 2: 12kW + Pin 32kWh',
      en: 'Package 2: 12kW + 32kWh Battery',
      zh: '套餐 2: 12kW + 32kWh 电池',
    },
    slug: { current: 'goi-2-12kw-pin-32kwh' },
    category: '1phase',
    capacity: 12,
    priceBeforeVAT: 230,
    priceAfterVAT: 248.4,
    components: [
      {
        name: { vi: 'Tấm Pin 620Wp', en: '620Wp Solar Panel', zh: '620Wp 太阳能板' },
        quantity: '18 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter Hybrid 12KW', en: '12KW Hybrid Inverter', zh: '12KW 混合逆变器' },
        quantity: '1 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 32kWh', en: '32kWh Battery Storage', zh: '32kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Dây, MCB, Phụ kiện', en: 'Wiring, MCB, Accessories', zh: '线缆、断路器、配件' },
        quantity: 'Trọn gói',
        icon: '🔌',
      },
    ],
    suitableFor: {
      vi: 'Hộ gia đình 5-7 người, tiêu thụ 400-600 kWh/tháng',
      en: 'Family of 5-7, consumption 400-600 kWh/month',
      zh: '5-7人家庭，月用电量400-600 kWh',
    },
    monthlyConsumption: { min: 400, max: 600 },
    featured: true, // Most popular
    order: 2,
    warranty: { panels: 25, inverter: 10, battery: 10 },
    installationTime: { vi: '4-6 ngày', en: '4-6 days', zh: '4-6天' },
    isActive: true,
  },
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 3: 18kW + Pin 48kWh',
      en: 'Package 3: 18kW + 48kWh Battery',
      zh: '套餐 3: 18kW + 48kWh 电池',
    },
    slug: { current: 'goi-3-18kw-pin-48kwh' },
    category: '1phase',
    capacity: 18,
    priceBeforeVAT: 330,
    priceAfterVAT: 356.4,
    components: [
      {
        name: { vi: 'Tấm Pin 620Wp', en: '620Wp Solar Panel', zh: '620Wp 太阳能板' },
        quantity: '27 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter Hybrid 18KW', en: '18KW Hybrid Inverter', zh: '18KW 混合逆变器' },
        quantity: '1 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 48kWh', en: '48kWh Battery Storage', zh: '48kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Dây, MCB, Phụ kiện', en: 'Wiring, MCB, Accessories', zh: '线缆、断路器、配件' },
        quantity: 'Trọn gói',
        icon: '🔌',
      },
    ],
    suitableFor: {
      vi: 'Biệt thự, nhà lớn 7+ người, tiêu thụ 700-900 kWh/tháng',
      en: 'Villa, large house 7+ people, consumption 700-900 kWh/month',
      zh: '别墅、大房子7+人，月用电量700-900 kWh',
    },
    monthlyConsumption: { min: 700, max: 900 },
    featured: false,
    order: 3,
    warranty: { panels: 25, inverter: 10, battery: 10 },
    installationTime: { vi: '5-7 ngày', en: '5-7 days', zh: '5-7天' },
    isActive: true,
  },

  // 3 Phase - Commercial with Storage
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 4: 15kW + Pin 45kWh',
      en: 'Package 4: 15kW + 45kWh Battery',
      zh: '套餐 4: 15kW + 45kWh 电池',
    },
    slug: { current: 'goi-4-15kw-pin-45kwh' },
    category: '3phase-storage',
    capacity: 15,
    priceBeforeVAT: 350,
    priceAfterVAT: 378,
    components: [
      {
        name: { vi: 'Tấm Pin 700Wp', en: '700Wp Solar Panel', zh: '700Wp 太阳能板' },
        quantity: '21 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter 3 Pha 15KW', en: '15KW 3-Phase Inverter', zh: '15KW 三相逆变器' },
        quantity: '1 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 45kWh', en: '45kWh Battery Storage', zh: '45kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Giám Sát Từ Xa', en: 'Remote Monitoring', zh: '远程监控' },
        quantity: '1 hệ thống',
        icon: '📱',
      },
    ],
    suitableFor: {
      vi: 'Cửa hàng, văn phòng nhỏ, tiêu thụ 1,000-1,500 kWh/tháng',
      en: 'Store, small office, consumption 1,000-1,500 kWh/month',
      zh: '商店、小型办公室，月用电量1,000-1,500 kWh',
    },
    monthlyConsumption: { min: 1000, max: 1500 },
    featured: false,
    order: 4,
    warranty: { panels: 25, inverter: 12, battery: 10 },
    installationTime: { vi: '7-10 ngày', en: '7-10 days', zh: '7-10天' },
    isActive: true,
  },
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 5: 30kW + Pin 90kWh',
      en: 'Package 5: 30kW + 90kWh Battery',
      zh: '套餐 5: 30kW + 90kWh 电池',
    },
    slug: { current: 'goi-5-30kw-pin-90kwh' },
    category: '3phase-storage',
    capacity: 30,
    priceBeforeVAT: 650,
    priceAfterVAT: 702,
    components: [
      {
        name: { vi: 'Tấm Pin 700Wp', en: '700Wp Solar Panel', zh: '700Wp 太阳能板' },
        quantity: '42 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter 3 Pha 30KW', en: '30KW 3-Phase Inverter', zh: '30KW 三相逆变器' },
        quantity: '1 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 90kWh', en: '90kWh Battery Storage', zh: '90kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Hệ thống giám sát AI', en: 'AI Monitoring System', zh: 'AI监控系统' },
        quantity: '1 hệ thống',
        icon: '🤖',
      },
    ],
    suitableFor: {
      vi: 'Khách sạn, nhà hàng, văn phòng lớn, tiêu thụ 2,500-3,500 kWh/tháng',
      en: 'Hotel, restaurant, large office, consumption 2,500-3,500 kWh/month',
      zh: '酒店、餐厅、大型办公室，月用电量2,500-3,500 kWh',
    },
    monthlyConsumption: { min: 2500, max: 3500 },
    featured: true, // Commercial popular
    order: 5,
    warranty: { panels: 25, inverter: 12, battery: 10 },
    installationTime: { vi: '10-14 ngày', en: '10-14 days', zh: '10-14天' },
    isActive: true,
  },
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 6: 50kW + Pin 125kWh',
      en: 'Package 6: 50kW + 125kWh Battery',
      zh: '套餐 6: 50kW + 125kWh 电池',
    },
    slug: { current: 'goi-6-50kw-pin-125kwh' },
    category: '3phase-storage',
    capacity: 50,
    priceBeforeVAT: 1200,
    priceAfterVAT: 1296,
    components: [
      {
        name: { vi: 'Tấm Pin 700Wp', en: '700Wp Solar Panel', zh: '700Wp 太阳能板' },
        quantity: '70 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter 3 Pha 50KW', en: '50KW 3-Phase Inverter', zh: '50KW 三相逆变器' },
        quantity: '1 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 125kWh', en: '125kWh Battery Storage', zh: '125kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Hệ thống giám sát & Bảo trì', en: 'Monitoring & Maintenance System', zh: '监控和维护系统' },
        quantity: '1 hệ thống',
        icon: '🔧',
      },
    ],
    suitableFor: {
      vi: 'Xưởng sản xuất nhỏ, resort, trung tâm thương mại, tiêu thụ 5,000-7,000 kWh/tháng',
      en: 'Small factory, resort, shopping center, consumption 5,000-7,000 kWh/month',
      zh: '小型工厂、度假村、购物中心，月用电量5,000-7,000 kWh',
    },
    monthlyConsumption: { min: 5000, max: 7000 },
    featured: false,
    order: 6,
    warranty: { panels: 25, inverter: 12, battery: 10 },
    installationTime: { vi: '14-21 ngày', en: '14-21 days', zh: '14-21天' },
    isActive: true,
  },
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói 7: 100kW + Pin 256kWh',
      en: 'Package 7: 100kW + 256kWh Battery',
      zh: '套餐 7: 100kW + 256kWh 电池',
    },
    slug: { current: 'goi-7-100kw-pin-256kwh' },
    category: '3phase-storage',
    capacity: 100,
    priceBeforeVAT: 2300,
    priceAfterVAT: 2484,
    components: [
      {
        name: { vi: 'Tấm Pin 700Wp', en: '700Wp Solar Panel', zh: '700Wp 太阳能板' },
        quantity: '140 tấm',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter 3 Pha 100KW', en: '100KW 3-Phase Inverter', zh: '100KW 三相逆变器' },
        quantity: '2 bộ',
        icon: '⚡',
      },
      {
        name: { vi: 'Pin Lưu Trữ 256kWh', en: '256kWh Battery Storage', zh: '256kWh 储能电池' },
        quantity: '1 bộ',
        icon: '🔋',
      },
      {
        name: { vi: 'Hệ thống SCADA & EMS', en: 'SCADA & EMS System', zh: 'SCADA和EMS系统' },
        quantity: '1 hệ thống',
        icon: '💻',
      },
    ],
    suitableFor: {
      vi: 'Nhà máy, khu công nghiệp nhỏ, tòa nhà văn phòng lớn, tiêu thụ 10,000+ kWh/tháng',
      en: 'Factory, small industrial zone, large office building, consumption 10,000+ kWh/month',
      zh: '工厂、小型工业区、大型办公楼，月用电量10,000+ kWh',
    },
    monthlyConsumption: { min: 10000, max: 15000 },
    featured: false,
    order: 7,
    warranty: { panels: 25, inverter: 12, battery: 10 },
    installationTime: { vi: '21-30 ngày', en: '21-30 days', zh: '21-30天' },
    isActive: true,
  },

  // C&I On-Grid (No Storage)
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói C&I On-Grid (>100kW)',
      en: 'C&I On-Grid Package (>100kW)',
      zh: '工商业并网套餐 (>100kW)',
    },
    slug: { current: 'ci-ongrid-100kw-plus' },
    category: 'ci-ongrid',
    capacity: 150, // Example capacity
    priceBeforeVAT: 30, // 30,000 VND/kW
    priceAfterVAT: 32.4,
    components: [
      {
        name: { vi: 'Tấm Pin Công Suất Cao', en: 'High-Power Solar Panels', zh: '高功率太阳能板' },
        quantity: 'Tùy công suất',
        icon: '🔆',
      },
      {
        name: { vi: 'Inverter 3 Pha String', en: '3-Phase String Inverter', zh: '三相组串逆变器' },
        quantity: 'Tùy thiết kế',
        icon: '⚡',
      },
      {
        name: { vi: 'Giám Sát SCADA', en: 'SCADA Monitoring', zh: 'SCADA监控' },
        quantity: '1 hệ thống',
        icon: '📊',
      },
      {
        name: { vi: 'Khảo sát & Thiết kế', en: 'Survey & Design', zh: '勘察和设计' },
        quantity: 'Miễn phí',
        icon: '📐',
      },
    ],
    suitableFor: {
      vi: 'Nhà máy lớn, khu công nghiệp, trung tâm thương mại lớn, tiêu thụ >15,000 kWh/tháng',
      en: 'Large factory, industrial zone, large shopping mall, consumption >15,000 kWh/month',
      zh: '大型工厂、工业区、大型购物中心，月用电量>15,000 kWh',
    },
    monthlyConsumption: { min: 15000, max: 50000 },
    featured: false,
    order: 8,
    warranty: { panels: 25, inverter: 12, battery: 0 },
    installationTime: { vi: '30-60 ngày', en: '30-60 days', zh: '30-60天' },
    isActive: true,
  },

  // BESS (Battery Energy Storage System)
  {
    _type: 'pricingPackage',
    name: {
      vi: 'Gói BESS (>100kW)',
      en: 'BESS Package (>100kW)',
      zh: '电池储能系统套餐 (>100kW)',
    },
    slug: { current: 'bess-100kw-plus' },
    category: 'bess',
    capacity: 200, // Example capacity
    priceBeforeVAT: 40, // 40,000 VND/kW
    priceAfterVAT: 43.2,
    components: [
      {
        name: { vi: 'Pin Lithium-Ion Công Nghiệp', en: 'Industrial Lithium-Ion Battery', zh: '工业锂离子电池' },
        quantity: 'Tùy công suất',
        icon: '🔋',
      },
      {
        name: { vi: 'BMS & EMS System', en: 'BMS & EMS System', zh: 'BMS和EMS系统' },
        quantity: '1 hệ thống',
        icon: '🖥️',
      },
      {
        name: { vi: 'Hệ thống làm mát', en: 'Cooling System', zh: '冷却系统' },
        quantity: '1 hệ thống',
        icon: '❄️',
      },
      {
        name: { vi: 'Tích hợp lưới điện', en: 'Grid Integration', zh: '电网集成' },
        quantity: 'Đầy đủ',
        icon: '🔌',
      },
    ],
    suitableFor: {
      vi: 'Nhà máy 24/7, Data Center, bệnh viện lớn, trung tâm logistics',
      en: '24/7 Factory, Data Center, large hospital, logistics center',
      zh: '24/7工厂、数据中心、大型医院、物流中心',
    },
    monthlyConsumption: { min: 20000, max: 100000 },
    featured: false,
    order: 9,
    warranty: { panels: 0, inverter: 12, battery: 10 },
    installationTime: { vi: '60-90 ngày', en: '60-90 days', zh: '60-90天' },
    isActive: true,
  },
];

async function seedPricingPackages() {
  console.log('🌱 Starting to seed pricing packages...\n');

  try {
    for (const packageData of pricingPackages) {
      console.log(`📦 Creating: ${packageData.name.vi} (${packageData.capacity}kW)`);
      
      const result = await client.create(packageData);
      
      console.log(`✅ Created with ID: ${result._id}`);
      console.log(`   - Price: ${packageData.priceBeforeVAT}M VND (before VAT)`);
      console.log(`   - Category: ${packageData.category}`);
      console.log(`   - Featured: ${packageData.featured ? 'Yes' : 'No'}\n`);
    }

    console.log(`\n✨ Successfully seeded ${pricingPackages.length} pricing packages!\n`);
    console.log('🔗 View in Sanity Studio:');
    console.log(`   https://goldenenergy.sanity.studio/desk/pricingPackage\n`);
  } catch (error) {
    console.error('❌ Error seeding pricing packages:', error);
    process.exit(1);
  }
}

// Run the seed script
seedPricingPackages();
