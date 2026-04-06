import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { citiesApi, buildFD } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, ImageUploader, useToast } from "../../components/nestory/index";

const BLANK = {
  name: "",
  slug: "",
  state: "Uttar Pradesh",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export default function CityEdit() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form,        setForm]       = useState({ ...BLANK });
  const [imageFile,   setImageFile]  = useState(null);
  const [existingImg, setExistingImg] = useState(null);
  const [saving,      setSaving]     = useState(false);
  const [loading,     setLoading]    = useState(true);

  useEffect(() => {
    citiesApi.get(id)
      .then(({ data }) => {
        const city = data.city;
        setForm({
          name: city.name || "",
          slug: city.slug || "",
          state: city.state || "Uttar Pradesh",
          description: city.description || "",
          sortOrder: city.sortOrder || 0,
          isActive: city.isActive !== false,
        });
        if (city.imageUrl) {
          setExistingImg({
            url: `${import.meta.env.VITE_API_URL}${city.imageUrl}`
          });
        }
      })
      .catch(() => toast("Failed to load city", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ FIX: Simplified set function
  const set = (k, v) => {
    console.log(`Setting ${k}:`, v); // Debug
    setForm(f => ({ ...f, [k]: v }));
  };

  const validate = () => {
    if (!form.name?.trim()) { 
      toast("City name is required", "error"); 
      return false; 
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
  
    try {
      const cleanForm = {
        name: form.name,
        slug: form.slug,
        state: form.state,
        description: form.description,
        sortOrder: parseInt(form.sortOrder) || 0,
        isActive: form.isActive === true,
      };
  
      const fd = new FormData();
      fd.append("data", JSON.stringify(cleanForm));
      
      // ✅ CASE 1: new image
      if (imageFile) {
        fd.append("image", imageFile);
      }
      
      // ✅ CASE 2: image removed
      if (!imageFile && !existingImg) {
        fd.append("removeImage", true);
      }
  
      await citiesApi.update(id, fd);
  
      toast("City updated successfully");
      navigate(`/cities/${id}`);
    } catch (e) {
      console.error(e);
      toast(e.response?.data?.message || "Update failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeExistingImage = async () => {
    try {
      await citiesApi.removeImage(id);
      setExistingImg(null);
      setImageFile(null);
      toast("Image removed");
    } catch {
      toast("Failed to remove image", "error");
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
        title="Edit City"
        subtitle={`ID: ${id}`}
        backPath={`/cities/${id}`}
        onSave={save}
        saving={saving}
        extra={
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input 
              type="checkbox" 
              checked={form.isActive}
              onChange={e => set("isActive", e.target.checked)}
              className="w-4 h-4 rounded accent-[#6B3A1F]"
            />
            Active
          </label>
        }
      />

      <div className={CLS.card + " p-5 sm:p-6"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City Name" required cls="sm:col-span-2">
            <input 
              value={form.name} 
              onChange={e => set("name", e.target.value)}
              placeholder="Noida" 
              className={inp}
            />
          </Field>

          <Field label="Slug">
            <input 
              value={form.slug} 
              onChange={e => set("slug", e.target.value)}
              placeholder="noida"
              className={inp + " font-mono text-xs"}
            />
          </Field>

          <Field label="State">
            <input 
              value={form.state} 
              onChange={e => set("state", e.target.value)}
              placeholder="Uttar Pradesh"
              className={inp}
            />
          </Field>

          <Field label="Sort Order">
            <input 
              type="number" 
              value={form.sortOrder} 
              onChange={e => set("sortOrder", e.target.value)}
              placeholder="0"
              className={inp}
            />
          </Field>

          <Field label="Description" cls="sm:col-span-2">
            <textarea 
              rows={3} 
              value={form.description || ""} // ✅ Ensure not undefined
              onChange={e => set("description", e.target.value)}
              placeholder="City description..."
              className={CLS.textarea}
            />
          </Field>

          <Field label="City Image" cls="sm:col-span-2">
            <ImageUploader
              existing={existingImg ? [existingImg] : []}
              newFiles={imageFile ? [imageFile] : []}
              onChange={files => setImageFile(files[0] || null)}
              onRemoveExisting={removeExistingImage}
              maxFiles={1}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD]">
        <p className="text-xs text-gray-400">Update city information</p>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/cities/${id}`)} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary}>
            {saving ? "Saving…" : "Update City"}
          </button>
        </div>
      </div>
    </div>
  );
}