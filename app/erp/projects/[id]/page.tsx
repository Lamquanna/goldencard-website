'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock,
  Camera, FileText, MessageSquare, Plus, Edit2, Trash2,
  CheckCircle2, Circle, AlertTriangle, TrendingUp, Download,
  Image as ImageIcon, Upload, Send, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  progress: number;
  weight: number; // % of total project
}

interface PhotoUpdate {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  category: 'progress' | 'issue' | 'completion' | 'general';
  uploadedBy: string;
  uploadedAt: Date;
  location?: string;
}

interface PlanTask {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
  completedBy?: string;
}

interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  summary: string;
  achievements: string[];
  issues: string[];
  nextWeekPlan: string[];
  progressPercent: number;
  createdBy: string;
  createdAt: Date;
  attachments?: string[];
  // New fields for check/lock logic
  planTasks: PlanTask[]; // Tasks from the plan
  isLocked: boolean; // Lock report after approval
  lockedAt?: Date;
  lockedBy?: string;
  status: 'draft' | 'submitted' | 'approved' | 'locked';
}

interface ProjectComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: Date;
  parentId?: string;
}

// Mock Data
const mockProject = {
  id: 'proj-001',
  project_code: 'GE-2024-001',
  name: 'Solar Farm Bình Thuận 50MW',
  description: 'Dự án điện mặt trời công suất 50MW tại Bình Thuận',
  category: 'solar_farm',
  status: 'in_progress',
  priority: 'high',
  client_name: 'Tập đoàn EVN',
  client_contact: 'Ông Nguyễn Văn A',
  client_phone: '0912345678',
  client_email: 'evn@example.com',
  location_address: 'Xã Sông Bình, Huyện Bắc Bình, Bình Thuận',
  capacity_kw: 50000,
  budget: 1200000000000,
  spent_amount: 450000000000,
  start_date: '2024-01-15',
  expected_end_date: '2024-12-31',
  progress_percent: 38,
  team_lead_name: 'Trần Minh Quân',
};

const mockMilestones: Milestone[] = [
  {
    id: 'm1',
    name: 'Khảo sát và thiết kế',
    description: 'Khảo sát hiện trường, thiết kế hệ thống',
    dueDate: '2024-02-28',
    completedDate: '2024-02-25',
    status: 'completed',
    progress: 100,
    weight: 10,
  },
  {
    id: 'm2',
    name: 'Giấy phép và phê duyệt',
    description: 'Xin giấy phép xây dựng, phê duyệt thiết kế',
    dueDate: '2024-03-31',
    completedDate: '2024-04-05',
    status: 'completed',
    progress: 100,
    weight: 10,
  },
  {
    id: 'm3',
    name: 'Chuẩn bị mặt bằng',
    description: 'San lấp, đào móng, đổ bê tông',
    dueDate: '2024-05-31',
    status: 'in_progress',
    progress: 75,
    weight: 15,
  },
  {
    id: 'm4',
    name: 'Lắp đặt khung và panel',
    description: 'Lắp đặt khung giá đỡ, lắp đặt panel solar',
    dueDate: '2024-08-31',
    status: 'pending',
    progress: 0,
    weight: 30,
  },
  {
    id: 'm5',
    name: 'Hệ thống điện và inverter',
    description: 'Lắp đặt hệ thống dây điện, inverter',
    dueDate: '2024-10-31',
    status: 'pending',
    progress: 0,
    weight: 20,
  },
  {
    id: 'm6',
    name: 'Kiểm tra và nghiệm thu',
    description: 'Chạy thử, kiểm tra hệ thống, nghiệm thu',
    dueDate: '2024-11-30',
    status: 'pending',
    progress: 0,
    weight: 10,
  },
  {
    id: 'm7',
    name: 'Vận hành thương mại',
    description: 'Đấu nối lưới điện, bàn giao cho khách hàng',
    dueDate: '2024-12-31',
    status: 'pending',
    progress: 0,
    weight: 5,
  },
];

