// Firebase Chat Service for ERP System
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  getDocs,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group' | 'channel';
  participants: string[]; // UIDs
  participantNames: Record<string, string>; // UID -> Name mapping
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: Record<string, number>; // UID -> count
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  timestamp: Date;
}

const MESSAGES_COLLECTION = 'chat_messages';
const ROOMS_COLLECTION = 'chat_rooms';
const TYPING_COLLECTION = 'typing_status';

/**
 * Send a chat message
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  message: string,
  senderAvatar?: string
) {
  if (!db) throw new Error('Firestore not initialized');

  const messageData = {
    roomId,
    senderId,
    senderName,
    senderAvatar,
    message,
    type: 'text',
    isRead: false,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData);

  // Update room last message
  await updateDoc(doc(db, ROOMS_COLLECTION, roomId), {
    lastMessage: message,
    lastMessageAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Listen to messages in a room (real-time)
 */
export function subscribeToMessages(
  roomId: string,
  callback: (messages: ChatMessage[]) => void
) {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('roomId', '==', roomId),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: ChatMessage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as ChatMessage);
    });
    callback(messages.reverse());
  });
}

/**
 * Create a chat room
 */
export async function createChatRoom(
  name: string,
  type: 'direct' | 'group' | 'channel',
  participants: string[],
  participantNames: Record<string, string>,
  createdBy: string
) {
  if (!db) throw new Error('Firestore not initialized');

  const roomData: Omit<ChatRoom, 'id'> = {
    name,
    type,
    participants,
    participantNames,
    unreadCount: {},
    createdBy,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const docRef = await addDoc(collection(db, ROOMS_COLLECTION), roomData);
  return docRef.id;
}

/**
 * Get or create direct message room
 */
export async function getOrCreateDirectRoom(
  user1Id: string,
  user1Name: string,
  user2Id: string,
  user2Name: string
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized');

  // Check if room exists
  const q = query(
    collection(db, ROOMS_COLLECTION),
    where('type', '==', 'direct'),
    where('participants', 'array-contains', user1Id)
  );

  const snapshot = await getDocs(q);
  const existingRoom = snapshot.docs.find((doc) => {
    const data = doc.data();
    return data.participants.includes(user2Id);
  });

  if (existingRoom) {
    return existingRoom.id;
  }

  // Create new room
  const roomId = await createChatRoom(
    `${user1Name} & ${user2Name}`,
    'direct',
    [user1Id, user2Id],
    { [user1Id]: user1Name, [user2Id]: user2Name },
    user1Id
  );

  return roomId;
}

/**
 * Get user's chat rooms
 */
export function subscribeToUserRooms(userId: string, callback: (rooms: ChatRoom[]) => void) {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, ROOMS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const rooms: ChatRoom[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      rooms.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastMessageAt: data.lastMessageAt?.toDate(),
      } as ChatRoom);
    });
    callback(rooms);
  });
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(roomId: string, userId: string) {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('roomId', '==', roomId),
    where('senderId', '!=', userId),
    where('isRead', '==', false)
  );

  const snapshot = await getDocs(q);
  const updatePromises = snapshot.docs.map((doc) =>
    updateDoc(doc.ref, { isRead: true })
  );

  await Promise.all(updatePromises);

  // Update unread count in room
  const roomRef = doc(db, ROOMS_COLLECTION, roomId);
  const roomSnap = await getDoc(roomRef);
  if (roomSnap.exists()) {
    const roomData = roomSnap.data();
    const unreadCount = { ...roomData.unreadCount, [userId]: 0 };
    await updateDoc(roomRef, { unreadCount });
  }
}

/**
 * Update typing status
 */
export async function updateTypingStatus(
  roomId: string,
  userId: string,
  userName: string,
  isTyping: boolean
) {
  if (!db) throw new Error('Firestore not initialized');

  const typingDoc = doc(db, TYPING_COLLECTION, `${roomId}_${userId}`);

  if (isTyping) {
    await updateDoc(typingDoc, {
      userId,
      userName,
      roomId,
      timestamp: serverTimestamp(),
    });
  } else {
    await deleteDoc(typingDoc);
  }
}

/**
 * Listen to typing status in a room
 */
export function subscribeToTypingStatus(
  roomId: string,
  currentUserId: string,
  callback: (typingUsers: TypingStatus[]) => void
) {
  if (!db) throw new Error('Firestore not initialized');

  const q = query(
    collection(db, TYPING_COLLECTION),
    where('roomId', '==', roomId)
  );

  return onSnapshot(q, (snapshot) => {
    const typingUsers: TypingStatus[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId !== currentUserId) {
        typingUsers.push({
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      }
    });
    callback(typingUsers);
  });
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string) {
  if (!db) throw new Error('Firestore not initialized');
  await deleteDoc(doc(db, MESSAGES_COLLECTION, messageId));
}

/**
 * Get room details
 */
export async function getChatRoom(roomId: string): Promise<ChatRoom | null> {
  if (!db) throw new Error('Firestore not initialized');

  const docRef = doc(db, ROOMS_COLLECTION, roomId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastMessageAt: data.lastMessageAt?.toDate(),
    } as ChatRoom;
  }

  return null;
}
