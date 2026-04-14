import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { propertiesApi, citiesApi, buildersApi, buildFD } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { FormHeader, Field, TabBar, ImageUploader, useToast } from "../../components/nestory/index";
import { 
  MdAdd, MdClose, MdDelete, MdLocationOn, MdHome, MdAttachMoney, 
  MdStar, MdCheckCircle, MdImage, MdInfo, MdLink, MdMap,
  MdApartment, MdBathtub, MdPark, MdLocalOffer, MdCategory,
  MdBusiness, MdCalendarToday, MdSecurity, MdFitnessCenter,
  MdPool, MdElevator, MdVerified
} from "react-icons/md";

// Constants
const CATEGORIES = [
  { value: "residential", label: "Residential", icon: "🏠" },
  { value: "commercial", label: "Commercial", icon: "🏢" },
  { value: "industrial", label: "Industrial", icon: "🏭" },
];

const SUB_CATEGORIES = {
  residential: [
    { value: "apartment", label: "Apartment", icon: "🏢" },
    { value: "villa", label: "Villa", icon: "🏡" },
    { value: "builder-floor", label: "Builder Floor", icon: "🏗️" },
    { value: "plot", label: "Plot", icon: "📐" },
    { value: "penthouse", label: "Penthouse", icon: "🌆" },
    { value: "studio", label: "Studio", icon: "🎨" },
  ],
  commercial: [
    { value: "office-space", label: "Office Space", icon: "💼" },
    { value: "retail-shop", label: "Retail Shop", icon: "🛍️" },
    { value: "coworking", label: "Co-working Space", icon: "👥" },
    { value: "showroom", label: "Showroom", icon: "🖼️" },
  ],
  industrial: [
    { value: "warehouse", label: "Warehouse", icon: "📦" },
    { value: "factory", label: "Factory", icon: "🏭" },
    { value: "logistics", label: "Logistics Center", icon: "🚚" },
    { value: "industrial-plot", label: "Industrial Plot", icon: "📏" },
  ],
};

const LISTING_TYPES = [
  { value: "sale", label: "For Sale", icon: "💰" },
  { value: "rent", label: "For Rent", icon: "📅" },
  { value: "lease", label: "For Lease", icon: "📝" },
];

const FURNISHED_OPTIONS = [
  { value: "furnished", label: "Fully Furnished", icon: "🛋️" },
  { value: "semi-furnished", label: "Semi Furnished", icon: "🪑" },
  { value: "unfurnished", label: "Unfurnished", icon: "🏠" },
];

const FACING_OPTIONS = [
  "North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"
];

const AGE_OPTIONS = [
  "0-1 year", "1-5 years", "5-10 years", "10+ years"
];

