/**
 * SANITY PRODUCTS SEED DATA
 * Based on PRICE.md official pricing structure
 * 
 * Product categories from PRICE.md:
 * 1. Residential Systems (6-18kW with battery)
 * 2. Commercial 3-Phase Systems (15-100kW)
 * 3. Industrial On-Grid (>100kW)
 * 4. BESS (Battery Energy Storage Systems)
 * 
 * Top brands: Huawei, GoodWe, Solis, Longi, JA Solar, Growatt, Pylontech, BYD
 */

export const solarProducts = [
  // ============================================
  // 1. SOLAR PANELS (Tấm pin mặt trời)
  // ============================================
  {
    _type: 'product',
    name: 'Longi Hi-MO 6 LR5-72HTH-700M',
    slug: { current: 'longi-himo6-700w' },
    brand: 'Longi',
    category: 'solar-panel',
    power: 700, // Wp
    price: 3_200_000, // VND (cho 1 tấm)
    priceUnit: 'VND',
    shortDescription: 'Tấm pin Mono PERC 700Wp hiệu suất cao 22.8%, bảo hành 25 năm',
    description: `**Longi Hi-MO 6 Explorer** - Tấm pin mặt trời hàng đầu thế giới

**Thông số kỹ thuật:**
- Công suất: 700Wp
- Hiệu suất: 22.8% (Leading efficiency)
- Công nghệ: Mono PERC Half-cell
- Kích thước: 2278 x 1134 x 30mm
- Trọng lượng: 34.5kg
- Bảo hành công suất: 30 năm (>87.4% sau 30 năm)
- Bảo hành sản phẩm: 12 năm

**Ưu điểm:**
✅ Chống PID: Performance degradation resistance
✅ Chịu tải tuyết: 5400Pa front / 2400Pa back
✅ Chống ăn mòn muối: Ideal for coastal areas
✅ Chứng nhận: IEC, CE, TUV, UL

**Ứng dụng:** Hệ thống 3-Phase 15-100kW (PRICE.md gói thương mại/công nghiệp)`,
    specifications: {
      power: 700,
      efficiency: 22.8,
      warranty_power: 30,
      warranty_product: 12,
      dimensions: '2278 x 1134 x 30mm',
      weight: 34.5,
    },
    images: ['/products/longi-himo6-700w.jpg'],
    inStock: true,
    featured: true,
    tags: ['700W', 'Mono PERC', 'Commercial', 'Industrial', '3-Phase'],
  },

  {
    _type: 'product',
    name: 'JA Solar JAM72S30-620/MR 620Wp',
    slug: { current: 'ja-solar-jam72s30-620w' },
    brand: 'JA Solar',
    category: 'solar-panel',
    power: 620,
    price: 2_900_000, // VND
    priceUnit: 'VND',
    shortDescription: 'Tấm pin 620Wp cho hệ thống hộ gia đình, hiệu suất 21.5%',
    description: `**JA Solar JAM72S30** - Tấm pin phổ biến cho hộ gia đình

**Thông số kỹ thuật:**
- Công suất: 620Wp
- Hiệu suất: 21.5%
- Công nghệ: Mono PERC Half-cell
- Kích thước: 2278 x 1134 x 35mm
- Trọng lượng: 32kg
- Bảo hành công suất: 25 năm (>84.8% sau 25 năm)
- Bảo hành sản phẩm: 12 năm

**Ưu điểm:**
✅ Giá tốt cho hộ gia đình
✅ Hiệu suất ổn định 21.5%
✅ Chống PID 100%
✅ Chịu gió tốt: Wind load 2400Pa

**Ứng dụng:** Hệ thống 1-Phase 6-18kW (PRICE.md gói hộ gia đình 120-330M)`,
    specifications: {
      power: 620,
      efficiency: 21.5,
      warranty_power: 25,
      warranty_product: 12,
      dimensions: '2278 x 1134 x 35mm',
      weight: 32,
    },
    images: ['/products/ja-solar-620w.jpg'],
    inStock: true,
    featured: true,
    tags: ['620W', 'Residential', '1-Phase', 'Budget Friendly'],
  },

  {
    _type: 'product',
    name: 'Trina Solar Vertex S+ TSM-DE21 670Wp',
    slug: { current: 'trina-vertex-s-670w' },
    brand: 'Trina Solar',
    category: 'solar-panel',
    power: 670,
    price: 3_100_000,
    priceUnit: 'VND',
    shortDescription: 'Tấm pin 670Wp cân bằng giá-chất lượng, phù hợp mọi dự án',
    description: `**Trina Vertex S+** - Lựa chọn cân bằng giá-chất lượng

**Thông số kỹ thuật:**
- Công suất: 670Wp
- Hiệu suất: 22.1%
- Công nghệ: Mono PERC Half-cell + Multi-busbar
- Bảo hành: 25 năm công suất, 15 năm sản phẩm

**Ứng dụng:** Universal - Hộ gia đình, Thương mại, Công nghiệp`,
    specifications: {
      power: 670,
      efficiency: 22.1,
      warranty_power: 25,
      warranty_product: 15,
    },
    images: ['/products/trina-vertex-670w.jpg'],
    inStock: true,
    tags: ['670W', 'Universal', 'Cost-effective'],
  },

  // ============================================
  // 2. INVERTERS - RESIDENTIAL (1-Phase)
  // ============================================
  {
    _type: 'product',
    name: 'Huawei SUN2000-6KTL-L1 Hybrid Inverter',
    slug: { current: 'huawei-sun2000-6ktl-hybrid' },
    brand: 'Huawei',
    category: 'inverter',
    power: 6000, // W
    price: 18_500_000, // VND
    priceUnit: 'VND',
    shortDescription: 'Inverter Hybrid 6kW hỗ trợ pin lưu trữ, hiệu suất 98.4%',
    description: `**Huawei SUN2000-6KTL-L1** - Inverter Hybrid hàng đầu cho hộ gia đình

**Thông số kỹ thuật:**
- Công suất AC: 6kW (1-Phase)
- Công suất DC max: 9kWp
- Hiệu suất chuyển đổi: 98.4%
- MPPT: 2 chuỗi độc lập
- Điện áp DC: 90-560V
- Điện áp AC: 220/230V ± 10%
- Bảo hành: 10 năm (có thể mở rộng 20 năm)

**Tính năng:**
✅ **Hybrid**: Kết nối pin lưu trữ (16kWh LG/Pylontech)
✅ **Smart Management**: App FusionSolar giám sát real-time
✅ **Backup Power**: Chuyển đổi tự động khi mất điện
✅ **AI-Powered AFCI**: Phát hiện cháy hồ quang
✅ **Zero Export**: Không bán điện cho EVN (tự tiêu thụ 100%)

**Ứng dụng:** Hệ thống 6kW hộ gia đình (PRICE.md: 120M VND trọn gói)

**Tương thích pin:** Huawei LUNA2000, LG RESU, Pylontech US3000C`,
    specifications: {
      power_ac: 6000,
      power_dc_max: 9000,
      efficiency: 98.4,
      mppt: 2,
      voltage_dc: '90-560V',
      voltage_ac: '220/230V',
      warranty: 10,
      hybrid: true,
      backup: true,
    },
    images: ['/products/huawei-sun2000-6ktl.jpg'],
    inStock: true,
    featured: true,
    tags: ['6kW', 'Hybrid', 'Residential', '1-Phase', 'Battery Ready'],
  },

  {
    _type: 'product',
    name: 'GoodWe GW5048D-ES Hybrid Inverter',
    slug: { current: 'goodwe-gw5048d-hybrid' },
    brand: 'GoodWe',
    category: 'inverter',
    power: 5000,
    price: 16_200_000,
    priceUnit: 'VND',
    shortDescription: 'Inverter Hybrid 5kW giá tốt, tích hợp sẵn EPS backup',
    description: `**GoodWe GW5048D-ES** - Inverter Hybrid giá tốt cho hộ gia đình

**Thông số kỹ thuật:**
- Công suất AC: 5kW
- Công suất DC: 6.5kWp
- Hiệu suất: 97.6%
- MPPT: 2 chuỗi
- Bảo hành: 10 năm

**Tính năng:**
✅ EPS (Emergency Power Supply) tích hợp sẵn
✅ Hỗ trợ pin: Pylontech, BYD, GoodWe Lynx
✅ App SEMS Portal giám sát
✅ Giá tốt: Tiết kiệm 15-20% so với Huawei

**Ứng dụng:** Hệ thống 6kW budget-friendly (thay thế Huawei nếu ngân sách hạn chế)`,
    specifications: {
      power_ac: 5000,
      power_dc_max: 6500,
      efficiency: 97.6,
      mppt: 2,
      warranty: 10,
      hybrid: true,
      backup: true,
    },
    images: ['/products/goodwe-gw5048d.jpg'],
    inStock: true,
    tags: ['5kW', 'Hybrid', 'Budget', 'EPS'],
  },

  {
    _type: 'product',
    name: 'Growatt SPH 6000 TL BL-UP Hybrid',
    slug: { current: 'growatt-sph6000-hybrid' },
    brand: 'Growatt',
    category: 'inverter',
    power: 6000,
    price: 15_800_000,
    priceUnit: 'VND',
    shortDescription: 'Inverter Hybrid 6kW giá rẻ nhất, phù hợp gói tiết kiệm',
    description: `**Growatt SPH 6000** - Inverter Hybrid giá rẻ

**Thông số:**
- Công suất: 6kW
- Hiệu suất: 97.3%
- Bảo hành: 5 năm (mở rộng 10 năm)

**Ưu điểm:**
✅ Giá rẻ nhất phân khúc Hybrid
✅ Tương thích pin: Pylontech, Growatt ARK
✅ UPS chuyển đổi < 10ms

**Ứng dụng:** Gói Tiết Kiệm 6kW (PRICE.md)`,
    specifications: {
      power_ac: 6000,
      efficiency: 97.3,
      warranty: 5,
      hybrid: true,
    },
    images: ['/products/growatt-sph6000.jpg'],
    inStock: true,
    tags: ['6kW', 'Budget', 'Hybrid'],
  },

  // ============================================
  // 3. INVERTERS - COMMERCIAL (3-Phase)
  // ============================================
  {
    _type: 'product',
    name: 'Huawei SUN2000-30KTL-M3 Hybrid 3-Phase',
    slug: { current: 'huawei-sun2000-30ktl-3phase' },
    brand: 'Huawei',
    category: 'inverter',
    power: 30000,
    price: 65_000_000,
    priceUnit: 'VND',
    shortDescription: 'Inverter 3-Phase 30kW hỗ trợ unbalance, MPPT 4 chuỗi',
    description: `**Huawei SUN2000-30KTL-M3** - Inverter 3-Phase cho thương mại

**Thông số kỹ thuật:**
- Công suất AC: 30kW (3-Phase 400V)
- Công suất DC max: 45kWp (150% oversizing)
- Hiệu suất: 98.7%
- MPPT: 4 chuỗi độc lập
- Bảo hành: 10 năm

**Tính năng:**
✅ **Support Unbalance 3-Phase**: Hỗ trợ tải không cân bằng giữa 3 pha
✅ **AI Arc Fault Detection**: Phát hiện cháy hồ quang bằng AI
✅ **IV Curve Diagnostic**: Tự chẩn đoán tấm pin lỗi
✅ **String-level Monitoring**: Theo dõi từng chuỗi tấm pin
✅ **Smart PID Recovery**: Tự phục hồi suy giảm hiệu suất

**Ứng dụng:** Hệ thống 30kW thương mại (PRICE.md: 650M VND = 30kW + Pin 90kWh)

**Kết hợp:**
- 44 tấm Longi 700Wp = 30.8kWp
- Pin: 6x Pylontech US5000 (15kWh) = 90kWh
- Monitoring: FusionSolar Cloud`,
    specifications: {
      power_ac: 30000,
      power_dc_max: 45000,
      efficiency: 98.7,
      mppt: 4,
      phases: 3,
      warranty: 10,
      unbalance_support: true,
    },
    images: ['/products/huawei-sun2000-30ktl.jpg'],
    inStock: true,
    featured: true,
    tags: ['30kW', '3-Phase', 'Commercial', 'Unbalance Support'],
  },

  {
    _type: 'product',
    name: 'Solis S6-GR1P50K-M 50kW 3-Phase',
    slug: { current: 'solis-s6-50k-3phase' },
    brand: 'Solis',
    category: 'inverter',
    power: 50000,
    price: 95_000_000,
    priceUnit: 'VND',
    shortDescription: 'Inverter 50kW hiệu suất cao 99.0%, chống ăn mòn C5',
    description: `**Solis S6-GR1P50K-M** - Inverter 50kW chống ăn mòn biển

**Thông số:**
- Công suất: 50kW (3-Phase)
- Hiệu suất: 99.0% (Leading efficiency)
- MPPT: 6 chuỗi
- Bảo hành: 10 năm

**Ưu điểm:**
✅ Hiệu suất 99.0% (cao nhất phân khúc)
✅ Chống ăn mòn C5: Ideal for coastal projects
✅ IP66 rating: Chống nước hoàn toàn
✅ Fan-less design: Không ồn, bảo trì thấp

**Ứng dụng:** Hệ thống 50kW (PRICE.md: 1.2B VND)`,
    specifications: {
      power_ac: 50000,
      efficiency: 99.0,
      mppt: 6,
      phases: 3,
      warranty: 10,
      ip_rating: 'IP66',
      corrosion_protection: 'C5',
    },
    images: ['/products/solis-50k.jpg'],
    inStock: true,
    featured: true,
    tags: ['50kW', '3-Phase', 'Coastal', 'High Efficiency'],
  },

  {
    _type: 'product',
    name: 'SMA Sunny Tripower CORE1 100kW',
    slug: { current: 'sma-core1-100k' },
    brand: 'SMA',
    category: 'inverter',
    power: 100000,
    price: 180_000_000,
    priceUnit: 'VND',
    shortDescription: 'Inverter 100kW hàng Đức, đỉnh cao công nghệ, bảo hành 10 năm',
    description: `**SMA Sunny Tripower CORE1** - Inverter premium Đức

**Thông số:**
- Công suất: 100kW
- Hiệu suất: 98.8%
- MPPT: 8 chuỗi
- Bảo hành: 10 năm

**Đặc biệt:**
✅ Made in Germany: Chất lượng Đức
✅ Shadowfix: Tối ưu bóng râm
✅ Grid management: Hỗ trợ ổn định lưới điện
✅ Q at Night: Reactive power ban đêm

**Ứng dụng:** Hệ thống 100kW cao cấp (PRICE.md: 2.3B VND)`,
    specifications: {
      power_ac: 100000,
      efficiency: 98.8,
      mppt: 8,
      phases: 3,
      warranty: 10,
      origin: 'Germany',
    },
    images: ['/products/sma-core1-100k.jpg'],
    inStock: true,
    featured: true,
    tags: ['100kW', 'Premium', 'Made in Germany'],
  },

  // ============================================
  // 4. BATTERIES (Pin lưu trữ)
  // ============================================
  {
    _type: 'product',
    name: 'Pylontech US5000C 4.8kWh LiFePO4',
    slug: { current: 'pylontech-us5000c' },
    brand: 'Pylontech',
    category: 'battery',
    power: 4800, // Wh
    price: 28_500_000,
    priceUnit: 'VND',
    shortDescription: 'Pin LiFePO4 4.8kWh an toàn, tuổi thọ 6000 chu kỳ, 10 năm bảo hành',
    description: `**Pylontech US5000C** - Pin lithium phổ biến nhất thế giới

**Thông số:**
- Dung lượng: 4.8kWh (48V 100Ah)
- Công nghệ: LiFePO4 (Lithium Iron Phosphate)
- Chu kỳ: 6,000 cycles @ 95% DoD
- Tuổi thọ: 10-15 năm
- Bảo hành: 10 năm
- Kích thước: 420 x 440 x 89mm
- Trọng lượng: 37kg

**Ưu điểm:**
✅ An toàn tuyệt đối: LiFePO4 không cháy nổ
✅ Modular: Mở rộng đến 16 modules (76.8kWh)
✅ Tương thích: Huawei, GoodWe, Growatt, Solis, Deye
✅ BMS thông minh: Cân bằng từng cell
✅ IP55: Lắp ngoài trời được

**Ứng dụng:**
- 16kWh cho hệ 6kW: 4x US5000C = 19.2kWh
- 32kWh cho hệ 12kW: 7x US5000C = 33.6kWh

**Giá trọn bộ (PRICE.md):**
- 6kW + 16kWh: 120M VND
- 12kW + 32kWh: 230M VND`,
    specifications: {
      capacity: 4800,
      voltage: 48,
      current: 100,
      cycles: 6000,
      dod: 95,
      warranty: 10,
      chemistry: 'LiFePO4',
      modular: true,
      max_modules: 16,
    },
    images: ['/products/pylontech-us5000c.jpg'],
    inStock: true,
    featured: true,
    tags: ['4.8kWh', 'LiFePO4', 'Modular', 'Safe'],
  },

  {
    _type: 'product',
    name: 'BYD Battery-Box Premium HVS 10.2kWh',
    slug: { current: 'byd-battery-box-hvs-10kwh' },
    brand: 'BYD',
    category: 'battery',
    power: 10240,
    price: 58_000_000,
    priceUnit: 'VND',
    shortDescription: 'Pin High Voltage 10.2kWh từ BYD, tương thích SMA/Fronius',
    description: `**BYD Battery-Box HVS** - Pin High Voltage từ hãng xe điện BYD

**Thông số:**
- Dung lượng: 10.24kWh (102.4V 100Ah)
- Công nghệ: LiFePO4
- Chu kỳ: 6,000 cycles
- Bảo hành: 10 năm
- Modular: Mở rộng đến 256kWh

**Ưu điểm:**
✅ High Voltage (102-409V): Tương thích SMA, Fronius, Kostal
✅ BYD quality: Từ nhà sản xuất xe điện lớn nhất thế giới
✅ Compact: 1 module = 10.24kWh (Pylontech cần 2-3 modules)

**Ứng dụng:** Hệ thống 100kW cần 256kWh (PRICE.md: 2.3B VND)`,
    specifications: {
      capacity: 10240,
      voltage: 102,
      cycles: 6000,
      warranty: 10,
      chemistry: 'LiFePO4',
      high_voltage: true,
    },
    images: ['/products/byd-battery-box.jpg'],
    inStock: true,
    tags: ['10kWh', 'High Voltage', 'BYD', 'Scalable'],
  },

  {
    _type: 'product',
    name: 'Huawei LUNA2000-15-S0 15kWh',
    slug: { current: 'huawei-luna2000-15kwh' },
    brand: 'Huawei',
    category: 'battery',
    power: 15000,
    price: 85_000_000,
    priceUnit: 'VND',
    shortDescription: 'Pin Huawei 15kWh tích hợp backup, tương thích hoàn hảo SUN2000',
    description: `**Huawei LUNA2000** - Pin chính hãng Huawei

**Thông số:**
- Dung lượng: 15kWh (3x 5kWh modules)
- Chu kỳ: 10,000 cycles
- Bảo hành: 10 năm

**Ưu điểm:**
✅ Tích hợp hoàn hảo với SUN2000
✅ Smart Battery Management
✅ Active Safety Protection: 4 lớp bảo vệ an toàn

**Ứng dụng:** Hệ 15kW 3-Phase (PRICE.md: 350M VND = 15kW + 45kWh)`,
    specifications: {
      capacity: 15000,
      cycles: 10000,
      warranty: 10,
      modules: 3,
    },
    images: ['/products/huawei-luna2000.jpg'],
    inStock: true,
    featured: true,
    tags: ['15kWh', 'Huawei', 'High Cycles'],
  },

  // ============================================
  // 5. COMPLETE SYSTEMS (Gói trọn gói)
  // ============================================
  {
    _type: 'product',
    name: 'Gói 6kW Hộ Gia Đình Standard',
    slug: { current: 'package-6kw-residential' },
    brand: 'Golden Energy',
    category: 'complete-system',
    power: 6000,
    price: 129_600_000, // 120M + VAT 8%
    priceUnit: 'VND',
    shortDescription: 'Hệ thống 6kW trọn gói: 9 tấm JA Solar 620W + Huawei 6kW + Pin 16kWh',
    description: `**GÓI 6KW HỘ GIA ĐÌNH STANDARD** (PRICE.MD GÓI 1)

**Bao gồm:**
- ✅ 9 tấm JA Solar JAM72S30 620Wp = 5.58kWp
- ✅ 1 bộ Huawei SUN2000-6KTL Hybrid Inverter
- ✅ 4x Pylontech US5000C = 19.2kWh (dùng 16kWh)
- ✅ Tủ điện Hybrid có ATS (Auto Transfer Switch)
- ✅ Máng cáp mạ kẽm + vật tư phụ
- ✅ Lắp đặt, vận hành, nghiệm thu

**Giá:** 120,000,000 VND (chưa VAT) = **129,600,000 VND (có VAT 8%)**

**Thông số hệ thống:**
- Công suất DC: 5.58kW
- Công suất AC: 6kW
- Dung lượng pin: 16kWh (8 giờ sử dụng)
- Sản lượng: ~750 kWh/tháng
- Tiết kiệm: ~2-2.5 triệu/tháng

**Phù hợp:**
✅ Hộ gia đình 3-5 người
✅ Tiêu thụ 200-300 kWh/tháng
✅ Diện tích mái: 50-60m²
✅ Muốn độc lập lưới điện 8h/ngày

**Bảo hành:**
- Tấm pin: 25 năm (>80% công suất)
- Inverter: 10 năm
- Pin: 10 năm (6000 cycles)

**Khuyến mãi Q1/2026:**
🎁 Giảm 5% = tiết kiệm 6.5 triệu
🎁 Tặng giám sát thông minh 8 triệu
🎁 Bảo trì 2 năm miễn phí`,
    specifications: {
      power_dc: 5580,
      power_ac: 6000,
      battery: 16000,
      panels: 9,
      panel_model: 'JA Solar 620W',
      inverter_model: 'Huawei SUN2000-6KTL',
      battery_model: 'Pylontech US5000C x4',
      monthly_production: 750,
      payback: 5.5,
    },
    images: ['/packages/6kw-residential.jpg'],
    inStock: true,
    featured: true,
    tags: ['6kW', 'Residential', 'Complete', 'Battery Included', 'Turnkey'],
  },

  {
    _type: 'product',
    name: 'Gói 30kW Thương Mại 3-Phase',
    slug: { current: 'package-30kw-commercial' },
    brand: 'Golden Energy',
    category: 'complete-system',
    power: 30000,
    price: 702_000_000, // 650M + VAT
    priceUnit: 'VND',
    shortDescription: 'Hệ 30kW: 44 tấm Longi 700W + Huawei 30kW + Pin 90kWh, hỗ trợ unbalance',
    description: `**GÓI 30KW THƯƠNG MẠI 3-PHASE** (PRICE.MD GÓI 2)

**Bao gồm:**
- ✅ 44 tấm Longi Hi-MO 6 700Wp = 30.8kWp
- ✅ 2 bộ Huawei SUN2000-30KTL Hybrid 3-Phase (support unbalance)
- ✅ 18x Pylontech US5000C = 86.4kWh (dùng 90kWh)
- ✅ Tủ điện Hybrid có ATS
- ✅ Máng cáp + vật tư phụ
- ✅ EPC (Engineering, Procurement, Construction)

**Giá:** 650,000,000 VND (chưa VAT) = **702,000,000 VND (có VAT 8%)**

**Thông số:**
- Công suất: 30kW 3-Phase
- Pin: 90kWh (3 ngày dự phòng)
- Sản lượng: ~3,700 kWh/tháng
- Tiết kiệm: ~22-30 triệu/tháng

**Phù hợp:**
✅ Khách sạn, văn phòng, showroom
✅ Tiêu thụ 3,000-5,000 kWh/tháng
✅ Diện tích mái: 250-300m²
✅ Cần backup khi mất điện

**Hoàn vốn:** 4-5 năm`,
    specifications: {
      power_dc: 30800,
      power_ac: 30000,
      battery: 90000,
      panels: 44,
      monthly_production: 3700,
      payback: 4.5,
    },
    images: ['/packages/30kw-commercial.jpg'],
    inStock: true,
    featured: true,
    tags: ['30kW', 'Commercial', '3-Phase', 'Unbalance', 'Turnkey'],
  },

  // ============================================
  // 6. ON-GRID INVERTERS (Không pin)
  // ============================================
  {
    _type: 'product',
    name: 'Huawei SUN2000-100KTL-M1 On-Grid',
    slug: { current: 'huawei-sun2000-100ktl-ongrid' },
    brand: 'Huawei',
    category: 'inverter',
    power: 100000,
    price: 160_000_000,
    priceUnit: 'VND',
    shortDescription: 'Inverter On-Grid 100kW không pin, bán điện cho EVN, hiệu suất 98.8%',
    description: `**Huawei SUN2000-100KTL-M1** - On-Grid Industrial

**Thông số:**
- Công suất: 100kW
- Hiệu suất: 98.8%
- MPPT: 10 chuỗi
- Bảo hành: 5 năm (mở rộng 20 năm)

**Ứng dụng:** 
- Hệ On-Grid >100kW (PRICE.md: 30,000 VND/kW)
- Không pin lưu trữ
- Bán điện cho EVN
- ROI: 6-7 năm

**Ví dụ dự án:**
- 200kW = 6.48 tỷ VND (có VAT)
- Tiết kiệm: ~40 triệu/tháng`,
    specifications: {
      power_ac: 100000,
      efficiency: 98.8,
      mppt: 10,
      warranty: 5,
      ongrid: true,
    },
    images: ['/products/huawei-100ktl-ongrid.jpg'],
    inStock: true,
    tags: ['100kW', 'On-Grid', 'No Battery', 'ROI 6-7yr'],
  },
];

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import vào Sanity Studio:
 *    - Copy solarProducts array
 *    - Paste vào Sanity Vision hoặc seed script
 * 
 * 2. Update images:
 *    - Upload product images vào /public/products/
 *    - Update đường dẫn trong images array
 * 
 * 3. Sync with PRICE.md:
 *    - Giá theo PRICE.md (chưa VAT)
 *    - Packages match exact specifications
 *    - Brands: Huawei, GoodWe, Solis, Longi, JA Solar, Pylontech, BYD
 * 
 * 4. SEO Keywords:
 *    - Tất cả tags đã được optimize
 *    - Brand names in slug for SEO
 *    - Power ratings in name for search
 */
