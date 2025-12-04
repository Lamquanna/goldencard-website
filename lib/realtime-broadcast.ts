/**
 * Real-time Broadcasting Utilities
 * Helper functions for broadcasting events via SSE
 */

// Store active connections
export const connections = new Map<string, WritableStreamDefaultWriter>();

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

/**
 * Broadcast to all users in a chat room
 */
export function broadcastToRoom(roomId: string, event: string, data: any) {
  // In a real implementation, this would look up room members from database
  // and broadcast to only those users
  broadcastEvent(event, data);
}