const mockPhotos: PhotoUpdate[] = [
  {
    id: 'p1',
    url: '/Projects/project-1.jpg',
    thumbnail: '/Projects/project-1.jpg',
    caption: 'Khảo sát mặt bằng ngày 15/01/2024',
    category: 'progress',
    uploadedBy: 'Trần Minh Quân',
    uploadedAt: new Date('2024-01-15'),
    location: 'Khu vực A1',
  },
  {
    id: 'p2',
    url: '/Projects/project-2.jpg',
    thumbnail: '/Projects/project-2.jpg',
    caption: 'San lấp mặt bằng hoàn thành 50%',
    category: 'progress',
    uploadedBy: 'Nguyễn Văn B',
    uploadedAt: new Date('2024-04-20'),
    location: 'Khu vực B2',
  },
  {
    id: 'p3',
    url: '/Projects/project-3.jpg',
    thumbnail: '/Projects/project-3.jpg',
    caption: 'Đổ bê tông móng hàng rào',
    category: 'progress',
    uploadedBy: 'Lê Văn C',
    uploadedAt: new Date('2024-05-10'),
    location: 'Ranh giới dự án',
  },
  {
    id: 'p4',
    url: '/Projects/project-4.jpg',
    thumbnail: '/Projects/project-4.jpg',
    caption: 'Vấn đề thoát nước sau mưa lớn',
    category: 'issue',
    uploadedBy: 'Trần Minh Quân',
    uploadedAt: new Date('2024-05-25'),
    location: 'Khu vực C3',
  },
];

const mockReports: WeeklyReport[] = [
  {
    id: 'r1',
    weekNumber: 24,
    year: 2024,
    startDate: '2024-06-10',
    endDate: '2024-06-16',
    summary: 'Tiếp tục san lấp mặt bằng khu vực B, hoàn thành 75% khối lượng. Gặp mưa lớn 2 ngày nên tiến độ chậm.',
    achievements: [
      'San lấp khu vực B2 hoàn thành',
      'Đổ bê tông móng tường rào phía Nam',
      'Nhận vật tư đợt 2 (thép, cement)',
    ],
    issues: [
      'Mưa lớn ngày 12-13/6 gây ngập úng',
      'Thiếu nhân công lái máy xúc',
    ],
    nextWeekPlan: [
      'Hoàn thành san lấp khu vực B3',
      'Bắt đầu đổ bê tông móng khung giá đỡ',
      'Thuê thêm máy xúc từ nhà thầu khác',
    ],
    planTasks: [
      { id: 'pt1', title: 'San lấp khu vực B2', completed: true, completedAt: new Date('2024-06-14'), completedBy: 'Nguyễn Văn B' },
      { id: 'pt2', title: 'Đổ bê tông móng tường rào phía Nam', completed: true, completedAt: new Date('2024-06-15'), completedBy: 'Lê Văn C' },
      { id: 'pt3', title: 'Nhận vật tư đợt 2', completed: true, completedAt: new Date('2024-06-13'), completedBy: 'Trần Minh Quân' },
      { id: 'pt4', title: 'Hoàn thành san lấp khu vực B3', completed: false },
    ],
    progressPercent: 38,
    createdBy: 'Trần Minh Quân',
    createdAt: new Date('2024-06-16'),
    status: 'submitted',
    isLocked: false,
  },
  {
    id: 'r2',
    weekNumber: 23,
    year: 2024,
    startDate: '2024-06-03',
    endDate: '2024-06-09',
    summary: 'San lấp mặt bằng khu vực A và B. Tiến độ đạt theo kế hoạch.',
    achievements: [
      'San lấp khu vực A hoàn thành 100%',
      'San lấp khu vực B1 hoàn thành',
      'Nghiệm thu phần san lấp khu A',
    ],
    issues: [
      'Chờ phê duyệt thiết kế móng chi tiết',
    ],
    nextWeekPlan: [
      'Tiếp tục san lấp khu B2, B3',
      'Chuẩn bị vật tư đổ bê tông',
    ],
    planTasks: [
      { id: 'pt5', title: 'San lấp khu vực A', completed: true, completedAt: new Date('2024-06-05'), completedBy: 'Nguyễn Văn B' },
      { id: 'pt6', title: 'San lấp khu vực B1', completed: true, completedAt: new Date('2024-06-08'), completedBy: 'Nguyễn Văn B' },
      { id: 'pt7', title: 'Nghiệm thu phần san lấp khu A', completed: true, completedAt: new Date('2024-06-09'), completedBy: 'Trần Minh Quân' },
    ],
    progressPercent: 35,
    createdBy: 'Trần Minh Quân',
    createdAt: new Date('2024-06-09'),
    status: 'locked',
    isLocked: true,
    lockedAt: new Date('2024-06-10'),
    lockedBy: 'Admin User',
  },
];

