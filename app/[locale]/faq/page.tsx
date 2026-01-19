import { Metadata } from 'next'
import { Container } from '@/components/Container'
import { generateBreadcrumbSchema } from '@/lib/schema'
import Link from 'next/link'

interface PageProps {
  params: { locale: string }
}

// Translations
const translations = {
  vi: {
    title: 'Câu Hỏi Thường Gặp',
    subtitle: 'Giải đáp mọi thắc mắc về hệ thống điện mặt trời',
    searchPlaceholder: 'Tìm kiếm câu hỏi...',
    categories: {
      system: 'Hệ Thống & Công Nghệ',
      cost: 'Chi Phí & Tài Chính',
      installation: 'Lắp Đặt & Thi Công',
      operation: 'Vận Hành & Bảo Trì',
      policy: 'Chính Sách & Pháp Lý'
    },
    ctaTitle: 'Không tìm thấy câu trả lời?',
    ctaSubtitle: 'Đội ngũ chuyên gia của chúng tôi sẵn sàng hỗ trợ bạn',
    ctaButton: 'Liên hệ tư vấn',
    ctaChat: 'Chat ngay'
  },
  en: {
    title: 'Frequently Asked Questions',
    subtitle: 'Answer all your questions about solar energy systems',
    searchPlaceholder: 'Search questions...',
    categories: {
      system: 'System & Technology',
      cost: 'Cost & Finance',
      installation: 'Installation & Construction',
      operation: 'Operation & Maintenance',
      policy: 'Policy & Legal'
    },
    ctaTitle: 'Cannot find the answer?',
    ctaSubtitle: 'Our expert team is ready to help',
    ctaButton: 'Contact us',
    ctaChat: 'Chat now'
  },
  zh: {
    title: '常见问题',
    subtitle: '解答所有关于太阳能系统的疑问',
    searchPlaceholder: '搜索问题...',
    categories: {
      system: '系统与技术',
      cost: '费用与财务',
      installation: '安装与施工',
      operation: '运营与维护',
      policy: '政策与法律'
    },
    ctaTitle: '找不到答案？',
    ctaSubtitle: '我们的专家团队随时准备帮助您',
    ctaButton: '联系咨询',
    ctaChat: '立即聊天'
  },
  id: {
    title: 'Pertanyaan Umum',
    subtitle: 'Jawaban atas semua pertanyaan tentang sistem energi surya',
    searchPlaceholder: 'Cari pertanyaan...',
    categories: {
      system: 'Sistem & Teknologi',
      cost: 'Biaya & Keuangan',
      installation: 'Instalasi & Konstruksi',
      operation: 'Operasi & Pemeliharaan',
      policy: 'Kebijakan & Hukum'
    },
    ctaTitle: 'Tidak menemukan jawaban?',
    ctaSubtitle: 'Tim ahli kami siap membantu',
    ctaButton: 'Hubungi kami',
    ctaChat: 'Chat sekarang'
  }
}

