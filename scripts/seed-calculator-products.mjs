import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// CALCULATOR-READY PRODUCTS DATA
const calculatorProducts = [
  // INVERTERS (3 products)
  {
    name: 'Huawei SUN2000-5KTL-L1',
    slug: { _type: 'slug', current: 'huawei-sun2000-5ktl-l1' },
    category: 'inverter',
    brand: 'Huawei',
    model: 'SUN2000-5KTL-L1',
    techSpecs: {
      capacity: 5000,
      efficiency: 98.6,
      warrantyYears: 10,
      voltage: 600,
      current: 12.5,
      dimensions: '365 x 365 x 156',
      weight: 16.5,
    },
    price: 18000000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Biến tần Huawei 5kW hiệu suất cao 98.6%, tích hợp AFCI chống cháy, tương thích pin lưu trữ. Phù hợp hộ gia đình 3-5 người.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Công suất DC tối đa', value: '6.5kW' },
      { label: 'Điện áp MPPT', value: '90-560V' },
      { label: 'Số MPPT', value: '2' },
      { label: 'Hiệu suất tối đa', value: '98.6%' },
    ],
    features: [
      'AI tối ưu MPPT',
      'Tích hợp AFCI chống cháy',
      'Giám sát qua app Huawei FusionSolar',
      'Tương thích pin Huawei LUNA',
    ],
    warranty: 10,
    inStock: true,
    locale: 'vi',
  },
  {
    name: 'Huawei SUN2000-10KTL-M1',
    slug: { _type: 'slug', current: 'huawei-sun2000-10ktl-m1' },
    category: 'inverter',
    brand: 'Huawei',
    model: 'SUN2000-10KTL-M1',
    techSpecs: {
      capacity: 10000,
      efficiency: 98.65,
      warrantyYears: 10,
      voltage: 1000,
      current: 22,
      dimensions: '490 x 430 x 166',
      weight: 25,
    },
    price: 32000000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Biến tần Huawei 10kW cho biệt thự, khách sạn nhỏ. Hiệu suất 98.65%, 4 MPPT độc lập, tích hợp optimizer.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Công suất DC tối đa', value: '15kW' },
      { label: 'Điện áp MPPT', value: '160-950V' },
      { label: 'Số MPPT', value: '4' },
    ],
    features: [
      '4 MPPT độc lập - tối ưu mỗi chuỗi',
      'Smart String 2.0',
      'IP65 - lắp ngoài trời',
      'Giám sát real-time qua WiFi/4G',
    ],
    warranty: 10,
    inStock: true,
    locale: 'vi',
  },
  {
    name: 'GoodWe GW5000-EH Hybrid',
    slug: { _type: 'slug', current: 'goodwe-gw5000-eh-hybrid' },
    category: 'inverter',
    brand: 'GoodWe',
    model: 'GW5000-EH',
    techSpecs: {
      capacity: 5000,
      efficiency: 97.6,
      warrantyYears: 10,
      voltage: 550,
      current: 13,
      dimensions: '406 x 342 x 154',
      weight: 14,
    },
    price: 20000000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Biến tần Hybrid GoodWe 5kW tích hợp sạc pin, UPS backup. Giá tốt, phù hợp hộ gia đình muốn lưu trữ năng lượng.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Chế độ Hybrid', value: 'On-grid + Off-grid' },
      { label: 'Dung lượng pin tối đa', value: '15kWh' },
      { label: 'Chuyển mạch UPS', value: '<10ms' },
    ],
    features: [
      'Hybrid 3-in-1 (Solar + Grid + Battery)',
      'UPS backup tự động',
      'Tương thích pin LiFePO4',
      'Giá cạnh tranh',
    ],
    warranty: 10,
    inStock: true,
    locale: 'vi',
  },

  // SOLAR PANELS (3 products)
  {
    name: 'Longi Hi-MO 6 450W',
    slug: { _type: 'slug', current: 'longi-hi-mo-6-450w' },
    category: 'solar-panel',
    brand: 'Longi',
    model: 'LR5-72HPH-450M',
    techSpecs: {
      capacity: 450,
      efficiency: 21.8,
      warrantyYears: 25,
      voltage: 41.7,
      current: 10.8,
      dimensions: '2094 x 1038 x 35',
      weight: 23.5,
    },
    price: 3200000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Tấm pin Longi 450W công nghệ Mono PERC hiệu suất 21.8%. Bảo hành 25 năm sản lượng 84.8%. Top 3 thế giới.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Số cell', value: '144 cells (6x24)' },
      { label: 'Hiệu suất tế bào', value: '22.8%' },
      { label: 'Hệ số nhiệt độ', value: '-0.34%/°C' },
    ],
    features: [
      'Công nghệ Mono PERC thế hệ mới',
      'Giảm suy hao năm đầu <2%',
      'Chịu tải gió 2400Pa, tuyết 5400Pa',
      'Chứng nhận TÜV, IEC, CE',
    ],
    warranty: 25,
    inStock: true,
    locale: 'vi',
  },
  {
    name: 'Canadian Solar HiKu6 550W',
    slug: { _type: 'slug', current: 'canadian-solar-hiku6-550w' },
    category: 'solar-panel',
    brand: 'Canadian Solar',
    model: 'CS6R-550MS',
    techSpecs: {
      capacity: 550,
      efficiency: 21.5,
      warrantyYears: 25,
      voltage: 41.8,
      current: 13.16,
      dimensions: '2278 x 1134 x 35',
      weight: 27.5,
    },
    price: 4000000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Tấm pin Canadian Solar 550W hiệu suất cao cho thương mại. Diện tích nhỏ hơn, công suất lớn hơn 22% so với 450W.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Số cell', value: '144 cells (6x24)' },
      { label: 'Kích thước lớn', value: 'Tiết kiệm diện tích' },
      { label: 'Bảo hành sản lượng', value: '30 năm 84.8%' },
    ],
    features: [
      'Công suất cao 550W - tiết kiệm diện tích',
      'Chịu mưa đá 35mm',
      'PID Free - không bị suy giảm điện thế',
      'Bảo hành 30 năm sản lượng',
    ],
    warranty: 25,
    inStock: true,
    locale: 'vi',
  },
  {
    name: 'JA Solar JAM72S30 545W',
    slug: { _type: 'slug', current: 'ja-solar-jam72s30-545w' },
    category: 'solar-panel',
    brand: 'JA Solar',
    model: 'JAM72S30-545/MR',
    techSpecs: {
      capacity: 545,
      efficiency: 21.3,
      warrantyYears: 25,
      voltage: 49.25,
      current: 11.07,
      dimensions: '2278 x 1134 x 35',
      weight: 27.6,
    },
    price: 3800000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Tấm pin JA Solar 545W giá tốt nhất phân khúc 550W. Công nghệ PERC + Half-cut, hiệu suất 21.3%, phù hợp dự án lớn.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Công nghệ', value: 'Mono PERC + Half-cut' },
      { label: 'Điện áp mở mạch', value: '49.25V' },
      { label: 'Dòng ngắn mạch', value: '11.07A' },
    ],
    features: [
      'Giá tốt nhất phân khúc',
      'Half-cut giảm mất mát dòng',
      'Multi-Busbar (MBB) tăng độ bền',
      'Top 3 thị trường Việt Nam',
    ],
    warranty: 25,
    inStock: true,
    locale: 'vi',
  },

  // BATTERIES (2 products)
  {
    name: 'UFO Powerwall 5.12kWh',
    slug: { _type: 'slug', current: 'ufo-powerwall-5-12kwh' },
    category: 'battery',
    brand: 'UFO Battery',
    model: 'UP5000',
    techSpecs: {
      capacity: 5120,
      efficiency: 95,
      warrantyYears: 10,
      voltage: 51.2,
      current: 100,
      dimensions: '485 x 400 x 175',
      weight: 52,
    },
    price: 28000000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Pin lưu trữ UFO 5.12kWh LiFePO4 cho hộ gia đình. Chu kỳ 6000 lần, an toàn tuyệt đối, giá tốt. Tương thích mọi biến tần Hybrid.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Loại pin', value: 'LiFePO4 (Lithium Iron Phosphate)' },
      { label: 'Chu kỳ sạc-xả', value: '6000 cycles @ 80% DOD' },
      { label: 'Dòng sạc tối đa', value: '100A' },
    ],
    features: [
      'LiFePO4 an toàn nhất',
      'Có thể mở rộng đến 15kWh',
      'Tương thích Growatt, GoodWe, Deye',
      'Giá rẻ - Made in Vietnam',
    ],
    warranty: 10,
    inStock: true,
    locale: 'vi',
  },
  {
    name: 'Huawei LUNA2000-15-S0',
    slug: { _type: 'slug', current: 'huawei-luna2000-15-s0' },
    category: 'battery',
    brand: 'Huawei',
    model: 'LUNA2000-15-S0',
    techSpecs: {
      capacity: 15000,
      efficiency: 95,
      warrantyYears: 10,
      voltage: 600,
      current: 30,
      dimensions: '670 x 600 x 150',
      weight: 168,
    },
    price: 95000000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Pin Huawei LUNA 15kWh cao cấp cho biệt thự, khách sạn. Tích hợp BMS thông minh, giám sát từng cell, tuổi thọ 12 năm.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Loại pin', value: 'LiFePO4 Grade A' },
      { label: 'Chu kỳ', value: '10000 cycles @ 90% DOD' },
      { label: 'BMS', value: 'AI Smart Management' },
    ],
    features: [
      'BMS thông minh AI',
      'Giám sát từng cell',
      'Tích hợp Optimizer',
      'Tương thích chỉ biến tần Huawei',
    ],
    warranty: 10,
    inStock: true,
    locale: 'vi',
  },

  // ACCESSORIES (2 products)
  {
    name: 'MC4 Solar Connector (Male+Female)',
    slug: { _type: 'slug', current: 'mc4-solar-connector' },
    category: 'accessory',
    brand: 'Generic',
    model: 'MC4-2.5-6.0',
    techSpecs: {
      capacity: 0,
      efficiency: 99.9,
      warrantyYears: 5,
      voltage: 1000,
      current: 30,
      dimensions: '60 x 25 x 25',
      weight: 0.05,
    },
    price: 50000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Đầu nối MC4 tiêu chuẩn quốc tế, chịu nước IP67, chịu nhiệt -40°C đến +90°C. Dùng cho dây 2.5-6.0mm².',
          },
        ],
      },
    ],
    specs: [
      { label: 'Chống nước', value: 'IP67' },
      { label: 'Nhiệt độ', value: '-40°C ~ +90°C' },
    ],
    features: ['Tiêu chuẩn quốc tế', 'Chống nước IP67', 'Dễ lắp đặt'],
    warranty: 5,
    inStock: true,
    locale: 'vi',
  },
  {
    name: 'Solar Cable 4mm² (Per Meter)',
    slug: { _type: 'slug', current: 'solar-cable-4mm2' },
    category: 'accessory',
    brand: 'Generic',
    model: 'SOLAR-4MM',
    techSpecs: {
      capacity: 0,
      efficiency: 99,
      warrantyYears: 10,
      voltage: 1000,
      current: 32,
      dimensions: '4mm² cross section',
      weight: 0.05,
    },
    price: 15000,
    description: [
      {
        _type: 'block',
        children: [
          {
            _type: 'span',
            text: 'Dây cáp solar 4mm² chịu UV, chịu nhiệt, chứng nhận TÜV. Dùng nối tấm pin với inverter.',
          },
        ],
      },
    ],
    specs: [
      { label: 'Tiết diện', value: '4mm²' },
      { label: 'Chịu UV', value: '25 năm' },
    ],
    features: ['Chống UV', 'Chứng nhận TÜV', 'Chịu nhiệt -40°C ~ +120°C'],
    warranty: 10,
    inStock: true,
    locale: 'vi',
  },
]

