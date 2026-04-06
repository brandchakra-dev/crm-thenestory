import React, { useState, useEffect, useContext } from "react";
import { NavLink, useLocation, Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [openMenus,    setOpenMenus]    = useState({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  // Close mobile on route change
  useEffect(() => {
    if (isMobileOpen) closeMobileSidebar();
  }, [location]);

  // Listen for mobile toggle event from Navbar
  useEffect(() => {
    const handler = (e) => setIsMobileOpen(e.detail);
    window.addEventListener("mobileMenuToggle", handler);
    return () => window.removeEventListener("mobileMenuToggle", handler);
  }, []);

  // Auto-open menu if current path is inside that section
  useEffect(() => {
    const autoOpen = {};
    if (location.pathname.startsWith("/users"))   autoOpen.users   = true;
    if (location.pathname.startsWith("/nestory")) autoOpen.nestory = true;
    setOpenMenus(prev => ({ ...prev, ...autoOpen }));
  }, []);

  const toggleMenu = (menu) =>
    setOpenMenus(prev => ({ ...prev, [menu]: !prev[menu] }));

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
    document.body.style.overflow = "";
    window.dispatchEvent(new CustomEvent("mobileMenuToggle", { detail: false }));
  };

  // ── Role access
  const menuVisibility = {
    superadmin: ["dashboard", "users", "nestory"],
    admin:      ["dashboard", "users", "nestory"],
    manager:    ["dashboard", "users", "nestory"],
    executive:  ["dashboard",           "nestory"],
  };
  const hasAccess = (id) => menuVisibility[user?.role]?.includes(id);

  // ── Icons
  const Ic = {
    dashboard: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12l9-9 9 9M5 10v10h14V10"/>
      </svg>
    ),
    users: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 20v-2a4 4 0 00-3-3.87M9 12a4 4 0 110-8 4 4 0 010 8z"/>
      </svg>
    ),
    nestory: (
      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/>
      </svg>
    ),
    // sub icons (14px)
    allUsers: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    addUser: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/>
      </svg>
    ),
    overview: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    list: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
        <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
        <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    add: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
    chevron: (open) => (
      <svg
        className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
      </svg>
    ),
  };

  // ── Menu config
  const menuItems = [

    // Dashboard (single link)
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Ic.dashboard,
      to: user?.role === "superadmin" ? "/"
        : user?.role === "admin"      ? "/admin/dashboard"
        : user?.role === "manager"    ? "/manager/dashboard"
        : "/executive/dashboard",
    },

    // ── Team Management
    {
      id: "users",
      label: "Team Management",
      icon: Ic.users,
      isMenu: true,
      submenu: [
        { to: "/users",        label: "All Users", icon: Ic.allUsers },
        { to: "/users/create", label: "Add User",  icon: Ic.addUser,  roles: ["superadmin","admin","manager"] },
      ],
    },

    // ── Nestory CMS  (same expand/collapse pattern, sub-sections with dividers)
    {
      id: "nestory",
      label: "Nestory CMS",
      icon: Ic.nestory,
      isMenu: true,
      submenu: [

        // Projects
        { divider: true, label: "Projects" },
        { to: "/projects",     label: "All Projects", icon: Ic.list },
        { to: "/projects/add", label: "Add Project",  icon: Ic.add, roles: ["superadmin","admin","manager"] },

        // Cities
        { divider: true, label: "Cities" },
        { to: "/cities",     label: "All Cities", icon: Ic.list },
        { to: "/cities/add", label: "Add City",   icon: Ic.add,  roles: ["superadmin","admin","manager"] },

        // Builders
        { divider: true, label: "Builders" },
        { to: "/builders",     label: "All Builders", icon: Ic.list },
        { to: "/builders/add", label: "Add Builder",  icon: Ic.add, roles: ["superadmin","admin","manager"] },

        // Videos
        { divider: true, label: "Videos" },
        { to: "/videos",     label: "All Videos", icon: Ic.list },
        { to: "/videos/add", label: "Add Video",  icon: Ic.add,  roles: ["superadmin","admin","manager"] },

        // Blogs
        { divider: true, label: "Blogs" },
        { to: "/blogs",     label: "All Blogs", icon: Ic.list },
        { to: "/blogs/add", label: "New Blog",  icon: Ic.add,  roles: ["superadmin","admin","manager"] },
      ],
    },
  ];

  // ── CSS helpers
  const menuBtnCls = (active) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
     ${active
       ? "bg-[#6B3A1F]/10 text-[#6B3A1F] border border-[#6B3A1F]/20"
       : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`;

  const navLinkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
     ${isActive
       ? "bg-[#6B3A1F]/10 text-[#6B3A1F] border border-[#6B3A1F]/20"
       : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`;

  const subLinkCls = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-[7px] text-[13px] rounded-lg transition-all duration-200
     ${isActive
       ? "bg-[#6B3A1F]/10 text-[#6B3A1F] font-bold"
       : "text-gray-500 hover:bg-gray-100 hover:text-gray-800 font-medium"}`;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileSidebar}/>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-xl border-r border-gray-100
        flex flex-col h-screen
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>

        {/* Logo */}
        <Link to="/"
          className="flex items-center gap-3 px-5 py-[18px] border-b border-gray-100 flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#1C0F05,#3B1D0D)" }}>
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/nestory-icon.png" alt="Logo" className="h-7 w-auto"
              onError={e => { e.target.style.display = "none"; }}/>
          </div>
          <div>
            <h1 className="text-[15px] font-black text-white leading-none">The Nestory</h1>
            <p className="text-[10px] text-[#E8D5B0]/55 mt-0.5">Admin Panel</p>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {menuItems.filter(item => hasAccess(item.id)).map(item => (
            <div key={item.id}>

              {/* Expandable section */}
              {item.isMenu ? (
                <div>
                  <button onClick={() => toggleMenu(item.id)} className={menuBtnCls(openMenus[item.id])}>
                    <div className="flex items-center gap-2.5">
                      <span className={`transition-colors ${openMenus[item.id] ? "text-[#6B3A1F]" : "text-gray-400"}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {Ic.chevron(openMenus[item.id])}
                  </button>

                  {openMenus[item.id] && (
                    <div className="mt-1 ml-2 pl-3 border-l-2 border-[#EDE5DD] space-y-0.5 pb-1">
                      {item.submenu
                        .filter(sub => !sub.roles || sub.roles.includes(user?.role))
                        .map((sub, idx) => {

                          // Section divider
                          if (sub.divider) {
                            return (
                              <p key={`d${idx}`}
                                className="text-[9px] font-black text-[#C9A84C]/80 uppercase tracking-[0.14em] px-3 pt-3 pb-0.5 select-none">
                                {sub.label}
                              </p>
                            );
                          }

                          // Nav link
                          return (
                            <NavLink key={sub.to} to={sub.to} end={sub.exact} className={subLinkCls}>
                              {sub.icon && <span className="text-gray-400 flex-shrink-0">{sub.icon}</span>}
                              <span className="truncate">{sub.label}</span>
                            </NavLink>
                          );
                        })}
                    </div>
                  )}
                </div>

              ) : (
                // Single link
                <NavLink to={item.to} end className={navLinkCls}>
                  <span className="text-gray-400">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )}

            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[#FAF7F4] transition-colors">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg,#6B3A1F,#C9A84C)" }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate leading-tight">{user?.name || "User"}</p>
              <p className="text-[10px] text-gray-400 capitalize mt-0.5">{user?.role || "—"}</p>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}