import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { buildersApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { DeleteModal, useToast } from "../../components/nestory/index";
import {
  MdAdd, MdEdit, MdDelete, MdRefresh,
  MdSearch, MdVisibility, MdImage, MdStar, MdStarBorder,
  MdCheckCircle, MdCancel, MdFilterList, MdBusiness,
} from "react-icons/md";

export default function BuilderList() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const gridRef    = useRef();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [delId, setDelId] = useState(null);
  const [delName, setDelName] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [uniqueStatuses, setUniqueStatuses] = useState([]);

  // Load builders with filters
  const loadBuilders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.isActive = statusFilter === "active";
      
      const response = await buildersApi.list(params);
      
      let buildersData = [];
      if (response.data?.builders) buildersData = response.data.builders;
      else if (response.data?.data) buildersData = response.data.data;
      else if (Array.isArray(response.data)) buildersData = response.data;
      
      setRows(buildersData);
      
      // Extract unique statuses for filter
      const statuses = [...new Set(buildersData.map(b => b.isActive ? "active" : "inactive").filter(Boolean))];
      setUniqueStatuses(statuses);
      
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load builders", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBuilders();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBuilders();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter changes
  useEffect(() => {
    loadBuilders();
  }, [statusFilter]);

  const toggleFeatured = async (id) => {
    try { 
      await buildersApi.toggleFeatured(id); 
      loadBuilders(); 
    } catch { 
      toast("Update failed", "error"); 
    }
  };

  const handleDelete = async () => {
    try {
      await buildersApi.remove(delId);
      toast("Builder deleted successfully", "success");
      setDelId(null);
      setDelName("");
      loadBuilders();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setShowFilters(false);
    loadBuilders();
  };

  const hasActiveFilters = search !== "" || statusFilter !== "all";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D] flex items-center justify-center shadow-lg">
            <MdBusiness size={20} className="text-[#E8D5B0]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#1C0F05]">Builders</h1>
            <p className="text-sm text-[#A8978A] mt-0.5">Manage all builders and developers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F4] border border-[#EDE5DD]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1C0F05]">{rows.length}</span>
            <span className="text-[10px] text-[#A8978A]">Total Builders</span>
          </div>
          
          <button 
            onClick={() => loadBuilders()} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200"
            title="Refresh">
            <MdRefresh size={17} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => navigate("/builders/add")} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdAdd size={16} /> Add Builder
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
              placeholder="Search by builder name..."
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
                {statusFilter !== "all" ? 1 : 0}
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
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                  Status
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "All", icon: null },
                    { value: "active", label: "Active", icon: <MdCheckCircle size={12} /> },
                    { value: "inactive", label: "Inactive", icon: <MdCancel size={12} /> },
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
            </div>
          </div>
        )}
      </div>

      {/* Result Count */}
      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1C0F05]">{rows.length}</span>
            <span className="text-sm text-[#A8978A]">builders found</span>
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
                <th className="px-4 py-3 font-semibold">Builder</th>
                <th className="px-4 py-3 font-semibold">Projects</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Featured</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400">
                    No builders found
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr 
                    key={d._id}
                    className="border-t hover:bg-[#FAF7F4] transition cursor-pointer"
                    onClick={() => navigate(`/builders/${d._id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD]">
                          {d.logoUrl ? (
                            <img
                              src={d.logoUrl}
                              alt={d.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <MdImage size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-[#1C0F05]">{d.name}</p>
                            {d.isFeatured && (
                              <MdStar size={12} className="text-amber-400" />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">/{d.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#6B3A1F]">
                      {d.totalProjects || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {d.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {d.email || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                        d.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-red-50 text-red-500 border border-red-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.isActive !== false ? "bg-emerald-500" : "bg-red-400"}`} />
                        {d.isActive !== false ? "Active" : "Inactive"}
                      </span>
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
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/builders/${d._id}`)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                          title="View Details">
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/builders/edit/${d._id}`)}
                          className="p-2 rounded-lg bg-[#6B3A1F]/8 text-[#6B3A1F] hover:bg-[#6B3A1F]/15 transition-all"
                          title="Edit Builder">
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDelId(d._id);
                            setDelName(d.name);
                          }}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Delete Builder">
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

      {/* Delete Modal */}
      {delId && (
        <DeleteModal
          title="Delete Builder?"
          message={`Are you sure you want to delete "${delName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelName(""); }}
        />
      )}
    </div>
  );
}