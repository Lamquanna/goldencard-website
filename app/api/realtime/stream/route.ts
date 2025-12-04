/**
 * Real-time Server-Sent Events (SSE) API
 * Streams real-time updates to connected clients
 */

import { NextRequest, NextResponse } from 'next/server';

// Store active connections
const connections = new Map<string, WritableStreamDefaultWriter>();

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }
  
  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder();
      const send = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };
      
      // Welcome message
      send('connected', {
        userId,
        timestamp: new Date().toISOString(),
        message: 'Connected to real-time stream'
      });
      
      // Store connection for broadcasting
      const connectionId = `${userId}-${Date.now()}`;
      
      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          send('heartbeat', { timestamp: new Date().toISOString() });
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds
      
      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        connections.delete(connectionId);
        console.log(`User ${userId} disconnected from real-time stream`);
        controller.close();
      });
      
      console.log(`User ${userId} connected to real-time stream`);
    }
  });
  
  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

/**
 * Broadcast event to all connected users
 */
export function broadcastEvent(event: string, data: any, targetUserIds?: string[]) {
  const encoder = new TextEncoder();
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  const encoded = encoder.encode(message);
  
  connections.forEach((writer, connectionId) => {
    // If targetUserIds specified, only send to those users
    if (targetUserIds && targetUserIds.length > 0) {
      const userId = connectionId.split('-')[0];
      if (!targetUserIds.includes(userId)) {
        return;
      }
    }
    
    try {
      writer.write(encoded);
    } catch (error) {
      console.error('Error broadcasting to connection:', connectionId, error);
      connections.delete(connectionId);
    }
  });
}

/**
 * Send event to specific user
 */
export function sendToUser(userId: string, event: string, data: any) {
  broadcastEvent(event, data, [userId]);
}
