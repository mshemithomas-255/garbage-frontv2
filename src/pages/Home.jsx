import React from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaUsers, FaMapMarkerAlt, FaChartLine } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Garbage Collection System
            </h1>
            <Link
              to="/login"
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            Efficient Waste Management
          </h2>
          <p className="text-xl text-white opacity-90">
            Streamline your garbage collection operations with our comprehensive
            management system
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <div className="text-green-500 text-4xl mb-4 flex justify-center">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-xl font-bold mb-2">Location Management</h3>
            <p className="text-gray-600">
              Manage multiple collection locations with ease
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <div className="text-green-500 text-4xl mb-4 flex justify-center">
              <FaUsers />
            </div>
            <h3 className="text-xl font-bold mb-2">User Tracking</h3>
            <p className="text-gray-600">
              Track payments and user status in real-time
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6 text-center">
            <div className="text-green-500 text-4xl mb-4 flex justify-center">
              <FaChartLine />
            </div>
            <h3 className="text-xl font-bold mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Comprehensive reports and insights</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold text-center mb-6">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                1
              </div>
              <p className="font-semibold">Create Locations</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                2
              </div>
              <p className="font-semibold">Add Plots</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                3
              </div>
              <p className="font-semibold">Register Users</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 text-green-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                4
              </div>
              <p className="font-semibold">Track Payments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
