import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { geminiKeyManager } from '@/lib/api/gemini-key-manager';

const HOTLINE_PRIMARY = process.env.NEXT_PUBLIC_HOTLINE_PRIMARY || '0333314288';
const HOTLINE_SECONDARY = process.env.NEXT_PUBLIC_HOTLINE_SECONDARY || '0903117277';

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
   Trả lời: Dạ giá từ 45-65 triệu cho hệ thống 5kW hộ gia đình nhé anh 💰 Tùy thiết bị anh chọn. Để em tính toán chi tiết cho Anh/Chị, mời gọi Hotline ${HOTLINE_PRIMARY} nhé! 📞

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

    console.log(`📩 New chat message: "${message.slice(0, 50)}..."`);

    const response = await sendMessageWithRetry(message, conversationHistory, pageContext);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      fallback: response === FALLBACK_MESSAGE,
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
    return 'installation';
  }
  
  // Hỏi hoàn vốn
  if (/\b(hoàn vốn|thu hồi|roi|lợi nhuận|payback)\b/.test(lowerMsg)) {
    return 'payback';
  }
  
  // Hỏi trả góp
  if (/\b(trả góp|vay|tín dụng|ngân hàng|loan|finance)\b/.test(lowerMsg)) {
    return 'loan';
  }
  
  // So sánh gói
  if (/\b(so sánh|khác nhau|compare|difference|gói)\b/.test(lowerMsg)) {
    return 'compare';
  }
  
  // Bảo trì
  if (/\b(bảo trì|bảo dưỡng|maintenance|vệ sinh|làm sạch)\b/.test(lowerMsg)) {
    return 'maintenance';
  }
  
  // Khảo sát
  if (/\b(khảo sát|survey|đo|kiểm tra|tư vấn|visit)\b/.test(lowerMsg)) {
    return 'survey';
  }
  
  return 'default';
}

export async function POST(request: NextRequest) {
  // Parse request body once
  const body = await request.json();
  const { message, conversationHistory = [], pageContext } = body;

  try {
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // Build enhanced system prompt with page context
    let contextualPrompt = SYSTEM_PROMPT;
    if (pageContext) {
      contextualPrompt += `\n\n**NGỮ CẢNH TRANG HIỆN TẠI:**
- URL: ${pageContext.url}
- Trang: ${pageContext.title || 'Golden Energy'}
- Nội dung: ${pageContext.content || 'Khách đang xem trang chủ'}

➡️ Hãy tư vấn dựa trên nội dung trang khách đang xem!`;
    }

    // Build conversation context
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: contextualPrompt }],
        },
        {
          role: 'model',
          parts: [{ text: 'Dạ, em hiểu rồi ạ! Em sẽ tư vấn dựa trên trang anh/chị đang xem và xin số Zalo để gửi báo giá chi tiết.' }],
        },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      ],
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Gemini API Error:', error);
    
    // ============================================
    // FALLBACK: Dùng pre-defined responses khi hết quota
    // ============================================
    const isQuotaError = error?.status === 429 || error?.message?.includes('quota') || error?.message?.includes('Too Many Requests');
    
    if (isQuotaError) {
      const questionType = detectQuestionType(message);
      const fallbackResponse = FAQ_RESPONSES[questionType];
      
      console.log('⚠️ Gemini quota exceeded, using fallback response:', questionType);
      
      return NextResponse.json({
        response: fallbackResponse,
        timestamp: new Date().toISOString(),
        fallback: true, // Đánh dấu đây là fallback response
      });
    }
    
    // Các lỗi khác
    return NextResponse.json(
      {
        error: 'Xin lỗi, hệ thống đang bận. Vui lòng gọi hotline 03333 142 88 để được hỗ trợ ngay.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
