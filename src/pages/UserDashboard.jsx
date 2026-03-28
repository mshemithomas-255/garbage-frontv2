import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaMoneyBillWave, FaCalendarCheck, FaTrash } from "react-icons/fa";
import { fetchUsers } from "../redux/slices/userSlice";
import { fetchPlots } from "../redux/slices/plotSlice";

const UserDashboard = () => {
  const [view, setView] = useState("monthly");
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.users);
  const { plots } = useSelector((state) => state.plots);

  const currentUser = users.find((u) => u._id === authUser?.id);
  const userPlot = plots.find((p) => p._id === currentUser?.plotId);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchPlots());
  }, [dispatch]);

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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <FaMoneyBillWave className="text-green-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Payment Status</p>
                <p
                  className={`text-xl font-bold ${currentUser?.paymentStatus === "paid" ? "text-green-600" : "text-red-600"}`}
                >
                  {currentUser?.paymentStatus?.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <FaCalendarCheck className="text-blue-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">Paid Amount</p>
                <p className="text-xl font-bold text-gray-800">
                  KSh{currentUser?.paidAmount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-full p-3">
                <FaTrash className="text-purple-600 text-2xl" />
              </div>
              <div className="ml-4">
                <p className="text-gray-500 text-sm">My Plot</p>
                <p className="text-xl font-bold text-gray-800">
                  {userPlot?.name || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Payment History</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setView("monthly")}
                  className={`px-4 py-2 rounded ${view === "monthly" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setView("annually")}
                  className={`px-4 py-2 rounded ${view === "annually" ? "bg-green-500 text-white" : "bg-gray-200"}`}
                >
                  Annually
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">January 2024</p>
                  <p className="text-sm text-gray-500">
                    Due Date: Jan 31, 2024
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full ${getPaymentColor(currentUser?.paymentStatus)}`}
                >
                  {currentUser?.paymentStatus || "Pending"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
