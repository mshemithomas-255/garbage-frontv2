import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import MobileBottomNav from "../components/MobileBottomNav";
import Dashboard from "../components/Dashboard";
import LocationManagement from "../components/LocationManagement";
import PlotManagement from "../components/PlotManagement";
import UserManagement from "../components/UserManagement";
import AdminManagement from "../components/AdminManagement";
import { logout } from "../redux/slices/authSlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import { fetchPlots } from "../redux/slices/plotSlice";
import { fetchUsers } from "../redux/slices/userSlice";
import { FaBars } from "react-icons/fa";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const refreshData = useCallback(async () => {
    await Promise.all([
      dispatch(fetchLocations()),
      dispatch(fetchPlots()),
      dispatch(fetchUsers()),
    ]);
  }, [dispatch]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100 pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "md:ml-64" : "md:ml-20"}`}
      >
        {/* Mobile Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20 md:relative">
          <div className="flex justify-between items-center px-4 py-3 md:px-6 md:py-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-600"
            >
              <FaBars className="text-2xl" />
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block text-gray-500 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-sm md:text-base text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-red-600 transition text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard refreshData={refreshData} />} />
            <Route
              path="/locations"
              element={<LocationManagement refreshData={refreshData} />}
            />
            <Route
              path="/plots"
              element={<PlotManagement refreshData={refreshData} />}
            />
            <Route
              path="/users"
              element={<UserManagement refreshData={refreshData} />}
            />
            <Route
              path="/admins"
              element={<AdminManagement refreshData={refreshData} />}
            />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userRole={user?.role} />
    </div>
  );
};

export default AdminDashboard;