const AMENITIES = [
  { key: "swimmingPool", label: "Swimming Pool", icon: "🏊", category: "Recreation" },
  { key: "gym", label: "Gym", icon: "💪", category: "Fitness" },
  { key: "security", label: "24/7 Security", icon: "🛡️", category: "Safety" },
  { key: "powerBackup", label: "Power Backup", icon: "⚡", category: "Utilities" },
  { key: "lift", label: "Lift/Elevator", icon: "🛗", category: "Utilities" },
  { key: "park", label: "Park/Garden", icon: "🌳", category: "Recreation" },
  { key: "clubhouse", label: "Clubhouse", icon: "🏛️", category: "Social" },
  { key: "kidsPlayArea", label: "Kids Play Area", icon: "🎪", category: "Kids" },
  { key: "joggingTrack", label: "Jogging Track", icon: "🏃", category: "Fitness" },
  { key: "rainwaterHarvesting", label: "Rainwater Harvesting", icon: "💧", category: "Eco" },
  { key: "vaastuCompliant", label: "Vaastu Compliant", icon: "🧭", category: "Spiritual" },
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

export default function PropertyCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ ...BLANK });
  const [cities, setCities] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [saving, setSaving] = useState(false);
  const [hlInput, setHlInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    citiesApi.list().then(r => {
      setCities(r.data.cities || []);
      // ✅ Agar cities list empty hai toh error show karo
      if (r.data.cities?.length === 0) {
        toast("No cities found. Please add cities first.", "error");
      }
    }).catch(err => {
      console.error("Failed to load cities:", err);
      toast("Failed to load cities", "error");
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const autoSlug = () => {
    if (!form.slug && form.title) {
      set("slug", form.title.toLowerCase().trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""));
    }
  };

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

    if (!form.city) {
        toast("Please select a city", "error");
        setActiveTab("basic");
        return;
      }

    setSaving(true);
    try {
      const cleanForm = {
        ...form,
        city: form.city,
        bedrooms: parseInt(form.bedrooms) || 0,
        bathrooms: parseInt(form.bathrooms) || 0,
        area: parseFloat(form.area) || 0,
        price: parseFloat(form.price) || 0,
        securityDeposit: parseFloat(form.securityDeposit) || 0,
        maintenance: parseFloat(form.maintenance) || 0,
        parkingCount: parseInt(form.parkingCount) || 0,
        totalFloors: parseInt(form.totalFloors) || 0,
        isFeatured: form.isFeatured === true,
        isActive: form.isActive === true,
        isVerified: form.isVerified === true,
        parking: form.parking === true,
        availableFrom: form.availableFrom || null,
      };

      console.log("Saving property with city:", cleanForm.city);

      const files = { images: imageFiles };
      const fd = buildFD(cleanForm, files);
      const { data } = await propertiesApi.create(fd);
      toast("Property created successfully");
      navigate(`/properties`);
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
        title="Add New Property"
        subtitle="Fill in all details to create a new property listing"
        backPath="/properties"
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

          {/* Basic Information */}
          {activeTab === "basic" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdInfo size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Property Title" required cls="sm:col-span-2">
                  <input value={form.title} onChange={e => set("title", e.target.value)}
                    onBlur={autoSlug} placeholder="Luxury 3 BHK Apartment in Sector 75" className={inp}/>
                </Field>

                <Field label="Slug" hint="Auto-generated from title">
                  <input value={form.slug} onChange={e => set("slug", e.target.value)}
                    placeholder="luxury-3-bhk-apartment-sector-75" className={inp + " font-mono text-xs"}/>
                </Field>

                <Field label="Category" required>
                  <select value={form.category} onChange={e => {
                    set("category", e.target.value);
                    const subs = SUB_CATEGORIES[e.target.value];
                    if (subs?.length) set("subCategory", subs[0].value);
                  }} className={CLS.select}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>

                <Field label="Sub Category" required>
                  <select value={form.subCategory} onChange={e => set("subCategory", e.target.value)} className={CLS.select}>
                    {SUB_CATEGORIES[form.category]?.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Listing Type" required>
                  <select value={form.listingType} onChange={e => set("listingType", e.target.value)} className={CLS.select}>
                    {LISTING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </Field>

                <Field label="City" required>
                  <select value={form.city || ""} onChange={e => set("city", e.target.value)} className={CLS.select}>
                    <option value="">— Select City —</option>
                    {cities.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </Field>

                <Field label="Location / Area" required cls="sm:col-span-2">
                  <input value={form.location} onChange={e => set("location", e.target.value)}
                    placeholder="Sector 75, Noida" className={inp}/>
                </Field>

                <Field label="Full Address" cls="sm:col-span-2">
                  <input value={form.address} onChange={e => set("address", e.target.value)}
                    placeholder="Complete postal address" className={inp}/>
                </Field>

                <Field label="Landmark">
                  <input value={form.landmark} onChange={e => set("landmark", e.target.value)}
                    placeholder="Near City Center Mall" className={inp}/>
                </Field>
              </div>
            </div>
          )}

          {/* Property Details */}
          {activeTab === "details" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdHome size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Property Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Field label="Bedrooms">
                  <input type="number" min="0" value={form.bedrooms}
                    onChange={e => set("bedrooms", e.target.value)} className={inp}/>
                </Field>

                <Field label="Bathrooms">
                  <input type="number" min="0" value={form.bathrooms}
                    onChange={e => set("bathrooms", e.target.value)} className={inp}/>
                </Field>

                <Field label="Area (sq.ft)" required>
                  <input type="number" min="0" value={form.area}
                    onChange={e => set("area", e.target.value)} className={inp}/>
                </Field>

                <Field label="Floor">
                  <input value={form.floor} onChange={e => set("floor", e.target.value)}
                    placeholder="Ground, 1st, etc." className={inp}/>
                </Field>

                <Field label="Total Floors">
                  <input type="number" value={form.totalFloors}
                    onChange={e => set("totalFloors", e.target.value)} className={inp}/>
                </Field>

                <Field label="Facing">
                  <select value={form.facing} onChange={e => set("facing", e.target.value)} className={CLS.select}>
                    <option value="">Select Facing</option>
                    {FACING_OPTIONS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>

                <Field label="Furnished Status">
                  <select value={form.furnished} onChange={e => set("furnished", e.target.value)} className={CLS.select}>
                    {FURNISHED_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </Field>

                <Field label="Parking">
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={form.parking}
                        onChange={e => set("parking", e.target.checked)} className="w-4 h-4 rounded"/>
                      <span>Available</span>
                    </label>
                    {form.parking && (
                      <input type="number" min="0" value={form.parkingCount}
                        onChange={e => set("parkingCount", e.target.value)}
                        placeholder="Count" className={inp + " w-24"}/>
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
                  <textarea rows={5} value={form.description}
                    onChange={e => set("description", e.target.value)}
                    placeholder="Describe the property, its features, nearby amenities, etc." className={CLS.textarea}/>
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
                      <span key={i}
                        className={CLS.badgeBrown + " cursor-pointer gap-1.5"}
                        onClick={() => set("highlights", form.highlights.filter((_,j) => j!==i))}>
                        {h} <MdClose size={10}/>
                      </span>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Pricing */}
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
                    <input type="number" value={form.price}
                      onChange={e => set("price", e.target.value)}
                      placeholder="7500000" className={inp + " pl-8"}/>
                  </div>
                </Field>

                <Field label="Price Display Label">
                  <input value={form.priceLabel} onChange={e => set("priceLabel", e.target.value)}
                    placeholder="₹75 Lac" className={inp}/>
                </Field>

                {(form.listingType === "rent" || form.listingType === "lease") && (
                  <>
                    <Field label="Security Deposit (₹)">
                      <input type="number" value={form.securityDeposit}
                        onChange={e => set("securityDeposit", e.target.value)}
                        placeholder="100000" className={inp}/>
                    </Field>

                    <Field label="Maintenance (₹/month)">
                      <input type="number" value={form.maintenance}
                        onChange={e => set("maintenance", e.target.value)}
                        placeholder="5000" className={inp}/>
                    </Field>

                    <Field label="Available From">
                      <input type="date" value={form.availableFrom}
                        onChange={e => set("availableFrom", e.target.value)} className={inp}/>
                    </Field>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Images */}
          {activeTab === "images" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdImage size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Property Images</h3>
              </div>
              <ImageUploader
                existing={[]}
                newFiles={imageFiles}
                onChange={setImageFiles}
              />
              <p className="text-xs text-gray-400 mt-3">Upload high-quality images of the property. First image will be the cover.</p>
            </div>
          )}

          {/* Amenities */}
          {activeTab === "amenities" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdPark size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Amenities</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES.map(amenity => (
                  <label key={amenity.key} className="flex items-center gap-2 p-3 rounded-xl border border-[#EDE5DD] cursor-pointer hover:bg-[#FAF7F4] transition-colors">
                    <input
                      type="checkbox"
                      checked={form.amenities[amenity.key] || false}
                      onChange={() => toggleAmenity(amenity.key)}
                      className="w-4 h-4 rounded accent-[#6B3A1F]"
                    />
                    <span className="text-lg">{amenity.icon}</span>
                    <span className="text-sm text-gray-700">{amenity.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Nearby */}
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

              {form.nearby.length === 0 && (
                <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-[#EDE5DD] rounded-2xl">
                  No nearby places added. Click "Add Place" to start.
                </div>
              )}

              {form.nearby.map((n, i) => (
                <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-[#EDE5DD] bg-[#6B3A1F]/[0.02] relative mb-3">
                  <button onClick={() => delNearby(i)}
                    className="absolute top-2 right-2 p-1 rounded-lg bg-red-50 text-red-500">
                    <MdDelete size={14}/>
                  </button>
                  <Field label="Type">
                    <select value={n.type} onChange={e => updNearby(i, "type", e.target.value)} className={CLS.select}>
                      {NEARBY_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Name" cls="sm:col-span-1">
                    <input value={n.name} onChange={e => updNearby(i, "name", e.target.value)}
                      placeholder="Place name" className={inp}/>
                  </Field>
                  <Field label="Distance">
                    <input value={n.distance} onChange={e => updNearby(i, "distance", e.target.value)}
                      placeholder="0.5 km" className={inp}/>
                  </Field>
                </div>
              ))}
            </div>
          )}

          {/* Location Map */}
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

              {(form.mapLat && form.mapLng) && (
                <div className="mt-4 p-4 rounded-xl bg-gray-100 border border-[#EDE5DD]">
                  <p className="text-xs text-gray-500 mb-2">Map Preview</p>
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-400">📍 {form.mapLat}, {form.mapLng}</p>
                  </div>
                  <a href={`https://www.google.com/maps?q=${form.mapLat},${form.mapLng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    Open in Google Maps →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdLink size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">SEO & Tags</h3>
              </div>
              <div className="space-y-5">
                <Field label="Meta Title" hint={`${form.metaTitle?.length || 0} / 60 characters`}>
                  <input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)}
                    maxLength={60} placeholder="SEO page title..." className={inp}/>
                </Field>
                <Field label="Meta Description" hint={`${form.metaDescription?.length || 0} / 160 characters`}>
                  <textarea rows={3} value={form.metaDescription}
                    onChange={e => set("metaDescription", e.target.value)}
                    maxLength={160} placeholder="SEO page description..." className={CLS.textarea}/>
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
              </div>
            </div>
          )}

          {/* Owner Information */}
          {activeTab === "owner" && (
            <div>
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#EDE5DD]">
                <MdBusiness size={18} className="text-[#6B3A1F]" />
                <h3 className="font-display font-bold text-lg text-[#1C0F05]">Owner/Agent Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="Owner/Agent Name">
                  <input value={form.owner} onChange={e => set("owner", e.target.value)}
                    placeholder="Name" className={inp}/>
                </Field>
                <Field label="Owner Type">
                  <select value={form.ownerType} onChange={e => set("ownerType", e.target.value)} className={CLS.select}>
                    <option value="owner">Owner</option>
                    <option value="builder">Builder</option>
                    <option value="agent">Agent</option>
                  </select>
                </Field>
                <Field label="Phone Number">
                  <input value={form.ownerPhone} onChange={e => set("ownerPhone", e.target.value)}
                    placeholder="+91 9876543210" className={inp}/>
                </Field>
                <Field label="Email">
                  <input type="email" value={form.ownerEmail} onChange={e => set("ownerEmail", e.target.value)}
                    placeholder="contact@example.com" className={inp}/>
                </Field>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#EDE5DD] shadow-sm">
        <p className="text-xs text-gray-400">
          Tab: <span className="font-semibold text-gray-600 capitalize">{activeTab}</span>
          {" · "}Fill all required fields before saving
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate("/properties")} className={CLS.btnSecondary}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className={CLS.btnPrimary + " px-6"}>
            {saving ? "Creating..." : "Create Property"}
          </button>
        </div>
      </div>
    </div>
  );
}