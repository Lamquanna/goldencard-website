// ============================================================================
// PROJECT MANAGEMENT MODULE - ZUSTAND STORE
// GoldenEnergy HOME Enterprise Platform
// ============================================================================

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Project,
  Task,
  Milestone,
  Sprint,
  ChatMessage,
  ResourceAllocation,
  ProjectFilters,
  TaskFilters,
  TaskStatus,
  KANBAN_COLUMNS,
} from './types';

// Type helper for immer draft
type Draft<T> = T;

// ============================================================================
// STORE STATE INTERFACE
// ============================================================================

interface ProjectState {
  // Projects
  projects: Project[];
  selectedProject: Project | null;
  projectFilters: ProjectFilters;
  isLoadingProjects: boolean;
  
  // Tasks
  tasks: Task[];
  selectedTask: Task | null;
  taskFilters: TaskFilters;
  isLoadingTasks: boolean;
  
  // Milestones
  milestones: Milestone[];
  selectedMilestone: Milestone | null;
  isLoadingMilestones: boolean;
  
  // Sprints
  sprints: Sprint[];
  activeSprint: Sprint | null;
  isLoadingSprints: boolean;
  
  // Chat
  chatMessages: ChatMessage[];
  isLoadingChat: boolean;
  
  // Resources
  resourceAllocations: ResourceAllocation[];
  isLoadingResources: boolean;
  
  // UI State
  isTaskDrawerOpen: boolean;
  isProjectDrawerOpen: boolean;
  kanbanViewMode: 'status' | 'assignee' | 'priority';
}

interface ProjectActions {
  // Project Actions
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  selectProject: (project: string | Project | null) => void;
  setProjectFilters: (filters: Partial<ProjectFilters>) => void;
  clearProjectFilters: () => void;
  setLoadingProjects: (loading: boolean) => void;
  
  // Task Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  selectTask: (task: string | Task | null) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => void;
  reorderTask: (taskId: string, newOrder: number) => void;
  setTaskFilters: (filters: Partial<TaskFilters>) => void;
  clearTaskFilters: () => void;
  setLoadingTasks: (loading: boolean) => void;
  
  // Milestone Actions
  setMilestones: (milestones: Milestone[]) => void;
  addMilestone: (milestone: Milestone) => void;
  updateMilestone: (id: string, data: Partial<Milestone>) => void;
  deleteMilestone: (id: string) => void;
  selectMilestone: (milestone: string | Milestone | null) => void;
  setLoadingMilestones: (loading: boolean) => void;
  
  // Sprint Actions
  setSprints: (sprints: Sprint[]) => void;
  addSprint: (sprint: Sprint) => void;
  updateSprint: (id: string, data: Partial<Sprint>) => void;
  deleteSprint: (id: string) => void;
  setActiveSprint: (sprint: Sprint | null) => void;
  setLoadingSprints: (loading: boolean) => void;
  
  // Chat Actions
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateChatMessage: (id: string, data: Partial<ChatMessage>) => void;
  deleteChatMessage: (id: string) => void;
  setLoadingChat: (loading: boolean) => void;
  
  // Resource Actions
  setResourceAllocations: (allocations: ResourceAllocation[]) => void;
  addResourceAllocation: (allocation: ResourceAllocation) => void;
  updateResourceAllocation: (id: string, data: Partial<ResourceAllocation>) => void;
  deleteResourceAllocation: (id: string) => void;
  setLoadingResources: (loading: boolean) => void;
  
  // UI Actions
  openTaskDrawer: () => void;
  closeTaskDrawer: () => void;
  openProjectDrawer: () => void;
  closeProjectDrawer: () => void;
  setKanbanViewMode: (mode: 'status' | 'assignee' | 'priority') => void;
  
  // Utility Actions
  getProjectById: (id: string) => Project | undefined;
  getTaskById: (id: string) => Task | undefined;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByStatus: (projectId: string, status: TaskStatus) => Task[];
  getTasksByAssignee: (assigneeId: string) => Task[];
  getMilestonesByProject: (projectId: string) => Milestone[];
  getSprintsByProject: (projectId: string) => Sprint[];
  
  // Reset
  reset: () => void;
}

