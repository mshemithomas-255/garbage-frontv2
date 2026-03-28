import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaUserShield,
} from "react-icons/fa";

const MobileBottomNav = ({ userRole }) => {
  const menuItems = [
    { path: "/admin", name: "Dashboard", icon: <FaHome className="text-xl" /> },
    {
      path: "/admin/locations",
      name: "Locations",
      icon: <FaMapMarkerAlt className="text-xl" />,
    },
    {
      path: "/admin/plots",
      name: "Plots",
      icon: <FaChartLine className="text-xl" />,
    },
    {
      path: "/admin/users",
      name: "Users",
      icon: <FaUsers className="text-xl" />,
    },
  ];

  if (userRole === "superadmin") {
    menuItems.push({
      path: "/admin/admins",
      name: "Admins",
      icon: <FaUserShield className="text-xl" />,
    });
  }

  return (
    <nav className="bottom-nav">
      {menuItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? "bottom-nav-item-active" : ""}`
          }
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
