/**
 * Workflow Engine - JSON-based Workflow Definitions
 * 
 * Multi-step approval workflows like Kissflow/Jira.
 * Supports condition rules, triggers, and onComplete actions.
 */

import { 
  WorkflowDefinition, 
  WorkflowInstance, 
  WorkflowStep,
  WorkflowStatus,
  WorkflowHistoryEntry,
  WorkflowCondition,
  WorkflowStepConfig,
  User
} from './types';
import { notificationSystem, NotificationTemplates } from './notification-system';

type WorkflowEventHandler = (instance: WorkflowInstance, event: WorkflowEvent) => void | Promise<void>;
type ActionHandler = (instance: WorkflowInstance, step: WorkflowStep, payload: Record<string, unknown>) => Promise<void>;

interface WorkflowEvent {
  type: 'started' | 'step_completed' | 'step_rejected' | 'completed' | 'cancelled' | 'timeout';
  stepId?: string;
  performedBy?: string;
  data?: Record<string, unknown>;
}

interface StartWorkflowOptions {
  definitionId: string;
  entityType: string;
  entityId: string;
  data: Record<string, unknown>;
  startedBy: string;
}

interface StepActionOptions {
  instanceId: string;
  stepId: string;
  action: 'approve' | 'reject' | 'complete' | 'skip';
  performedBy: string;
  comment?: string;
  data?: Record<string, unknown>;
}

class WorkflowEngine {
  private definitions: Map<string, WorkflowDefinition> = new Map();
  private instances: Map<string, WorkflowInstance> = new Map();
  private eventHandlers: Set<WorkflowEventHandler> = new Set();
  private actionHandlers: Map<string, ActionHandler> = new Map();
  private timeoutTimers: Map<string, NodeJS.Timeout> = new Map();

  // ============================================
  // Definition Management
  // ============================================

  /**
   * Register a workflow definition
   */
  registerDefinition(definition: WorkflowDefinition): void {
    // Validate definition
    this.validateDefinition(definition);
    this.definitions.set(definition.id, definition);
  }

  /**
   * Get a workflow definition
   */
  getDefinition(definitionId: string): WorkflowDefinition | undefined {
    return this.definitions.get(definitionId);
  }

  /**
   * Get all definitions
   */
  getAllDefinitions(): WorkflowDefinition[] {
    return Array.from(this.definitions.values());
  }

  /**
   * Get definitions by module
   */
  getDefinitionsByModule(moduleId: string): WorkflowDefinition[] {
    return this.getAllDefinitions().filter(d => d.moduleId === moduleId);
  }

  /**
   * Update a definition
   */
  updateDefinition(definitionId: string, updates: Partial<WorkflowDefinition>): void {
    const definition = this.definitions.get(definitionId);
    if (!definition) {
      throw new Error(`Workflow definition "${definitionId}" not found`);
    }

    const updated = { ...definition, ...updates, id: definitionId, updatedAt: new Date() };
    this.validateDefinition(updated);
    this.definitions.set(definitionId, updated);
  }

  /**
   * Delete a definition
   */
  deleteDefinition(definitionId: string): boolean {
    // Check for active instances
    const activeInstances = this.getInstancesByDefinition(definitionId)
      .filter(i => !['completed', 'cancelled'].includes(i.status));
    
    if (activeInstances.length > 0) {
      throw new Error(`Cannot delete definition with ${activeInstances.length} active instances`);
    }

    return this.definitions.delete(definitionId);
  }

  private validateDefinition(definition: WorkflowDefinition): void {
    if (!definition.id || !definition.name) {
      throw new Error('Definition must have id and name');
    }

    if (!definition.steps || definition.steps.length === 0) {
      throw new Error('Definition must have at least one step');
    }

    // Validate step references
    const stepIds = new Set(definition.steps.map(s => s.id));
    for (const step of definition.steps) {
      if (step.nextStepId && !stepIds.has(step.nextStepId)) {
        throw new Error(`Step "${step.id}" references non-existent next step "${step.nextStepId}"`);
      }
      if (step.onRejectStepId && !stepIds.has(step.onRejectStepId)) {
        throw new Error(`Step "${step.id}" references non-existent reject step "${step.onRejectStepId}"`);
      }
    }
  }

  // ============================================
  // Instance Management
  // ============================================

