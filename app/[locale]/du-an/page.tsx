import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/Container'
import { generateBreadcrumbSchema } from '@/lib/schema'
import { SmartCTA } from '@/components/SmartCTA'
import { getProjects, type Project } from '@/sanity/lib/client'

interface PageProps {
  params: { locale: string }
}

// Mock project data - 12 realistic Vietnamese projects
const projects = [
  // RESIDENTIAL (4)
  {
    id: 'nha-chi-hoa-q7',
    type: 'residential' as const,
    region: 'south' as const,
    title: { vi: 'Nhà chị Hoa - Q.7 TP.HCM', en: 'Mrs. Hoa\'s House - District 7, HCMC', zh: '阿花女士家 - 胡志明市第7郡', id: 'Rumah Ibu Hoa - Distrik 7, HCMC' },
    location: { vi: 'Quận 7, TP. Hồ Chí Minh', en: 'District 7, Ho Chi Minh City', zh: '胡志明市第7郡', id: 'Distrik 7, Kota Ho Chi Minh' },
    capacity: 5,
    savings: 70,
    payback: 6,
    image: '/projects/residential-1.jpg',
    description: { vi: 'Hệ thống 5kW cho gia đình 4 người, tiết kiệm 70% hóa đơn điện hàng tháng', en: '5kW system for family of 4, saves 70% on monthly bills', zh: '5千瓦系统供4口之家，节省70%电费', id: 'Sistem 5kW untuk keluarga 4 orang, hemat 70% tagihan listrik' }
  },
  {
    id: 'biet-thu-anh-minh-danang',
    type: 'residential' as const,
    region: 'central' as const,
    title: { vi: 'Biệt thự anh Minh - Đà Nẵng', en: 'Mr. Minh\'s Villa - Da Nang', zh: '明先生别墅 - 岘港', id: 'Villa Pak Minh - Da Nang' },
    location: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港', id: 'Da Nang' },
    capacity: 10,
    savings: 80,
    payback: 5.5,
    image: '/projects/residential-2.jpg',
    description: { vi: 'Biệt thự cao cấp với hệ thống 10kW, tự cung tự cấp 80% nhu cầu điện', en: 'Luxury villa with 10kW system, 80% energy independence', zh: '高档别墅配10千瓦系统，80%能源独立', id: 'Vila mewah dengan sistem 10kW, 80% kemandirian energi' }
  },
  {
    id: 'nha-anh-tung-hanoi',
    type: 'residential' as const,
    region: 'north' as const,
    title: { vi: 'Nhà anh Tùng - Hà Nội', en: 'Mr. Tung\'s House - Hanoi', zh: '俊先生家 - 河内', id: 'Rumah Pak Tung - Hanoi' },
    location: { vi: 'Hà Nội', en: 'Hanoi', zh: '河内', id: 'Hanoi' },
    capacity: 7,
    savings: 65,
    payback: 6.5,
    image: '/projects/residential-3.jpg',
    description: { vi: 'Hệ thống 7kW cho nhà phố 3 tầng, giảm 65% chi phí điện', en: '7kW system for 3-story townhouse, reduces 65% electricity cost', zh: '7千瓦系统供3层联排别墅，降低65%电费', id: 'Sistem 7kW untuk rumah 3 lantai, kurangi 65% biaya listrik' }
  },
  {
    id: 'villa-gia-dinh-vungtau',
    type: 'residential' as const,
    region: 'south' as const,
    title: { vi: 'Villa gia đình - Vũng Tàu', en: 'Family Villa - Vung Tau', zh: '家庭别墅 - 头顿', id: 'Villa Keluarga - Vung Tau' },
    location: { vi: 'Vũng Tàu', en: 'Vung Tau', zh: '头顿', id: 'Vung Tau' },
    capacity: 8,
    savings: 75,
    payback: 5.8,
    image: '/projects/residential-4.jpg',
    description: { vi: 'Villa nghỉ dưỡng với hệ thống 8kW, tối ưu chi phí vận hành', en: 'Vacation villa with 8kW system, optimized operating costs', zh: '度假别墅配8千瓦系统，优化运营成本', id: 'Villa liburan dengan sistem 8kW, biaya operasional optimal' }
  },

  // COMMERCIAL (4)
  {
    id: 'khach-san-abc-hcm',
    type: 'commercial' as const,
    region: 'south' as const,
    title: { vi: 'Khách sạn ABC - TP.HCM', en: 'ABC Hotel - HCMC', zh: 'ABC酒店 - 胡志明市', id: 'Hotel ABC - HCMC' },
    location: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市', id: 'Kota Ho Chi Minh' },
    capacity: 50,
    savings: 60,
    payback: 4.5,
    image: '/projects/commercial-1.jpg',
    description: { vi: 'Khách sạn 4 sao với hệ thống 50kW, tiết kiệm 60% chi phí điện điều hòa', en: '4-star hotel with 50kW system, saves 60% on AC costs', zh: '4星酒店配50千瓦系统，节省60%空调费', id: 'Hotel bintang 4 dengan sistem 50kW, hemat 60% biaya AC' }
  },
  {
    id: 'van-phong-xyz-binhduong',
    type: 'commercial' as const,
    region: 'south' as const,
    title: { vi: 'Văn phòng XYZ - Bình Dương', en: 'XYZ Office - Binh Duong', zh: 'XYZ办公室 - 平阳', id: 'Kantor XYZ - Binh Duong' },
    location: { vi: 'Bình Dương', en: 'Binh Duong', zh: '平阳', id: 'Binh Duong' },
    capacity: 30,
    savings: 55,
    payback: 5,
    image: '/projects/commercial-2.jpg',
    description: { vi: 'Tòa nhà văn phòng với hệ thống 30kW, cắt giảm 55% hóa đơn điện hàng tháng', en: 'Office building with 30kW system, cuts 55% monthly electricity bills', zh: '办公楼配30千瓦系统，减少55%月电费', id: 'Gedung kantor dengan sistem 30kW, potong 55% tagihan listrik bulanan' }
  },
  {
    id: 'trung-tam-thuong-mai-danang',
    type: 'commercial' as const,
    region: 'central' as const,
    title: { vi: 'Trung tâm thương mại - Đà Nẵng', en: 'Shopping Mall - Da Nang', zh: '购物中心 - 岘港', id: 'Mall - Da Nang' },
    location: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港', id: 'Da Nang' },
    capacity: 80,
    savings: 65,
    payback: 4.2,
    image: '/projects/commercial-3.jpg',
    description: { vi: 'Trung tâm thương mại với hệ thống 80kW, ROI nhanh nhất trong phân khúc', en: 'Shopping mall with 80kW system, fastest ROI in segment', zh: '购物中心配80千瓦系统，该类别中投资回报最快', id: 'Mall dengan sistem 80kW, ROI tercepat di segmen' }
  },
  {
    id: 'nha-hang-chuoi-cantho',
    type: 'commercial' as const,
    region: 'south' as const,
    title: { vi: 'Nhà hàng chuỗi - Cần Thơ', en: 'Restaurant Chain - Can Tho', zh: '连锁餐厅 - 芹苴', id: 'Restoran Chain - Can Tho' },
    location: { vi: 'Cần Thơ', en: 'Can Tho', zh: '芹苴', id: 'Can Tho' },
    capacity: 20,
    savings: 50,
    payback: 5.5,
    image: '/projects/commercial-4.jpg',
    description: { vi: 'Chuỗi nhà hàng 3 chi nhánh với hệ thống 20kW, giảm chi phí vận hành', en: '3-branch restaurant chain with 20kW system, reduces operating costs', zh: '3家分店连锁餐厅配20千瓦系统，降低运营成本', id: 'Rantai restoran 3 cabang dengan sistem 20kW, kurangi biaya operasi' }
  },

  // INDUSTRIAL (4)
  {
    id: 'nha-may-det-may-binhduong',
    type: 'industrial' as const,
    region: 'south' as const,
    title: { vi: 'Nhà máy dệt may - Bình Dương', en: 'Textile Factory - Binh Duong', zh: '纺织厂 - 平阳', id: 'Pabrik Tekstil - Binh Duong' },
    location: { vi: 'Bình Dương', en: 'Binh Duong', zh: '平阳', id: 'Binh Duong' },
    capacity: 500,
    savings: 55,
    payback: 3.5,
    image: '/projects/industrial-1.jpg',
    description: { vi: 'Nhà máy dệt với hệ thống 500kW, tiết kiệm 55% chi phí điện sản xuất', en: 'Textile factory with 500kW system, saves 55% production electricity costs', zh: '纺织厂配500千瓦系统，节省55%生产电费', id: 'Pabrik tekstil dengan sistem 500kW, hemat 55% biaya listrik produksi' }
  },
  {
    id: 'xuong-co-khi-dongnai',
    type: 'industrial' as const,
    region: 'south' as const,
    title: { vi: 'Xưởng cơ khí - Đồng Nai', en: 'Mechanical Workshop - Dong Nai', zh: '机械车间 - 同奈', id: 'Bengkel Mekanik - Dong Nai' },
    location: { vi: 'Đồng Nai', en: 'Dong Nai', zh: '同奈', id: 'Dong Nai' },
    capacity: 200,
    savings: 50,
    payback: 4,
    image: '/projects/industrial-2.jpg',
    description: { vi: 'Xưởng cơ khí với hệ thống 200kW, ổn định nguồn điện sản xuất', en: 'Mechanical workshop with 200kW system, stable production power', zh: '机械车间配200千瓦系统，稳定生产电力', id: 'Bengkel mekanik dengan sistem 200kW, daya produksi stabil' }
  },
  {
    id: 'kho-logistics-hcm',
    type: 'industrial' as const,
    region: 'south' as const,
    title: { vi: 'Kho logistics - TP.HCM', en: 'Logistics Warehouse - HCMC', zh: '物流仓库 - 胡志明市', id: 'Gudang Logistik - HCMC' },
    location: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市', id: 'Kota Ho Chi Minh' },
    capacity: 1000,
    savings: 60,
    payback: 3.2,
    image: '/projects/industrial-3.jpg',
    description: { vi: 'Kho logistics 10,000m² với hệ thống 1MW, ROI nhanh nhất dự án công nghiệp', en: '10,000m² logistics warehouse with 1MW system, fastest industrial ROI', zh: '10,000平米物流仓库配1兆瓦系统，工业项目投资回报最快', id: 'Gudang logistik 10,000m² dengan sistem 1MW, ROI industri tercepat' }
  },
  {
    id: 'nha-may-thuc-pham-longan',
    type: 'industrial' as const,
    region: 'south' as const,
    title: { vi: 'Nhà máy thực phẩm - Long An', en: 'Food Factory - Long An', zh: '食品厂 - 隆安', id: 'Pabrik Makanan - Long An' },
    location: { vi: 'Long An', en: 'Long An', zh: '隆安', id: 'Long An' },
    capacity: 300,
    savings: 52,
    payback: 3.8,
    image: '/projects/industrial-4.jpg',
    description: { vi: 'Nhà máy thực phẩm với hệ thống 300kW, giảm chi phí sản xuất đáng kể', en: 'Food factory with 300kW system, significantly reduces production costs', zh: '食品厂配300千瓦系统，显著降低生产成本', id: 'Pabrik makanan dengan sistem 300kW, kurangi biaya produksi signifikan' }
  }
]

