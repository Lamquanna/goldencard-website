// Mock Supabase Database
// In-memory database for development and demo purposes

import type { Project, ProjectTask, ProjectMilestone, ProjectStatus, ProjectPriority, TaskStatus } from '@/lib/types/project';

// Generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate date strings
const generateDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// Initial mock data
let projects: Project[] = [
  {
    id: generateId(),
    name: 'Solar Farm Bình Định',
    description: 'Dự án điện mặt trời 50MW tại Bình Định',
    status: 'active',
    priority: 'high',
    start_date: generateDate(-30),
    end_date: generateDate(60),
    budget: 500000000,
    client_name: 'Công ty Năng lượng ABC',
    client_email: 'contact@abc.com',
    client_phone: '0123 456 789',
    progress_percentage: 45,
    progress: 45,
    created_at: generateDate(-30),
    updated_at: generateDate(-1),
  },
  {
    id: generateId(),
    name: 'Hệ thống điện mặt trời mái nhà',
    description: 'Lắp đặt hệ thống solar cho 100 hộ gia đình',
    status: 'planning',
    priority: 'medium',
    start_date: generateDate(10),
    end_date: generateDate(90),
    budget: 200000000,
    client_name: 'Khu dân cư XYZ',
    client_email: 'khudancu@xyz.com',
    progress_percentage: 10,
    progress: 10,
    created_at: generateDate(-10),
    updated_at: generateDate(-2),
  },
  {
    id: generateId(),
    name: 'Wind Farm Ninh Thuận',
    description: 'Dự án điện gió 30MW',
    status: 'in_progress',
    priority: 'high',
    start_date: generateDate(-60),
    end_date: generateDate(30),
    budget: 800000000,
    client_name: 'Tập đoàn Năng lượng DEF',
    progress_percentage: 75,
    progress: 75,
    created_at: generateDate(-60),
    updated_at: generateDate(),
  },
];

let tasks: ProjectTask[] = [
  // Tasks for first project
  {
    id: generateId(),
    project_id: projects[0].id,
    title: 'Khảo sát địa điểm',
    description: 'Khảo sát và đánh giá địa điểm lắp đặt',
    status: 'done',
    priority: 'high',
    type: 'task',
    assigned_to: 'Nguyễn Văn A',
    start_date: generateDate(-30),
    due_date: generateDate(-20),
    progress: 100,
    created_at: generateDate(-30),
    updated_at: generateDate(-20),
  },
  {
    id: generateId(),
    project_id: projects[0].id,
    title: 'Thiết kế hệ thống',
    description: 'Thiết kế chi tiết hệ thống điện mặt trời',
    status: 'in_progress',
    priority: 'high',
    type: 'task',
    assigned_to: 'Trần Thị B',
    start_date: generateDate(-15),
    due_date: generateDate(5),
    progress: 60,
    created_at: generateDate(-15),
    updated_at: generateDate(-1),
  },
  {
    id: generateId(),
    project_id: projects[0].id,
    title: 'Đặt mua thiết bị',
    description: 'Liên hệ nhà cung cấp và đặt mua thiết bị',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    due_date: generateDate(15),
    progress: 0,
    created_at: generateDate(-10),
    updated_at: generateDate(-10),
  },
  {
    id: generateId(),
    project_id: projects[0].id,
    title: 'Lắp đặt tấm pin',
    description: 'Lắp đặt và kết nối các tấm pin mặt trời',
    status: 'todo',
    priority: 'high',
    type: 'task',
    due_date: generateDate(45),
    progress: 0,
    created_at: generateDate(-5),
    updated_at: generateDate(-5),
  },
  {
    id: generateId(),
    project_id: projects[0].id,
    title: 'Kiểm tra nghiệm thu',
    description: 'Kiểm tra và nghiệm thu toàn bộ hệ thống',
    status: 'todo',
    priority: 'medium',
    type: 'task',
    due_date: generateDate(55),
    progress: 0,
    created_at: generateDate(-3),
    updated_at: generateDate(-3),
  },
];

// Sample milestones data
const milestones: ProjectMilestone[] = [
  {
    id: 'milestone-1',
    project_id: 'proj-1',
    title: 'Hoàn thành khảo sát',
    description: 'Khảo sát hiện trạng và lập báo cáo',
    target_date: generateDate(10),
    completed: true,
    completed_at: generateDate(-2),
    created_at: generateDate(-30),
  },
  {
    id: 'milestone-2',
    project_id: 'proj-1',
    title: 'Phê duyệt thiết kế',
    description: 'Phê duyệt bản vẽ thiết kế hệ thống',
    target_date: generateDate(25),
    completed: false,
    created_at: generateDate(-25),
  },
  {
    id: 'milestone-3',
    project_id: 'proj-1',
    title: 'Nghiệm thu giai đoạn 1',
    description: 'Nghiệm thu hoàn thành lắp đặt',
    target_date: generateDate(45),
    completed: false,
    created_at: generateDate(-20),
  },
  {
    id: 'milestone-4',
    project_id: 'proj-2',
    title: 'Hoàn thành giai đoạn 1',
    description: 'Lắp đặt 50% hệ thống',
    target_date: generateDate(-5),
    completed: true,
    completed_at: generateDate(-6),
    created_at: generateDate(-60),
  },
  {
    id: 'milestone-5',
    project_id: 'proj-2',
    title: 'Vận hành thử nghiệm',
    description: 'Chạy thử nghiệm toàn bộ hệ thống',
    target_date: generateDate(5),
    completed: false,
    created_at: generateDate(-55),
  },
];

