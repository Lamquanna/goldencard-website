/**
 * CRM Module Store
 * Zustand store for CRM state management
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Lead,
  LeadStatus,
  LeadFilters,
  Contact,
  Deal,
  DealStage,
  DealFilters,
  Activity,
  Pipeline,
  PipelineStage,
  CRMAnalytics,
} from './types';

// Default pipeline configuration
const DEFAULT_PIPELINE: Pipeline = {
  id: 'default',
  name: 'Sales Pipeline',
  isDefault: true,
  stages: [
    { id: 'prospecting', name: 'Prospecting', order: 1, color: '#6B7280', probability: 10 },
    { id: 'qualification', name: 'Qualification', order: 2, color: '#3B82F6', probability: 20 },
    { id: 'needs_analysis', name: 'Needs Analysis', order: 3, color: '#8B5CF6', probability: 40 },
    { id: 'proposal', name: 'Proposal', order: 4, color: '#F59E0B', probability: 60 },
    { id: 'negotiation', name: 'Negotiation', order: 5, color: '#EC4899', probability: 80 },
    { id: 'closed_won', name: 'Closed Won', order: 6, color: '#10B981', probability: 100, isWon: true },
    { id: 'closed_lost', name: 'Closed Lost', order: 7, color: '#EF4444', probability: 0, isLost: true },
  ],
};

export interface CRMState {
  // Leads
  leads: Lead[];
  selectedLeadId: string | null;
  leadFilters: LeadFilters;
  
  // Contacts
  contacts: Contact[];
  selectedContactId: string | null;
  
  // Deals
  deals: Deal[];
  selectedDealId: string | null;
  dealFilters: DealFilters;
  
  // Pipeline
  pipelines: Pipeline[];
  activePipelineId: string;
  
  // Activities
  activities: Activity[];
  
  // Analytics
  analytics: CRMAnalytics | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  viewMode: 'kanban' | 'table' | 'list';
  
  // Drawers
  isLeadDrawerOpen: boolean;
  isContactDrawerOpen: boolean;
  isDealDrawerOpen: boolean;
}

export interface CRMActions {
  // Lead actions
  setLeads: (leads: Lead[]) => void;
  addLead: (lead: Lead) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  selectLead: (leadOrId: Lead | string | null) => void;
  setLeadFilters: (filters: LeadFilters) => void;
  moveLeadToStatus: (leadId: string, status: LeadStatus) => void;
  
  // Contact actions
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  selectContact: (id: string | null) => void;
  
  // Deal actions
  setDeals: (deals: Deal[]) => void;
  addDeal: (deal: Deal) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  selectDeal: (dealOrId: Deal | string | null) => void;
  setDealFilters: (filters: DealFilters) => void;
  moveDealToStage: (dealId: string, stage: DealStage) => void;
  
  // Pipeline actions
  setPipelines: (pipelines: Pipeline[]) => void;
  setActivePipeline: (id: string) => void;
  updatePipelineStages: (pipelineId: string, stages: PipelineStage[]) => void;
  
  // Activity actions
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  
  // Analytics actions
  setAnalytics: (analytics: CRMAnalytics) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: 'kanban' | 'table' | 'list') => void;
  toggleLeadDrawer: (open?: boolean) => void;
  toggleContactDrawer: (open?: boolean) => void;
  toggleDealDrawer: (open?: boolean) => void;
  
  // Computed getters
  getLeadsByStatus: (status: LeadStatus) => Lead[];
  getDealsByStage: (stage: DealStage) => Deal[];
  getFilteredLeads: () => Lead[];
  getFilteredDeals: () => Deal[];
  getActivePipeline: () => Pipeline;
}

export const useCRMStore = create<CRMState & CRMActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial State
        leads: [],
        selectedLeadId: null,
        leadFilters: {},
        contacts: [],
        selectedContactId: null,
        deals: [],
        selectedDealId: null,
        dealFilters: {},
        pipelines: [DEFAULT_PIPELINE],
        activePipelineId: 'default',
        activities: [],
        analytics: null,
        isLoading: false,
        error: null,
        viewMode: 'kanban',
        isLeadDrawerOpen: false,
        isContactDrawerOpen: false,
        isDealDrawerOpen: false,

        // Lead actions
        setLeads: (leads) => set((state) => {
          state.leads = leads;
        }),

        addLead: (lead) => set((state) => {
          state.leads.push(lead);
        }),

        updateLead: (id, updates) => set((state) => {
          const index = state.leads.findIndex((l: Lead) => l.id === id);
          if (index !== -1) {
            state.leads[index] = { ...state.leads[index], ...updates };
          }
        }),

        deleteLead: (id) => set((state) => {
          state.leads = state.leads.filter((l: Lead) => l.id !== id);
          if (state.selectedLeadId === id) {
            state.selectedLeadId = null;
          }
        }),

        selectLead: (leadOrId) => set((state) => {
          const id = typeof leadOrId === 'string' ? leadOrId : leadOrId?.id ?? null;
          state.selectedLeadId = id;
          if (id) {
            state.isLeadDrawerOpen = true;
          }
        }),

        setLeadFilters: (filters) => set((state) => {
          state.leadFilters = filters;
        }),

        moveLeadToStatus: (leadId, status) => set((state) => {
          const index = state.leads.findIndex((l: Lead) => l.id === leadId);
          if (index !== -1) {
            state.leads[index].status = status;
            state.leads[index].updatedAt = new Date();
          }
        }),

        // Contact actions
        setContacts: (contacts) => set((state) => {
          state.contacts = contacts;
        }),

        addContact: (contact) => set((state) => {
          state.contacts.push(contact);
        }),

        updateContact: (id, updates) => set((state) => {
          const index = state.contacts.findIndex((c: Contact) => c.id === id);
          if (index !== -1) {
            state.contacts[index] = { ...state.contacts[index], ...updates };
          }
        }),

        deleteContact: (id) => set((state) => {
          state.contacts = state.contacts.filter((c: Contact) => c.id !== id);
          if (state.selectedContactId === id) {
            state.selectedContactId = null;
          }
        }),

        selectContact: (id) => set((state) => {
          state.selectedContactId = id;
          if (id) {
            state.isContactDrawerOpen = true;
          }
        }),

        // Deal actions
        setDeals: (deals) => set((state) => {
          state.deals = deals;
        }),

        addDeal: (deal) => set((state) => {
          state.deals.push(deal);
        }),

        updateDeal: (id, updates) => set((state) => {
          const index = state.deals.findIndex((d: Deal) => d.id === id);
          if (index !== -1) {
            state.deals[index] = { ...state.deals[index], ...updates };
          }
        }),

        deleteDeal: (id) => set((state) => {
          state.deals = state.deals.filter((d: Deal) => d.id !== id);
          if (state.selectedDealId === id) {
            state.selectedDealId = null;
          }
        }),

        selectDeal: (dealOrId) => set((state) => {
          const id = typeof dealOrId === 'string' ? dealOrId : dealOrId?.id ?? null;
          state.selectedDealId = id;
          if (id) {
            state.isDealDrawerOpen = true;
          }
        }),

        setDealFilters: (filters) => set((state) => {
          state.dealFilters = filters;
        }),

        moveDealToStage: (dealId, stage) => set((state) => {
          const index = state.deals.findIndex((d: Deal) => d.id === dealId);
          if (index !== -1) {
            const pipeline = get().getActivePipeline();
            const stageConfig = pipeline.stages.find(
              (s) => s.id === stage.toLowerCase().replace(/_/g, '_')
            );
            
            state.deals[index].stage = stage;
            state.deals[index].updatedAt = new Date();
            
            if (stageConfig) {
              state.deals[index].probability = stageConfig.probability;
            }
            
            if (stage === 'CLOSED_WON' || stage === 'CLOSED_LOST') {
              state.deals[index].actualCloseDate = new Date();
            }
          }
        }),

        // Pipeline actions
        setPipelines: (pipelines) => set((state) => {
          state.pipelines = pipelines;
        }),

        setActivePipeline: (id) => set((state) => {
          state.activePipelineId = id;
        }),

        updatePipelineStages: (pipelineId, stages) => set((state) => {
          const index = state.pipelines.findIndex((p: Pipeline) => p.id === pipelineId);
          if (index !== -1) {
            state.pipelines[index].stages = stages;
          }
        }),

        // Activity actions
        setActivities: (activities) => set((state) => {
          state.activities = activities;
        }),

        addActivity: (activity) => set((state) => {
          state.activities.unshift(activity);
        }),

        // Analytics actions
        setAnalytics: (analytics) => set((state) => {
          state.analytics = analytics;
        }),

        // UI actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),

        setError: (error) => set((state) => {
          state.error = error;
        }),

        setViewMode: (mode) => set((state) => {
          state.viewMode = mode;
        }),

        toggleLeadDrawer: (open) => set((state) => {
          state.isLeadDrawerOpen = open ?? !state.isLeadDrawerOpen;
          if (!state.isLeadDrawerOpen) {
            state.selectedLeadId = null;
          }
        }),

        toggleContactDrawer: (open) => set((state) => {
          state.isContactDrawerOpen = open ?? !state.isContactDrawerOpen;
          if (!state.isContactDrawerOpen) {
            state.selectedContactId = null;
          }
        }),

        toggleDealDrawer: (open) => set((state) => {
          state.isDealDrawerOpen = open ?? !state.isDealDrawerOpen;
          if (!state.isDealDrawerOpen) {
            state.selectedDealId = null;
          }
        }),

        // Computed getters
        getLeadsByStatus: (status) => {
          return get().leads.filter((lead) => lead.status === status);
        },

        getDealsByStage: (stage) => {
          return get().deals.filter((deal) => deal.stage === stage);
        },

        getFilteredLeads: () => {
          const { leads, leadFilters } = get();
          let filtered = [...leads];

          if (leadFilters.status?.length) {
            filtered = filtered.filter((l) => leadFilters.status!.includes(l.status));
          }

          if (leadFilters.source?.length) {
            filtered = filtered.filter((l) => leadFilters.source!.includes(l.source));
          }

          if (leadFilters.rating?.length) {
            filtered = filtered.filter((l) => leadFilters.rating!.includes(l.rating));
          }

          if (leadFilters.assignedToId) {
            filtered = filtered.filter((l) => l.assignedToId === leadFilters.assignedToId);
          }

          if (leadFilters.tags?.length) {
            filtered = filtered.filter((l) =>
              leadFilters.tags!.some((tag) => l.tags.includes(tag))
            );
          }

          if (leadFilters.search) {
            const search = leadFilters.search.toLowerCase();
            filtered = filtered.filter(
              (l) =>
                l.name.toLowerCase().includes(search) ||
                l.email?.toLowerCase().includes(search) ||
                l.company?.toLowerCase().includes(search)
            );
          }

          if (leadFilters.dateRange) {
            filtered = filtered.filter(
              (l) =>
                new Date(l.createdAt) >= leadFilters.dateRange!.from &&
                new Date(l.createdAt) <= leadFilters.dateRange!.to
            );
          }

          return filtered;
        },

        getFilteredDeals: () => {
          const { deals, dealFilters } = get();
          let filtered = [...deals];

          if (dealFilters.stage?.length) {
            filtered = filtered.filter((d) => dealFilters.stage!.includes(d.stage));
          }

          if (dealFilters.ownerId) {
            filtered = filtered.filter((d) => d.ownerId === dealFilters.ownerId);
          }

          if (dealFilters.minValue !== undefined) {
            filtered = filtered.filter((d) => d.value >= dealFilters.minValue!);
          }

          if (dealFilters.maxValue !== undefined) {
            filtered = filtered.filter((d) => d.value <= dealFilters.maxValue!);
          }

          if (dealFilters.tags?.length) {
            filtered = filtered.filter((d) =>
              dealFilters.tags!.some((tag) => d.tags.includes(tag))
            );
          }

          if (dealFilters.search) {
            const search = dealFilters.search.toLowerCase();
            filtered = filtered.filter(
              (d) =>
                d.name.toLowerCase().includes(search) ||
                d.contact?.name.toLowerCase().includes(search)
            );
          }

          return filtered;
        },

        getActivePipeline: () => {
          const { pipelines, activePipelineId } = get();
          return pipelines.find((p) => p.id === activePipelineId) || DEFAULT_PIPELINE;
        },
      })),
      {
        name: 'crm-store',
        partialize: (state) => ({
          viewMode: state.viewMode,
          activePipelineId: state.activePipelineId,
          leadFilters: state.leadFilters,
          dealFilters: state.dealFilters,
        }),
      }
    ),
    { name: 'CRM Store' }
  )
);

// Selectors for common operations
export const useSelectedLead = () => {
  const selectedLeadId = useCRMStore((state) => state.selectedLeadId);
  const leads = useCRMStore((state) => state.leads);
  return leads.find((l) => l.id === selectedLeadId);
};

export const useSelectedDeal = () => {
  const selectedDealId = useCRMStore((state) => state.selectedDealId);
  const deals = useCRMStore((state) => state.deals);
  return deals.find((d) => d.id === selectedDealId);
};

export const useSelectedContact = () => {
  const selectedContactId = useCRMStore((state) => state.selectedContactId);
  const contacts = useCRMStore((state) => state.contacts);
  return contacts.find((c) => c.id === selectedContactId);
};

export const usePipelineValue = () => {
  const deals = useCRMStore((state) => state.deals);
  return deals
    .filter((d) => d.stage !== 'CLOSED_LOST')
    .reduce((sum, d) => sum + d.value, 0);
};

export const useWeightedPipelineValue = () => {
  const deals = useCRMStore((state) => state.deals);
  return deals
    .filter((d) => d.stage !== 'CLOSED_LOST' && d.stage !== 'CLOSED_WON')
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
};
