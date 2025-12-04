/**
 * Example: Integrating Real-time Features with Client Components
 * 
 * This file shows how to update existing components to use real data
 * from Supabase instead of mock arrays.
 */

// ============================================================================
// EXAMPLE 1: GlobalChatWidget with Real-time Chat
// ============================================================================

import { useRealtimeStore, realtimeManager, sendChatMessage, markRoomAsRead } from '@/lib/realtime';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function GlobalChatWidget() {
  const supabase = createClient();
  const { 
    isConnected, 
    onlineUsers, 
    chatRooms,
    messages, 
    unreadCounts 
  } = useRealtimeStore();
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  // Get current user on mount
  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        // Connect to real-time service
        realtimeManager.connect(user.id);
      }
    }
    getCurrentUser();

    return () => {
      realtimeManager.disconnect();
    };
  }, [supabase]);

  // Load chat rooms for current user
  useEffect(() => {
    if (!currentUserId) return;

    async function loadRooms() {
      const { data, error } = await supabase
        .from('chat_room_members')
        .select(`
          room_id,
          chat_rooms (
            id,
            name,
            type,
            is_private
          )
        `)
        .eq('user_id', currentUserId)
        .is('left_at', null);

      if (!error && data) {
        // Update store with rooms
        // useRealtimeStore.getState().setChatRooms(data.map(d => d.chat_rooms));
      }
    }

    loadRooms();
  }, [currentUserId, supabase]);

  // Send message
  const handleSendMessage = async (content: string) => {
    if (!currentRoomId || !content.trim()) return;

    const message = await sendChatMessage(currentRoomId, content);
    if (message) {
      console.log('Message sent:', message);
    }
  };

  // Mark room as read
  const handleSelectRoom = async (roomId: string) => {
    setCurrentRoomId(roomId);
    await markRoomAsRead(roomId);
  };

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat widget UI */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3>Chat ({onlineUsers.length} online)</h3>
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>
        
        {totalUnread > 0 && (
          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
            {totalUnread} unread
          </span>
        )}
        
        {/* Rest of chat UI */}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: TaskCreationModal with Supabase
// ============================================================================

import { Dialog } from '@headlessui/react';

export function TaskCreationModal({ isOpen, onClose, projectId }: {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}) {
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    assigneeId?: string;
    priority: string;
    dueDate?: string;
  }) => {
    setIsSubmitting(true);

    try {
      // Create task in Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          title: formData.title,
          description: formData.description,
          assignee_id: formData.assigneeId,
          priority: formData.priority,
          due_date: formData.dueDate,
          status: 'todo',
          reporter_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification for assignee
      if (formData.assigneeId) {
        await supabase.from('notifications').insert({
          user_id: formData.assigneeId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to "${formData.title}"`,
          link: `/erp/tasks/${data.id}`,
          entity_type: 'task',
          entity_id: data.id,
          priority: formData.priority === 'urgent' ? 'urgent' : 'normal'
        });
      }

      console.log('Task created:', data);
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Task creation form */}
    </Dialog>
  );
}

// ============================================================================
// EXAMPLE 3: LeadsList with Real Data
// ============================================================================

export function LeadsList() {
  const supabase = createClient();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_sources (name, icon, color),
          lead_stages (name, color),
          users!leads_assigned_to_fkey (full_name, avatar)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setLeads(data);
      }
      
      setLoading(false);
    }

    fetchLeads();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('Lead changed:', payload);
          // Refetch or update local state
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {leads.map(lead => (
        <div key={lead.id}>
          <h3>{lead.full_name}</h3>
          <p>{lead.company_name}</p>
          <span style={{ color: lead.lead_stages.color }}>
            {lead.lead_stages.name}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// EXAMPLE 4: NotificationCenter
// ============================================================================

import { fetchNotifications, markNotificationAsRead } from '@/lib/realtime';

export function NotificationCenter() {
  const { notifications, unreadNotificationCount } = useRealtimeStore();
  const [isOpen, setIsOpen] = useState(false);

  // Load initial notifications
  useEffect(() => {
    async function loadNotifications() {
      const notifs = await fetchNotifications();
      // useRealtimeStore.getState().setNotifications(notifs);
    }
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        🔔
        {unreadNotificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg">
          {notifications.map(notif => (
            <div 
              key={notif.id}
              className={`p-4 border-b ${!notif.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{notif.title}</p>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-xs text-blue-600"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLE 5: Online Users List
// ============================================================================

export function OnlineUsersList() {
  const { onlineUsers } = useRealtimeStore();

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-2">Online Now ({onlineUsers.length})</h3>
      <div className="space-y-2">
        {onlineUsers.map(user => (
          <div key={user.id} className="flex items-center space-x-2">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.fullName}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-gray-500">@{user.username}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              user.status === 'online' ? 'bg-green-500' :
              user.status === 'away' ? 'bg-yellow-500' :
              user.status === 'busy' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// EXAMPLE 6: Visitor Analytics Dashboard
// ============================================================================

export function VisitorAnalyticsDashboard() {
  const supabase = createClient();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      // Get visitor analytics from view
      const { data, error } = await supabase
        .from('v_visitor_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (!error && data) {
        setAnalytics(data);
      }
    }

    fetchAnalytics();
  }, [supabase]);

  if (!analytics) return <div>Loading analytics...</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Total Sessions</h3>
        <p className="text-2xl font-bold">
          {analytics.reduce((sum: number, day: any) => sum + day.total_sessions, 0)}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm text-gray-500">Unique Visitors</h3>
        <p className="text-2xl font-bold">
          {analytics.reduce((sum: number, day: any) => sum + day.unique_visitors, 0)}
        </p>
      </div>
      {/* More analytics cards */}
    </div>
  );
}
