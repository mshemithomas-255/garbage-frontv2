import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";

const Sidebar = ({ sidebarOpen, user, onLogout }) => {
  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: <FaHome /> },
    { path: "/admin/locations", name: "Locations", icon: <FaMapMarkerAlt /> },
    { path: "/admin/plots", name: "Plots", icon: <FaChartLine /> },
    { path: "/admin/users", name: "Users", icon: <FaUsers /> },
  ];

  if (user?.role === "superadmin") {
    menuItems.push({
      path: "/admin/admins",
      name: "Admins",
      icon: <FaUserShield />,
    });
  }

  return (
    <div
      className={`hidden md:block fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-50 ${sidebarOpen ? "w-64" : "w-20"}`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">Garbage Collection</h1>
          ) : (
            <div className="flex justify-center">
              <FaTrash className="text-2xl" />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center py-3 px-4 mb-2 transition-colors ${
                  isActive
                    ? "bg-green-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`
              }
            >
              <div className="text-xl">{item.icon}</div>
              {sidebarOpen && <span className="ml-3">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="flex items-center w-full py-2 px-4 text-gray-300 hover:bg-gray-800 rounded transition-colors"
          >
            <FaSignOutAlt className="text-xl" />
            {sidebarOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