type ProjectStore = ProjectState & ProjectActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  projectFilters: {},
  isLoadingProjects: false,
  tasks: [],
  selectedTask: null,
  taskFilters: {},
  isLoadingTasks: false,
  milestones: [],
  selectedMilestone: null,
  isLoadingMilestones: false,
  sprints: [],
  activeSprint: null,
  isLoadingSprints: false,
  chatMessages: [],
  isLoadingChat: false,
  resourceAllocations: [],
  isLoadingResources: false,
  isTaskDrawerOpen: false,
  isProjectDrawerOpen: false,
  kanbanViewMode: 'status',
};

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useProjectStore = create<ProjectStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ====================================================================
        // PROJECT ACTIONS
        // ====================================================================

        setProjects: (projects: Project[]) => set((state: Draft<ProjectState>) => {
          state.projects = projects as Draft<Project>[];
        }),

        addProject: (project: Project) => set((state: Draft<ProjectState>) => {
          state.projects.push(project as Draft<Project>);
        }),

        updateProject: (id: string, data: Partial<Project>) => set((state: Draft<ProjectState>) => {
          const index = state.projects.findIndex((p: Draft<Project>) => p.id === id);
          if (index !== -1) {
            Object.assign(state.projects[index], data, { updatedAt: new Date() });
          }
          if (state.selectedProject?.id === id) {
            Object.assign(state.selectedProject, data, { updatedAt: new Date() });
          }
        }),

        deleteProject: (id: string) => set((state: Draft<ProjectState>) => {
          state.projects = state.projects.filter((p: Draft<Project>) => p.id !== id);
          if (state.selectedProject?.id === id) {
            state.selectedProject = null;
          }
          // Also remove related tasks
          state.tasks = state.tasks.filter((t: Draft<Task>) => t.projectId !== id);
        }),

        selectProject: (project: string | Project | null) => set((state: Draft<ProjectState>) => {
          if (typeof project === 'string') {
            const found = state.projects.find((p: Draft<Project>) => p.id === project);
            state.selectedProject = found || null;
          } else {
            state.selectedProject = project as Draft<Project> | null;
          }
          if (state.selectedProject) {
            state.isProjectDrawerOpen = true;
          }
        }),

        setProjectFilters: (filters: Partial<ProjectFilters>) => set((state: Draft<ProjectState>) => {
          state.projectFilters = { ...state.projectFilters, ...filters };
        }),

        clearProjectFilters: () => set((state: Draft<ProjectState>) => {
          state.projectFilters = {};
        }),

        setLoadingProjects: (loading: boolean) => set((state: Draft<ProjectState>) => {
          state.isLoadingProjects = loading;
        }),

        // ====================================================================
        // TASK ACTIONS
        // ====================================================================

        setTasks: (tasks: Task[]) => set((state: Draft<ProjectState>) => {
          state.tasks = tasks as Draft<Task>[];
        }),

        addTask: (task: Task) => set((state: Draft<ProjectState>) => {
          state.tasks.push(task as Draft<Task>);
          // Update project task count
          const projectIndex = state.projects.findIndex((p: Draft<Project>) => p.id === task.projectId);
          if (projectIndex !== -1) {
            state.projects[projectIndex].totalTasks += 1;
          }
        }),

        updateTask: (id: string, data: Partial<Task>) => set((state: Draft<ProjectState>) => {
          const index = state.tasks.findIndex((t: Draft<Task>) => t.id === id);
          if (index !== -1) {
            const oldTask = state.tasks[index];
            Object.assign(state.tasks[index], data, { updatedAt: new Date() });
            
            // Update project completed count if status changed to DONE
            if (data.status === 'DONE' && oldTask.status !== 'DONE') {
              const projectIndex = state.projects.findIndex((p: Draft<Project>) => p.id === oldTask.projectId);
              if (projectIndex !== -1) {
                state.projects[projectIndex].completedTasks += 1;
                state.projects[projectIndex].progress = Math.round(
                  (state.projects[projectIndex].completedTasks / state.projects[projectIndex].totalTasks) * 100
                );
              }
            }
          }
          if (state.selectedTask?.id === id) {
            Object.assign(state.selectedTask, data, { updatedAt: new Date() });
          }
        }),

        deleteTask: (id: string) => set((state: Draft<ProjectState>) => {
          const task = state.tasks.find((t: Draft<Task>) => t.id === id);
          if (task) {
            // Update project task count
            const projectIndex = state.projects.findIndex((p: Draft<Project>) => p.id === task.projectId);
            if (projectIndex !== -1) {
              state.projects[projectIndex].totalTasks -= 1;
              if (task.status === 'DONE') {
                state.projects[projectIndex].completedTasks -= 1;
              }
            }
          }
          state.tasks = state.tasks.filter((t: Draft<Task>) => t.id !== id);
          if (state.selectedTask?.id === id) {
            state.selectedTask = null;
          }
        }),

        selectTask: (task: string | Task | null) => set((state: Draft<ProjectState>) => {
          if (typeof task === 'string') {
            const found = state.tasks.find((t: Draft<Task>) => t.id === task);
            state.selectedTask = found || null;
          } else {
            state.selectedTask = task as Draft<Task> | null;
          }
          if (state.selectedTask) {
            state.isTaskDrawerOpen = true;
          }
        }),

        moveTask: (taskId: string, newStatus: TaskStatus, newOrder: number) => set((state: Draft<ProjectState>) => {
          const taskIndex = state.tasks.findIndex((t: Draft<Task>) => t.id === taskId);
          if (taskIndex !== -1) {
            const task = state.tasks[taskIndex];
            const oldStatus = task.status;
            
            task.status = newStatus;
            task.order = newOrder;
            task.updatedAt = new Date();
            
            // Update completedAt if moved to DONE
            if (newStatus === 'DONE' && oldStatus !== 'DONE') {
              task.completedAt = new Date();
              
              // Update project progress
              const projectIndex = state.projects.findIndex((p: Draft<Project>) => p.id === task.projectId);
              if (projectIndex !== -1) {
                state.projects[projectIndex].completedTasks += 1;
                state.projects[projectIndex].progress = Math.round(
                  (state.projects[projectIndex].completedTasks / state.projects[projectIndex].totalTasks) * 100
                );
              }
            } else if (oldStatus === 'DONE' && newStatus !== 'DONE') {
              task.completedAt = undefined;
              
              // Update project progress
              const projectIndex = state.projects.findIndex((p: Draft<Project>) => p.id === task.projectId);
              if (projectIndex !== -1) {
                state.projects[projectIndex].completedTasks -= 1;
                state.projects[projectIndex].progress = Math.round(
                  (state.projects[projectIndex].completedTasks / state.projects[projectIndex].totalTasks) * 100
                );
              }
            }
          }
        }),

        reorderTask: (taskId: string, newOrder: number) => set((state: Draft<ProjectState>) => {
          const taskIndex = state.tasks.findIndex((t: Draft<Task>) => t.id === taskId);
          if (taskIndex !== -1) {
            state.tasks[taskIndex].order = newOrder;
            state.tasks[taskIndex].updatedAt = new Date();
          }
        }),

        setTaskFilters: (filters: Partial<TaskFilters>) => set((state: Draft<ProjectState>) => {
          state.taskFilters = { ...state.taskFilters, ...filters };
        }),

        clearTaskFilters: () => set((state: Draft<ProjectState>) => {
          state.taskFilters = {};
        }),

        setLoadingTasks: (loading: boolean) => set((state: Draft<ProjectState>) => {
          state.isLoadingTasks = loading;
        }),

        // ====================================================================
        // MILESTONE ACTIONS
        // ====================================================================

        setMilestones: (milestones: Milestone[]) => set((state: Draft<ProjectState>) => {
          state.milestones = milestones as Draft<Milestone>[];
        }),

        addMilestone: (milestone: Milestone) => set((state: Draft<ProjectState>) => {
          state.milestones.push(milestone as Draft<Milestone>);
        }),

        updateMilestone: (id: string, data: Partial<Milestone>) => set((state: Draft<ProjectState>) => {
          const index = state.milestones.findIndex((m: Draft<Milestone>) => m.id === id);
          if (index !== -1) {
            Object.assign(state.milestones[index], data, { updatedAt: new Date() });
          }
          if (state.selectedMilestone?.id === id) {
            Object.assign(state.selectedMilestone, data, { updatedAt: new Date() });
          }
        }),

        deleteMilestone: (id: string) => set((state: Draft<ProjectState>) => {
          state.milestones = state.milestones.filter((m: Draft<Milestone>) => m.id !== id);
          if (state.selectedMilestone?.id === id) {
            state.selectedMilestone = null;
          }
        }),

        selectMilestone: (milestone: string | Milestone | null) => set((state: Draft<ProjectState>) => {
          if (typeof milestone === 'string') {
            const found = state.milestones.find((m: Draft<Milestone>) => m.id === milestone);
            state.selectedMilestone = found || null;
          } else {
            state.selectedMilestone = milestone as Draft<Milestone> | null;
          }
        }),

        setLoadingMilestones: (loading: boolean) => set((state: Draft<ProjectState>) => {
          state.isLoadingMilestones = loading;
        }),

        // ====================================================================
        // SPRINT ACTIONS
        // ====================================================================

        setSprints: (sprints: Sprint[]) => set((state: Draft<ProjectState>) => {
          state.sprints = sprints as Draft<Sprint>[];
        }),

        addSprint: (sprint: Sprint) => set((state: Draft<ProjectState>) => {
          state.sprints.push(sprint as Draft<Sprint>);
        }),

        updateSprint: (id: string, data: Partial<Sprint>) => set((state: Draft<ProjectState>) => {
          const index = state.sprints.findIndex((s: Draft<Sprint>) => s.id === id);
          if (index !== -1) {
            Object.assign(state.sprints[index], data, { updatedAt: new Date() });
          }
          if (state.activeSprint?.id === id) {
            Object.assign(state.activeSprint, data, { updatedAt: new Date() });
          }
        }),

        deleteSprint: (id: string) => set((state: Draft<ProjectState>) => {
          state.sprints = state.sprints.filter((s: Draft<Sprint>) => s.id !== id);
          if (state.activeSprint?.id === id) {
            state.activeSprint = null;
          }
        }),

        setActiveSprint: (sprint: Sprint | null) => set((state: Draft<ProjectState>) => {
          state.activeSprint = sprint as Draft<Sprint> | null;
        }),

        setLoadingSprints: (loading: boolean) => set((state: Draft<ProjectState>) => {
          state.isLoadingSprints = loading;
        }),

        // ====================================================================
        // CHAT ACTIONS
        // ====================================================================

        setChatMessages: (messages: ChatMessage[]) => set((state: Draft<ProjectState>) => {
          state.chatMessages = messages as Draft<ChatMessage>[];
        }),

        addChatMessage: (message: ChatMessage) => set((state: Draft<ProjectState>) => {
          state.chatMessages.push(message as Draft<ChatMessage>);
        }),

        updateChatMessage: (id: string, data: Partial<ChatMessage>) => set((state: Draft<ProjectState>) => {
          const index = state.chatMessages.findIndex((m: Draft<ChatMessage>) => m.id === id);
          if (index !== -1) {
            Object.assign(state.chatMessages[index], data);
          }
        }),

        deleteChatMessage: (id: string) => set((state: Draft<ProjectState>) => {
          const index = state.chatMessages.findIndex((m: Draft<ChatMessage>) => m.id === id);
          if (index !== -1) {
            state.chatMessages[index].isDeleted = true;
            state.chatMessages[index].content = 'Tin nhắn đã bị xóa';
          }
        }),

        setLoadingChat: (loading: boolean) => set((state: Draft<ProjectState>) => {
          state.isLoadingChat = loading;
        }),

        // ====================================================================
        // RESOURCE ACTIONS
        // ====================================================================

        setResourceAllocations: (allocations: ResourceAllocation[]) => set((state: Draft<ProjectState>) => {
          state.resourceAllocations = allocations as Draft<ResourceAllocation>[];
        }),

        addResourceAllocation: (allocation: ResourceAllocation) => set((state: Draft<ProjectState>) => {
          state.resourceAllocations.push(allocation as Draft<ResourceAllocation>);
        }),

        updateResourceAllocation: (id: string, data: Partial<ResourceAllocation>) => set((state: Draft<ProjectState>) => {
          const index = state.resourceAllocations.findIndex((r: Draft<ResourceAllocation>) => r.id === id);
          if (index !== -1) {
            Object.assign(state.resourceAllocations[index], data);
          }
        }),

        deleteResourceAllocation: (id: string) => set((state: Draft<ProjectState>) => {
          state.resourceAllocations = state.resourceAllocations.filter((r: Draft<ResourceAllocation>) => r.id !== id);
        }),

        setLoadingResources: (loading: boolean) => set((state: Draft<ProjectState>) => {
          state.isLoadingResources = loading;
        }),

        // ====================================================================
        // UI ACTIONS
        // ====================================================================

        openTaskDrawer: () => set((state: Draft<ProjectState>) => {
          state.isTaskDrawerOpen = true;
        }),

        closeTaskDrawer: () => set((state: Draft<ProjectState>) => {
          state.isTaskDrawerOpen = false;
        }),

        openProjectDrawer: () => set((state: Draft<ProjectState>) => {
          state.isProjectDrawerOpen = true;
        }),

        closeProjectDrawer: () => set((state: Draft<ProjectState>) => {
          state.isProjectDrawerOpen = false;
        }),

        setKanbanViewMode: (mode: 'status' | 'assignee' | 'priority') => set((state: Draft<ProjectState>) => {
          state.kanbanViewMode = mode;
        }),

        // ====================================================================
        // UTILITY ACTIONS
        // ====================================================================

        getProjectById: (id: string) => {
          return get().projects.find((p) => p.id === id);
        },

        getTaskById: (id: string) => {
          return get().tasks.find((t) => t.id === id);
        },

        getTasksByProject: (projectId: string) => {
          return get().tasks.filter((t) => t.projectId === projectId);
        },

        getTasksByStatus: (projectId: string, status: TaskStatus) => {
          return get().tasks.filter((t) => t.projectId === projectId && t.status === status);
        },

        getTasksByAssignee: (assigneeId: string) => {
          return get().tasks.filter((t) => t.assigneeId === assigneeId);
        },

        getMilestonesByProject: (projectId: string) => {
          return get().milestones.filter((m) => m.projectId === projectId);
        },

        getSprintsByProject: (projectId: string) => {
          return get().sprints.filter((s) => s.projectId === projectId);
        },

        // ====================================================================
        // RESET
        // ====================================================================

        reset: () => set(initialState),
      })),
      {
        name: 'project-storage',
        partialize: (state) => ({
          projectFilters: state.projectFilters,
          taskFilters: state.taskFilters,
          kanbanViewMode: state.kanbanViewMode,
        }),
      }
    ),
    { name: 'ProjectStore' }
  )
);

