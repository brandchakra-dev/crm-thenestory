import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function CityCreate() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form,       setForm]      = useState({ ...BLANK });
  const [imageFile,  setImageFile] = useState(null);
  const [saving,     setSaving]    = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = () => {
    if (!form.slug && form.name) {
      set("slug", form.name.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""));
    }
  };

  const validate = () => {
    if (!form.name?.trim()) { toast("City name is required", "error"); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const files = imageFile ? { image: imageFile } : {};
      const fd = buildFD(form, files);
      await citiesApi.create(fd);
      toast("City created successfully");
      navigate("/cities");
    } catch (e) {
      toast(e.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const inp = CLS.input;

  return (
    <div className="max-w-3xl space-y-5 pb-6">

      <FormHeader
        title="New City"
        subtitle="Add a new city to the system"
        backPath="/nestory/cities"
        onSave={save}
        saving={saving}
        extra={
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.isActive}
              onChange={e => set("isActive", e.target.checked)}
              className="w-4 h-4 rounded accent-[#6B3A1F]"/>
            Active
          </label>
        }
      />

      <div className={CLS.card + " p-5 sm:p-6"}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City Name" required cls="sm:col-span-2">
            <input value={form.name} onChange={e => set("name", e.target.value)}
              onBlur={autoSlug} placeholder="Noida" className={inp}/>
          </Field>

          <Field label="Slug" hint="Auto-generated from name if left blank">
            <input value={form.slug} onChange={e => set("slug", e.target.value)}
              placeholder="noida" className={inp + " font-mono text-xs"}/>
          </Field>

          <Field label="State">
            <input value={form.state} onChange={e => set("state", e.target.value)}
              placeholder="Uttar Pradesh" className={inp}/>
          </Field>

          <Field label="Sort Order">
            <input type="number" value={form.sortOrder} onChange={e => set("sortOrder", e.target.value)}
              placeholder="0" className={inp}/>
          </Field>

          <Field label="Description" cls="sm:col-span-2">
            <textarea rows={3} value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="City description..." className={CLS.textarea}/>
          </Field>

          <Field label="City Image" cls="sm:col-span-2">
            <ImageUploader
              existing={[]}
              newFiles={imageFile ? [imageFile] : []}
              onChange={files => setImageFile(files[0] || null)}
              maxFiles={1}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD]">
        <p className="text-xs text-gray-400">Fill all required fields before saving</p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/cities")} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary}>
            {saving ? "Creating…" : "Create City"}
          </button>
        </div>
      </div>
    </div>
  );
}