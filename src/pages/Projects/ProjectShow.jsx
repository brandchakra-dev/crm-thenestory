// src/pages/Nestory/Projects/NestoryProjectShow.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { projectsApi } from "../../services/nestoryApi";
import { CLS, statusBadge } from "../../utils/nestoryTheme";
import { useToast, DeleteModal } from "../../components/nestory/index";
import {
  MdEdit, MdDelete, MdArrowBack, MdOpenInNew,
  MdVerified, MdStar, MdCheckCircle,
  MdApartment, MdImage, MdLocationOn,
  MdChevronLeft, MdChevronRight,
} from "react-icons/md";
import dayjs from "dayjs";

// ── Section card wrapper
function Section({ title, children, action }) {
  return (
    <div className={CLS.card + " overflow-hidden"}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
        <p className="font-black text-xs text-gray-600 uppercase tracking-widest">{title}</p>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Label + value row
function InfoRow({ label, value, mono = false, badge }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F7F3EF] last:border-0">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide w-32 flex-shrink-0 pt-0.5">
        {label}
      </span>
      {badge ? (
        <span className={badge}>{value}</span>
      ) : (
        <span className={`text-sm text-gray-800 flex-1 ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function ProjectShow() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [project,   setProject]  = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [activeImg, setActiveImg]= useState(0);
  const [showDel,   setShowDel]  = useState(false);

  useEffect(() => {
    setLoading(true);
    projectsApi.get(id)
      .then(({ data }) => setProject(data.project))
      .catch(() => toast("Failed to load project", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await projectsApi.remove(id);
      toast("Project deleted");
      navigate("/nestory/projects");
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  // ── Loading
  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin"/>
    </div>
  );

  // ── Not found
  if (!project) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <MdApartment size={44} className="mb-3 opacity-20"/>
      <p className="text-sm font-medium mb-4">Project not found</p>
      <button onClick={() => navigate("/nestory/projects")} className={CLS.btnSecondary}>
        <MdArrowBack size={16}/> Back to Projects
      </button>
    </div>
  );

  const images = project.images || [];

  return (
    <div className="max-w-6xl space-y-5 pb-6">

      {/* ════ HEADER ════ */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        {/* Left — back + title */}
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate("/nestory/projects")}
            className={CLS.btnSecondary + " !px-2.5 !py-2.5 mt-0.5"}>
            <MdArrowBack size={18}/>
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">{project.title}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={statusBadge(project.status)}>{project.status}</span>
              {project.reraApproved && (
                <span className={CLS.badgeGreen}>
                  <MdVerified size={10}/> RERA Approved
                </span>
              )}
              {project.isFeatured && (
                <span className={CLS.badgeAmber}>
                  <MdStar size={10}/> Featured
                </span>
              )}
              {!project.isActive && (
                <span className={CLS.badgeRed}>Inactive</span>
              )}
            </div>
          </div>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => window.open(`/projects/${project.slug}`, "_blank")}
            className={CLS.btnSecondary}>
            <MdOpenInNew size={15}/> View on Site
          </button>
          <button
            onClick={() => navigate(`/nestory/projects/edit/${id}`)}
            className={CLS.btnPrimary}>
            <MdEdit size={15}/> Edit
          </button>
          <button
            onClick={() => setShowDel(true)}
            className={CLS.btnDanger}>
            <MdDelete size={15}/> Delete
          </button>
        </div>
      </div>

      {/* ════ BODY ════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── LEFT — main content ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Gallery */}
          {images.length > 0 ? (
            <div className={CLS.card + " overflow-hidden"}>
              {/* Main image */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden group">
                <img
                  src={projectsApi.imageUrl(id, images[activeImg]?._id)}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Overlay info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white text-xs font-bold drop-shadow">
                    {project.title}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-1 bg-black/50 text-white text-[10px] font-bold rounded-lg backdrop-blur-sm">
                    <MdImage size={11}/>
                    {activeImg + 1} / {images.length}
                  </span>
                </div>
                {/* Primary badge */}
                {images[activeImg]?.isPrimary && (
                  <span className="absolute top-3 left-3 text-[9px] font-black bg-[#6B3A1F] text-[#E8D5B0] px-2 py-1 rounded-lg">
                    PRIMARY
                  </span>
                )}
                {/* Arrows */}
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
              {/* Thumbnails */}
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
                        src={projectsApi.imageUrl(id, img._id)}
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
            <div className={CLS.card + " flex flex-col items-center justify-center py-16 text-gray-300"}>
              <MdImage size={40} className="mb-2"/>
              <p className="text-sm font-medium">No images uploaded</p>
              <button onClick={() => navigate(`/nestory/projects/edit/${id}`)}
                className={CLS.btnSecondary + " mt-3 !text-xs"}>
                Upload Images
              </button>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <Section title="About this Project">
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </Section>
          )}

          {/* Key Highlights */}
          {project.highlights?.length > 0 && (
            <Section title={`Key Highlights (${project.highlights.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#6B3A1F]/[0.02]">
                    <MdCheckCircle size={16} className="text-[#6B3A1F] flex-shrink-0 mt-0.5"/>
                    <span className="text-sm text-gray-700 leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Floor Plans */}
          {project.units?.length > 0 && (
            <Section title={`Floor Plans & Units (${project.units.length})`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.units.map((unit, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#EDE5DD] bg-white hover:bg-[#6B3A1F]/[0.02] transition-colors">
                    <div>
                      <p className="font-bold text-sm text-gray-900">{unit.bhk}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{unit.area}</p>
                      {unit.floors && (
                        <p className="text-[10px] text-gray-400 mt-0.5">Floors: {unit.floors}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-[#6B3A1F]">{unit.price}</p>
                      {unit.priceRaw && (
                        <p className="text-[10px] text-gray-400 mt-0.5">₹{unit.priceRaw} Cr</p>
                      )}
                      {unit.floorPlan?.filename && (
                        <a
                          href={projectsApi.floorPlanUrl(id, i)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-600 hover:underline block mt-1">
                          View Plan →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Amenities */}
          {project.amenities?.length > 0 && (
            <Section title={`Amenities (${project.amenities.length})`}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {project.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EDE5DD] bg-white">
                    <span className="text-xl flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-tight truncate">{a.label}</p>
                      {a.category && (
                        <p className="text-[9px] text-gray-400 mt-0.5">{a.category}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Nearby */}
          {project.nearby?.length > 0 && (
            <Section title="Location & Connectivity">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.nearby.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#EDE5DD] bg-white hover:bg-[#6B3A1F]/[0.02] transition-colors">
                    <span className="text-xl flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-gray-400">{n.type}</p>
                      <p className="text-xs font-semibold text-gray-900 truncate">{n.name}</p>
                    </div>
                    <span className="text-xs font-bold text-[#6B3A1F] bg-[#6B3A1F]/8 px-2 py-1 rounded-lg flex-shrink-0">
                      {n.dist}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          )}

        </div>

        {/* ── RIGHT — info sidebar ── */}
        <div className="space-y-4">

          {/* Basic info */}
          <Section title="Project Info">
            <InfoRow label="Builder"       value={project.builder?.name} />
            <InfoRow label="City"          value={project.city?.name} />
            <InfoRow label="Location"      value={project.location} />
            <InfoRow label="Property Type" value={project.propertyType} />
            <InfoRow label="BHK Options"   value={project.bhk?.join(", ")} />
            <InfoRow label="Status"        value={project.status}
              badge={statusBadge(project.status)} />
          </Section>

          {/* Pricing */}
          <Section title="Pricing">
            <InfoRow label="Price Range"  value={project.priceLabel} />
            <InfoRow label="Min Price"    value={project.priceMin ? `₹${project.priceMin} Cr` : null} />
            <InfoRow label="Max Price"    value={project.priceMax ? `₹${project.priceMax} Cr` : null} />
          </Section>

          {/* Project specs */}
          <Section title="Project Specs">
            <InfoRow label="Total Units"   value={project.totalUnits} />
            <InfoRow label="Total Towers"  value={project.totalTowers} />
            <InfoRow label="Total Floors"  value={project.totalFloors} />
            <InfoRow label="Total Area"    value={project.totalArea} />
            <InfoRow label="Possession"    value={project.possessionLabel} />
            <InfoRow label="Rating"        value={project.rating ? `${project.rating} / 5` : null} />
          </Section>

            {/* Map Location */}
            {(project.mapLat && project.mapLng) && (
            <Section title="Map Location">
                <InfoRow label="Latitude" value={project.mapLat} />
                <InfoRow label="Longitude" value={project.mapLng} />
                <div className="mt-3">
                <a 
                    href={`https://www.google.com/maps?q=${project.mapLat},${project.mapLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                    <MdLocationOn size={12}/> View on Google Maps
                </a>
                </div>
            </Section>
            )}

          {/* RERA */}
          <Section title="RERA & Legal">
            <InfoRow label="RERA No."
              value={project.reraNo}
              mono />
            <InfoRow label="RERA Status"
              value={project.reraApproved ? "Approved ✓" : "Not Approved"}
              badge={project.reraApproved ? CLS.badgeGreen : CLS.badgeRed} />
          </Section>

          {/* SEO */}
          {(project.metaTitle || project.metaDescription || project.tags?.length > 0) && (
            <Section title="SEO">
              <InfoRow label="Meta Title"  value={project.metaTitle} />
              <InfoRow label="Meta Desc"   value={project.metaDescription} />
              {project.tags?.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t, i) => (
                      <span key={i} className={CLS.badgeBrown}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* Meta / system info */}
          <Section title="System Info">
            <InfoRow label="Created By"   value={project.createdBy?.name} />
            <InfoRow label="Created"      value={project.createdAt ? dayjs(project.createdAt).format("DD MMM YYYY") : null} />
            <InfoRow label="Updated"      value={project.updatedAt ? dayjs(project.updatedAt).format("DD MMM YYYY") : null} />
            <InfoRow label="Views"        value={project.views} />
            <InfoRow label="Active"       value={project.isActive ? "Yes" : "No"}
              badge={project.isActive ? CLS.badgeGreen : CLS.badgeRed} />
            <InfoRow label="Slug"         value={project.slug}  mono />
            <InfoRow label="ID"           value={project._id}   mono />
          </Section>

        </div>
      </div>

      {/* ── Delete Modal ── */}
      {showDel && (
        <DeleteModal
          title="Delete Project?"
          message={`Are you sure you want to delete "${project.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}