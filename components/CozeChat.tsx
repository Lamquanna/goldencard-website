/**
 * Coze Chat Widget - Optimized Integration
 * 
 * This component efficiently loads the Coze AI chat widget script
 * and ensures proper CSP compliance and z-index positioning.
 */

'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

interface CozeChatProps {
  botId?: string;
  userId?: string;
  title?: string;
  position?: 'bottom-right' | 'bottom-left';
  zIndex?: number;
}

export function CozeChat({
  botId = process.env.NEXT_PUBLIC_COZE_BOT_ID,
  userId,
  title = 'AI Assistant',
  position = 'bottom-right',
  zIndex = 9999,
}: CozeChatProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only load in browser environment
    if (typeof window === 'undefined') return;

    // Check if bot ID is configured
    if (!botId) {
      console.warn('Coze Bot ID not configured. Set NEXT_PUBLIC_COZE_BOT_ID in .env');
      setError('Bot ID not configured');
      return;
    }

    // Avoid loading script multiple times
    if (document.getElementById('coze-chat-script')) {
      setIsLoaded(true);
      return;
    }

    // Create and load Coze chat script
    const script = document.createElement('script');
    script.id = 'coze-chat-script';
    script.src = 'https://sf-cdn.coze.com/obj/unpkg-va/flow-platform/chat-app-sdk/0.1.0-beta.4/libs/oversea/index.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ Coze chat script loaded successfully');
      setIsLoaded(true);
      
      // Initialize Coze chat widget
      try {
        // @ts-ignore - Coze SDK global
        if (window.CozeWebSDK) {
          // @ts-ignore
          new window.CozeWebSDK.WebChatClient({
            config: {
              bot_id: botId,
            },
            componentProps: {
              title: title,
              // Additional configuration can be added here
            },
          });
        }
      } catch (err) {
        console.error('Error initializing Coze chat:', err);
        setError('Failed to initialize chat');
      }
    };

    script.onerror = (err) => {
      console.error('❌ Failed to load Coze chat script:', err);
      setError('Failed to load chat widget');
      setIsLoaded(false);
    };

    // Append script to document
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.getElementById('coze-chat-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [botId, title]);

  // Apply custom z-index styling
  useEffect(() => {
    if (!isLoaded) return;

    // Override Coze widget z-index
    const style = document.createElement('style');
    style.id = 'coze-chat-custom-styles';
    style.innerHTML = `
      /* Coze Chat Widget Custom Styles */
      #coze-chat-widget,
      [class*="coze-chat"],
      [class*="CozeChat"] {
        z-index: ${zIndex} !important;
      }
      
      /* Ensure chat button is visible */
      [class*="coze-chat-button"] {
        z-index: ${zIndex} !important;
        ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 20px;
      }
      
      /* Chat window positioning */
      [class*="coze-chat-window"] {
        z-index: ${zIndex} !important;
        ${position === 'bottom-right' ? 'right: 20px;' : 'left: 20px;'}
        bottom: 90px;
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('coze-chat-custom-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [isLoaded, zIndex, position]);

  // Don't render anything in SSR
  if (typeof window === 'undefined') {
    return null;
  }

  // Show error message if configuration failed
  if (error) {
    return (
      <div 
        className="fixed bottom-4 right-4 p-4 bg-red-50 border border-red-200 rounded-lg shadow-lg max-w-xs"
        style={{ zIndex }}
      >
        <div className="flex items-start gap-2">
          <X className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Chat Widget Error</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading indicator while script loads
  if (!isLoaded) {
    return (
      <div 
        className="fixed bottom-4 right-4 p-3 bg-white border border-gray-200 rounded-full shadow-lg"
        style={{ zIndex }}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-500 animate-pulse" />
          <span className="text-xs text-gray-600">Loading chat...</span>
        </div>
      </div>
    );
  }

  // Once loaded, Coze SDK handles the UI
  return null;
}
