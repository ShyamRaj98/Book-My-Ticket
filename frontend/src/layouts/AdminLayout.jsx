import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Film,
  Building,
  ScreenShare,
  Clock,
  BarChart3,
  Layout,
  LogOut,
  Users
} from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { path: "/admin/movies", label: "Movies", icon: <Film size={22} /> },
    {
      path: "/admin/theaters",
      label: "Theaters",
      icon: <Building size={22} />,
    },
    {
      path: "/admin/seatlayout",
      label: "Seat Layout",
      icon: <Layout size={22} />,
    },
    {
      path: "/admin/screens",
      label: "Screens",
      icon: <ScreenShare size={22} />,
    },
    { path: "/admin/showtimes", label: "Showtimes", icon: <Clock size={22} /> },
    { path: "/admin/reports", label: "Reports", icon: <BarChart3 size={22} /> },
    { path: "/admin/all-users", label: "Users", icon: <Users size={22} /> },
  ];

  const SidebarContent = () => (
    <div
      className={`flex flex-col h-full bg-white border-r-2 border-red-600 text-red-700 px-2 py-3 transition-all duration-300 shadow-md ${
        collapsed ? "w-auto" : "w-64"
      }`}
    >
      {/* Header */}
      <div
        className={`flex ${
          collapsed ? "justify-center" : "justify-between"
        } items-center mb-12 md:mb-8 gap-3`}
      >
        {!collapsed && (
          <div className="hidden md:block">
            <h2 className="text-2xl font-bold tracking-wide text-red-700">
              Dashboard
            </h2>
            <p className="text-sm text-gray-400">Movie Management</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex justify-center items-center p-1 rounded bg-red-600 hover:bg-red-500 text-white transition shadow-md"
        >
          {collapsed ? <Menu size={22} /> : <X size={22} />}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-2 py-2 rounded-md transition-all font-medium ${
                active
                  ? "bg-red-100 text-red-500 border-x-4 border-red-600"
                  : "text-gray-700 hover:bg-red-100 border-x-4 border-transparent hover:border-red-600"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Exit Button */}
      <Link
        to="/"
        className={`mt-6 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-semibold transition ${
          collapsed ? "px-2" : ""
        }`}
      >
        <LogOut size={18} />
        {!collapsed && <span>Exit Admin</span>}
      </Link>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-red-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="absolute top-4 left-4 z-50 p-2 bg-red-600 text-white rounded-md"
        >
          <Menu size={22} />
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40">
            <div className="absolute top-0 left-0 h-full w-64 z-50">
              <SidebarContent />
            </div>
            <div
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0"
            ></div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden">
        <div className="h-full overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
