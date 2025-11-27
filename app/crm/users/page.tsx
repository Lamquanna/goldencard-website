"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface User {
  username: string;
  password: string;
  role: "admin" | "manager" | "sale" | "staff";
  email?: string;
  created_at: string;
}

// Role permissions info
const roleInfo = {
  admin: {
    label: '👑 Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  manager: {
    label: '🏢 Quản lý',
    description: 'CRM + Quản lý user (trừ admin)',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  sale: {
    label: '💼 Nhân viên bán hàng',
    description: 'Chỉ xem CRM, pipeline bán hàng',
    color: 'bg-green-100 text-green-700 border-green-300',
  },
  staff: {
    label: '👤 Nhân viên',
    description: 'Chỉ chat nội bộ, không xem CRM',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
  },
};

export default function UsersManagement() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "sale" | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");

  // Create user form
  const [newUsername, setNewUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "manager" | "sale" | "staff">("staff");
  const [newUserEmail, setNewUserEmail] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("crm_auth");

    if (!token) {
      router.push("/crm/login");
      return;
    }

    try {
      const response = await fetch("/api/crm/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const role = data.user.role;
        if (role !== "admin" && role !== "manager") {
          alert("Chỉ Admin hoặc Quản lý mới có quyền truy cập trang này");
          router.push("/crm");
          return;
        }
        setIsAuthenticated(true);
        setUserRole(data.user.role);
        fetchUsers();
      } else {
        localStorage.removeItem("crm_auth");
        router.push("/crm/login");
      }
    } catch (error) {
      localStorage.removeItem("crm_auth");
      router.push("/crm/login");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/crm/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername || !newUserPassword) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const response = await fetch("/api/crm/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newUserPassword,
          role: newUserRole,
          email: newUserEmail,
        }),
      });

      if (response.ok) {
        alert("Tạo user thành công!");
        setShowCreateModal(false);
        setNewUsername("");
        setNewUserPassword("");
        setNewUserRole("staff");
        setNewUserEmail("");
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo user");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword) {
      alert("Vui lòng nhập mật khẩu mới");
      return;
    }

    try {
      const response = await fetch("/api/crm/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: selectedUser,
          newPassword: newPassword,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setShowPasswordModal(false);
        setSelectedUser("");
        setNewPassword("");
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi đổi mật khẩu");
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (username === "admin") {
      alert("Không thể xóa tài khoản Admin chính");
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa user "${username}"?`)) return;

    try {
      const response = await fetch(`/api/crm/users/${username}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Xóa user thành công!");
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa user");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              <span className="text-gradient-gold">Quản lý</span>
              <span className="text-gradient-teal"> Người dùng</span>
            </h1>
            <p className="text-gray-600">Quản lý tài khoản người dùng CRM</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/crm")}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              ← Quay lại CRM
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              ➕ Tạo người dùng mới
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Đang tải...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Tên đăng nhập
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Mật khẩu
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Vai trò
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                      Ngày tạo
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <motion.tr
                      key={user.username}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {user.username}
                          </span>
                          {user.username === "admin" && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">
                              CHÍNH
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <code className="px-3 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm">
                          {user.password}
                        </code>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            roleInfo[user.role]?.color || 'bg-gray-100 text-gray-700'
                          }`}
                          title={roleInfo[user.role]?.description}
                        >
                          {roleInfo[user.role]?.label || user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {user.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user.username);
                              setShowPasswordModal(true);
                            }}
                            className="text-blue-500 hover:text-blue-700 font-medium text-sm"
                            title="Đổi mật khẩu"
                          >
                            🔑
                          </button>
                          {user.username !== "admin" && (
                            <button
                              onClick={() => handleDeleteUser(user.username)}
                              className="text-red-500 hover:text-red-700 font-medium text-sm"
                              title="Xóa"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tạo người dùng mới
            </h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tên đăng nhập"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="text"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mật khẩu"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) =>
                    setNewUserRole(e.target.value as "admin" | "manager" | "sale" | "staff")
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="staff">👤 Nhân viên (chỉ chat)</option>
                  <option value="sale">💼 Nhân viên bán hàng (CRM)</option>
                  <option value="manager">🏢 Quản lý (CRM + user)</option>
                  <option value="admin">👑 Quản trị viên (toàn quyền)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {roleInfo[newUserRole]?.description}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (không bắt buộc)
                </label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Tạo người dùng
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đổi Mật Khẩu
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={selectedUser}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>

              {selectedUser === "admin" && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Email thông báo sẽ được gửi tới{" "}
                    <strong>sales@goldenenergy.vn</strong>
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser("");
                    setNewPassword("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Đổi Mật Khẩu
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
