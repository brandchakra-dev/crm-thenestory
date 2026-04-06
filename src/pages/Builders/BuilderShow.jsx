import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buildersApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { useToast, DeleteModal } from "../../components/nestory/index";
import { 
  MdAdd, MdEdit, MdDelete, MdArrowBack, MdImage, MdStar, MdPhone, 
  MdEmail, MdLanguage, MdBusiness, MdLocationCity, MdPerson,
  MdCalendarToday, MdRefresh, MdContentCopy, MdCheckCircle, MdCancel
} from "react-icons/md";

import dayjs from "dayjs";

function InfoRow({ label, value, mono = false, icon = null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F0EAE2] last:border-0 group hover:bg-[#FAF7F4]/50 transition-colors duration-200">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#6B3A1F]/8 flex items-center justify-center mt-0.5">
        {icon ? (
          <span className="text-[#6B3A1F]">{icon}</span>
        ) : (
          <MdBusiness size={14} className="text-[#A8978A]" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className={`text-sm text-[#1C0F05] ${mono ? "font-mono text-xs break-all" : "font-medium"} break-words`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-white to-[#FAF7F4] border border-[#EDE5DD]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide">{label}</p>
        <p className="text-lg font-black text-[#1C0F05] leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function BuilderShow() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDel, setShowDel] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    buildersApi.get(id)
      .then(({ data }) => {
        setBuilder(data.builder);
      })
      .catch((err) => {
        console.error("Error loading builder:", err);
        toast(err.response?.data?.message || "Failed to load builder", "error");
      })
      .finally(() => setLoading(false));
  }, [id, toast]);

  const handleDelete = async () => {
    try {
      await buildersApi.remove(id);
      toast("Builder deleted successfully", "success");
      navigate("/builders");
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Copied to clipboard!", "success");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-[#EDE5DD] border-t-[#6B3A1F] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#6B3A1F]/10 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm text-[#A8978A]">Loading builder details...</p>
    </div>
  );

  if (!builder) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6B3A1F]/10 to-[#C9A84C]/10 flex items-center justify-center mb-5">
        <MdBusiness size={44} className="text-[#6B3A1F]/30" />
      </div>
      <h3 className="font-display font-bold text-2xl text-[#1C0F05] mb-2">Builder not found</h3>
      <p className="text-[#A8978A] text-center max-w-sm mb-6">
        The builder you're looking for doesn't exist or may have been deleted.
      </p>
      <button 
        onClick={() => navigate("/builders")} 
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        <MdArrowBack size={16} /> Back to Builders
      </button>
    </div>
  );

  const logoUrl = builder.logo?.url || builder.logoUrl;
  const isActive = builder.isActive !== false;
  const totalProjects = builder.totalProjects || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/builders")} 
            className="group w-10 h-10 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200">
            <MdArrowBack size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1C0F05]">{builder.name}</h1>
              {builder.isFeatured && (
                <span className={CLS.badgeAmber + " flex items-center gap-1"}>
                  <MdStar size={10} /> Featured
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                isActive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                  : "bg-red-50 text-red-500 border border-red-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`}/>
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-[#A8978A] mt-1 flex items-center gap-1">
              <MdBusiness size={14} className="text-[#C9A84C]" />
              {builder.experience || "Established"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/builders/edit/${id}`)} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdEdit size={16} /> Edit Builder
          </button>
          <button 
            onClick={() => setShowDel(true)} 
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-all duration-200 border border-red-200">
            <MdDelete size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard 
          label="Total Projects" 
          value={totalProjects} 
          icon={<MdBusiness size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D]"
        />
        <StatCard 
          label="Cities Present" 
          value={builder.citiesPresent?.length || 0} 
          icon={<MdLocationCity size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#C9A84C] to-[#B89430]"
        />
        <StatCard 
          label="Member Since" 
          value={builder.createdAt ? dayjs(builder.createdAt).format("YYYY") : "—"} 
          icon={<MdCalendarToday size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#059669] to-[#047857]"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Logo & Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Logo Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="relative bg-gradient-to-br from-[#6B3A1F]/5 to-[#C9A84C]/5">
              {logoUrl ? (
                <div className="flex items-center justify-center p-8">
                  <img 
                    src={logoUrl} 
                    alt={builder.name} 
                    className="max-h-32 object-contain"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#FAF7F4] flex items-center justify-center mb-3">
                    <MdImage size={32} className="text-[#A8978A]" />
                  </div>
                  <p className="text-sm text-[#A8978A]">No logo uploaded</p>
                  <button 
                    onClick={() => navigate(`/builders/edit/${id}`)}
                    className="mt-3 text-xs text-[#6B3A1F] hover:underline">
                    Upload Logo →
                  </button>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[#EDE5DD] bg-[#FAF7F4]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <MdImage size={14} className="text-[#A8978A]" />
                  <span className="text-xs text-[#A8978A]">Builder Logo</span>
                </div>
                {logoUrl && (
                  <button 
                    onClick={() => window.open(logoUrl, '_blank')}
                    className="text-xs text-[#6B3A1F] hover:underline flex items-center gap-1">
                    View Full Size →
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Description Card */}
          {builder.description && (
            <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-[#F0EAE2] bg-gradient-to-r from-[#FAF7F4] to-white">
                <h3 className="font-black text-sm text-[#1C0F05] uppercase tracking-wider flex items-center gap-2">
                  <MdBusiness size={16} className="text-[#C9A84C]" />
                  About {builder.name}
                </h3>
              </div>
              <div className="p-5">
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-[#7A6858] leading-relaxed whitespace-pre-line">
                    {builder.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Information Cards */}
        <div className="space-y-5">

          {/* Contact Information Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#F0EAE2] bg-gradient-to-r from-[#FAF7F4] to-white">
              <h3 className="font-black text-sm text-[#1C0F05] uppercase tracking-wider flex items-center gap-2">
                <MdPhone size={16} className="text-[#C9A84C]" />
                Contact Information
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {builder.phone && (
                <a href={`tel:${builder.phone}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#6B3A1F]/10 flex items-center justify-center">
                    <MdPhone size={16} className="text-[#6B3A1F]" />
                  </div>
                  <span className="text-sm text-gray-700">{builder.phone}</span>
                </a>
              )}
              {builder.email && (
                <a href={`mailto:${builder.email}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#6B3A1F]/10 flex items-center justify-center">
                    <MdEmail size={16} className="text-[#6B3A1F]" />
                  </div>
                  <span className="text-sm text-gray-700">{builder.email}</span>
                </a>
              )}
              {builder.website && (
                <a href={builder.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-[#6B3A1F]/10 flex items-center justify-center">
                    <MdLanguage size={16} className="text-[#6B3A1F]" />
                  </div>
                  <span className="text-sm text-gray-700">{builder.website}</span>
                </a>
              )}
              {!builder.phone && !builder.email && !builder.website && (
                <p className="text-sm text-[#A8978A] text-center py-4">No contact information available</p>
              )}
            </div>
          </div>

          {/* Builder Information Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#F0EAE2] bg-gradient-to-r from-[#FAF7F4] to-white">
              <h3 className="font-black text-sm text-[#1C0F05] uppercase tracking-wider flex items-center gap-2">
                <MdBusiness size={16} className="text-[#C9A84C]" />
                Builder Information
              </h3>
            </div>
            <div className="p-5">
              <InfoRow 
                label="Experience" 
                value={builder.experience || "—"} 
                icon={<MdBusiness size={14} />} 
              />
              <InfoRow 
                label="Total Projects" 
                value={totalProjects} 
                icon={<MdBusiness size={14} />} 
              />
              <InfoRow 
                label="Cities Present" 
                value={builder.citiesPresent?.join(", ") || "—"} 
                icon={<MdLocationCity size={14} />} 
              />
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#F0EAE2] bg-gradient-to-r from-[#FAF7F4] to-white">
              <h3 className="font-black text-sm text-[#1C0F05] uppercase tracking-wider flex items-center gap-2">
                <MdRefresh size={16} className="text-[#C9A84C]" />
                Quick Actions
              </h3>
            </div>
            <div className="p-5 space-y-3">
              <button
                onClick={() => navigate(`/builders/edit/${id}`)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F4] border border-[#EDE5DD] hover:border-[#6B3A1F] transition-all duration-200 group">
                <span className="text-sm font-medium text-[#1C0F05]">Edit Builder Details</span>
                <MdEdit size={16} className="text-[#A8978A] group-hover:text-[#6B3A1F] transition-colors" />
              </button>
              
              <button
                onClick={() => copyToClipboard(builder.slug)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#FAF7F4] border border-[#EDE5DD] hover:border-[#6B3A1F] transition-all duration-200 group">
                <span className="text-sm font-medium text-[#1C0F05]">Copy Slug</span>
                <MdContentCopy size={16} className="text-[#A8978A] group-hover:text-[#6B3A1F] transition-colors" />
              </button>

              <button
                onClick={() => navigate("/builders/add")}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white hover:shadow-lg transition-all duration-200 group">
                <span className="text-sm font-semibold">Add New Builder</span>
                <MdBusiness size={16} className="text-[#E8D5B0]" />
              </button>
            </div>
          </div>

          {/* System Info Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-[#F0EAE2] bg-gradient-to-r from-[#FAF7F4] to-white">
              <h3 className="font-black text-sm text-[#1C0F05] uppercase tracking-wider flex items-center gap-2">
                <MdPerson size={16} className="text-[#C9A84C]" />
                System Information
              </h3>
            </div>
            <div className="p-5">
              <InfoRow 
                label="Created By" 
                value={builder.createdBy?.name || "—"} 
                icon={<MdPerson size={14} />} 
              />
              <InfoRow 
                label="Created At" 
                value={builder.createdAt ? dayjs(builder.createdAt).format("DD MMM YYYY, hh:mm A") : "—"} 
                icon={<MdCalendarToday size={14} />} 
              />
              <InfoRow 
                label="Last Updated" 
                value={builder.updatedAt ? dayjs(builder.updatedAt).format("DD MMM YYYY, hh:mm A") : "—"} 
                icon={<MdRefresh size={14} />} 
              />
              <InfoRow 
                label="Slug" 
                value={builder.slug} 
                mono={true} 
                icon={<MdContentCopy size={14} />} 
              />
              <InfoRow 
                label="ID" 
                value={builder._id} 
                mono={true} 
                icon={<MdContentCopy size={14} />} 
              />
            </div>
          </div>

          {/* Copy ID Button */}
          <button
            onClick={() => copyToClipboard(builder._id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAF7F4] border border-dashed border-[#EDE5DD] text-xs text-[#A8978A] hover:border-[#6B3A1F] hover:text-[#6B3A1F] transition-all duration-200">
            <MdContentCopy size={14} />
            {copied ? "Copied!" : "Copy Builder ID"}
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EDE5DD]">
        <button 
          onClick={() => navigate("/builders")} 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#EDE5DD] text-[#6B3A1F] font-medium text-sm hover:bg-[#FAF7F4] hover:border-[#6B3A1F] transition-all duration-200">
          <MdArrowBack size={16} /> Back to All Builders
        </button>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(`/builders/edit/${id}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg transition-all duration-200">
            <MdEdit size={16} /> Edit Builder
          </button>
          <button 
            onClick={() => navigate("/builders/add")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#6B3A1F] text-[#6B3A1F] font-semibold text-sm hover:bg-[#6B3A1F] hover:text-white transition-all duration-200">
            <MdAdd size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDel && (
        <DeleteModal
          title="Delete Builder?"
          message={`Are you sure you want to delete "${builder.name}"? This action cannot be undone. All associated projects will lose this builder reference.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}