  /**
   * Start a new workflow instance
   */
  async startWorkflow(options: StartWorkflowOptions): Promise<WorkflowInstance> {
    const definition = this.definitions.get(options.definitionId);
    if (!definition) {
      throw new Error(`Workflow definition "${options.definitionId}" not found`);
    }

    if (!definition.isActive) {
      throw new Error(`Workflow definition "${options.definitionId}" is not active`);
    }

    // Find first step
    const firstStep = definition.steps.find(s => s.order === 1) || definition.steps[0];

    const instance: WorkflowInstance = {
      id: this.generateId(),
      definitionId: options.definitionId,
      entityType: options.entityType,
      entityId: options.entityId,
      status: 'active',
      currentStepId: firstStep.id,
      data: options.data,
      history: [{
        stepId: firstStep.id,
        stepName: firstStep.name,
        action: 'started',
        performedBy: options.startedBy,
        timestamp: new Date(),
      }],
      startedAt: new Date(),
    };

    this.instances.set(instance.id, instance);

    // Emit event
    await this.emitEvent(instance, { type: 'started', stepId: firstStep.id, performedBy: options.startedBy });

    // Process first step
    await this.processStep(instance, firstStep);

    return instance;
  }

  /**
   * Get a workflow instance
   */
  getInstance(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Get all instances
   */
  getAllInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get instances by entity
   */
  getInstancesByEntity(entityType: string, entityId: string): WorkflowInstance[] {
    return this.getAllInstances().filter(
      i => i.entityType === entityType && i.entityId === entityId
    );
  }

  /**
   * Get instances by definition
   */
  getInstancesByDefinition(definitionId: string): WorkflowInstance[] {
    return this.getAllInstances().filter(i => i.definitionId === definitionId);
  }

  /**
   * Get instances by status
   */
  getInstancesByStatus(status: WorkflowStatus): WorkflowInstance[] {
    return this.getAllInstances().filter(i => i.status === status);
  }

  /**
   * Get pending approvals for a user
   */
  getPendingApprovalsForUser(userId: string, userRole?: string): WorkflowInstance[] {
    return this.getAllInstances().filter(instance => {
      if (instance.status !== 'active') return false;

      const definition = this.definitions.get(instance.definitionId);
      if (!definition) return false;

      const currentStep = definition.steps.find(s => s.id === instance.currentStepId);
      if (!currentStep || currentStep.type !== 'approval') return false;

      // Check if user is assignee
      const config = currentStep.config;
      if (config.assigneeType === 'user' && config.assigneeId === userId) {
        return true;
      }
      if (config.assigneeType === 'role' && config.assigneeId === userRole) {
        return true;
      }
      if (config.assigneeType === 'dynamic' && config.assigneeField) {
        return instance.data[config.assigneeField] === userId;
      }

      return false;
    });
  }

  // ============================================
  // Step Processing
  // ============================================

  /**
   * Perform action on a step
   */
  async performStepAction(options: StepActionOptions): Promise<WorkflowInstance> {
    const instance = this.instances.get(options.instanceId);
    if (!instance) {
      throw new Error(`Workflow instance "${options.instanceId}" not found`);
    }

    if (instance.status !== 'active') {
      throw new Error(`Cannot perform action on ${instance.status} workflow`);
    }

    if (instance.currentStepId !== options.stepId) {
      throw new Error(`Step "${options.stepId}" is not the current step`);
    }

    const definition = this.definitions.get(instance.definitionId)!;
    const currentStep = definition.steps.find(s => s.id === options.stepId)!;

    // Update data if provided
    if (options.data) {
      instance.data = { ...instance.data, ...options.data };
    }

    // Add history entry
    const historyEntry: WorkflowHistoryEntry = {
      stepId: options.stepId,
      stepName: currentStep.name,
      action: options.action === 'approve' ? 'approved' : 
              options.action === 'reject' ? 'rejected' : 
              options.action === 'skip' ? 'skipped' : 'completed',
      performedBy: options.performedBy,
      comment: options.comment,
      timestamp: new Date(),
    };
    instance.history.push(historyEntry);

    // Clear timeout if exists
    this.clearStepTimeout(instance.id, options.stepId);

    // Handle action
    if (options.action === 'reject' && currentStep.onRejectStepId) {
      // Go to reject step
      instance.currentStepId = currentStep.onRejectStepId;
      const rejectStep = definition.steps.find(s => s.id === currentStep.onRejectStepId)!;
      await this.emitEvent(instance, { type: 'step_rejected', stepId: options.stepId, performedBy: options.performedBy });
      await this.processStep(instance, rejectStep);
    } else if (options.action === 'reject') {
      // No reject step, cancel workflow
      instance.status = 'cancelled';
      instance.completedAt = new Date();
      await this.emitEvent(instance, { type: 'cancelled', stepId: options.stepId, performedBy: options.performedBy });
    } else if (currentStep.nextStepId) {
      // Move to next step
      instance.currentStepId = currentStep.nextStepId;
      const nextStep = definition.steps.find(s => s.id === currentStep.nextStepId)!;
      await this.emitEvent(instance, { type: 'step_completed', stepId: options.stepId, performedBy: options.performedBy });
      await this.processStep(instance, nextStep);
    } else {
      // No next step, complete workflow
      instance.status = 'completed';
      instance.completedAt = new Date();
      await this.emitEvent(instance, { type: 'completed', performedBy: options.performedBy });
    }

    this.instances.set(instance.id, instance);
    return instance;
  }

  private async processStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // Check conditions
    if (step.conditions && !this.evaluateConditions(step.conditions, instance.data)) {
      // Skip step if conditions not met
      if (step.nextStepId) {
        instance.currentStepId = step.nextStepId;
        instance.history.push({
          stepId: step.id,
          stepName: step.name,
          action: 'skipped',
          performedBy: 'system',
          comment: 'Conditions not met',
          timestamp: new Date(),
        });
        const definition = this.definitions.get(instance.definitionId)!;
        const nextStep = definition.steps.find(s => s.id === step.nextStepId)!;
        await this.processStep(instance, nextStep);
      }
      return;
    }

    // Handle different step types
    switch (step.type) {
      case 'approval':
        await this.handleApprovalStep(instance, step);
        break;
      case 'task':
        await this.handleTaskStep(instance, step);
        break;
      case 'notification':
        await this.handleNotificationStep(instance, step);
        // Auto-continue after notification
        if (step.nextStepId) {
          const definition = this.definitions.get(instance.definitionId)!;
          const nextStep = definition.steps.find(s => s.id === step.nextStepId)!;
          instance.currentStepId = step.nextStepId;
          await this.processStep(instance, nextStep);
        } else {
          instance.status = 'completed';
          instance.completedAt = new Date();
        }
        break;
      case 'action':
        await this.handleActionStep(instance, step);
        // Auto-continue after action
        if (step.nextStepId) {
          const definition = this.definitions.get(instance.definitionId)!;
          const nextStep = definition.steps.find(s => s.id === step.nextStepId)!;
          instance.currentStepId = step.nextStepId;
          await this.processStep(instance, nextStep);
        } else {
          instance.status = 'completed';
          instance.completedAt = new Date();
        }
        break;
      case 'condition':
        // Condition steps just route based on conditions (already handled above)
        break;
    }

    // Set timeout if configured
    if (step.config.timeoutHours && step.type === 'approval') {
      this.setStepTimeout(instance, step);
    }
  }

