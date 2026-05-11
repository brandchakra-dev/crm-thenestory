// src/pages/Nestory/Projects/NestoryProjectsList.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi } from "../../services/nestoryApi";
import { CLS, statusBadge } from "../../utils/nestoryTheme";
import { DeleteModal, useToast } from "../../components/nestory/index";
import {
  MdAdd, MdEdit, MdDelete, MdRefresh,
  MdSearch, MdVisibility, MdImage, MdApartment,
  MdCheckCircle, MdCancel, MdFilterList, MdStar, MdStarBorder,
  MdChevronLeft, MdChevronRight,
} from "react-icons/md";

import { getImageUrl } from "../../utils/url";

export default function ProjectList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [delId, setDelId] = useState(null);
  const [delTitle, setDelTitle] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("active"); // ✅ Default "active"
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Load projects with filters & pagination
  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (activeFilter === "active") params.isActive = true;
      if (activeFilter === "inactive") params.isActive = false;
      
      const response = await projectsApi.list(params);
      
      let projectsData = [];
      if (response.data?.projects) projectsData = response.data.projects;
      else if (response.data?.data) projectsData = response.data.data;
      else if (Array.isArray(response.data)) projectsData = response.data;
      
      setRows(projectsData);
      setTotalItems(response.data?.total || projectsData.length);
      setTotalPages(response.data?.pages || Math.ceil((response.data?.total || projectsData.length) / itemsPerPage));
      
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, activeFilter, currentPage, itemsPerPage]);

  // Initial load & filter changes
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, activeFilter]);

  const toggleFeatured = async (id) => {
    try { 
      await projectsApi.toggleFeatured(id); 
      loadProjects(); 
    } catch { 
      toast("Update failed", "error"); 
    }
  };

  const handleDelete = async () => {
    try {
      await projectsApi.remove(delId);
      toast("Project deleted successfully", "success");
      setDelId(null);
      setDelTitle("");
      loadProjects();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setActiveFilter("active");
    setShowFilters(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== "" || statusFilter !== "all" || activeFilter !== "active";

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D] flex items-center justify-center shadow-lg">
            <MdApartment size={20} className="text-[#E8D5B0]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#1C0F05]">Projects</h1>
            <p className="text-sm text-[#A8978A] mt-0.5">Manage all real estate projects</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F4] border border-[#EDE5DD]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1C0F05]">{totalItems}</span>
            <span className="text-[10px] text-[#A8978A]">Total Projects</span>
          </div>
          
          <button 
            onClick={() => loadProjects()} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200"
            title="Refresh">
            <MdRefresh size={17} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => navigate("/projects/add")} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdAdd size={16} /> Add Project
          </button>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#EDE5DD] shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MdSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8978A]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, builder, location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm text-[#1C0F05] placeholder:text-[#A8978A] focus:outline-none focus:border-[#6B3A1F] focus:ring-2 focus:ring-[#6B3A1F]/15 transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 ${
              showFilters || hasActiveFilters
                ? "bg-[#6B3A1F] text-white border-[#6B3A1F]"
                : "bg-white text-[#6B3A1F] border-[#EDE5DD] hover:border-[#6B3A1F]"
            }`}>
            <MdFilterList size={16} />
            <span className="text-sm font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">
                {(statusFilter !== "all" ? 1 : 0) + (activeFilter !== "active" ? 1 : 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all duration-200">
              <MdCancel size={14} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#EDE5DD]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                  Project Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: "all", label: "All", icon: null },
                    { value: "New Launch", label: "New Launch", icon: null },
                    { value: "Ready To Move", label: "Ready To Move", icon: <MdCheckCircle size={12} /> },
                    { value: "Under Construction", label: "Under Construction", icon: null },
                    { value: "Upcoming", label: "Upcoming", icon: null },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setStatusFilter(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        statusFilter === opt.value
                          ? "bg-[#6B3A1F] text-white shadow-md"
                          : "bg-[#FAF7F4] text-[#7A6858] hover:bg-[#EDE5DD]"
                      }`}>
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ✅ Active/Inactive Filter - New */}
              <div>
                <label className="block text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                  Active Status
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "active", label: "Active", icon: <MdCheckCircle size={12} /> },
                    { value: "inactive", label: "Inactive", icon: <MdCancel size={12} /> },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setActiveFilter(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        activeFilter === opt.value
                          ? "bg-[#6B3A1F] text-white shadow-md"
                          : "bg-[#FAF7F4] text-[#7A6858] hover:bg-[#EDE5DD]"
                      }`}>
                      {opt.icon}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Result Count */}
      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1C0F05]">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </span>
            <span className="text-sm text-[#A8978A]">projects</span>
            {hasActiveFilters && (
              <span className="text-xs text-[#6B3A1F] bg-[#6B3A1F]/10 px-2 py-0.5 rounded-full">
                Filtered
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="text-xs text-[#A8978A] hover:text-[#6B3A1F] transition-colors flex items-center gap-1">
              <MdRefresh size={12} /> Reset filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F4] text-[#6B3A1F]">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold text-center">Featured</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin" />
                    </div>
                    <p className="text-sm text-gray-400 mt-3">Loading projects...</p>
                   </td>
                 </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF7F4] flex items-center justify-center mx-auto mb-3">
                      <MdApartment size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No projects found</p>
                    <p className="text-sm text-gray-400">
                      {hasActiveFilters ? "Try adjusting your filters" : "Click 'Add Project' to get started"}
                    </p>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="mt-4 text-sm text-[#6B3A1F] hover:underline">
                        Clear all filters
                      </button>
                    )}
                   </td>
                 </tr>
              ) : (
                rows.map((d) => (
                  <tr 
                    key={d._id}
                    className="border-t hover:bg-[#FAF7F4] transition cursor-pointer"
                    onClick={() => navigate(`/projects/${d._id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD]">                      
                          {d.images?.[0]?.url ? (
                            <img
                              src={getImageUrl(d.images[0].url)}
                              alt={d.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <MdApartment size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-[#1C0F05]">{d.title}</p>
                            {d.isFeatured && <MdStar size={12} className="text-amber-400" />}
                          </div>
                          <p className="text-xs text-gray-400">by {d.builder?.name || "—"}</p>
                        </div>
                      </div>
                     </td>
                    <td className="px-4 py-3">
                      <span className={statusBadge(d.status)}>{d.status}</span>
                     </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{d.city?.name || "—"}</span>
                     </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-gray-800">
                        {d.priceLabel || (d.priceMin ? `₹${d.priceMin} Cr` : "—")}
                      </span>
                     </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-500">{d.propertyType || "—"}</span>
                     </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFeatured(d._id); }}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                          d.isFeatured
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-gray-300 hover:bg-gray-100 hover:text-gray-400"
                        }`}>
                        {d.isFeatured ? <MdStar size={16} /> : <MdStarBorder size={16} />}
                      </button>
                     </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(d.createdAt).toLocaleDateString()}
                     </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/projects/${d._id}`)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                          title="View Details">
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/projects/edit/${d._id}`)}
                          className="p-2 rounded-lg bg-[#6B3A1F]/8 text-[#6B3A1F] hover:bg-[#6B3A1F]/15 transition-all"
                          title="Edit Project">
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDelId(d._id);
                            setDelTitle(d.title);
                          }}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Delete Project">
                          <MdDelete size={16} />
                        </button>
                      </div>
                     </td>
                   </tr>
                ))
              )}
            </tbody>
           </table>
        </div>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-sm text-[#A8978A] hidden sm:block">
            Page {currentPage} of {totalPages}
          </p>
          
          <div className="flex items-center gap-1 mx-auto sm:mx-0">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#EDE5DD] bg-white text-[#6B3A1F] hover:bg-[#FAF7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <MdChevronLeft size={16} />
            </button>
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                  ${currentPage === page
                    ? "bg-[#6B3A1F] text-white shadow-md"
                    : "border border-[#EDE5DD] bg-white text-[#6B5C4E] hover:bg-[#FAF7F4]"
                  }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#EDE5DD] bg-white text-[#6B3A1F] hover:bg-[#FAF7F4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <MdChevronRight size={16} />
            </button>
          </div>
          
          <div className="hidden sm:block w-24" />
        </div>
      )}

      {/* Delete Modal */}
      {delId && (
        <DeleteModal
          title="Delete Project?"
          message={`Are you sure you want to delete "${delTitle}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelTitle(""); }}
        />
      )}
    </div>
  );
}