import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { fetchUser, updateUser, fetchUsers } from "../../api/userService";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaUserCog,
  FaUserTie,
  FaKey,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaUserFriends
} from "react-icons/fa";
import Button from "../../components/ui/Button";

export default function UserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "executive",
    isActive: Boolean,
    password: "",
    confirmPassword: "",
    assignedManager: "", // ✅ Changed from managerId to assignedManager
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(id);
      setUser(data);
      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "executive",
        isActive: data.isActive !== undefined ? data.isActive : true,
        password: "",
        confirmPassword: "",
        assignedManager: data.assignedManager?._id || ""
      });
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  // Load managers when component mounts or role changes
  useEffect(() => {
    const loadManagers = async () => {
      try {
        setLoadingManagers(true);
        
        if (currentUser.role === "superadmin" || currentUser.role === "admin") {
          const data = await fetchUsers();
          const usersArray = data.users || data || [];
          const managerUsers = usersArray.filter(u => u.role === 'manager' && u.isActive);
          setManagers(managerUsers);
        } else if (currentUser.role === "manager") {
          // For manager, only show themselves
          setManagers([currentUser]);
          // Auto-assign themselves when editing executive
          if (formData.role === "executive" && !formData.assignedManager) {
            setFormData(prev => ({ 
              ...prev, 
              assignedManager: currentUser.id || currentUser._id 
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load managers:", error);
      } finally {
        setLoadingManagers(false);
      }
    };

    loadManagers();
  }, [currentUser, formData.role]);

  useEffect(() => {
    loadUser();
  }, [id]);

  // Get available roles based on current user's permissions
  const getAvailableRoles = () => {
    const allRoles = [
      { value: "superadmin", label: "Super Admin", icon: <FaUserShield /> },
      { value: "admin", label: "Admin", icon: <FaUserCog /> },
      { value: "manager", label: "Manager", icon: <FaUserTie /> },
      { value: "executive", label: "Executive", icon: <FaUser /> },
    ];

    if (currentUser.role === "superadmin") return allRoles;
    if (currentUser.role === "admin") return allRoles.filter(r => r.value !== "superadmin");
    if (currentUser.role === "manager") return allRoles.filter(r => r.value === "executive");
    
    return [];
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-assign manager when role is changed to executive by manager
    if (name === "role" && value === "executive" && currentUser.role === "manager") {
      setFormData(prev => ({ 
        ...prev, 
        assignedManager: currentUser.id || currentUser._id 
      }));
    }
    
    // Clear manager when role changes from executive
    if (name === "role" && value !== "executive") {
      setFormData(prev => ({ ...prev, assignedManager: "" }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, "")))
      newErrors.phone = "Enter a valid 10-digit number";

    if (formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ""),
        role: formData.role,
        isActive: formData.isActive,
      };

      // Add password only if provided
      if (formData.password) {
        payload.password = formData.password;
      }


      // ✅ Add assignedManager to payload for executive role
      if (formData.role === "executive") {
        if (formData.assignedManager) {
          payload.assignedManager = formData.assignedManager || null;
        }
        // Auto-assign manager for manager role creating executive
        if (currentUser.role === "manager") {
          payload.assignedManager = currentUser.id || currentUser._id;
        }
      }

      console.log("Sending payload:", payload); // Debug log

      await updateUser(id, payload);
      
      alert("✅ User updated successfully!");
      navigate(`/users/${id}`);
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error.response?.data?.message || "Failed to update user. Please try again.";
      alert(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "executive",
      isActive: user?.isActive !== undefined ? user.isActive : true,
      password: "",
      confirmPassword: "",
      assignedManager: user?.assignedManager || (currentUser.role === "manager" ? (currentUser.id || currentUser._id) : ""),
    });
    setErrors({});
  };

  // Show manager dropdown only for executive role and when user has permission
  const showManagerDropdown = formData.role === "executive" && 
    (currentUser.role === "superadmin" || currentUser.role === "admin");

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

  const availableRoles = getAvailableRoles();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/users/${id}`)}
                className="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-200 transition duration-200"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">✏️ Edit User</h1>
                <p className="text-gray-600 mt-2">
                  Update user information and permissions for {user.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Basic Information Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <FaUser className="text-blue-600" />
                  </div>
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                        errors.name ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="Enter full name"
                    />
                    {errors.name && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaTimesCircle />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FaEnvelope className="text-gray-400" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                        errors.email ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="user@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaTimesCircle />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FaPhone className="text-gray-400" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                        errors.phone ? 'border-red-400' : 'border-gray-300'
                      }`}
                      placeholder="10-digit mobile number"
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaTimesCircle />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FaUserShield className="text-gray-400" />
                      User Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    >
                      {availableRoles.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500">
                      Current role: <span className="font-semibold capitalize">{user.role}</span>
                    </p>
                  </div>

                  {/* Manager Selection - Only show for executive role (Superadmin/Admin) */}
                  {showManagerDropdown && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaUserFriends className="text-gray-400" />
                        Select Manager *
                      </label>
                      <select
                        name="assignedManager"
                        value={formData.assignedManager}
                        onChange={handleChange}
                        className={`w-full border rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.assignedManager ? 'border-red-400' : 'border-gray-300'
                        }`}
                        disabled={loadingManagers}
                      >
                        <option value="">Select a Manager</option>
                        {loadingManagers ? (
                          <option value="" disabled>Loading managers...</option>
                        ) : (
                          managers.map(manager => (
                            <option key={manager.id || manager._id} value={manager.id || manager._id}>
                              {manager.name} ({manager.email})
                            </option>
                          ))
                        )}
                      </select>
                      {errors.assignedManager && (
                        <p className="text-red-600 text-sm flex items-center gap-1">
                          <FaTimesCircle />
                          {errors.assignedManager}
                        </p>
                      )}
                      {managers.length === 0 && !loadingManagers && (
                        <p className="text-sm text-yellow-600">
                          No active managers found. Please create a manager first.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Auto-assigned Manager info for Manager role */}
                  {currentUser.role === "manager" && formData.role === "executive" && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                        <FaUserFriends className="text-gray-400" />
                        Assigned Manager
                      </label>
                      <div className="w-full border border-gray-300 rounded-xl px-4 py-3.5 bg-gray-50">
                        <p className="text-gray-700">{currentUser.name} (You)</p>
                      </div>
                      <p className="text-sm text-blue-600">
                        ✅ Executive will be automatically assigned to you
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <FaKey className="text-green-600" />
                  </div>
                  Change Password
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FaKey className="text-gray-400" />
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full border rounded-xl px-4 py-3.5 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.password ? 'border-red-400' : 'border-gray-300'
                        }`}
                        placeholder="Leave blank to keep current"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaTimesCircle />
                        {errors.password}
                      </p>
                    )}
                    {formData.password && (
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>Password requirements:</p>
                        <ul className="list-disc list-inside">
                          <li className={formData.password.length >= 6 ? "text-green-600" : "text-gray-400"}>
                            At least 6 characters
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FaKey className="text-gray-400" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full border rounded-xl px-4 py-3.5 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-red-600 text-sm flex items-center gap-1">
                        <FaTimesCircle />
                        {errors.confirmPassword}
                      </p>
                    )}
                    {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <p className="text-green-600 text-sm flex items-center gap-1">
                        <FaCheckCircle />
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <FaCheckCircle className="text-purple-600" />
                  </div>
                  Account Status
                </h2>

                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Active Account</p>
                    <p className="text-sm text-gray-600">
                      {formData.isActive 
                        ? "User will be able to login and access the system." 
                        : "User account will be disabled and cannot login."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-8 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200 flex items-center space-x-2"
                  >
                    <span>🔄</span>
                    <span>Reset Changes</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate(`/users/${id}`)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition duration-200 flex items-center space-x-2"
                  >
                    <span>←</span>
                    <span>Cancel</span>
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition duration-200 flex items-center space-x-2 shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating User...</span>
                      </>
                    ) : (
                      <>
                        <FaSave />
                        <span>Update User</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <div className="text-sm text-gray-600">Current Role</div>
            <div className="text-lg font-semibold text-blue-600 capitalize">{user.role}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <div className="text-sm text-gray-600">Your Permissions</div>
            <div className="text-lg font-semibold text-green-600">
              {availableRoles.length > 1 ? "Full Edit" : "Limited Edit"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}