'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Tag,
  MoreHorizontal,
  Filter,
  Search,
  Circle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Hướng dẫn sử dụng
const helpGuide = {
  title: 'Hướng dẫn sử dụng trang Công việc',
  description: 'Trang này giúp bạn quản lý và theo dõi toàn bộ công việc của cá nhân và đội nhóm.',
  icons: [
    { icon: 'CheckSquare', meaning: 'Trang quản lý công việc' },
    { icon: 'Circle', meaning: 'Công việc chưa bắt đầu' },
    { icon: 'AlertCircle (vàng)', meaning: 'Công việc đang thực hiện' },
    { icon: 'CheckCircle2 (xanh)', meaning: 'Công việc đã hoàn thành' },
    { icon: 'Chấm đỏ', meaning: 'Độ ưu tiên Cao - Cần làm gấp' },
    { icon: 'Chấm vàng', meaning: 'Độ ưu tiên Trung bình' },
    { icon: 'Chấm xám', meaning: 'Độ ưu tiên Thấp' },
    { icon: 'Calendar', meaning: 'Hạn chót của công việc' },
    { icon: 'Tag', meaning: 'Nhãn/danh mục công việc' },
    { icon: 'Plus', meaning: 'Tạo công việc mới' },
    { icon: 'Filter', meaning: 'Lọc công việc' },
    { icon: 'Search', meaning: 'Tìm kiếm công việc' },
    { icon: 'MoreHorizontal', meaning: 'Thêm tùy chọn (sửa, xóa, chuyển trạng thái)' },
  ],
  sections: [
    {
      title: 'Thống kê tổng quan',
      content: 'Hiển thị số lượng công việc theo từng trạng thái: Chưa bắt đầu, Đang thực hiện, và Hoàn thành để nắm bắt tiến độ nhanh chóng.'
    },
    {
      title: 'Tạo công việc mới',
      content: 'Nhấn nút "Tạo công việc" để thêm task mới với thông tin: tiêu đề, mô tả, người phụ trách, hạn chót và độ ưu tiên.'
    },
    {
      title: 'Lọc và tìm kiếm',
      content: 'Sử dụng thanh tìm kiếm để tìm công việc theo tên. Các tab giúp lọc nhanh theo trạng thái của công việc.'
    },
    {
      title: 'Độ ưu tiên',
      content: 'Màu đỏ = Cao (cần làm gấp), Vàng = Trung bình, Xám = Thấp. Ưu tiên hoàn thành các task màu đỏ trước.'
    },
    {
      title: 'Quản lý trạng thái',
      content: 'Nhấn vào task để xem chi tiết. Sử dụng menu "..." để đổi trạng thái, chỉnh sửa hoặc xóa công việc.'
    }
  ]
};

// Mock tasks data
const mockTasks = [
  {
    id: '1',
    title: 'Hoàn thành báo cáo Q4',
    description: 'Tổng hợp và trình bày báo cáo kinh doanh quý 4',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2025-12-20',
    assignee: { name: 'Hà Hoàng Hà', initials: 'HH' },
    project: 'Báo cáo',
    tags: ['urgent', 'report'],
  },
  {
    id: '2',
    title: 'Liên hệ khách hàng ABC Corp',
    description: 'Gửi báo giá và thương thảo hợp đồng',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-12-18',
    assignee: { name: 'Rita Kim Anh', initials: 'RK' },
    project: 'CRM',
    tags: ['sales', 'client'],
  },
  {
    id: '3',
    title: 'Cập nhật hệ thống ERP',
    description: 'Thêm tính năng mới cho module HR',
    status: 'in_progress',
    priority: 'medium',
    dueDate: '2025-12-25',
    assignee: { name: 'Vũ Hoàng Phúc', initials: 'VP' },
    project: 'IT',
    tags: ['development'],
  },
  {
    id: '4',
    title: 'Kiểm tra tồn kho',
    description: 'Kiểm kê hàng tồn kho cuối tháng',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-12-31',
    assignee: { name: 'Nguyễn Thị Lan', initials: 'NL' },
    project: 'Kho',
    tags: ['inventory'],
  },
  {
    id: '5',
    title: 'Hoàn thành dự án Solar Farm',
    description: 'Nghiệm thu và bàn giao dự án',
    status: 'completed',
    priority: 'high',
    dueDate: '2025-12-15',
    assignee: { name: 'Hà Hoàng Hà', initials: 'HH' },
    project: 'Dự án',
    tags: ['project', 'solar'],
  },
];

