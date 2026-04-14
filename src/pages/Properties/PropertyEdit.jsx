import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertiesApi, citiesApi, buildFD } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, TabBar, ImageUploader, useToast } from "../../components/nestory/index";
import { 
  MdAdd, MdClose, MdDelete, MdLocationOn, MdHome, MdAttachMoney, 
  MdStar, MdCheckCircle, MdImage, MdInfo, MdLink, MdMap,
  MdApartment, MdPark, MdBusiness, MdVerified
} from "react-icons/md";

// Same constants as Create
const CATEGORIES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
];

const SUB_CATEGORIES = {
  residential: ["apartment", "villa", "builder-floor", "plot", "penthouse", "studio"],
  commercial: ["office-space", "retail-shop", "coworking", "showroom"],
  industrial: ["warehouse", "factory", "logistics", "industrial-plot"],
};

const LISTING_TYPES = ["sale", "rent", "lease"];
const FURNISHED_OPTIONS = ["furnished", "semi-furnished", "unfurnished"];
const FACING_OPTIONS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const AGE_OPTIONS = ["0-1 year", "1-5 years", "5-10 years", "10+ years"];

const AMENITIES = [
  { key: "swimmingPool", label: "Swimming Pool", icon: "🏊" },
  { key: "gym", label: "Gym", icon: "💪" },
  { key: "security", label: "24/7 Security", icon: "🛡️" },
  { key: "powerBackup", label: "Power Backup", icon: "⚡" },
  { key: "lift", label: "Lift/Elevator", icon: "🛗" },
  { key: "park", label: "Park/Garden", icon: "🌳" },
  { key: "clubhouse", label: "Clubhouse", icon: "🏛️" },
  { key: "kidsPlayArea", label: "Kids Play Area", icon: "🎪" },
  { key: "joggingTrack", label: "Jogging Track", icon: "🏃" },
  { key: "rainwaterHarvesting", label: "Rainwater Harvesting", icon: "💧" },
  { key: "vaastuCompliant", label: "Vaastu Compliant", icon: "🧭" },
];

const NEARBY_TYPES = ["School", "Hospital", "Metro Station", "Bus Stop", "Market", "Mall", "Park", "Temple", "Airport", "Railway Station"];

const TABS = [
  { key: "basic", label: "Basic Info", icon: <MdInfo size={14} /> },
  { key: "details", label: "Details", icon: <MdHome size={14} /> },
  { key: "pricing", label: "Pricing", icon: <MdAttachMoney size={14} /> },
  { key: "images", label: "Images", icon: <MdImage size={14} /> },
  { key: "amenities", label: "Amenities", icon: <MdPark size={14} /> },
  { key: "nearby", label: "Nearby", icon: <MdLocationOn size={14} /> },
  { key: "location", label: "Location", icon: <MdMap size={14} /> },
  { key: "owner", label: "Owner", icon: <MdBusiness size={14} /> },
  { key: "seo", label: "SEO", icon: <MdLink size={14} /> },
];

const BLANK = {
  title: "", slug: "", category: "residential", subCategory: "apartment",
  listingType: "sale", bedrooms: 0, bathrooms: 0, area: "", areaUnit: "sq.ft",
  floor: "", totalFloors: "", facing: "", price: "", priceLabel: "",
  securityDeposit: "", maintenance: "", location: "", address: "",
  city: "", landmark: "", mapLat: "", mapLng: "", owner: "", ownerType: "owner",
  ownerPhone: "", ownerEmail: "", furnished: "unfurnished", parking: false,
  parkingCount: 0, ageOfProperty: "", description: "", highlights: [],
  amenities: {}, nearby: [], isFeatured: false, isActive: true, isVerified: false,
  availableFrom: "", metaTitle: "", metaDescription: "", tags: [],
};

