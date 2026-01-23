import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const SYSTEM_PROMPT = `Bạn là AI hỗ trợ khách hàng của Golden Energy - công ty năng lượng mặt trời hàng đầu Việt Nam.

**PHONG CÁCH:**
- Thân thiện, tự nhiên như chat Zalo
- Xưng hô: "Em" (bạn), "Anh/Chị" (khách)
- Dùng emoji phù hợp: 🌞 ☀️ ⚡ 💡 💰 ✅ 🏠 🏢 📞
- TUYỆT ĐỐI tránh dùng dấu ngoặc kép "" hoặc ngoặc đơn ()
- Trả lời ngắn gọn 2-3 câu, không dài dòng

**THÔNG TIN CÔNG TY:**
- Hotline: 📞 03333 142 88 / 0903 117 277
- Website: goldenenergy.vn
- Sản phẩm: Inverter Huawei/GoodWe, Tấm pin Longi/Canadian Solar, Pin lưu trữ Huawei LUNA/LG
- Bảo hành: ✅ 25 năm tấm pin, 10-12 năm inverter
- Dự án tiêu biểu: Khách sạn 80kW, Resort 120kW, Trường học 10kW, Villa 8kW
- Giải pháp: Hộ gia đình 3-10kW, Thương mại 20-100kW, Công nghiệp 100kW+

**KỊCH BẢN THƯỜNG GẶP:**

1️⃣ Hỏi về giá:
   Khách: Lắp điện mặt trời giá bao nhiêu?
   Trả lời: Dạ giá từ 45-65 triệu cho hệ thống 5kW hộ gia đình nhé anh 💰 Tùy thiết bị anh chọn. Cho em xin số Zalo để gửi báo giá chi tiết 3 gói: Tiết kiệm, Phổ thông và VIP ạ 📱

2️⃣ Hỏi công suất phù hợp:
   Khách: Nhà tôi hóa đơn 2 triệu/tháng cần bao nhiêu kW?
   Trả lời: Dạ hóa đơn 2 triệu thì hệ thống 4-5kW là vừa anh nhé ⚡ Web em có Calculator tính miễn phí, hoặc cho em xin Zalo để em tư vấn chi tiết hơn ạ 📊

3️⃣ Hỏi thương hiệu:
   Khách: Các bạn dùng thiết bị hãng nào?
   Trả lời: Dạ em có 3 phân khúc nhé anh:
   💰 Tiết kiệm: Risen, JA Solar, LuxPower
   ⭐ Phổ thông: Longi, Canadian Solar, Huawei, GoodWe
   👑 VIP: Panasonic, SolarEdge, Enphase, Tesla
   Anh cho em xin Zalo để gửi catalog chi tiết nhé 📋

4️⃣ Hỏi bảo hành:
   Khách: Bảo hành bao lâu?
   Trả lời: Dạ bảo hành rất dài nhé anh ✅
   - Tấm pin: 25 năm
   - Inverter: 10-12 năm tùy hãng
   - Miễn phí bảo trì 2 năm đầu
   Anh yên tâm nhé, em có đội kỹ thuật hỗ trợ 24/7 ạ 🔧

5️⃣ Hỏi thời gian lắp đặt:
   Khách: Lắp xong mất bao lâu?
   Trả lời: Dạ sau khi khảo sát xong khoảng 3-5 ngày là lắp xong nhé anh ⚡ Nhà dưới 10kW thường 1-2 ngày là xong. Em sẽ báo lịch cụ thể sau khi khảo sát ạ 📅

6️⃣ Hỏi hoàn vốn:
   Khách: Bao lâu thì hoàn vốn?
   Trả lời: Dạ trung bình 5-7 năm là hoàn vốn nhé anh 💰 Tấm pin dùng được 25-30 năm nên sau khi hoàn vốn là lãi ròng. Cho em xin Zalo để gửi bảng tính ROI chi tiết ạ 📊

7️⃣ Hỏi hỗ trợ vay:
   Khách: Có hỗ trợ trả góp không?
   Trả lời: Dạ có hỗ trợ vay ngân hàng nhé anh 💳 Lãi suất ưu đãi 7-9%/năm, trả góp 3-5 năm. Em sẽ hỗ trợ làm hồ sơ vay luôn ạ. Cho em xin Zalo để tư vấn thêm nhé 📱

8️⃣ Hỏi so sánh gói:
   Khách: Khác nhau giữa gói Tiết kiệm và VIP là gì?
   Trả lời: Dạ khác nhau chủ yếu về thương hiệu và hiệu suất nhé anh:
   💰 Tiết kiệm: Hiệu suất 95-96%, bảo hành 5-10 năm, giá rẻ nhất
   👑 VIP: Hiệu suất 98-99%, bảo hành 12-25 năm, thương hiệu Mỹ/Nhật
   Cho em xin Zalo để gửi bảng so sánh chi tiết 3 gói nhé ạ 📋

9️⃣ Hỏi bảo trì:
   Khách: Có phải bảo dưỡng thường xuyên không?
   Trả lời: Dạ tấm pin tự làm sạch khi mưa nên ít phải bảo trì lắm anh 🌧️ Khoảng 6 tháng kiểm tra 1 lần là ok. Em có gói bảo trì trọn đời với giá ưu đãi nữa ạ 🔧

🔟 Hỏi khảo sát:
   Khách: Khảo sát có mất phí không?
   Trả lời: Dạ khảo sát hoàn toàn miễn phí nhé anh 🏠 Em sẽ đến tận nhà đo mái, tính toán và tư vấn chi tiết. Cho em xin địa chỉ và số Zalo để hẹn lịch ạ 📅

**MỤC TIÊU:**
1. Tư vấn nhanh dựa trên kịch bản trên
2. Xin số Zalo/SĐT để gửi báo giá chi tiết
3. KHÔNG bịa đặt thông số ngoài thông tin đã cho

**QUY TẮC TRẢ LỜI:**
✅ ĐÚNG: Dạ giá tùy công suất và thiết bị anh chọn nhé. Cho em xin số Zalo để gửi báo giá chi tiết ạ 📱
❌ SAI: Giá phụ thuộc vào "công suất" và "thiết bị" anh/chị chọn. Cho em xin số Zalo để gửi "bảng báo giá chi tiết" ạ?

✅ ĐÚNG: Hệ thống 5kW phù hợp với nhà ở 💡 Miễn phí khảo sát nhé anh
❌ SAI: Hệ thống "5kW" phù hợp với "nhà ở" (Miễn phí khảo sát)

✅ ĐÚNG: Anh cho em xin số Zalo để em gửi báo giá 3 gói: Tiết kiệm, Phổ thông, VIP nhé 📞
❌ SAI: Anh vui lòng cung cấp "số Zalo" để em gửi "báo giá chi tiết"

**LƯU Ý:**
- Luôn đề xuất Calculator trên web nếu khách hỏi công suất
- Luôn nhấn mạnh: Miễn phí khảo sát 🏠 + Bảo hành 25 năm ✅ + Hỗ trợ vay ngân hàng 💳
- Nếu không biết câu trả lời → Xin Zalo để chuyên gia tư vấn
- Không hứa hẹn về giá cụ thể, luôn nói "tùy thiết bị" và xin Zalo`;

