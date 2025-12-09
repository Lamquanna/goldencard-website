/**
 * Integration Layer - External API Connections
 * 
 * Handles integrations with:
 * - MISA (accounting)
 * - Zalo OA (messaging)
 * - Gmail API (email)
 * - Google Drive (file storage)
 * - VNPay (payments)
 */

import { IntegrationConfig, IntegrationProvider } from './types';
import { auditLog } from './audit-log';

// ============================================
// Integration Interfaces
// ============================================

interface IntegrationCredentials {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  [key: string]: string | undefined;
}

interface IntegrationSettings {
  enabled: boolean;
  autoSync?: boolean;
  syncInterval?: number; // minutes
  webhookUrl?: string;
  [key: string]: unknown;
}

interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: string[];
  syncedAt: Date;
}

type IntegrationEventHandler = (event: IntegrationEvent) => void | Promise<void>;

interface IntegrationEvent {
  type: 'connected' | 'disconnected' | 'sync_started' | 'sync_completed' | 'sync_failed' | 'webhook';
  provider: IntegrationProvider;
  data?: Record<string, unknown>;
  error?: string;
}

// ============================================
// Provider-specific Interfaces
// ============================================

// MISA Accounting
interface MISAInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  issuedDate: Date;
}

interface MISACustomer {
  id: string;
  code: string;
  name: string;
  taxCode?: string;
  address?: string;
  phone?: string;
  email?: string;
}

// Zalo OA
interface ZaloMessage {
  recipientId: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, string>;
  attachments?: { type: string; url: string }[];
}

interface ZaloOAProfile {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  followersCount: number;
}

// Gmail
interface EmailMessage {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: { name: string; content: string; mimeType: string }[];
}

interface EmailThread {
  id: string;
  subject: string;
  messages: { from: string; to: string[]; body: string; date: Date }[];
}

// Google Drive
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  webViewLink: string;
  downloadUrl?: string;
  parentId?: string;
}

// VNPay
interface VNPayTransaction {
  orderId: string;
  amount: number;
  orderInfo: string;
  returnUrl: string;
  ipAddress: string;
}

interface VNPayResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  errorCode?: string;
  errorMessage?: string;
}

// ============================================
// Base Integration Class
// ============================================

abstract class BaseIntegration {
  protected config: IntegrationConfig;
  
  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sync(): Promise<SyncResult>;
  abstract testConnection(): Promise<boolean>;
  
  isEnabled(): boolean {
    return this.config.isEnabled;
  }
  
  getProvider(): IntegrationProvider {
    return this.config.provider;
  }

  protected async refreshTokenIfNeeded(): Promise<void> {
    // Override in subclasses that use OAuth
  }
}

// ============================================
// MISA Integration
// ============================================

class MISAIntegration extends BaseIntegration {
  private baseUrl = 'https://api.misa.vn';

  async connect(): Promise<void> {
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to MISA');
    }
  }

  async disconnect(): Promise<void> {
    // Clear tokens
    this.config.credentials = {};
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test API call
      return true;
    } catch {
      return false;
    }
  }

  async sync(): Promise<SyncResult> {
    const result: SyncResult = {
      success: true,
      itemsSynced: 0,
      errors: [],
      syncedAt: new Date(),
    };

    try {
      // Sync invoices
      const invoices = await this.getInvoices();
      result.itemsSynced += invoices.length;

      // Sync customers
      const customers = await this.getCustomers();
      result.itemsSynced += customers.length;
    } catch (error) {
      result.success = false;
      result.errors.push(String(error));
    }

    return result;
  }

  async getInvoices(fromDate?: Date, toDate?: Date): Promise<MISAInvoice[]> {
    // API call to get invoices
    return [];
  }

  async createInvoice(invoice: Partial<MISAInvoice>): Promise<MISAInvoice> {
    // API call to create invoice
    return invoice as MISAInvoice;
  }

  async getCustomers(): Promise<MISACustomer[]> {
    // API call to get customers
    return [];
  }

  async createCustomer(customer: Partial<MISACustomer>): Promise<MISACustomer> {
    // API call to create customer
    return customer as MISACustomer;
  }
}

// ============================================
// Zalo OA Integration
// ============================================

class ZaloOAIntegration extends BaseIntegration {
  private baseUrl = 'https://openapi.zalo.me/v2.0';

