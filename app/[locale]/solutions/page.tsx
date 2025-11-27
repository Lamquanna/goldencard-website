import { Metadata } from 'next';
import Link from 'next/link';
import { type Locale } from '@/lib/i18n';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'id' ? 'en' : rawLocale) as 'vi' | 'en' | 'zh';
  
  const titles = {
    vi: 'Giải Pháp Năng Lượng - GoldenEnergy',
    en: 'Energy Solutions - GoldenEnergy',
    zh: '能源解决方案 - GoldenEnergy'
  };

  return {
    title: titles[locale],
  };
}

const TRANSLATIONS = {
  vi: {
    title: 'Giải Pháp Năng Lượng Tái Tạo',
    subtitle: 'Chọn giải pháp phù hợp với nhu cầu của bạn',
    solar: {
      title: 'Năng Lượng Mặt Trời',
      desc: 'Hệ thống điện mặt trời áp mái, mặt đất cho gia đình và doanh nghiệp',
      link: 'Tìm hiểu thêm'
    },
    wind: {
      title: 'Năng Lượng Gió',
      desc: 'Turbine gió công suất lớn cho khu công nghiệp và nông trại',
      link: 'Tìm hiểu thêm'
    },
    iot: {
      title: 'IoT & Giám Sát',
      desc: 'Nền tảng giám sát thông minh, tối ưu vận hành 24/7',
      link: 'Tìm hiểu thêm'
    },
    hybrid: {
      title: 'Hệ Thống Hybrid',
      desc: 'Kết hợp mặt trời, gió, lưu trữ năng lượng và lưới điện',
      link: 'Tìm hiểu thêm'
    },
    cta: 'Liên hệ tư vấn miễn phí'
  },
  en: {
    title: 'Renewable Energy Solutions',
    subtitle: 'Choose the right solution for your needs',
    solar: {
      title: 'Solar Energy',
      desc: 'Rooftop and ground-mounted solar systems for homes and businesses',
      link: 'Learn more'
    },
    wind: {
      title: 'Wind Energy',
      desc: 'High-capacity wind turbines for industrial and farm applications',
      link: 'Learn more'
    },
    iot: {
      title: 'IoT & Monitoring',
      desc: 'Smart monitoring platform, 24/7 operations optimization',
      link: 'Learn more'
    },
    hybrid: {
      title: 'Hybrid Systems',
      desc: 'Combined solar, wind, energy storage and grid integration',
      link: 'Learn more'
    },
    cta: 'Contact for free consultation'
  },
  zh: {
    title: '可再生能源解决方案',
    subtitle: '选择适合您需求的解决方案',
    solar: {
      title: '太阳能',
      desc: '屋顶和地面安装太阳能系统，适用于家庭和企业',
      link: '了解更多'
    },
    wind: {
      title: '风能',
      desc: '适用于工业和农场的大功率风力涡轮机',
      link: '了解更多'
    },
    iot: {
      title: '物联网与监控',
      desc: '智能监控平台，全天候运营优化',
      link: '了解更多'
    },
    hybrid: {
      title: '混合系统',
      desc: '太阳能、风能、储能和电网整合',
      link: '了解更多'
    },
    cta: '联系免费咨询'
  }
};

const solutions = [
  { key: 'solar', href: '/solutions/solar' },
  { key: 'wind', href: '/solutions/wind' },
  { key: 'iot', href: '/solutions/iot' },
  { key: 'hybrid', href: '/solutions/hybrid' },
];

export default async function SolutionsPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = (rawLocale === 'id' ? 'en' : rawLocale) as 'vi' | 'en' | 'zh';
  const t = TRANSLATIONS[locale];

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light tracking-wide mb-6">
            {t.title}
          </h1>
          <p className="text-xl text-gray-400 font-light">
            {t.subtitle}
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {solutions.map((solution) => {
            const content = t[solution.key as keyof typeof t] as { title: string; desc: string; link: string };
            return (
              <Link
                key={solution.key}
                href={`/${locale}${solution.href}`}
                className="group bg-[#0A0A0A]/5 border border-gray-10 p-10 hover:bg-[#0A0A0A]/10 hover:border-gray-30 transition-all duration-300"
              >
                <h2 className="text-3xl font-light mb-4 group-hover:text-gray-900 transition-colors">
                  {content.title}
                </h2>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  {content.desc}
                </p>
                <span className="text-gray-900 border-b border-gray-20 group-hover:border-white transition-colors pb-1">
                  {content.link} →
                </span>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-block bg-[#D4AF37] text-white px-10 py-4 text-lg font-semibold tracking-wide hover:bg-[#C19B2E] transition-colors"
          >
            {t.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