const statusConfig = {
  todo: { label: 'Chưa bắt đầu', color: 'bg-gray-100 text-gray-700', icon: Circle },
  in_progress: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

const priorityConfig = {
  high: { label: 'Cao', color: 'bg-red-100 text-red-700' },
  medium: { label: 'Trung bình', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Thấp', color: 'bg-gray-100 text-gray-600' },
};

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showHelp, setShowHelp] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tasks, setTasks] = useState(mockTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  // Load tasks from API
  React.useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/erp/tasks');
      if (response.ok) {
        const data = await response.json();
        // Transform API data to match UI format
        const transformedTasks = data.map((task: any) => ({
          id: task.id.toString(),
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate || '',
          assignee: { name: 'Unknown', initials: 'U' },
          project: 'General',
          tags: task.tags || [],
        }));
        setTasks([...mockTasks, ...transformedTasks]);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === activeTab);

  const taskCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
  };

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Công việc</h1>
            <p className="text-gray-600 mt-1">Quản lý và theo dõi công việc hàng ngày</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowHelp(true)}
            className="text-gray-500 hover:text-[#D4AF37]"
            title="Xem hướng dẫn sử dụng"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </div>
        <Button className="bg-[#D4AF37] hover:bg-[#B8960A] text-white" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo công việc
        </Button>
      </div>

      {/* Help Guide */}
      {showHelp && (
        <Card className="bg-gradient-to-br from-amber-50 to-white border-[#D4AF37]/30">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#D4AF37]" />
                <CardTitle className="text-lg text-gray-900">{helpGuide.title}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowHelp(false)}
                className="text-gray-500 hover:text-gray-700 -mt-2 -mr-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <CardDescription>{helpGuide.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Icons explanation */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-500" />
                Ý nghĩa các biểu tượng (Icons)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {helpGuide.icons.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <span className="font-mono bg-white px-1.5 py-0.5 rounded text-blue-600 border">{item.icon}</span>
                    <span className="text-gray-600">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sections */}
            <div className="grid gap-3 sm:grid-cols-2">
              {helpGuide.sections.map((section, index) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-gray-100">
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{section.title}</h4>
                  <p className="text-xs text-gray-600">{section.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng công việc</p>
                <p className="text-2xl font-bold text-gray-900">{taskCounts.all}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Chưa bắt đầu</p>
                <p className="text-2xl font-bold text-gray-900">{taskCounts.todo}</p>
              </div>
              <Circle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đang thực hiện</p>
                <p className="text-2xl font-bold text-blue-600">{taskCounts.in_progress}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{taskCounts.completed}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Tìm kiếm công việc..." 
            className="pl-10 bg-white border-gray-200"
          />
        </div>
        <Button variant="outline" className="border-gray-200">
          <Filter className="w-4 h-4 mr-2" />
          Bộ lọc
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="all">Tất cả ({taskCounts.all})</TabsTrigger>
          <TabsTrigger value="todo">Chưa bắt đầu ({taskCounts.todo})</TabsTrigger>
          <TabsTrigger value="in_progress">Đang làm ({taskCounts.in_progress})</TabsTrigger>
          <TabsTrigger value="completed">Hoàn thành ({taskCounts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const StatusIcon = statusConfig[task.status as keyof typeof statusConfig].icon;
                  return (
                    <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <button className="mt-1">
                          <StatusIcon className={`w-5 h-5 ${
                            task.status === 'completed' ? 'text-green-500' : 
                            task.status === 'in_progress' ? 'text-blue-500' : 'text-gray-400'
                          }`} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${
                              task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </h3>
                            <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig].color}>
                              {priorityConfig[task.priority as keyof typeof priorityConfig].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {task.dueDate}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tag className="w-4 h-4" />
                              {task.project}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                              {task.assignee.initials}
                            </AvatarFallback>
                          </Avatar>
                          <Button variant="ghost" size="icon" className="text-gray-400">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tạo công việc mới</CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nhập tiêu đề công việc"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  placeholder="Nhập mô tả chi tiết"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 min-h-[100px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Độ ưu tiên
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn chót
                  </label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-[#D4AF37] hover:bg-[#B8960A] text-white"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (!newTask.title) {
                      alert('Vui lòng nhập tiêu đề công việc');
                      return;
                    }

                    setIsSubmitting(true);
                    try {
                      const response = await fetch('/api/erp/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          title: newTask.title,
                          description: newTask.description,
                          priority: newTask.priority,
                          dueDate: newTask.dueDate || null,
                        }),
                      });

                      if (!response.ok) {
                        throw new Error('Failed to create task');
                      }

                      alert('✅ Tạo công việc thành công!');
                      setShowCreateModal(false);
                      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
                      
                      // Reload tasks
                      await loadTasks();
                    } catch (error) {
                      console.error('Error creating task:', error);
                      alert('❌ Có lỗi xảy ra khi tạo công việc');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Đang tạo...' : 'Tạo công việc'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
