# Coze AI Chatbot Debugging Guide

## Overview

This guide helps you debug issues with the Coze AI chatbot integration when it's not loading, blocked, or failing to render.

## Current Implementation

The Coze chatbot is implemented as a custom React component (`CozeChatWidget.tsx`) that communicates with the Coze API through our backend API route (`/api/coze/chat`).

### Architecture
```
User Browser
    ↓
CozeChatWidget.tsx (React Component)
    ↓
/api/coze/chat (Next.js API Route)
    ↓
lib/coze-client.ts (API Client)
    ↓
https://api.coze.com (Coze API)
```

## Common Issues & Solutions

### 1. Chatbot Not Appearing

#### Symptoms
- No chat button visible on page
- Component renders but is invisible
- Console errors about missing components

#### Debug Steps

**Check Console for Errors**
```javascript
// Open DevTools (F12) → Console tab
// Look for errors like:
// - "CozeChatWidget is not defined"
// - "userId is required"
// - "Bot component failed to render"
```

**Verify Component is Imported**
Check [app/erp/layout.tsx](app/erp/layout.tsx):
```typescript
import { CozeChatWidget } from '@/components/CozeChatWidget';

// Inside component:
{userId && <CozeChatWidget userId={userId} position="bottom-right" />}
```

**Check userId Generation**
```typescript
// Should see in localStorage:
localStorage.getItem('coze_user_id')
// Should return something like: "user_1705145445_abc123"
```

**Inspect Element**
```javascript
// Check if element exists in DOM:
document.querySelector('[aria-label="Open AI Assistant"]')
// Should return the button element
```

#### Solutions

1. **Missing userId**: Clear localStorage and reload
```javascript
localStorage.removeItem('coze_user_id');
location.reload();
```

2. **Import Error**: Verify component path is correct
```typescript
// Should be:
import { CozeChatWidget } from '@/components/CozeChatWidget';
// NOT:
import { CozeChatWidget } from 'components/CozeChatWidget';
```

3. **Styling Issue**: Check z-index and positioning
```typescript
// Component should have:
className="fixed right-6 bottom-6 z-50"
```

---

### 2. Content Security Policy (CSP) Blocking

#### Symptoms
- Console error: "Refused to connect to 'https://api.coze.com' because it violates the Content Security Policy directive"
- Network tab shows blocked requests
- Chat sends message but no response

#### Debug Steps

**Check Console for CSP Errors**
```
Refused to connect to 'https://api.coze.com/v1/chat' 
because it violates the following Content Security Policy directive: 
"connect-src 'self' ..."
```

**Inspect CSP Headers**
```bash
# Check headers in browser:
# DevTools → Network → Select any request → Headers tab
# Look for: Content-Security-Policy

# Or use curl:
curl -I https://your-domain.com | grep -i content-security
```

**Verify CSP Configuration**
Check [next.config.ts](next.config.ts) line 197:
```typescript
"connect-src 'self' https://www.google-analytics.com https://api.mapbox.com https://api.coze.com wss:"
```

#### Solutions

