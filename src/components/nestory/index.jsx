// src/components/nestory/index.jsx
// ─────────────────────────────────────────────────────────
// Shared components used across all Nestory CMS pages
// Exports: useToast, DeleteModal, FormHeader, Field,
//          TabBar, ImageUploader, EmptyState, TableSkeleton
// ─────────────────────────────────────────────────────────
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBack, MdClose, MdDelete, MdCloudUpload } from "react-icons/md";

// ─────────────────────────────────────────────────────────
// 1. useToast — lightweight toast notification
//    Usage: const { toast } = useToast();
//           toast("Saved!", "success")
//           toast("Error msg", "error")
// ─────────────────────────────────────────────────────────
export function useToast() {
  const toast = (message, type = "success") => {
    // Remove any existing toast
    document.querySelectorAll(".nestory-toast").forEach(el => el.remove());

    const el = document.createElement("div");
    el.className = "nestory-toast";

    const isError   = type === "error";
    const isWarning = type === "warning";

    el.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      animation: nestory-slide-in 0.25s ease;
      max-width: 360px;
      ${isError
        ? "background:#FEF2F2; color:#B91C1C; border:1px solid #FECACA;"
        : isWarning
          ? "background:#FFFBEB; color:#92400E; border:1px solid #FDE68A;"
          : "background:#F0FDF4; color:#166534; border:1px solid #BBF7D0;"
      }
    `;

    // Icon
    const icon = document.createElement("span");
    icon.textContent = isError ? "✕" : isWarning ? "⚠" : "✓";
    icon.style.cssText = `
      width: 18px; height: 18px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 900; flex-shrink: 0;
      ${isError
        ? "background:#FCA5A5; color:#B91C1C;"
        : isWarning
          ? "background:#FDE68A; color:#92400E;"
          : "background:#86EFAC; color:#166534;"
      }
    `;

    const text = document.createElement("span");
    text.textContent = message;

    el.appendChild(icon);
    el.appendChild(text);
    document.body.appendChild(el);

    // Add keyframes once
    if (!document.getElementById("nestory-toast-style")) {
      const style = document.createElement("style");
      style.id = "nestory-toast-style";
      style.textContent = `
        @keyframes nestory-slide-in {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateX(110%)";
      el.style.transition = "all 0.3s ease";
      setTimeout(() => el.remove(), 300);
    }, 3000);
  };

  return { toast };
}