// Database interface
interface MockDbQuery<T> {
  data: T[];
  select: (columns?: string) => MockDbQuery<T>;
  eq: (column: keyof T, value: any) => MockDbQuery<T>;
  neq: (column: keyof T, value: any) => MockDbQuery<T>;
  in: (column: keyof T, values: any[]) => MockDbQuery<T>;
  order: (column: keyof T, options?: { ascending?: boolean }) => MockDbQuery<T>;
  limit: (count: number) => MockDbQuery<T>;
  range: (start: number, end: number) => MockDbQuery<T>;
  single: () => Promise<{ data: T | null; error: null }>;
  execute: () => Promise<{ data: T[]; error: null; count?: number }>;
}

function createQuery<T>(items: T[]): MockDbQuery<T> {
  let filteredData = [...items];

  return {
    data: filteredData,
    select: function() { return this; },
    eq: function(column, value) {
      filteredData = filteredData.filter(item => (item as any)[column] === value);
      this.data = filteredData;
      return this;
    },
    neq: function(column, value) {
      filteredData = filteredData.filter(item => (item as any)[column] !== value);
      this.data = filteredData;
      return this;
    },
    in: function(column, values) {
      filteredData = filteredData.filter(item => values.includes((item as any)[column]));
      this.data = filteredData;
      return this;
    },
    order: function(column, options = { ascending: true }) {
      filteredData.sort((a, b) => {
        const aVal = (a as any)[column];
        const bVal = (b as any)[column];
        if (aVal < bVal) return options.ascending ? -1 : 1;
        if (aVal > bVal) return options.ascending ? 1 : -1;
        return 0;
      });
      this.data = filteredData;
      return this;
    },
    limit: function(count) {
      filteredData = filteredData.slice(0, count);
      this.data = filteredData;
      return this;
    },
    range: function(start, end) {
      filteredData = filteredData.slice(start, end + 1);
      this.data = filteredData;
      return this;
    },
    single: async function() {
      return { data: filteredData[0] || null, error: null };
    },
    execute: async function() {
      return { data: filteredData, error: null, count: filteredData.length };
    },
  };
}

// Mock Database
export const mockDb = {
  // Direct array access for simple queries
  get projectsArray() { return projects; },
  get tasksArray() { return tasks; },
  get milestonesArray() { return milestones; },

  // Projects
  projects: {
    getAll: () => [...projects],
    findById: (id: string) => projects.find(p => p.id === id),
    select: (columns?: string) => createQuery(projects),
    
    insert: async (data: Partial<Project>) => {
      const newProject: Project = {
        id: generateId(),
        name: data.name || 'New Project',
        description: data.description,
        status: data.status || 'planning',
        priority: data.priority || 'medium',
        start_date: data.start_date,
        end_date: data.end_date,
        budget: data.budget,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        progress_percentage: 0,
        progress: 0,
        created_at: generateDate(),
        updated_at: generateDate(),
      };
      projects.push(newProject);
      return { data: newProject, error: null };
    },

    update: async (id: string, data: Partial<Project>) => {
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: { message: 'Project not found' } };
      }
      projects[index] = {
        ...projects[index],
        ...data,
        updated_at: generateDate(),
      };
      return { data: projects[index], error: null };
    },

    delete: async (id: string) => {
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) {
        return { data: null, error: { message: 'Project not found' } };
      }
      const deleted = projects.splice(index, 1)[0];
      // Also delete related tasks
      tasks = tasks.filter(t => t.project_id !== id);
      return { data: deleted, error: null };
    },
  },

  // Tasks
  tasks: {
    getAll: () => [...tasks],
    findById: (id: string) => tasks.find(t => t.id === id),
    findByProjectId: (projectId: string) => tasks.filter(t => t.project_id === projectId),
    select: (columns?: string) => createQuery(tasks),

    insert: async (data: Partial<ProjectTask>) => {
      const newTask: ProjectTask = {
        id: generateId(),
        project_id: data.project_id || '',
        title: data.title || 'New Task',
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        type: data.type || 'task',
        assigned_to: data.assigned_to,
        start_date: data.start_date,
        due_date: data.due_date,
        progress: data.progress || 0,
        estimated_hours: data.estimated_hours,
        created_at: generateDate(),
        updated_at: generateDate(),
      };
      tasks.push(newTask);
      return { data: newTask, error: null };
    },

    update: async (id: string, data: Partial<ProjectTask>) => {
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) {
        return { data: null, error: { message: 'Task not found' } };
      }
      tasks[index] = {
        ...tasks[index],
        ...data,
        updated_at: generateDate(),
      };
      return { data: tasks[index], error: null };
    },

    delete: async (id: string) => {
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) {
        return { data: null, error: { message: 'Task not found' } };
      }
      const deleted = tasks.splice(index, 1)[0];
      return { data: deleted, error: null };
    },

    bulkUpdate: async (updates: Array<{ id: string } & Partial<ProjectTask>>) => {
      const results: ProjectTask[] = [];
      for (const update of updates) {
        const index = tasks.findIndex(t => t.id === update.id);
        if (index !== -1) {
          tasks[index] = {
            ...tasks[index],
            ...update,
            updated_at: generateDate(),
          };
          results.push(tasks[index]);
        }
      }
      return { data: results, error: null };
    },
  },
};

export default mockDb;
