/**
 * HOME Platform - Workflow Engine
 * JSON-based workflow definitions with execution engine
 */

// =============================================================================
// WORKFLOW TYPES
// =============================================================================

export type WorkflowTrigger = 
  | 'manual'
  | 'on_create'
  | 'on_update'
  | 'on_status_change'
  | 'scheduled'
  | 'webhook'

export type WorkflowStepType = 
  | 'approval'
  | 'notification'
  | 'assignment'
  | 'condition'
  | 'action'
  | 'delay'
  | 'webhook'

export type WorkflowStatus = 
  | 'draft'
  | 'active'
  | 'paused'
  | 'archived'

export type WorkflowInstanceStatus = 
  | 'pending'
  | 'running'
  | 'waiting'
  | 'completed'
  | 'cancelled'
  | 'failed'

export type StepStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'failed'

// =============================================================================
// WORKFLOW DEFINITION
// =============================================================================

export interface WorkflowDefinition {
  id: string
  name: string
  nameVi: string
  description?: string
  
  // Trigger
  trigger: WorkflowTrigger
  triggerConfig?: {
    resource?: string
    event?: string
    schedule?: string // Cron expression
    webhookSecret?: string
  }
  
  // Steps
  steps: WorkflowStep[]
  
  // Settings
  status: WorkflowStatus
  version: number
  module: string
  
  // Metadata
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface WorkflowStep {
  id: string
  name: string
  type: WorkflowStepType
  order: number
  
  // Configuration based on type
  config: ApprovalConfig | NotificationConfig | AssignmentConfig | ConditionConfig | ActionConfig | DelayConfig | WebhookConfig
  
  // Routing
  nextStepId?: string
  onSuccessStepId?: string
  onFailureStepId?: string
  
  // Timeout
  timeoutHours?: number
  timeoutAction?: 'skip' | 'fail' | 'escalate'
  escalateToUserId?: string
}

// Step Configurations
export interface ApprovalConfig {
  approverType: 'user' | 'role' | 'manager' | 'department_head'
  approverId?: string
  approverRoleId?: string
  requireAllApprovers?: boolean
  minApprovals?: number
  allowDelegate?: boolean
}

export interface NotificationConfig {
  recipientType: 'user' | 'role' | 'requester' | 'manager'
  recipientId?: string
  template: string
  channel: 'in_app' | 'email' | 'sms' | 'all'
}

export interface AssignmentConfig {
  assignTo: 'user' | 'role' | 'round_robin' | 'least_loaded'
  userId?: string
  roleId?: string
  teamId?: string
}

export interface ConditionConfig {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in'
  value: unknown
  trueStepId: string
  falseStepId: string
}

export interface ActionConfig {
  actionType: 'update_field' | 'create_record' | 'send_email' | 'call_api'
  targetResource?: string
  fieldUpdates?: Record<string, unknown>
  apiEndpoint?: string
  apiMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

export interface DelayConfig {
  delayType: 'hours' | 'days' | 'until_date' | 'until_field'
  delayValue?: number
  delayDate?: Date
  delayField?: string
}

export interface WebhookConfig {
  url: string
  method: 'GET' | 'POST' | 'PUT'
  headers?: Record<string, string>
  body?: Record<string, unknown>
  retryCount?: number
}

// =============================================================================
// WORKFLOW INSTANCE
// =============================================================================

export interface WorkflowInstance {
  id: string
  workflowId: string
  workflow?: WorkflowDefinition
  
  // Context
  resourceType: string
  resourceId: string
  triggerData?: Record<string, unknown>
  
  // Status
  status: WorkflowInstanceStatus
  currentStepId?: string
  
  // Steps execution
  stepHistory: StepExecution[]
  
  // Users
  requesterId: string
  requester?: { id: string; name: string }
  
  // Timestamps
  startedAt: Date
  completedAt?: Date
  cancelledAt?: Date
  
  // Error
  error?: string
}

export interface StepExecution {
  stepId: string
  step?: WorkflowStep
  status: StepStatus
  
  // Execution data
  executedById?: string
  executedBy?: { id: string; name: string }
  executedAt?: Date
  
  // Approval specific
  decision?: 'approved' | 'rejected'
  comments?: string
  
  // Result
  result?: Record<string, unknown>
  error?: string
}

// =============================================================================
// WORKFLOW ENGINE
// =============================================================================

export class WorkflowEngine {
  private definitions: Map<string, WorkflowDefinition> = new Map()
  private instances: Map<string, WorkflowInstance> = new Map()

