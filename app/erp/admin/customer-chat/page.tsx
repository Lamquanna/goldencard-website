/**
 * Admin Customer Chat View
 * Dashboard để admin xem và trả lời tin nhắn khách hàng
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, Send, Search, Filter, Archive, 
  MoreVertical, Clock, CheckCheck, User, Mail, Phone,
  X, RefreshCw, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ChatRoom {
  id: string;
  name: string;
  lastMessage: {
    content: string;
    createdAt: string;
    sender: { name: string };
  };
  messageCount: number;
  lastMessageAt: string;
  isArchived: boolean;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export default function AdminCustomerChatPage() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat rooms
  useEffect(() => {
    loadRooms();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadRooms, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  // Load messages when room selected
  useEffect(() => {
    if (selectedRoom) {
      loadMessages(selectedRoom.id);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => loadMessages(selectedRoom.id), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadRooms = async () => {
    try {
      const response = await fetch(`/api/chat/customer?status=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/chat/customer/${roomId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || sending) return;

    setSending(true);
    try {
      // Get current admin user (replace with actual auth)
      const adminUserId = 'admin-user-id'; // TODO: Get from session

      const response = await fetch(`/api/chat/customer/${selectedRoom.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: adminUserId,
          content: newMessage.trim(),
          type: 'TEXT',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const archiveRoom = async (roomId: string) => {
    try {
      await fetch(`/api/chat/customer/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      });
      loadRooms();
      if (selectedRoom?.id === roomId) {
        setSelectedRoom(null);
      }
    } catch (error) {
      console.error('Error archiving room:', error);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Back Button Header */}
      <div className="p-4 bg-white border-b">
        <Link href="/erp/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Chat Rooms List */}
        <div className="w-96 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-[#D4AF37]" />
                Chat Khách hàng
              </h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadRooms}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className="flex-1"
            >
              Hoạt động
            </Button>
            <Button
              variant={filter === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('archived')}
              className="flex-1"
            >
              Lưu trữ
            </Button>
          </div>
        </div>

        {/* Rooms List */}
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Đang tải...</div>
          ) : filteredRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Không có cuộc trò chuyện
            </div>
          ) : (
            <div className="divide-y">
              {filteredRooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    selectedRoom?.id === room.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="text-xs text-gray-500">
                          {room.messageCount} tin nhắn
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(room.lastMessageAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>
                  {room.lastMessage && (
                    <p className="text-sm text-gray-600 truncate">
                      {room.lastMessage.sender.name}: {room.lastMessage.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{selectedRoom.name}</h2>
                <p className="text-sm text-gray-500">
                  {messages.length} tin nhắn
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => archiveRoom(selectedRoom.id)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Lưu trữ
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4 bg-gray-50">
              <div className="space-y-4 max-w-4xl mx-auto">
                {messages.map((msg) => {
                  const isAdmin = msg.sender.email?.includes('admin') || 
                                  msg.sender.email?.includes('@goldenenergy');
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isAdmin
                            ? 'bg-[#D4AF37] text-white'
                            : 'bg-white border'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {msg.sender.name}
                          </span>
                          <span className={`text-xs ${isAdmin ? 'text-white/70' : 'text-gray-400'}`}>
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-white">
              <div className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto mb-4" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