  async connect(): Promise<void> {
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to Zalo OA');
    }
  }

  async disconnect(): Promise<void> {
    this.config.credentials = {};
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getOAProfile();
      return true;
    } catch {
      return false;
    }
  }

  async sync(): Promise<SyncResult> {
    return {
      success: true,
      itemsSynced: 0,
      errors: [],
      syncedAt: new Date(),
    };
  }

  async getOAProfile(): Promise<ZaloOAProfile> {
    // API call to get OA profile
    return {
      id: '',
      name: '',
      followersCount: 0,
    };
  }

  async sendMessage(message: ZaloMessage): Promise<{ messageId: string }> {
    // API call to send message
    return { messageId: '' };
  }

  async sendBroadcast(userIds: string[], message: Omit<ZaloMessage, 'recipientId'>): Promise<{
    sent: number;
    failed: number;
  }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.sendMessage({ ...message, recipientId: userId });
        sent++;
      } catch {
        failed++;
      }
    }

    return { sent, failed };
  }

  async getFollowers(offset: number = 0, count: number = 50): Promise<{
    followers: { userId: string; displayName: string }[];
    total: number;
  }> {
    // API call to get followers
    return { followers: [], total: 0 };
  }
}

// ============================================
// Gmail Integration
// ============================================

class GmailIntegration extends BaseIntegration {
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1';

  async connect(): Promise<void> {
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to Gmail');
    }
  }

  async disconnect(): Promise<void> {
    // Revoke OAuth token
    this.config.credentials = {};
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test by getting user profile
      return true;
    } catch {
      return false;
    }
  }

  async sync(): Promise<SyncResult> {
    return {
      success: true,
      itemsSynced: 0,
      errors: [],
      syncedAt: new Date(),
    };
  }

  async sendEmail(message: EmailMessage): Promise<{ messageId: string }> {
    // API call to send email
    return { messageId: '' };
  }

  async getEmails(query?: string, maxResults: number = 20): Promise<EmailThread[]> {
    // API call to get emails
    return [];
  }

  async getEmail(messageId: string): Promise<EmailThread | null> {
    // API call to get single email
    return null;
  }

  async createDraft(message: EmailMessage): Promise<{ draftId: string }> {
    // API call to create draft
    return { draftId: '' };
  }

  async getLabels(): Promise<{ id: string; name: string }[]> {
    // API call to get labels
    return [];
  }
}

// ============================================
// Google Drive Integration
// ============================================

class GoogleDriveIntegration extends BaseIntegration {
  private baseUrl = 'https://www.googleapis.com/drive/v3';

  async connect(): Promise<void> {
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to Google Drive');
    }
  }

  async disconnect(): Promise<void> {
    this.config.credentials = {};
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getStorageQuota();
      return true;
    } catch {
      return false;
    }
  }

  async sync(): Promise<SyncResult> {
    return {
      success: true,
      itemsSynced: 0,
      errors: [],
      syncedAt: new Date(),
    };
  }

  async uploadFile(
    name: string,
    content: Blob | File,
    mimeType: string,
    parentId?: string
  ): Promise<DriveFile> {
    // API call to upload file
    return {
      id: '',
      name,
      mimeType,
      size: content.size,
      webViewLink: '',
    };
  }

  async downloadFile(fileId: string): Promise<Blob> {
    // API call to download file
    return new Blob();
  }

  async listFiles(
    folderId?: string,
    query?: string,
    pageSize: number = 50
  ): Promise<{ files: DriveFile[]; nextPageToken?: string }> {
    // API call to list files
    return { files: [] };
  }

  async createFolder(name: string, parentId?: string): Promise<DriveFile> {
    // API call to create folder
    return {
      id: '',
      name,
      mimeType: 'application/vnd.google-apps.folder',
      size: 0,
      webViewLink: '',
      parentId,
    };
  }

  async deleteFile(fileId: string): Promise<void> {
    // API call to delete file
  }

  async moveFile(fileId: string, newParentId: string, removeFromParentId?: string): Promise<DriveFile> {
    // API call to move file
    return {} as DriveFile;
  }

  async getStorageQuota(): Promise<{ used: number; total: number }> {
    // API call to get storage quota
    return { used: 0, total: 0 };
  }
}

// ============================================
// VNPay Integration
// ============================================

class VNPayIntegration extends BaseIntegration {
  private baseUrl = 'https://sandbox.vnpayment.vn';
  private version = '2.1.0';

