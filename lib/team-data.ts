export interface TeamMember {
  id: string;
  name: string;
  role: string;
  title: string;
  description: string;
  avatar: string;
  linkedin?: string;
  email?: string;
  category: 'leadership' | 'r&d' | 'support';
  certifications?: string[];
  yearsExperience?: number;
}

export const teamData: TeamMember[] = [
  // Leadership Team
  {
    id: 'ceo-001',
    name: 'Nguyễn Minh Tuấn',
    role: 'CEO & Founder',
    title: 'Chief Executive Officer & Founder',
    description: 'Visionary leader with 15+ years in renewable energy sector, driving innovation in solar & wind power solutions across Southeast Asian markets. Pioneer in smart energy management systems integration.',
    avatar: '/images/team/ceo.jpg',
    linkedin: '#',
    email: 'tuan@goldenenergy.vn',
    category: 'leadership',
    yearsExperience: 15,
  },
  {
    id: 'cto-001',
    name: 'Trần Đức Anh',
    role: 'CTO',
    title: 'Chief Technology Officer',
    description: 'Leading R&D initiatives in advanced photovoltaic systems and IoT-enabled energy monitoring. Expert in grid integration and power optimization algorithms with 12+ years experience.',
    avatar: '/images/team/cto.jpg',
    linkedin: '#',
    email: 'anh@goldenenergy.vn',
    category: 'leadership',
    yearsExperience: 12,
  },

  // R&D Team
  {
    id: 'rd-001',
    name: 'Phạm Quang Huy',
    role: 'Senior Solar Engineer',
    title: 'Senior Solar Systems Engineer',
    description: 'Specializes in high-efficiency solar panel design and performance optimization. Led 50+ commercial installations with average 23% efficiency improvement. Certified by TÜV SÜD & IEC standards.',
    avatar: '/images/team/solar-engineer.jpg',
    linkedin: '#',
    email: 'huy@goldenenergy.vn',
    category: 'r&d',
    certifications: ['TÜV SÜD', 'IEC 61215'],
    yearsExperience: 10,
  },
  {
    id: 'rd-002',
    name: 'Lê Thị Mai',
    role: 'Energy Storage Lead',
    title: 'Energy Storage & Battery Systems Lead',
    description: 'Expert in lithium-ion and emerging battery technologies. Develops intelligent BMS solutions for optimal charge cycles and extended system lifespan. 8 years in energy storage R&D.',
    avatar: '/images/team/battery-specialist.jpg',
    linkedin: '#',
    email: 'mai@goldenenergy.vn',
    category: 'r&d',
    certifications: ['IEEE Member', 'Battery Safety Certified'],
    yearsExperience: 8,
  },
  {
    id: 'rd-003',
    name: 'Hoàng Văn Nam',
    role: 'Power Electronics Engineer',
    title: 'Senior Power Electronics & Inverter Engineer',
    description: 'Designs next-generation inverters with 98.5%+ efficiency ratings. Specializes in MPPT algorithms and grid-tie systems. Hold 3 patents in power conversion technology.',
    avatar: '/images/team/power-engineer.jpg',
    linkedin: '#',
    email: 'nam@goldenenergy.vn',
    category: 'r&d',
    certifications: ['IEEE Power Electronics Society', '3 Patents'],
    yearsExperience: 11,
  },
  {
    id: 'rd-004',
    name: 'Vũ Thị Lan',
    role: 'IoT Engineer',
    title: 'IoT Integration & Smart Energy Engineer',
    description: 'Develops cloud-connected energy monitoring platforms with real-time analytics. Expert in predictive maintenance AI and remote diagnostics. 7 years in smart grid technology.',
    avatar: '/images/team/iot-engineer.jpg',
    linkedin: '#',
    email: 'lan@goldenenergy.vn',
    category: 'r&d',
    certifications: ['AWS Certified IoT', 'Azure IoT Developer'],
    yearsExperience: 7,
  },
  {
    id: 'rd-005',
    name: 'Đỗ Minh Khoa',
    role: 'Wind Energy Specialist',
    title: 'Wind Power Systems Engineer',
    description: 'Specializes in small to medium-scale wind turbine design and site assessment. Expert in wind resource analysis and hybrid solar-wind systems. 10+ successful projects delivered.',
    avatar: '/images/team/wind-engineer.jpg',
    linkedin: '#',
    email: 'khoa@goldenenergy.vn',
    category: 'r&d',
    certifications: ['Wind Energy Professional', 'Hybrid Systems Expert'],
    yearsExperience: 10,
  },

  // Support Team
  {
    id: 'support-001',
    name: 'Ngô Thị Hương',
    role: 'Technical Support Manager',
    title: 'Technical Support & Customer Success Manager',
    description: 'Leads nationwide technical support operations with 24/7 response capability. Expert in system troubleshooting and preventive maintenance protocols. 99.2% customer satisfaction rating.',
    avatar: '/images/team/support-manager.jpg',
    linkedin: '#',
    email: 'huong@goldenenergy.vn',
    category: 'support',
    certifications: ['Customer Success Professional', 'Technical Support Certified'],
    yearsExperience: 6,
  },
];

// Helper functions
export function getTeamByCategory(category: TeamMember['category']) {
  return teamData.filter(member => member.category === category);
}

export function getLeadershipTeam() {
  return getTeamByCategory('leadership');
}

export function getRDTeam() {
  return getTeamByCategory('r&d');
}

export function getSupportTeam() {
  return getTeamByCategory('support');
}
