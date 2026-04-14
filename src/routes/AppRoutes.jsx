import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/Auth/Login";

import Dashboard from "../pages/Dashboard/Dashboard";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import ManagerDashboard from "../pages/Dashboard/ManagerDashboard";
import ExecutiveDashboard from "../pages/Dashboard/ExecutiveDashboard";

import UserList from '../pages/Users/UserList';
import CreateUser from '../pages/Users/CreateUser';
import UserDetail from '../pages/Users/UserDetail';
import UserEdit from '../pages/Users/UserEdit';

// ── PROJECTS ──
import ProjectList from '../pages/Projects/ProjectList';
import ProjectCreate from '../pages/Projects/ProjectCreate';
import ProjectEdit from '../pages/Projects/ProjectEdit';
import ProjectShow from '../pages/Projects/ProjectShow';

import PropertiesList from "../pages/Properties/PropertyList";
import PropertyCreate from "../pages/Properties/PropertyCreate";
import PropertyEdit from "../pages/Properties/PropertyEdit";
import PropertyShow from "../pages/Properties/PropertyShow";

// ── CITIES ──
import CityList from '../pages/Cities/CityList';
import CityCreate from '../pages/Cities/CityCreate';
import CityEdit from '../pages/Cities/CityEdit';
import CityShow from '../pages/Cities/CityShow';

// ── BUILDERS ──
import BuilderList from '../pages/Builders/BuilderList';
import BuilderCreate from '../pages/Builders/BuilderCreate';
import BuilderEdit from '../pages/Builders/BuilderEdit';
import BuilderShow from '../pages/Builders/BuilderShow';

// ── BLOG / POSTS ──
import BlogList from '../pages/Blog/BlogList';
import BlogCreate from '../pages/Blog/BlogCreate';
import BlogEdit from '../pages/Blog/BlogEdit';
import BlogShow from '../pages/Blog/BlogShow';

// ── VIDEOS ──
import VideoList from '../pages/Video/VideoList';
import VideoCreate from '../pages/Video/VideoCreate';
import VideoEdit from '../pages/Video/VideoEdit';
import VideoShow from '../pages/Video/VideoShow';

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

import AuthContext from "../context/AuthContext";
import RoleRoute from "./RoleRoute";

const Layout = ({ children }) => (
  <div className="flex h-screen bg-gray-50">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>
      <Footer />
    </div>
  </div>
);

const NestoryRoles = ["superadmin", "admin", "manager", "executive"];
const AdminRoles = ["superadmin", "admin"];
const ManagerRoles = ["superadmin", "admin", "manager"];

