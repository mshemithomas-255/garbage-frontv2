import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaCalendarCheck,
  FaTrash,
  FaUserCircle,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import { fetchUsers } from "../redux/slices/userSlice";
import { fetchPlots } from "../redux/slices/plotSlice";
import { logout } from "../redux/slices/authSlice";
import ProfileModal from "../components/ProfileModal";

const UserDashboard = () => {
  const [view, setView] = useState("monthly");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: authUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { plots } = useSelector((state) => state.plots);

  const currentUser = users.find((u) => u._id === authUser?.id);
  const userPlot = plots.find((p) => p._id === currentUser?.plotId);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPlots());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const generatePaymentHistory = () => {
    const months = ["January", "February", "March", "April", "May", "June"];
    return months.map((month) => ({
      month,
      dueDate: `Jan 31, 2024`,
      status: currentUser?.paymentStatus || "pending",
      amount: currentUser?.paidAmount || 0,
    }));
  };

  const paymentHistory = generatePaymentHistory();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              My Dashboard
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowProfileModal(true)}
                className="text-gray-600 hover:text-green-600 transition p-2"
                title="Profile Settings"
              >
                <FaUserCircle className="text-2xl" />
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-2 md:px-4 rounded-lg hover:bg-red-600 transition text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">My Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center">
              <FaUserCircle className="text-gray-400 mr-2" />
              <span className="text-gray-600">Name:</span>
              <span className="ml-2 font-medium">{currentUser?.name}</span>
            </div>
            <div className="flex items-center">
              <FaPhone className="text-gray-400 mr-2" />
              <span className="text-gray-600">Phone:</span>
              <span className="ml-2 font-medium">{currentUser?.phone}</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="text-gray-400 mr-2" />
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium text-sm">
                {currentUser?.email}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <FaMoneyBillWave className="text-green-600 text-xl md:text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-xs md:text-sm">
                  Payment Status
                </p>
                <p
                  className={`text-lg md:text-xl font-bold ${currentUser?.paymentStatus === "paid" ? "text-green-600" : "text-red-600"}`}
                >
                  {currentUser?.paymentStatus?.toUpperCase() || "PENDING"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <FaCalendarCheck className="text-blue-600 text-xl md:text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-xs md:text-sm">Paid Amount</p>
                <p className="text-lg md:text-xl font-bold text-gray-800">
                  KSh {currentUser?.paidAmount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <FaTrash className="text-purple-600 text-xl md:text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-xs md:text-sm">My Plot</p>
                <p className="text-lg md:text-xl font-bold text-gray-800">
                  {userPlot?.name || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-bold">Payment History</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView("monthly")}
                  className={`px-3 py-2 rounded text-sm ${view === "monthly" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setView("annually")}
                  className={`px-3 py-2 rounded text-sm ${view === "annually" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  Annually
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {paymentHistory.map((payment, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded gap-2"
                >
                  <div>
                    <p className="font-semibold">{payment.month} 2024</p>
                    <p className="text-xs md:text-sm text-gray-500">
                      Due Date: {payment.dueDate}
                    </p>
                    {payment.amount > 0 && (
                      <p className="text-xs md:text-sm text-gray-500">
                        Paid: KSh {payment.amount}
                      </p>
                    )}
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs md:text-sm ${getPaymentColor(payment.status)}`}
                  >
                    {payment.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default UserDashboard;
