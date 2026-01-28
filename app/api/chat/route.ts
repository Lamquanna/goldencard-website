import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { geminiKeyManager } from '@/lib/api/gemini-key-manager';

// Hardcoded hotline numbers
const HOTLINE_PRIMARY = '0333314288';
const HOTLINE_SECONDARY = '0903117277';

// Rate Limiting: In-memory store (24h window, 2 messages max)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 2;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(ip, { count: 0, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function incrementRateLimit(ip: string): void {
  const entry = rateLimitStore.get(ip);
  if (entry) {
    entry.count++;
  }
}

const RATE_LIMIT_MESSAGE = `Dạ, để đảm bảo chất lượng tư vấn tốt nhất, mỗi khách hàng được hỗ trợ tối đa 2 câu hỏi qua chat mỗi ngày ạ.

Để được tư vấn chi tiết và nhanh chóng hơn, em mời Anh/Chị gọi trực tiếp Hotline:
📞 ${HOTLINE_PRIMARY}
📞 ${HOTLINE_SECONDARY}

Kỹ sư bên em sẽ tư vấn tận tình 24/7 và báo giá miễn phí ngay ạ! ☀️`;

const SYSTEM_PROMPT = `Bạn là Kỹ sư tư vấn bán hàng của Golden Energy - công ty năng lượng mặt trời hàng đầu Việt Nam.

**PHONG CÁCH:**
- Luôn xưng hô: "Em" (bạn), "Anh/Chị" (khách hàng)
- Thân thiện, chuyên nghiệp, lịch sự
- Dùng emoji phù hợp: ☀️ ⚡ 💡 🏠 📞 ✅
- Trả lời ngắn gọn, súc tích (2-3 câu)
- KHÔNG dùng ngoặc kép "", ngoặc đơn () trong câu trả lời

**CHIẾN THUẬT GỌI HOTLINE:**
- Sau tối đa 2 câu trả lời về sản phẩm/giá, LUÔN LUÔN mời khách gọi Hotline
- Câu mời gọi mẫu: 
  "Để Anh/Chị có cái nhìn rõ nhất về giải pháp phù hợp, em mời Anh/Chị gọi Hotline ${HOTLINE_PRIMARY}. Kỹ sư bên em sẽ tính toán chi tiết và báo giá miễn phí ngay ạ! 📞"

**THÔNG TIN CÔNG TY:**
- Hotline 1: ${HOTLINE_PRIMARY}
- Hotline 2: ${HOTLINE_SECONDARY}
- Website: goldenenergy.vn
- Sản phẩm: Inverter (Huawei, GoodWe), Tấm pin (Longi, Canadian Solar), Pin lưu trữ
- Bảo hành: 25 năm tấm pin, 10-12 năm inverter
- Dịch vụ: Lắp đặt trọn gói, bảo trì, khảo sát miễn phí

**KỊCH BẢN THƯỜNG GẶP:**

1️⃣ Hỏi về giá:
     Trả lời: Dạ em xin báo giá hệ thống có lưu trữ (pin) cho anh/chị nhé 💰
     - 6kW + Pin 16kWh: 120 triệu (chưa VAT) = 129.6 triệu
     - 12kW + Pin 32kWh: 230 triệu (chưa VAT) = 248.4 triệu
     - 18kW + Pin 48kWh: 330 triệu (chưa VAT) = 356.4 triệu
     Để em tư vấn chi tiết và báo giá chính xác, mời anh/chị gọi Hotline ${HOTLINE_PRIMARY} nhé! 📞
2️⃣ Hỏi công suất phù hợp:
   Trả lời: Dạ hóa đơn 2 triệu thì hệ thống 4-5kW là vừa anh nhé ⚡ Để tư vấn chính xác nhất, mời Anh/Chị gọi Hotline ${HOTLINE_PRIMARY} để kỹ sư tính toán chi tiết ạ!

**QUY TẮC:**
- Hỏi giá → Nói khái quát rồi mời gọi Hotline
- Hỏi công suất → Gợi ý rồi mời gọi Hotline
- Hỏi chi tiết kỹ thuật → Trả lời ngắn gọn, sau đó mời gọi Hotline
- Nếu không biết → Xin lỗi và mời gọi Hotline để chuyên gia tư vấn

**MỤC TIÊU:**
Biến mỗi cuộc trò chuyện thành 1 cuộc gọi Hotline thực tế!`;

