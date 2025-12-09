// CRM Module - Central Exports
// GoldenEnergy HOME - Enterprise Internal Platform

// Types
export * from './types';

// Store
export { useCRMStore } from './store';
export type { CRMState, CRMActions } from './store';

// Components
export {
  PipelineKanban,
  LeadTable,
  LeadViewDrawer,
  ActivityTimeline,
} from './components';