  private async handleApprovalStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const config = step.config;
    
    // Auto-approve if configured
    if (config.autoApprove) {
      await this.performStepAction({
        instanceId: instance.id,
        stepId: step.id,
        action: 'approve',
        performedBy: 'system',
        comment: 'Auto-approved',
      });
      return;
    }

    // Send notification to assignee
    let assigneeId: string | undefined;
    
    if (config.assigneeType === 'user') {
      assigneeId = config.assigneeId;
    } else if (config.assigneeType === 'dynamic' && config.assigneeField) {
      assigneeId = instance.data[config.assigneeField] as string;
    }

    if (assigneeId) {
      await notificationSystem.createFromTemplate(
        assigneeId,
        'APPROVAL_REQUIRED',
        {
          itemType: instance.entityType,
          itemName: (instance.data.name || instance.entityId) as string,
        },
        {
          moduleId: this.definitions.get(instance.definitionId)?.moduleId,
          entityType: instance.entityType,
          entityId: instance.entityId,
          actionUrl: `/workflow/${instance.id}/approve`,
        }
      );
    }
  }

  private async handleTaskStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const config = step.config;
    
    let assigneeId: string | undefined;
    
    if (config.assigneeType === 'user') {
      assigneeId = config.assigneeId;
    } else if (config.assigneeType === 'dynamic' && config.assigneeField) {
      assigneeId = instance.data[config.assigneeField] as string;
    }

    if (assigneeId) {
      await notificationSystem.createFromTemplate(
        assigneeId,
        'TASK_ASSIGNED',
        {
          taskName: step.name,
          assignerName: 'Workflow System',
        },
        {
          moduleId: this.definitions.get(instance.definitionId)?.moduleId,
          entityType: 'workflow_task',
          entityId: instance.id,
          actionUrl: `/workflow/${instance.id}/task/${step.id}`,
        }
      );
    }
  }

  private async handleNotificationStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const config = step.config;
    
    if (config.notificationTemplate && config.assigneeId) {
      await notificationSystem.createNotification(config.assigneeId, {
        title: step.name,
        message: this.interpolate(config.notificationTemplate, instance.data),
        category: 'system',
        priority: 'medium',
        moduleId: this.definitions.get(instance.definitionId)?.moduleId,
        entityType: instance.entityType,
        entityId: instance.entityId,
      });
    }
  }

  private async handleActionStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const config = step.config;
    
    if (config.actionType) {
      const handler = this.actionHandlers.get(config.actionType);
      if (handler) {
        await handler(instance, step, config.actionPayload || {});
      }
    }
  }

  // ============================================
  // Condition Evaluation
  // ============================================

  private evaluateConditions(conditions: WorkflowCondition[], data: Record<string, unknown>): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, data));
  }

  private evaluateCondition(condition: WorkflowCondition, data: Record<string, unknown>): boolean {
    const fieldValue = this.getNestedValue(data, condition.field);

    switch (condition.operator) {
      case 'eq':
        return fieldValue === condition.value;
      case 'ne':
        return fieldValue !== condition.value;
      case 'gt':
        return (fieldValue as number) > (condition.value as number);
      case 'gte':
        return (fieldValue as number) >= (condition.value as number);
      case 'lt':
        return (fieldValue as number) < (condition.value as number);
      case 'lte':
        return (fieldValue as number) <= (condition.value as number);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'in':
        return (condition.value as unknown[]).includes(fieldValue);
      default:
        return false;
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((acc: unknown, key) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  // ============================================
  // Timeout Management
  // ============================================

  private setStepTimeout(instance: WorkflowInstance, step: WorkflowStep): void {
    const timeoutMs = (step.config.timeoutHours || 24) * 60 * 60 * 1000;
    const timerId = setTimeout(async () => {
      await this.handleStepTimeout(instance.id, step.id);
    }, timeoutMs);

    this.timeoutTimers.set(`${instance.id}:${step.id}`, timerId);
  }

  private clearStepTimeout(instanceId: string, stepId: string): void {
    const key = `${instanceId}:${stepId}`;
    const timer = this.timeoutTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timeoutTimers.delete(key);
    }
  }

  private async handleStepTimeout(instanceId: string, stepId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance || instance.status !== 'active' || instance.currentStepId !== stepId) {
      return;
    }

    await this.emitEvent(instance, { type: 'timeout', stepId });

    // For now, just add to history and notify
    instance.history.push({
      stepId,
      stepName: 'Timeout',
      action: 'skipped',
      performedBy: 'system',
      comment: 'Step timed out',
      timestamp: new Date(),
    });
  }

  // ============================================
  // Event Handling
  // ============================================

  /**
   * Subscribe to workflow events
   */
  onEvent(handler: WorkflowEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  /**
   * Register a custom action handler
   */
  registerActionHandler(actionType: string, handler: ActionHandler): void {
    this.actionHandlers.set(actionType, handler);
  }

  private async emitEvent(instance: WorkflowInstance, event: WorkflowEvent): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(instance, event);
      } catch (error) {
        console.error('Workflow event handler error:', error);
      }
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  private generateId(): string {
    return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private interpolate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const value = this.getNestedValue(data, path);
      return value !== undefined ? String(value) : `{{${path}}}`;
    });
  }

  /**
   * Cancel a workflow instance
   */
  async cancelWorkflow(instanceId: string, cancelledBy: string, reason?: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance "${instanceId}" not found`);
    }

    if (['completed', 'cancelled'].includes(instance.status)) {
      throw new Error(`Cannot cancel ${instance.status} workflow`);
    }

    instance.status = 'cancelled';
    instance.completedAt = new Date();
    instance.history.push({
      stepId: instance.currentStepId,
      stepName: 'Cancelled',
      action: 'skipped',
      performedBy: cancelledBy,
      comment: reason || 'Workflow cancelled',
      timestamp: new Date(),
    });

    this.instances.set(instanceId, instance);
    await this.emitEvent(instance, { type: 'cancelled', performedBy: cancelledBy });
  }

  /**
   * Put workflow on hold
   */
  async holdWorkflow(instanceId: string, heldBy: string, reason?: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance "${instanceId}" not found`);
    }

    if (instance.status !== 'active') {
      throw new Error(`Cannot hold ${instance.status} workflow`);
    }

    instance.status = 'on_hold';
    instance.history.push({
      stepId: instance.currentStepId,
      stepName: 'On Hold',
      action: 'skipped',
      performedBy: heldBy,
      comment: reason || 'Workflow put on hold',
      timestamp: new Date(),
    });

    this.instances.set(instanceId, instance);
  }

  /**
   * Resume workflow from hold
   */
  async resumeWorkflow(instanceId: string, resumedBy: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Workflow instance "${instanceId}" not found`);
    }

    if (instance.status !== 'on_hold') {
      throw new Error(`Cannot resume ${instance.status} workflow`);
    }

    instance.status = 'active';
    instance.history.push({
      stepId: instance.currentStepId,
      stepName: 'Resumed',
      action: 'started',
      performedBy: resumedBy,
      comment: 'Workflow resumed',
      timestamp: new Date(),
    });

    this.instances.set(instanceId, instance);
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();

// Export types
export type { WorkflowEventHandler, ActionHandler, WorkflowEvent, StartWorkflowOptions, StepActionOptions };