  // Register workflow definition
  registerWorkflow(definition: WorkflowDefinition): void {
    this.definitions.set(definition.id, definition)
  }

  // Start a new workflow instance
  async startWorkflow(
    workflowId: string,
    resourceType: string,
    resourceId: string,
    requesterId: string,
    triggerData?: Record<string, unknown>
  ): Promise<WorkflowInstance> {
    const definition = this.definitions.get(workflowId)
    if (!definition) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    if (definition.status !== 'active') {
      throw new Error(`Workflow ${workflowId} is not active`)
    }

    const instance: WorkflowInstance = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      workflow: definition,
      resourceType,
      resourceId,
      triggerData,
      status: 'pending',
      currentStepId: definition.steps[0]?.id,
      stepHistory: [],
      requesterId,
      startedAt: new Date(),
    }

    this.instances.set(instance.id, instance)

    // Start execution
    await this.executeNextStep(instance)

    return instance
  }

  // Execute the next step
  private async executeNextStep(instance: WorkflowInstance): Promise<void> {
    if (!instance.currentStepId) {
      instance.status = 'completed'
      instance.completedAt = new Date()
      return
    }

    const definition = this.definitions.get(instance.workflowId)
    if (!definition) return

    const step = definition.steps.find(s => s.id === instance.currentStepId)
    if (!step) {
      instance.status = 'failed'
      instance.error = `Step ${instance.currentStepId} not found`
      return
    }

    instance.status = 'running'

    try {
      switch (step.type) {
        case 'approval':
          // Create pending approval, wait for user action
          instance.status = 'waiting'
          instance.stepHistory.push({
            stepId: step.id,
            step,
            status: 'in_progress',
          })
          break

        case 'notification':
          await this.executeNotification(step, instance)
          instance.currentStepId = step.nextStepId
          await this.executeNextStep(instance)
          break

        case 'condition':
          const result = await this.evaluateCondition(step, instance)
          const conditionConfig = step.config as ConditionConfig
          instance.currentStepId = result ? conditionConfig.trueStepId : conditionConfig.falseStepId
          instance.stepHistory.push({
            stepId: step.id,
            step,
            status: 'completed',
            executedAt: new Date(),
            result: { conditionResult: result },
          })
          await this.executeNextStep(instance)
          break

        case 'action':
          await this.executeAction(step, instance)
          instance.currentStepId = step.nextStepId
          instance.stepHistory.push({
            stepId: step.id,
            step,
            status: 'completed',
            executedAt: new Date(),
          })
          await this.executeNextStep(instance)
          break

        case 'delay':
          // Schedule next execution
          instance.status = 'waiting'
          instance.stepHistory.push({
            stepId: step.id,
            step,
            status: 'in_progress',
          })
          break

        default:
          instance.currentStepId = step.nextStepId
          await this.executeNextStep(instance)
      }
    } catch (error) {
      instance.status = 'failed'
      instance.error = error instanceof Error ? error.message : 'Unknown error'
      instance.stepHistory.push({
        stepId: step.id,
        step,
        status: 'failed',
        executedAt: new Date(),
        error: instance.error,
      })
    }
  }

  // Process approval decision
  async processApproval(
    instanceId: string,
    stepId: string,
    userId: string,
    decision: 'approved' | 'rejected',
    comments?: string
  ): Promise<void> {
    const instance = this.instances.get(instanceId)
    if (!instance) throw new Error('Instance not found')

    const definition = this.definitions.get(instance.workflowId)
    if (!definition) throw new Error('Workflow not found')

    const step = definition.steps.find(s => s.id === stepId)
    if (!step) throw new Error('Step not found')

    // Update step history
    const stepExecution = instance.stepHistory.find(h => h.stepId === stepId && h.status === 'in_progress')
    if (stepExecution) {
      stepExecution.status = 'completed'
      stepExecution.executedById = userId
      stepExecution.executedAt = new Date()
      stepExecution.decision = decision
      stepExecution.comments = comments
    }

    // Route to next step
    if (decision === 'approved') {
      instance.currentStepId = step.onSuccessStepId || step.nextStepId
    } else {
      instance.currentStepId = step.onFailureStepId
      if (!instance.currentStepId) {
        instance.status = 'cancelled'
        instance.cancelledAt = new Date()
        return
      }
    }

    await this.executeNextStep(instance)
  }

  // Execute notification step
  private async executeNotification(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    const config = step.config as NotificationConfig
    // TODO: Implement notification sending based on config
    console.log('Sending notification:', config, instance.id)
  }

