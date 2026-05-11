import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { blogsApi, buildFD } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, TabBar, ImageUploader, useToast } from "../../components/nestory/index";
import { MdAdd, MdClose } from "react-icons/md";

import AdvancedEditor from "../../components/editor/AdvancedEditor";

const CATEGORIES = ["News", "Tax & Legal", "Help Guides", "Investment", "Finance"];

const TABS = [
  { key: "content", label: "Content" },
  { key: "seo", label: "SEO" },
];

const BLANK = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "News",
  author: "The Nestory Team",
  tags: [],
  isPublished: false,
  isFeatured: false,
  metaTitle: "",
  metaDescription: "",
};

export default function BlogEdit() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form,        setForm]       = useState({ ...BLANK });
  const [coverFile,   setCoverFile]  = useState(null);
  const [existingCover, setExistingCover] = useState(null);
  const [activeTab,   setActiveTab]  = useState("content");
  const [saving,      setSaving]     = useState(false);
  const [loading,     setLoading]    = useState(true);
  const [tagInput,    setTagInput]   = useState("");

  useEffect(() => {
    blogsApi.get(id)
      .then(({ data }) => {
        const blog = data.blog;
        setForm({
          title: blog.title || "",
          slug: blog.slug || "",
          excerpt: blog.excerpt || "",
          content: blog.content || "",
          category: blog.category || "News",
          author: blog.author || "The Nestory Team",
          tags: blog.tags || [],
          isPublished: blog.isPublished || false,
          isFeatured: blog.isFeatured || false,
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
        });
        if (blog.coverImage?.url) {
          setExistingCover(blog.coverImage);
        }
      })
      .catch(() => toast("Failed to load blog post", "error"))
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

  const validate = () => {
    if (!form.title?.trim()) { toast("Title is required", "error"); return false; }
    if (!form.category) { toast("Category is required", "error"); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const files = coverFile ? { coverImage: coverFile } : {};
      const fd = buildFD(form, files);
      await blogsApi.update(id, fd);
      toast("Blog post updated successfully");
      navigate(`/blogs/${id}`);
    } catch (e) {
      toast(e.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeExistingCover = async () => {
    try {
      await blogsApi.removeCover(id);
      setExistingCover(null);
      toast("Cover image removed", "success");
    } catch {
      toast("Failed to remove cover image", "error");
    }
  };

  const inp = CLS.input;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin"/>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-5 pb-6">

      <FormHeader
        title="Edit Blog Post"
        subtitle={`ID: ${id}`}
        backPath={`/blogs/${id}`}
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
              <input type="checkbox" checked={form.isPublished}
                onChange={e => set("isPublished", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              Publish
            </label>
          </div>
        }
      />

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab}/>

      <div className={CLS.card + " p-5 sm:p-6"}>

        {activeTab === "content" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" required cls="sm:col-span-2">
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="10 Reasons to Invest in Noida" className={inp}/>
            </Field>

            <Field label="Slug">
              <input value={form.slug} onChange={e => set("slug", e.target.value)}
                className={inp + " font-mono text-xs"}/>
            </Field>

            <Field label="Category" required>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={CLS.select}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>

            <Field label="Author">
              <input value={form.author} onChange={e => set("author", e.target.value)}
                className={inp}/>
            </Field>

            <Field label="Excerpt" cls="sm:col-span-2">
              <textarea rows={2} value={form.excerpt}
                onChange={e => set("excerpt", e.target.value)}
                className={CLS.textarea}/>
            </Field>

            <Field label="Content" cls="sm:col-span-2">
              <AdvancedEditor
                  value={form.content}
                  onChange={(html) => set("content", html)}
                />
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

            <Field label="Cover Image" cls="sm:col-span-2">
              <ImageUploader
                existing={existingCover ? [existingCover] : []}
                newFiles={coverFile ? [coverFile] : []}
                onChange={files => setCoverFile(files[0] || null)}
                onRemoveExisting={removeExistingCover}
                maxFiles={1}
              />
            </Field>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="space-y-4">
            <Field label="Meta Title" hint={`${form.metaTitle?.length || 0} / 60 characters`}>
              <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)}
                maxLength={60} className={inp}/>
            </Field>
            <Field label="Meta Description" hint={`${form.metaDescription?.length || 0} / 160 characters`}>
              <textarea rows={3} value={form.metaDescription}
                onChange={e => set("metaDescription", e.target.value)}
                maxLength={160} className={CLS.textarea}/>
            </Field>

            {(form.metaTitle || form.metaDescription) && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">Google Preview</p>
                <p className="text-blue-700 text-sm font-medium">{form.metaTitle || form.title}</p>
                <p className="text-xs text-green-700 mb-1">nestory.in › blog › {form.slug}</p>
                <p className="text-xs text-gray-600">{form.metaDescription || form.excerpt}</p>
              </div>
            )}
          </div>
        )}

      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD]">
        <p className="text-xs text-gray-400">Update blog post information</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/blogs/${id}`)} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary}>
            {saving ? "Saving…" : "Update Post"}
          </button>
        </div>
      </div>
    </div>
  );
}