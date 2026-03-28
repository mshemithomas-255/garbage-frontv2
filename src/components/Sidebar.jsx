import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaSignOutAlt,
  FaUserCircle,
  FaTrash,
  FaCog,
} from "react-icons/fa";
import ProfileModal from "./ProfileModal";

const Sidebar = ({ sidebarOpen, user, onLogout }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

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
    <>
      <div
        className={`hidden md:block fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 z-50 shadow-xl ${sidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-700">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="bg-green-500 rounded-lg p-2">
                  <FaTrash className="text-white text-xl" />
                </div>
                <h1 className="text-lg font-bold">Garbage Collection</h1>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="bg-green-500 rounded-lg p-2">
                  <FaTrash className="text-white text-xl" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 py-6 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 mb-2 mx-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <div className="text-xl">{item.icon}</div>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-gray-700 pt-4 pb-6">
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center w-full py-3 px-4 mx-2 mb-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              <FaUserCircle className="text-xl" />
              {sidebarOpen && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.role}</p>
                </div>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center w-full py-3 px-4 mx-2 mb-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              <FaCog className="text-xl" />
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">Settings</span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center w-full py-3 px-4 mx-2 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <FaSignOutAlt className="text-xl" />
              {sidebarOpen && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Sidebar;
