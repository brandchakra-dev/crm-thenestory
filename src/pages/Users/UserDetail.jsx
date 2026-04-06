import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import { fetchUser, updateUser, deleteUser, fetchUsers } from "../../api/userService";
import { fetchLeads } from "../../api/leadService";
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
  FaKey,
  FaBuilding,
  FaMapMarkerAlt,
  FaBan,
  FaUserCheck,
  FaChartLine,
  FaRupeeSign,
  FaHome,
  FaEye,
  FaCalendarPlus,
  FaComments,
  FaChartBar,
  FaUsers,
  FaUserFriends,
  FaUserPlus, // ✅ New icon for manager
} from "react-icons/fa";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [manager, setManager] = useState(null); // ✅ State for executive's manager
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [executivesLoading, setExecutivesLoading] = useState(false);
  const [managerLoading, setManagerLoading] = useState(false); // ✅ Loading state for manager
  const [activeTab, setActiveTab] = useState("overview");
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await fetchUser(id);
      setUser(data);
    } catch (error) {
      console.error("Error loading user:", error);
      alert("Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const loadUserLeads = async () => {
    try {
      setLeadsLoading(true);
      const allLeads = await fetchLeads();
      
      // Filter leads assigned to this user (either as executive or manager)
      const userLeads = allLeads.filter(lead => 
        lead.assignedExecutive?._id === id || 
        lead.assignedManager?._id === id
      );
      
      setLeads(userLeads);
    } catch (error) {
      console.error("Error loading user leads:", error);
      alert("Failed to load user leads");
    } finally {
      setLeadsLoading(false);
    }
  };

  // ✅ Load manager's executives
  const loadManagerExecutives = async () => {
    if (user?.role !== 'manager') return;
    
    try {
      setExecutivesLoading(true);
      const allUsers = await fetchUsers();
      const usersArray = allUsers.users || allUsers || [];
      
       // ✅ FIX: Check assignedManager._id instead of assignedManager
       const managerExecutives = usersArray.filter(u => 
        u.role === 'executive' && 
        u.assignedManager?._id === id // Check assignedManager's _id
      );
      
      console.log('managerExecutives', managerExecutives);
      
      setExecutives(managerExecutives);
    } catch (error) {
      console.error("Error loading manager executives:", error);
    } finally {
      setExecutivesLoading(false);
    }
  };

  // ✅ Load executive's manager
  const loadExecutiveManager = async () => {
    if (user?.role !== 'executive' || !user.assignedManager) return;
    
    try {
      setManagerLoading(true);
      const allUsers = await fetchUsers();
      const usersArray = allUsers.users || allUsers || [];
      
      // Find manager by assignedManager ID
      const executiveManager = usersArray.find(u => 
        (u._id === user.assignedManager._id || u.id === user.assignedManager._id) && 
        u.role === 'manager'
      );
      
      setManager(executiveManager);
    } catch (error) {
      console.error("Error loading executive manager:", error);
    } finally {
      setManagerLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadUserLeads();

  }, [id]);

  // ✅ Load executives when user data is loaded and user is a manager
  useEffect(() => {
    if (user && user.role === 'manager') {
      loadManagerExecutives();
    }
  }, [user]);

  // ✅ Load manager when user data is loaded and user is an executive
  useEffect(() => {
    if (user && user.role === 'executive') {
      loadExecutiveManager();
    }
  }, [user]);

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

  // Check if current user can edit this user
  const canEditUser = () => {
    if (!user || !currentUser) return false;

    if (currentUser.role === "superadmin") return true;
    if (currentUser.role === "admin" && user.role !== "superadmin") return true;
    if (currentUser.role === "manager" && user.role === "executive") return true;
    if (currentUser.role === "executive" && currentUser._id === user._id) return true;
    
    return false;
  };

  // Check if current user can delete this user
  const canDeleteUser = () => {
    if (!user || !currentUser) return false;

    // Prevent self-deletion
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

  const getStatusColor = (status) => {
    const statusColors = {
      new: "bg-blue-100 text-blue-800",
      hot: "bg-red-100 text-red-800",
      warm: "bg-orange-100 text-orange-800",
      cold: "bg-cyan-100 text-cyan-800",
      visited: "bg-purple-100 text-purple-800",
      active: "bg-green-100 text-green-800",
      booked: "bg-emerald-100 text-emerald-800",
      closed: "bg-gray-300 text-gray-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  // Calculate lead statistics
  const leadStats = {
    total: leads.length,
    active: leads.filter(lead => lead.status === 'active').length,
    visited: leads.filter(lead => lead.status === 'visited').length,
    booked: leads.filter(lead => lead.status === 'booked').length,
    closed: leads.filter(lead => lead.status === 'closed').length,
  };

  // Get recent follow-ups from all leads
  const recentFollowUps = leads
  .flatMap(lead =>
    (lead.followUps || []).map(followUp => ({
      ...followUp,
      leadName: lead.name,
      leadId: lead._id,
      leadPhone: lead.phone,
      by: followUp.createdBy?.name || "System"
    }))
  )
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 10);

  // Get recent notes from all leads
  const recentNotes = leads
    .flatMap(lead => 
      (lead.notes || []).map(note => ({
        ...note,
        leadName: lead.name,
        leadId: lead._id,
        leadPhone: lead.phone
      }))
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  // ✅ Determine which tabs to show based on user role

  const getAvailableTabs = () => {
    const baseTabs = ["overview", "leads", "followups"];
  
    // Only Admin & SuperAdmin can see extra tabs
    if (currentUser?.role === "superadmin" || currentUser?.role === "admin") {
  
      // If viewing MANAGER profile → show EXECUTIVES tab
      if (user?.role === "manager") {
        return [...baseTabs, "executives"];
      }
  
      // If viewing EXECUTIVE profile → show MANAGER tab
      if (user?.role === "executive") {
        return [...baseTabs, "manager"];
      }
    }
  
    // All other cases
    return baseTabs;
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

  const availableTabs = getAvailableTabs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
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
              <Button 
                onClick={toggleUserStatus}
                variant={user.isActive ? "warning" : "success"}
                className="flex items-center gap-2"
              >
                {user.isActive ? <FaBan /> : <FaUserCheck />}
                {user.isActive ? "Deactivate" : "Activate"}
              </Button>
              
              <Button 
                onClick={() => { 
                  loadUser(); 
                  loadUserLeads(); 
                  if (user.role === 'manager') loadManagerExecutives();
                  if (user.role === 'executive') loadExecutiveManager();
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FaSync />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex space-x-1 overflow-x-auto">
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-4 text-sm font-medium rounded-xl transition duration-200 whitespace-nowrap min-w-0 ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column - User Information */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <>
                {/* Contact Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <FaUser className="text-blue-600 text-lg" />
                    </div>
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaEnvelope className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-semibold text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaPhone className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone Number</p>
                          <p className="font-semibold text-gray-900">{user.phone || "—"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FaUserShield className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">User Role</p>
                          <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <FaCalendarAlt className="text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-semibold text-gray-900">
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
                </div>

                {/* Lead Statistics Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <FaChartBar className="text-green-600 text-lg" />
                    </div>
                    Lead Statistics
                  </h2>
                  
                  {leadsLoading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading lead statistics...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-2xl font-bold text-blue-600">{leadStats.total}</p>
                        <p className="text-sm text-gray-600">Total Leads</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-2xl font-bold text-green-600">{leadStats.active}</p>
                        <p className="text-sm text-gray-600">Active</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-2xl font-bold text-red-600">{leadStats.hot}</p>
                        <p className="text-sm text-gray-600">Hot Leads</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-2xl font-bold text-orange-600">{leadStats.booked}</p>
                        <p className="text-sm text-gray-600">Booked</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "executives" && (currentUser.role === "superadmin" || currentUser.role === "admin") && user.role === "manager" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <FaUsers className="text-indigo-600 text-lg" />
                  </div>
                  Team Executives ({executives.length})
                </h2>
                
                {executivesLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading executives...</p>
                  </div>
                ) : executives.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Executives Assigned</h3>
                    <p className="text-gray-600 mb-6">No executives are currently assigned to this manager.</p>
                    <Button
                      onClick={() => navigate("/users/create")}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <FaUser />
                      Add Executive
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {executives.map(executive => (
                      <div key={executive._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white transition duration-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold">
                              {executive.name?.charAt(0)?.toUpperCase() || "E"}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{executive.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <FaEnvelope />
                                  {executive.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <FaPhone />
                                  {executive.phone || "No phone"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => navigate(`/users/${executive._id}`)}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <FaEye />
                              View
                            </Button>
                            <Button
                              onClick={() => navigate(`/users/edit/${executive._id}`)}
                              variant="primary"
                              className="flex items-center gap-2"
                            >
                              <FaEdit />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        {/* Executive Status */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            executive.isActive 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {executive.isActive ? "🟢 Active" : "🔴 Inactive"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created: {executive.createdAt ? new Date(executive.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "manager" && (currentUser.role === "superadmin" || currentUser.role === "admin") && user.role === "executive" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <FaUserPlus className="text-green-600 text-lg" />
                  </div>
                  Assigned Manager
                </h2>
                
                {managerLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading manager details...</p>
                  </div>
                ) : !manager ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">👨‍💼</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Manager Assigned</h3>
                    <p className="text-gray-600">This executive doesn't have a manager assigned yet.</p>
                    {currentUser.role === 'superadmin' && (
                      <Button
                        onClick={() => navigate(`/users/edit/${user._id}`)}
                        variant="primary"
                        className="flex items-center gap-2 mt-4"
                      >
                        <FaEdit />
                        Assign Manager
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                          {manager.name?.charAt(0)?.toUpperCase() || "M"}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-900">{manager.name}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(manager.role)}`}>
                              {getRoleIcon(manager.role)}
                              {manager.role?.charAt(0).toUpperCase() + manager.role?.slice(1)}
                            </span>
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                              manager.isActive 
                                ? "bg-green-100 text-green-800 border-green-200" 
                                : "bg-red-100 text-red-800 border-red-200"
                            }`}>
                              {manager.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                              {manager.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => navigate(`/users/${manager._id || manager.id}`)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <FaEye />
                          View Profile
                        </Button>
                        {currentUser.role === 'superadmin' && (
                          <Button
                            onClick={() => navigate(`/users/edit/${user._id}`)}
                            variant="primary"
                            className="flex items-center gap-2"
                          >
                            <FaEdit />
                            Change Manager
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Manager Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FaEnvelope className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold text-gray-900">{manager.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <FaPhone className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-semibold text-gray-900">{manager.phone || "—"}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Manager Statistics */}
                    <div className="mt-6 p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-3">Manager Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Member Since</p>
                          <p className="font-semibold">
                            {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString('en-IN') : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">User ID</p>
                          <p className="font-mono text-xs break-all">{manager._id || manager.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Leads Tab */}
            {activeTab === "leads" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <FaChartLine className="text-orange-600 text-lg" />
                  </div>
                  Assigned Leads ({leads.length})
                </h2>
                
                {leadsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading leads...</p>
                  </div>
                ) : leads.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leads Assigned</h3>
                    <p className="text-gray-600">This user doesn't have any leads assigned yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads.map(lead => (
                      <div key={lead._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white transition duration-200">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                                {lead.status?.toUpperCase()}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <FaPhone className="text-gray-400" />
                                <span>{lead.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaHome className="text-gray-400" />
                                <span>{lead.projectName || "No Project"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FaRupeeSign className="text-gray-400" />
                                <span>{lead.budget ? `₹${lead.budget.toLocaleString()}` : "No Budget"}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => navigate(`/leads/${lead._id}`)}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <FaEye />
                              View
                            </Button>
                          </div>
                        </div>
                        
                        {/* Last Follow-up */}
                        {lead.followUps && lead.followUps.length > 0 && (
                          <div className="mt-3 p-2 bg-white rounded border text-xs">
                            <p className="font-medium text-gray-700">Last Follow-up:</p>
                            <p className="text-gray-600">{lead.followUps[lead.followUps.length - 1].remark}</p>
                            <p className="text-gray-500">
                              {new Date(lead.followUps[lead.followUps.length - 1].date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Follow-ups Tab */}
            {activeTab === "followups" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <FaCalendarPlus className="text-purple-600 text-lg" />
                  </div>
                  Recent Follow-ups
                </h2>
                
                {leadsLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading follow-ups...</p>
                  </div>
                ) : recentFollowUps.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Follow-ups</h3>
                    <p className="text-gray-600">No follow-ups found for this user's leads.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentFollowUps.map((followUp, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-white transition duration-200">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{followUp.leadName}</h3>
                              <span className="text-sm text-gray-500">{followUp.leadPhone}</span>
                            </div>
                            <p className="text-gray-700 mb-2">{followUp.note}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FaCalendarAlt />
                                {new Date(followUp.followUpAt).toLocaleDateString()}
                              </span>
                              <span>By: {followUp.createdBy?.name || "System"}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => navigate(`/leads/${followUp.leadId}`)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <FaEye />
                            View Lead
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            
            {/* Lead Statistics Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <FaChartBar className="text-green-600 text-lg" />
                </div>
                Lead Summary
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{leadStats.total}</p>
                    <p className="text-xs text-gray-600">Total</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{leadStats.active}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-lg font-bold text-red-600">{leadStats.hot}</p>
                    <p className="text-xs text-gray-600">Hot</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-lg font-bold text-orange-600">{leadStats.warm}</p>
                    <p className="text-xs text-gray-600">Warm</p>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600 text-center">
                    {leadStats.booked > 0 ? `${leadStats.booked} booked leads` : 'No booked leads yet'}
                  </p>
                </div>
              </div>
            </div>

            {/* User Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <FaUser className="text-indigo-600 text-lg" />
                </div>
                User Summary
              </h2>
              
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">User ID</p>
                  <p className="font-mono text-xs text-gray-900 break-all">{user._id}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <p className={`font-semibold ${
                    user.isActive ? "text-green-600" : "text-red-600"
                  }`}>
                    {user.isActive ? "🟢 Active" : "🔴 Inactive"}
                  </p>
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

            {/* ✅ Manager's Team Summary - Only show for Manager role */}
            {user.role === 'manager' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <FaUserFriends className="text-indigo-600 text-lg" />
                  </div>
                  Team Summary
                </h2>
                
                <div className="space-y-4">
                  <div className="text-center p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="text-2xl font-bold text-indigo-600">{executives.length}</p>
                    <p className="text-sm text-gray-600">Team Executives</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 text-center">
                      {executives.length > 0 
                        ? `${executives.filter(e => e.isActive).length} active executives` 
                        : 'No executives assigned'
                      }
                    </p>
                  </div>
                  
                  {executives.length > 0 && (
                    <Button
                      onClick={() => setActiveTab("executives")}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <FaUsers />
                      View All Executives
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ✅ Executive's Manager Summary - Only show for Executive role */}
            {user.role === 'executive' && manager && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <FaUserPlus className="text-green-600 text-lg" />
                  </div>
                  Manager Info
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">
                      {manager.name?.charAt(0)?.toUpperCase() || "M"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{manager.name}</p>
                      <p className="text-sm text-gray-600">{manager.email}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-600 text-center">
                      {manager.isActive ? "🟢 Active Manager" : "🔴 Inactive Manager"}
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setActiveTab("manager")}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <FaEye />
                    View Manager Details
                  </Button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Edit User"
        size="lg"
      >
        <UserEditForm
          user={user}
          onSuccess={() => {
            setOpenEdit(false);
            loadUser();
          }}
          onCancel={() => setOpenEdit(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        title="Delete User"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete User</h3>
            <p className="text-gray-600">
              Are you sure you want to delete <strong>{user.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={() => setOpenDelete(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleDelete} variant="danger">
              Delete User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Simple Edit Form for Modal
function UserEditForm({ user, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "executive",
    isActive: user?.isActive !== undefined ? user.isActive : true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateUser(user._id, formData);
      alert("✅ User updated successfully!");
      onSuccess();
    } catch (error) {
      console.error("Error updating user:", error);
      alert("❌ Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10-digit number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="executive">Executive</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-gray-700">Active User</label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} variant="primary">
          {isSubmitting ? "Updating..." : "Update User"}
        </Button>
      </div>
    </form>
  );
}