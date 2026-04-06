import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectsApi, citiesApi, buildersApi, buildFD } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, TabBar, ImageUploader, useToast } from "../../components/nestory/index";
import { MdAdd, MdClose, MdDelete, MdLocationOn } from "react-icons/md";

// ── Constants (same as before)
const STATUSES   = ["New Launch","Ready To Move","Under Construction","Upcoming"];
const PROP_TYPES = ["Apartment","Villa","Builder Floor","Plot","Penthouse","Studio"];
const BHK_OPTS   = ["1 BHK","2 BHK","3 BHK","4 BHK","5 BHK","5+ BHK","Studio"];
const AMENITY_CATS = ["Recreation","Fitness","Social","Kids","Entertainment","Safety","Utilities","Wellness"];
const NEARBY_TYPES = ["Metro","Highway","Hospital","School","Mall","Airport","IT Hub","Park","Railway","Temple","Restaurant"];

const PRESET_AMENITIES = [
  { label:"Infinity Pool",    icon:"🏊", category:"Recreation"    },
  { label:"Sky Lounge",       icon:"🌆", category:"Recreation"    },
  { label:"Golf Simulator",   icon:"⛳", category:"Recreation"    },
  { label:"Swimming Pool",    icon:"🏊", category:"Recreation"    },
  { label:"Gymnasium",        icon:"💪", category:"Fitness"       },
  { label:"Yoga Deck",        icon:"🧘", category:"Fitness"       },
  { label:"Jogging Track",    icon:"🏃", category:"Fitness"       },
  { label:"Clubhouse",        icon:"🏛️", category:"Social"        },
  { label:"Co-working Space", icon:"💻", category:"Social"        },
  { label:"Banquet Hall",     icon:"🎊", category:"Social"        },
  { label:"Kids Play Area",   icon:"🎪", category:"Kids"          },
  { label:"Kids Pool",        icon:"🚿", category:"Kids"          },
  { label:"Mini Theatre",     icon:"🎬", category:"Entertainment" },
  { label:"Game Room",        icon:"🎮", category:"Entertainment" },
  { label:"24/7 Security",    icon:"🛡️", category:"Safety"        },
  { label:"CCTV",             icon:"📹", category:"Safety"        },
  { label:"Intercom",         icon:"📞", category:"Safety"        },
  { label:"Power Backup",     icon:"⚡", category:"Utilities"     },
  { label:"EV Charging",      icon:"🔋", category:"Utilities"     },
  { label:"Cafeteria",        icon:"☕", category:"Utilities"     },
  { label:"Laundry Service",  icon:"👕", category:"Utilities"     },
  { label:"Salon & Spa",      icon:"💆", category:"Wellness"      },
  { label:"Meditation Zone",  icon:"🧠", category:"Wellness"      },
];

const TABS = [
  { key:"basic",     label:"Basic Info"   },
  { key:"details",   label:"Details"      },
  { key:"images",    label:"Images"       },
  { key:"units",     label:"Floor Plans"  },
  { key:"amenities", label:"Amenities"    },
  { key:"nearby",    label:"Nearby"       },
  { key:"location",  label:"Map Location" },  // ✅ NEW TAB
  { key:"seo",       label:"SEO"          },
];

const BLANK = {
  title:"", slug:"", status:"New Launch", propertyType:"Apartment",
  location:"", address:"",
  mapLat:"", mapLng:"",  // ✅ NEW FIELDS
  priceMin:"", priceMax:"", priceLabel:"",
  bhk:[], totalUnits:"", totalTowers:"", totalFloors:"", totalArea:"",
  launchDate:"", possessionDate:"", possessionLabel:"",  // ✅ NEW FIELDS
  reraNo:"", reraApproved:false,
  description:"", highlights:[], amenities:[], nearby:[], units:[],
  isFeatured:false, isActive:true,
  builder:"", city:"",
  metaTitle:"", metaDescription:"", tags:[],
  rating:"",
};