// FAQ Data
const faqs = {
  vi: {
    system: [
      {
        q: 'Hệ thống điện mặt trời hoạt động như thế nào?',
        a: 'Tấm pin mặt trời (solar panel) chuyển đổi ánh sáng mặt trời thành điện năng DC (dòng một chiều). Inverter sẽ chuyển DC thành AC (dòng xoay chiều) để sử dụng cho các thiết bị điện trong nhà. Hệ thống hòa lưới (grid-tied) kết nối trực tiếp với lưới điện quốc gia, cho phép bán điện thừa và mua điện khi thiếu.'
      },
      {
        q: 'Công suất hệ thống được tính như thế nào?',
        a: 'Công suất hệ thống (kWp) được tính dựa trên: (1) Hóa đơn điện hàng tháng của bạn, (2) Diện tích mái nhà có thể lắp đặt, (3) Vị trí địa lý và lượng bức xạ mặt trời. Công thức đơn giản: Công suất cần = (Tiêu thụ hàng tháng / 30 ngày) / (Giờ nắng x 0.75). Ví dụ: Dùng 300 kWh/tháng, nắng 5 giờ/ngày → Cần 2.67 kWp.'
      },
      {
        q: 'Tấm pin đơn tinh thể và đa tinh thể khác nhau gì?',
        a: 'Đơn tinh thể (Mono): Hiệu suất cao hơn (20-22%), màu đen đẹp, giá cao hơn 20-30%. Phù hợp mái nhỏ. Đa tinh thể (Poly): Hiệu suất 17-19%, màu xanh lam, giá rẻ hơn, phù hợp mái rộng. Hiện nay Mono đang thống trị thị trường do giá đã giảm và hiệu suất vượt trội.'
      },
      {
        q: 'Hệ thống có hoạt động khi mất điện không?',
        a: 'Hệ thống hòa lưới tiêu chuẩn SẼ TẮT khi mất điện để bảo vệ công nhân EVN đang sửa chữa. Nếu muốn dùng điện khi mất điện, cần lắp thêm pin lưu trữ (battery) và inverter하이브리드 (hybrid inverter). Chi phí pin tăng thêm 30-50 triệu đồng cho hệ thống 5kW.'
      },
      {
        q: 'Tuổi thọ của hệ thống là bao lâu?',
        a: 'Tấm pin: 25-30 năm (bảo hành 25 năm giữ 80% công suất). Inverter: 10-15 năm (có thể thay 1-2 lần). Khung giá đỡ: 25+ năm. Hệ thống được thiết kế để hoạt động ít nhất 25 năm với bảo trì định kỳ.'
      }
    ],
    cost: [
      {
        q: 'Chi phí lắp đặt hệ thống 5kW là bao nhiêu?',
        a: 'Chi phí trung bình 2026: 70-90 triệu đồng cho hệ thống 5kW hoàn chỉnh bao gồm: tấm pin (35-40 triệu), inverter (12-15 triệu), vật tư lắp đặt (10-15 triệu), công lắp đặt (8-12 triệu), giấy tờ pháp lý (2-3 triệu). Giá có thể thấp hơn khi mua trọn gói hoặc khuyến mãi.'
      },
      {
        q: 'Bao lâu thì hoàn vốn?',
        a: 'Thời gian hoàn vốn trung bình 5-7 năm tùy vào: (1) Giá điện hiện tại và xu hướng tăng, (2) Lượng điện tiêu thụ, (3) Vị trí lắp đặt. Ví dụ: Hệ thống 5kW, chi phí 80 triệu, tiết kiệm 1.2 triệu/tháng → Hoàn vốn sau 5.5 năm. Sau đó lãi ròng 1.2 triệu x 12 tháng x 20 năm = 288 triệu đồng!'
      },
      {
        q: 'Có hỗ trợ vay ngân hàng không?',
        a: 'CÓ! Nhiều ngân hàng hỗ trợ vay năng lượng tái tạo: (1) Vietcombank: Lãi suất 6-8%/năm, thời hạn tới 10 năm, (2) BIDV: Vay tối đa 80% giá trị dự án, (3) ACB: Lãi suất ưu đãi 0% trong 6 tháng đầu. Golden Energy hỗ trợ toàn bộ thủ tục vay.'
      },
      {
        q: 'Chi phí bảo trì hàng năm là bao nhiêu?',
        a: 'Rất thấp! Khoảng 500,000 - 1,000,000 đồng/năm bao gồm: (1) Vệ sinh tấm pin 2 lần/năm (nước mưa tự rửa phần lớn), (2) Kiểm tra inverter và dây điện, (3) Thay thế linh kiện nhỏ nếu cần. Hệ thống không có bộ phận chuyển động nên hỏng hóc cực hiếm.'
      },
      {
        q: 'Có được khấu trừ thuế không?',
        a: 'Hiện tại chưa có chính sách khấu trừ thuế trực tiếp cho hộ gia đình, nhưng doanh nghiệp được tính chi phí hợp lý trong năm đầu đầu tư. Chính phủ đang nghiên cứu các ưu đãi thuế cho năng lượng xanh trong năm 2026-2027.'
      }
    ],
    installation: [
      {
        q: 'Thời gian thi công mất bao lâu?',
        a: 'Lắp đặt thực tế: 1-2 ngày cho hệ thống nhỏ (<10kW), 3-5 ngày cho hệ thống lớn (>50kW). Tổng thời gian từ ký hợp đồng đến hòa lưới: 2-4 tuần bao gồm khảo sát, thiết kế, chờ thiết bị, thi công, và làm thủ tục EVN.'
      },
      {
        q: 'Mái nhà có cần gia cố không?',
        a: 'Phụ thuộc vào: (1) Loại mái (tôn, ngói, bê tông), (2) Tuổi công trình, (3) Khả năng chịu lực. Khung giá đỡ hiện đại rất nhẹ (~15kg/m²). Golden Energy khảo sát miễn phí và tư vấn gia cố nếu cần (chi phí thêm 3-5 triệu nếu có).'
      },
      {
        q: 'Có ảnh hưởng đến chống nước mái không?',
        a: 'KHÔNG nếu thi công đúng kỹ thuật. Golden Energy sử dụng: (1) Keo silicon chuyên dụng chống thấm, (2) Đệm cao su EPDM tại điểm khoan, (3) Hook inox không rỉ sét. Chúng tôi bảo hành chống thấm 10 năm.'
      },
      {
        q: 'Hệ thống có nặng không? Mái có chịu được không?',
        a: 'Trọng lượng: Khoảng 15-18 kg/m² (tấm pin 22kg + khung 8kg + phụ kiện). Mái bê tông tiêu chuẩn chịu được 250 kg/m², mái tôn chịu được 80-150 kg/m². Hoàn toàn an toàn với mái nhà tiêu chuẩn Việt Nam.'
      },
      {
        q: 'Cần thủ tục pháp lý gì?',
        a: 'Hệ thống <50kW (hộ gia đình): (1) Đơn đăng ký với EVN, (2) Hợp đồng mua bán điện, (3) Nghiệm thu kỹ thuật. Golden Energy hỗ trợ TOÀN BỘ thủ tục trong 1 tuần. Không cần giấy phép xây dựng cho hệ thống mái nhà.'
      }
    ],
    operation: [
      {
        q: 'Có cần vệ sinh tấm pin thường xuyên không?',
        a: 'Nên vệ sinh 2-3 lần/năm tại khu vực ít mưa, hoặc 1 lần/năm nếu mưa thường xuyên. Bụi dày 2mm có thể giảm 5-10% hiệu suất. Dùng nước sạch + chổi mềm, KHÔNG dùng hóa chất mạnh. Chi phí dịch vụ: 500,000 - 1,000,000 đồng/lần.'
      },
      {
        q: 'Hệ thống có gây ồn không?',
        a: 'Tấm pin HOÀN TOÀN IM LẶNG. Inverter có thể phát âm thanh nhỏ (~35 dB, bằng tủ lạnh) khi hoạt động. Lắp inverter ở vị trí thông thoáng, cách phòng ngủ là tốt nhất.'
      },
      {
        q: 'Có theo dõi được sản lượng điện không?',
        a: 'CÓ! Inverter hiện đại có app di động theo dõi: (1) Sản lượng hôm nay/tháng/năm, (2) Thu nhập từ bán điện, (3) CO₂ tiết kiệm, (4) Cảnh báo lỗi qua SMS/email. Bạn có thể xem mọi lúc mọi nơi.'
      }
    ],
    policy: [
      {
        q: 'Giá mua điện mặt trời mái nhà 2026 là bao nhiêu?',
        a: 'Chính sách Net Metering (bù trừ) hiện tại: Điện dư bán cho EVN được ghi nhận 100% giá trị, bù trừ với điện mua trong tháng. Nếu phát nhiều hơn dùng, phần dư được chuyển sang tháng sau (không thanh toán tiền mặt). Đây là chính sách khuyến khích tốt nhất cho hộ gia đình.'
      },
      {
        q: 'Chính sách có thay đổi trong tương lai không?',
        a: 'Chính sách Net Metering ổn định từ 2022 và dự kiến duy trì đến 2030. Xu hướng toàn cầu là khuyến khích năng lượng sạch, nên rủi ro chính sách thấp. Hợp đồng EVN có hiệu lực 20 năm, đảm bảo quyền lợi lâu dài.'
      }
    ]
  },
  en: {
    system: [
      {
        q: 'How does a solar energy system work?',
        a: 'Solar panels convert sunlight into DC (direct current) electricity. An inverter then converts DC to AC (alternating current) for household appliances. Grid-tied systems connect directly to the national grid, allowing you to sell excess power and buy when needed.'
      },
      {
        q: 'How is system capacity calculated?',
        a: 'System capacity (kWp) is based on: (1) Monthly electricity bill, (2) Available roof area, (3) Geographic location and solar irradiance. Simple formula: Required capacity = (Monthly consumption / 30 days) / (Sun hours x 0.75). Example: 300 kWh/month, 5 sun hours/day → Need 2.67 kWp.'
      },
      {
        q: 'What is the difference between monocrystalline and polycrystalline panels?',
        a: 'Monocrystalline: Higher efficiency (20-22%), black color, 20-30% more expensive, suitable for small roofs. Polycrystalline: 17-19% efficiency, blue color, cheaper, suitable for large roofs. Mono now dominates the market due to price reduction and superior efficiency.'
      },
      {
        q: 'Does the system work during power outages?',
        a: 'Standard grid-tied systems SHUT OFF during outages to protect utility workers. If you want power during outages, you need to install battery storage and a hybrid inverter. Battery cost adds 30-50 million VND for a 5kW system.'
      },
      {
        q: 'What is the lifespan of the system?',
        a: 'Solar panels: 25-30 years (25-year warranty for 80% capacity). Inverter: 10-15 years (may need 1-2 replacements). Mounting frame: 25+ years. System designed to operate for at least 25 years with regular maintenance.'
      }
    ],
    cost: [
      {
        q: 'What is the cost of a 5kW system?',
        a: 'Average 2026 cost: 70-90 million VND for complete 5kW system including: panels (35-40 million), inverter (12-15 million), installation materials (10-15 million), labor (8-12 million), legal paperwork (2-3 million). Price may be lower with package deals or promotions.'
      },
      {
        q: 'What is the payback period?',
        a: 'Average payback period is 5-7 years depending on: (1) Current electricity price and trends, (2) Consumption level, (3) Installation location. Example: 5kW system, 80 million cost, 1.2 million/month savings → Payback in 5.5 years. Then net profit of 1.2 million x 12 months x 20 years = 288 million VND!'
      },
      {
        q: 'Are bank loans available?',
        a: 'YES! Many banks support renewable energy loans: (1) Vietcombank: 6-8% annual interest, up to 10 years, (2) BIDV: Up to 80% project value, (3) ACB: 0% promotional interest for first 6 months. Golden Energy supports all loan procedures.'
      },
      {
        q: 'What is the annual maintenance cost?',
        a: 'Very low! About 500,000 - 1,000,000 VND/year including: (1) Panel cleaning twice/year (rain does most), (2) Inverter and cable inspection, (3) Small part replacements if needed. No moving parts means extremely rare failures.'
      },
      {
        q: 'Are there tax deductions?',
        a: 'Currently no direct tax deductions for households, but businesses can claim reasonable expenses in the first year. Government is studying tax incentives for green energy in 2026-2027.'
      }
    ],
    installation: [
      {
        q: 'How long does installation take?',
        a: 'Actual installation: 1-2 days for small systems (<10kW), 3-5 days for large systems (>50kW). Total time from contract to grid connection: 2-4 weeks including survey, design, equipment delivery, installation, and EVN procedures.'
      },
      {
        q: 'Does the roof need reinforcement?',
        a: 'Depends on: (1) Roof type (metal, tile, concrete), (2) Building age, (3) Load capacity. Modern mounting frames are very light (~15kg/m²). Golden Energy provides free survey and reinforcement advice if needed (additional cost 3-5 million if required).'
      },
      {
        q: 'Does it affect roof waterproofing?',
        a: 'NO if installed correctly. Golden Energy uses: (1) Specialized waterproof silicon, (2) EPDM rubber pads at drilling points, (3) Stainless steel hooks. We warranty waterproofing for 10 years.'
      },
      {
        q: 'Is the system heavy? Can the roof support it?',
        a: 'Weight: About 15-18 kg/m² (22kg panel + 8kg frame + accessories). Standard concrete roofs can support 250 kg/m², metal roofs 80-150 kg/m². Completely safe for standard Vietnamese roofs.'
      },
      {
        q: 'What legal procedures are required?',
        a: 'Systems <50kW (households): (1) Registration with EVN, (2) Power purchase agreement, (3) Technical inspection. Golden Energy supports ALL procedures within 1 week. No building permit required for rooftop systems.'
      }
    ],
    operation: [
      {
        q: 'Do panels need frequent cleaning?',
        a: 'Recommend cleaning 2-3 times/year in low-rainfall areas, or once/year if frequent rain. 2mm dust layer can reduce efficiency by 5-10%. Use clean water + soft brush, NO strong chemicals. Service cost: 500,000 - 1,000,000 VND/time.'
      },
      {
        q: 'Does the system make noise?',
        a: 'Panels are COMPLETELY SILENT. Inverter may emit small sound (~35 dB, like refrigerator) when operating. Install inverter in ventilated area away from bedrooms.'
      },
      {
        q: 'Can I monitor power generation?',
        a: 'YES! Modern inverters have mobile apps to track: (1) Today/month/year production, (2) Income from selling power, (3) CO₂ saved, (4) Error alerts via SMS/email. Check anytime, anywhere.'
      }
    ],
    policy: [
      {
        q: 'What is the 2026 rooftop solar purchase price?',
        a: 'Current Net Metering policy: Excess electricity sold to EVN is recorded at 100% value, offset against purchased electricity within the month. If you generate more than you use, the surplus is carried to next month (no cash payment). This is the best incentive policy for households.'
      },
      {
        q: 'Will policy change in the future?',
        a: 'Net Metering policy has been stable since 2022 and expected to continue until 2030. Global trend is to encourage clean energy, so policy risk is low. EVN contract valid for 20 years, ensuring long-term benefits.'
      }
    ]
  },
  zh: {
    system: [
      { q: '太阳能系统如何工作？', a: '太阳能板将阳光转换为直流电。逆变器将直流电转换为交流电供家用电器使用。并网系统直接连接国家电网，允许您出售多余电力并在需要时购买。' },
      { q: '系统容量如何计算？', a: '系统容量（千瓦）基于：(1) 每月电费，(2) 可用屋顶面积，(3) 地理位置和太阳辐射。简单公式：所需容量 = (月消耗 / 30天) / (日照小时 x 0.75)。例如：300千瓦时/月，5小时日照/天 → 需要2.67千瓦。' },
      { q: '单晶和多晶板有什么区别？', a: '单晶：效率更高（20-22%），黑色，贵20-30%，适合小屋顶。多晶：17-19%效率，蓝色，更便宜，适合大屋顶。现在单晶由于价格下降和卓越效率主导市场。' },
      { q: '停电时系统还能工作吗？', a: '标准并网系统在停电时会关闭以保护电力工人。如果您想在停电时使用电力，需要安装电池储能和混合逆变器。电池成本为5千瓦系统增加3000-5000万越盾。' },
      { q: '系统的使用寿命是多久？', a: '太阳能板：25-30年（25年保修80%容量）。逆变器：10-15年（可能需要1-2次更换）。安装架：25年以上。系统设计可运行至少25年并定期维护。' }
    ],
    cost: [
      { q: '5千瓦系统的费用是多少？', a: '2026年平均费用：7000-9000万越盾完整5千瓦系统，包括：面板（3500-4000万），逆变器（1200-1500万），安装材料（1000-1500万），人工（800-1200万），法律文件（200-300万）。套餐优惠可能更低。' },
      { q: '回本期是多久？', a: '平均回本期为5-7年，取决于：(1) 当前电价和趋势，(2) 消耗水平，(3) 安装位置。例如：5千瓦系统，8000万成本，每月节省120万 → 5.5年回本。然后净利润120万 x 12个月 x 20年 = 28800万越盾！' },
      { q: '有银行贷款吗？', a: '有！许多银行支持可再生能源贷款：(1) Vietcombank：6-8%年利率，最长10年，(2) BIDV：最高80%项目价值，(3) ACB：前6个月0%促销利率。金能源支持所有贷款手续。' },
      { q: '年度维护费用是多少？', a: '非常低！约50-100万越盾/年，包括：(1) 每年清洁面板2次（雨水做大部分），(2) 检查逆变器和电缆，(3) 必要时更换小零件。无运动部件意味着极少故障。' },
      { q: '有税收减免吗？', a: '目前家庭没有直接税收减免，但企业可以在第一年申报合理费用。政府正在研究2026-2027年的绿色能源税收激励。' }
    ],
    installation: [
      { q: '安装需要多长时间？', a: '实际安装：小型系统（<10千瓦）1-2天，大型系统（>50千瓦）3-5天。从合同到并网总时间：2-4周，包括勘察、设计、设备交付、安装和EVN程序。' },
      { q: '屋顶需要加固吗？', a: '取决于：(1) 屋顶类型（金属、瓦、混凝土），(2) 建筑年龄，(3) 承载能力。现代安装架非常轻（~15公斤/平方米）。金能源提供免费勘察和加固建议（如需加固额外费用300-500万）。' },
      { q: '会影响屋顶防水吗？', a: '如果安装正确则不会。金能源使用：(1) 专用防水硅胶，(2) 钻孔点的EPDM橡胶垫，(3) 不锈钢钩。我们保修防水10年。' },
      { q: '系统重吗？屋顶能支撑吗？', a: '重量：约15-18公斤/平方米（22公斤面板+8公斤框架+配件）。标准混凝土屋顶可支撑250公斤/平方米，金属屋顶80-150公斤/平方米。对于标准越南屋顶完全安全。' },
      { q: '需要什么法律程序？', a: '系统<50千瓦（家庭）：(1) 向EVN注册，(2) 购电协议，(3) 技术检查。金能源在1周内支持所有程序。屋顶系统无需建筑许可。' }
    ],
    operation: [
      { q: '面板需要经常清洁吗？', a: '建议低降雨地区每年清洁2-3次，或降雨频繁地区每年1次。2毫米灰尘层可降低5-10%效率。使用清水+软刷，不要使用强化学品。服务费用：50-100万越盾/次。' },
      { q: '系统会产生噪音吗？', a: '面板完全静音。逆变器运行时可能发出小声音（~35分贝，像冰箱）。在通风区域远离卧室安装逆变器。' },
      { q: '我可以监测发电量吗？', a: '可以！现代逆变器有移动应用程序跟踪：(1) 今天/月/年产量，(2) 卖电收入，(3) 节省的CO₂，(4) 通过短信/电子邮件警报错误。随时随地查看。' }
    ],
    policy: [
      { q: '2026年屋顶太阳能购买价格是多少？', a: '当前净计量政策：卖给EVN的多余电力按100%价值记录，与当月购买的电力抵消。如果您发电多于使用，剩余电力结转到下个月（无现金支付）。这是家庭最好的激励政策。' },
      { q: '政策未来会改变吗？', a: '净计量政策自2022年以来一直稳定，预计将持续到2030年。全球趋势是鼓励清洁能源，因此政策风险低。EVN合同有效期20年，确保长期利益。' }
    ]
  },
  id: {
    system: [
      { q: 'Bagaimana cara kerja sistem energi surya?', a: 'Panel surya mengubah sinar matahari menjadi listrik DC (arus searah). Inverter kemudian mengubah DC menjadi AC (arus bolak-balik) untuk peralatan rumah tangga. Sistem grid-tied terhubung langsung ke jaringan nasional, memungkinkan Anda menjual kelebihan daya dan membeli saat dibutuhkan.' },
      { q: 'Bagaimana kapasitas sistem dihitung?', a: 'Kapasitas sistem (kWp) didasarkan pada: (1) Tagihan listrik bulanan, (2) Luas atap yang tersedia, (3) Lokasi geografis dan iradiasi surya. Rumus sederhana: Kapasitas yang diperlukan = (Konsumsi bulanan / 30 hari) / (Jam matahari x 0.75). Contoh: 300 kWh/bulan, 5 jam matahari/hari → Perlu 2.67 kWp.' },
      { q: 'Apa perbedaan panel monokristal dan polikristal?', a: 'Monokristal: Efisiensi lebih tinggi (20-22%), warna hitam, 20-30% lebih mahal, cocok untuk atap kecil. Polikristal: Efisiensi 17-19%, warna biru, lebih murah, cocok untuk atap besar. Mono sekarang mendominasi pasar karena penurunan harga dan efisiensi superior.' },
      { q: 'Apakah sistem bekerja saat pemadaman listrik?', a: 'Sistem grid-tied standar MATI saat pemadaman untuk melindungi pekerja utilitas. Jika Anda ingin listrik saat pemadaman, Anda perlu memasang penyimpanan baterai dan inverter hybrid. Biaya baterai menambah 30-50 juta VND untuk sistem 5kW.' },
      { q: 'Berapa umur sistem?', a: 'Panel surya: 25-30 tahun (garansi 25 tahun untuk 80% kapasitas). Inverter: 10-15 tahun (mungkin perlu 1-2 penggantian). Rangka pemasangan: 25+ tahun. Sistem dirancang untuk beroperasi setidaknya 25 tahun dengan pemeliharaan rutin.' }
    ],
    cost: [
      { q: 'Berapa biaya sistem 5kW?', a: 'Biaya rata-rata 2026: 70-90 juta VND untuk sistem lengkap 5kW termasuk: panel (35-40 juta), inverter (12-15 juta), material pemasangan (10-15 juta), tenaga kerja (8-12 juta), dokumen legal (2-3 juta). Harga bisa lebih rendah dengan paket atau promosi.' },
      { q: 'Berapa periode pengembalian modal?', a: 'Periode pengembalian rata-rata 5-7 tahun tergantung pada: (1) Harga listrik saat ini dan tren, (2) Tingkat konsumsi, (3) Lokasi pemasangan. Contoh: Sistem 5kW, biaya 80 juta, penghematan 1.2 juta/bulan → Pengembalian dalam 5.5 tahun. Kemudian keuntungan bersih 1.2 juta x 12 bulan x 20 tahun = 288 juta VND!' },
      { q: 'Apakah ada pinjaman bank?', a: 'YA! Banyak bank mendukung pinjaman energi terbarukan: (1) Vietcombank: Bunga tahunan 6-8%, hingga 10 tahun, (2) BIDV: Hingga 80% nilai proyek, (3) ACB: Bunga promosi 0% untuk 6 bulan pertama. Golden Energy mendukung semua prosedur pinjaman.' },
      { q: 'Berapa biaya pemeliharaan tahunan?', a: 'Sangat rendah! Sekitar 500,000 - 1,000,000 VND/tahun termasuk: (1) Pembersihan panel dua kali/tahun (hujan melakukan sebagian besar), (2) Inspeksi inverter dan kabel, (3) Penggantian suku cadang kecil jika diperlukan. Tidak ada bagian bergerak berarti kegagalan sangat jarang.' },
      { q: 'Apakah ada pengurangan pajak?', a: 'Saat ini tidak ada pengurangan pajak langsung untuk rumah tangga, tetapi bisnis dapat mengklaim biaya wajar di tahun pertama. Pemerintah sedang mempelajari insentif pajak untuk energi hijau pada 2026-2027.' }
    ],
    installation: [
      { q: 'Berapa lama pemasangan?', a: 'Pemasangan aktual: 1-2 hari untuk sistem kecil (<10kW), 3-5 hari untuk sistem besar (>50kW). Total waktu dari kontrak hingga koneksi grid: 2-4 minggu termasuk survei, desain, pengiriman peralatan, pemasangan, dan prosedur EVN.' },
      { q: 'Apakah atap perlu diperkuat?', a: 'Tergantung pada: (1) Jenis atap (logam, genteng, beton), (2) Usia bangunan, (3) Kapasitas beban. Rangka pemasangan modern sangat ringan (~15kg/m²). Golden Energy menyediakan survei gratis dan saran penguatan jika diperlukan (biaya tambahan 3-5 juta jika diperlukan).' },
      { q: 'Apakah mempengaruhi kedap air atap?', a: 'TIDAK jika dipasang dengan benar. Golden Energy menggunakan: (1) Silikon kedap air khusus, (2) Bantalan karet EPDM di titik pengeboran, (3) Kait stainless steel. Kami garansi kedap air selama 10 tahun.' },
      { q: 'Apakah sistem berat? Bisakah atap menopangnya?', a: 'Berat: Sekitar 15-18 kg/m² (panel 22kg + rangka 8kg + aksesori). Atap beton standar dapat menopang 250 kg/m², atap logam 80-150 kg/m². Benar-benar aman untuk atap Vietnam standar.' },
      { q: 'Prosedur legal apa yang diperlukan?', a: 'Sistem <50kW (rumah tangga): (1) Pendaftaran dengan EVN, (2) Perjanjian pembelian listrik, (3) Inspeksi teknis. Golden Energy mendukung SEMUA prosedur dalam 1 minggu. Tidak perlu izin bangunan untuk sistem atap.' }
    ],
    operation: [
      { q: 'Apakah panel perlu dibersihkan sering?', a: 'Rekomendasikan pembersihan 2-3 kali/tahun di daerah curah hujan rendah, atau sekali/tahun jika hujan sering. Lapisan debu 2mm dapat mengurangi efisiensi 5-10%. Gunakan air bersih + sikat lembut, TIDAK gunakan bahan kimia kuat. Biaya layanan: 500,000 - 1,000,000 VND/kali.' },
      { q: 'Apakah sistem menimbulkan kebisingan?', a: 'Panel BENAR-BENAR SENYAP. Inverter mungkin mengeluarkan suara kecil (~35 dB, seperti kulkas) saat beroperasi. Pasang inverter di area berventilasi jauh dari kamar tidur.' },
      { q: 'Bisakah saya memantau pembangkitan daya?', a: 'YA! Inverter modern memiliki aplikasi seluler untuk melacak: (1) Produksi hari ini/bulan/tahun, (2) Pendapatan dari penjualan listrik, (3) CO₂ yang dihemat, (4) Peringatan kesalahan melalui SMS/email. Periksa kapan saja, di mana saja.' }
    ],
    policy: [
      { q: 'Berapa harga pembelian surya atap 2026?', a: 'Kebijakan Net Metering saat ini: Listrik berlebih yang dijual ke EVN dicatat pada nilai 100%, diimbangi dengan listrik yang dibeli dalam bulan tersebut. Jika Anda menghasilkan lebih dari yang Anda gunakan, surplus dibawa ke bulan berikutnya (tanpa pembayaran tunai). Ini adalah kebijakan insentif terbaik untuk rumah tangga.' },
      { q: 'Akankah kebijakan berubah di masa depan?', a: 'Kebijakan Net Metering telah stabil sejak 2022 dan diharapkan berlanjut hingga 2030. Tren global adalah mendorong energi bersih, jadi risiko kebijakan rendah. Kontrak EVN berlaku selama 20 tahun, memastikan manfaat jangka panjang.' }
    ]
  }
}

// Metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params
  const t = translations[locale as keyof typeof translations] || translations.vi

  return {
    title: t.title,
    description: t.subtitle,
    openGraph: {
      title: t.title,
      description: t.subtitle,
      type: 'website'
    }
  }
}

export default function FAQPage({ params }: PageProps) {
  const { locale } = params
  const t = translations[locale as keyof typeof translations] || translations.vi
  const faqData = faqs[locale as keyof typeof faqs] || faqs.vi

  // Generate FAQPage schema
  const breadcrumbPath = `/${locale}/faq`
  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbPath, locale as any)

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      ...Object.entries(faqData).flatMap(([category, items]) =>
        items.map(item => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a
          }
        }))
      )
    ]
  }

  return (
    <>
      {/* Schema.org markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-16 sm:py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {t.subtitle}
            </p>
            
            {/* Search Placeholder */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                disabled
              />
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 bg-white">
        <Container>
          <div className="space-y-12">
            {/* System & Technology */}
            <FAQSection
              title={t.categories.system}
              questions={faqData.system}
              icon="⚡"
            />

            {/* Cost & Finance */}
            <FAQSection
              title={t.categories.cost}
              questions={faqData.cost}
              icon="💰"
            />

            {/* Installation & Construction */}
            <FAQSection
              title={t.categories.installation}
              questions={faqData.installation}
              icon="🔧"
            />

            {/* Operation & Maintenance */}
            <FAQSection
              title={t.categories.operation}
              questions={faqData.operation}
              icon="⚙️"
            />

            {/* Policy & Legal */}
            <FAQSection
              title={t.categories.policy}
              questions={faqData.policy}
              icon="📋"
            />
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 to-indigo-700">
        <Container>
          <div className="text-center text-white max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
            <p className="text-xl text-blue-100 mb-8">{t.ctaSubtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/lien-he`}
                className="inline-block bg-white text-blue-600 font-bold px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {t.ctaButton}
              </Link>
              <Link
                href={`/${locale}#calculator`}
                className="inline-block bg-yellow-500 text-gray-900 font-bold px-8 py-4 rounded-lg hover:bg-yellow-400 transition-colors"
              >
                {t.ctaChat}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}

// FAQ Section Component
function FAQSection({ title, questions, icon }: { title: string; questions: Array<{ q: string; a: string }>; icon: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        {title}
      </h2>
      <div className="space-y-4">
        {questions.map((item, index) => (
          <details
            key={index}
            className="group bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <summary className="cursor-pointer px-6 py-4 font-semibold text-gray-900 flex items-center justify-between list-none">
              <span className="flex-1">{item.q}</span>
              <svg
                className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="px-6 py-4 pt-0 text-gray-700 leading-relaxed border-t border-gray-200">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