const FALLBACK_MESSAGE = `Dạ hiện tại tư vấn viên AI đang bận xử lý một vài thông số kỹ thuật. 

Để không mất thời gian của Anh/Chị, xin mời Anh/Chị nhấp vào nút 📞 Gọi Hotline để em tư vấn trực tiếp và nhanh nhất ạ!

☎️ Hotline: ${HOTLINE_PRIMARY} hoặc ${HOTLINE_SECONDARY}`;

/**
 * Send message with silent retry across multiple API keys
 */
async function sendMessageWithRetry(
  message: string,
  conversationHistory: any[],
  pageContext?: any
): Promise<string> {
  const maxRetries = geminiKeyManager.getTotalKeys();
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = geminiKeyManager.getRandomKey();

    if (!apiKey) {
      console.error('❌ No API keys available');
      break;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      });

      // Build context-aware prompt
      let contextualPrompt = SYSTEM_PROMPT;
      if (pageContext) {
        contextualPrompt += `\n\n**TRANG KHÁCH ĐANG XEM:**
- URL: ${pageContext.url}
- Tiêu đề: ${pageContext.title}
- Nội dung: ${pageContext.content}

➡️ Hãy tư vấn dựa trên ngữ cảnh trang này!`;
      }

      const chat = model.startChat({
        history: [
          {
            role: 'user',
            parts: [{ text: contextualPrompt }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Dạ, em hiểu rồi ạ! Em sẽ tư vấn nhiệt tình và mời Anh/Chị gọi Hotline để được hỗ trợ chi tiết nhất.',
              },
            ],
          },
          ...conversationHistory.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
          })),
        ],
      });

      const result = await chat.sendMessage(message);
      const response = result.response.text();

      geminiKeyManager.markKeySuccess(apiKey);
      console.log(`✅ Response received (attempt ${attempt + 1})`);
      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`⚠️ Attempt ${attempt + 1} failed:`, error.message);

      geminiKeyManager.markKeyFailed(apiKey, error);

      const isRetryableError =
        error.status === 429 ||
        error.status === 500 ||
        error.status === 503 ||
        error.message?.includes('quota') ||
        error.message?.includes('limit');

      if (!isRetryableError) {
        console.error('❌ Non-retryable error, stopping');
        break;
      }

      console.log(`🔄 Retrying with another key...`);
    }
  }

  console.error('❌ All API keys exhausted', lastError);
  return FALLBACK_MESSAGE;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { message, conversationHistory = [], pageContext } = body;

  try {
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const rateCheck = checkRateLimit(ip);
    
    if (!rateCheck.allowed) {
      console.log(`⚠️ Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json({
        response: RATE_LIMIT_MESSAGE,
        timestamp: new Date().toISOString(),
        rateLimit: { exceeded: true, remaining: 0 },
      });
    }

    console.log(`📩 New chat message: "${message.slice(0, 50)}..." (${rateCheck.remaining - 1} left)`);

    const response = await sendMessageWithRetry(message, conversationHistory, pageContext);
    
    // Increment rate limit after successful response
    incrementRateLimit(ip);

    const updatedCheck = checkRateLimit(ip);
    
    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      fallback: response === FALLBACK_MESSAGE,
      rateLimit: { remaining: updatedCheck.remaining },
    });
  } catch (error: any) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      {
        response: FALLBACK_MESSAGE,
        timestamp: new Date().toISOString(),
        fallback: true,
      },
      { status: 200 }
    );
  }
}
