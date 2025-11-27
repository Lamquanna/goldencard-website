// Firestore Database Operations
// Handles all Firestore CRUD operations for chat and notifications

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
  DocumentData,
  QueryDocumentSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirestoreInstance, COLLECTIONS, isFirebaseConfigured } from './config';
import type { 
  FirestoreUser, 
  Chat, 
  Group, 
  Message, 
  Notification 
} from '@/lib/types/chat';

// Helper to get Firestore (throws if not available)
function getDb() {
  return getFirestoreInstance();
}

// ============================================
// USER OPERATIONS
// ============================================

export async function createOrUpdateUser(user: FirestoreUser): Promise<void> {
  const userRef = doc(getDb(), COLLECTIONS.USERS, user.uid);
  await setDoc(userRef, {
    ...user,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUser(uid: string): Promise<FirestoreUser | null> {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as FirestoreUser;
  }
  return null;
}

export async function updateUserStatus(uid: string, status: 'online' | 'offline' | 'away' | 'busy'): Promise<void> {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  await updateDoc(userRef, {
    status,
    lastSeen: serverTimestamp(),
  });
}

export async function updateFCMToken(uid: string, token: string): Promise<void> {
  const userRef = doc(getDb(), COLLECTIONS.USERS, uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const tokens = userData.fcmTokens || [];
    
    if (!tokens.includes(token)) {
      tokens.push(token);
      await updateDoc(userRef, { fcmTokens: tokens });
    }
  }
}

// ============================================
// CHAT OPERATIONS (Direct Messages)
// ============================================

export async function createDirectChat(user1Id: string, user2Id: string, user1Details: any, user2Details: any): Promise<string> {
  // Check if chat already exists
  const existingChat = await findDirectChat(user1Id, user2Id);
  if (existingChat) return existingChat;
  
  const chatRef = await addDoc(collection(getDb(), COLLECTIONS.CHATS), {
    type: 'direct',
    participants: [user1Id, user2Id].sort(), // Sort for consistency
    participantDetails: {
      [user1Id]: user1Details,
      [user2Id]: user2Details,
    },
    lastMessage: null,
    unreadCount: {
      [user1Id]: 0,
      [user2Id]: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return chatRef.id;
}

async function findDirectChat(user1Id: string, user2Id: string): Promise<string | null> {
  const participants = [user1Id, user2Id].sort();
  const q = query(
    collection(getDb(), COLLECTIONS.CHATS),
    where('type', '==', 'direct'),
    where('participants', '==', participants)
  );
  
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
}

export async function getUserChats(userId: string): Promise<Chat[]> {
  const q = query(
    collection(getDb(), COLLECTIONS.CHATS),
    where('participants', 'array-contains', userId)
  );
  
  const snapshot = await getDocs(q);
  const chats = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Chat));
  
  // Sort in memory instead of using orderBy (avoids composite index)
  return chats.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() || 0;
    const bTime = b.updatedAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
}

// ============================================
// GROUP OPERATIONS
// ============================================

export async function createGroup(data: {
  name: string;
  description?: string;
  type: 'group' | 'project';
  projectId?: string;
  owner: string;
  members: string[];
  memberDetails: Record<string, any>;
}): Promise<string> {
  const groupRef = await addDoc(collection(getDb(), COLLECTIONS.GROUPS), {
    ...data,
    admins: [data.owner],
    settings: {
      onlyAdminsCanPost: false,
      onlyAdminsCanAddMembers: true,
    },
    lastMessage: null,
    pinnedMessages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return groupRef.id;
}

export async function getGroup(groupId: string): Promise<Group | null> {
  const groupRef = doc(getDb(), COLLECTIONS.GROUPS, groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (groupSnap.exists()) {
    return { id: groupSnap.id, ...groupSnap.data() } as Group;
  }
  return null;
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(
    collection(getDb(), COLLECTIONS.GROUPS),
    where('members', 'array-contains', userId)
  );
  
  const snapshot = await getDocs(q);
  const groups = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Group));
  
  // Sort in memory instead of using orderBy (avoids composite index)
  return groups.sort((a, b) => {
    const aTime = a.updatedAt?.toMillis?.() || 0;
    const bTime = b.updatedAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
}

export async function addGroupMember(groupId: string, userId: string, userDetails: any): Promise<void> {
  const groupRef = doc(getDb(), COLLECTIONS.GROUPS, groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (groupSnap.exists()) {
    const data = groupSnap.data();
    const members = [...data.members, userId];
    const memberDetails = {
      ...data.memberDetails,
      [userId]: userDetails,
    };
    
    await updateDoc(groupRef, { members, memberDetails, updatedAt: serverTimestamp() });
  }
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const groupRef = doc(getDb(), COLLECTIONS.GROUPS, groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (groupSnap.exists()) {
    const data = groupSnap.data();
    const members = data.members.filter((id: string) => id !== userId);
    const memberDetails = { ...data.memberDetails };
    delete memberDetails[userId];
    
    await updateDoc(groupRef, { members, memberDetails, updatedAt: serverTimestamp() });
  }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

export async function sendMessage(
  conversationType: 'chat' | 'group',
  conversationId: string,
  message: Omit<Message, 'id' | 'createdAt'>
): Promise<string> {
  const collectionPath = conversationType === 'chat' 
    ? COLLECTIONS.CHATS 
    : COLLECTIONS.GROUPS;
  
  const messagesRef = collection(getDb(), collectionPath, conversationId, COLLECTIONS.MESSAGES);
  
  const messageDoc = await addDoc(messagesRef, {
    ...message,
    createdAt: serverTimestamp(),
  });
  
  // Update last message in conversation
  const conversationRef = doc(getDb(), collectionPath, conversationId);
  await updateDoc(conversationRef, {
    lastMessage: {
      text: message.text || (message.attachments?.length ? '[Tệp đính kèm]' : ''),
      senderId: message.senderId,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });
  
  return messageDoc.id;
}

export async function getMessages(
  conversationType: 'chat' | 'group',
  conversationId: string,
  limitCount: number = 50,
  lastDoc?: QueryDocumentSnapshot<DocumentData>
): Promise<{ messages: Message[]; lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
  const collectionPath = conversationType === 'chat' 
    ? COLLECTIONS.CHATS 
    : COLLECTIONS.GROUPS;
  
  let q = query(
    collection(getDb(), collectionPath, conversationId, COLLECTIONS.MESSAGES),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Message)).reverse();
  
  const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
  
  return { messages, lastDoc: lastVisible };
}

export function subscribeToMessages(
  conversationType: 'chat' | 'group',
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const collectionPath = conversationType === 'chat' 
    ? COLLECTIONS.CHATS 
    : COLLECTIONS.GROUPS;
  
  const q = query(
    collection(getDb(), collectionPath, conversationId, COLLECTIONS.MESSAGES),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Message)).reverse();
    
    callback(messages);
  });
}

export async function deleteMessage(
  conversationType: 'chat' | 'group',
  conversationId: string,
  messageId: string,
  hardDelete: boolean = false
): Promise<void> {
  const collectionPath = conversationType === 'chat' 
    ? COLLECTIONS.CHATS 
    : COLLECTIONS.GROUPS;
  
  const messageRef = doc(getDb(), collectionPath, conversationId, COLLECTIONS.MESSAGES, messageId);
  
  if (hardDelete) {
    await deleteDoc(messageRef);
  } else {
    await updateDoc(messageRef, { deleted: true });
  }
}

export async function editMessage(
  conversationType: 'chat' | 'group',
  conversationId: string,
  messageId: string,
  newText: string
): Promise<void> {
  const collectionPath = conversationType === 'chat' 
    ? COLLECTIONS.CHATS 
    : COLLECTIONS.GROUPS;
  
  const messageRef = doc(getDb(), collectionPath, conversationId, COLLECTIONS.MESSAGES, messageId);
  
  await updateDoc(messageRef, {
    text: newText,
    edited: true,
    editedAt: serverTimestamp(),
  });
}

export async function addReaction(
  conversationType: 'chat' | 'group',
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const collectionPath = conversationType === 'chat' 
    ? COLLECTIONS.CHATS 
    : COLLECTIONS.GROUPS;
  
  const messageRef = doc(getDb(), collectionPath, conversationId, COLLECTIONS.MESSAGES, messageId);
  const messageSnap = await getDoc(messageRef);
  
  if (messageSnap.exists()) {
    const reactions = messageSnap.data().reactions || {};
    const emojiReactions = reactions[emoji] || [];
    
    if (!emojiReactions.includes(userId)) {
      emojiReactions.push(userId);
      reactions[emoji] = emojiReactions;
      await updateDoc(messageRef, { reactions });
    }
  }
}

export async function pinMessage(
  groupId: string,
  messageId: string
): Promise<void> {
  const groupRef = doc(getDb(), COLLECTIONS.GROUPS, groupId);
  const groupSnap = await getDoc(groupRef);
  
  if (groupSnap.exists()) {
    const pinnedMessages = groupSnap.data().pinnedMessages || [];
    if (!pinnedMessages.includes(messageId)) {
      pinnedMessages.push(messageId);
      await updateDoc(groupRef, { pinnedMessages });
    }
  }
}

// ============================================
// TYPING INDICATOR
// ============================================

export async function setTypingStatus(
  conversationId: string,
  oderId: string,
  isTyping: boolean
): Promise<void> {
  const typingRef = doc(getDb(), COLLECTIONS.TYPING, conversationId, 'users', oderId);
  
  if (isTyping) {
    await setDoc(typingRef, {
      isTyping: true,
      timestamp: serverTimestamp(),
    });
    
    // Auto-clear after 3 seconds
    setTimeout(async () => {
      await deleteDoc(typingRef).catch(() => {});
    }, 3000);
  } else {
    await deleteDoc(typingRef).catch(() => {});
  }
}

export function subscribeToTyping(
  conversationId: string,
  callback: (typingUsers: string[]) => void
): Unsubscribe {
  const q = collection(getDb(), COLLECTIONS.TYPING, conversationId, 'users');
  
  return onSnapshot(q, (snapshot) => {
    const typingUsers = snapshot.docs
      .filter(doc => doc.data().isTyping)
      .map(doc => doc.id);
    
    callback(typingUsers);
  });
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export async function createNotification(
  userId: string,
  notification: Omit<Notification, 'id' | 'createdAt'>
): Promise<string> {
  const notifRef = await addDoc(
    collection(getDb(), COLLECTIONS.NOTIFICATIONS, userId, 'items'),
    {
      ...notification,
      read: false,
      createdAt: serverTimestamp(),
    }
  );
  
  return notifRef.id;
}

export async function getUserNotifications(
  userId: string,
  limitCount: number = 50
): Promise<Notification[]> {
  const q = query(
    collection(getDb(), COLLECTIONS.NOTIFICATIONS, userId, 'items'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Notification));
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const q = query(
    collection(getDb(), COLLECTIONS.NOTIFICATIONS, userId, 'items'),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    
    callback(notifications);
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  const notifRef = doc(getDb(), COLLECTIONS.NOTIFICATIONS, userId, 'items', notificationId);
  await updateDoc(notifRef, { read: true });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const q = query(
    collection(getDb(), COLLECTIONS.NOTIFICATIONS, userId, 'items'),
    where('read', '==', false)
  );
  
  const snapshot = await getDocs(q);
  const batch = writeBatch(getDb());
  
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  
  await batch.commit();
}

// ============================================
// PRESENCE SYSTEM
// ============================================

export async function updatePresence(userId: string, data: {
  online: boolean;
  currentPage?: string;
}): Promise<void> {
  const presenceRef = doc(getDb(), COLLECTIONS.PRESENCE, userId);
  await setDoc(presenceRef, {
    ...data,
    lastSeen: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToPresence(
  userIds: string[],
  callback: (presence: Record<string, { online: boolean; lastSeen: Date }>) => void
): Unsubscribe[] {
  const unsubscribes: Unsubscribe[] = [];
  const presenceData: Record<string, any> = {};
  
  userIds.forEach(userId => {
    const presenceRef = doc(getDb(), COLLECTIONS.PRESENCE, userId);
    const unsub = onSnapshot(presenceRef, (snapshot) => {
      if (snapshot.exists()) {
        presenceData[userId] = snapshot.data();
      } else {
        presenceData[userId] = { online: false, lastSeen: null };
      }
      callback(presenceData);
    });
    unsubscribes.push(unsub);
  });
  
  return unsubscribes;
}

