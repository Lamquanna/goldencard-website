/**
 * Coze AI Assistant Client
 * Official documentation: https://www.coze.com/docs/developer_guides/coze_api_overview
 */

const COZE_API_BASE = 'https://api.coze.com/v1';
const COZE_TOKEN = process.env.COZE_API_TOKEN;
const COZE_BOT_ID = process.env.COZE_BOT_ID;

interface CozeMessage {
  role: 'user' | 'assistant';
  content: string;
  content_type?: 'text' | 'image' | 'file';
}

interface CozeChatRequest {
  bot_id: string;
  user_id: string;
  stream?: boolean;
  auto_save_history?: boolean;
  additional_messages?: CozeMessage[];
}

interface CozeChatResponse {
  conversation_id: string;
  message: {
    role: string;
    content: string;
    content_type: string;
  };
  code: number;
  msg: string;
}

export class CozeClient {
  private token: string;
  private baseUrl: string;

  constructor(token?: string) {
    this.token = token || COZE_TOKEN || '';
    this.baseUrl = COZE_API_BASE;
    
    if (!this.token) {
      throw new Error('Coze API token is required');
    }
  }

  /**
   * Send a message to Coze bot and get response
   */
  async chat(params: {
    botId?: string;
    userId: string;
    message: string;
    conversationId?: string;
    stream?: boolean;
  }): Promise<CozeChatResponse> {
    const botId = params.botId || COZE_BOT_ID;
    
    if (!botId) {
      throw new Error('Bot ID is required. Please set COZE_BOT_ID in environment variables.');
    }

    const payload: CozeChatRequest = {
      bot_id: botId,
      user_id: params.userId,
      stream: params.stream || false,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: params.message,
          content_type: 'text',
        },
      ],
    };

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Coze API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get bot information
   */
  async getBotInfo(botId?: string): Promise<any> {
    const id = botId || COZE_BOT_ID;
    
    if (!id) {
      throw new Error('Bot ID is required');
    }

    const response = await fetch(`${this.baseUrl}/bot/get_online_info?bot_id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get bot info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * List available bots
   */
  async listBots(params?: {
    page_index?: number;
    page_size?: number;
  }): Promise<any> {
    const queryParams = new URLSearchParams({
      page_index: String(params?.page_index || 1),
      page_size: String(params?.page_size || 20),
    });

    const response = await fetch(`${this.baseUrl}/space/published_bots_list?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list bots: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(conversationId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/conversation/message/list?conversation_id=${conversationId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get conversation history: ${response.statusText}`);
    }

    return response.json();
  }
}

// Singleton instance
let cozeClient: CozeClient | null = null;

export function getCozeClient(): CozeClient {
  if (!cozeClient && COZE_TOKEN) {
    cozeClient = new CozeClient(COZE_TOKEN);
  }
  
  if (!cozeClient) {
    throw new Error('Coze client not initialized. Please set COZE_API_TOKEN.');
  }
  
  return cozeClient;
}

export default CozeClient;