export default function ProjectCreate() {
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [form,       setForm]      = useState({ ...BLANK });
  const [builders,   setBuilders]  = useState([]);
  const [cities,     setCities]    = useState([]);
  const [imageFiles, setImageFiles]= useState([]);
  const [floorFiles, setFloorFiles]= useState({});
  const [activeTab,  setActiveTab] = useState("basic");
  const [saving,     setSaving]    = useState(false);
  const [hlInput,    setHlInput]   = useState("");
  const [tagInput,   setTagInput]  = useState("");

  // Load dropdowns
  useEffect(() => {
    buildersApi.list().then(r => setBuilders(r.data.builders || []));
    citiesApi.list().then(r => setCities(r.data.cities || []));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = () => {
    if (!form.slug && form.title) {
      set("slug", form.title.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""));
    }
  };

  const toggleBhk = (b) =>
    set("bhk", form.bhk.includes(b) ? form.bhk.filter(x => x !== b) : [...form.bhk, b]);

  const toggleAmenity = (a) => {
    const exists = form.amenities.find(x => x.label === a.label);
    set("amenities", exists
      ? form.amenities.filter(x => x.label !== a.label)
      : [...form.amenities, a]);
  };

  const addHighlight = () => {
    if (hlInput.trim()) {
      set("highlights", [...form.highlights, hlInput.trim()]);
      setHlInput("");
    }
  };

  const addNearby    = () => set("nearby", [...form.nearby, { type:"Metro", name:"", dist:"", icon:"📍" }]);
  const updNearby    = (i, k, v) => { const a=[...form.nearby]; a[i]={...a[i],[k]:v}; set("nearby",a); };
  const delNearby    = (i) => set("nearby", form.nearby.filter((_,j) => j!==i));

  const addUnit      = () => set("units", [...form.units, { bhk:"", area:"", price:"", priceRaw:"", floors:"", floorPlan:null }]);
  const updUnit      = (i, k, v) => { const a=[...form.units]; a[i]={...a[i],[k]:v}; set("units",a); };
  const delUnit      = (i) => set("units", form.units.filter((_,j) => j!==i));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { set("tags", [...form.tags, t]); setTagInput(""); }
  };

  // ── Get current location for map
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast("Geolocation not supported", "error");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("mapLat", pos.coords.latitude.toFixed(6));
        set("mapLng", pos.coords.longitude.toFixed(6));
        toast("Location captured successfully");
      },
      () => toast("Failed to get location", "error")
    );
  };

  // ── Validate
  const validate = () => {
    if (!form.title?.trim())    { toast("Title is required", "error"); setActiveTab("basic"); return false; }
    if (!form.builder)           { toast("Please select a builder", "error"); setActiveTab("basic"); return false; }
    if (!form.city)              { toast("Please select a city", "error"); setActiveTab("basic"); return false; }
    if (!form.location?.trim()) { toast("Location is required", "error"); setActiveTab("basic"); return false; }
    if (!form.priceMin)          { toast("Min price is required", "error"); setActiveTab("details"); return false; }
    return true;
  };

  // ── Save
  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const files = { images: imageFiles };
      const fpArr = [];
      Object.entries(floorFiles).forEach(([i, file]) => { fpArr[Number(i)] = file; });
      if (fpArr.length) files.floorPlans = fpArr;

      const fd = buildFD(form, files);
      const { data } = await projectsApi.create(fd);
      toast("Project created successfully");
      navigate(`/nestory/projects/${data._id}`);
    } catch (e) {
      toast(e.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const inp = CLS.input;
  const lbl = CLS.label;

  return (
    <div className="max-w-4xl space-y-5 pb-6">

      {/* ── Page Header ── */}
      <FormHeader
        title="New Project"
        subtitle="Fill in all details to create a new project"
        backPath="/nestory/projects"
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
              <input type="checkbox" checked={form.isActive}
                onChange={e => set("isActive", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              Active
            </label>
          </div>
        }
      />

      {/* ── Tab Bar ── */}
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab}/>

      {/* ── Tab Content ── */}
      <div className={CLS.card + " p-5 sm:p-6"}>

        {/* ════ BASIC INFO ════ */}
        {activeTab === "basic" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Project Title" required cls="sm:col-span-2">
              <input value={form.title} onChange={e => set("title", e.target.value)}
                onBlur={autoSlug} placeholder="Dasnac Jewel of Noida" className={inp}/>
            </Field>

            <Field label="Slug" hint="Auto-generated from title if left blank">
              <input value={form.slug} onChange={e => set("slug", e.target.value)}
                placeholder="dasnac-jewel-of-noida" className={inp + " font-mono text-xs"}/>
            </Field>

            <Field label="Status" required>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={CLS.select}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>

            <Field label="Builder" required>
              <select value={form.builder} onChange={e => set("builder", e.target.value)} className={CLS.select}>
                <option value="">— Select Builder —</option>
                {builders.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </Field>

            <Field label="City" required>
              <select value={form.city} onChange={e => set("city", e.target.value)} className={CLS.select}>
                <option value="">— Select City —</option>
                {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </Field>

            <Field label="Property Type" required>
              <select value={form.propertyType} onChange={e => set("propertyType", e.target.value)} className={CLS.select}>
                {PROP_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="RERA Number">
              <input value={form.reraNo} onChange={e => set("reraNo", e.target.value)}
                placeholder="UPRERAPRJ12345" className={inp}/>
            </Field>

            <Field label="Location / Area" required cls="sm:col-span-2">
              <input value={form.location} onChange={e => set("location", e.target.value)}
                placeholder="Sector 75, Noida, Uttar Pradesh" className={inp}/>
            </Field>

            <Field label="Full Address" cls="sm:col-span-2">
              <input value={form.address} onChange={e => set("address", e.target.value)}
                placeholder="Complete postal address" className={inp}/>
            </Field>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.reraApproved}
                  onChange={e => set("reraApproved", e.target.checked)}
                  className="w-4 h-4 rounded accent-[#6B3A1F]"/>
                <span className="text-sm font-medium text-gray-700">RERA Approved</span>
              </label>
            </div>
          </div>
        )}

        {/* ════ DETAILS ════ */}
        {activeTab === "details" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Min Price (Cr)" required>
              <input type="number" step="0.01" value={form.priceMin}
                onChange={e => set("priceMin", e.target.value)} placeholder="1.89" className={inp}/>
            </Field>
            <Field label="Max Price (Cr)">
              <input type="number" step="0.01" value={form.priceMax}
                onChange={e => set("priceMax", e.target.value)} placeholder="12" className={inp}/>
            </Field>
            <Field label="Price Display Label">
              <input value={form.priceLabel} onChange={e => set("priceLabel", e.target.value)}
                placeholder="₹1.89 Cr – ₹12 Cr" className={inp}/>
            </Field>
            <Field label="Total Units">
              <input type="number" value={form.totalUnits}
                onChange={e => set("totalUnits", e.target.value)} placeholder="648" className={inp}/>
            </Field>
            <Field label="Total Towers">
              <input type="number" value={form.totalTowers}
                onChange={e => set("totalTowers", e.target.value)} placeholder="6" className={inp}/>
            </Field>
            <Field label="Total Floors">
              <input type="number" value={form.totalFloors}
                onChange={e => set("totalFloors", e.target.value)} placeholder="32" className={inp}/>
            </Field>
            <Field label="Total Area">
              <input value={form.totalArea} onChange={e => set("totalArea", e.target.value)}
                placeholder="12.5 Acres" className={inp}/>
            </Field>
            
            {/* ✅ NEW: Launch Date */}
            <Field label="Launch Date">
              <input type="date" value={form.launchDate}
                onChange={e => set("launchDate", e.target.value)} className={inp}/>
            </Field>
            
            {/* ✅ NEW: Possession Date */}
            <Field label="Possession Date">
              <input type="date" value={form.possessionDate}
                onChange={e => set("possessionDate", e.target.value)} className={inp}/>
            </Field>
            
            <Field label="Possession Label">
              <input value={form.possessionLabel} onChange={e => set("possessionLabel", e.target.value)}
                placeholder="December 2026" className={inp}/>
            </Field>
            
            <Field label="Rating (0–5)">
              <input type="number" step="0.1" min="0" max="5" value={form.rating}
                onChange={e => set("rating", e.target.value)} placeholder="4.8" className={inp}/>
            </Field>

            {/* BHK options */}
            <Field label="BHK Configurations" cls="sm:col-span-3">
              <div className="flex flex-wrap gap-2 mt-1">
                {BHK_OPTS.map(b => (
                  <button key={b} type="button" onClick={() => toggleBhk(b)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      form.bhk.includes(b)
                        ? "bg-[#1C0F05] text-[#E8D5B0] border-[#1C0F05]"
                        : "bg-white text-gray-600 border-[#EDE5DD] hover:border-[#6B3A1F]/40"
                    }`}>
                    {b}
                  </button>
                ))}
              </div>
            </Field>

            {/* Description */}
            <Field label="Description" cls="sm:col-span-3">
              <textarea rows={5} value={form.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Project description…" className={CLS.textarea}/>
            </Field>

            {/* Highlights */}
            <Field label="Key Highlights" cls="sm:col-span-3">
              <div className="flex gap-2 mb-2">
                <input value={hlInput} onChange={e => setHlInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addHighlight())}
                  placeholder="Type highlight and press Enter" className={inp + " flex-1"}/>
                <button type="button" onClick={addHighlight} className={CLS.btnSecondary + " !px-3"}>
                  <MdAdd size={16}/>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {form.highlights.map((h, i) => (
                  <span key={i}
                    className={CLS.badgeBrown + " cursor-pointer gap-1.5"}
                    onClick={() => set("highlights", form.highlights.filter((_,j) => j!==i))}>
                    {h} <MdClose size={10}/>
                  </span>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* ════ IMAGES ════ */}
        {activeTab === "images" && (
          <ImageUploader
            existing={[]}
            newFiles={imageFiles}
            onChange={setImageFiles}
          />
        )}

        {/* ════ FLOOR PLANS / UNITS ════ */}
        {activeTab === "units" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">
                Unit Configurations
                <span className="ml-2 text-xs font-normal text-gray-400">({form.units.length} added)</span>
              </p>
              <button onClick={addUnit} className={CLS.btnPrimary + " !py-2"}>
                <MdAdd size={15}/> Add Unit
              </button>
            </div>

            {form.units.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-[#EDE5DD] rounded-2xl">
                No unit configurations yet. Click "Add Unit" to start.
              </div>
            )}

            {form.units.map((unit, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border border-[#EDE5DD] bg-[#6B3A1F]/[0.02] relative">
                <button onClick={() => delUnit(i)}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                  <MdDelete size={14}/>
                </button>
                <Field label="BHK">
                  <input value={unit.bhk} onChange={e => updUnit(i,"bhk",e.target.value)}
                    placeholder="3 BHK" className={inp}/>
                </Field>
                <Field label="Area">
                  <input value={unit.area} onChange={e => updUnit(i,"area",e.target.value)}
                    placeholder="1850 sq.ft" className={inp}/>
                </Field>
                <Field label="Price">
                  <input value={unit.price} onChange={e => updUnit(i,"price",e.target.value)}
                    placeholder="₹1.89 Cr" className={inp}/>
                </Field>
                <Field label="Price in Cr">
                  <input type="number" step="0.01" value={unit.priceRaw}
                    onChange={e => updUnit(i,"priceRaw",e.target.value)}
                    placeholder="1.89" className={inp}/>
                </Field>
                <Field label="Floors">
                  <input value={unit.floors} onChange={e => updUnit(i,"floors",e.target.value)}
                    placeholder="3–20" className={inp}/>
                </Field>
                <Field label="Floor Plan (PDF / Image)" cls="sm:col-span-5">
                  <input type="file" accept=".pdf,image/*"
                    onChange={e => setFloorFiles(f => ({ ...f, [i]: e.target.files[0] }))}
                    className="text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-[#6B3A1F]/8 file:text-[#6B3A1F] file:font-semibold file:text-xs cursor-pointer"/>
                  {floorFiles[i] && (
                    <p className="text-xs text-emerald-600 mt-1">✓ {floorFiles[i].name}</p>
                  )}
                </Field>
              </div>
            ))}
          </div>
        )}

        {/* ════ AMENITIES ════ */}
        {activeTab === "amenities" && (
          <div className="space-y-5">
            <p className="text-sm font-semibold text-gray-500">
              {form.amenities.length} amenities selected
            </p>
            {AMENITY_CATS.map(cat => (
              <div key={cat}>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">{cat}</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMENITIES.filter(a => a.category === cat).map(a => {
                    const selected = form.amenities.some(x => x.label === a.label);
                    return (
                      <button key={a.label} type="button" onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                          selected
                            ? "bg-[#1C0F05] text-[#E8D5B0] border-[#1C0F05]"
                            : "bg-white text-gray-600 border-[#EDE5DD] hover:border-[#6B3A1F]/40"
                        }`}>
                        <span>{a.icon}</span>{a.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════ NEARBY ════ */}
        {activeTab === "nearby" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-gray-700">
                Nearby Locations
                <span className="ml-2 text-xs font-normal text-gray-400">({form.nearby.length} added)</span>
              </p>
              <button onClick={addNearby} className={CLS.btnPrimary + " !py-2"}>
                <MdAdd size={15}/> Add Location
              </button>
            </div>

            {form.nearby.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-[#EDE5DD] rounded-2xl">
                No nearby locations. Click "Add Location".
              </div>
            )}

            {form.nearby.map((n, i) => (
              <div key={i} className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-[#EDE5DD] bg-[#6B3A1F]/[0.02] relative">
                <button onClick={() => delNearby(i)}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-red-50 text-red-500">
                  <MdDelete size={14}/>
                </button>
                <Field label="Type">
                  <select value={n.type} onChange={e => updNearby(i,"type",e.target.value)} className={CLS.select}>
                    {NEARBY_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Name" cls="sm:col-span-2">
                  <input value={n.name} onChange={e => updNearby(i,"name",e.target.value)}
                    placeholder="Sector 76 Metro Station" className={inp}/>
                </Field>
                <Field label="Distance">
                  <input value={n.dist} onChange={e => updNearby(i,"dist",e.target.value)}
                    placeholder="0.8 km" className={inp}/>
                </Field>
                <Field label="Icon (emoji)">
                  <input value={n.icon} onChange={e => updNearby(i,"icon",e.target.value)}
                    placeholder="🚇" className={inp + " text-xl"}/>
                </Field>
              </div>
            ))}
          </div>
        )}

        {/* ════ MAP LOCATION (NEW TAB) ════ */}
        {activeTab === "location" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Map Coordinates</p>
              <button 
                type="button"
                onClick={getCurrentLocation}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                <MdLocationOn size={14}/> Get Current Location
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Latitude">
                <input type="number" step="any" value={form.mapLat}
                  onChange={e => set("mapLat", e.target.value)}
                  placeholder="28.5046" className={inp}/>
              </Field>
              <Field label="Longitude">
                <input type="number" step="any" value={form.mapLng}
                  onChange={e => set("mapLng", e.target.value)}
                  placeholder="77.4050" className={inp}/>
              </Field>
            </div>

            {/* Map preview placeholder */}
            {(form.mapLat && form.mapLng) && (
              <div className="mt-4 p-4 rounded-xl bg-gray-100 border border-[#EDE5DD]">
                <p className="text-xs text-gray-500 mb-2">Map Preview (Google Maps)</p>
                <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-400">
                    📍 {form.mapLat}, {form.mapLng}
                  </p>
                </div>
                <a 
                  href={`https://www.google.com/maps?q=${form.mapLat},${form.mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                  Open in Google Maps →
                </a>
              </div>
            )}
          </div>
        )}

        {/* ════ SEO ════ */}
        {activeTab === "seo" && (
          <div className="space-y-4">
            <Field label="Meta Title" hint={`${form.metaTitle?.length || 0} / 60 characters`}>
              <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)}
                maxLength={60} placeholder="SEO page title…" className={inp}/>
            </Field>
            <Field label="Meta Description" hint={`${form.metaDescription?.length || 0} / 160 characters`}>
              <textarea rows={3} value={form.metaDescription}
                onChange={e => set("metaDescription", e.target.value)}
                maxLength={160} placeholder="SEO page description…" className={CLS.textarea}/>
            </Field>
            <Field label="Tags">
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

            {/* Google preview */}
            {(form.metaTitle || form.metaDescription) && (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Google Preview
                </p>
                <p className="text-blue-700 text-sm font-medium">
                  {form.metaTitle || form.title || "Page Title"}
                </p>
                <p className="text-xs text-green-700 mb-1">
                  nestory.in › projects › {form.slug || "project-slug"}
                </p>
                <p className="text-xs text-gray-600">
                  {form.metaDescription || "Page description will appear here…"}
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Bottom save bar ── */}
      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD]">
        <p className="text-xs text-gray-400">
          Tab: <span className="font-semibold text-gray-600 capitalize">{activeTab}</span>
          {" · "}Fill all tabs before saving
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/nestory/projects")} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary}>
            {saving ? "Creating…" : "Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}