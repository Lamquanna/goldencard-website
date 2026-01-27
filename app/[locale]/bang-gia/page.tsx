import { Metadata } from 'next'
import { Container } from '@/components/Container'
import { Check, Phone, Mail, Clock, CreditCard, Gift } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bảng Giá Hệ Thống Điện Mặt Trời 2026 | Golden Energy',
  description: 'Bảng giá lắp đặt điện mặt trời hộ gia đình, thương mại, công nghiệp. Hỗ trợ vay ngân hàng 7-9%/năm. Miễn phí khảo sát & tư vấn.',
}

export default function PricingPage() {
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-orange-50 py-16">
      <Container>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            ⚡ CẬP NHẬT Q1/2026
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bảng Giá Điện Mặt Trời
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Minh bạch - Cạnh tranh - Trọn gói. Hỗ trợ vay ngân hàng 7-9%/năm
          </p>
        </div>

        {/* Pricing Grid - Residential */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🏠 Hệ Thống Hộ Gia Đình
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Budget Tier */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-orange-400 transition-all">
              <div className="text-center mb-6">
                <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
                  💰 Tiết Kiệm
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gói Budget</h3>
                <p className="text-gray-600">Tối ưu chi phí đầu tư</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b bg-orange-50">
                  <span className="text-gray-600">6kW + Pin 16kWh</span>
                  <span className="font-bold text-orange-600">129.6 tr</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">12kW + Pin 32kWh</span>
                  <span className="font-bold text-gray-900">248.4 tr</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">18kW + Pin 48kWh</span>
                  <span className="font-bold text-gray-900">356.4 tr</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Risen, JA Solar (18-19%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Inverter: LuxPower, Growatt</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Bảo hành: 10 năm</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Lắp đặt trọn gói</span>
                </div>
              </div>

              <a
                href="tel:0333314288"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Tư vấn ngay
              </a>
            </div>

            {/* Standard Tier */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-orange-500 relative transform scale-105 hover:scale-110 transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                🌟 PHỔ BIẾN NHẤT
              </div>
              
              <div className="text-center mb-6 mt-4">
                <div className="inline-block bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-sm font-semibold mb-3">
                  ⭐ Phổ Thông
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gói Standard</h3>
                <p className="text-gray-600">Cân bằng giá - chất lượng</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b bg-orange-50">
                  <span className="text-gray-600">15kW + Pin 45kWh</span>
                  <span className="font-bold text-orange-600">378 tr</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">30kW + Pin 90kWh</span>
                  <span className="font-bold text-gray-900">702 tr</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">50kW + Pin 125kWh</span>
                  <span className="font-bold text-gray-900">1,296 tr</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Longi, Canadian (20-21%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Inverter: Huawei, GoodWe</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Bảo hành: 25 năm</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Giám sát từ xa</span>
                </div>
              </div>

              <a
                href="tel:0333314288"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Đặt ngay
              </a>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-8 border-2 border-amber-300 hover:border-amber-500 transition-all">
              <div className="text-center mb-6">
                <div className="inline-block bg-amber-100 text-amber-800 px-4 py-1 rounded-full text-sm font-semibold mb-3">
                  👑 VIP
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Gói Premium</h3>
                <p className="text-gray-600">Cao cấp nhất</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b bg-orange-50">
                  <span className="text-gray-600">100kW + Pin 256kWh</span>
                  <span className="font-bold text-orange-600">2,484 tr</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">On-Grid &gt;100kW</span>
                  <span className="font-bold text-gray-900">30k/kW</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">BESS &gt;100kW</span>
                  <span className="font-bold text-gray-900">40k/kW</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Panasonic, SunPower (22-23%)</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">SolarEdge, Enphase</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Pin lưu trữ: Tesla Powerwall</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Bảo trì VIP + AI</span>
                </div>
              </div>

              <a
                href="tel:0333314288"
                className="block w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-center py-3 rounded-lg font-semibold transition-colors"
              >
                Liên hệ VIP
              </a>
            </div>
          </div>
        </section>

        {/* Commercial & Industrial */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🏢 Thương Mại & Công Nghiệp
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Commercial */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Thương Mại (20-100kW)</h3>
              <p className="text-gray-600 mb-6">Văn phòng, cửa hàng, khách sạn, nhà hàng</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span>15kW + Pin</span>
                  <span className="font-bold">378 triệu</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>30kW + Pin</span>
                  <span className="font-bold">702 triệu</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>50kW + Pin</span>
                  <span className="font-bold">1,296 triệu</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="font-bold text-green-700">Tiết kiệm 60-75%</span>
                </div>
                <div className="text-sm text-gray-600">
                  Hoàn vốn: 4-6 năm
                </div>
              </div>
            </div>

            {/* Industrial */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Công Nghiệp (100kW+)</h3>
              <p className="text-gray-600 mb-6">Nhà máy, xưởng sản xuất, khu công nghiệp</p>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2 border-b">
                  <span>100kW + Pin 256kWh</span>
                  <span className="font-bold">2,484 triệu</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>On-Grid &gt;100kW</span>
                  <span className="font-bold">30,000 VNĐ/kW</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>BESS &gt;100kW</span>
                  <span className="font-bold">40,000 VNĐ/kW</span>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">♻️</span>
                  <span className="font-bold text-green-700">Tiết kiệm 70-80%</span>
                </div>
                <div className="text-sm text-gray-600">
                  Hoàn vốn: 5-7 năm | Giảm CO2: ~500kg/kW/năm
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Support */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            💳 Hỗ Trợ Tài Chính
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-900">Vay Ngân Hàng</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Lãi suất</span>
                  <span className="font-bold text-blue-600">7-9%/năm</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Thời hạn</span>
                  <span className="font-bold">3-5 năm</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Hỗ trợ hồ sơ</span>
                  <span className="font-bold text-green-600">Miễn phí</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-900">Trả Góp 0%</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Thời hạn</span>
                  <span className="font-bold text-purple-600">6-12 tháng</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Điều kiện</span>
                  <span className="font-bold">Từ 30 triệu VNĐ</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-700">Phí xử lý</span>
                  <span className="font-bold text-purple-600">1-2%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Free Services */}
        <section className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-12 text-white mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">🎁 Dịch Vụ Miễn Phí</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🏠</div>
              <div className="font-bold mb-1">Khảo sát hiện trường</div>
              <div className="text-sm text-orange-100">24/7</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📐</div>
              <div className="font-bold mb-1">Thiết kế 3D</div>
              <div className="text-sm text-orange-100">Chi tiết từng góc độ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <div className="font-bold mb-1">Tính toán ROI</div>
              <div className="text-sm text-orange-100">Hoàn vốn & lợi nhuận</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-bold mb-1">Báo giá chi tiết</div>
              <div className="text-sm text-orange-100">Minh bạch 100%</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">⚡</div>
              <div className="font-bold mb-1">Thủ tục EVN</div>
              <div className="text-sm text-orange-100">Đăng ký hòa lưới</div>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔧</div>
              <div className="font-bold mb-1">Bảo trì năm đầu</div>
              <div className="text-sm text-orange-100">Không mất phí</div>
            </div>
          </div>
        </section>

        {/* Promotions */}
        <section className="mb-16">
          <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Gift className="w-10 h-10 text-yellow-600" />
              <h2 className="text-3xl font-bold text-gray-900">Khuyến Mãi Q1/2026</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <div className="font-bold text-lg mb-1">Giảm 5% ngay</div>
                  <div className="text-gray-600">Cho hợp đồng ký trong tháng</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <div className="font-bold text-lg mb-1">Tặng giám sát thông minh</div>
                  <div className="text-gray-600">Trị giá 8 triệu VNĐ</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔧</span>
                <div>
                  <div className="font-bold text-lg mb-1">Miễn phí bảo trì</div>
                  <div className="text-gray-600">2 năm đầu tiên</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <div className="font-bold text-lg mb-1">Combo 5kW + Pin</div>
                  <div className="text-gray-600">Giảm thêm 15%</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">📞 Liên Hệ Tư Vấn Ngay</h2>
          <p className="text-xl text-gray-300 mb-8">Miễn phí khảo sát & báo giá chi tiết</p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a
              href="tel:0333314288"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-full font-bold text-lg transition-colors"
            >
              <Phone className="w-6 h-6" />
              03333 142 88
            </a>
            <a
              href="tel:0903117277"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 px-8 py-4 rounded-full font-bold text-lg transition-colors"
            >
              <Phone className="w-6 h-6" />
              0903 117 277
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              8h00 - 18h00 (T2-T7)
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              info@goldenenergy.vn
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="mt-12 text-center text-sm text-gray-500">
          <div className="space-y-1">
            <p>✓ Giá đã bao gồm VAT 8%</p>
            <p>✓ Thời gian lắp đặt: 3-5 ngày (hộ gia đình), 1-2 tuần (thương mại/công nghiệp)</p>
            <p>✓ Bảo hành tấm pin: 25 năm (công suất &gt; 80%)</p>
            <p className="text-xs text-gray-400 mt-4">Cập nhật: 27/01/2026</p>
          </div>
        </section>
      </Container>
    </div>
  )
}
