'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
  MoreVertical,
  Reply,
  Edit,
  Trash2,
  Pin,
  Search,
  Phone,
  Video,
  Users,
  Settings,
  AtSign,
  Hash,
  File,
  Download,
  X,
  Check,
  CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useProjectStore } from '../store';

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  attachments?: ChatAttachment[];
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  isEdited?: boolean;
  isPinned?: boolean;
  reactions?: ChatReaction[];
  readBy?: string[];
}

interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail?: string;
}

interface ChatReaction {
  emoji: string;
  userIds: string[];
}

interface ChatMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  isOnline: boolean;
  lastSeen?: Date;
}

interface ProjectChatProps {
  projectId?: string;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    content: 'Xin chào team! Đây là kênh thảo luận cho dự án này.',
    senderId: 'system',
    senderName: 'System',
    timestamp: new Date(Date.now() - 86400000),
    type: 'system',
  },
  {
    id: '2',
    content: 'Hi mọi người, mình đã cập nhật design mới cho homepage.',
    senderId: 'user1',
    senderName: 'Nguyễn Văn A',
    senderAvatar: '/Team/member-1.jpg',
    timestamp: new Date(Date.now() - 7200000),
    type: 'text',
    readBy: ['user2', 'user3'],
  },
  {
    id: '3',
    content: 'File design đính kèm:',
    senderId: 'user1',
    senderName: 'Nguyễn Văn A',
    senderAvatar: '/Team/member-1.jpg',
    timestamp: new Date(Date.now() - 7100000),
    type: 'file',
    attachments: [
      {
        id: 'f1',
        name: 'homepage-design-v2.fig',
        type: 'application/fig',
        size: 2400000,
        url: '#',
      },
    ],
    readBy: ['user2', 'user3'],
  },
  {
    id: '4',
    content: 'Nhìn đẹp quá! Có thể cho mình xem bản mobile được không?',
    senderId: 'user2',
    senderName: 'Trần Thị B',
    senderAvatar: '/Team/member-2.jpg',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text',
    replyTo: {
      id: '2',
      content: 'Hi mọi người, mình đã cập nhật design mới cho homepage.',
      senderName: 'Nguyễn Văn A',
    },
    reactions: [{ emoji: '👍', userIds: ['user1', 'user3'] }],
    readBy: ['user1', 'user3'],
  },
  {
    id: '5',
    content: 'Có, mình sẽ gửi trong hôm nay nhé.',
    senderId: 'user1',
    senderName: 'Nguyễn Văn A',
    senderAvatar: '/Team/member-1.jpg',
    timestamp: new Date(Date.now() - 1800000),
    type: 'text',
    readBy: ['user2', 'user3'],
  },
];