const mockComments: ProjectComment[] = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'Admin User',
    content: 'Cần chú ý tiến độ san lấp, tránh để mưa ảnh hưởng nhiều.',
    createdAt: new Date('2024-06-15'),
  },
  {
    id: 'c2',
    userId: 'u2',
    userName: 'Trần Minh Quân',
    content: 'Đã thuê thêm 2 máy xúc để tăng tốc. Dự kiến hoàn thành san lấp trong tuần này.',
    createdAt: new Date('2024-06-16'),
    parentId: 'c1',
  },
];

// Components
function MilestoneTimeline({ milestones, onToggleComplete }: { 
  milestones: Milestone[]; 
  onToggleComplete?: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'overdue': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  // Check if previous milestone is completed (for step-by-step logic)
  const canStartMilestone = (index: number) => {
    if (index === 0) return true;
    const prevMilestone = milestones[index - 1];
    return prevMilestone.status === 'completed';
  };

  // Check if milestone can be marked complete
  const canCompleteMilestone = (milestone: Milestone, index: number) => {
    // Must be in_progress or have previous step completed
    if (milestone.status === 'completed') return false;
    if (!canStartMilestone(index)) return false;
    return milestone.status === 'in_progress' || (milestone.status === 'pending' && canStartMilestone(index));
  };

  // Calculate overall progress
  const overallProgress = milestones.reduce((sum, m) => {
    if (m.status === 'completed') return sum + m.weight;
    if (m.status === 'in_progress') return sum + (m.weight * m.progress / 100);
    return sum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Overall Progress Bar */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Tiến độ tổng thể</h4>
          <span className="text-2xl font-bold text-blue-600">{overallProgress.toFixed(0)}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{milestones.filter(m => m.status === 'completed').length}/{milestones.length} bước hoàn thành</span>
          <span>Còn {milestones.filter(m => m.status === 'pending').length} bước chưa bắt đầu</span>
        </div>
      </div>

      {/* Step Progress Indicator */}
      <div className="bg-white rounded-xl border p-4 overflow-x-auto">
        <div className="flex items-center justify-between min-w-max gap-2">
          {milestones.map((milestone, index) => {
            const isActive = milestone.status === 'in_progress';
            const isCompleted = milestone.status === 'completed';
            const isLocked = !canStartMilestone(index) && milestone.status === 'pending';
            
            return (
              <div key={milestone.id} className="flex items-center">
                <div 
                  className={`relative flex flex-col items-center cursor-pointer transition-all ${
                    isLocked ? 'opacity-40' : ''
                  }`}
                  onMouseEnter={() => setHoveredId(milestone.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Step Circle */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-500 text-white ring-4 ring-blue-100' : ''}
                    ${!isCompleted && !isActive ? 'bg-gray-200 text-gray-500' : ''}
                    ${isLocked ? 'bg-gray-100 text-gray-400' : ''}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  
                  {/* Step Label */}
                  <span className={`
                    mt-2 text-xs font-medium text-center max-w-[80px] line-clamp-2
                    ${isCompleted ? 'text-green-600' : ''}
                    ${isActive ? 'text-blue-600' : ''}
                    ${!isCompleted && !isActive ? 'text-gray-500' : ''}
                  `}>
                    {milestone.name}
                  </span>

                  {/* Hover tooltip */}
                  {hoveredId === milestone.id && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-gray-300 mt-1">{milestone.description}</p>
                      <p className="text-gray-400 mt-1">Hạn: {milestone.dueDate}</p>
                      {isLocked && (
                        <p className="text-amber-400 mt-1">⚠️ Hoàn thành bước trước để mở khóa</p>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Connector Line */}
                {index < milestones.length - 1 && (
                  <div className={`w-8 h-1 mx-1 rounded ${
                    isCompleted ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Milestone Cards */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => {
          const isLocked = !canStartMilestone(index) && milestone.status === 'pending';
          const showCompleteButton = canCompleteMilestone(milestone, index);
          
          return (
            <div key={milestone.id} className="relative">
              {index < milestones.length - 1 && (
                <div className={`absolute left-[11px] top-10 w-0.5 h-full -ml-px ${
                  milestone.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                }`} />
              )}
              
              <div className={`flex gap-4 ${isLocked ? 'opacity-50' : ''}`}>
                <div className="relative z-10">
                  <div className={`w-6 h-6 rounded-full ${getStatusColor(milestone.status)} flex items-center justify-center`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : milestone.status === 'in_progress' ? (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    ) : isLocked ? (
                      <span className="text-white text-xs">🔒</span>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex-1 pb-8">
                  <div className={`bg-white rounded-xl border p-4 transition-shadow ${
                    isLocked ? 'border-dashed' : 'hover:shadow-md'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm text-gray-400 font-medium">Bước {index + 1}</span>
                          <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-700' :
                            milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            milestone.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {milestone.weight}% tổng dự án
                          </span>
                          {isLocked && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              🔒 Chờ bước trước
                            </span>
                          )}
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-sm text-gray-500">
                          {milestone.completedDate ? (
                            <span className="text-green-600">Hoàn thành: {milestone.completedDate}</span>
                          ) : (
                            <span>Hạn: {milestone.dueDate}</span>
                          )}
                        </div>
                        {showCompleteButton && onToggleComplete && (
                          <button
                            onClick={() => onToggleComplete(milestone.id)}
                            className="px-3 py-1 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          >
                            ✓ Đánh dấu hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {milestone.status === 'in_progress' && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-500">Tiến độ</span>
                          <span className="font-medium">{milestone.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                            style={{ width: `${milestone.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PhotoGallery({ photos }: { photos: PhotoUpdate[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoUpdate | null>(null);
  const [filter, setFilter] = useState<'all' | 'progress' | 'issue' | 'completion'>('all');

  const filteredPhotos = filter === 'all' 
    ? photos 
    : photos.filter(p => p.category === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'progress': return 'bg-blue-100 text-blue-700';
      case 'issue': return 'bg-red-100 text-red-700';
      case 'completion': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'progress': return 'Tiến độ';
      case 'issue': return 'Vấn đề';
      case 'completion': return 'Hoàn thành';
      default: return 'Chung';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter('progress')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tiến độ
        </button>
        <button
          onClick={() => setFilter('issue')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'issue' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Vấn đề
        </button>
        <button
          onClick={() => setFilter('completion')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            filter === 'completion' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Hoàn thành
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            layoutId={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
          >
            <img
              src={photo.thumbnail}
              alt={photo.caption}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(photo.category)}`}>
                {getCategoryLabel(photo.category)}
              </span>
              <p className="text-sm mt-1 line-clamp-2">{photo.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              layoutId={selectedPhoto.id}
              className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 min-h-0">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 border-t">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(selectedPhoto.category)}`}>
                      {getCategoryLabel(selectedPhoto.category)}
                    </span>
                    <p className="text-gray-900 font-medium mt-2">{selectedPhoto.caption}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedPhoto.uploadedBy} · {selectedPhoto.uploadedAt.toLocaleDateString('vi-VN')}
                      {selectedPhoto.location && ` · ${selectedPhoto.location}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WeeklyReportList({ reports }: { reports: WeeklyReport[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(reports[0]?.id);
  const [localReports, setLocalReports] = useState(reports);

  // Handle task check/uncheck
  const handleTaskToggle = (reportId: string, taskId: string) => {
    setLocalReports(prev => prev.map(report => {
      if (report.id === reportId && !report.isLocked) {
        return {
          ...report,
          planTasks: report.planTasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                completed: !task.completed,
                completedAt: !task.completed ? new Date() : undefined,
                completedBy: !task.completed ? 'Bạn' : undefined,
              };
            }
            return task;
          }),
        };
      }
      return report;
    }));
  };

  // Handle lock report
  const handleLockReport = (reportId: string) => {
    const report = localReports.find(r => r.id === reportId);
    if (!report) return;
    
    const allTasksCompleted = report.planTasks.every(t => t.completed);
    if (!allTasksCompleted) {
      alert('Vui lòng hoàn thành tất cả các task trước khi khóa báo cáo!');
      return;
    }

    if (confirm('Sau khi khóa báo cáo sẽ không thể chỉnh sửa. Bạn có chắc chắn?')) {
      setLocalReports(prev => prev.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            isLocked: true,
            lockedAt: new Date(),
            lockedBy: 'Bạn',
            status: 'locked',
          };
        }
        return report;
      }));
    }
  };

  const getStatusBadge = (status: WeeklyReport['status']) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Nháp</span>;
      case 'submitted':
        return <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">Đã gửi</span>;
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Đã duyệt</span>;
      case 'locked':
        return <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full flex items-center gap-1">
          <Lock className="w-3 h-3" /> Đã khóa
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {localReports.map((report) => {
        const completedTasks = report.planTasks.filter(t => t.completed).length;
        const totalTasks = report.planTasks.length;
        const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return (
          <div key={report.id} className={`bg-white rounded-xl border overflow-hidden ${
            report.isLocked ? 'border-purple-200' : ''
          }`}>
            <button
              onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  report.isLocked ? 'bg-purple-100' : 'bg-yellow-100'
                }`}>
                  {report.isLocked ? (
                    <Lock className="w-5 h-5 text-purple-600" />
                  ) : (
                    <span className="text-yellow-700 font-bold text-lg">W{report.weekNumber}</span>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">Tuần {report.weekNumber}/{report.year}</h4>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-gray-500">{report.startDate} - {report.endDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-sm text-gray-500">Tiến độ</span>
                  <p className="font-bold text-yellow-600">{report.progressPercent}%</p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Tasks</span>
                  <p className="font-bold text-blue-600">{completedTasks}/{totalTasks}</p>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                  expandedId === report.id ? 'rotate-180' : ''
                }`} />
              </div>
            </button>

            <AnimatePresence>
              {expandedId === report.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t"
                >
                  <div className="p-4 space-y-4">
                    {/* Plan Tasks Checklist */}
                    <div className={`rounded-xl p-4 ${report.isLocked ? 'bg-purple-50' : 'bg-amber-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className={`font-medium flex items-center gap-2 ${
                          report.isLocked ? 'text-purple-700' : 'text-amber-700'
                        }`}>
                          <FileText className="w-4 h-4" />
                          Checklist kế hoạch tuần
                        </h5>
                        <span className={`text-sm font-medium ${
                          taskProgress === 100 ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          {taskProgress.toFixed(0)}% hoàn thành
                        </span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            taskProgress === 100 ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>

                      {/* Task list */}
                      <div className="space-y-2">
                        {report.planTasks.map((task, idx) => (
                          <div 
                            key={task.id}
                            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                              task.completed ? 'bg-green-100/50' : 'bg-white'
                            }`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskToggle(report.id, task.id);
                              }}
                              disabled={report.isLocked}
                              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : report.isLocked 
                                    ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                                    : 'border-gray-300 hover:border-green-500'
                              }`}
                            >
                              {task.completed && <CheckCircle2 className="w-4 h-4" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${
                                task.completed ? 'text-gray-500 line-through' : 'text-gray-800'
                              }`}>
                                <span className="font-medium text-gray-400 mr-2">{idx + 1}.</span>
                                {task.title}
                              </p>
                              {task.completed && task.completedBy && (
                                <p className="text-xs text-gray-400">
                                  ✓ {task.completedBy} · {task.completedAt?.toLocaleDateString('vi-VN')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Tóm tắt</h5>
                      <p className="text-gray-600">{report.summary}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <h5 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4" />
                          Hoàn thành
                        </h5>
                        <ul className="space-y-1">
                          {report.achievements.map((item, i) => (
                            <li key={i} className="text-sm text-green-600 flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-red-50 rounded-xl p-4">
                        <h5 className="font-medium text-red-700 flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          Vấn đề
                        </h5>
                        <ul className="space-y-1">
                          {report.issues.map((item, i) => (
                            <li key={i} className="text-sm text-red-600 flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-4">
                      <h5 className="font-medium text-blue-700 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4" />
                        Kế hoạch tuần tới
                      </h5>
                      <ul className="space-y-1">
                        {report.nextWeekPlan.map((item, i) => (
                          <li key={i} className="text-sm text-blue-600 flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="text-sm text-gray-500">
                          Tạo bởi {report.createdBy} · {report.createdAt.toLocaleDateString('vi-VN')}
                        </p>
                        {report.isLocked && report.lockedAt && (
                          <p className="text-xs text-purple-500">
                            🔒 Khóa bởi {report.lockedBy} · {report.lockedAt.toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 text-sm text-yellow-600 hover:text-yellow-700 px-3 py-1.5 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                          Tải báo cáo
                        </button>
                        {!report.isLocked && taskProgress === 100 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLockReport(report.id);
                            }}
                            className="flex items-center gap-2 text-sm text-white bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <Lock className="w-4 h-4" />
                            Khóa báo cáo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// Import ChevronDown, Lock for reports
import { ChevronDown, Lock } from 'lucide-react';

// Main Page
export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'photos' | 'reports' | 'discussion'>('overview');
  const [newComment, setNewComment] = useState('');

  const project = mockProject;
  const milestones = mockMilestones;
  const photos = mockPhotos;
  const reports = mockReports;
  const comments = mockComments;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)} tỷ đồng`;
    }
    return amount.toLocaleString('vi-VN') + ' VND';
  };

  const overallProgress = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (m.progress * m.weight / 100), 0);
  }, [milestones]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{project.project_code}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                  project.status === 'completed' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {project.status === 'in_progress' ? 'Đang thực hiện' : project.status}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Địa điểm</p>
                <p className="font-medium text-gray-900 text-sm line-clamp-1">{project.location_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ngân sách</p>
                <p className="font-medium text-gray-900 text-sm">{formatCurrency(project.budget)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dự kiến hoàn thành</p>
                <p className="font-medium text-gray-900 text-sm">{project.expected_end_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Quản lý dự án</p>
                <p className="font-medium text-gray-900 text-sm">{project.team_lead_name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b -mb-px">
            {[
              { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
              { id: 'milestones', label: 'Mốc tiến độ', icon: CheckCircle2 },
              { id: 'photos', label: 'Hình ảnh', icon: Camera },
              { id: 'reports', label: 'Báo cáo tuần', icon: FileText },
              { id: 'discussion', label: 'Thảo luận', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tiến độ tổng thể</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">Hoàn thành</span>
                      <span className="text-2xl font-bold text-yellow-600">{Math.round(overallProgress)}%</span>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                        style={{ width: `${overallProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {milestones.filter(m => m.status === 'completed').length}
                    </p>
                    <p className="text-sm text-gray-500">Hoàn thành</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {milestones.filter(m => m.status === 'in_progress').length}
                    </p>
                    <p className="text-sm text-gray-500">Đang thực hiện</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-400">
                      {milestones.filter(m => m.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-500">Chưa bắt đầu</p>
                  </div>
                </div>
              </div>

              {/* Recent Photos */}
              <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Hình ảnh gần đây</h3>
                  <button 
                    onClick={() => setActiveTab('photos')}
                    className="text-sm text-yellow-600 hover:text-yellow-700"
                  >
                    Xem tất cả
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {photos.slice(0, 4).map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={photo.thumbnail}
                        alt={photo.caption}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Budget */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ngân sách</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Tổng ngân sách</span>
                    <span className="font-semibold">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Đã chi</span>
                    <span className="font-semibold text-red-600">{formatCurrency(project.spent_amount)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-400 rounded-full"
                      style={{ width: `${(project.spent_amount / project.budget) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-gray-500">Còn lại</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(project.budget - project.spent_amount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="bg-white rounded-xl border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Công ty</p>
                    <p className="font-medium">{project.client_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Người liên hệ</p>
                    <p className="font-medium">{project.client_contact}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Điện thoại</p>
                    <p className="font-medium">{project.client_phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{project.client_email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Mốc tiến độ dự án</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm mốc
              </button>
            </div>
            <MilestoneTimeline milestones={milestones} />
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Hình ảnh dự án</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                <Upload className="w-4 h-4" />
                Tải ảnh lên
              </button>
            </div>
            <PhotoGallery photos={photos} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Báo cáo tuần</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                <Plus className="w-4 h-4" />
                Tạo báo cáo
              </button>
            </div>
            <WeeklyReportList reports={reports} />
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Thảo luận dự án</h3>
            
            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="text-yellow-700 font-medium">A</span>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                    <Send className="w-4 h-4" />
                    Gửi
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className={`flex gap-3 ${comment.parentId ? 'ml-12' : ''}`}>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-medium">{comment.userName.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{comment.userName}</span>
                        <span className="text-xs text-gray-400">
                          {comment.createdAt.toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <button className="hover:text-yellow-600">Trả lời</button>
                      <button className="hover:text-yellow-600">Thích</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
