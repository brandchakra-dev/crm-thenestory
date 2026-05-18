import { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import { FaSync, FaSearch, FaFilter, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import { fetchConsultations, updateConsultationStatus } from "../../api/consultationService";

const STATUS_STYLES = {
  new: "bg-amber-100 text-amber-800 border-amber-200",
  contacted: "bg-sky-100 text-sky-800 border-sky-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const statusLabel = (status) => {
  switch (status) {
    case "new": return "New";
    case "contacted": return "Contacted";
    case "closed": return "Closed";
    default: return status;
  }
};

const truncate = (text, length = 80) =>
  text?.length > length ? `${text.slice(0, length)}...` : text || "—";

export default function ConsultationList() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadConsultations = async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await fetchConsultations(params);
      setConsultations(data.consultations || []);
    } catch (error) {
      console.error("Failed to load consultations:", error);
      alert(error.response?.data?.message || "Unable to load consultations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, [statusFilter]);

  const filteredConsultations = useMemo(() => {
    const search = filterText.trim().toLowerCase();
    if (!search) return consultations;

    return consultations.filter((item) =>
      [item.name, item.mobile, item.email, item.city, item.message, item.source]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search))
    );
  }, [consultations, filterText]);

  const handleStatusChange = async (consultation, nextStatus) => {
    if (consultation.status === nextStatus) return;
    try {
      await updateConsultationStatus(consultation._id, { status: nextStatus });
      loadConsultations();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert(error.response?.data?.message || "Unable to update status.");
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <span className="font-semibold text-gray-900">{row.name || "—"}</span>,
      minWidth: "180px",
    },
    {
      name: "Phone",
      selector: (row) => row.mobile,
      sortable: true,
      cell: (row) => <span className="text-sm text-gray-700">{row.mobile || "—"}</span>,
      minWidth: "140px",
    },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      cell: (row) => <span className="text-sm text-gray-700">{row.email || "—"}</span>,
      minWidth: "220px",
    },
    {
      name: "City",
      selector: (row) => row.city,
      sortable: true,
      cell: (row) => <span className="text-sm text-gray-700">{row.city || "—"}</span>,
      minWidth: "140px",
    },
    {
      name: "Source",
      selector: (row) => row.source,
      sortable: true,
      cell: (row) => <span className="capitalize text-sm text-gray-700">{row.source || "website"}</span>,
      minWidth: "140px",
    },
    {
      name: "Message",
      selector: (row) => row.message,
      sortable: false,
      cell: (row) => (
        <span className="text-sm text-gray-700" title={row.message || ""}>
          {truncate(row.message, 70)}
        </span>
      ),
      minWidth: "280px",
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[row.status] || "bg-slate-100 text-slate-800 border-slate-200"}`}>
          {statusLabel(row.status)}
        </span>
      ),
      minWidth: "130px",
    },
    {
      name: "Received",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-gray-500">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
      minWidth: "180px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleStatusChange(row, "contacted")}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-semibold hover:bg-sky-100 transition"
          >
            <FaCheck size={12} /> Contacted
          </button>
          <button
            onClick={() => handleStatusChange(row, "closed")}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition"
          >
            <FaTimes size={12} /> Close
          </button>
        </div>
      ),
      minWidth: "200px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D] flex items-center justify-center shadow-lg">
            <FaEye size={20} className="text-[#E8D5B0]" />
          </div>
          <div>
            <h1 className="font-display font-black text-2xl text-[#1C0F05]">Consultations</h1>
            <p className="text-sm text-[#A8978A] mt-0.5">View all contact form submissions and enquiry details.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF7F4] border border-[#EDE5DD]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#1C0F05]">{filteredConsultations.length}</span>
            <span className="text-[10px] text-[#A8978A]">Records loaded</span>
          </div>

          <button
            onClick={loadConsultations}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200"
            title="Refresh">
            <FaSync size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#EDE5DD] shadow-sm p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-center">
          <div className="relative">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8978A]" />
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search name, email, phone, city, source or message..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm text-[#1C0F05] placeholder:text-[#A8978A] focus:outline-none focus:border-[#6B3A1F] focus:ring-2 focus:ring-[#6B3A1F]/15 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { value: "all", label: "All" },
              { value: "new", label: "New" },
              { value: "contacted", label: "Contacted" },
              { value: "closed", label: "Closed" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  statusFilter === option.value
                    ? "bg-[#6B3A1F] text-white border border-[#6B3A1F]"
                    : "bg-[#FAF7F4] text-[#6B3A1F] border border-[#EDE5DD] hover:bg-[#EDE5DD]"
                }`}
              >
                <FaFilter size={12} /> {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#EDE5DD] shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredConsultations}
          progressPending={loading}
          pagination
          responsive
          highlightOnHover
          dense
          noHeader
          paginationPerPage={15}
          paginationRowsPerPageOptions={[15, 30, 50]}
          noDataComponent={<div className="p-8 text-center text-sm text-gray-500">No consultation records found.</div>}
        />
      </div>
    </div>
  );
}
