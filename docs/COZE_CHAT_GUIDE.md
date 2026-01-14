# 💬 COZE CHAT COMPONENT - USAGE GUIDE

## Quick Integration

### 1. Add to ERP Layout
```tsx
// app/erp/layout.tsx
import { CozeChat } from '@/components/CozeChat';

export default function ERPLayout({ children }) {
  return (
    <div>
      {children}
      
      {/* Add Coze Chat at bottom-right */}
      <CozeChat
        botId={process.env.NEXT_PUBLIC_COZE_BOT_ID}
        title="Golden Energy AI Assistant"
        position="bottom-right"
        zIndex={9999}
      />
    </div>
  );
}
```

### 2. Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_COZE_BOT_ID=your-bot-id-here
```

### 3. Get Your Bot ID
1. Go to [Coze.com](https://www.coze.com)
2. Create or open your bot
3. Navigate to Settings → Bot ID
4. Copy the ID

---

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `botId` | `string?` | `NEXT_PUBLIC_COZE_BOT_ID` | Your Coze bot ID |
| `userId` | `string?` | `undefined` | Current user ID for tracking |
| `title` | `string?` | `'AI Assistant'` | Chat window title |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Chat button position |
| `zIndex` | `number?` | `9999` | Z-index for chat widget |

---

## Usage Examples

### Basic Usage
```tsx
<CozeChat />
```

### With User Tracking
```tsx
const { user } = useAuth();

<CozeChat
  userId={user?.id}
  title="Golden Energy Support"
/>
```

### Custom Positioning
```tsx
<CozeChat
  position="bottom-left"
  zIndex={10000}
/>
```

### Multiple Bots (Different Pages)
```tsx
// Customer support page
<CozeChat
  botId="bot-customer-support-123"
  title="Customer Support"
/>

// Technical support page
<CozeChat
  botId="bot-technical-456"
  title="Technical Support"
/>
```

---

## Features

✅ **SSR Safe**: Only loads in browser  
✅ **Efficient Loading**: Script loads once, cached  
✅ **Error Handling**: Shows clear error messages  
✅ **Loading States**: Displays loading indicator  
✅ **CSP Compliant**: Works with strict security policies  
✅ **Customizable**: Position, title, z-index  
✅ **TypeScript**: Full type safety

---

## Troubleshooting

### Chat Widget Not Appearing

**Check 1: Environment Variable**
```bash
echo $NEXT_PUBLIC_COZE_BOT_ID
# Should output your bot ID
```

**Check 2: Browser Console**
```javascript
// Should see:
// ✅ Coze chat script loaded successfully
```

**Check 3: Network Tab**
- Script should load from `https://sf-cdn.coze.com/`
- No 403/404 errors

### CSP Errors

If you see "Refused to load script" errors:

1. Check [next.config.ts](../next.config.ts)
2. Verify CSP includes:
```typescript
"script-src ... https://sf-cdn.coze.com https://*.coze.com"
"connect-src ... https://api.coze.com https://*.coze.com wss://*.coze.com"
```

### Chat Behind Other Elements

Increase z-index:
```tsx
<CozeChat zIndex={99999} />
```

---

## Advanced Configuration

### Custom Styling
```tsx
// Override default styles
useEffect(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    [class*="coze-chat-button"] {
      background: linear-gradient(to right, #3b82f6, #8b5cf6) !important;
      border-radius: 50% !important;
    }
  `;
  document.head.appendChild(style);
}, []);
```

### Conditional Loading
```tsx
// Only show for authenticated users
const { isAuthenticated } = useAuth();

{isAuthenticated && <CozeChat />}
```

### Integration with Analytics
```tsx
useEffect(() => {
  // Track chat widget loads
  if (window.gtag) {
    window.gtag('event', 'coze_chat_loaded', {
      bot_id: botId,
      page: window.location.pathname
    });
  }
}, []);
```

---

## Best Practices

1. **Load Once**: Add to root layout, not individual pages
2. **Use ENV Variables**: Keep bot ID in environment config
3. **Error Boundaries**: Wrap in error boundary for production
4. **User Tracking**: Pass user ID for personalized experience
5. **Z-Index Management**: Use consistent z-index across widgets

---

## Migration from Old Widget

**Before** (CozeChatWidget.tsx - manual API calls):
```tsx
<CozeChatWidget userId="123" botId="bot-123" />
```

**After** (CozeChat.tsx - SDK integration):
```tsx
<CozeChat userId="123" />
```

**Benefits**:
- ✅ Official SDK (more stable)
- ✅ Better error handling
- ✅ Automatic reconnection
- ✅ CSP compliant
- ✅ Better performance

---

## Support

- [Coze Documentation](https://www.coze.com/docs)
- [SDK Reference](https://www.coze.com/docs/sdk)
- [API Reference](https://www.coze.com/docs/api)

