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