const MOCK_MEMBERS: ChatMember[] = [
  { id: 'user1', name: 'Nguyễn Văn A', avatar: '/Team/member-1.jpg', role: 'Project Manager', isOnline: true },
  { id: 'user2', name: 'Trần Thị B', avatar: '/Team/member-2.jpg', role: 'Designer', isOnline: true },
  { id: 'user3', name: 'Lê Văn C', avatar: '/Team/member-3.jpg', role: 'Developer', isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
  { id: 'user4', name: 'Phạm Thị D', avatar: '/Team/member-4.jpg', role: 'QA Engineer', isOnline: false, lastSeen: new Date(Date.now() - 86400000) },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ============================================================================
// MESSAGE COMPONENT
// ============================================================================

interface MessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPin?: () => void;
}

function MessageItem({
  message,
  isOwn,
  showAvatar,
  onReply,
  onEdit,
  onDelete,
  onPin,
}: MessageItemProps) {
  const [showActions, setShowActions] = useState(false);

  if (message.type === 'system') {
    return (
      <div className="flex items-center justify-center py-2">
        <Badge variant="secondary" className="text-xs font-normal">
          {message.content}
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group flex gap-3 px-4 py-1',
        isOwn && 'flex-row-reverse'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar ? (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} />
          <AvatarFallback className="text-xs">
            {getInitials(message.senderName)}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={cn('flex-1 max-w-[70%]', isOwn && 'flex flex-col items-end')}>
        {/* Sender Name */}
        {showAvatar && !isOwn && (
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {message.senderName}
          </p>
        )}

        {/* Reply Preview */}
        {message.replyTo && (
          <div className={cn(
            'text-xs bg-zinc-100 dark:bg-zinc-800 rounded px-2 py-1 mb-1 border-l-2 border-blue-500',
            isOwn ? 'text-right' : 'text-left'
          )}>
            <span className="font-medium">{message.replyTo.senderName}:</span>{' '}
            <span className="text-zinc-500 line-clamp-1">{message.replyTo.content}</span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 inline-block',
            isOwn
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-md',
            message.isPinned && 'ring-2 ring-amber-400'
          )}
        >
          {/* Pin indicator */}
          {message.isPinned && (
            <div className="flex items-center gap-1 text-xs text-amber-500 mb-1">
              <Pin className="h-3 w-3" />
              <span>Đã ghim</span>
            </div>
          )}

          {/* Text content */}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg',
                    isOwn ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                >
                  <File className="h-8 w-8 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className={cn('text-xs', isOwn ? 'text-blue-200' : 'text-zinc-500')}>
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Edited indicator */}
          {message.isEdited && (
            <span className={cn('text-xs', isOwn ? 'text-blue-200' : 'text-zinc-400')}>
              (đã chỉnh sửa)
            </span>
          )}
        </div>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {message.reactions.map((reaction, index) => (
              <button
                key={index}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <span>{reaction.emoji}</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {reaction.userIds.length}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Timestamp & Read status */}
        <div className={cn('flex items-center gap-1 mt-1', isOwn && 'flex-row-reverse')}>
          <span className="text-[10px] text-zinc-400">
            {format(message.timestamp, 'HH:mm')}
          </span>
          {isOwn && message.readBy && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  {message.readBy.length > 0 ? (
                    <CheckCheck className="h-3 w-3 text-blue-400" />
                  ) : (
                    <Check className="h-3 w-3 text-zinc-400" />
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {message.readBy.length > 0
                    ? `Đã đọc bởi ${message.readBy.length} người`
                    : 'Đã gửi'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              'flex items-center gap-1 self-center',
              isOwn && 'flex-row-reverse'
            )}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onReply}>
                    <Reply className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Trả lời</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={onPin}>
                  <Pin className="mr-2 h-4 w-4" />
                  {message.isPinned ? 'Bỏ ghim' : 'Ghim tin nhắn'}
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa tin nhắn
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MEMBER LIST COMPONENT
// ============================================================================

interface MemberListProps {
  members: ChatMember[];
  onClose: () => void;
}

function MemberList({ members, onClose }: MemberListProps) {
  const onlineCount = members.filter((m) => m.isOnline).length;

  return (
    <div className="w-64 border-l border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Thành viên ({members.length})
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-zinc-500">{onlineCount} đang online</p>
      </div>

      <div className="p-2 space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src={member.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(member.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900',
                  member.isOnline ? 'bg-emerald-500' : 'bg-zinc-300'
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {member.name}
              </p>
              <p className="text-xs text-zinc-500 truncate">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProjectChat({
  projectId,
  currentUserId = 'user1',
  currentUserName = 'Nguyễn Văn A',
  currentUserAvatar = '/Team/member-1.jpg',
}: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { selectedProject } = useProjectStore();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      senderAvatar: currentUserAvatar,
      timestamp: new Date(),
      type: 'text',
      replyTo: replyTo
        ? {
            id: replyTo.id,
            content: replyTo.content,
            senderName: replyTo.senderName,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    setReplyTo(null);
  }, [newMessage, currentUserId, currentUserName, currentUserAvatar, replyTo]);

  // Handle key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = format(message.timestamp, 'yyyy-MM-dd');
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  }, [messages]);

  return (
    <Card className="h-[600px] flex overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {selectedProject?.name || 'Project Chat'}
              </h2>
              <p className="text-xs text-zinc-500">
                {MOCK_MEMBERS.filter((m) => m.isOnline).length} thành viên đang online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Gọi thoại</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tìm kiếm</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={showMembers ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setShowMembers(!showMembers)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Thành viên</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500">
                  {format(new Date(group.date), 'EEEE, dd/MM/yyyy', { locale: vi })}
                </div>
              </div>

              {/* Messages in group */}
              {group.messages.map((message, index) => {
                const prevMessage = index > 0 ? group.messages[index - 1] : null;
                const showAvatar =
                  !prevMessage ||
                  prevMessage.senderId !== message.senderId ||
                  message.timestamp.getTime() - prevMessage.timestamp.getTime() > 300000; // 5 min gap

                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={message.senderId === currentUserId}
                    showAvatar={showAvatar}
                    onReply={() => setReplyTo(message)}
                  />
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-blue-500" />
                  <div className="text-sm">
                    <span className="text-zinc-500">Trả lời</span>{' '}
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      {replyTo.senderName}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setReplyTo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-zinc-500 truncate ml-6">{replyTo.content}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Đính kèm file</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex-1 relative">
              <Input
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Member Sidebar */}
      <AnimatePresence>
        {showMembers && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MemberList members={MOCK_MEMBERS} onClose={() => setShowMembers(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
