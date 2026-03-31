import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createUser,
  updateUser,
  deleteUser,
  markUserPaid,
  fetchUsers,
} from "../redux/slices/userSlice";
import { fetchPlots } from "../redux/slices/plotSlice";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaMoneyBillWave,
  FaSearch,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import toast from "react-hot-toast";

const UserManagement = ({ refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user",
  });

  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.users);
  const { plots } = useSelector((state) => state.plots);

  useEffect(() => {
    dispatch(fetchPlots());
  }, [dispatch]);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await dispatch(
          updateUser({ id: editingUser._id, data: formData }),
        ).unwrap();
        toast.success("User updated successfully!");
      } else {
        await dispatch(createUser(formData)).unwrap();
        toast.success("User created successfully!");
      }
      await refreshData();
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
      });
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        toast.success("User deleted successfully!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to delete user");
      }
    }
  };

  const handleMarkPaid = (user) => {
    setSelectedUser(user);
    setPaymentAmount(0);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async () => {
    if (paymentAmount > 0) {
      try {
        await dispatch(
          markUserPaid({ id: selectedUser._id, amount: paymentAmount }),
        ).unwrap();
        toast.success(`Payment of KSh ${paymentAmount} added successfully!`);
        await refreshData();
        setShowPaymentModal(false);
        setSelectedUser(null);
        setPaymentAmount(0);
      } catch (error) {
        toast.error(error.message || "Failed to add payment");
      }
    } else {
      toast.error("Please enter a valid amount");
    }
  };

  const getPlotName = (plotId) => {
    const plot = plots.find((p) => p._id === plotId);
    return plot ? plot.name : "Not Assigned";
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          User Management
        </h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-mobile pl-10"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary whitespace-nowrap"
          >
            <FaPlus className="mr-2" /> Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user._id} className="card-mobile">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{user.name}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaPhone className="mr-1 text-xs" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaEnvelope className="mr-1 text-xs" />
                    <span className="text-xs">{user.email}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getPaymentColor(user.paymentStatus)}`}
                  >
                    {user.paymentStatus}
                  </span>
                  <span className="text-xs text-gray-500">
                    Plot: {getPlotName(user.plotId)}
                  </span>
                  <span className="text-xs font-semibold text-green-600">
                    Paid: KSh {user.paidAmount || 0}
                  </span>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleMarkPaid(user)}
                  className="p-2 text-green-500 hover:text-green-600"
                  title="Add Payment"
                >
                  <FaMoneyBillWave />
                </button>
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <div className="bg-green-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  {editingUser ? "Edit User" : "Add New User"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "user",
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
                    required={!editingUser}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current"
                        : "Min 6 characters"
                    }
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
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "user",
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700"
                >
                  {editingUser ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <div className="bg-green-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  Add Payment
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedUser(null);
                    setPaymentAmount(0);
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

            <div className="p-5">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium">{selectedUser?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{selectedUser?.phone}</span>
                </div>
              </div>

              <div
                className={`rounded-lg p-3 mb-4 text-sm ${
                  selectedUser?.paymentStatus === "paid"
                    ? "bg-green-50 border border-green-200"
                    : selectedUser?.paymentStatus === "partial"
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold ${
                      selectedUser?.paymentStatus === "paid"
                        ? "text-green-600"
                        : selectedUser?.paymentStatus === "partial"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {selectedUser?.paymentStatus?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold">
                    KSh {selectedUser?.paidAmount || 0}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (KSh)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    KSh
                  </span>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) =>
                      setPaymentAmount(parseFloat(e.target.value))
                    }
                    className="w-full pl-12 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedUser(null);
                    setPaymentAmount(0);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!paymentAmount || paymentAmount <= 0}
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Add Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
