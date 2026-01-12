/**
 * SSE Client Hook for Real-time Chat
 * Connect to server-sent events stream
 */

import { useEffect, useRef, useState } from 'react';

interface SSEMessage {
  type: string;
  data: any;
}

interface UseSSEOptions {
  userId: string;
  roomId?: string;
  onMessage?: (message: SSEMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnect?: boolean;
  reconnectDelay?: number;
}

export function useSSE({
  userId,
  roomId,
  onMessage,
  onConnect,
  onDisconnect,
  reconnect = true,
  reconnectDelay = 3000,
}: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!userId) return;

    const connect = () => {
      // Build URL
      const params = new URLSearchParams({ userId });
      if (roomId) params.append('roomId', roomId);
      const url = `/api/chat/events?${params.toString()}`;

      // Create EventSource
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // Handle open
      eventSource.onopen = () => {
        console.log('SSE connected');
        setIsConnected(true);
        onConnect?.();
      };

      // Handle messages
      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      // Handle errors
      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setIsConnected(false);
        onDisconnect?.();
        
        // Close current connection
        eventSource.close();
        
        // Attempt reconnect
        if (reconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Reconnecting SSE...');
            connect();
          }, reconnectDelay);
        }
      };
    };

    connect();

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [userId, roomId, reconnect, reconnectDelay]);

  return {
    isConnected,
    disconnect: () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    },
  };
}

/**
 * Example usage in chat component:
 * 
 * const { isConnected } = useSSE({
 *   userId: currentUser.id,
 *   roomId: selectedRoom?.id,
 *   onMessage: (message) => {
 *     if (message.type === 'new_message') {
 *       setMessages(prev => [...prev, message.data]);
 *     } else if (message.type === 'message_read') {
 *       updateMessageReadStatus(message.data);
 *     } else if (message.type === 'typing') {
 *       setTypingUsers(message.data.users);
 *     }
 *   },
 *   onConnect: () => {
 *     console.log('Connected to real-time updates');
 *   },
 * });
 */
