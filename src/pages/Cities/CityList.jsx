import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { citiesApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { DeleteModal, useToast } from "../../components/nestory/index";
import {
  MdAdd, MdEdit, MdDelete, MdRefresh,
  MdSearch, MdVisibility, MdImage, MdLocationOn,
  MdCheckCircle, MdCancel, MdFilterList,
} from "react-icons/md";

import { getImageUrl } from "../../utils/url";

export default function CityList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [delId, setDelId] = useState(null);
  const [delName, setDelName] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("");
  const [uniqueStates, setUniqueStates] = useState([]);

  // Load cities with filters
  const loadCities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.isActive = statusFilter === "active";
      if (stateFilter) params.state = stateFilter;
      
      const response = await citiesApi.list(params);
      
      let citiesData = [];
      if (response.data?.cities) citiesData = response.data.cities;
      else if (response.data?.data) citiesData = response.data.data;
      else if (Array.isArray(response.data)) citiesData = response.data;
      
      setRows(citiesData);
      
      // Extract unique states for filter
      const states = [...new Set(citiesData.map(city => city.state).filter(Boolean))];
      setUniqueStates(states);
      
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load cities", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadCities();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCities();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter changes
  useEffect(() => {
    loadCities();
  }, [statusFilter, stateFilter]);

  const handleDelete = async () => {
    try {
      await citiesApi.remove(delId);
      toast("City deleted successfully", "success");
      setDelId(null);
      setDelName("");
      loadCities();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setStateFilter("");
    setShowFilters(false);
    loadCities();
  };

  const hasActiveFilters = search !== "" || statusFilter !== "all" || stateFilter !== "";

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D] flex items-center justify-center shadow-lg">
            <MdLocationOn size={20} className="text-[#E8D5B0]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#1C0F05]">Cities</h1>
            <p className="text-sm text-[#A8978A] mt-0.5">Manage all cities across NCR region</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F4] border border-[#EDE5DD]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1C0F05]">{rows.length}</span>
            <span className="text-[10px] text-[#A8978A]">Total Cities</span>
          </div>
          
          <button 
            onClick={() => loadCities()} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200"
            title="Refresh">
            <MdRefresh size={17} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => navigate("/cities/add")} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdAdd size={16} /> Add City
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
              placeholder="Search by city name..."
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
                {(statusFilter !== "all" ? 1 : 0) + (stateFilter ? 1 : 0)}
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

              {uniqueStates.length > 0 && (
                <div>
                  <label className="block text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                    State
                  </label>
                  <select
                    value={stateFilter}
                    onChange={e => setStateFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#EDE5DD] bg-[#FAF7F4] text-sm text-[#1C0F05] focus:outline-none focus:border-[#6B3A1F] transition-all">
                    <option value="">All States</option>
                    {uniqueStates.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Result Count */}
      {!loading && rows.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#1C0F05]">{rows.length}</span>
            <span className="text-sm text-[#A8978A]">cities found</span>
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
                <th className="px-4 py-3 font-semibold">City</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Projects</th>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-400">
                    No cities found
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr 
                    key={d._id}
                    className="border-t hover:bg-[#FAF7F4] transition cursor-pointer"
                    onClick={() => navigate(`/cities/${d._id}`)}  // ✅ Fixed path
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD]">
                          {d.imageUrl ? (
                            <img
                              src={getImageUrl(d.imageUrl)}
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
                          <p className="font-semibold text-[#1C0F05]">{d.name}</p>
                          <p className="text-xs text-gray-400">/{d.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-lg bg-[#FAF7F4] text-xs text-[#7A6858]">
                        {d.state || "Uttar Pradesh"}
                      </span>
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
                    <td className="px-4 py-3 font-semibold text-[#6B3A1F]">
                      {d.totalProjects || 0}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/cities/${d._id}`)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                          title="View Details">
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/cities/edit/${d._id}`)}
                          className="p-2 rounded-lg bg-[#6B3A1F]/8 text-[#6B3A1F] hover:bg-[#6B3A1F]/15 transition-all"
                          title="Edit City">
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDelId(d._id);
                            setDelName(d.name);
                          }}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Delete City">
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
          title="Delete City?"
          message={`Are you sure you want to delete "${delName}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelName(""); }}
        />
      )}
    </div>
  );
}