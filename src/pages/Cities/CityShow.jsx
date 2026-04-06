import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { citiesApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import { useToast, DeleteModal } from "../../components/nestory/index";
import { MdEdit, MdDelete, MdArrowBack, MdImage, MdLocationOn } from "react-icons/md";
import dayjs from "dayjs";

function InfoRow({ label, value, mono = false }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F7F3EF] last:border-0">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className={`text-sm text-gray-800 flex-1 ${mono ? "font-mono text-xs break-all" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}

export default function CityShow() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const { toast } = useToast();

  const [city,     setCity]    = useState(null);
  const [loading,  setLoading] = useState(true);
  const [showDel,  setShowDel]  = useState(false);

  useEffect(() => {
    citiesApi.get(id)
      .then(({ data }) => setCity(data.city))
      .catch((err) => {
        console.error("Error loading city:", err);
        toast(err.response?.data?.message || "Failed to load city", "error");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await citiesApi.remove(id);
      toast("City deleted successfully", "success");
      navigate("/cities");
    } catch (e) {
      toast(e.response?.data?.message || "Delete failed", "error");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6B3A1F] border-t-transparent animate-spin"/>
    </div>
  );

  if (!city) return (
    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
      <MdLocationOn size={44} className="mb-3 opacity-20"/>
      <p className="text-sm font-medium mb-4">City not found</p>
      <button onClick={() => navigate("/cities")} className={CLS.btnSecondary}>
        <MdArrowBack size={16}/> Back to Cities
      </button>
    </div>
  );

  const imageUrl = city.imageUrl || city.image?.url;

  return (
    <div className="max-w-4xl space-y-5 pb-6">

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate("/cities")} className={CLS.btnSecondary + " !px-2.5 !py-2.5 mt-0.5"}>
            <MdArrowBack size={18}/>
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">{city.name}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                city.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${city.isActive ? "bg-emerald-500" : "bg-gray-400"}`}/>
                {city.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate(`/cities/edit/${id}`)} className={CLS.btnPrimary}>
            <MdEdit size={15}/> Edit
          </button>
          <button onClick={() => setShowDel(true)} className={CLS.btnDanger}>
            <MdDelete size={15}/> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <div className="lg:col-span-2 space-y-5">

          {imageUrl && (
            <div className={CLS.card + " overflow-hidden"}>
              <div className="relative aspect-video bg-gray-100">
                <img src={imageUrl} alt={city.name} className="w-full h-full object-cover"/>
              </div>
            </div>
          )}

          {city.description && (
            <div className={CLS.card + " overflow-hidden"}>
              <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
                <p className="font-black text-xs text-gray-600 uppercase tracking-widest">Description</p>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {city.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">

          <div className={CLS.card + " overflow-hidden"}>
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-gray-600 uppercase tracking-widest">City Information</p>
            </div>
            <div className="p-5">
              <InfoRow label="City Name" value={city.name} />
              <InfoRow label="Slug" value={city.slug} mono />
              <InfoRow label="State" value={city.state} />
              <InfoRow label="Sort Order" value={city.sortOrder} />
              <InfoRow label="Projects Count" value={city.totalProjects || 0} />
            </div>
          </div>

          <div className={CLS.card + " overflow-hidden"}>
            <div className="px-5 py-3.5 border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.02]">
              <p className="font-black text-xs text-gray-600 uppercase tracking-widest">System Info</p>
            </div>
            <div className="p-5">
              <InfoRow label="Created By" value={city.createdBy?.name} />
              <InfoRow label="Created" value={city.createdAt ? dayjs(city.createdAt).format("DD MMM YYYY") : null} />
              <InfoRow label="Updated" value={city.updatedAt ? dayjs(city.updatedAt).format("DD MMM YYYY") : null} />
              <InfoRow label="ID" value={city._id} mono />
            </div>
          </div>

        </div>
      </div>

      {showDel && (
        <DeleteModal
          title="Delete City?"
          message={`Are you sure you want to delete "${city.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
        />
      )}
    </div>
  );
}