  async connect(): Promise<void> {
    const isValid = await this.testConnection();
    if (!isValid) {
      throw new Error('Failed to connect to VNPay');
    }
  }

  async disconnect(): Promise<void> {
    this.config.credentials = {};
  }

  async testConnection(): Promise<boolean> {
    // VNPay doesn't have a test endpoint, just validate credentials exist
    return !!(this.config.credentials.apiKey && this.config.credentials.apiSecret);
  }

  async sync(): Promise<SyncResult> {
    return {
      success: true,
      itemsSynced: 0,
      errors: [],
      syncedAt: new Date(),
    };
  }

  async createPayment(transaction: VNPayTransaction): Promise<VNPayResult> {
    // Generate VNPay payment URL
    const params = this.buildPaymentParams(transaction);
    const paymentUrl = `${this.baseUrl}/paymentv2/vpcpay.html?${params}`;

    return {
      success: true,
      paymentUrl,
    };
  }

  async queryTransaction(orderId: string, transDate: string): Promise<VNPayResult> {
    // API call to query transaction status
    return {
      success: true,
      transactionId: orderId,
    };
  }

  async refund(
    orderId: string,
    amount: number,
    transactionId: string,
    transDate: string
  ): Promise<VNPayResult> {
    // API call to request refund
    return {
      success: true,
      transactionId,
    };
  }

  verifyReturnUrl(params: Record<string, string>): boolean {
    // Verify the signature of return URL params
    const secureHash = params['vnp_SecureHash'];
    const calculatedHash = this.calculateSecureHash(params);
    return secureHash === calculatedHash;
  }

  private buildPaymentParams(transaction: VNPayTransaction): string {
    const params: Record<string, string> = {
      vnp_Version: this.version,
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.credentials.apiKey || '',
      vnp_Amount: (transaction.amount * 100).toString(),
      vnp_CreateDate: this.formatDate(new Date()),
      vnp_CurrCode: 'VND',
      vnp_IpAddr: transaction.ipAddress,
      vnp_Locale: 'vn',
      vnp_OrderInfo: transaction.orderInfo,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: transaction.returnUrl,
      vnp_TxnRef: transaction.orderId,
    };

    // Sort and build query string
    const sortedParams = Object.keys(params).sort();
    const queryParts = sortedParams.map(key => `${key}=${encodeURIComponent(params[key])}`);
    
    // Add secure hash
    const secureHash = this.calculateSecureHash(params);
    queryParts.push(`vnp_SecureHash=${secureHash}`);

    return queryParts.join('&');
  }

  private calculateSecureHash(params: Record<string, string>): string {
    // Calculate HMAC SHA512 hash
    const sortedKeys = Object.keys(params)
      .filter(k => k.startsWith('vnp_') && k !== 'vnp_SecureHash')
      .sort();
    
    const hashData = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
    
    // In real implementation, use crypto.createHmac
    return hashData; // Placeholder
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  }
}

// ============================================
// Integration Manager
// ============================================

class IntegrationLayer {
  private configs: Map<IntegrationProvider, IntegrationConfig> = new Map();
  private instances: Map<IntegrationProvider, BaseIntegration> = new Map();
  private eventHandlers: Set<IntegrationEventHandler> = new Set();
  private syncTimers: Map<IntegrationProvider, NodeJS.Timeout> = new Map();

  /**
   * Configure an integration
   */
  configure(config: IntegrationConfig): void {
    this.configs.set(config.provider, config);
    
    // Create instance
    const instance = this.createInstance(config);
    if (instance) {
      this.instances.set(config.provider, instance);
    }
  }

  private createInstance(config: IntegrationConfig): BaseIntegration | null {
    switch (config.provider) {
      case 'misa':
        return new MISAIntegration(config);
      case 'zalo_oa':
        return new ZaloOAIntegration(config);
      case 'gmail':
        return new GmailIntegration(config);
      case 'google_drive':
        return new GoogleDriveIntegration(config);
      case 'vnpay':
        return new VNPayIntegration(config);
      default:
        return null;
    }
  }

  /**
   * Get integration instance
   */
  get<T extends BaseIntegration>(provider: IntegrationProvider): T | undefined {
    return this.instances.get(provider) as T | undefined;
  }

