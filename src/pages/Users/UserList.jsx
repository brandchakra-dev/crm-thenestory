import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import AuthContext from "../../context/AuthContext";
import {
  FaEye,
  FaTrash,
  FaEdit,
  FaPlus,
  FaSearch,
  FaFilter,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaUserCog,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
} from "react-icons/fa";
import { fetchUsers, deleteUser } from "../../api/userService";
import Button from "../../components/ui/Button";

export default function UserList() {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();  
      const usersArray = data.users || data || [];
      setUsers(usersArray);
      console.log('user', usersArray)
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on current user's permissions
  const getFilteredUsers = () => {
    let filtered = users;

    // Superadmin can see all users
    if (currentUser.role === "superadmin") {
      filtered = users;
    }
    // Admin can see all except superadmin
    else if (currentUser.role === "admin") {
      filtered = users.filter(u => u.role !== "superadmin");
    }
    // Manager can only see executives
    else if (currentUser.role === "manager") {
      filtered = users.filter(u => u.role === "executive");
    }
    // Executive can't see any users in management
    else {
      filtered = [];
    }

    // Apply search filters
    return filtered.filter(user => {
      const matchesText =
        user.name?.toLowerCase().includes(filterText.toLowerCase()) ||
        user.email?.toLowerCase().includes(filterText.toLowerCase()) ||
        user.phone?.includes(filterText);

      const matchesRole = roleFilter ? user.role === roleFilter : true;
      const matchesStatus = statusFilter ? 
        (statusFilter === "active" ? user.isActive : !user.isActive) : true;

      return matchesText && matchesRole && matchesStatus;
    });
  };

  const deleteHandler = async (id) => {
    const userToDelete = users.find(u => u._id === id);
    
    if (userToDelete.role === "superadmin") {
      return alert("Cannot delete superadmin user");
    }

    if (currentUser.role === "admin" && userToDelete.role === "admin") {
      return alert("Admin cannot delete other admin users");
    }

    if (currentUser.role === "manager" && userToDelete.role !== "executive") {
      return alert("Manager can only delete executive users");
    }

    if (window.confirm(`Are you sure you want to delete ${userToDelete.name}?`)) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const deleteSelected = async () => {
    if (selectedUsers.length === 0) return alert("No users selected.");
    
    const usersToDelete = users.filter(u => selectedUsers.includes(u._id));
    
    for (const user of usersToDelete) {
      if (user.role === "superadmin") {
        return alert("Cannot delete superadmin user");
      }
      if (currentUser.role === "admin" && user.role === "admin") {
        return alert("Admin cannot delete other admin users");
      }
      if (currentUser.role === "manager" && user.role !== "executive") {
        return alert("Manager can only delete executive users");
      }
    }

    if (!window.confirm(`Delete ${selectedUsers.length} selected users?`)) return;
    
    try {
      for (const id of selectedUsers) {
        await deleteUser(id);
      }
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error("Error deleting selected users:", error);
      alert("Failed to delete selected users");
    }
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

  const columns = [
    {
      name: "",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(row._id)}
          onChange={(e) => {
            if (e.target.checked) setSelectedUsers([...selectedUsers, row._id]);
            else setSelectedUsers(selectedUsers.filter(id => id !== row._id));
          }}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      width: "50px",
    },
    {
      name: "User",
      selector: (r) => r.name,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3 min-w-[150px] py-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {row.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">{row.name}</p>
            <p className="text-sm text-gray-500 truncate">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      name: "Phone",
      selector: (r) => r.phone,
      cell: (row) => (
        <div className="text-gray-900 font-medium px-4">{row.phone || "—"}</div>
      ),
    },
    {
      name: "Role",
      selector: (r) => r.role,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {getRoleIcon(row.role)}
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border ${getRoleColor(row.role)}`}>
            {row.role}
          </span>
        </div>
      ),
    },
    {
      name: "Status",
      selector: (r) => r.isActive,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.isActive ? (
            <FaCheckCircle className="text-green-500" />
          ) : (
            <FaTimesCircle className="text-red-500" />
          )}
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            row.isActive 
              ? "bg-green-100 text-green-800 border-green-200" 
              : "bg-red-100 text-red-800 border-red-200"
          }`}>
            {row.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      ),
    },
    {
      name: "Created",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => {
        const canEdit =
          currentUser.role === "superadmin" ||
          (currentUser.role === "admin" && row.role !== "superadmin") ||
          (currentUser.role === "manager" && row.role === "executive");

        const canDelete =
          currentUser._id !== row._id &&
          (
            currentUser.role === "superadmin" ||
            (currentUser.role === "admin" && row.role !== "superadmin" && row.role !== "admin") ||
            (currentUser.role === "manager" && row.role === "executive")
          );

        return (
          <div className="flex gap-1">       
            <button
              onClick={() => navigate(`/users/${row._id}`)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition duration-200"
              title="View Details"
            >
              <FaEye size={14} />
            </button>
            <button
              onClick={() => { navigate(`/users/edit/${row._id}`) }}
              disabled={!canEdit}
              className={`p-2 rounded-lg transition duration-200 ${
                canEdit 
                  ? "text-green-600 hover:bg-green-50" 
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={canEdit ? "Edit User" : "No permission to edit"}
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => deleteHandler(row._id)}
              disabled={!canDelete}
              className={`p-2 rounded-lg transition duration-200 ${
                canDelete 
                  ? "text-red-600 hover:bg-red-50" 
                  : "text-gray-400 cursor-not-allowed"
              }`}
              title={canDelete ? "Delete User" : "No permission to delete"}
            >
              <FaTrash size={14} />
            </button>
          </div>
        );
      },
    },
  ];

  const canCreateUser = 
    currentUser.role === "superadmin" || 
    currentUser.role === "admin" || 
    currentUser.role === "manager";

  const getAvailableRoles = () => {
    const allRoles = [
      { value: "superadmin", label: "Super Admin" },
      { value: "admin", label: "Admin" },
      { value: "manager", label: "Manager" },
      { value: "executive", label: "Executive" },
    ];

    if (currentUser.role === "superadmin") return allRoles;
    if (currentUser.role === "admin") return allRoles.filter(r => r.value !== "superadmin");
    if (currentUser.role === "manager") return allRoles.filter(r => r.value === "executive");
    
    return [];
  };

  const filteredUsers = getFilteredUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">👥 User Management</h1>
              <p className="text-gray-600">
                Manage user accounts and permissions based on role hierarchy
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {selectedUsers.length > 0 && (
                <Button
                  onClick={deleteSelected}
                  variant="danger"
                  className="flex items-center gap-2"
                >
                  <FaTrash />
                  Delete Selected ({selectedUsers.length})
                </Button>
              )}
              {canCreateUser && (
                <Button
                  onClick={() => { navigate("/users/create") }}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <FaPlus />
                  Add New User
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                  <FaUser className="text-blue-600 text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Users</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>     
   
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-emerald-100 rounded-lg">
                  <FaCheckCircle className="text-emerald-600 text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Active</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">
                    {users.filter(u => u.isActive).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-2 bg-gray-100 rounded-lg">
                  <FaTimesCircle className="text-gray-600 text-sm sm:text-base" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Inactive</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-600">
                    {users.filter(u => !u.isActive).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone..."
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FaFilter />
                    Filters
                    {showFilters ? "▲" : "▼"}
                  </Button>
                  
                  <Button
                    onClick={loadUsers}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <FaSync />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="">All Roles</option>
                      {getAvailableRoles().map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DataTable */}
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredUsers.length}</span> of{" "}
                    <span className="font-semibold">{users.length}</span> users
                    {currentUser.role !== "superadmin" && " (filtered by your permissions)"}
                  </p>
                  {selectedUsers.length > 0 && (
                    <p className="text-sm text-blue-600 font-medium">
                      {selectedUsers.length} users selected
                    </p>
                  )}
                </div>

                <DataTable
                  columns={columns}
                  data={filteredUsers}
                  pagination
                  paginationPerPage={10}
                  paginationRowsPerPageOptions={[10, 25, 50]}
                  highlightOnHover
                  responsive
                  noDataComponent={
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-600 mb-6">
                        {filterText || roleFilter || statusFilter
                          ? "Try adjusting your filters to see more results."
                          : "No users available based on your permissions."}
                      </p>
                      {canCreateUser && (
                        <Button
                          onClick={() => { navigate("/users/create") }}
                          variant="primary"
                          className="flex items-center gap-2 mx-auto"
                        >
                          <FaPlus />
                          Add New User
                        </Button>
                      )}
                    </div>
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}