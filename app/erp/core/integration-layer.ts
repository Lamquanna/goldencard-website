/**
 * HOME Platform - Integration Layer
 * Connect external services: Accounting, Email, Calendar
 */

// =============================================================================
// INTEGRATION TYPES
// =============================================================================

export type IntegrationType = 
  | 'accounting'
  | 'email'
  | 'calendar'
  | 'storage'
  | 'communication'
  | 'payment'
  | 'erp'
  | 'custom'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

export interface IntegrationConfig {
  id: string
  name: string
  nameVi: string
  type: IntegrationType
  provider: string
  description: string
  descriptionVi: string
  icon: string
  status: IntegrationStatus
  
  // Connection
  isConfigured: boolean
  credentials?: Record<string, unknown>
  settings?: Record<string, unknown>
  
  // Sync
  lastSyncAt?: Date
  syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'manual'
  
  // Mapping
  fieldMappings?: FieldMapping[]
  
  // Metadata
  connectedAt?: Date
  connectedBy?: string
}

export interface FieldMapping {
  sourceField: string
  targetField: string
  transform?: 'direct' | 'uppercase' | 'lowercase' | 'date' | 'currency' | 'custom'
  customTransform?: string
}

export interface IntegrationEvent {
  id: string
  integrationId: string
  type: 'sync' | 'push' | 'pull' | 'webhook' | 'error'
  status: 'success' | 'failed' | 'pending'
  message?: string
  data?: Record<string, unknown>
  timestamp: Date
}

// =============================================================================
// AVAILABLE INTEGRATIONS
// =============================================================================

export const availableIntegrations: Omit<IntegrationConfig, 'status' | 'isConfigured'>[] = [
  // Accounting
  {
    id: 'misa',
    name: 'MISA Accounting',
    nameVi: 'Kế toán MISA',
    type: 'accounting',
    provider: 'MISA',
    description: 'Sync invoices, expenses, and financial data with MISA',
    descriptionVi: 'Đồng bộ hóa đơn, chi phí và dữ liệu tài chính với MISA',
    icon: '📊',
  },
  {
    id: 'fast',
    name: 'FAST Accounting',
    nameVi: 'Kế toán FAST',
    type: 'accounting',
    provider: 'FAST',
    description: 'Connect to FAST accounting software',
    descriptionVi: 'Kết nối với phần mềm kế toán FAST',
    icon: '⚡',
  },
  {
    id: 'einvoice',
    name: 'E-Invoice',
    nameVi: 'Hóa đơn điện tử',
    type: 'accounting',
    provider: 'Vietnam E-Invoice',
    description: 'Automatic e-invoice generation and submission',
    descriptionVi: 'Tự động tạo và nộp hóa đơn điện tử',
    icon: '🧾',
  },
  
  // Email
  {
    id: 'gmail',
    name: 'Gmail',
    nameVi: 'Gmail',
    type: 'email',
    provider: 'Google',
    description: 'Send emails and track communications via Gmail',
    descriptionVi: 'Gửi email và theo dõi giao tiếp qua Gmail',
    icon: '📧',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    nameVi: 'Outlook',
    type: 'email',
    provider: 'Microsoft',
    description: 'Microsoft Outlook email integration',
    descriptionVi: 'Tích hợp email Microsoft Outlook',
    icon: '📬',
  },
  
  // Calendar
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    nameVi: 'Google Calendar',
    type: 'calendar',
    provider: 'Google',
    description: 'Sync meetings and deadlines with Google Calendar',
    descriptionVi: 'Đồng bộ cuộc họp và deadline với Google Calendar',
    icon: '📅',
  },
  
  // Storage
  {
    id: 'google-drive',
    name: 'Google Drive',
    nameVi: 'Google Drive',
    type: 'storage',
    provider: 'Google',
    description: 'Store and sync files with Google Drive (2TB)',
    descriptionVi: 'Lưu trữ và đồng bộ file với Google Drive (2TB)',
    icon: '☁️',
  },
  
  // Communication
  {
    id: 'zalo-oa',
    name: 'Zalo OA',
    nameVi: 'Zalo OA',
    type: 'communication',
    provider: 'Zalo',
    description: 'Send messages and notifications via Zalo OA',
    descriptionVi: 'Gửi tin nhắn và thông báo qua Zalo OA',
    icon: '💬',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    nameVi: 'Telegram Bot',
    type: 'communication',
    provider: 'Telegram',
    description: 'Notifications and commands via Telegram Bot',
    descriptionVi: 'Thông báo và lệnh qua Telegram Bot',
    icon: '✈️',
  },
  
  // Payment
  {
    id: 'vnpay',
    name: 'VNPay',
    nameVi: 'VNPay',
    type: 'payment',
    provider: 'VNPay',
    description: 'Accept payments via VNPay gateway',
    descriptionVi: 'Nhận thanh toán qua cổng VNPay',
    icon: '💳',
  },
  {
    id: 'momo',
    name: 'MoMo',
    nameVi: 'MoMo',
    type: 'payment',
    provider: 'MoMo',
    description: 'Accept payments via MoMo wallet',
    descriptionVi: 'Nhận thanh toán qua ví MoMo',
    icon: '🟣',
  },
]