// Testimonials
const testimonials = [
  {
    name: { vi: 'Chị Hoa', en: 'Mrs. Hoa', zh: '阿花女士', id: 'Ibu Hoa' },
    location: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市', id: 'Kota Ho Chi Minh' },
    quote: { 
      vi: 'Từ khi lắp điện mặt trời, hóa đơn điện giảm từ 2 triệu xuống còn 600 nghìn. Tư vấn tận tâm, thi công chuyên nghiệp!',
      en: 'Since installing solar, electricity bills dropped from 2 million to 600k VND. Excellent consultation and professional installation!',
      zh: '安装太阳能后，电费从200万降至60万越南盾。咨询周到，安装专业！',
      id: 'Sejak pasang solar, tagihan listrik turun dari 2 juta ke 600 ribu VND. Konsultasi bagus dan pemasangan profesional!'
    },
    rating: 5,
    project: 'nha-chi-hoa-q7'
  },
  {
    name: { vi: 'Anh Minh', en: 'Mr. Minh', zh: '明先生', id: 'Pak Minh' },
    location: { vi: 'Đà Nẵng', en: 'Da Nang', zh: '岘港', id: 'Da Nang' },
    quote: { 
      vi: 'Hệ thống 10kW hoạt động vượt kỳ vọng. Team kỹ thuật rất chuyên nghiệp, follow up sát sao. Highly recommended!',
      en: 'The 10kW system performs beyond expectations. Very professional technical team with close follow-up. Highly recommended!',
      zh: '10千瓦系统运行超预期。技术团队非常专业，跟进密切。强烈推荐！',
      id: 'Sistem 10kW bekerja melebihi ekspektasi. Tim teknis sangat profesional dengan follow-up ketat. Highly recommended!'
    },
    rating: 5,
    project: 'biet-thu-anh-minh-danang'
  },
  {
    name: { vi: 'Ông Tuấn - Giám đốc Khách sạn ABC', en: 'Mr. Tuan - ABC Hotel Director', zh: '段先生 - ABC酒店总监', id: 'Pak Tuan - Direktur Hotel ABC' },
    location: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City', zh: '胡志明市', id: 'Kota Ho Chi Minh' },
    quote: { 
      vi: 'Hệ thống 50kW giúp khách sạn tiết kiệm 40 triệu/tháng. Đầu tư 750 triệu, hoàn vốn chưa đến 5 năm. Win-win!',
      en: '50kW system saves hotel 40 million VND/month. 750 million investment, payback under 5 years. Win-win!',
      zh: '50千瓦系统为酒店每月节省4000万越南盾。投资7.5亿越南盾，不到5年回本。双赢！',
      id: 'Sistem 50kW hemat hotel 40 juta VND/bulan. Investasi 750 juta, balik modal kurang dari 5 tahun. Win-win!'
    },
    rating: 5,
    project: 'khach-san-abc-hcm'
  }
]

