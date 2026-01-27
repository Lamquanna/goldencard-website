import { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { PricingClient } from './PricingClient';

const PRICING_QUERY = `*[_type == "pricingPackage" && isActive == true] | order(category asc, order asc, capacity asc) {
  _id,
  name,
  slug,
  category,
  capacity,
  priceBeforeVAT,
  priceAfterVAT,
  components[] {
    name,
    quantity,
    icon
  },
  suitableFor,
  monthlyConsumption,
  featured,
  warranty,
  installationTime,
  order
}`;

export const revalidate = 60; // ISR - revalidate every 60 seconds

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;

  const titles: Record<string, string> = {
    vi: 'Bảng Giá Hệ Thống Điện Mặt Trời 2026 | Golden Energy',
    en: 'Solar System Pricing 2026 | Golden Energy',
    zh: '太阳能系统价格表 2026 | Golden Energy',
  };

  const descriptions: Record<string, string> = {
    vi: 'Bảng giá chi tiết hệ thống điện mặt trời hộ gia đình, thương mại, công nghiệp. Bao gồm tấm pin, inverter, pin lưu trữ. Bảo hành 25 năm. Miễn phí khảo sát.',
    en: 'Detailed solar system pricing for residential, commercial, and industrial. Includes panels, inverters, battery storage. 25-year warranty. Free survey.',
    zh: '详细的住宅、商业和工业太阳能系统价格。包括太阳能板、逆变器、储能电池。25年保修。免费勘察。',
  };

  return {
    title: titles[locale] || titles.vi,
    description: descriptions[locale] || descriptions.vi,
    openGraph: {
      title: titles[locale] || titles.vi,
      description: descriptions[locale] || descriptions.vi,
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : 'en_US',
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;

  // Fetch pricing packages from Sanity
  const packages = await client.fetch(PRICING_QUERY);

  return <PricingClient packages={packages} locale={locale} />;
}
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