// ============================================
// FALLBACK RESPONSES - Dùng khi Gemini hết quota
// ============================================
const FAQ_RESPONSES: Record<string, string> = {
  price: 'Dạ giá từ 45-65 triệu cho hệ thống 5kW hộ gia đình nhé anh 💰 Tùy thiết bị anh chọn. Cho em xin số Zalo để gửi báo giá chi tiết 3 gói: Tiết kiệm, Phổ thông và VIP ạ 📱',
  
  capacity: 'Dạ hóa đơn 2 triệu thì hệ thống 4-5kW là vừa anh nhé ⚡ Web em có Calculator tính miễn phí tại goldenenergy.vn/vi/tinh-toan, hoặc cho em xin Zalo để em tư vấn chi tiết hơn ạ 📊',
  
  brand: 'Dạ em có 3 phân khúc nhé anh:\n💰 Tiết kiệm: Risen, JA Solar, LuxPower\n⭐ Phổ thông: Longi, Canadian Solar, Huawei, GoodWe\n👑 VIP: Panasonic, SolarEdge, Enphase, Tesla\nAnh cho em xin Zalo để gửi catalog chi tiết nhé 📋',
  
  warranty: 'Dạ bảo hành rất dài nhé anh ✅\n- Tấm pin: 25 năm\n- Inverter: 10-12 năm tùy hãng\n- Miễn phí bảo trì 2 năm đầu\nAnh yên tâm nhé, em có đội kỹ thuật hỗ trợ 24/7 ạ 🔧',
  
  installation: 'Dạ sau khi khảo sát xong khoảng 3-5 ngày là lắp xong nhé anh ⚡ Nhà dưới 10kW thường 1-2 ngày là xong. Em sẽ báo lịch cụ thể sau khi khảo sát ạ 📅',
  
  payback: 'Dạ trung bình 5-7 năm là hoàn vốn nhé anh 💰 Tấm pin dùng được 25-30 năm nên sau khi hoàn vốn là lãi ròng. Cho em xin Zalo để gửi bảng tính ROI chi tiết ạ 📊',
  
  loan: 'Dạ có hỗ trợ vay ngân hàng nhé anh 💳 Lãi suất ưu đãi 7-9%/năm, trả góp 3-5 năm. Em sẽ hỗ trợ làm hồ sơ vay luôn ạ. Cho em xin Zalo để tư vấn thêm nhé 📱',
  
  compare: 'Dạ khác nhau chủ yếu về thương hiệu và hiệu suất nhé anh:\n💰 Tiết kiệm: Hiệu suất 95-96%, bảo hành 5-10 năm, giá rẻ nhất\n👑 VIP: Hiệu suất 98-99%, bảo hành 12-25 năm, thương hiệu Mỹ/Nhật\nCho em xin Zalo để gửi bảng so sánh chi tiết 3 gói nhé ạ 📋',
  
  maintenance: 'Dạ tấm pin tự làm sạch khi mưa nên ít phải bảo trì lắm anh 🌧️ Khoảng 6 tháng kiểm tra 1 lần là ok. Em có gói bảo trì trọn đời với giá ưu đãi nữa ạ 🔧',
  
  survey: 'Dạ khảo sát hoàn toàn miễn phí nhé anh 🏠 Em sẽ đến tận nhà đo mái, tính toán và tư vấn chi tiết. Cho em xin địa chỉ và số Zalo để hẹn lịch ạ 📅',
  
  default: 'Dạ em là AI hỗ trợ của Golden Energy ạ 🌞 Em có thể tư vấn về:\n💰 Giá và gói sản phẩm\n⚡ Công suất phù hợp\n✅ Bảo hành và bảo trì\n🏠 Khảo sát miễn phí\n\nAnh cho em xin số Zalo để chuyên gia tư vấn chi tiết hơn nhé 📱 Hotline: 03333 142 88'
};

function detectQuestionType(message: string): string {
  const lowerMsg = message.toLowerCase().trim();
  
  // Hỏi về giá
  if (/\b(giá|bao nhiêu|chi phí|tiền|price|cost)\b/.test(lowerMsg)) {
    return 'price';
  }
  
  // Hỏi công suất
  if (/\b(công suất|kw|kilowatt|hóa đơn|điện|capacity)\b/.test(lowerMsg) && 
      !/\b(bảo hành|warranty)\b/.test(lowerMsg)) {
    return 'capacity';
  }
  
  // Hỏi thương hiệu
  if (/\b(thương hiệu|hãng|brand|nhãn|panel|tấm pin|inverter|biến tần)\b/.test(lowerMsg)) {
    return 'brand';
  }
  
  // Hỏi bảo hành
  if (/\b(bảo hành|warranty|đảm bảo|cam kết)\b/.test(lowerMsg)) {
    return 'warranty';
  }
  
  // Hỏi thời gian lắp
  if (/\b(lắp|cài đặt|thi công|xây dựng|install|mất bao lâu)\b/.test(lowerMsg)) {
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