export default function PropertyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ ...BLANK });
  const [cities, setCities] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImgs, setExistingImgs] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hlInput, setHlInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    Promise.all([
      citiesApi.list(),
      propertiesApi.get(id),
    ]).then(([cRes, pRes]) => {
      setCities(cRes.data.cities || []);
      const p = pRes.data.property;
      
      const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toISOString().split("T")[0];
      };

      // Initialize amenities as object
      const amenitiesObj = {};
      AMENITIES.forEach(a => {
        amenitiesObj[a.key] = p.amenities?.[a.key] || false;
      });

      setForm({
        ...BLANK,
        ...p,
        city: p.city?._id || p.city || "",
        amenities: amenitiesObj,
        nearby: p.nearby || [],
        highlights: p.highlights || [],
        tags: p.tags || [],
        availableFrom: formatDate(p.availableFrom),
      });
      setExistingImgs(p.images?.filter(i => i.url || i._id) || []);
    }).catch(() => {
      toast("Failed to load property", "error");
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleAmenity = (key) => {
    set("amenities", { ...form.amenities, [key]: !form.amenities[key] });
  };

  const addHighlight = () => {
    if (hlInput.trim()) {
      set("highlights", [...form.highlights, hlInput.trim()]);
      setHlInput("");
    }
  };

  const addNearby = () => set("nearby", [...form.nearby, { type: "School", name: "", distance: "" }]);
  const updNearby = (i, k, v) => { const a = [...form.nearby]; a[i] = { ...a[i], [k]: v }; set("nearby", a); };
  const delNearby = (i) => set("nearby", form.nearby.filter((_, j) => j !== i));

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) { set("tags", [...form.tags, t]); setTagInput(""); }
  };

  const removeExistingImg = async (imgId) => {
    try {
      await propertiesApi.removeImage(id, imgId);
      setExistingImgs(imgs => imgs.filter(i => i._id !== imgId));
      toast("Image removed");
    } catch {
      toast("Failed to remove image", "error");
    }
  };

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

  const validate = () => {
    if (!form.title?.trim()) { toast("Title is required", "error"); setActiveTab("basic"); return false; }
    if (!form.category) { toast("Category is required", "error"); setActiveTab("basic"); return false; }
    if (!form.subCategory) { toast("Sub-category is required", "error"); setActiveTab("basic"); return false; }
    if (!form.listingType) { toast("Listing type is required", "error"); setActiveTab("basic"); return false; }
    if (!form.city) { toast("City is required", "error"); setActiveTab("basic"); return false; }
    if (!form.location?.trim()) { toast("Location is required", "error"); setActiveTab("basic"); return false; }
    if (!form.price) { toast("Price is required", "error"); setActiveTab("pricing"); return false; }
    if (!form.area) { toast("Area is required", "error"); setActiveTab("details"); return false; }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const cleanForm = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        subCategory: form.subCategory,
        listingType: form.listingType,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        area: parseFloat(form.area) || 0,
        areaUnit: form.areaUnit,
        floor: form.floor,
        totalFloors: parseInt(form.totalFloors) || 0,
        facing: form.facing,
        price: parseFloat(form.price) || 0,
        priceLabel: form.priceLabel,
        securityDeposit: parseFloat(form.securityDeposit) || 0,
        maintenance: parseFloat(form.maintenance) || 0,
        location: form.location,
        address: form.address,
        city: form.city,
        landmark: form.landmark,
        mapLat: form.mapLat,
        mapLng: form.mapLng,
        owner: form.owner,
        ownerType: form.ownerType,
        ownerPhone: form.ownerPhone,
        ownerEmail: form.ownerEmail,
        furnished: form.furnished,
        parking: form.parking === true,
        parkingCount: parseInt(form.parkingCount) || 0,
        ageOfProperty: form.ageOfProperty,
        description: form.description,
        highlights: form.highlights,
        amenities: form.amenities,
        nearby: form.nearby,
        isFeatured: form.isFeatured === true,
        isActive: form.isActive === true,
        isVerified: form.isVerified === true,
        availableFrom: form.availableFrom || null,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
        tags: form.tags,
      };
      
      const fd = new FormData();
      fd.append("data", JSON.stringify(cleanForm));
      
      if (imageFiles && imageFiles.length > 0) {
        imageFiles.forEach(file => {
          fd.append("images", file);
        });
      }
      
      await propertiesApi.update(id, fd);
      toast("Property updated successfully");
      navigate(`/properties/${id}`);
    } catch (e) {
      console.error(e);
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
    <div className="max-w-4xl mx-auto space-y-6 pb-8">

      <FormHeader
        title="Edit Property"
        subtitle={`ID: ${id}`}
        backPath={`/properties/${id}`}
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
              <input type="checkbox" checked={form.isVerified}
                onChange={e => set("isVerified", e.target.checked)}
                className="w-4 h-4 rounded accent-[#6B3A1F]"/>
              <MdVerified size={14} className="text-emerald-500" /> Verified
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

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab}/>

      <div className="bg-white rounded-2xl border border-[#EDE5DD] shadow-sm overflow-hidden">
        <div className="p-6 space-y-6">

          {/* Basic Information - Same as Create but with values */}
          {activeTab === "basic" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdInfo size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Property Title" required cls="sm:col-span-2">
                  <input value={form.title} onChange={e => set("title", e.target.value)} className={inp}/>
                </Field>
                <Field label="Slug">
                  <input value={form.slug} onChange={e => set("slug", e.target.value)} className={inp + " font-mono text-xs"}/>
                </Field>
                <Field label="Category" required>
                  <select value={form.category} onChange={e => {
                    set("category", e.target.value);
                    const subs = SUB_CATEGORIES[e.target.value];
                    if (subs?.length) set("subCategory", subs[0]);
                  }} className={CLS.select}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>
                <Field label="Sub Category" required>
                  <select value={form.subCategory} onChange={e => set("subCategory", e.target.value)} className={CLS.select}>
                    {SUB_CATEGORIES[form.category]?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Listing Type" required>
                  <select value={form.listingType} onChange={e => set("listingType", e.target.value)} className={CLS.select}>
                    {LISTING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="City" required>
                  <select value={form.city} onChange={e => set("city", e.target.value)} className={CLS.select}>
                    <option value="">— Select City —</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Location / Area" required cls="sm:col-span-2">
                  <input value={form.location} onChange={e => set("location", e.target.value)} className={inp}/>
                </Field>
                <Field label="Full Address" cls="sm:col-span-2">
                  <input value={form.address} onChange={e => set("address", e.target.value)} className={inp}/>
                </Field>
                <Field label="Landmark">
                  <input value={form.landmark} onChange={e => set("landmark", e.target.value)} className={inp}/>
                </Field>
              </div>
            </div>
          )}

          {/* Details Section */}
          {activeTab === "details" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdHome size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Property Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Bedrooms">
                  <input type="number" min="0" value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} className={inp}/>
                </Field>
                <Field label="Bathrooms">
                  <input type="number" min="0" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} className={inp}/>
                </Field>
                <Field label="Area (sq.ft)" required>
                  <input type="number" min="0" value={form.area} onChange={e => set("area", e.target.value)} className={inp}/>
                </Field>
                <Field label="Floor">
                  <input value={form.floor} onChange={e => set("floor", e.target.value)} className={inp}/>
                </Field>
                <Field label="Total Floors">
                  <input type="number" value={form.totalFloors} onChange={e => set("totalFloors", e.target.value)} className={inp}/>
                </Field>
                <Field label="Facing">
                  <select value={form.facing} onChange={e => set("facing", e.target.value)} className={CLS.select}>
                    <option value="">Select Facing</option>
                    {FACING_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Furnished Status">
                  <select value={form.furnished} onChange={e => set("furnished", e.target.value)} className={CLS.select}>
                    {FURNISHED_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Parking">
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.parking} onChange={e => set("parking", e.target.checked)} className="w-4 h-4 rounded"/>
                      <span>Available</span>
                    </label>
                    {form.parking && (
                      <input type="number" min="0" value={form.parkingCount} onChange={e => set("parkingCount", e.target.value)} className={inp + " w-24"}/>
                    )}
                  </div>
                </Field>
                <Field label="Age of Property">
                  <select value={form.ageOfProperty} onChange={e => set("ageOfProperty", e.target.value)} className={CLS.select}>
                    <option value="">Select Age</option>
                    {AGE_OPTIONS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Description" cls="sm:col-span-3">
                  <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)} className={CLS.textarea}/>
                </Field>
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
                      <span key={i} className={CLS.badgeBrown + " cursor-pointer gap-1.5"}
                        onClick={() => set("highlights", form.highlights.filter((_,j) => j!==i))}>
                        {h} <MdClose size={10}/>
                      </span>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Pricing Section */}
          {activeTab === "pricing" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdAttachMoney size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Pricing Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Price (₹)" required>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8978A]">₹</span>
                    <input type="number" value={form.price} onChange={e => set("price", e.target.value)} className={inp + " pl-8"}/>
                  </div>
                </Field>
                <Field label="Price Display Label">
                  <input value={form.priceLabel} onChange={e => set("priceLabel", e.target.value)} className={inp}/>
                </Field>
                {(form.listingType === "rent" || form.listingType === "lease") && (
                  <>
                    <Field label="Security Deposit (₹)">
                      <input type="number" value={form.securityDeposit} onChange={e => set("securityDeposit", e.target.value)} className={inp}/>
                    </Field>
                    <Field label="Maintenance (₹/month)">
                      <input type="number" value={form.maintenance} onChange={e => set("maintenance", e.target.value)} className={inp}/>
                    </Field>
                    <Field label="Available From">
                      <input type="date" value={form.availableFrom} onChange={e => set("availableFrom", e.target.value)} className={inp}/>
                    </Field>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Images Section */}
          {activeTab === "images" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdImage size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Property Images</h3>
              </div>
              <ImageUploader
                existing={existingImgs}
                newFiles={imageFiles}
                onChange={setImageFiles}
                onRemoveExisting={removeExistingImg}
              />
            </div>
          )}

          {/* Amenities Section */}
          {activeTab === "amenities" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdPark size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Amenities</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES.map(amenity => (
                  <label key={amenity.key} className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE5DD] cursor-pointer hover:bg-[#FAF7F4] transition-colors">
                    <input type="checkbox" checked={form.amenities[amenity.key] || false} onChange={() => toggleAmenity(amenity.key)} className="w-4 h-4 rounded accent-[#6B3A1F]"/>
                    <span className="text-lg">{amenity.icon}</span>
                    <span className="text-sm text-gray-700">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Section */}
          {activeTab === "nearby" && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EDE5DD]">
                <div className="flex items-center gap-2">
                  <MdLocationOn size={18} className="text-[#6B3A1F]" />
                  <h3 className="font-display font-bold text-lg text-[#1C0F05]">Nearby Places</h3>
                </div>
                <button onClick={addNearby} className={CLS.btnPrimary + " !py-2"}>
                  <MdAdd size={15}/> Add Place
                </button>
              </div>
              {form.nearby.map((n, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-[#EDE5DD] bg-[#6B3A1F]/[0.02] relative mb-3">
                  <button onClick={() => delNearby(i)} className="absolute top-2 right-2 p-1 rounded-lg bg-red-50 text-red-500">
                    <MdDelete size={14}/>
                  </button>
                  <Field label="Type">
                    <select value={n.type} onChange={e => updNearby(i, "type", e.target.value)} className={CLS.select}>
                      {NEARBY_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Name">
                    <input value={n.name} onChange={e => updNearby(i, "name", e.target.value)} className={inp}/>
                  </Field>
                  <Field label="Distance">
                    <input value={n.distance} onChange={e => updNearby(i, "distance", e.target.value)} className={inp}/>
                  </Field>
                </div>
              ))}
            </div>
          )}

          {/* Location Map Section */}
          {activeTab === "location" && (
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#EDE5DD]">
                <div className="flex items-center gap-2">
                  <MdMap size={18} className="text-[#6B3A1F]" />
                  <h3 className="font-display font-bold text-lg text-[#1C0F05]">Map Location</h3>
                </div>
                <button type="button" onClick={getCurrentLocation}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100">
                  <MdLocationOn size={14}/> Get Current Location
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Latitude">
                  <input type="number" step="any" value={form.mapLat} onChange={e => set("mapLat", e.target.value)} className={inp}/>
                </Field>
                <Field label="Longitude">
                  <input type="number" step="any" value={form.mapLng} onChange={e => set("mapLng", e.target.value)} className={inp}/>
                </Field>
              </div>
            </div>
          )}

          {/* Owner Section */}
          {activeTab === "owner" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdBusiness size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Owner/Agent Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Owner/Agent Name">
                  <input value={form.owner} onChange={e => set("owner", e.target.value)} className={inp}/>
                </Field>
                <Field label="Owner Type">
                  <select value={form.ownerType} onChange={e => set("ownerType", e.target.value)} className={CLS.select}>
                    <option value="owner">Owner</option>
                    <option value="builder">Builder</option>
                    <option value="agent">Agent</option>
                  </select>
                </Field>
                <Field label="Phone Number">
                  <input value={form.ownerPhone} onChange={e => set("ownerPhone", e.target.value)} className={inp}/>
                </Field>
                <Field label="Email">
                  <input type="email" value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)} className={inp}/>
                </Field>
              </div>
            </div>
          )}

          {/* SEO Section */}
          {activeTab === "seo" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdLink size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">SEO & Tags</h3>
              </div>
              <div className="space-y-5">
                <Field label="Meta Title" hint={`${form.metaTitle?.length || 0} / 60 characters`}>
                  <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} maxLength={60} className={inp}/>
                </Field>
                <Field label="Meta Description" hint={`${form.metaDescription?.length || 0} / 160 characters`}>
                  <textarea rows={3} value={form.metaDescription} onChange={e => set("metaDescription", e.target.value)} maxLength={160} className={CLS.textarea}/>
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
                      <span key={i} className={CLS.badgeBrown + " cursor-pointer gap-1.5"}
                        onClick={() => set("tags", form.tags.filter((_,j)=>j!==i))}>
                        {t} <MdClose size={10}/>
                      </span>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD] shadow-sm">
        <p className="text-xs text-gray-400">
          Tab: <span className="font-semibold text-gray-600 capitalize">{activeTab}</span>
          {" · "}Changes will be saved on update
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/properties/${id}`)} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary + " px-6"}>
            {saving ? "Saving..." : "Update Property"}
          </button>
        </div>
      </div>
    </div>
  );
}