// ─────────────────────────────────────────────────────────
// 2. DeleteModal — Confirm before delete
//    Usage: <DeleteModal title="..." message="..." onConfirm={fn} onCancel={fn} />
// ─────────────────────────────────────────────────────────
export function DeleteModal({ title = "Delete?", message = "This cannot be undone.", onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl border border-[#EDE5DD] shadow-[0_20px_60px_rgba(0,0,0,0.20)] w-full max-w-sm p-6 animate-[scale-in_0.2s_ease]">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
          <MdDelete size={24} className="text-red-500"/>
        </div>
        {/* Text */}
        <h3 className="font-black text-gray-900 text-center text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center leading-relaxed mb-6">{message}</p>
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-[#EDE5DD] text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 active:scale-[0.97] transition-all">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 3. FormHeader — Page header with back button + save action
//    Usage: <FormHeader title="..." backPath="/..." onSave={fn} saving={bool} extra={<jsx/>} />
// ─────────────────────────────────────────────────────────
export function FormHeader({ title, subtitle, backPath, onSave, saving = false, extra }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Left — back + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(backPath)}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-[#EDE5DD] text-gray-500 hover:text-gray-800 hover:border-gray-300 bg-white transition-all">
          <MdArrowBack size={18}/>
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right — extra + cancel + save */}
      <div className="flex items-center gap-3 flex-wrap">
        {extra}
        <button
          onClick={() => navigate(backPath)}
          className="inline-flex items-center justify-center gap-2 border border-[#EDE5DD] text-[#6B3A1F] hover:bg-[#6B3A1F]/8 font-semibold px-4 py-2.5 rounded-xl transition-all text-sm">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 bg-[#1C0F05] text-[#E8D5B0] hover:bg-[#3B1D0D] font-semibold px-5 py-2.5 rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#E8D5B0] border-t-transparent animate-spin"/>
              Saving…
            </>
          ) : "Save"}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 4. Field — Form field wrapper with label + hint
//    Usage: <Field label="Name" required hint="Max 50 chars">
//             <input .../>
//           </Field>
// ─────────────────────────────────────────────────────────
export function Field({ label, required = false, hint, children, cls = "" }) {
  return (
    <div className={cls}>
      {label && (
        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1.5">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && (
        <p className="text-[10px] text-gray-400 mt-1">{hint}</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 5. TabBar — Horizontal tab navigation
//    Usage: <TabBar tabs={[{key:"a",label:"A"}]} active="a" onChange={fn} />
// ─────────────────────────────────────────────────────────
export function TabBar({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-white rounded-xl border border-[#EDE5DD] overflow-x-auto">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`
            flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold
            transition-all duration-150 whitespace-nowrap
            ${active === t.key
              ? "bg-[#1C0F05] text-[#E8D5B0] shadow-sm"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
            }
          `}>
          {t.icon && <span className="text-sm">{t.icon}</span>}
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 6. ImageUploader — Upload + preview images grid
//    Usage: <ImageUploader
//              existing={[{_id, url, isPrimary}]}
//              newFiles={File[]}
//              onChange={setFiles}
//              onRemoveExisting={fn}   ← optional, only for edit
//           />
// ─────────────────────────────────────────────────────────
export function ImageUploader({ existing = [], newFiles = [], onChange, onRemoveExisting }) {
  const inputRef = useRef();

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    onChange([...newFiles, ...selected]);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeNew = (index) => {
    onChange(newFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">

      {/* ── Existing images */}
      {existing.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">
            Existing Images ({existing.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {existing.map((img) => (
              <div
                key={img._id}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#EDE5DD] bg-gray-50">
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = "none"; }}
                />
                {/* Primary badge */}
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 text-[8px] font-black bg-[#6B3A1F] text-[#E8D5B0] px-1.5 py-0.5 rounded-md">
                    PRIMARY
                  </span>
                )}
                {/* Remove button */}
                {onRemoveExisting && (
                  <button
                    onClick={() => onRemoveExisting(img._id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110">
                    <MdClose size={12}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Upload zone */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">
          {existing.length > 0 ? "Add More Images" : "Upload Images"}
        </p>
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[#EDE5DD] hover:border-[#6B3A1F]/50 cursor-pointer transition-colors bg-[#6B3A1F]/[0.015] hover:bg-[#6B3A1F]/[0.03] group">
          <div className="w-12 h-12 rounded-xl bg-[#6B3A1F]/8 flex items-center justify-center group-hover:bg-[#6B3A1F]/15 transition-colors">
            <MdCloudUpload size={24} className="text-[#6B3A1F]/60"/>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">Click to upload images</p>
            <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, WEBP — Max 10MB each · Multiple allowed</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFiles}
          />
        </label>
      </div>

      {/* ── New files preview */}
      {newFiles.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-3">
            New Images to Upload ({newFiles.length})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2.5">
            {newFiles.map((file, i) => (
              <div
                key={i}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-[#EDE5DD] bg-gray-50">
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Primary label */}
                {i === 0 && existing.length === 0 && (
                  <span className="absolute top-1 left-1 text-[8px] font-black bg-[#6B3A1F] text-[#E8D5B0] px-1.5 py-0.5 rounded-md">
                    PRIMARY
                  </span>
                )}
                {/* New badge */}
                <span className="absolute bottom-1 right-1 text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded-md">
                  NEW
                </span>
                {/* Remove */}
                <button
                  onClick={() => removeNew(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600">
                  <MdClose size={12}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 7. EmptyState — Empty list / no data state
//    Usage: <EmptyState icon={MdApartment} message="No projects" action={<button>Add</button>} />
// ─────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, message = "No data found", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-gray-300"/>
        </div>
      )}
      <p className="text-sm font-semibold text-gray-400 mb-4">{message}</p>
      {action}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 8. TableSkeleton — Animated loading rows for AG Grid / tables
//    Usage: <TableSkeleton cols={5} rows={6} />
// ─────────────────────────────────────────────────────────
export function TableSkeleton({ cols = 5, rows = 6 }) {
  const widths = ["w-32","w-24","w-20","w-28","w-16"];
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-[#F7F3EF]">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className={`h-4 bg-gray-100 rounded-lg animate-pulse ${widths[c % widths.length]}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}