// =============================================================================
// INTEGRATION MANAGER
// =============================================================================

class IntegrationManager {
  private integrations: Map<string, IntegrationConfig> = new Map()
  private events: IntegrationEvent[] = []
  private listeners: Set<(event: IntegrationEvent) => void> = new Set()

  constructor() {
    // Initialize with available integrations
    availableIntegrations.forEach(integration => {
      this.integrations.set(integration.id, {
        ...integration,
        status: 'disconnected',
        isConfigured: false,
      })
    })
  }

  // Get all integrations
  getAll(): IntegrationConfig[] {
    return Array.from(this.integrations.values())
  }

  // Get integration by ID
  get(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id)
  }

  // Get integrations by type
  getByType(type: IntegrationType): IntegrationConfig[] {
    return Array.from(this.integrations.values())
      .filter(i => i.type === type)
  }

  // Get connected integrations
  getConnected(): IntegrationConfig[] {
    return Array.from(this.integrations.values())
      .filter(i => i.status === 'connected')
  }

  // Configure integration
  configure(id: string, credentials: Record<string, unknown>, settings?: Record<string, unknown>): boolean {
    const integration = this.integrations.get(id)
    if (!integration) return false

    integration.credentials = credentials
    integration.settings = settings
    integration.isConfigured = true

    return true
  }

  // Connect integration
  async connect(id: string, userId: string): Promise<boolean> {
    const integration = this.integrations.get(id)
    if (!integration || !integration.isConfigured) return false

    try {
      // Simulate connection
      integration.status = 'pending'
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      integration.status = 'connected'
      integration.connectedAt = new Date()
      integration.connectedBy = userId

      this.logEvent(id, 'sync', 'success', 'Integration connected successfully')
      
      return true
    } catch (error) {
      integration.status = 'error'
      this.logEvent(id, 'error', 'failed', error instanceof Error ? error.message : 'Connection failed')
      return false
    }
  }

  // Disconnect integration
  disconnect(id: string): boolean {
    const integration = this.integrations.get(id)
    if (!integration) return false

    integration.status = 'disconnected'
    integration.connectedAt = undefined
    integration.connectedBy = undefined

    this.logEvent(id, 'sync', 'success', 'Integration disconnected')
    
    return true
  }

  // Sync data
  async sync(id: string): Promise<boolean> {
    const integration = this.integrations.get(id)
    if (!integration || integration.status !== 'connected') return false

    try {
      this.logEvent(id, 'sync', 'pending', 'Sync started')
      
      // Simulate sync
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      integration.lastSyncAt = new Date()
      this.logEvent(id, 'sync', 'success', 'Sync completed successfully')
      
      return true
    } catch (error) {
      this.logEvent(id, 'sync', 'failed', error instanceof Error ? error.message : 'Sync failed')
      return false
    }
  }

  // Push data to integration
  async push(id: string, data: Record<string, unknown>): Promise<boolean> {
    const integration = this.integrations.get(id)
    if (!integration || integration.status !== 'connected') return false

    try {
      this.logEvent(id, 'push', 'pending', 'Pushing data...', data)
      
      // Simulate push
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.logEvent(id, 'push', 'success', 'Data pushed successfully')
      
      return true
    } catch (error) {
      this.logEvent(id, 'push', 'failed', error instanceof Error ? error.message : 'Push failed')
      return false
    }
  }

  // Handle webhook
  async handleWebhook(id: string, payload: Record<string, unknown>): Promise<void> {
    const integration = this.integrations.get(id)
    if (!integration || integration.status !== 'connected') return

    this.logEvent(id, 'webhook', 'success', 'Webhook received', payload)
    
    // Notify listeners
    const event: IntegrationEvent = {
      id: `event_${Date.now()}`,
      integrationId: id,
      type: 'webhook',
      status: 'success',
      data: payload,
      timestamp: new Date(),
    }
    
    this.listeners.forEach(listener => listener(event))
  }

  // Log event
  private logEvent(
    integrationId: string,
    type: IntegrationEvent['type'],
    status: IntegrationEvent['status'],
    message?: string,
    data?: Record<string, unknown>
  ): void {
    const event: IntegrationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      type,
      status,
      message,
      data,
      timestamp: new Date(),
    }

    this.events.unshift(event)
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(0, 1000)
    }
  }

  // Get events
  getEvents(integrationId?: string, limit: number = 50): IntegrationEvent[] {
    let events = this.events
    
    if (integrationId) {
      events = events.filter(e => e.integrationId === integrationId)
    }
    
    return events.slice(0, limit)
  }

  // Subscribe to events
  subscribe(listener: (event: IntegrationEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const integrationManager = new IntegrationManager()

// =============================================================================
// REACT HOOK
// =============================================================================

import { useState, useEffect, useCallback } from 'react'

export function useIntegration(id: string) {
  const [integration, setIntegration] = useState<IntegrationConfig | undefined>(
    integrationManager.get(id)
  )
  const [events, setEvents] = useState<IntegrationEvent[]>([])
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    setIntegration(integrationManager.get(id))
    setEvents(integrationManager.getEvents(id))
  }, [id])

  const configure = useCallback((credentials: Record<string, unknown>, settings?: Record<string, unknown>) => {
    const success = integrationManager.configure(id, credentials, settings)
    if (success) {
      setIntegration(integrationManager.get(id))
    }
    return success
  }, [id])

  const connect = useCallback(async (userId: string) => {
    const success = await integrationManager.connect(id, userId)
    setIntegration(integrationManager.get(id))
    setEvents(integrationManager.getEvents(id))
    return success
  }, [id])

  const disconnect = useCallback(() => {
    const success = integrationManager.disconnect(id)
    setIntegration(integrationManager.get(id))
    setEvents(integrationManager.getEvents(id))
    return success
  }, [id])

  const sync = useCallback(async () => {
    setSyncing(true)
    const success = await integrationManager.sync(id)
    setSyncing(false)
    setIntegration(integrationManager.get(id))
    setEvents(integrationManager.getEvents(id))
    return success
  }, [id])

  return {
    integration,
    events,
    syncing,
    configure,
    connect,
    disconnect,
    sync,
  }
}

export function useIntegrations(type?: IntegrationType) {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([])

  useEffect(() => {
    if (type) {
      setIntegrations(integrationManager.getByType(type))
    } else {
      setIntegrations(integrationManager.getAll())
    }
  }, [type])

  return integrations
}
