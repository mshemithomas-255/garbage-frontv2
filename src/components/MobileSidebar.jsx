import React, { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaTimes,
  FaSignOutAlt,
} from "react-icons/fa";

const MobileSidebar = ({ isOpen, onClose, user, onLogout }) => {
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
      {isOpen && <div className="overlay-mobile" onClick={onClose} />}

      <div
        className={`sidebar-mobile ${isOpen ? "sidebar-mobile-open" : "sidebar-mobile-closed"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h1 className="text-xl font-bold">Garbage Collection</h1>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center py-3 px-4 mb-2 transition-colors ${
                    isActive
                      ? "bg-green-600 text-white"
                      : "text-gray-300 hover:bg-gray-800"
                  }`
                }
              >
                <div className="text-xl">{item.icon}</div>
                <span className="ml-3">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center w-full py-2 px-4 text-gray-300 hover:bg-gray-800 rounded transition-colors"
            >
              <FaSignOutAlt className="text-xl" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileSidebar;
