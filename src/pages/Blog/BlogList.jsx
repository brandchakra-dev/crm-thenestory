import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { blogsApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { DeleteModal, useToast } from "../../components/nestory/index";
import {
  MdAdd, MdEdit, MdDelete, MdRefresh,
  MdSearch, MdVisibility, MdStar, MdStarBorder,
  MdArticle, MdCheckCircle, MdCancel, MdFilterList,
  MdCategory, MdPerson, MdVisibility as MdViewIcon
} from "react-icons/md";
import dayjs from "dayjs";

const CATEGORIES = ["News", "Tax & Legal", "Help Guides", "Investment", "Finance"];

export default function BlogList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const gridRef = useRef();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [delId, setDelId] = useState(null);
  const [delTitle, setDelTitle] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueCategories, setUniqueCategories] = useState([]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (category && category !== "all") params.category = category;
      if (statusFilter !== "all") params.isPublished = statusFilter === "published";
      
      const response = await blogsApi.list(params);
      
      let blogsData = [];
      if (response.data?.blogs) blogsData = response.data.blogs;
      else if (response.data?.data) blogsData = response.data.data;
      else if (Array.isArray(response.data)) blogsData = response.data;
      
      setRows(blogsData);
      
      // Extract unique categories for filter
      const cats = [...new Set(blogsData.map(b => b.category).filter(Boolean))];
      setUniqueCategories(cats);
      
    } catch (error) {
      toast(error.response?.data?.message || "Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBlogs();
  }, []);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBlogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Filter changes
  useEffect(() => {
    loadBlogs();
  }, [category, statusFilter]);

  const toggleFeatured = async (id) => {
    try { 
      await blogsApi.toggleFeatured(id); 
      loadBlogs(); 
    } catch { 
      toast("Update failed", "error"); 
    }
  };

  const handleDelete = async () => {
    try {
      await blogsApi.remove(delId);
      toast("Blog deleted successfully", "success");
      setDelId(null);
      setDelTitle("");
      loadBlogs();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setStatusFilter("all");
    setShowFilters(false);
    loadBlogs();
  };

  const hasActiveFilters = search !== "" || category !== "" || statusFilter !== "all";

  const categoryColors = {
    "News": "bg-blue-50 text-blue-700 border-blue-200",
    "Tax & Legal": "bg-purple-50 text-purple-700 border-purple-200",
    "Help Guides": "bg-green-50 text-green-700 border-green-200",
    "Investment": "bg-amber-50 text-amber-700 border-amber-200",
    "Finance": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const formatViews = (views) => {
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || "0";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D] flex items-center justify-center shadow-lg">
            <MdArticle size={20} className="text-[#E8D5B0]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#1C0F05]">Blog Posts</h1>
            <p className="text-sm text-[#A8978A] mt-0.5">Manage all blog articles and posts</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F4] border border-[#EDE5DD]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1C0F05]">{rows.length}</span>
            <span className="text-[10px] text-[#A8978A]">Total Posts</span>
          </div>
          
          <button 
            onClick={() => loadBlogs()} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200"
            title="Refresh">
            <MdRefresh size={17} className={loading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => navigate("/blogs/add")} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdAdd size={16} /> New Post
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
              placeholder="Search by title or author..."
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
                {(category ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
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
              {/* Category Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                  <MdCategory size={12} /> Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategory("")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      category === ""
                        ? "bg-[#6B3A1F] text-white shadow-md"
                        : "bg-[#FAF7F4] text-[#7A6858] hover:bg-[#EDE5DD]"
                    }`}>
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                        category === cat
                          ? "bg-[#6B3A1F] text-white shadow-md"
                          : "bg-[#FAF7F4] text-[#7A6858] hover:bg-[#EDE5DD]"
                      }`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#A8978A] uppercase tracking-wide mb-1.5">
                  <MdCheckCircle size={12} /> Status
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "All", icon: null },
                    { value: "published", label: "Published", icon: <MdCheckCircle size={12} /> },
                    { value: "draft", label: "Draft", icon: <MdCancel size={12} /> },
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
            <span className="text-sm text-[#A8978A]">posts found</span>
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
                <th className="px-4 py-3 font-semibold w-10">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-4 py-3 font-semibold">Blog Post</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Excerpt</th>
                <th className="px-4 py-3 font-semibold">Views</th>
                <th className="px-4 py-3 font-semibold">Published</th>
                <th className="px-4 py-3 font-semibold">Status</th>
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
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-10 text-gray-400">
                    <MdArticle size={48} className="mx-auto mb-3 opacity-20" />
                    No blog posts found
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr 
                    key={d._id}
                    className="border-t hover:bg-[#FAF7F4] transition cursor-pointer"
                    onClick={() => navigate(`/blogs/${d._id}`)}
                  >
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD] flex-shrink-0">
                          {d.coverImageUrl ? (
                            <img
                              src={d.coverImageUrl}
                              alt={d.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <MdArticle size={16} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-semibold text-[#1C0F05] line-clamp-1">{d.title}</p>
                            {d.isFeatured && <MdStar size={12} className="text-amber-400 flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            by {d.author || "The Nestory Team"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${categoryColors[d.category] || "bg-gray-100 text-gray-600"}`}>
                        {d.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 line-clamp-2 max-w-xs">
                        {d.excerpt || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#6B3A1F]">
                      {formatViews(d.views)}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {d.publishedAt ? dayjs(d.publishedAt).format("DD MMM YYYY") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                        d.isPublished
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${d.isPublished ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {d.isPublished ? "Published" : "Draft"}
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
                          onClick={() => navigate(`/blogs/${d._id}`)}
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all"
                          title="View Details">
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/blogs/edit/${d._id}`)}
                          className="p-2 rounded-lg bg-[#6B3A1F]/8 text-[#6B3A1F] hover:bg-[#6B3A1F]/15 transition-all"
                          title="Edit Post">
                          <MdEdit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setDelId(d._id);
                            setDelTitle(d.title);
                          }}
                          className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                          title="Delete Post">
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
          title="Delete Blog Post?"
          message={`Are you sure you want to delete "${delTitle}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelTitle(""); }}
        />
      )}
    </div>
  );
}