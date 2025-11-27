// Firebase Messaging Service Worker
// Handles background push notifications

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase configuration (must match config.ts)
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || '',
  authDomain: self.FIREBASE_AUTH_DOMAIN || '',
  projectId: self.FIREBASE_PROJECT_ID || '',
  storageBucket: self.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: self.FIREBASE_APP_ID || '',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'GoldenEnergy';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/images/logo-icon.png',
    badge: '/images/logo-icon.png',
    tag: payload.data?.tag || 'default',
    data: payload.data || {},
    requireInteraction: payload.data?.requireInteraction === 'true',
    actions: getNotificationActions(payload.data?.type),
  };
  
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const data = event.notification.data || {};
  let targetUrl = '/crm'; // Default URL
  
  // Determine URL based on notification type
  switch (data.type) {
    case 'new_message':
    case 'mention':
      targetUrl = `/chat/${data.conversationId || ''}`;
      break;
    case 'task_assigned':
    case 'task_completed':
    case 'task_due_soon':
    case 'task_overdue':
      targetUrl = `/projects/${data.projectId || ''}?task=${data.taskId || ''}`;
      break;
    case 'lead_assigned':
    case 'lead_status_changed':
      targetUrl = `/crm?lead=${data.leadId || ''}`;
      break;
    case 'project_update':
      targetUrl = `/projects/${data.projectId || ''}`;
      break;
    default:
      targetUrl = data.link || '/crm';
  }
  
  // Handle action buttons
  if (event.action === 'view') {
    targetUrl = data.link || targetUrl;
  } else if (event.action === 'dismiss') {
    return; // Just close
  }
  
  // Open or focus window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin)) {
            client.focus();
            client.navigate(targetUrl);
            return;
          }
        }
        // No window open, open new one
        return clients.openWindow(targetUrl);
      })
  );
});

// Helper function to get notification actions
function getNotificationActions(type) {
  const defaultActions = [
    { action: 'view', title: 'Xem', icon: '/icons/view.png' },
    { action: 'dismiss', title: 'Bỏ qua', icon: '/icons/dismiss.png' },
  ];
  
  switch (type) {
    case 'new_message':
      return [
        { action: 'reply', title: 'Trả lời', icon: '/icons/reply.png' },
        { action: 'view', title: 'Xem', icon: '/icons/view.png' },
      ];
    case 'task_assigned':
      return [
        { action: 'accept', title: 'Nhận', icon: '/icons/check.png' },
        { action: 'view', title: 'Xem', icon: '/icons/view.png' },
      ];
    default:
      return defaultActions;
  }
}

// Push subscription change handler
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed');
  // Handle subscription update (re-subscribe)
});

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(clients.claim());
});