async function seedCalculatorProducts() {
  console.log('🌱 SEEDING CALCULATOR-READY PRODUCTS...\n')

  const stats = {
    success: 0,
    failed: 0,
    errors: [],
  }

  for (const [index, productData] of calculatorProducts.entries()) {
    try {
      console.log(`[${index + 1}/${calculatorProducts.length}] Creating: ${productData.name}`)

      const doc = await client.create({
        _type: 'product',
        ...productData,
      })

      console.log(`  ✅ Created: ${doc._id}`)
      stats.success++
    } catch (error) {
      console.error(`  ❌ Failed: ${productData.name}`)
      console.error(`     Error: ${error.message}`)
      stats.failed++
      stats.errors.push({ product: productData.name, error: error.message })
    }
  }

  console.log('\n================================================')
  console.log('📊 SEEDING SUMMARY')
  console.log('================================================')
  console.log(`✅ Success: ${stats.success}`)
  console.log(`❌ Failed: ${stats.failed}`)

  if (stats.errors.length > 0) {
    console.log('\n🔴 ERRORS:')
    stats.errors.forEach((err) => {
      console.log(`  - ${err.product}: ${err.error}`)
    })
  }

  console.log('\n✅ SEEDING COMPLETED!')
  console.log('\n📝 Next steps:')
  console.log('1. Visit: http://localhost:3000/cms')
  console.log('2. Navigate to "Products" tab')
  console.log('3. Verify 10 products are present')
  console.log('4. Calculator can now query: *[_type == "product" && category == "inverter"]')
}

seedCalculatorProducts().catch((error) => {
  console.error('💥 SEEDING FAILED:', error)
  process.exit(1)
})
