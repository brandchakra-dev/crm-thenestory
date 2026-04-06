// src/pages/Nestory/Projects/NestoryProjectsList.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { projectsApi } from "../../services/nestoryApi";
import { CLS, statusBadge } from "../../utils/nestoryTheme";
import { DeleteModal, useToast } from "../../components/nestory/index";
import {
  MdAdd, MdEdit, MdDelete, MdRefresh,
  MdSearch, MdVisibility, MdStar, MdStarBorder,
} from "react-icons/md";

export default function ProjectList() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const gridRef    = useRef();

  const [rows,     setRows]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState("");
  const [status,   setStatus]  = useState("");
  const [delId,    setDelId]   = useState(null);
  const [delTitle, setDelTitle]= useState("");

  // ── Load
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 200 };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await projectsApi.list(params);
      setRows(data.projects || []);
    } catch {
      toast("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  // ── Toggle featured
  const toggleFeatured = async (id) => {
    try { await projectsApi.toggleFeatured(id); load(); }
    catch { toast("Update failed", "error"); }
  };

  // ── Delete
  const handleDelete = async () => {
    try {
      await projectsApi.remove(delId);
      toast("Project deleted successfully");
      setDelId(null);
      setDelTitle("");
      load();
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  // ── Columns
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
      headerName: "Project",
      flex: 2,
      minWidth: 220,
      pinned: "left",
      cellRenderer: ({ data: d }) => (
        <div className="flex items-center gap-2.5 h-full py-1.5">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-[#EDE5DD] flex-shrink-0">
            {d.images?.[0]?.url ? (
              <img src={d.images[0].url} alt="" className="w-full h-full object-cover"/>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-300">
                No img
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {d.isFeatured && <MdStar size={11} className="text-amber-400 flex-shrink-0"/>}
              <p className="font-semibold text-gray-900 text-xs leading-tight truncate">{d.title}</p>
            </div>
            <p className="text-[10px] text-gray-400">{d.builder?.name || "—"}</p>
          </div>
        </div>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 175,
      cellRenderer: ({ value }) => (
        <div className="flex items-center h-full">
          <span className={statusBadge(value)}>{value}</span>
        </div>
      ),
    },
    {
      field: "city",
      headerName: "City",
      width: 120,
      valueGetter: ({ data: d }) => d.city?.name || "—",
    },
    {
      field: "priceLabel",
      headerName: "Price",
      width: 180,
      cellRenderer: ({ data: d }) => (
        <span className="text-xs font-semibold text-gray-800">
          {d.priceLabel || (d.priceMin ? `₹${d.priceMin} Cr` : "—")}
        </span>
      ),
    },
    {
      field: "propertyType",
      headerName: "Type",
      width: 130,
    },
    {
      field: "totalUnits",
      headerName: "Units",
      width: 80,
      type: "numericColumn",
    },
    {
      field: "reraNo",
      headerName: "RERA No.",
      width: 160,
      cellRenderer: ({ value }) => value
        ? <span className="text-xs font-mono text-emerald-700">{value}</span>
        : <span className="text-gray-300 text-xs">—</span>,
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
            onClick={(e) => { e.stopPropagation(); navigate(`/nestory/projects/${d._id}`); }}
            className={CLS.btnIcon + " bg-blue-50 text-blue-600 hover:bg-blue-100"}
            title="View Detail">
            <MdVisibility size={15}/>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/nestory/projects/edit/${d._id}`); }}
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

      {/* ── Header ── */}
      <div className={CLS.pageHeader}>
        <div>
          <h1 className={CLS.pageTitle}>Projects</h1>
          <p className={CLS.pageSubtitle}>{rows.length} total projects</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className={CLS.btnSecondary + " !px-3"} title="Refresh">
            <MdRefresh size={17}/>
          </button>
          <button onClick={() => navigate("/nestory/projects/add")} className={CLS.btnPrimary}>
            <MdAdd size={17}/> New Project
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 p-3 bg-white rounded-xl border border-[#EDE5DD]">
        <div className="relative flex-1 min-w-[200px]">
          <MdSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, builder, location…"
            className={CLS.input + " pl-9"}
          />
        </div>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className={CLS.select + " w-52"}>
          <option value="">All Statuses</option>
          {["New Launch","Ready To Move","Under Construction","Upcoming"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* ── AG Grid ── */}
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
              navigate(`/nestory/projects/${d._id}`);
            }
          }}
        />
      </div>

      {/* ── Delete Modal ── */}
      {delId && (
        <DeleteModal
          title="Delete Project?"
          message={`Are you sure you want to delete "${delTitle}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDelId(null); setDelTitle(""); }}
        />
      )}
    </div>
  );
}