export default function AuthRoutes() {
  const { user } = useContext(AuthContext);

  const getRedirectDashboard = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "superadmin":  return "/";
      case "admin":       return "/admin/dashboard";
      case "manager":     return "/manager/dashboard";
      case "executive":   return "/executive/dashboard";
      default:            return "/login";
    }
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* ── DASHBOARDS ── */}
      <Route path="/" element={
        <RoleRoute roles={["superadmin"]}>
          <Layout><Dashboard /></Layout>
        </RoleRoute>
      }/>

      <Route path="/admin/dashboard" element={
        <RoleRoute roles={["superadmin", "admin"]}>
          <Layout><AdminDashboard /></Layout>
        </RoleRoute>
      }/>

      <Route path="/manager/dashboard" element={
        <RoleRoute roles={["superadmin", "manager"]}>
          <Layout><ManagerDashboard /></Layout>
        </RoleRoute>
      }/>

      <Route path="/executive/dashboard" element={
        <RoleRoute roles={["superadmin", "executive"]}>
          <Layout><ExecutiveDashboard /></Layout>
        </RoleRoute>
      }/>

      {/* ── USERS ── */}
      <Route path="/users" element={
        <RoleRoute roles={ManagerRoles}>
          <Layout><UserList /></Layout>
        </RoleRoute>
      }/>

      <Route path="/users/create" element={
        <RoleRoute roles={ManagerRoles}>
          <Layout><CreateUser /></Layout>
        </RoleRoute>
      }/>

      <Route path="/users/:id" element={
        <RoleRoute roles={ManagerRoles}>
          <Layout><UserDetail /></Layout>
        </RoleRoute>
      }/>

      <Route path="/users/edit/:id" element={
        <RoleRoute roles={ManagerRoles}>
          <Layout><UserEdit /></Layout>
        </RoleRoute>
      }/>

      {/* ═══════════════════════════════════════════════════
          NESTORY CMS - PROJECTS
      ═══════════════════════════════════════════════════ */}
      <Route path="/projects" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><ProjectList /></Layout>
        </RoleRoute>
      }/>

      <Route path="/projects/add" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><ProjectCreate /></Layout>
        </RoleRoute>
      }/>

      <Route path="/projects/edit/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><ProjectEdit /></Layout>
        </RoleRoute>
      }/>

      <Route path="/projects/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><ProjectShow /></Layout>
        </RoleRoute>
      }/>

      {/* properties */}

      <Route path="/properties" element={
         <RoleRoute roles={NestoryRoles}>
         <Layout><PropertiesList /></Layout>
         </RoleRoute>     
      } />

      <Route path="/properties/add" element={
         <RoleRoute roles={NestoryRoles}>
         <Layout><PropertyCreate /></Layout>
         </RoleRoute>
        
      } />
      <Route path="/properties/edit/:id" element={
         
         <RoleRoute roles={NestoryRoles}>
         <Layout><PropertyEdit /></Layout>
         </RoleRoute>
      } />
      <Route path="/properties/:id" element={
          <RoleRoute roles={NestoryRoles}>
          <Layout><PropertyShow /></Layout>
          </RoleRoute>
        
      } />

      {/* ═══════════════════════════════════════════════════
          NESTORY CMS - CITIES
      ═══════════════════════════════════════════════════ */}
      <Route path="/cities" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><CityList /></Layout>
        </RoleRoute>
      }/>

      <Route path="/cities/add" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><CityCreate /></Layout>
        </RoleRoute>
      }/>

      <Route path="/cities/edit/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><CityEdit /></Layout>
        </RoleRoute>
      }/>

      <Route path="/cities/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><CityShow /></Layout>
        </RoleRoute>
      }/>

      {/* ═══════════════════════════════════════════════════
          NESTORY CMS - BUILDERS
      ═══════════════════════════════════════════════════ */}
      <Route path="/builders" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BuilderList /></Layout>
        </RoleRoute>
      }/>

      <Route path="/builders/add" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BuilderCreate /></Layout>
        </RoleRoute>
      }/>

      <Route path="/builders/edit/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BuilderEdit /></Layout>
        </RoleRoute>
      }/>

      <Route path="/builders/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BuilderShow /></Layout>
        </RoleRoute>
      }/>

      {/* ═══════════════════════════════════════════════════
          NESTORY CMS - BLOG / POSTS
      ═══════════════════════════════════════════════════ */}
      <Route path="/blogs" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BlogList /></Layout>
        </RoleRoute>
      }/>

      <Route path="/blogs/add" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BlogCreate /></Layout>
        </RoleRoute>
      }/>

      <Route path="/blogs/edit/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BlogEdit /></Layout>
        </RoleRoute>
      }/>

      <Route path="/blogs/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><BlogShow /></Layout>
        </RoleRoute>
      }/>

      {/* ═══════════════════════════════════════════════════
          NESTORY CMS - VIDEOS
      ═══════════════════════════════════════════════════ */}
      <Route path="/videos" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><VideoList /></Layout>
        </RoleRoute>
      }/>

      <Route path="/videos/add" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><VideoCreate /></Layout>
        </RoleRoute>
      }/>

      <Route path="/videos/edit/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><VideoEdit /></Layout>
        </RoleRoute>
      }/>

      <Route path="/videos/:id" element={
        <RoleRoute roles={NestoryRoles}>
          <Layout><VideoShow /></Layout>
        </RoleRoute>
      }/>

      {/* ── UNAUTHORIZED ── */}
      <Route path="/unauthorized" element={
        <Layout>
          <div className="p-10 text-center">
            <h1 className="text-2xl font-bold text-red-600">🚫 Access Denied</h1>
            <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
          </div>
        </Layout>
      }/>

      {/* DEFAULT REDIRECT */}
      <Route path="*" element={<Navigate to={getRedirectDashboard()} />} />

    </Routes>
  );
}