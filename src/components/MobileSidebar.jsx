import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaTrash,
  FaCog,
} from "react-icons/fa";
import ProfileModal from "./ProfileModal";

const MobileSidebar = ({ isOpen, onClose, user, onLogout }) => {
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

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
      {/* Overlay with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300"
          style={{ backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out z-50 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-green-500 rounded-lg p-2">
                <FaTrash className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Garbage Collection</h1>
                <p className="text-xs text-gray-400">Management System</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-5 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-700 rounded-full p-3">
                <FaUserCircle className="text-2xl text-green-400" />
              </div>
              <div>
                <p className="font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center py-3 px-5 mx-3 mb-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`
                }
              >
                <div className="text-xl">{item.icon}</div>
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-gray-700 pt-4 pb-6">
            <button
              onClick={() => {
                setShowProfileModal(true);
                onClose();
              }}
              className="flex items-center w-full py-3 px-5 mx-3 mb-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"
            >
              <FaCog className="text-xl" />
              <span className="ml-3 text-sm font-medium">Settings</span>
            </button>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center w-full py-3 px-5 mx-3 rounded-lg text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="ml-3 text-sm font-medium">Logout</span>
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

export default MobileSidebar;
