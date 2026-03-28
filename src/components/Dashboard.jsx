import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaMapMarkerAlt,
  FaChartLine,
  FaUsers,
  FaMoneyBillWave,
} from "react-icons/fa";

const Dashboard = ({ refreshData }) => {
  const [view, setView] = useState("monthly");
  const { locations } = useSelector((state) => state.locations);
  const { plots } = useSelector((state) => state.plots);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const totalExpected = plots.reduce(
    (sum, plot) => sum + (plot.expectedAmount || 0),
    0,
  );
  const totalPaid = plots.reduce(
    (sum, plot) => sum + (plot.paidAmount || 0),
    0,
  );
  const totalExpenses = plots.reduce(
    (sum, plot) => sum + (plot.expenses || 0),
    0,
  );

  const paidUsers = users.filter((u) => u.paymentStatus === "paid").length;
  const pendingUsers = users.filter(
    (u) => u.paymentStatus === "pending",
  ).length;
  const partialUsers = users.filter(
    (u) => u.paymentStatus === "partial",
  ).length;

  const stats = [
    {
      label: "Locations",
      value: locations.length,
      icon: FaMapMarkerAlt,
      color: "blue",
    },
    { label: "Plots", value: plots.length, icon: FaChartLine, color: "green" },
    { label: "Users", value: users.length, icon: FaUsers, color: "purple" },
    {
      label: "Collection Rate",
      value: `${totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0}%`,
      icon: FaMoneyBillWave,
      color: "orange",
    },
  ];

  const monthlyData = [
    { name: "Jan", paid: 5000, expected: 8000 },
    { name: "Feb", paid: 6200, expected: 8000 },
    { name: "Mar", paid: 7800, expected: 8000 },
    { name: "Apr", paid: 8100, expected: 8000 },
    { name: "May", paid: 7900, expected: 8000 },
    { name: "Jun", paid: 8200, expected: 8000 },
  ];

  const yearlyData = [
    { name: "2020", paid: 45000, expected: 96000 },
    { name: "2021", paid: 72000, expected: 96000 },
    { name: "2022", paid: 89000, expected: 96000 },
    { name: "2023", paid: 94000, expected: 96000 },
  ];

  const chartData = view === "monthly" ? monthlyData : yearlyData;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setView("monthly")}
            className={`px-3 py-2 md:px-4 rounded text-sm md:text-base ${
              view === "monthly" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setView("annually")}
            className={`px-3 py-2 md:px-4 rounded text-sm md:text-base ${
              view === "annually" ? "bg-green-500 text-white" : "bg-gray-200"
            }`}
          >
            Annual
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-100 text-blue-600",
            green: "bg-green-100 text-green-600",
            purple: "bg-purple-100 text-purple-600",
            orange: "bg-orange-100 text-orange-600",
          };
          return (
            <div key={index} className="stat-card-mobile">
              <div className="flex items-center justify-between mb-2">
                <div className={`${colorClasses[stat.color]} p-2 rounded-lg`}>
                  <Icon className="text-lg md:text-xl" />
                </div>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-gray-800">
                {stat.value}
              </p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card-mobile">
          <h2 className="text-lg md:text-xl font-bold mb-4">
            Payment Overview
          </h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `KSh ${value}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="paid"
                  stroke="#10B981"
                  name="Paid"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expected"
                  stroke="#EF4444"
                  name="Expected"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-mobile">
          <h2 className="text-lg md:text-xl font-bold mb-4">Payment Status</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { status: "Paid", count: paidUsers },
                  { status: "Pending", count: pendingUsers },
                  { status: "Partial", count: partialUsers },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" name="Users" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Location Summary */}
      <div className="card-mobile">
        <h2 className="text-lg md:text-xl font-bold mb-4">Location Summary</h2>
        <div className="space-y-3">
          {locations.map((location) => (
            <div key={location._id} className="border rounded-lg p-3 md:p-4">
              <h3 className="font-semibold text-base md:text-lg mb-2">
                {location.name}
              </h3>
              <div className="grid grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm">
                <div>
                  <p className="text-gray-500">Expected</p>
                  <p className="font-semibold">
                    KSh {location.totalExpectedAmount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Paid</p>
                  <p className="font-semibold text-green-600">
                    KSh {location.totalPaidAmount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Expenses</p>
                  <p className="font-semibold text-red-600">
                    KSh {location.totalExpenses || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