// ============================================================================
// SELECTORS
// ============================================================================

export const selectFilteredProjects = (state: ProjectStore): Project[] => {
  const { projects, projectFilters } = state;
  
  return projects.filter((project) => {
    if (projectFilters.search) {
      const search = projectFilters.search.toLowerCase();
      const matchName = project.name.toLowerCase().includes(search);
      const matchCode = project.code.toLowerCase().includes(search);
      if (!matchName && !matchCode) return false;
    }
    
    if (projectFilters.status && project.status !== projectFilters.status) {
      return false;
    }
    
    if (projectFilters.ownerId && project.ownerId !== projectFilters.ownerId) {
      return false;
    }
    
    if (projectFilters.managerId && project.managerId !== projectFilters.managerId) {
      return false;
    }
    
    return true;
  });
};

export const selectFilteredTasks = (state: ProjectStore): Task[] => {
  const { tasks, taskFilters } = state;
  
  return tasks.filter((task) => {
    if (taskFilters.search) {
      const search = taskFilters.search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(search);
      if (!matchTitle) return false;
    }
    
    if (taskFilters.projectId && task.projectId !== taskFilters.projectId) {
      return false;
    }
    
    if (taskFilters.status && task.status !== taskFilters.status) {
      return false;
    }
    
    if (taskFilters.priority && task.priority !== taskFilters.priority) {
      return false;
    }
    
    if (taskFilters.type && task.type !== taskFilters.type) {
      return false;
    }
    
    if (taskFilters.assigneeId && task.assigneeId !== taskFilters.assigneeId) {
      return false;
    }
    
    if (taskFilters.milestoneId && task.milestoneId !== taskFilters.milestoneId) {
      return false;
    }
    
    if (taskFilters.sprintId && task.sprintId !== taskFilters.sprintId) {
      return false;
    }
    
    return true;
  }).sort((a, b) => a.order - b.order);
};

