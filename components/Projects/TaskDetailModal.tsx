'use client';

// Task Detail Modal Component
// Full task view with all details, subtasks, comments, attachments

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectTask, Subtask, Comment, Attachment, ProjectPriority, TaskStatus, TaskType } from '@/lib/types/project';
import { 
  getPriorityLabel, 
  getPriorityColor, 
  getStatusLabel, 
  getStatusColor,
  getTypeLabel,
  getTypeIcon
} from '@/lib/types/project';

interface TaskDetailModalProps {
  task: ProjectTask;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<ProjectTask>) => Promise<void>;
  onDelete: () => Promise<void>;
  projectMembers?: Array<{ id: string; name: string; avatar?: string }>;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  projectMembers = [],
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments' | 'attachments'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<ProjectTask>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  // Reset state when task changes
  React.useEffect(() => {
    setEditedTask({});
    setIsEditing(false);
  }, [task.id]);

  const handleSave = async () => {
    if (Object.keys(editedTask).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(editedTask);
      setIsEditing(false);
      setEditedTask({});
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTask = { ...task, ...editedTask };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-100">
            <div className="flex-1 min-w-0 pr-4">
              {/* Task Type */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{getTypeIcon(task.type || 'task')}</span>
                <span className="text-sm text-gray-500">{getTypeLabel(task.type || 'task')}</span>
                <span className="text-sm text-gray-400">#{task.task_code || task.id.slice(0, 8)}</span>
              </div>

              {/* Title */}
              {isEditing ? (
                <input
                  type="text"
                  value={currentTask.title}
                  onChange={e => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="w-full text-xl font-bold text-gray-900 border-b-2 border-sky-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTask({});
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50"
                  >
                    {isLoading ? 'Đang lưu...' : 'Lưu'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Sửa
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-3 gap-6">
              {/* Main content */}
              <div className="col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Mô tả</h3>
                  {isEditing ? (
                    <textarea
                      value={currentTask.description || ''}
                      onChange={e => setEditedTask({ ...editedTask, description: e.target.value })}
                      rows={4}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      placeholder="Thêm mô tả..."
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {task.description || 'Chưa có mô tả'}
                    </p>
                  )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex gap-4">
                    {[
                      { id: 'subtasks', label: 'Công việc con', count: task.subtask_count },
                      { id: 'comments', label: 'Bình luận', count: task.comment_count },
                      { id: 'attachments', label: 'Đính kèm', count: 0 },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === tab.id
                            ? 'border-sky-500 text-sky-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {tab.label} {tab.count ? `(${tab.count})` : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab content */}
                <div>
                  {activeTab === 'subtasks' && (
                    <SubtasksTab 
                      subtasks={[]}
                      newSubtask={newSubtask}
                      onNewSubtaskChange={setNewSubtask}
                      onAddSubtask={() => {
                        // Add subtask logic
                        setNewSubtask('');
                      }}
                    />
                  )}

                  {activeTab === 'comments' && (
                    <CommentsTab
                      comments={[]}
                      newComment={newComment}
                      onNewCommentChange={setNewComment}
                      onAddComment={() => {
                        // Add comment logic
                        setNewComment('');
                      }}
                    />
                  )}

                  {activeTab === 'attachments' && (
                    <AttachmentsTab attachments={[]} />
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Trạng thái</label>
                  <StatusSelect
                    value={currentTask.status}
                    onChange={status => {
                      if (isEditing) {
                        setEditedTask({ ...editedTask, status });
                      } else {
                        onUpdate({ status });
                      }
                    }}
                    disabled={isLoading}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Độ ưu tiên</label>
                  <PrioritySelect
                    value={currentTask.priority}
                    onChange={priority => {
                      if (isEditing) {
                        setEditedTask({ ...editedTask, priority });
                      } else {
                        onUpdate({ priority });
                      }
                    }}
                    disabled={isLoading}
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Người thực hiện</label>
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {task.assigned_to ? (
                        <span className="text-sm font-medium text-gray-600">
                          {task.assigned_to.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-gray-700">
                      {task.assigned_to || 'Chưa gán'}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={currentTask.start_date?.split('T')[0] || ''}
                    onChange={e => {
                      if (isEditing) {
                        setEditedTask({ ...editedTask, start_date: e.target.value });
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Ngày đến hạn</label>
                  <input
                    type="date"
                    value={currentTask.due_date?.split('T')[0] || ''}
                    onChange={e => {
                      if (isEditing) {
                        setEditedTask({ ...editedTask, due_date: e.target.value });
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                  />
                </div>

                {/* Progress */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">
                    Tiến độ: {currentTask.progress || 0}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentTask.progress || 0}
                    onChange={e => {
                      const progress = parseInt(e.target.value);
                      if (isEditing) {
                        setEditedTask({ ...editedTask, progress });
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full"
                  />
                </div>

                {/* Estimated hours */}
                <div>
                  <label className="text-sm font-medium text-gray-500 block mb-1">Giờ dự kiến</label>
                  <input
                    type="number"
                    value={currentTask.estimated_hours || ''}
                    onChange={e => {
                      if (isEditing) {
                        setEditedTask({ ...editedTask, estimated_hours: parseFloat(e.target.value) });
                      }
                    }}
                    disabled={!isEditing}
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm disabled:bg-gray-50"
                    placeholder="0"
                  />
                </div>

                {/* Delete button */}
                <button
                  onClick={onDelete}
                  className="w-full mt-4 p-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa công việc
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Status Select Component
function StatusSelect({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: TaskStatus; 
  onChange: (status: TaskStatus) => void;
  disabled?: boolean;
}) {
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as TaskStatus)}
      disabled={disabled}
      className="w-full p-2 border border-gray-200 rounded-lg text-sm"
      style={{ backgroundColor: getStatusColor(value) + '20' }}
    >
      {statuses.map(status => (
        <option key={status} value={status}>
          {getStatusLabel(status)}
        </option>
      ))}
    </select>
  );
}

// Priority Select Component
function PrioritySelect({ 
  value, 
  onChange,
  disabled 
}: { 
  value: ProjectPriority; 
  onChange: (priority: ProjectPriority) => void;
  disabled?: boolean;
}) {
  const priorities: ProjectPriority[] = ['low', 'medium', 'high', 'urgent'];

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as ProjectPriority)}
      disabled={disabled}
      className="w-full p-2 border border-gray-200 rounded-lg text-sm"
      style={{ backgroundColor: getPriorityColor(value) + '20' }}
    >
      {priorities.map(priority => (
        <option key={priority} value={priority}>
          {getPriorityLabel(priority)}
        </option>
      ))}
    </select>
  );
}

// Subtasks Tab
function SubtasksTab({
  subtasks,
  newSubtask,
  onNewSubtaskChange,
  onAddSubtask,
}: {
  subtasks: Subtask[];
  newSubtask: string;
  onNewSubtaskChange: (value: string) => void;
  onAddSubtask: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Add subtask */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubtask}
          onChange={e => onNewSubtaskChange(e.target.value)}
          placeholder="Thêm công việc con..."
          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm"
          onKeyDown={e => e.key === 'Enter' && newSubtask && onAddSubtask()}
        />
        <button
          onClick={onAddSubtask}
          disabled={!newSubtask}
          className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 disabled:opacity-50"
        >
          Thêm
        </button>
      </div>

      {/* Subtask list */}
      {subtasks.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Chưa có công việc con</p>
      ) : (
        subtasks.map(subtask => (
          <div key={subtask.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={subtask.is_completed}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className={`text-sm ${subtask.is_completed ? 'line-through text-gray-400' : ''}`}>
              {subtask.title}
            </span>
          </div>
        ))
      )}
    </div>
  );
}

// Comments Tab
function CommentsTab({
  comments,
  newComment,
  onNewCommentChange,
  onAddComment,
}: {
  comments: Comment[];
  newComment: string;
  onNewCommentChange: (value: string) => void;
  onAddComment: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Add comment */}
      <div className="flex gap-2">
        <textarea
          value={newComment}
          onChange={e => onNewCommentChange(e.target.value)}
          placeholder="Viết bình luận..."
          rows={2}
          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm resize-none"
        />
        <button
          onClick={onAddComment}
          disabled={!newComment}
          className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 disabled:opacity-50 self-end"
        >
          Gửi
        </button>
      </div>

      {/* Comments list */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Chưa có bình luận</p>
      ) : (
        comments.map(comment => (
          <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gray-300" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium">{comment.user_id || comment.authorName}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at || comment.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Attachments Tab
function AttachmentsTab({ attachments }: { attachments: Attachment[] }) {
  return (
    <div className="space-y-3">
      {/* Upload area */}
      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-sky-400 transition-colors cursor-pointer">
        <svg className="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-sm text-gray-500">Kéo thả file hoặc click để tải lên</p>
      </div>

      {/* Attachments list */}
      {attachments.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Chưa có file đính kèm</p>
      ) : (
        attachments.map(attachment => (
          <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{attachment.file_name || attachment.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(attachment.file_size || attachment.size)}</p>
            </div>
            <button className="p-2 hover:bg-gray-200 rounded">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