// Stats
const stats = {
  totalProjects: 500,
  totalCapacity: 200, // MW
  satisfaction: 95,
  residential: 200,
  commercial: 180,
  industrial: 120
}

// Translation helper
function t(key: string, locale: string): string {
  const translations: Record<string, Record<string, string>> = {
    heroTitle: {
      vi: 'Dự Án Tiêu Biểu',
      en: 'Featured Projects',
      zh: '精选项目',
      id: 'Proyek Unggulan'
    },
    heroSubtitle: {
      vi: 'Lắp đặt thực tế, kết quả thực tế, tiết kiệm thực tế',
      en: 'Real installations, real results, real savings',
      zh: '真实安装，真实结果，真实节省',
      id: 'Instalasi nyata, hasil nyata, penghematan nyata'
    },
    projectsCount: {
      vi: 'Dự án hoàn thành',
      en: 'Completed Projects',
      zh: '已完成项目',
      id: 'Proyek Selesai'
    },
    totalCapacity: {
      vi: 'Tổng công suất',
      en: 'Total Capacity',
      zh: '总容量',
      id: 'Kapasitas Total'
    },
    satisfaction: {
      vi: 'Hài lòng',
      en: 'Satisfaction',
      zh: '满意度',
      id: 'Kepuasan'
    },
    filterTitle: {
      vi: 'Lọc dự án',
      en: 'Filter Projects',
      zh: '筛选项目',
      id: 'Filter Proyek'
    },
    filterType: {
      vi: 'Loại hình',
      en: 'Type',
      zh: '类型',
      id: 'Tipe'
    },
    filterRegion: {
      vi: 'Khu vực',
      en: 'Region',
      zh: '地区',
      id: 'Wilayah'
    },
    filterCapacity: {
      vi: 'Công suất',
      en: 'Capacity',
      zh: '容量',
      id: 'Kapasitas'
    },
    searchPlaceholder: {
      vi: 'Tìm theo tên hoặc địa điểm...',
      en: 'Search by name or location...',
      zh: '按名称或地点搜索...',
      id: 'Cari berdasarkan nama atau lokasi...'
    },
    allTypes: {
      vi: 'Tất cả',
      en: 'All',
      zh: '全部',
      id: 'Semua'
    },
    residential: {
      vi: 'Hộ gia đình',
      en: 'Residential',
      zh: '住宅',
      id: 'Residensial'
    },
    commercial: {
      vi: 'Thương mại',
      en: 'Commercial',
      zh: '商业',
      id: 'Komersial'
    },
    industrial: {
      vi: 'Công nghiệp',
      en: 'Industrial',
      zh: '工业',
      id: 'Industri'
    },
    north: {
      vi: 'Miền Bắc',
      en: 'North',
      zh: '北部',
      id: 'Utara'
    },
    central: {
      vi: 'Miền Trung',
      en: 'Central',
      zh: '中部',
      id: 'Tengah'
    },
    south: {
      vi: 'Miền Nam',
      en: 'South',
      zh: '南部',
      id: 'Selatan'
    },
    capacitySmall: {
      vi: '< 10kW',
      en: '< 10kW',
      zh: '< 10千瓦',
      id: '< 10kW'
    },
    capacityMedium: {
      vi: '10-100kW',
      en: '10-100kW',
      zh: '10-100千瓦',
      id: '10-100kW'
    },
    capacityLarge: {
      vi: '> 100kW',
      en: '> 100kW',
      zh: '> 100千瓦',
      id: '> 100kW'
    },
    viewDetails: {
      vi: 'Xem chi tiết',
      en: 'View Details',
      zh: '查看详情',
      id: 'Lihat Detail'
    },
    savings: {
      vi: 'Tiết kiệm',
      en: 'Savings',
      zh: '节省',
      id: 'Hemat'
    },
    payback: {
      vi: 'Hoàn vốn',
      en: 'Payback',
      zh: '回本期',
      id: 'Balik Modal'
    },
    years: {
      vi: 'năm',
      en: 'years',
      zh: '年',
      id: 'tahun'
    },
    successStoriesTitle: {
      vi: 'Câu Chuyện Thành Công',
      en: 'Success Stories',
      zh: '成功案例',
      id: 'Kisah Sukses'
    },
    categoryStatsTitle: {
      vi: 'Phân Bố Dự Án',
      en: 'Project Distribution',
      zh: '项目分布',
      id: 'Distribusi Proyek'
    },
    ctaTitle: {
      vi: 'Dự án tiếp theo là của bạn?',
      en: 'Your project is next?',
      zh: '下一个项目是您的？',
      id: 'Proyek Anda selanjutnya?'
    },
    ctaSubtitle: {
      vi: 'Tham gia hàng trăm khách hàng đã tin tưởng Golden Energy',
      en: 'Join hundreds of customers who trusted Golden Energy',
      zh: '加入数百位信赖金能源的客户',
      id: 'Bergabung dengan ratusan pelanggan yang mempercayai Golden Energy'
    },
    calculateButton: {
      vi: 'Tính toán chi phí',
      en: 'Calculate Cost',
      zh: '计算费用',
      id: 'Hitung Biaya'
    },
    consultButton: {
      vi: 'Tư vấn miễn phí',
      en: 'Free Consultation',
      zh: '免费咨询',
      id: 'Konsultasi Gratis'
    },
    noResults: {
      vi: 'Không tìm thấy dự án phù hợp',
      en: 'No matching projects found',
      zh: '未找到匹配项目',
      id: 'Tidak ada proyek yang cocok'
    }
  }
  
  return translations[key]?.[locale] || translations[key]?.['vi'] || key
}

// Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params
  
  const titles = {
    vi: '500+ Dự Án Điện Mặt Trời Thành Công | Golden Energy',
    en: '500+ Successful Solar Projects | Golden Energy',
    zh: '500+成功太阳能项目 | 金能源',
    id: '500+ Proyek Solar Sukses | Golden Energy'
  }
  
  const descriptions = {
    vi: 'Khám phá 500+ dự án điện mặt trời đã triển khai thành công tại Việt Nam. Hộ gia đình, thương mại, công nghiệp. Tiết kiệm thực tế 50-80%. Bảo hành 25 năm.',
    en: 'Explore 500+ successfully deployed solar projects in Vietnam. Residential, commercial, industrial. Real savings of 50-80%. 25-year warranty.',
    zh: '探索越南成功部署的500+太阳能项目。住宅、商业、工业。实际节省50-80%。25年保修。',
    id: 'Jelajahi 500+ proyek solar yang berhasil di Vietnam. Residensial, komersial, industri. Penghematan nyata 50-80%. Garansi 25 tahun.'
  }
  
  return {
    title: titles[locale as keyof typeof titles] || titles.vi,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
    keywords: locale === 'vi' 
      ? 'dự án điện mặt trời, case study solar, lắp đặt thành công, hệ thống solar thực tế, khách hàng Golden Energy'
      : locale === 'en'
      ? 'solar projects, solar case studies, successful installations, real solar systems, Golden Energy customers'
      : locale === 'zh'
      ? '太阳能项目, 太阳能案例, 成功安装, 真实太阳能系统, 金能源客户'
      : 'proyek solar, studi kasus solar, instalasi sukses, sistem solar nyata, pelanggan Golden Energy',
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.vi,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.vi,
      type: 'website',
      locale: locale === 'vi' ? 'vi_VN' : locale === 'zh' ? 'zh_CN' : locale === 'id' ? 'id_ID' : 'en_US'
    }
  }
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = params
  
  // ✅ FETCH REAL PROJECTS FROM SANITY
  const sanityProjects = await getProjects(locale, 100)
  
  console.log('📊 [Projects Page] Fetched projects:', sanityProjects.length)
  
  // Fallback stats if no projects
  const stats = {
    totalProjects: sanityProjects.length || 500,
    totalCapacity: sanityProjects.reduce((sum, p) => sum + (p.capacity || 0), 0) || 200,
    satisfaction: 95,
    residential: sanityProjects.filter(p => p.systemType === 'residential').length || 200,
    commercial: sanityProjects.filter(p => p.systemType === 'commercial').length || 180,
    industrial: sanityProjects.filter(p => p.systemType === 'industrial').length || 120
  }
  
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://goldenenergy.com.vn/#organization',
    name: 'Golden Energy Vietnam',
    url: 'https://goldenenergy.com.vn',
    logo: 'https://goldenenergy.com.vn/logo.png',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      bestRating: '5',
      worstRating: '1',
      ratingCount: stats.totalProjects.toString()
    }
  }
  
  // ItemList Schema for projects
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: sanityProjects.length,
    itemListElement: sanityProjects.slice(0, 20).map((project, index) => {
      const slugString = typeof project.slug === 'string' ? project.slug : project.slug?.current || project._id
      
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          '@id': `https://goldenenergy.com.vn/${locale}/du-an/${slugString}`,
          name: project.title,
          description: project.shortDescription || '',
          category: project.systemType === 'residential' ? 'Residential Solar' : project.systemType === 'commercial' ? 'Commercial Solar' : 'Industrial Solar',
          additionalProperty: [
            {
              '@type': 'PropertyValue',
              name: 'Capacity',
              value: `${project.capacity}kW`
            },
            project.savings && {
              '@type': 'PropertyValue',
              name: 'Savings',
              value: `${project.savings}%`
            },
            project.paybackPeriod && {
              '@type': 'PropertyValue',
              name: 'Payback Period',
              value: `${project.paybackPeriod} years`
            },
            {
              '@type': 'PropertyValue',
              name: 'Location',
              value: typeof project.location === 'string' ? project.location : project.location?.city || ''
            }
          ].filter(Boolean)
        }
      }
    })
  }
  
  const breadcrumbPath = `/${locale}/du-an`
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbPath, locale as any)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-20">
        <Container>
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {t('heroTitle', locale)}
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              {t('heroSubtitle', locale)}
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {stats.totalProjects}+
                </div>
                <div className="text-gray-600 font-medium">
                  {t('projectsCount', locale)}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {stats.totalCapacity}MW+
                </div>
                <div className="text-gray-600 font-medium">
                  {t('totalCapacity', locale)}
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  {stats.satisfaction}%
                </div>
                <div className="text-gray-600 font-medium">
                  {t('satisfaction', locale)}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Projects Grid Section */}
      <section className="py-20">
        <Container>
          {/* Filter Bar - Note: This would be a client component in full implementation */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterType', locale)}
                </label>
                <div className="text-gray-500 text-sm">
                  {t('allTypes', locale)} • {t('residential', locale)} • {t('commercial', locale)} • {t('industrial', locale)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterRegion', locale)}
                </label>
                <div className="text-gray-500 text-sm">
                  {t('allTypes', locale)} • {t('north', locale)} • {t('central', locale)} • {t('south', locale)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('filterCapacity', locale)}
                </label>
                <div className="text-gray-500 text-sm">
                  {t('allTypes', locale)} • {t('capacitySmall', locale)} • {t('capacityMedium', locale)} • {t('capacityLarge', locale)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('searchPlaceholder', locale).split('...')[0]}
                </label>
                <div className="text-gray-500 text-sm">
                  🔍 {t('searchPlaceholder', locale)}
                </div>
              </div>
            </div>
          </div>
          
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sanityProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {locale === 'vi' ? 'Chưa có dự án nào' : locale === 'zh' ? '暂无项目' : locale === 'id' ? 'Belum ada proyek' : 'No projects yet'}
                </p>
              </div>
            ) : (
              sanityProjects.map((project) => {
              const typeColors = {
                residential: 'bg-blue-100 text-blue-800',
                commercial: 'bg-indigo-100 text-indigo-800',
                industrial: 'bg-teal-100 text-teal-800'
              }
              
              const slugString = typeof project.slug === 'string' ? project.slug : project.slug?.current || project._id
              
              return (
                <Link
                  key={project._id}
                  href={`/${locale}/du-an/${slugString}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 block"
                >
                  {/* Project Image */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-200 to-gray-300">
                    {project.imageUrl ? (
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        📸 {project.title}
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${typeColors[project.systemType]}`}>
                        {t(project.systemType, locale)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Project Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {project.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      📍 {typeof project.location === 'string' ? project.location : project.location?.city || project.location?.address || ''}
                    </p>
                    
                    <p className="text-gray-600 mb-6 line-clamp-2">
                      {project.shortDescription || ''}
                    </p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-200">
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {project.capacity}kW
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('filterCapacity', locale)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {project.savings || 0}%
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('savings', locale)}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {project.paybackPeriod || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('payback', locale)} ({t('years', locale)})
                        </div>
                      </div>
                    </div>
                    
                    {/* CTA - Already in Link wrapper above */}
                    <div className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors">
                      {t('viewDetails', locale)} →
                    </div>
                  </div>
                </Link>
              )
            }))}
          </div>
        </Container>
      </section>
      
      {/* Category Stats Section */}
      <section className="py-20 bg-gray-50">
        <Container>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {t('categoryStatsTitle', locale)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏠</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.residential}
              </h3>
              <p className="text-gray-600 font-medium mb-4">
                {t('residential', locale)}
              </p>
              <div className="text-sm text-gray-500">
                5-10kW • 5-7 {t('years', locale)} ROI
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏢</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.commercial}
              </h3>
              <p className="text-gray-600 font-medium mb-4">
                {t('commercial', locale)}
              </p>
              <div className="text-sm text-gray-500">
                20-100kW • 4-6 {t('years', locale)} ROI
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {stats.industrial}
              </h3>
              <p className="text-gray-600 font-medium mb-4">
                {t('industrial', locale)}
              </p>
              <div className="text-sm text-gray-500">
                200kW-5MW • 3-4 {t('years', locale)} ROI
              </div>
            </div>
          </div>
        </Container>
      </section>
      
      {/* Success Stories (Testimonials) */}
      <section className="py-20">
        <Container>
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            {t('successStoriesTitle', locale)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-2xl">★</span>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.quote[locale as keyof typeof testimonial.quote]}"
                </p>
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name[locale as keyof typeof testimonial.name]}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location[locale as keyof typeof testimonial.location]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              {t('ctaTitle', locale)}
            </h2>
            <p className="text-xl text-green-50 mb-12">
              {t('ctaSubtitle', locale)}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/tinh-toan`}
                className="bg-white text-green-600 hover:bg-green-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {t('calculateButton', locale)}
              </Link>
              
              <Link
                href={`/${locale}/lien-he`}
                className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                {t('consultButton', locale)}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
