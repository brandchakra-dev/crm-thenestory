import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { videosApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { useToast, DeleteModal } from "../../components/nestory/index";
import { 
  MdEdit, MdDelete, MdArrowBack, MdPlayCircle, MdStar, 
  MdVisibility, MdAccessTime, MdCategory, MdLabel, 
  MdPerson, MdDateRange, MdCheckCircle, MdCancel,
  MdStarBorder, MdRefresh, MdShare, MdLink
} from "react-icons/md";
import { MdFingerprint, MdTag } from "react-icons/md";
import { FaYoutube } from "react-icons/fa";
import dayjs from "dayjs";

function InfoRow({ icon, label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#F0EAE2] last:border-0">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#6B3A1F]/8 text-[#6B3A1F]">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide">{label}</p>
        <p className={`text-sm text-[#1C0F05] ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-[#EDE5DD] p-3 text-center hover:shadow-md transition-all">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}>
        {icon}
      </div>
      <p className="text-lg font-black text-[#1C0F05]">{value}</p>
      <p className="text-[10px] font-semibold text-[#A8978A] uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default function VideoShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDel, setShowDel] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadVideo();
  }, [id]);

  const loadVideo = () => {
    setLoading(true);
    videosApi.get(id)
      .then(({ data }) => setVideo(data.video))
      .catch(() => toast("Failed to load video", "error"))
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    try {
      await videosApi.remove(id);
      toast("Video deleted successfully", "success");
      navigate("/videos");
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const copyToClipboard = () => {
    const url = `https://youtube.com/watch?v=${video.videoId}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
    toast("Link copied to clipboard", "success");
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || "0";
  };

  const categoryColors = {
    "Property Tour": "bg-blue-50 text-blue-700 border-blue-200",
    "Market Update": "bg-purple-50 text-purple-700 border-purple-200",
    "Investment Tips": "bg-amber-50 text-amber-700 border-amber-200",
    "Buyer's Guide": "bg-green-50 text-green-700 border-green-200",
    "News": "bg-red-50 text-red-700 border-red-200",
    "Other": "bg-gray-50 text-gray-600 border-gray-200",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <MdPlayCircle size={48} className="mb-3 opacity-20" />
        <p className="text-sm font-medium mb-4">Video not found</p>
        <button onClick={() => navigate("/videos")} className={CLS.btnSecondary}>
          <MdArrowBack size={16} /> Back to Videos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/videos")} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white transition-all"
          >
            <MdArrowBack size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl text-[#1C0F05]">{video.title}</h1>
              {video.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <MdStar size={10} /> Featured
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                video.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${video.isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                {video.isActive ? "Active" : "Inactive"}
              </span>
              {video.isEditorPick && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  ⭐ Editor Pick
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold ${categoryColors[video.category]}`}>
                {video.category}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadVideo} 
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white transition-all"
            title="Refresh"
          >
            <MdRefresh size={16} />
          </button>
          <button 
            onClick={() => navigate(`/videos/edit/${id}`)} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <MdEdit size={15} /> Edit
          </button>
          <button 
            onClick={() => setShowDel(true)} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 hover:border-red-300 transition-all"
          >
            <MdDelete size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatsCard 
          icon={<FaYoutube size={16} />} 
          label="Video ID" 
          value={video.videoId} 
          color="bg-red-50 text-red-500"
        />
        <StatsCard 
          icon={<MdVisibility size={16} />} 
          label="Total Views" 
          value={formatViews(video.views)} 
          color="bg-blue-50 text-blue-500"
        />
        <StatsCard 
          icon={<MdAccessTime size={16} />} 
          label="Duration" 
          value={video.duration || "—"} 
          color="bg-purple-50 text-purple-500"
        />
        <StatsCard 
          icon={<MdCategory size={16} />} 
          label="Category" 
          value={video.category} 
          color="bg-amber-50 text-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Video Player */}
        <div className="lg:col-span-2 space-y-5">
          {/* Video Player */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${video.videoId}`}
                title={video.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
                <p className="font-black text-xs text-[#6B3A1F] uppercase tracking-widest">Description</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-[#7A6858] leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-[#6B3A1F] uppercase tracking-widest">Share Video</p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`https://youtube.com/watch?v=${video.videoId}`}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm text-[#1C0F05] font-mono"
                />
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B3A1F] text-white font-semibold text-sm hover:bg-[#522C16] transition-all"
                >
                  <MdLink size={14} /> {copySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-4">

          {/* Video Information Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-[#6B3A1F] uppercase tracking-widest">Video Information</p>
            </div>
            <div className="p-4">
              <InfoRow 
                icon={<MdTag size={14} />} 
                label="YouTube ID" 
                value={video.videoId} 
                mono 
              />
              <InfoRow 
                icon={<MdAccessTime size={14} />} 
                label="Duration" 
                value={video.duration || "—"} 
              />
              <InfoRow 
                icon={<MdCategory size={14} />} 
                label="Category" 
                value={video.category} 
              />
              <InfoRow 
                icon={<MdVisibility size={14} />} 
                label="Views" 
                value={formatViews(video.views)} 
              />
              <InfoRow 
                icon={<MdDateRange size={14} />} 
                label="Published At" 
                value={video.publishedAt ? dayjs(video.publishedAt).format("DD MMM YYYY") : "—"} 
              />
              <InfoRow 
                icon={<MdStar size={14} />} 
                label="Sort Order" 
                value={video.sortOrder} 
              />
              {video.tags?.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <MdLabel size={14} className="text-[#6B3A1F]" />
                    <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide">Tags</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {video.tags.map((t, i) => (
                      <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6B3A1F]/10 text-[#6B3A1F]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Info Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-[#6B3A1F] uppercase tracking-widest">System Information</p>
            </div>
            <div className="p-4">
              <InfoRow 
                icon={<MdPerson size={14} />} 
                label="Created By" 
                value={video.createdBy?.name || "System"} 
              />
              <InfoRow 
                icon={<MdDateRange size={14} />} 
                label="Created At" 
                value={video.createdAt ? dayjs(video.createdAt).format("DD MMM YYYY, hh:mm A") : "—"} 
              />
              <InfoRow 
                icon={<MdDateRange size={14} />} 
                label="Updated At" 
                value={video.updatedAt ? dayjs(video.updatedAt).format("DD MMM YYYY, hh:mm A") : "—"} 
              />
              <InfoRow 
                icon={<MdTag size={14} />} 
                label="Database ID" 
                value={video._id} 
                mono 
              />
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-[#6B3A1F] uppercase tracking-widest">Status</p>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[#7A6858]">Active Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  video.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {video.isActive ? <MdCheckCircle size={12} /> : <MdCancel size={12} />}
                  {video.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[#7A6858]">Featured</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  video.isFeatured ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {video.isFeatured ? <MdStar size={12} /> : <MdStarBorder size={12} />}
                  {video.isFeatured ? "Featured" : "Not Featured"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-[#7A6858]">Editor's Pick</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  video.isEditorPick ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {video.isEditorPick ? "⭐ Yes" : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDel && (
        <DeleteModal
          title="Delete Video?"
          message={`Are you sure you want to delete "${video.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}