1. **CSP Already Updated**: The CSP has been updated to include `https://api.coze.com` in the `connect-src` directive (see [next.config.ts#L197](next.config.ts#L197))

2. **If Still Blocked After Update**:
```bash
# Clear browser cache:
# Chrome: Ctrl+Shift+Delete → Check "Cached images and files" → Clear
# Or use Incognito mode to test

# Verify deployment:
npm run build
npm start
```

3. **Temporary CSP Bypass (Development Only)**:
```typescript
// In next.config.ts, temporarily set:
"connect-src 'self' https://* wss:"
// NOTE: Don't use in production - too permissive
```

---

### 3. API Authentication Errors

#### Symptoms
- Chat opens but returns error "Failed to communicate with AI assistant"
- Console shows "❌ Coze API error"
- 401 Unauthorized in network tab

#### Debug Steps

**Check Environment Variables**
```bash
# Verify .env.local has:
COZE_API_TOKEN=your_token_here
COZE_BOT_ID=your_bot_id_here

# Check they're loaded:
node -e "console.log(process.env.COZE_API_TOKEN)"
```

**Inspect API Logs**
Check terminal output when message is sent:
```bash
# Should see:
🔧 Environment check: { hasToken: true, hasBotId: true }
📤 Sending to Coze: { userId: '...', messageLength: 10 }
✅ Coze response: { conversationId: '...', hasContent: true }
```

**Test API Route Directly**
```bash
curl -X POST http://localhost:3000/api/coze/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test",
    "userId": "test_user",
    "botId": "YOUR_BOT_ID"
  }'
```

#### Solutions

1. **Missing Environment Variables**:
```bash
# Create/update .env.local:
echo "COZE_API_TOKEN=your_actual_token" >> .env.local
echo "COZE_BOT_ID=your_actual_bot_id" >> .env.local

# Restart dev server:
# Ctrl+C then npm run dev
```

2. **Invalid Token**:
- Check Coze dashboard for valid API token
- Regenerate token if expired
- Update .env.local

3. **Wrong Bot ID**:
```bash
# Test bot info endpoint:
curl "http://localhost:3000/api/coze/chat?action=list"
# Find your bot in the response
```

---

### 4. Network Connectivity Issues

#### Symptoms
- Request times out
- No response after long wait
- Network tab shows "failed" or "timeout"

#### Debug Steps

**Check Network Tab**
```
DevTools → Network tab → Filter: XHR
Look for: /api/coze/chat
Status: Should be 200, not (failed) or timeout
```

**Test Direct API Connection**
```bash
# From terminal:
curl -v https://api.coze.com/v1/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bot_id": "YOUR_BOT_ID",
    "user_id": "test",
    "stream": false,
    "additional_messages": [{
      "role": "user",
      "content": "Test",
      "content_type": "text"
    }]
  }'
```

**Check Proxy/VPN**
- Disable VPN temporarily
- Check corporate firewall settings
- Test from different network

#### Solutions

1. **Timeout Configuration**:
```typescript
// In lib/coze-client.ts, add timeout:
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

const response = await fetch(url, {
  signal: controller.signal,
  // ... other options
});
clearTimeout(timeoutId);
```

2. **Retry Logic**: Already implemented in API client (2 retries with exponential backoff)

3. **Network Issues**: Contact Coze support if API is unreachable

---

### 5. Chat Opens But No Response

#### Symptoms
- User can type messages
- Messages appear in chat
- Loading indicator shows
- No bot reply appears

#### Debug Steps

**Check Browser Console**
```javascript
// Look for:
// - "API returned success=false"
// - "Coze API error"
// - Response data structure issues
```

**Inspect Response in Network Tab**
```
DevTools → Network → /api/coze/chat → Preview/Response
Check structure:
{
  "success": true,
  "data": {
    "conversationId": "...",
    "message": "...",  // Should have content
    "role": "assistant"
  }
}
```

**Check API Route Logs**
```bash
# Terminal should show:
logger.apiRequest({
  method: 'POST',
  url: '/api/coze/chat',
  statusCode: 200,
  duration: xxx
})
```

#### Solutions

1. **Response Parsing Error**:
```typescript
// In CozeChatWidget.tsx, check:
if (data.success) {
  const assistantMessage: Message = {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content: data.data.message,  // ← Check this path
    timestamp: new Date(),
  };
  setMessages(prev => [...prev, assistantMessage]);
}
```

2. **Bot Not Configured**:
- Check Coze dashboard
- Verify bot is published/online
- Test bot directly in Coze interface

3. **Empty Response**:
```typescript
// Add logging:
console.log('Coze response:', data);
// Check if data.data.message is empty
```

---

## Debugging Tools

### 1. Browser DevTools Checklist

Open DevTools (F12) and check each tab:

**Console Tab**
- [ ] No red errors
- [ ] No CSP violation warnings
- [ ] Debug logs show proper flow

**Network Tab**
- [ ] `/api/coze/chat` request shows Status 200
- [ ] Request payload has userId and message
- [ ] Response has success: true and data.message
- [ ] Timing: Request completes in <5 seconds

**Application Tab**
- [ ] localStorage has `coze_user_id`
- [ ] No Service Worker errors

**Elements Tab**
- [ ] Chat button element exists
- [ ] z-index: 50 (should be on top)
- [ ] position: fixed
- [ ] Styles are applied correctly

### 2. Testing Script

Create a test file to verify the API:

```typescript
// scripts/test-coze-api.ts
import { getCozeClient } from '@/lib/coze-client';

async function testCozeIntegration() {
  console.log('🧪 Testing Coze API Integration...\n');

  try {
    const coze = getCozeClient();
    console.log('✅ Coze client initialized');

    // Test 1: Send a message
    console.log('\n📤 Sending test message...');
    const response = await coze.chat({
      userId: 'test_user_debug',
      message: 'Hello, this is a test',
      stream: false,
    });

    console.log('✅ Response received:');
    console.log('   Conversation ID:', response.conversation_id);
    console.log('   Message:', response.message.content);
    console.log('   Role:', response.message.role);

    // Test 2: Get bot info
    console.log('\n📋 Fetching bot info...');
    const botInfo = await coze.getBotInfo();
    console.log('✅ Bot info:', botInfo);

    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    console.error('Stack:', error.stack);
  }
}

testCozeIntegration();
```

Run it:
```bash
npx tsx scripts/test-coze-api.ts
```

### 3. Production Logging

With the new logger utility, you can track issues in production:

**Check Vercel Logs**
```bash
# In Vercel Dashboard:
# Project → Logs → Filter by:
# - Level: error
# - Search: "Coze"
```

**Search by Request ID**
```bash
# Find the requestId from the chat response
# Then search Vercel logs for: requestId: "req_xxx"
# You'll see the full request lifecycle
```

**Example Production Error**
```json
{
  "timestamp": "2026-01-13T10:30:45Z",
  "level": "error",
  "message": "Coze API error",
  "requestId": "req_1705145445_abc",
  "userId": "user_123",
  "error": {
    "message": "Bot ID is required",
    "code": "MISSING_BOT_ID"
  }
}
```

---

## Environment Variables Checklist

Required in `.env.local`:
```bash
# Coze API Configuration
COZE_API_TOKEN=your_coze_api_token_here
COZE_BOT_ID=your_bot_id_here

# Optional: Public bot ID for client-side (if needed)
NEXT_PUBLIC_COZE_BOT_ID=your_bot_id_here
```

**How to Get These Values:**

1. **COZE_API_TOKEN**:
   - Go to https://www.coze.com
   - Navigate to Settings → API Keys
   - Create new API key
   - Copy the token

2. **COZE_BOT_ID**:
   - Go to your bot in Coze dashboard
   - Click on bot → Settings
   - Copy the Bot ID

---

## Quick Verification Steps

Run these checks in order:

1. **Environment Check** ✅
```bash
cat .env.local | grep COZE
# Should show both COZE_API_TOKEN and COZE_BOT_ID
```

2. **Build Check** ✅
```bash
npm run build
# Should complete without errors
```

3. **Dev Server Check** ✅
```bash
npm run dev
# Open http://localhost:3000/erp
# Chat button should appear
```

4. **API Check** ✅
```bash
curl -X POST http://localhost:3000/api/coze/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test123"}'
# Should return: {"success":true,"data":{...}}
```

5. **CSP Check** ✅
```bash
curl -I http://localhost:3000 | grep -i content-security
# Should include: https://api.coze.com
```

6. **Browser Check** ✅
- Open DevTools Console
- Navigate to `/erp`
- Click chat button
- Send message "Test"
- Should receive bot response within 3-5 seconds

---

## Troubleshooting by Error Message

### "Failed to communicate with AI assistant"
→ Check [API Authentication Errors](#3-api-authentication-errors)

### "Bot ID is required"
→ Add `COZE_BOT_ID` to `.env.local` and restart server

### "Refused to connect... violates CSP"
→ Check [Content Security Policy Blocking](#2-content-security-policy-csp-blocking)

### "Invalid token"
→ Regenerate token in Coze dashboard and update `.env.local`

### "Network request failed"
→ Check [Network Connectivity Issues](#4-network-connectivity-issues)

### Chat opens but no userId
→ Check localStorage and userId generation in layout.tsx

### Response stuck in "Loading..."
→ Check [Chat Opens But No Response](#5-chat-opens-but-no-response)

---

## Support & Documentation

- **Coze Official Docs**: https://www.coze.com/docs/developer_guides/coze_api_overview
- **API Client Code**: [lib/coze-client.ts](lib/coze-client.ts)
- **Widget Component**: [components/CozeChatWidget.tsx](components/CozeChatWidget.tsx)
- **API Route**: [app/api/coze/chat/route.ts](app/api/coze/chat/route.ts)
- **CSP Configuration**: [next.config.ts](next.config.ts#L197)

---

## Summary Checklist

When debugging Coze chatbot issues:

- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Confirm CSP includes `https://api.coze.com`
- [ ] Test API route directly with curl
- [ ] Check Vercel/production logs
- [ ] Verify userId is generated
- [ ] Test on different browser/network
- [ ] Check Coze dashboard (bot status)
- [ ] Review recent code changes
- [ ] Clear browser cache and localStorage

If all checks pass but issue persists, check Coze service status or contact their support.