  /**
   * Get all configurations
   */
  getConfigs(): IntegrationConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Connect an integration
   */
  async connect(provider: IntegrationProvider): Promise<void> {
    const instance = this.instances.get(provider);
    if (!instance) {
      throw new Error(`Integration "${provider}" not configured`);
    }

    await instance.connect();
    await this.emitEvent({ type: 'connected', provider });

    // Setup auto-sync if configured
    const config = this.configs.get(provider);
    if (config?.settings.autoSync && config.settings.syncInterval) {
      this.setupAutoSync(provider, config.settings.syncInterval as number);
    }
  }

  /**
   * Disconnect an integration
   */
  async disconnect(provider: IntegrationProvider): Promise<void> {
    const instance = this.instances.get(provider);
    if (!instance) {
      throw new Error(`Integration "${provider}" not configured`);
    }

    // Clear auto-sync timer
    const timer = this.syncTimers.get(provider);
    if (timer) {
      clearInterval(timer);
      this.syncTimers.delete(provider);
    }

    await instance.disconnect();
    await this.emitEvent({ type: 'disconnected', provider });
  }

  /**
   * Test connection
   */
  async testConnection(provider: IntegrationProvider): Promise<boolean> {
    const instance = this.instances.get(provider);
    if (!instance) {
      return false;
    }

    return instance.testConnection();
  }

  /**
   * Sync data
   */
  async sync(provider: IntegrationProvider): Promise<SyncResult> {
    const instance = this.instances.get(provider);
    if (!instance) {
      throw new Error(`Integration "${provider}" not configured`);
    }

    await this.emitEvent({ type: 'sync_started', provider });

    try {
      const result = await instance.sync();
      
      // Update last sync time
      const config = this.configs.get(provider);
      if (config) {
        config.lastSyncAt = result.syncedAt;
      }

      await this.emitEvent({ 
        type: result.success ? 'sync_completed' : 'sync_failed', 
        provider,
        data: result as unknown as Record<string, unknown>,
      });

      return result;
    } catch (error) {
      await this.emitEvent({ 
        type: 'sync_failed', 
        provider, 
        error: String(error),
      });
      throw error;
    }
  }

  /**
   * Setup auto-sync
   */
  private setupAutoSync(provider: IntegrationProvider, intervalMinutes: number): void {
    // Clear existing timer
    const existingTimer = this.syncTimers.get(provider);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // Set new timer
    const timer = setInterval(async () => {
      try {
        await this.sync(provider);
      } catch (error) {
        console.error(`Auto-sync failed for ${provider}:`, error);
      }
    }, intervalMinutes * 60 * 1000);

    this.syncTimers.set(provider, timer);
  }

  /**
   * Handle webhook
   */
  async handleWebhook(
    provider: IntegrationProvider, 
    payload: Record<string, unknown>,
    headers: Record<string, string>
  ): Promise<void> {
    await this.emitEvent({ 
      type: 'webhook', 
      provider, 
      data: { payload, headers },
    });
  }

  /**
   * Subscribe to events
   */
  onEvent(handler: IntegrationEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => {
      this.eventHandlers.delete(handler);
    };
  }

  private async emitEvent(event: IntegrationEvent): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('Integration event handler error:', error);
      }
    }
  }

  /**
   * Get MISA integration
   */
  getMISA(): MISAIntegration | undefined {
    return this.get<MISAIntegration>('misa');
  }

  /**
   * Get Zalo OA integration
   */
  getZaloOA(): ZaloOAIntegration | undefined {
    return this.get<ZaloOAIntegration>('zalo_oa');
  }

  /**
   * Get Gmail integration
   */
  getGmail(): GmailIntegration | undefined {
    return this.get<GmailIntegration>('gmail');
  }

  /**
   * Get Google Drive integration
   */
  getGoogleDrive(): GoogleDriveIntegration | undefined {
    return this.get<GoogleDriveIntegration>('google_drive');
  }

  /**
   * Get VNPay integration
   */
  getVNPay(): VNPayIntegration | undefined {
    return this.get<VNPayIntegration>('vnpay');
  }
}

// Singleton instance
export const integrationLayer = new IntegrationLayer();

export {
  BaseIntegration,
  MISAIntegration,
  ZaloOAIntegration,
  GmailIntegration,
  GoogleDriveIntegration,
  VNPayIntegration,
};

export type {
  IntegrationCredentials,
  IntegrationSettings,
  SyncResult,
  IntegrationEvent,
  MISAInvoice,
  MISACustomer,
  ZaloMessage,
  ZaloOAProfile,
  EmailMessage,
  EmailThread,
  DriveFile,
  VNPayTransaction,
  VNPayResult,
};
