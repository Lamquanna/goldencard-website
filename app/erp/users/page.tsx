"use client";

import React, { useState, useEffect } from 'react';
import { useAppShell } from '../components/AppShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Users, Loader2, CheckCircle, Copy, AlertCircle, MoreHorizontal, Eye, Edit, Trash2, KeyRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  username: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export default function UsersManagementPage() {
  useAppShell();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newUserCredentials, setNewUserCredentials] = useState<any>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'staff',
    department: '',
    password: '',
  });

  // Load users
  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch('/api/erp/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setSuccess('');
    setNewUserCredentials(null);

    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch('/api/erp/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess(data.message);
      setNewUserCredentials(data.credentials);
      
      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        role: 'staff',
        department: '',
        password: '',
      });

      // Reload users list
      await loadUsers();

      // Don't close dialog immediately so user can see credentials
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Không thể tạo người dùng mới');
    } finally {
      setCreating(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // View user details
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Edit user
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      full_name: user.full_name,
      email: user.email || '',
      phone: user.phone || '',
      role: user.role,
      department: user.department || '',
    });
    setEditDialogOpen(true);
  };

  const confirmEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdating(true);
    setError('');

    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`/api/erp/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      setSuccess('Đã cập nhật người dùng thành công');
      setEditDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Không thể cập nhật người dùng');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete user
  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    setError('');

    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`/api/erp/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setSuccess('Đã xóa người dùng thành công');
      setDeleteDialogOpen(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Không thể xóa người dùng');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset password (Admin)
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setResetPasswordDialogOpen(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;
    setIsResetting(true);
    setError('');

    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch(`/api/erp/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(`Đã đặt lại mật khẩu: ${data.newPassword}`);
      setResetPasswordDialogOpen(false);
    } catch (err: any) {
      setError(err.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setIsResetting(false);
    }
  };

  // Close dialog and reset state
  const closeDialog = () => {
    setDialogOpen(false);
    setSuccess('');
    setError('');
    setNewUserCredentials(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-[#D4AF37]" />
            Quản Lý Người Dùng
          </h1>
          <p className="text-gray-600 mt-2">
            Tạo và quản lý tài khoản nhân viên với mã tự động (GES001, GES002, ...)
          </p>
        </div>

        {/* Create User Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#D4AF37] hover:bg-[#B89129]">
              <UserPlus className="w-4 h-4 mr-2" />
              Tạo Người Dùng Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tạo Người Dùng Mới</DialogTitle>
              <DialogDescription>
                Hệ thống sẽ tự động tạo mã nhân viên (GES001, GES002, ...)
              </DialogDescription>
            </DialogHeader>

            {/* Success message with credentials */}
            {newUserCredentials && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-semibold text-green-800">{success}</p>
                    <div className="bg-white p-3 rounded border border-green-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          <strong>Username:</strong> {newUserCredentials.username}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(newUserCredentials.username)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          <strong>Password:</strong> {newUserCredentials.password}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(newUserCredentials.password)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        {newUserCredentials.note}
                      </p>
                    </div>
                    <Button
                      onClick={closeDialog}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Đóng
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Error message */}
            {error && !newUserCredentials && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form - only show if no success yet */}
            {!newUserCredentials && (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Họ và Tên *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Chức vụ *</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Nhân viên</SelectItem>
                        <SelectItem value="manager">Quản lý</SelectItem>
                        <SelectItem value="director">Giám đốc</SelectItem>
                        <SelectItem value="accountant">Kế toán</SelectItem>
                        <SelectItem value="sales">Kinh doanh</SelectItem>
                        <SelectItem value="technical">Kỹ thuật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Phòng ban</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Kinh doanh"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@goldenenergy.vn"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0901234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mật khẩu (tùy chọn)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Để trống để tạo mật khẩu tự động"
                  />
                  <p className="text-xs text-gray-500">
                    Nếu để trống, mật khẩu sẽ là: MÃ_NHÂN_VIÊN@2025
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-[#D4AF37] hover:bg-[#B89129]"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Tạo Người Dùng
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeDialog}
                    disabled={creating}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Chưa có người dùng nào</p>
            <p className="text-sm text-gray-500 mt-2">
              Nhấn "Tạo Người Dùng Mới" để bắt đầu
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã NV</TableHead>
                <TableHead>Họ Tên</TableHead>
                <TableHead>Chức Vụ</TableHead>
                <TableHead>Phòng Ban</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Điện Thoại</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono font-semibold">
                    {user.employee_code}
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{user.email || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">{user.phone || '-'}</TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleView(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* View User Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã nhân viên</Label>
                  <p className="font-medium font-mono">{selectedUser.employee_code}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="font-medium">{selectedUser.username}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Họ tên</Label>
                <p className="font-medium">{selectedUser.full_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Điện thoại</Label>
                  <p className="font-medium">{selectedUser.phone || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Chức vụ</Label>
                  <p className="font-medium">{selectedUser.role}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phòng ban</Label>
                  <p className="font-medium">{selectedUser.department || '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Trạng thái</Label>
                <p className="font-medium">{selectedUser.is_active ? '✅ Hoạt động' : '❌ Không hoạt động'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={confirmEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">Họ và Tên *</Label>
              <Input
                id="edit_full_name"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_role">Chức vụ *</Label>
                <Select
                  value={editFormData.role}
                  onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Nhân viên</SelectItem>
                    <SelectItem value="manager">Quản lý</SelectItem>
                    <SelectItem value="director">Giám đốc</SelectItem>
                    <SelectItem value="accountant">Kế toán</SelectItem>
                    <SelectItem value="sales">Kinh doanh</SelectItem>
                    <SelectItem value="technical">Kỹ thuật</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_department">Phòng ban</Label>
                <Input
                  id="edit_department"
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_phone">Số điện thoại</Label>
              <Input
                id="edit_phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isUpdating}>
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Xác nhận xóa</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p>Bạn có chắc chắn muốn xóa người dùng <strong>{selectedUser.full_name}</strong>?</p>
              <p className="text-sm text-muted-foreground">Hành động này không thể hoàn tác.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                  Hủy
                </Button>
                <Button onClick={confirmDelete} variant="destructive" disabled={isDeleting}>
                  {isDeleting ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <p>Đặt lại mật khẩu cho người dùng <strong>{selectedUser.full_name}</strong></p>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Mật khẩu mới (tùy chọn)</Label>
                <Input
                  id="newPassword"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Để trống để tạo mật khẩu mặc định"
                />
                <p className="text-xs text-muted-foreground">
                  Nếu để trống, mật khẩu sẽ là: {selectedUser.employee_code}@2025
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)} disabled={isResetting}>
                  Hủy
                </Button>
                <Button onClick={confirmResetPassword} disabled={isResetting}>
                  {isResetting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/*             <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleView(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                          <KeyRound className="h-4 w-4 mr-2" />
                          Đặt lại mật khẩu
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(user)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Xóa người dùng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Hướng dẫn</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Mã nhân viên tự động: GES001, GES002, GES003, ...</li>
          <li>• Username = mã nhân viên viết thường (ví dụ: ges001)</li>
          <li>• Mật khẩu mặc định: MÃ_NHÂN_VIÊN@2025 (ví dụ: GES001@2025)</li>
          <li>• Nhân viên có thể đổi mật khẩu sau khi đăng nhập lần đầu</li>
          <li>• Tài khoản được dùng để chat, gửi file, và quản lý công việc</li>
        </ul>
      </div>
    </div>
  );
}