export const selectTasksByColumn = (state: ProjectStore) => {
  const tasks = selectFilteredTasks(state);
  const columns: Record<TaskStatus, Task[]> = {
    BACKLOG: [],
    TODO: [],
    IN_PROGRESS: [],
    IN_REVIEW: [],
    DONE: [],
    CANCELLED: [],
  };
  
  tasks.forEach((task) => {
    if (task.status !== 'CANCELLED') {
      columns[task.status].push(task);
    }
  });
  
  return columns;
};

export const selectProjectStats = (state: ProjectStore) => {
  const { projects } = state;
  
  return {
    total: projects.length,
    planning: projects.filter((p) => p.status === 'PLANNING').length,
    inProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    onHold: projects.filter((p) => p.status === 'ON_HOLD').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
  };
};

export const selectTaskStats = (state: ProjectStore, projectId?: string) => {
  let tasks = state.tasks;
  if (projectId) {
    tasks = tasks.filter((t) => t.projectId === projectId);
  }
  
  return {
    total: tasks.length,
    backlog: tasks.filter((t) => t.status === 'BACKLOG').length,
    todo: tasks.filter((t) => t.status === 'TODO').length,
    inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
    inReview: tasks.filter((t) => t.status === 'IN_REVIEW').length,
    done: tasks.filter((t) => t.status === 'DONE').length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length,
  };
};
