import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdmins,
  createAdmin,
  deleteAdmin,
} from "../redux/slices/adminSlice";
import { FaTrash, FaPlus, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

const AdminManagement = ({ refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAdmin(formData)).unwrap();
      toast.success("Admin created successfully!");
      await refreshData();
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "admin" });
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
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mobile pl-10"
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
                <p className="text-sm text-gray-600">{admin.email}</p>
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
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">Add New Admin</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="input-mobile"
                  >
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      role: "admin",
                    });
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50"
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
