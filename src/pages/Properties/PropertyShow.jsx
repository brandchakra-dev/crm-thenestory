import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { propertiesApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { useToast, DeleteModal } from "../../components/nestory/index";
import {
  MdEdit, MdDelete, MdArrowBack, MdOpenInNew, MdVerified, MdStar,
  MdCheckCircle, MdHome, MdImage, MdLocationOn, MdChevronLeft,
  MdChevronRight, MdInfo, MdAttachMoney, MdLink, MdMap,
  MdBusiness, MdPark, MdContentCopy, MdPhone, MdEmail,
  MdFitnessCenter, MdPool, MdSecurity, MdElevator, MdLocalParking
} from "react-icons/md";
import dayjs from "dayjs";

function Section({ title, children, action, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EAE2] bg-gradient-to-r from-[#FAF7F4] to-white">
        <div className="flex items-center gap-2">
          {icon && <span className="text-[#C9A84C]">{icon}</span>}
          <p className="font-black text-sm text-[#1C0F05] uppercase tracking-wider">{title}</p>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false, badge }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#F0EAE2] last:border-0 group hover:bg-[#FAF7F4]/50 transition-colors duration-200">
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#6B3A1F]/8 flex items-center justify-center mt-0.5">
        <MdInfo size={14} className="text-[#A8978A]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide mb-0.5">{label}</p>
        {badge ? (
          <span className={badge}>{value}</span>
        ) : (
          <p className={`text-sm text-[#1C0F05] ${mono ? "font-mono text-xs break-all" : "font-medium"} break-words`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-white to-[#FAF7F4] border border-[#EDE5DD]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide">{label}</p>
        <p className="text-lg font-black text-[#1C0F05] leading-tight">{value}</p>
      </div>
    </div>
  );
}

const getListingBadge = (type) => {
  switch(type) {
    case "sale": return CLS.badgeGreen;
    case "rent": return CLS.badgeBlue;
    case "lease": return CLS.badgeAmber;
    default: return CLS.badgeGray;
  }
};

const getListingLabel = (type) => {
  switch(type) {
    case "sale": return "For Sale";
    case "rent": return "For Rent";
    case "lease": return "For Lease";
    default: return type;
  }
};

const formatPrice = (price) => {
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} Lac`;
  }
  return `₹${price.toLocaleString()}`;
};

export default function PropertyShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showDel, setShowDel] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    propertiesApi.get(id)
      .then(({ data }) => setProperty(data.property))
      .catch((err) => {
        console.error("Error loading property:", err);
        toast(err.response?.data?.message || "Failed to load property", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await propertiesApi.remove(id);
      toast("Property deleted successfully", "success");
      navigate("/properties");
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Copied to clipboard!", "success");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-3 border-[#EDE5DD] border-t-[#6B3A1F] animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#6B3A1F]/10 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-sm text-[#A8978A]">Loading property details...</p>
    </div>
  );

  if (!property) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6B3A1F]/10 to-[#C9A84C]/10 flex items-center justify-center mb-5">
        <MdHome size={44} className="text-[#6B3A1F]/30" />
      </div>
      <h3 className="font-display font-bold text-2xl text-[#1C0F05] mb-2">Property not found</h3>
      <p className="text-[#A8978A] text-center max-w-sm mb-6">
        The property you're looking for doesn't exist or may have been deleted.
      </p>
      <button onClick={() => navigate("/properties")} 
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        <MdArrowBack size={16} /> Back to Properties
      </button>
    </div>
  );

  const images = property.images || [];
  const amenitiesCount = Object.values(property.amenities || {}).filter(v => v === true).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/properties")} 
            className="group w-10 h-10 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200">
            <MdArrowBack size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1C0F05]">{property.title}</h1>
              {property.isFeatured && (
                <span className={CLS.badgeAmber + " flex items-center gap-1"}>
                  <MdStar size={10} /> Featured
                </span>
              )}
              {property.isVerified && (
                <span className={CLS.badgeGreen + " flex items-center gap-1"}>
                  <MdVerified size={10} /> Verified
                </span>
              )}
              <span className={getListingBadge(property.listingType)}>
                {getListingLabel(property.listingType)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-xs text-[#A8978A] capitalize">{property.category} / {property.subCategory}</span>
              {!property.isActive && (
                <span className={CLS.badgeRed}>Inactive</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/properties/${property.slug}`, "_blank")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDE5DD] text-[#6B3A1F] font-semibold text-sm hover:bg-[#FAF7F4] transition-all duration-200">
            <MdOpenInNew size={16} /> View on Site
          </button>
          <button
            onClick={() => navigate(`/properties/edit/${id}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
            <MdEdit size={16} /> Edit
          </button>
          <button
            onClick={() => setShowDel(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-all duration-200 border border-red-200">
            <MdDelete size={16} /> Delete
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard 
          label="Price" 
          value={formatPrice(property.price)} 
          icon={<MdAttachMoney size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D]"
        />
        <StatCard 
          label="Configuration" 
          value={`${property.bedrooms} BHK • ${property.bathrooms} Bath`} 
          icon={<MdHome size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#059669] to-[#047857]"
        />
        <StatCard 
          label="Area" 
          value={`${property.area} ${property.areaUnit}`} 
          icon={<MdCheckCircle size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#D97706] to-[#B45309]"
        />
        <StatCard 
          label="Amenities" 
          value={amenitiesCount} 
          icon={<MdPark size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column - Gallery & Description */}
        <div className="lg:col-span-2 space-y-6">

          {/* Gallery */}
          {images.length > 0 ? (
            <div className="bg-white rounded-2xl border border-[#EDE5DD] overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-gray-100 overflow-hidden group">
                <img
                  src={propertiesApi.imageUrl(id, images[activeImg]?._id)}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  onError={e => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white text-xs font-bold drop-shadow">{property.title}</span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                    <MdImage size={11}/>
                    {activeImg + 1} / {images.length}
                  </span>
                </div>
                {images[activeImg]?.isPrimary && (
                  <span className="absolute top-3 left-3 text-[9px] font-black bg-[#6B3A1F] text-[#E8D5B0] px-2 py-1 rounded-lg">
                    PRIMARY
                  </span>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                      <MdChevronLeft size={20}/>
                    </button>
                    <button
                      onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors">
                      <MdChevronRight size={20}/>
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 bg-[#6B3A1F]/[0.02] border-t border-[#F0EAE2] overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img._id || i}
                      onClick={() => setActiveImg(i)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImg === i
                          ? "border-[#6B3A1F] opacity-100 scale-105"
                          : "border-transparent opacity-50 hover:opacity-80"
                      }`}>
                      <img
                        src={propertiesApi.imageUrl(id, img._id)}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = "none"; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#EDE5DD] flex flex-col items-center justify-center py-16 text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-[#FAF7F4] flex items-center justify-center mb-3">
                <MdImage size={32} className="text-[#A8978A]" />
              </div>
              <p className="text-sm text-[#A8978A]">No images uploaded</p>
              <button onClick={() => navigate(`/properties/edit/${id}`)}
                className="mt-3 text-xs text-[#6B3A1F] hover:underline">
                Upload Images →
              </button>
            </div>
          )}

          {/* Description */}
          {property.description && (
            <Section title="About this Property" icon={<MdInfo size={16} />}>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-[#7A6858] leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </Section>
          )}

          {/* Key Highlights */}
          {property.highlights?.length > 0 && (
            <Section title={`Key Highlights (${property.highlights.length})`} icon={<MdStar size={16} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {property.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-[#6B3A1F]/5 to-transparent border border-[#EDE5DD]/30">
                    <MdCheckCircle size={16} className="text-[#6B3A1F] flex-shrink-0 mt-0.5"/>
                    <span className="text-sm text-[#1C0F05] leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Amenities */}
          {amenitiesCount > 0 && (
            <Section title={`Amenities (${amenitiesCount})`} icon={<MdPark size={16} />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(property.amenities || {}).filter(([_, val]) => val === true).map(([key]) => {
                  const amenityMap = {
                    swimmingPool: { label: "Swimming Pool", icon: "🏊" },
                    gym: { label: "Gym", icon: "💪" },
                    security: { label: "24/7 Security", icon: "🛡️" },
                    powerBackup: { label: "Power Backup", icon: "⚡" },
                    lift: { label: "Lift/Elevator", icon: "🛗" },
                    park: { label: "Park/Garden", icon: "🌳" },
                    clubhouse: { label: "Clubhouse", icon: "🏛️" },
                    kidsPlayArea: { label: "Kids Play Area", icon: "🎪" },
                    joggingTrack: { label: "Jogging Track", icon: "🏃" },
                    rainwaterHarvesting: { label: "Rainwater Harvesting", icon: "💧" },
                    vaastuCompliant: { label: "Vaastu Compliant", icon: "🧭" },
                  };
                  const a = amenityMap[key] || { label: key, icon: "✅" };
                  return (
                    <div key={key} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EDE5DD] bg-white hover:shadow-sm transition-all">
                      <span className="text-xl flex-shrink-0">{a.icon}</span>
                      <span className="text-xs font-semibold text-[#1C0F05]">{a.label}</span>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Nearby */}
          {property.nearby?.length > 0 && (
            <Section title="Nearby Places" icon={<MdLocationOn size={16} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {property.nearby.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#EDE5DD] bg-white hover:bg-[#6B3A1F]/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#A8978A]">{n.type}</p>
                      <p className="text-xs font-semibold text-[#1C0F05] truncate">{n.name}</p>
                    </div>
                    <span className="text-xs font-bold text-[#6B3A1F] bg-[#6B3A1F]/8 px-2 py-1 rounded-lg flex-shrink-0">
                      {n.distance}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right Column - Information Sidebar */}
        <div className="space-y-5">

          {/* Property Info */}
          <Section title="Property Information" icon={<MdInfo size={16} />}>
            <InfoRow label="Category" value={`${property.category} / ${property.subCategory}`} />
            <InfoRow label="Listing Type" value={getListingLabel(property.listingType)} badge={getListingBadge(property.listingType)} />
            <InfoRow label="Location" value={property.location} />
            <InfoRow label="Address" value={property.address} />
            <InfoRow label="Landmark" value={property.landmark} />
            <InfoRow label="City" value={property.city?.name} />
          </Section>

          {/* Pricing Details */}
          <Section title="Pricing" icon={<MdAttachMoney size={16} />}>
            <InfoRow label="Price" value={formatPrice(property.price)} />
            <InfoRow label="Price Label" value={property.priceLabel} />
            {property.listingType === "rent" && (
              <>
                <InfoRow label="Security Deposit" value={formatPrice(property.securityDeposit)} />
                <InfoRow label="Maintenance" value={formatPrice(property.maintenance)} />
                <InfoRow label="Available From" value={property.availableFrom ? dayjs(property.availableFrom).format("DD MMM YYYY") : null} />
              </>
            )}
          </Section>

          {/* Property Specifications */}
          <Section title="Specifications" icon={<MdHome size={16} />}>
            <InfoRow label="Bedrooms" value={`${property.bedrooms} BHK`} />
            <InfoRow label="Bathrooms" value={property.bathrooms} />
            <InfoRow label="Area" value={`${property.area} ${property.areaUnit}`} />
            <InfoRow label="Floor" value={property.floor} />
            <InfoRow label="Total Floors" value={property.totalFloors} />
            <InfoRow label="Facing" value={property.facing} />
            <InfoRow label="Furnished" value={property.furnished} />
            <InfoRow label="Parking" value={property.parking ? `${property.parkingCount} Parking${property.parkingCount !== 1 ? 's' : ''}` : "No Parking"} />
            <InfoRow label="Age of Property" value={property.ageOfProperty} />
          </Section>

          {/* Owner/Agent Info */}
          {(property.owner || property.ownerPhone || property.ownerEmail) && (
            <Section title="Owner/Agent" icon={<MdBusiness size={16} />}>
              <InfoRow label="Name" value={property.owner} />
              <InfoRow label="Type" value={property.ownerType} />
              {property.ownerPhone && (
                <div className="flex items-start gap-3 py-3 border-b border-[#F0EAE2] last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#6B3A1F]/8 flex items-center justify-center">
                    <MdPhone size={14} className="text-[#A8978A]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide mb-0.5">Phone</p>
                    <a href={`tel:${property.ownerPhone}`} className="text-sm text-blue-600 hover:underline">{property.ownerPhone}</a>
                  </div>
                </div>
              )}
              {property.ownerEmail && (
                <div className="flex items-start gap-3 py-3 border-b border-[#F0EAE2] last:border-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#6B3A1F]/8 flex items-center justify-center">
                    <MdEmail size={14} className="text-[#A8978A]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide mb-0.5">Email</p>
                    <a href={`mailto:${property.ownerEmail}`} className="text-sm text-blue-600 hover:underline break-all">{property.ownerEmail}</a>
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Map Location */}
          {(property.mapLat && property.mapLng) && (
            <Section title="Map Location" icon={<MdMap size={16} />}>
              <InfoRow label="Latitude" value={property.mapLat} />
              <InfoRow label="Longitude" value={property.mapLng} />
              <div className="mt-3">
                <a href={`https://www.google.com/maps?q=${property.mapLat},${property.mapLng}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                  <MdLocationOn size={12} /> View on Google Maps
                </a>
              </div>
            </Section>
          )}

          {/* SEO */}
          {(property.metaTitle || property.metaDescription || property.tags?.length > 0) && (
            <Section title="SEO & Tags" icon={<MdLink size={16} />}>
              <InfoRow label="Meta Title" value={property.metaTitle} />
              <InfoRow label="Meta Description" value={property.metaDescription} />
              {property.tags?.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {property.tags.map((t, i) => (
                      <span key={i} className={CLS.badgeBrown}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* System Info */}
          <Section title="System Information" icon={<MdInfo size={16} />}>
            <InfoRow label="Created By" value={property.createdBy?.name} />
            <InfoRow label="Created" value={property.createdAt ? dayjs(property.createdAt).format("DD MMM YYYY, hh:mm A") : null} />
            <InfoRow label="Last Updated" value={property.updatedAt ? dayjs(property.updatedAt).format("DD MMM YYYY, hh:mm A") : null} />
            <InfoRow label="Views" value={property.views} />
            <InfoRow label="Status" value={property.isActive ? "Active" : "Inactive"} badge={property.isActive ? CLS.badgeGreen : CLS.badgeRed} />
            <InfoRow label="Verification" value={property.isVerified ? "Verified" : "Not Verified"} badge={property.isVerified ? CLS.badgeGreen : CLS.badgeRed} />
            <InfoRow label="Slug" value={property.slug} mono />
          </Section>

          {/* Copy ID Button */}
          <button
            onClick={() => copyToClipboard(property._id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAF7F4] border border-dashed border-[#EDE5DD] text-xs text-[#A8978A] hover:border-[#6B3A1F] hover:text-[#6B3A1F] transition-all duration-200">
            <MdContentCopy size={14} />
            {copied ? "Copied!" : "Copy Property ID"}
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDel && (
        <DeleteModal
          title="Delete Property?"
          message={`Are you sure you want to delete "${property.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}