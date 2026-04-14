import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { DeleteModal, useToast } from "../../components/nestory/index";
import {
  MdAdd, MdEdit, MdDelete, MdRefresh, MdSearch, MdVisibility,
  MdCheckCircle, MdCancel, MdFilterList, MdStar, MdStarBorder,
  MdChevronLeft, MdChevronRight, MdHome, MdAttachMoney,
  MdLocationOn, MdCategory, MdBusiness, MdApartment
} from "react-icons/md";

// Constants for filters
const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

const LISTING_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "lease", label: "For Lease" },
];

const getListingBadge = (type) => {
  switch(type) {
    case "sale": return CLS.badgeGreen;
    case "rent": return CLS.badgeBlue;
    case "lease": return CLS.badgeAmber;
    default: return CLS.badgeGray;
  }
};

const getListingLabel = (type) => {
  switch(type) {
    case "sale": return "Sale";
    case "rent": return "Rent";
    case "lease": return "Lease";
    default: return type;
  }
};

export default function PropertiesList() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [delId, setDelId] = useState(null);
  const [delTitle, setDelTitle] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [listingTypeFilter, setListingTypeFilter] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Load properties with filters & pagination
  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (listingTypeFilter) params.listingType = listingTypeFilter;
      
      const response = await propertiesApi.list(params);
      
      let propertiesData = [];
      if (response.data?.properties) propertiesData = response.data.properties;
      else if (response.data?.data) propertiesData = response.data.data;
      else if (Array.isArray(response.data)) propertiesData = response.data;
      
      setRows(propertiesData);
      setTotalItems(response.data?.total || propertiesData.length);
      setTotalPages(response.data?.pages || Math.ceil((response.data?.total || propertiesData.length) / itemsPerPage));
      
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load properties", "error");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, listingTypeFilter, currentPage, itemsPerPage]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, listingTypeFilter]);

  const toggleFeatured = async (id) => {
    try { 
      await propertiesApi.toggleFeatured(id); 
      loadProperties(); 
    } catch { 
      toast("Update failed", "error"); 
    }
  };

  const handleDelete = async () => {
    try {
      await propertiesApi.remove(delId);
      toast("Property deleted successfully", "success");
      setDelId(null);
      setDelTitle("");
      loadProperties();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setListingTypeFilter("");
    setShowFilters(false);
    setCurrentPage(1);
  };

  const hasActiveFilters = search !== "" || categoryFilter !== "" || listingTypeFilter !== "";

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

  const formatPrice = (price, listingType) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lac`;
    }
    return `₹${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D] flex items-center justify-center shadow-lg">
            <MdHome size={20} className="text-[#E8D5B0]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#1C0F05]">Properties</h1>
            <p className="text-sm text-[#A8978A] mt-0.5">Manage all property listings</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F4] border border-[#EDE5DD]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1C0F05]">{totalItems}</span>
            <span className="text-[10px] text-[#A8978A]">Total Properties</span>
          </div>
          
          <button 
            onClick={() => loadProperties()} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white transition-all duration-200"
            title="Refresh">
            <MdRefresh size={17} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => navigate("/properties/add")} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdAdd size={16} /> Add Property
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
              placeholder="Search by title, location, address..."
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
                {(categoryFilter ? 1 : 0) + (listingTypeFilter ? 1 : 0)}
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
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button
                      key={opt.value || "all"}
                      onClick={() => setCategoryFilter(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        categoryFilter === opt.value
                          ? "bg-[#6B3A1F] text-white shadow-md"
                          : "bg-[#FAF7F4] text-[#7A6858] hover:bg-[#EDE5DD]"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                  Listing Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {LISTING_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.value || "all"}
                      onClick={() => setListingTypeFilter(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        listingTypeFilter === opt.value
                          ? "bg-[#6B3A1F] text-white shadow-md"
                          : "bg-[#FAF7F4] text-[#7A6858] hover:bg-[#EDE5DD]"
                      }`}>
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
            <span className="text-sm text-[#A8978A]">properties</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F4] text-[#6B3A1F]">
              <tr className="text-left">
                <th className="px-4 py-3 font-semibold">Property</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Listing</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">BHK</th>
                <th className="px-4 py-3 font-semibold">Area</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold text-center">Featured</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin" />
                    </div>
                    <p className="text-sm text-gray-400 mt-3">Loading properties...</p>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF7F4] flex items-center justify-center mx-auto mb-3">
                      <MdHome size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No properties found</p>
                    <p className="text-sm text-gray-400">
                      {hasActiveFilters ? "Try adjusting your filters" : "Click 'Add Property' to get started"}
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr 
                    key={d._id}
                    className="border-t hover:bg-[#FAF7F4] transition cursor-pointer"
                    onClick={() => navigate(`/properties/${d._id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD]">
                          {d.images?.[0]?.url ? (
                            <img
                              src={d.images[0].url}
                              alt={d.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <MdHome size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-[#1C0F05]">{d.title}</p>
                            {d.isFeatured && <MdStar size={12} className="text-amber-400" />}
                          </div>
                          <p className="text-xs text-gray-400">{d.owner || "No owner"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium capitalize">{d.category}</span>
                        <span className="text-[10px] text-gray-400 capitalize">{d.subCategory}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={getListingBadge(d.listingType)}>
                        {getListingLabel(d.listingType)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-xs font-semibold text-gray-800">
                          {formatPrice(d.price, d.listingType)}
                        </span>
                        {d.listingType === "rent" && d.securityDeposit && (
                          <p className="text-[9px] text-gray-400">Deposit: {formatPrice(d.securityDeposit, "rent")}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{d.bedrooms} BHK</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600">{d.area} {d.areaUnit}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 truncate max-w-[150px] block">{d.location}</span>
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
                          onClick={() => navigate(`/properties/${d._id}`)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                          title="View Details">
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/properties/edit/${d._id}`)}
                          className="p-2 rounded-lg bg-[#6B3A1F]/8 text-[#6B3A1F] hover:bg-[#6B3A1F]/15 transition-all"
                          title="Edit Property">
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDelId(d._id);
                            setDelTitle(d.title);
                          }}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Delete Property">
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
          title="Delete Property?"
          message={`Are you sure you want to delete "${delTitle}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelTitle(""); }}
        />
      )}
    </div>
  );
}