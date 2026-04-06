import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { videosApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { useToast, DeleteModal } from "../../components/nestory/index";
import { MdEdit, MdDelete, MdArrowBack, MdPlayCircle, MdStar, MdSchedule } from "react-icons/md";
import dayjs from "dayjs";

function InfoRow({ label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F7F3EF] last:border-0">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className={`text-sm text-gray-800 flex-1 ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

export default function VideoShow() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [video,     setVideo]    = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [showDel,   setShowDel]  = useState(false);

  useEffect(() => {
    videosApi.get(id)
      .then(({ data }) => setVideo(data.video))
      .catch(() => toast("Failed to load video", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await videosApi.remove(id);
      toast("Video deleted");
      navigate("/nestory/videos");
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const categoryColors = {
    "Property Tour": "bg-blue-50 text-blue-700 border-blue-200",
    "Market Update": "bg-purple-50 text-purple-700 border-purple-200",
    "Investment Tips": "bg-amber-50 text-amber-700 border-amber-200",
    "Buyer's Guide": "bg-green-50 text-green-700 border-green-200",
    "News": "bg-red-50 text-red-700 border-red-200",
    "Other": "bg-gray-50 text-gray-600 border-gray-200",
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin"/>
    </div>
  );

  if (!video) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <MdPlayCircle size={44} className="mb-3 opacity-20"/>
      <p className="text-sm font-medium mb-4">Video not found</p>
      <button onClick={() => navigate("/nestory/videos")} className={CLS.btnSecondary}>
        <MdArrowBack size={16}/> Back to Videos
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5 pb-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate("/nestory/videos")} className={CLS.btnSecondary + " !px-2.5 !py-2.5 mt-0.5"}>
            <MdArrowBack size={18}/>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 leading-tight">{video.title}</h1>
              {video.isFeatured && (
                <span className={CLS.badgeAmber + " flex items-center gap-1"}>
                  <MdStar size={10}/> Featured
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                video.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${video.isActive ? "bg-emerald-500" : "bg-gray-400"}`}/>
                {video.isActive ? "Active" : "Inactive"}
              </span>
              {video.isEditorPick && (
                <span className={CLS.badgeAmber + " flex items-center gap-1"}>
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
          <button onClick={() => navigate(`/nestory/videos/edit/${id}`)} className={CLS.btnPrimary}>
            <MdEdit size={15}/> Edit
          </button>
          <button onClick={() => setShowDel(true)} className={CLS.btnDanger}>
            <MdDelete size={15}/> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-5">

          <div className={CLS.card + " overflow-hidden"}>
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

          {video.description && (
            <div className={CLS.card + " overflow-hidden"}>
              <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
                <p className="font-black text-xs text-gray-600 uppercase tracking-widest">Description</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {video.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">

          <div className={CLS.card + " overflow-hidden"}>
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-gray-600 uppercase tracking-widest">Video Information</p>
            </div>
            <div className="p-5">
              <InfoRow label="YouTube ID" value={video.videoId} mono />
              <InfoRow label="Duration" value={video.duration} />
              <InfoRow label="Category" value={video.category} />
              <InfoRow label="Views" value={video.views || 0} />
              <InfoRow label="Published At" value={video.publishedAt ? dayjs(video.publishedAt).format("DD MMM YYYY") : "—"} />
              <InfoRow label="Sort Order" value={video.sortOrder} />
              {video.tags?.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {video.tags.map((t, i) => (
                      <span key={i} className={CLS.badgeBrown}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={CLS.card + " overflow-hidden"}>
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-gray-600 uppercase tracking-widest">System Info</p>
            </div>
            <div className="p-5">
              <InfoRow label="Created By" value={video.createdBy?.name} />
              <InfoRow label="Created" value={video.createdAt ? dayjs(video.createdAt).format("DD MMM YYYY") : null} />
              <InfoRow label="Updated" value={video.updatedAt ? dayjs(video.updatedAt).format("DD MMM YYYY") : null} />
              <InfoRow label="ID" value={video._id} mono />
            </div>
          </div>

        </div>
      </div>

      {showDel && (
        <DeleteModal
          title="Delete Video?"
          message={`Are you sure you want to delete "${video.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}