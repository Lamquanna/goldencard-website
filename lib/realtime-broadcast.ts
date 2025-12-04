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
 * @param roomId - The room to broadcast to
 * @param event - Event type
 * @param data - Event data
 * 
 * SECURITY: This should query database for room members before broadcasting
 * Current implementation is a placeholder - DO NOT use in production without
 * implementing proper member lookup from chat_room_members table
 */
export async function broadcastToRoom(roomId: string, event: string, data: any) {
  // TODO: Implement proper room member lookup
  // Example implementation:
  // const members = await db.query(
  //   'SELECT user_id FROM chat_room_members WHERE room_id = $1',
  //   [roomId]
  // );
  // const userIds = members.rows.map(m => m.user_id);
  // broadcastEvent(event, data, userIds);
  
  // WARNING: Temporary placeholder - broadcasts to all users
  console.warn('broadcastToRoom: Member filtering not implemented - broadcasting to all users');
  broadcastEvent(event, data);
}
