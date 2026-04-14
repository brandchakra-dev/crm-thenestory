import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { fetchUser, updateUser, deleteUser } from "../../api/userService";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaUserCog,
  FaUserTie,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTrash,
  FaSync,
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(id);

      setUser(data.user);
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

  const toggleUserStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.name}?`)) return;

    try {
      await updateUser(user._id, { isActive: !user.isActive });
      loadUser();
      alert(`✅ User ${user.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("❌ Failed to update user status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(id);
      alert("✅ User deleted successfully!");
      navigate("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("❌ Failed to delete user");
    }
  };

  const canEditUser = () => {
    if (!user || !currentUser) return false;
    if (currentUser.role === "superadmin") return true;
    if (currentUser.role === "admin" && user.role !== "superadmin") return true;
    if (currentUser.role === "manager" && user.role === "executive") return true;
    if (currentUser.role === "executive" && currentUser._id === user._id) return true;
    return false;
  };

  const canDeleteUser = () => {
    if (!user || !currentUser) return false;
    if (currentUser._id === user._id) return false;
    if (currentUser.role === "superadmin" && user.role !== "superadmin") return true;
    if (currentUser.role === "admin" && user.role !== "superadmin" && user.role !== "admin") return true;
    if (currentUser.role === "manager" && user.role === "executive") return true;
    return false;
  };

  const getRoleIcon = (role) => {
    const icons = {
      superadmin: <FaUserShield className="text-purple-600" />,
      admin: <FaUserCog className="text-blue-600" />,
      manager: <FaUserTie className="text-green-600" />,
      executive: <FaUser className="text-orange-600" />,
    };
    return icons[role] || <FaUser className="text-gray-600" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      superadmin: "bg-purple-100 text-purple-800 border-purple-200",
      admin: "bg-blue-100 text-blue-800 border-blue-200",
      manager: "bg-green-100 text-green-800 border-green-200",
      executive: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/users")} variant="primary">
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/users")}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition duration-200"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"}
                    </span>
                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
                      user.isActive 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}>
                      {user.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canEditUser() && (
                <Button 
                  onClick={toggleUserStatus}
                  variant={user.isActive ? "warning" : "success"}
                  className="flex items-center gap-2"
                >
                  {user.isActive ? <FaTimesCircle /> : <FaCheckCircle />}
                  {user.isActive ? "Deactivate" : "Activate"}
                </Button>
              )}
              
              <Button 
                onClick={loadUser}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FaSync />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FaUser className="text-blue-600 text-lg" />
              </div>
              User Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <FaEnvelope className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <FaPhone className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">{user.phone || "—"}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <FaCalendarAlt className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      }) : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">User ID</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{user._id}</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Role Level</p>
                  <p className="font-semibold text-purple-600">
                    {user.role === "superadmin" && "Level 4 - Super Admin"}
                    {user.role === "admin" && "Level 3 - Administrator"}
                    {user.role === "manager" && "Level 2 - Manager"}
                    {user.role === "executive" && "Level 1 - Executive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons - Direct navigate, no modal */}
        <div className="mt-6 flex justify-end gap-3">
          {canEditUser() && (
            <Button 
              onClick={() => navigate(`/users/edit/${user._id}`)} 
              variant="primary"
              className="flex items-center gap-2"
            >
              <FaEdit />
              Edit User
            </Button>
          )}
          
          {canDeleteUser() && (
            <Button 
              onClick={() => setOpenDelete(true)}
              variant="danger"
              className="flex items-center gap-2"
            >
              <FaTrash />
              Delete User
            </Button>
          )}
        </div>
      </div>

      {/* Delete Modal - Only delete modal remains */}
      <Modal isOpen={openDelete} onClose={() => setOpenDelete(false)} title="Delete User" size="md">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setOpenDelete(false)} variant="outline">Cancel</Button>
            <Button onClick={handleDelete} variant="danger">Delete User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
