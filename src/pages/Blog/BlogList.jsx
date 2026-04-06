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
  MdArticle, MdCheckCircle, MdCancel,
} from "react-icons/md";
import dayjs from "dayjs";

const CATEGORIES = ["News", "Tax & Legal", "Help Guides", "Investment", "Finance"];

export default function BlogList() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const gridRef    = useRef();

  const [rows,     setRows]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState("");
  const [category, setCategory] = useState("");
  const [delId,    setDelId]   = useState(null);
  const [delTitle, setDelTitle]= useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (category) params.category = category;
      const { data } = await blogsApi.list(params);
      setRows(data.blogs || []);
    } catch {
      toast("Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const toggleFeatured = async (id) => {
    try { 
      await blogsApi.toggleFeatured(id); 
      load(); 
    } catch { 
      toast("Update failed", "error"); 
    }
  };

  const handleDelete = async () => {
    try {
      await blogsApi.remove(delId);
      toast("Blog deleted successfully");
      setDelId(null);
      setDelTitle("");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const categoryColors = {
    "News": "bg-blue-50 text-blue-700 border-blue-200",
    "Tax & Legal": "bg-purple-50 text-purple-700 border-purple-200",
    "Help Guides": "bg-green-50 text-green-700 border-green-200",
    "Investment": "bg-amber-50 text-amber-700 border-amber-200",
    "Finance": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const columnDefs = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      width: 48,
      pinned: "left",
      resizable: false,
      sortable: false,
      filter: false,
    },
    {
      field: "title",
      headerName: "Blog Post",
      flex: 2,
      minWidth: 280,
      pinned: "left",
      cellRenderer: ({ data: d }) => (
        <div className="flex items-center gap-3 h-full py-1.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD] flex-shrink-0">
            {d.coverImage?.url ? (
              <img src={d.coverImage.url} alt={d.title} className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">
                <MdArticle size={16}/>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {d.isFeatured && <MdStar size={11} className="text-amber-400 flex-shrink-0"/>}
              <p className="font-semibold text-gray-900 text-sm truncate">{d.title}</p>
            </div>
            <p className="text-[10px] text-gray-400">by {d.author || "The Nestory Team"}</p>
          </div>
        </div>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 140,
      cellRenderer: ({ value }) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${categoryColors[value] || "bg-gray-100 text-gray-600"}`}>
          {value}
        </span>
      ),
    },
    {
      field: "excerpt",
      headerName: "Excerpt",
      flex: 2,
      minWidth: 200,
      cellRenderer: ({ value }) => (
        <span className="text-xs text-gray-600 line-clamp-2">{value || "—"}</span>
      ),
    },
    {
      field: "isPublished",
      headerName: "Status",
      width: 100,
      cellRenderer: ({ value }) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
          value ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${value ? "bg-emerald-500" : "bg-gray-400"}`}/>
          {value ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      field: "views",
      headerName: "Views",
      width: 80,
      type: "numericColumn",
      cellRenderer: ({ value }) => (
        <span className="text-xs font-semibold text-gray-600">{value || 0}</span>
      ),
    },
    {
      field: "publishedAt",
      headerName: "Published",
      width: 110,
      valueGetter: ({ value }) => value ? dayjs(value).format("DD MMM YY") : "—",
    },
    {
      field: "isFeatured",
      headerName: "Featured",
      width: 95,
      cellRenderer: ({ data: d }) => (
        <div className="flex items-center h-full">
          <button
            onClick={(e) => { e.stopPropagation(); toggleFeatured(d._id); }}
            className={`p-1.5 rounded-lg transition-colors ${
              d.isFeatured
                ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                : "text-gray-300 hover:bg-gray-100 hover:text-gray-400"
            }`}>
            {d.isFeatured ? <MdStar size={16}/> : <MdStarBorder size={16}/>}
          </button>
        </div>
      ),
    },
    {
      headerName: "Actions",
      width: 130,
      sortable: false,
      filter: false,
      pinned: "right",
      cellRenderer: ({ data: d }) => (
        <div className="flex items-center gap-1 h-full">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/nestory/blog/${d._id}`); }}
            className={CLS.btnIcon + " bg-blue-50 text-blue-600 hover:bg-blue-100"}
            title="View Detail">
            <MdVisibility size={15}/>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/nestory/blog/edit/${d._id}`); }}
            className={CLS.btnIcon + " bg-[#6B3A1F]/8 text-[#6B3A1F] hover:bg-[#6B3A1F]/15"}
            title="Edit">
            <MdEdit size={15}/>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDelId(d._id); setDelTitle(d.title); }}
            className={CLS.btnIcon + " bg-red-50 text-red-500 hover:bg-red-100"}
            title="Delete">
            <MdDelete size={15}/>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 h-full max-w-7xl">

      <div className={CLS.pageHeader}>
        <div>
          <h1 className={CLS.pageTitle}>Blog Posts</h1>
          <p className={CLS.pageSubtitle}>{rows.length} total posts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className={CLS.btnSecondary + " !px-3"} title="Refresh">
            <MdRefresh size={17}/>
          </button>
          <button onClick={() => navigate("/nestory/blog/add")} className={CLS.btnPrimary}>
            <MdAdd size={17}/> New Post
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 p-3 bg-white rounded-xl border border-[#EDE5DD]">
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or author..."
            className={CLS.input + " pl-9"}
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className={CLS.select + " w-44"}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div
        className="ag-theme-alpine flex-1 rounded-2xl overflow-hidden border border-[#EDE5DD]"
        style={{ minHeight: 500 }}>
        <AgGridReact
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{ resizable: true, sortable: true, filter: true }}
          rowSelection="multiple"
          rowHeight={62}
          headerHeight={44}
          pagination
          paginationPageSize={20}
          loading={loading}
          animateRows
          suppressMovableColumns
          onGridReady={p => p.api.sizeColumnsToFit()}
          onRowClicked={({ data: d, event }) => {
            if (!event.target.closest("button")) {
              navigate(`/nestory/blog/${d._id}`);
            }
          }}
        />
      </div>

      {delId && (
        <DeleteModal
          title="Delete Blog Post?"
          message={`Are you sure you want to delete "${delTitle}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelTitle(""); }}
        />
      )}
    </div>
  );
}