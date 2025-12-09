// ============================================================================
// PROJECTS MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

'use client';

import { useState } from 'react';

// Mock data
const INITIAL_PROJECTS = [
  { id: 1, name: 'Điện mặt trời Nhà máy ABC', capacity: '5MW', status: 'Đang thực hiện', progress: 75, deadline: '30/03/2024', manager: 'Nguyễn Văn A' },
  { id: 2, name: 'Solar Rooftop Công ty XYZ', capacity: '500kW', status: 'Hoàn thành', progress: 100, deadline: '15/01/2024', manager: 'Trần Thị B' },
  { id: 3, name: 'Trang trại năng lượng 123', capacity: '10MW', status: 'Đang thực hiện', progress: 45, deadline: '30/06/2024', manager: 'Lê Văn C' },
  { id: 4, name: 'Điện mặt trời áp mái DEF', capacity: '200kW', status: 'Khảo sát', progress: 10, deadline: '28/02/2024', manager: 'Phạm Văn D' },
  { id: 5, name: 'Solar Farm GHI', capacity: '15MW', status: 'Đang thực hiện', progress: 60, deadline: '30/05/2024', manager: 'Hoàng Thị E' },
  { id: 6, name: 'Rooftop JKL', capacity: '1MW', status: 'Hoàn thành', progress: 100, deadline: '01/12/2023', manager: 'Vũ Văn F' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<typeof INITIAL_PROJECTS[0] | null>(null);
  const [newProject, setNewProject] = useState({ name: '', capacity: '', status: 'Khảo sát', deadline: '', manager: '' });

  const handleAddProject = () => {
    if (!newProject.name || !newProject.capacity) {
      alert('Vui lòng nhập tên và công suất dự án');
      return;
    }
    const project = {
      id: Date.now(),
      ...newProject,
      progress: 0,
    };
    setProjects([...projects, project]);
    setNewProject({ name: '', capacity: '', status: 'Khảo sát', deadline: '', manager: '' });
    setShowAddForm(false);
  };

  const handleViewProject = (project: typeof INITIAL_PROJECTS[0]) => {
    setSelectedProject(project);
  };

  const handleDeleteProject = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa dự án này?')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Dự án</h1>
        <p className="text-gray-500 mt-1">Theo dõi tiến độ và quản lý các dự án điện mặt trời</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Tổng dự án</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">24</p>
          <p className="text-sm text-gray-500 mt-1">8 đang triển khai</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Hoàn thành</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">14</p>
          <p className="text-sm text-gray-500 mt-1">58% tỷ lệ</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Đang thực hiện</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">8</p>
          <p className="text-sm text-gray-500 mt-1">3 sắp deadline</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <h3 className="font-medium text-gray-900">Tổng công suất</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">45MW</p>
          <p className="text-sm text-gray-500 mt-1">Đã lắp đặt</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Danh sách dự án</h3>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600"
          >
            + Tạo dự án mới
          </button>
        </div>

        {/* Project Detail Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
              <h4 className="font-semibold text-gray-900 mb-4">Chi tiết dự án</h4>
              <div className="space-y-3 text-sm">
                <p><span className="font-medium">Tên:</span> {selectedProject.name}</p>
                <p><span className="font-medium">Công suất:</span> {selectedProject.capacity}</p>
                <p><span className="font-medium">Trạng thái:</span> {selectedProject.status}</p>
                <p><span className="font-medium">Tiến độ:</span> {selectedProject.progress}%</p>
                <p><span className="font-medium">Deadline:</span> {selectedProject.deadline}</p>
                <p><span className="font-medium">PM:</span> {selectedProject.manager}</p>
              </div>
              <div className="mt-4 flex gap-2 justify-end">
                <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm">Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Project Form */}
        {showAddForm && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Tạo dự án mới</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Tên dự án"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Công suất (VD: 5MW)"
                value={newProject.capacity}
                onChange={(e) => setNewProject({...newProject, capacity: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <select
                value={newProject.status}
                onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                <option value="Khảo sát">Khảo sát</option>
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Hoàn thành">Hoàn thành</option>
              </select>
              <input
                type="text"
                placeholder="Deadline (DD/MM/YYYY)"
                value={newProject.deadline}
                onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="Project Manager"
                value={newProject.manager}
                onChange={(e) => setNewProject({...newProject, manager: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm md:col-span-2"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={handleAddProject} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">Lưu</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">Hủy</button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="border border-gray-100 rounded-lg p-4 hover:border-yellow-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-gray-900 text-sm">{project.name}</h4>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  project.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                  project.status === 'Đang thực hiện' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Công suất:</span>
                  <span className="font-medium text-gray-900">{project.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline:</span>
                  <span className="font-medium text-gray-900">{project.deadline}</span>
                </div>
                <div className="flex justify-between">
                  <span>PM:</span>
                  <span className="font-medium text-gray-900">{project.manager}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Tiến độ</span>
                  <span className="font-medium text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      project.progress === 100 ? 'bg-green-500' : 
                      project.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
