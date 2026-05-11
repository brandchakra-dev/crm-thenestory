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
  MdChevronLeft, MdChevronRight, MdInfo,
  MdAttachMoney, MdCalendarToday, MdLink, MdMap,
  MdBusiness, MdHome, MdPark, MdBathtub,MdContentCopy
} from "react-icons/md";
import dayjs from "dayjs";

import { getImageUrl } from "../../utils/url";

import DOMPurify from "dompurify";

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

export default function ProjectShow() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showDel, setShowDel] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    projectsApi.get(id)
      .then(({ data }) => setProject(data.project))
      .catch((err) => {
        console.error("Error loading project:", err);
        toast(err.response?.data?.message || "Failed to load project", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await projectsApi.remove(id);
      toast("Project deleted successfully", "success");
      navigate("/projects");
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
      <p className="mt-4 text-sm text-[#A8978A]">Loading project details...</p>
    </div>
  );

  if (!project) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#6B3A1F]/10 to-[#C9A84C]/10 flex items-center justify-center mb-5">
        <MdApartment size={44} className="text-[#6B3A1F]/30" />
      </div>
      <h3 className="font-display font-bold text-2xl text-[#1C0F05] mb-2">Project not found</h3>
      <p className="text-[#A8978A] text-center max-w-sm mb-6">
        The project you're looking for doesn't exist or may have been deleted.
      </p>
      <button 
        onClick={() => navigate("/projects")} 
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6B3A1F] to-[#3B1D0D] text-white font-semibold text-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        <MdArrowBack size={16} /> Back to Projects
      </button>
    </div>
  );

  const images = project.images || [];
  const totalUnits = project.totalUnits || 0;
  const totalTowers = project.totalTowers || 0;
  const rating = project.rating || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/projects")} 
            className="group w-10 h-10 rounded-xl flex items-center justify-center bg-[#FAF7F4] border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F] hover:text-white hover:border-[#6B3A1F] transition-all duration-200">
            <MdArrowBack size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1C0F05]">{project.title}</h1>
              {project.isFeatured && (
                <span className={CLS.badgeAmber + " flex items-center gap-1"}>
                  <MdStar size={10} /> Featured
                </span>
              )}
              <span className={statusBadge(project.status)}>{project.status}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {project.reraApproved && (
                <span className={CLS.badgeGreen + " flex items-center gap-1"}>
                  <MdVerified size={10} /> RERA Approved
                </span>
              )}
              {!project.isActive && (
                <span className={CLS.badgeRed}>Inactive</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(`/projects/${project.slug}`, "_blank")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#EDE5DD] text-[#6B3A1F] font-semibold text-sm hover:bg-[#FAF7F4] transition-all duration-200">
            <MdOpenInNew size={16} /> View on Site
          </button>
          <button
            onClick={() => navigate(`/projects/edit/${id}`)}
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
          label="Total Units" 
          value={totalUnits} 
          icon={<MdHome size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#6B3A1F] to-[#3B1D0D]"
        />
        <StatCard 
          label="Total Towers" 
          value={totalTowers} 
          icon={<MdApartment size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#C9A84C] to-[#B89430]"
        />
        <StatCard 
          label="Price Range" 
          value={project.priceLabel || `${project.priceMin} Cr`} 
          icon={<MdAttachMoney size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#059669] to-[#047857]"
        />
        <StatCard 
          label="Rating" 
          value={`${rating} / 5`} 
          icon={<MdStar size={20} className="text-white" />}
          color="bg-gradient-to-br from-[#D97706] to-[#B45309]"
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
                  src={getImageUrl(projectsApi.imageUrl(id, images[activeImg]?._id))}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500"
                  onError={e => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"/>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <span className="text-white text-xs font-bold drop-shadow">{project.title}</span>
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
                        src={getImageUrl(projectsApi.imageUrl(id, img._id))}
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
              <button onClick={() => navigate(`/projects/edit/${id}`)}
                className="mt-3 text-xs text-[#6B3A1F] hover:underline">
                Upload Images →
              </button>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <Section title="About this Project" icon={<MdInfo size={16} />}>
              <div className="prose prose-sm max-w-none">
              <div
                className="
                  prose 
                  prose-lg 
                  max-w-none

                  prose-table:border
                  prose-th:border
                  prose-td:border

                  prose-headings:text-[#1C0F05]
                  prose-headings:font-bold

                  prose-p:text-[#3D2B1A]
                  prose-p:leading-8

                  prose-a:text-[#6B3A1F]
                  prose-a:no-underline
                  hover:prose-a:text-[#C9A84C]

                  prose-strong:text-[#1C0F05]

                  prose-li:text-[#3D2B1A]

                  prose-blockquote:border-l-[#C9A84C]
                  prose-blockquote:text-[#6B5C4E]

                  prose-img:rounded-2xl
                  prose-img:shadow-lg

                  prose-code:text-[#6B3A1F]

                  prose-pre:bg-[#1C0F05]
                  prose-pre:text-white
                "
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
              </div>
            </Section>
          )}

          {/* Key Highlights */}
          {project.highlights?.length > 0 && (
            <Section title={`Key Highlights (${project.highlights.length})`} icon={<MdStar size={16} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-[#6B3A1F]/5 to-transparent border border-[#EDE5DD]/30">
                    <MdCheckCircle size={16} className="text-[#6B3A1F] flex-shrink-0 mt-0.5"/>
                    <span className="text-sm text-[#1C0F05] leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Floor Plans */}
          {project.units?.length > 0 && (
            <Section title={`Floor Plans & Units (${project.units.length})`} icon={<MdApartment size={16} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.units.map((unit, i) => (
                  <div key={i}
                    className="flex items-center justify-between p-4 rounded-xl border border-[#EDE5DD] bg-white hover:bg-[#6B3A1F]/[0.02] transition-colors">
                    <div>
                      <p className="font-bold text-base text-[#1C0F05]">{unit.bhk}</p>
                      <p className="text-xs text-[#A8978A] mt-0.5">{unit.area}</p>
                      {unit.floors && (
                        <p className="text-[10px] text-[#A8978A] mt-0.5">Floors: {unit.floors}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-base text-[#6B3A1F]">{unit.price}</p>
                      {unit.priceRaw && (
                        <p className="text-[10px] text-[#A8978A] mt-0.5">₹{unit.priceRaw} Cr</p>
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
            <Section title={`Amenities (${project.amenities.length})`} icon={<MdPark size={16} />}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {project.amenities.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#EDE5DD] bg-white hover:shadow-sm transition-all">
                    <span className="text-xl flex-shrink-0">{a.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#1C0F05] leading-tight truncate">{a.label}</p>
                      {a.category && (
                        <p className="text-[9px] text-[#A8978A] mt-0.5">{a.category}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Nearby */}
          {project.nearby?.length > 0 && (
            <Section title="Location & Connectivity" icon={<MdLocationOn size={16} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {project.nearby.map((n, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#EDE5DD] bg-white hover:bg-[#6B3A1F]/[0.02] transition-colors">
                    <span className="text-xl flex-shrink-0">{n.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#A8978A]">{n.type}</p>
                      <p className="text-xs font-semibold text-[#1C0F05] truncate">{n.name}</p>
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

        {/* Right Column - Information Sidebar */}
        <div className="space-y-5">

          {/* Project Info */}
          <Section title="Project Information" icon={<MdInfo size={16} />}>
            <InfoRow label="Builder" value={project.builder?.name} />
            <InfoRow label="City" value={project.city?.name} />
            <InfoRow label="Location" value={project.location} />
            <InfoRow label="Property Type" value={project.propertyType} />
            <InfoRow label="BHK Options" value={project.bhk?.join(", ")} />
          </Section>

          {/* Pricing */}
          <Section title="Pricing" icon={<MdAttachMoney size={16} />}>
            <InfoRow label="Price Range" value={project.priceLabel} />
            <InfoRow label="Min Price" value={project.priceMin ? `₹${project.priceMin} Cr` : null} />
            <InfoRow label="Max Price" value={project.priceMax ? `₹${project.priceMax} Cr` : null} />
          </Section>

          {/* Project Specs */}
          <Section title="Project Specifications" icon={<MdApartment size={16} />}>
            <InfoRow label="Total Units" value={project.totalUnits} />
            <InfoRow label="Total Towers" value={project.totalTowers} />
            <InfoRow label="Total Floors" value={project.totalFloors} />
            <InfoRow label="Total Area" value={project.totalArea} />
            <InfoRow label="Possession" value={project.possessionLabel} />
          </Section>

          {/* Map Location */}
          {(project.mapLat && project.mapLng) && (
            <Section title="Map Location" icon={<MdMap size={16} />}>
              <InfoRow label="Latitude" value={project.mapLat} />
              <InfoRow label="Longitude" value={project.mapLng} />
              <div className="mt-3">
                <a 
                  href={`https://www.google.com/maps?q=${project.mapLat},${project.mapLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors">
                  <MdLocationOn size={12} /> View on Google Maps
                </a>
              </div>
            </Section>
          )}

          {/* RERA & Legal */}
          <Section title="RERA & Legal" icon={<MdVerified size={16} />}>
            <InfoRow label="RERA No." value={project.reraNo} mono />
            <InfoRow label="RERA Status" value={project.reraApproved ? "Approved ✓" : "Not Approved"}
              badge={project.reraApproved ? CLS.badgeGreen : CLS.badgeRed} />
          </Section>

          {/* SEO */}
          {(project.metaTitle || project.metaDescription || project.tags?.length > 0) && (
            <Section title="SEO & Tags" icon={<MdLink size={16} />}>
              <InfoRow label="Meta Title" value={project.metaTitle} />
              <InfoRow label="Meta Description" value={project.metaDescription} />
              {project.tags?.length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-[#A8978A] uppercase tracking-wide mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t, i) => (
                      <span key={i} className={CLS.badgeBrown}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </Section>
          )}

          {/* System Info */}
          <Section title="System Information" icon={<MdInfo size={16} />}>
            <InfoRow label="Created By" value={project.createdBy?.name} />
            <InfoRow label="Created" value={project.createdAt ? dayjs(project.createdAt).format("DD MMM YYYY, hh:mm A") : null} />
            <InfoRow label="Last Updated" value={project.updatedAt ? dayjs(project.updatedAt).format("DD MMM YYYY, hh:mm A") : null} />
            <InfoRow label="Views" value={project.views} />
            <InfoRow label="Status" value={project.isActive ? "Active" : "Inactive"}
              badge={project.isActive ? CLS.badgeGreen : CLS.badgeRed} />
            <InfoRow label="Slug" value={project.slug} mono />
          </Section>

          {/* Copy ID Button */}
          <button
            onClick={() => copyToClipboard(project._id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FAF7F4] border border-dashed border-[#EDE5DD] text-xs text-[#A8978A] hover:border-[#6B3A1F] hover:text-[#6B3A1F] transition-all duration-200">
            <MdContentCopy size={14} />
            {copied ? "Copied!" : "Copy Project ID"}
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {showDel && (
        <DeleteModal
          title="Delete Project?"
          message={`Are you sure you want to delete "${project.title}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}