  // Evaluate condition
  private async evaluateCondition(step: WorkflowStep, instance: WorkflowInstance): Promise<boolean> {
    const config = step.config as ConditionConfig
    const fieldValue = instance.triggerData?.[config.field]
    
    switch (config.operator) {
      case 'eq': return fieldValue === config.value
      case 'ne': return fieldValue !== config.value
      case 'gt': return Number(fieldValue) > Number(config.value)
      case 'lt': return Number(fieldValue) < Number(config.value)
      case 'contains': return String(fieldValue).includes(String(config.value))
      case 'in': return Array.isArray(config.value) && config.value.includes(fieldValue)
      default: return false
    }
  }

  // Execute action step
  private async executeAction(step: WorkflowStep, instance: WorkflowInstance): Promise<void> {
    const config = step.config as ActionConfig
    // TODO: Implement action execution based on config
    console.log('Executing action:', config, instance.id)
  }

  // Get instance by ID
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId)
  }

  // Get pending approvals for user
  getPendingApprovals(userId: string): WorkflowInstance[] {
    return Array.from(this.instances.values()).filter(instance => {
      if (instance.status !== 'waiting') return false
      
      const definition = this.definitions.get(instance.workflowId)
      if (!definition) return false
      
      const currentStep = definition.steps.find(s => s.id === instance.currentStepId)
      if (!currentStep || currentStep.type !== 'approval') return false
      
      const config = currentStep.config as ApprovalConfig
      return config.approverId === userId || config.approverType === 'manager'
    })
  }
}

// =============================================================================
// BUILT-IN WORKFLOW TEMPLATES
// =============================================================================

export const WORKFLOW_TEMPLATES: Partial<WorkflowDefinition>[] = [
  {
    name: 'Leave Request Approval',
    nameVi: 'Duyệt đơn nghỉ phép',
    trigger: 'on_create',
    triggerConfig: { resource: 'leave_request' },
    module: 'hrm',
    steps: [
      {
        id: 'manager_approval',
        name: 'Manager Approval',
        type: 'approval',
        order: 1,
        config: { approverType: 'manager' } as ApprovalConfig,
        onSuccessStepId: 'notify_approved',
        onFailureStepId: 'notify_rejected',
      },
      {
        id: 'notify_approved',
        name: 'Notify Approved',
        type: 'notification',
        order: 2,
        config: { recipientType: 'requester', template: 'leave_approved', channel: 'all' } as NotificationConfig,
      },
      {
        id: 'notify_rejected',
        name: 'Notify Rejected',
        type: 'notification',
        order: 3,
        config: { recipientType: 'requester', template: 'leave_rejected', channel: 'all' } as NotificationConfig,
      },
    ],
  },
  {
    name: 'Expense Approval',
    nameVi: 'Duyệt chi phí',
    trigger: 'on_create',
    triggerConfig: { resource: 'expense' },
    module: 'finance',
    steps: [
      {
        id: 'check_amount',
        name: 'Check Amount',
        type: 'condition',
        order: 1,
        config: { 
          field: 'amount', 
          operator: 'gt', 
          value: 5000000,
          trueStepId: 'director_approval',
          falseStepId: 'manager_approval',
        } as ConditionConfig,
      },
      {
        id: 'manager_approval',
        name: 'Manager Approval',
        type: 'approval',
        order: 2,
        config: { approverType: 'manager' } as ApprovalConfig,
        onSuccessStepId: 'process_payment',
        onFailureStepId: 'notify_rejected',
      },
      {
        id: 'director_approval',
        name: 'Director Approval',
        type: 'approval',
        order: 3,
        config: { approverType: 'role', approverRoleId: 'director' } as ApprovalConfig,
        onSuccessStepId: 'process_payment',
        onFailureStepId: 'notify_rejected',
      },
      {
        id: 'process_payment',
        name: 'Process Payment',
        type: 'action',
        order: 4,
        config: { 
          actionType: 'update_field', 
          fieldUpdates: { status: 'approved' } 
        } as ActionConfig,
        nextStepId: 'notify_approved',
      },
      {
        id: 'notify_approved',
        name: 'Notify Approved',
        type: 'notification',
        order: 5,
        config: { recipientType: 'requester', template: 'expense_approved', channel: 'all' } as NotificationConfig,
      },
      {
        id: 'notify_rejected',
        name: 'Notify Rejected',
        type: 'notification',
        order: 6,
        config: { recipientType: 'requester', template: 'expense_rejected', channel: 'all' } as NotificationConfig,
      },
    ],
  },
]

// Singleton instance
export const workflowEngine = new WorkflowEngine()
