# 🧪 Hướng dẫn test Coze AI Chat sau khi fix

## ✅ Đã fix gì?

**Trước**:
- Dùng `CozeChat` component (Web SDK approach)
- SDK từ `https://sf-cdn.coze.com` không load được
- Không có UI hiển thị

**Sau**:
- ✅ Đổi sang `CozeChatWidget` component (API approach)
- ✅ Gọi API `/api/coze/chat` trực tiếp
- ✅ UI custom, draggable, responsive

---

## 🎯 Các bước test trên Production

### **Bước 1: Login vào ERP**
1. Truy cập: https://goldenenergy.vn/erp/login
2. Login với tài khoản test hoặc admin

### **Bước 2: Tìm nút AI Chat**
- ✅ Ở góc phải dưới màn hình, bạn sẽ thấy nút tròn màu xanh-tím gradient
- ✅ Icon Bot (robot) 🤖
- ✅ Hover sẽ có hiệu ứng scale lên

### **Bước 3: Mở chat widget**
- Click vào nút Bot
- Widget chat sẽ mở ra (400px wide, 600px height)
- Header có text "AI Assistant" và "Kéo để di chuyển"

### **Bước 4: Test chat**
**Tin nhắn test 1**: Gửi "Xin chào"
```
Expected response: 
"👋 Xin chào! Tôi là AI Assistant của Golden Energy..."
```

**Tin nhắn test 2**: Gửi "Giới thiệu về công ty"
```
Expected: Bot sẽ giới thiệu về Golden Energy
```

**Tin nhắn test 3**: Gửi "Bạn có thể giúp gì?"
```
Expected: Bot liệt kê những gì có thể hỗ trợ
```

### **Bước 5: Test tính năng draggable**
- Click và giữ vào header (phần màu xanh-tím)
- Kéo widget sang vị trí khác
- Widget phải di chuyển theo chuột
- Không bị giật lag

### **Bước 6: Test minimize/maximize**
- Click nút minimize (icon `_`) ở góc phải header
- Widget sẽ thu nhỏ thành nút Bot
- Click lại nút Bot để mở lại

---

## 🔍 Checklist test

- [ ] Nút Bot hiển thị ở góc phải màn hình
- [ ] Click nút Bot, widget mở ra
- [ ] Tin nhắn test "Xin chào" có response từ AI
- [ ] Response có ý nghĩa, không phải error
- [ ] Widget có thể kéo được (draggable)
- [ ] Minimize/Maximize hoạt động
- [ ] Enter để gửi tin nhắn hoạt động
- [ ] Loading state hiển thị khi chờ response (3 dots bounce)
- [ ] Scroll messages hoạt động khi có nhiều tin nhắn
- [ ] Không có console error trong DevTools

---

## ❌ Các lỗi có thể gặp và cách fix

### **Lỗi 1: "AI Chat đang được bảo trì"**
**Nguyên nhân**: `COZE_API_TOKEN` chưa được set trên Vercel

**Cách fix**:
```bash
vercel env add COZE_API_TOKEN production
# Paste token: pat_jNxBFSb8wM1rChiFAGbRMTGa5PQ6Bm8x66Gcxu4OV1MnrvuV8UpmFo0yDuahF2oj

vercel env add NEXT_PUBLIC_COZE_BOT_ID production
# Paste bot ID: 7594311757871972405
```

### **Lỗi 2: "Lỗi kết nối: Failed to fetch"**
**Nguyên nhân**: CSP block hoặc network issue

**Cách fix**:
1. Check Console DevTools → Network tab
2. Tìm request đến `/api/coze/chat`
3. Xem response status code và error message

### **Lỗi 3: Widget không hiển thị**
**Nguyên nhân**: `userId` chưa được generate

**Cách fix**:
1. Mở DevTools → Console
2. Check: `localStorage.getItem('coze_user_id')`
3. Nếu null, refresh page

### **Lỗi 4: Response rỗng hoặc không có ý nghĩa**
**Nguyên nhân**: Bot chưa được train hoặc bot ID sai

**Cách fix**:
1. Login vào https://www.coze.com
2. Check bot ID: `7594311757871972405`
3. Test bot trực tiếp trên Coze platform
4. Nếu bot không hoạt động trên Coze → cần re-train bot

---

## 🐛 Debug tips

### **Check API logs**
```javascript
// Open DevTools Console
// Watch for these logs:
console.log('🚀 Submitting lead data:', ...)
console.log('📡 Response status:', ...)
console.log('✅ Lead created successfully:', ...)
```

### **Check Network requests**
1. DevTools → Network tab
2. Filter: `/api/coze/chat`
3. Check:
   - Request payload có đúng `message`, `userId`, `botId`?
   - Response có `success: true`?
   - Response có `data.message`?

### **Check localStorage**
```javascript
// DevTools Console
localStorage.getItem('coze_user_id')
// Should return: "user_1736899200000_abc123"
```

---

## 📊 Monitoring

### **Metrics cần theo dõi**:
1. **Success rate**: Bao nhiêu % request thành công
2. **Response time**: Bao lâu để AI trả lời (thường 2-5s)
3. **Error rate**: Bao nhiêu % request lỗi
4. **User engagement**: Bao nhiêu users chat với bot

### **Nơi xem logs**:
- Vercel Dashboard → Logs
- Tìm `/api/coze/chat` trong logs
- Filter by status code: 200 (success) vs 500 (error)

---

## 🎓 Tips sử dụng

### **Cho developers**:
- Widget sử dụng `z-index: 50` → không conflict với modals
- Position lưu trong state, có thể persist vào localStorage
- API rate limit: Check Coze pricing plan

### **Cho end-users**:
- Có thể kéo widget sang vị trí khác tiện hơn
- Tin nhắn được lưu trong session (chưa persist database)
- Có thể chat liên tục, bot nhớ context trong conversation

---

## 🚀 Next steps

### **Feature requests có thể thêm**:
1. ✨ Persist chat history vào database
2. ✨ Notification khi có tin nhắn mới
3. ✨ Typing indicator (AI đang gõ...)
4. ✨ Voice input/output
5. ✨ File upload cho AI analyze
6. ✨ Multi-language support
7. ✨ Emoji picker
8. ✨ Message reactions
9. ✨ Share conversation link
10. ✨ Export chat transcript

### **Optimization**:
1. 🔧 Add caching cho common questions
2. 🔧 Add rate limiting per user
3. 🔧 Add analytics tracking
4. 🔧 Add A/B testing for bot responses
5. 🔧 Add feedback mechanism (thumbs up/down)

---

## 📞 Support

Nếu có vấn đề:
1. Check [COZE_CHAT_ANALYSIS.md](COZE_CHAT_ANALYSIS.md) để hiểu architecture
2. Check Vercel logs để xem API errors
3. Test bot trực tiếp trên Coze.com
4. Report issue với screenshots + console logs

---

## ✅ Test completed?

- [ ] AI Chat widget hiển thị và hoạt động
- [ ] Responses có ý nghĩa và hữu ích
- [ ] Draggable feature hoạt động smooth
- [ ] Không có console errors
- [ ] Performance tốt (< 3s response time)
- [ ] UI/UX friendly với users

**Nếu tất cả ✅ → Deploy successful! 🎉**
