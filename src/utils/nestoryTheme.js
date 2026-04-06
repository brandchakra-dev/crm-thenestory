// src/utils/nestoryTheme.js

export const CLS = {
  // Buttons
  btnPrimary:   "inline-flex items-center justify-center gap-2 bg-[#1C0F05] text-[#E8D5B0] hover:bg-[#3B1D0D] font-semibold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 active:scale-[0.97] text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0",
  btnSecondary: "inline-flex items-center justify-center gap-2 border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F]/8 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm",
  btnDanger:    "inline-flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm",
  btnGhost:     "inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 font-semibold px-3 py-2 rounded-xl transition-all text-sm",
  btnIcon:      "flex items-center justify-center p-2 rounded-xl transition-all hover:scale-105 active:scale-95 cursor-pointer",

  // Form
  input:        "w-full px-3 py-2.5 text-sm rounded-xl border border-[#EDE5DD] outline-none focus:border-[#6B3A1F] focus:ring-2 focus:ring-[#6B3A1F]/10 bg-white transition-all text-gray-900 placeholder:text-gray-400",
  select:       "w-full px-3 py-2.5 text-sm rounded-xl border border-[#EDE5DD] outline-none focus:border-[#6B3A1F] focus:ring-2 focus:ring-[#6B3A1F]/10 bg-white transition-all text-gray-900 cursor-pointer",
  textarea:     "w-full px-3 py-2.5 text-sm rounded-xl border border-[#EDE5DD] outline-none focus:border-[#6B3A1F] focus:ring-2 focus:ring-[#6B3A1F]/10 bg-white transition-all text-gray-900 resize-none placeholder:text-gray-400",
  label:        "block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5",
  fieldWrap:    "flex flex-col gap-0",

  // Cards
  card:         "bg-white rounded-2xl border border-[#EDE5DD] shadow-[0_2px_12px_rgba(107,58,31,0.06)]",
  cardHover:    "bg-white rounded-2xl border border-[#EDE5DD] shadow-[0_2px_12px_rgba(107,58,31,0.06)] hover:shadow-[0_8px_28px_rgba(107,58,31,0.12)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer",

  // Badges
  badgeGreen:  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200",
  badgeAmber:  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200",
  badgeBrown:  "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6B3A1F]/10 text-[#6B3A1F] border border-[#6B3A1F]/20",
  badgeRed:    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200",
  badgeBlue:   "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200",
  badgeGray:   "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200",

  // Layout
  pageHeader:   "flex flex-wrap items-center justify-between gap-3 mb-6",
  pageTitle:    "text-xl font-black text-gray-900",
  pageSubtitle: "text-xs text-gray-500 mt-0.5",

  // Table
  th: "px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap",
  td: "px-4 py-3 text-sm text-gray-700",
  tr: "border-b border-[#F7F3EF] hover:bg-[#6B3A1F]/[0.015] transition-colors",
  thead: "border-b border-[#F0EAE2] bg-[#6B3A1F]/[0.025]",
};

export const STATUS_COLORS = {
  "New Launch":         CLS.badgeBrown,
  "Ready To Move":      CLS.badgeGreen,
  "Under Construction": CLS.badgeAmber,
  "Upcoming":           CLS.badgeBlue,
};

export const statusBadge = (s) => STATUS_COLORS[s] ?? CLS.badgeGray;

// ✅ ADD THESE MISSING EXPORTS
export const BHK_OPTIONS = [
  { value: "1 BHK", label: "1 BHK" },
  { value: "2 BHK", label: "2 BHK" },
  { value: "3 BHK", label: "3 BHK" },
  { value: "4 BHK", label: "4 BHK" },
  { value: "5+ BHK", label: "5+ BHK" },
  { value: "Studio", label: "Studio" },
];

export const CITY_OPTIONS = [
  { value: "Noida", label: "Noida" },
  { value: "Gurugram", label: "Gurugram" },
  { value: "Greater Noida", label: "Greater Noida" },
  { value: "Ghaziabad", label: "Ghaziabad" },
  { value: "Faridabad", label: "Faridabad" },
  { value: "Delhi", label: "Delhi" },
  { value: "Yamuna Expressway", label: "Yamuna Expressway" },
];

export const STATUS_OPTIONS = [
  { value: "New Launch", label: "New Launch" },
  { value: "Ready To Move", label: "Ready To Move" },
  { value: "Under Construction", label: "Under Construction" },
  { value: "Upcoming", label: "Upcoming" },
];

export const PROPERTY_TYPES = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Builder Floor", label: "Builder Floor" },
  { value: "Plot", label: "Plot" },
  { value: "Penthouse", label: "Penthouse" },
];