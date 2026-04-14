import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { videosApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, useToast } from "../../components/nestory/index";
import { MdAdd, MdClose, MdVideoLibrary } from "react-icons/md";

const CATEGORIES = ["Property Tour", "Market Update", "Investment Tips", "Buyer's Guide", "News", "Other"];
const BLANK = {
  title: "",
  videoId: "",
  description: "",
  category: "Other",
  duration: "",
  thumbnail: "",
  isEditorPick: false,
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
  tags: [],
};

export default function VideoEdit() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form,        setForm]       = useState({ ...BLANK });
  const [saving,      setSaving]     = useState(false);
  const [loading,     setLoading]    = useState(true);
  const [tagInput,    setTagInput]   = useState("");

  useEffect(() => {
    videosApi.get(id)
      .then(({ data }) => {
        const video = data.video;
        setForm({
          title: video.title || "",
          videoId: video.videoId || "",
          description: video.description || "",
          category: video.category || "Other",
          duration: video.duration || "",
          thumbnail: video.thumbnail || "",
          isEditorPick: video.isEditorPick || false,
          isFeatured: video.isFeatured || false,
          isActive: video.isActive !== false,
          sortOrder: video.sortOrder || 0,
          tags: video.tags || [],
        });
      })
      .catch(() => toast("Failed to load video", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      set("tags", [...form.tags, t]);
      setTagInput("");
    }
  };

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const handleVideoUrl = (url) => {
    const videoId = extractYouTubeId(url);
    set("videoId", videoId);
    set("thumbnail", `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
  };

  const validate = () => {
    if (!form.title?.trim()) { toast("Title is required", "error"); return false; }
    if (!form.videoId?.trim()) { toast("YouTube video ID is required", "error"); return false; }
        //  YouTube ID validation
        if (form.videoId.trim().length !== 11 && !form.videoId.includes('youtu')) {
          toast("Invalid YouTube URL or ID", "error");
          return false;
        }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await videosApi.update(id, form);
      toast("Video updated successfully");
      navigate(`/videos/${id}`);
    } catch (e) {
      toast(e.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const inp = CLS.input;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin"/>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-5 pb-6">

      <FormHeader
        title="Edit Video"
        subtitle={`ID: ${id}`}
        backPath={`/videos/${id}`}
        onSave={save}
        saving={saving}
        extra={
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured}
                onChange={e => set("isFeatured", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isEditorPick}
                onChange={e => set("isEditorPick", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              Editor Pick
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={e => set("isActive", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              Active
            </label>
          </div>
        }
      />

      <div className={CLS.card + " p-5 sm:p-6"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" required cls="sm:col-span-2">
            <input value={form.title} onChange={e => set("title", e.target.value)}
              className={inp}/>
          </Field>

          <Field label="YouTube URL / Video ID" required>
            <input value={form.videoId} onChange={e => handleVideoUrl(e.target.value)}
              className={inp + " font-mono text-xs"}/>
          </Field>

          <Field label="Duration">
            <input value={form.duration} onChange={e => set("duration", e.target.value)}
              className={inp}/>
          </Field>

          <Field label="Sort Order">
            <input type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)}
              className={inp}/>
          </Field>

          <Field label="Category">
            <select value={form.category} onChange={e => set("category", e.target.value)} className={CLS.select}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="Thumbnail URL" cls="sm:col-span-2">
            <input value={form.thumbnail} onChange={e => set("thumbnail", e.target.value)}
              className={inp}/>
          </Field>

          <Field label="Description" cls="sm:col-span-2">
            <textarea rows={4} value={form.description}
              onChange={e => set("description", e.target.value)}
              className={CLS.textarea}/>
          </Field>

          <Field label="Tags" cls="sm:col-span-2">
            <div className="flex gap-2 mb-2">
              <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Type tag and press Enter" className={inp + " flex-1"}/>
              <button type="button" onClick={addTag} className={CLS.btnSecondary + " !px-3"}>
                <MdAdd size={16}/>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((t, i) => (
                <span key={i}
                  className={CLS.badgeBrown + " cursor-pointer gap-1.5"}
                  onClick={() => set("tags", form.tags.filter((_,j)=>j!==i))}>
                  {t} <MdClose size={10}/>
                </span>
              ))}
            </div>
          </Field>

          {form.videoId && (
            <div className="sm:col-span-2 mt-2 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <MdVideoLibrary size={14}/> Preview
              </p>
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${form.videoId}`}
                  title={form.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD]">
        <p className="text-xs text-gray-400">Update video information</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/videos/${id}`)} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary}>
            {saving ? "Saving…" : "Update Video"}
          </button>
        </div>
      </div>
    </div>
  );
}