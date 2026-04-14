import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildersApi, buildFD } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, ImageUploader, useToast } from "../../components/nestory/index";
import { 
 MdImage, MdStar, MdPhone, 
  MdEmail, MdLanguage, MdBusiness, MdLocationCity,  MdCheckCircle
} from "react-icons/md";

const BLANK = {
  name: "",
  slug: "",
  description: "",
  experience: "",
  totalProjects: "",
  citiesPresent: [],
  website: "",
  phone: "",
  email: "",
  isActive: true,
  isFeatured: false,
};

export default function BuilderCreate() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form,       setForm]      = useState({ ...BLANK });
  const [logoFile,   setLogoFile]  = useState(null);
  const [cityInput,  setCityInput] = useState("");
  const [saving,     setSaving]    = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = () => {
    if (!form.slug && form.name) {
      set("slug", form.name.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""));
    }
  };

  const addCity = () => {
    const city = cityInput.trim();
    if (city && !form.citiesPresent.includes(city)) {
      set("citiesPresent", [...form.citiesPresent, city]);
      setCityInput("");
    }
  };

  const removeCity = (cityToRemove) => {
    set("citiesPresent", form.citiesPresent.filter(c => c !== cityToRemove));
  };

  const validate = () => {
    if (!form.name?.trim()) { toast("Builder name is required", "error"); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const files = logoFile ? { logo: logoFile } : {};
      const fd = buildFD(form, files);
      await buildersApi.create(fd);
      toast("Builder created successfully", "success");
      navigate("/builders");
    } catch (e) {
      toast(e.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const inp = CLS.input;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">

      <FormHeader
        title="New Builder"
        subtitle="Add a new builder/developer to the system"
        backPath="/builders"
        onSave={save}
        saving={saving}
        extra={
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured}
                onChange={e => set("isFeatured", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              <MdStar size={14} className="text-amber-500" /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={e => set("isActive", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              <MdCheckCircle size={14} className="text-emerald-500" /> Active
            </label>
          </div>
        }
      />

      <div className="bg-white rounded-2xl border border-[#EDE5DD] shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">
          
          {/* Basic Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
              <MdBusiness size={18} className="text-[#6B3A1F]" />
              <h3 className="font-display font-bold text-lg text-[#1C0F05]">Basic Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Builder Name" required cls="sm:col-span-2">
                <input value={form.name} onChange={e => set("name", e.target.value)}
                  onBlur={autoSlug} placeholder="Godrej Properties" 
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm focus:outline-none focus:border-[#6B3A1F] focus:ring-2 focus:ring-[#6B3A1F]/15 transition-all"/>
              </Field>

              <Field label="Slug" hint="Auto-generated from name if left blank">
                <input value={form.slug} onChange={e => set("slug", e.target.value)}
                  placeholder="godrej-properties" 
                  className="w-full px-4 py-2.5 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm font-mono focus:outline-none focus:border-[#6B3A1F] transition-all"/>
              </Field>

              <Field label="Experience">
                <input value={form.experience} onChange={e => set("experience", e.target.value)}
                  placeholder="25+ years" className={inp}/>
              </Field>

              <Field label="Total Projects">
                <input type="number" value={form.totalProjects} onChange={e => set("totalProjects", e.target.value)}
                  placeholder="100+" className={inp}/>
              </Field>
            </div>
          </div>

          {/* Contact Information Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
              <MdPhone size={18} className="text-[#6B3A1F]" />
              <h3 className="font-display font-bold text-lg text-[#1C0F05]">Contact Information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Phone">
                <div className="relative">
                  <MdPhone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8978A]" />
                  <input value={form.phone} onChange={e => set("phone", e.target.value)}
                    placeholder="+91 99999 99999" className={inp + " pl-10"}/>
                </div>
              </Field>

              <Field label="Email">
                <div className="relative">
                  <MdEmail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8978A]" />
                  <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                    placeholder="contact@builder.com" className={inp + " pl-10"}/>
                </div>
              </Field>

              <Field label="Website" cls="sm:col-span-2">
                <div className="relative">
                  <MdLanguage size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8978A]" />
                  <input value={form.website} onChange={e => set("website", e.target.value)}
                    placeholder="https://www.builder.com" className={inp + " pl-10"}/>
                </div>
              </Field>
            </div>
          </div>

          {/* Cities Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
              <MdLocationCity size={18} className="text-[#6B3A1F]" />
              <h3 className="font-display font-bold text-lg text-[#1C0F05]">Cities Present</h3>
            </div>
            <Field label="Cities Present" cls="sm:col-span-2">
              <div className="flex gap-2 mb-3">
                <input value={cityInput} onChange={e => setCityInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCity())}
                  placeholder="Type city name and press Enter" 
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm focus:outline-none focus:border-[#6B3A1F] transition-all"/>
                <button type="button" onClick={addCity} 
                  className="px-4 py-2 rounded-xl bg-[#6B3A1F]/10 text-[#6B3A1F] font-semibold text-sm hover:bg-[#6B3A1F]/20 transition-all">
                  Add City
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.citiesPresent.map((city, i) => (
                  <span key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6B3A1F]/8 text-[#6B3A1F] text-xs font-medium cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all group"
                    onClick={() => removeCity(city)}>
                    {city}
                    <span className="text-[#A8978A] group-hover:text-red-500">✕</span>
                  </span>
                ))}
              </div>
            </Field>
          </div>

          {/* Description Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
              <MdBusiness size={18} className="text-[#6B3A1F]" />
              <h3 className="font-display font-bold text-lg text-[#1C0F05]">Description</h3>
            </div>
            <Field label="Description" cls="sm:col-span-2">
              <textarea rows={4} value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Builder description..." 
                className="w-full px-4 py-2.5 rounded-xl border border-[#EDE5DD] bg-[#FAF7F4] text-sm focus:outline-none focus:border-[#6B3A1F] transition-all resize-none"/>
            </Field>
          </div>

          {/* Logo Section */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
              <MdImage size={18} className="text-[#6B3A1F]" />
              <h3 className="font-display font-bold text-lg text-[#1C0F05]">Logo</h3>
            </div>
            <Field label="Logo" cls="sm:col-span-2">
              <ImageUploader
                existing={[]}
                newFiles={logoFile ? [logoFile] : []}
                onChange={files => setLogoFile(files[0] || null)}
                maxFiles={1}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD] shadow-sm">
        <p className="text-xs text-gray-400">Fill all required fields before saving</p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/builders")} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary + " px-6"}>
            {saving ? "Creating..." : "Create Builder"}
          </button>
        </div>
      </div>
    </div>
  );
}