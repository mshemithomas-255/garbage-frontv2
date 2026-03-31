import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdmins,
  createAdmin,
  deleteAdmin,
} from "../redux/slices/adminSlice";
import { FaTrash, FaPlus, FaSearch, FaPhone, FaEnvelope } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminManagement = ({ refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useDispatch();
  const { admins, loading } = useSelector((state) => state.admins);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAdmin(formData)).unwrap();
      toast.success("Admin created successfully!");
      await refreshData();
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "admin",
      });
    } catch (error) {
      toast.error(error.message || "Failed to create admin");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin?")) {
      try {
        await dispatch(deleteAdmin(id)).unwrap();
        toast.success("Admin deleted successfully!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to delete admin");
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Admin Management
        </h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mobile pl-9"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary whitespace-nowrap"
          >
            <FaPlus className="mr-2" /> Add Admin
          </button>
        </div>
      </div>

      {/* Admins List */}
      <div className="space-y-3">
        {filteredAdmins.map((admin) => (
          <div key={admin._id} className="card-mobile">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{admin.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-1 text-xs" />
                    <span>{admin.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaEnvelope className="mr-1 text-xs" />
                    <span className="text-xs">{admin.email}</span>
                  </div>
                </div>
                <span className="inline-block text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 mt-2">
                  {admin.role}
                </span>
              </div>
              {admin.role !== "superadmin" && (
                <button
                  onClick={() => handleDelete(admin._id)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Admin Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <div className="bg-green-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  Add New Admin
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "admin",
                    });
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 0712345678"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "admin",
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
