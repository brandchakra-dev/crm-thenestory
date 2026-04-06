
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { dashboardApi } from "../../services/nestoryApi";
import { CLS } from "../../utils/nestoryTheme";
import {
  MdApartment, MdLocationCity, MdPeople,
  MdVideoLibrary, MdArticle, MdArrowUpward,
  MdOpenInNew,
} from "react-icons/md";
import dayjs from "dayjs";

// ── Pie chart colors
const PIE_COLORS = ["#6B3A1F","#C9A84C","#E8D5B0","#3B1D0D"];

// ── Stat card data
const STAT_META = [
  { key:"projects", label:"Total Projects",  icon:MdApartment,    color:"#6B3A1F", bg:"#6B3A1F", link:"/nestory/projects" },
  { key:"cities",   label:"Cities",          icon:MdLocationCity, color:"#2563EB", bg:"#2563EB", link:"/nestory/cities"   },
  { key:"builders", label:"Builders",        icon:MdPeople,       color:"#7C3AED", bg:"#7C3AED", link:"/nestory/builders" },
  { key:"videos",   label:"YouTube Videos",  icon:MdVideoLibrary, color:"#DC2626", bg:"#DC2626", link:"/nestory/videos"   },
  { key:"blogs",    label:"Blog Articles",   icon:MdArticle,      color:"#059669", bg:"#059669", link:"/nestory/blogs"    },
];

// ── Skeleton
function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {[...Array(5)].map((_,i) => (
        <div key={i} className={CLS.card + " p-4 animate-pulse"}>
          <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3"/>
          <div className="h-7 w-12 bg-gray-100 rounded mb-1"/>
          <div className="h-3 w-20 bg-gray-100 rounded"/>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.stats()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Prepare chart data
  const barData = data?.byStatus?.map(s => ({ name: s._id, count: s.count })) || [];
  const cityData = data?.byCity?.map(c => ({ name: c.name || "Unknown", value: c.count })) || [];

  return (
    <div className="space-y-6 max-w-7xl">

      {/* ── Page title */}
      <div>
        <h1 className={CLS.pageTitle}>Nestory Dashboard</h1>
        <p className={CLS.pageSubtitle}>Real estate CMS overview</p>
      </div>

      {/* ── Stat Cards */}
      {loading ? <StatSkeleton/> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {STAT_META.map(({ key, label, icon: Icon, color, link }) => (
            <div key={key}
              onClick={() => navigate(link)}
              className={CLS.card + " p-4 cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(107,58,31,0.12)] transition-all duration-200 group"}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${color}15`, color }}>
                <Icon size={20}/>
              </div>
              <p className="text-2xl font-black text-gray-900 leading-none mb-1">
                {data?.stats?.[key] ?? "—"}
              </p>
              <p className="text-xs font-semibold text-gray-500">{label}</p>
              <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold" style={{ color }}>View all</span>
                <MdArrowUpward size={10} style={{ color, transform:"rotate(45deg)" }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Charts Row */}
      {!loading && (barData.length > 0 || cityData.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Bar — Projects by status */}
          {barData.length > 0 && (
            <div className={CLS.card + " p-5"}>
              <p className="font-black text-gray-800 text-sm mb-4">Projects by Status</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={32}>
                  <XAxis dataKey="name" tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:"#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false}/>
                  <Tooltip
                    contentStyle={{ borderRadius:12, border:"1px solid #EDE5DD", fontSize:12, boxShadow:"0 4px 16px rgba(107,58,31,0.12)" }}
                    cursor={{ fill:"rgba(107,58,31,0.05)" }}/>
                  <Bar dataKey="count" fill="#6B3A1F" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie — Projects by city */}
          {cityData.length > 0 && (
            <div className={CLS.card + " p-5"}>
              <p className="font-black text-gray-800 text-sm mb-4">Top Cities</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={cityData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    dataKey="value" nameKey="name" paddingAngle={3}>
                    {cityData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:12, border:"1px solid #EDE5DD", fontSize:12 }}/>
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize:11, color:"#6B7280" }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Recent Projects */}
      {!loading && data?.recentProjects?.length > 0 && (
        <div className={CLS.card + " overflow-hidden"}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0EAE2]">
            <p className="font-black text-gray-800 text-sm">Recent Projects</p>
            <button onClick={() => navigate("/nestory/projects")}
              className="flex items-center gap-1 text-xs font-bold text-[#6B3A1F] hover:underline">
              View all <MdOpenInNew size={13}/>
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className={CLS.thead}>
                <th className={CLS.th}>Project</th>
                <th className={CLS.th}>Status</th>
                <th className={CLS.th}>City</th>
                <th className={CLS.th}>Added</th>
                <th className={CLS.th}></th>
              </tr>
            </thead>
            <tbody>
              {data.recentProjects.map(p => (
                <tr key={p._id} className={CLS.tr}>
                  <td className={CLS.td}>
                    <p className="font-semibold text-gray-900 text-xs">{p.title}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.priceLabel || "—"}</p>
                  </td>
                  <td className={CLS.td}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === "Ready To Move"      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      p.status === "New Launch"         ? "bg-[#6B3A1F]/10 text-[#6B3A1F] border border-[#6B3A1F]/20" :
                      p.status === "Under Construction" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}>{p.status}</span>
                  </td>
                  <td className={CLS.td + " text-xs text-gray-500"}>{p.city?.name || "—"}</td>
                  <td className={CLS.td + " text-xs text-gray-400"}>{dayjs(p.createdAt).format("DD MMM YY")}</td>
                  <td className={CLS.td}>
                    <button onClick={() => navigate(`/nestory/projects/edit/${p._id}`)}
                      className="text-[10px] font-bold text-[#6B3A1F] hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Quick Actions */}
      <div className={CLS.card + " p-5"}>
        <p className="font-black text-gray-800 text-sm mb-4">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label:"+ New Project",  to:"/nestory/projects/add",   color:"bg-[#1C0F05] text-[#E8D5B0]" },
            { label:"+ Add City",     to:"/nestory/cities",         color:"bg-blue-600 text-white"       },
            { label:"+ Add Builder",  to:"/nestory/builders",       color:"bg-purple-600 text-white"     },
            { label:"+ Add Video",    to:"/nestory/videos",         color:"bg-red-600 text-white"        },
            { label:"+ New Blog",     to:"/nestory/blogs/add",      color:"bg-emerald-600 text-white"    },
          ].map(({ label, to, color }) => (
            <button key={to} onClick={() => navigate(to)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5 ${color}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}