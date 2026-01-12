/**
 * Server-Sent Events (SSE) for Real-time Chat
 * Provides real-time updates without WebSocket complexity
 */

import { NextRequest } from 'next/server';

// Store active connections
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // SSE requires nodejs runtime

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const roomId = searchParams.get('roomId');
  
  if (!userId) {
    return new Response('userId is required', { status: 400 });
  }
  
  // Create a readable stream
  const stream = new ReadableStream({
    start(controller) {
      // Store connection
      const key = roomId || `user:${userId}`;
      if (!connections.has(key)) {
        connections.set(key, new Set());
      }
      connections.get(key)!.add(controller);
      
      // Send initial connection message
      controller.enqueue(
        new TextEncoder().encode(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`)
      );
      
      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(
            new TextEncoder().encode(`:ping\n\n`)
          );
        } catch (error) {
          console.log('Connection closed');
          clearInterval(keepAlive);
        }
      }, 30000);
      
      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        connections.get(key)?.delete(controller);
        if (connections.get(key)?.size === 0) {
          connections.delete(key);
        }
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in Nginx
    },
  });
}

/**
 * Broadcast message to all connections in a room
 */
export function broadcastToRoom(
  roomId: string,
  event: {
    type: string;
    data: any;
  }
) {
  const connectionsSet = connections.get(roomId);
  if (!connectionsSet || connectionsSet.size === 0) return;
  
  const message = `data: ${JSON.stringify(event)}\n\n`;
  const encoder = new TextEncoder();
  
  connectionsSet.forEach((controller: ReadableStreamDefaultController) => {
    try {
      controller.enqueue(encoder.encode(message));
    } catch (error) {
      console.error('Failed to send to connection:', error);
      connectionsSet.delete(controller);
    }
  });
}

/**
 * Broadcast message to specific user
 */
export function broadcastToUser(
  userId: string,
  event: {
    type: string;
    data: any;
  }
) {
  broadcastToRoom(`user:${userId}`, event);
}

/**
 * Get active connections count
 */
export function getActiveConnections(roomId?: string): number {
  if (roomId) {
    return connections.get(roomId)?.size || 0;
  }
  return Array.from(connections.values()).reduce(
    (sum, set) => sum + set.size,
    0
  );
}
