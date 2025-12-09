// ============================================================================
// PROJECTS MODULE - PAGE
// GoldenEnergy HOME Platform
// ============================================================================

export default function ProjectsPage() {
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
          <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600">
            + Tạo dự án mới
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              name: 'Điện mặt trời Nhà máy ABC', 
              capacity: '5MW', 
              status: 'Đang thực hiện',
              progress: 75,
              deadline: '30/03/2024',
              manager: 'Nguyễn Văn A'
            },
            { 
              name: 'Solar Rooftop Công ty XYZ', 
              capacity: '500kW', 
              status: 'Hoàn thành',
              progress: 100,
              deadline: '15/01/2024',
              manager: 'Trần Thị B'
            },
            { 
              name: 'Trang trại năng lượng 123', 
              capacity: '10MW', 
              status: 'Đang thực hiện',
              progress: 45,
              deadline: '30/06/2024',
              manager: 'Lê Văn C'
            },
            { 
              name: 'Điện mặt trời áp mái DEF', 
              capacity: '200kW', 
              status: 'Khảo sát',
              progress: 10,
              deadline: '28/02/2024',
              manager: 'Phạm Văn D'
            },
            { 
              name: 'Solar Farm GHI', 
              capacity: '15MW', 
              status: 'Đang thực hiện',
              progress: 60,
              deadline: '30/05/2024',
              manager: 'Hoàng Thị E'
            },
            { 
              name: 'Rooftop JKL', 
              capacity: '1MW', 
              status: 'Hoàn thành',
              progress: 100,
              deadline: '01/12/2023',
              manager: 'Vũ Văn F'
            },
          ].map((project, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 hover:border-yellow-300 hover:shadow-sm transition-all">
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
