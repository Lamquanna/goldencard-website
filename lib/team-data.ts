export interface TeamMember {
  id: string;
  employeeCode: string;
  nameEn: string;
  nameVi: string;
  roleEn: string;
  roleVi: string;
  titleEn: string;
  titleVi: string;
  descriptionEn: string;
  descriptionVi: string;
  avatar: string;
  linkedin?: string;
  email?: string;
  category: 'leadership' | 'management' | 'engineering' | 'support';
  department?: string;
  yearsExperience?: number;
}

export const teamData: TeamMember[] = [
  // Leadership Team
  {
    id: 'emp-001',
    employeeCode: 'GE-CEO-001',
    nameEn: 'Jimmy Ha',
    nameVi: 'Hà Hoàng Hà',
    roleEn: 'Founder & CEO',
    roleVi: 'Nhà sáng lập & Tổng Giám đốc',
    titleEn: 'Founder & Chief Executive Officer',
    titleVi: 'Nhà sáng lập & Tổng Giám đốc điều hành',
    descriptionEn: 'Visionary leader and founder of Golden Energy, driving innovation in renewable energy solutions across Vietnam and Southeast Asia.',
    descriptionVi: 'Nhà lãnh đạo tầm nhìn và sáng lập Golden Energy, dẫn dắt đổi mới trong các giải pháp năng lượng tái tạo tại Việt Nam và Đông Nam Á.',
    avatar: '/Team/jimmy-ha.jpg',
    email: 'jimmy.ha@goldenenergy.vn',
    category: 'leadership',
    department: 'Ban Giám đốc',
    yearsExperience: 15,
  },
  {
    id: 'emp-002',
    employeeCode: 'GE-CFO-001',
    nameEn: 'Rita Kim Anh',
    nameVi: 'Trương Kim Anh',
    roleEn: 'CFO & Vice-CEO',
    roleVi: 'Giám đốc Tài chính & Phó Tổng Giám đốc',
    titleEn: 'Chief Financial Officer & Vice CEO',
    titleVi: 'Giám đốc Tài chính & Phó Tổng Giám đốc',
    descriptionEn: 'Strategic financial leadership ensuring sustainable growth and operational excellence across all business units.',
    descriptionVi: 'Lãnh đạo tài chính chiến lược đảm bảo tăng trưởng bền vững và xuất sắc vận hành trên tất cả các đơn vị kinh doanh.',
    avatar: '/Team/rita-kim-anh.jpg',
    email: 'rita.anh@goldenenergy.vn',
    category: 'leadership',
    department: 'Ban Giám đốc',
    yearsExperience: 12,
  },

  // Management Team
  {
    id: 'emp-003',
    employeeCode: 'GE-PM-001',
    nameEn: 'Tuan Ha',
    nameVi: 'Hà Huy Tuấn',
    roleEn: 'Project Supervision Manager',
    roleVi: 'Trưởng phòng Giám sát Dự án',
    titleEn: 'Head of Project Supervision & Construction Progress',
    titleVi: 'Trưởng phòng Giám sát Dự án và Tiến độ Thi công',
    descriptionEn: 'Leading project supervision and construction progress monitoring to ensure timely and quality delivery of all solar installation projects.',
    descriptionVi: 'Dẫn dắt giám sát dự án và theo dõi tiến độ thi công đảm bảo giao hàng đúng thời hạn và chất lượng cho tất cả dự án lắp đặt điện mặt trời.',
    avatar: '/Team/tuan-ha.jpg',
    email: 'tuan.ha@goldenenergy.vn',
    category: 'management',
    department: 'Phòng Dự án',
    yearsExperience: 10,
  },
  {
    id: 'emp-004',
    employeeCode: 'GE-TECH-001',
    nameEn: 'Tan Ho',
    nameVi: 'Hồ Minh Tân',
    roleEn: 'Chief Technical Officer',
    roleVi: 'Trưởng phòng Kỹ thuật & Kỹ sư trưởng',
    titleEn: 'Head of Technical Department & Chief Engineer',
    titleVi: 'Trưởng phòng Kỹ thuật & Kỹ sư trưởng',
    descriptionEn: 'Leading technical excellence in solar system design, installation standards, and engineering solutions for complex projects.',
    descriptionVi: 'Dẫn dắt xuất sắc kỹ thuật trong thiết kế hệ thống điện mặt trời, tiêu chuẩn lắp đặt và giải pháp kỹ thuật cho các dự án phức tạp.',
    avatar: '/Team/tan-ho.jpg',
    email: 'tan.ho@goldenenergy.vn',
    category: 'management',
    department: 'Phòng Kỹ thuật',
    yearsExperience: 11,
  },
  {
    id: 'emp-005',
    employeeCode: 'GE-BD-001',
    nameEn: 'Anh Le',
    nameVi: 'Lê Quang Anh',
    roleEn: 'Business Development Manager',
    roleVi: 'Trưởng phòng Phát triển Dự án',
    titleEn: 'Head of Project Development',
    titleVi: 'Trưởng phòng Phát triển Dự án',
    descriptionEn: 'Driving business growth through strategic project development and partnership building in renewable energy sector.',
    descriptionVi: 'Thúc đẩy tăng trưởng kinh doanh thông qua phát triển dự án chiến lược và xây dựng quan hệ đối tác trong lĩnh vực năng lượng tái tạo.',
    avatar: '/Team/anh-le.jpg',
    email: 'anh.le@goldenenergy.vn',
    category: 'management',
    department: 'Phòng Phát triển Dự án',
    yearsExperience: 8,
  },
  {
    id: 'emp-006',
    employeeCode: 'GE-ACC-001',
    nameEn: 'Thu Nguyen',
    nameVi: 'Nguyễn Thị Thu',
    roleEn: 'Chief Accountant',
    roleVi: 'Trưởng phòng Kế toán',
    titleEn: 'Head of Accounting Department',
    titleVi: 'Trưởng phòng Kế toán',
    descriptionEn: 'Managing financial operations, accounting compliance, and financial reporting for the organization.',
    descriptionVi: 'Quản lý hoạt động tài chính, tuân thủ kế toán và báo cáo tài chính cho tổ chức.',
    avatar: '/Team/thu-nguyen.jpg',
    email: 'thu.nguyen@goldenenergy.vn',
    category: 'management',
    department: 'Phòng Kế toán',
    yearsExperience: 9,
  },
  {
    id: 'emp-007',
    employeeCode: 'GE-LOG-001',
    nameEn: 'Le Pham',
    nameVi: 'Phạm Tấn Lễ',
    roleEn: 'Transportation Manager',
    roleVi: 'Trưởng bộ phận Vận chuyển',
    titleEn: 'Head of Transportation Department',
    titleVi: 'Trưởng bộ phận Vận chuyển',
    descriptionEn: 'Overseeing logistics and transportation operations ensuring timely delivery of equipment and materials.',
    descriptionVi: 'Giám sát hoạt động logistics và vận chuyển đảm bảo giao thiết bị và vật tư đúng thời hạn.',
    avatar: '/Team/le-pham.jpg',
    email: 'le.pham@goldenenergy.vn',
    category: 'management',
    department: 'Bộ phận Vận chuyển',
    yearsExperience: 7,
  },
  {
    id: 'emp-008',
    employeeCode: 'GE-SALES-001',
    nameEn: 'Nguyet Nguyen',
    nameVi: 'Nguyễn Minh Nguyệt',
    roleEn: 'Sales Manager',
    roleVi: 'Trưởng phòng Kinh doanh',
    titleEn: 'Head of Sales Department',
    titleVi: 'Trưởng phòng Kinh doanh',
    descriptionEn: 'Leading sales strategy and team to achieve revenue targets and expand market presence.',
    descriptionVi: 'Dẫn dắt chiến lược bán hàng và đội ngũ để đạt mục tiêu doanh thu và mở rộng thị trường.',
    avatar: '/Team/nguyet-nguyen.jpg',
    email: 'nguyet.nguyen@goldenenergy.vn',
    category: 'management',
    department: 'Phòng Kinh doanh',
    yearsExperience: 8,
  },
  {
    id: 'emp-009',
    employeeCode: 'GE-MKT-001',
    nameEn: 'Cristina Lu',
    nameVi: 'Lưu Thị Duyên',
    roleEn: 'Marketing Manager',
    roleVi: 'Trưởng bộ phận Marketing',
    titleEn: 'Head of Marketing Department',
    titleVi: 'Trưởng bộ phận Marketing',
    descriptionEn: 'Driving brand awareness and marketing initiatives to position Golden Energy as a market leader.',
    descriptionVi: 'Thúc đẩy nhận diện thương hiệu và các sáng kiến marketing để định vị Golden Energy là người dẫn đầu thị trường.',
    avatar: '/Team/cristina-lu.jpg',
    email: 'cristina.lu@goldenenergy.vn',
    category: 'management',
    department: 'Bộ phận Marketing',
    yearsExperience: 6,
  },

  // Engineering Team
  {
    id: 'emp-010',
    employeeCode: 'GE-ENG-001',
    nameEn: 'Giau Dao',
    nameVi: 'Đào Hữu Giàu',
    roleEn: 'Solar Engineer',
    roleVi: 'Kỹ sư',
    titleEn: 'Solar Systems Engineer',
    titleVi: 'Kỹ sư Hệ thống Điện mặt trời',
    descriptionEn: 'Specializing in solar panel installation and system optimization for residential and commercial projects.',
    descriptionVi: 'Chuyên về lắp đặt tấm pin mặt trời và tối ưu hóa hệ thống cho các dự án dân dụng và thương mại.',
    avatar: '/Team/giau-dao.jpg',
    email: 'giau.dao@goldenenergy.vn',
    category: 'engineering',
    department: 'Phòng Kỹ thuật',
    yearsExperience: 5,
  },
  {
    id: 'emp-011',
    employeeCode: 'GE-ENG-002',
    nameEn: 'Son Tran',
    nameVi: 'Trần Văn Sơn',
    roleEn: 'Solar Engineer',
    roleVi: 'Kỹ sư',
    titleEn: 'Solar Systems Engineer',
    titleVi: 'Kỹ sư Hệ thống Điện mặt trời',
    descriptionEn: 'Expert in electrical systems and grid integration for solar power installations.',
    descriptionVi: 'Chuyên gia về hệ thống điện và tích hợp lưới cho các công trình lắp đặt điện mặt trời.',
    avatar: '/Team/son-tran.jpg',
    email: 'son.tran@goldenenergy.vn',
    category: 'engineering',
    department: 'Phòng Kỹ thuật',
    yearsExperience: 4,
  },
  {
    id: 'emp-012',
    employeeCode: 'GE-ENG-003',
    nameEn: 'Duy Nguyen',
    nameVi: 'Nguyễn Minh Duy',
    roleEn: 'Solar Engineer',
    roleVi: 'Kỹ sư',
    titleEn: 'Solar Systems Engineer',
    titleVi: 'Kỹ sư Hệ thống Điện mặt trời',
    descriptionEn: 'Focused on system design and performance analysis for optimal energy output.',
    descriptionVi: 'Tập trung vào thiết kế hệ thống và phân tích hiệu suất để tối ưu công suất năng lượng.',
    avatar: '/Team/duy-nguyen.jpg',
    email: 'duy.nguyen@goldenenergy.vn',
    category: 'engineering',
    department: 'Phòng Kỹ thuật',
    yearsExperience: 3,
  },
];

// Helper functions
export function getTeamByCategory(category: TeamMember['category']) {
  return teamData.filter(member => member.category === category);
}

export function getLeadershipTeam() {
  return getTeamByCategory('leadership');
}

export function getManagementTeam() {
  return getTeamByCategory('management');
}

export function getEngineeringTeam() {
  return getTeamByCategory('engineering');
}

export function getSupportTeam() {
  return getTeamByCategory('support');
}

// Get name based on locale
export function getMemberName(member: TeamMember, locale: string): string {
  return locale === 'vi' ? member.nameVi : member.nameEn;
}

// Get role based on locale
export function getMemberRole(member: TeamMember, locale: string): string {
  return locale === 'vi' ? member.roleVi : member.roleEn;
}

// Get title based on locale
export function getMemberTitle(member: TeamMember, locale: string): string {
  return locale === 'vi' ? member.titleVi : member.titleEn;
}

// Get description based on locale
export function getMemberDescription(member: TeamMember, locale: string): string {
  return locale === 'vi' ? member.descriptionVi : member.descriptionEn;
}
