import React, { useState, useEffect, useMemo } from "react";
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
  FaMapMarkerAlt,
  FaUsers,
} from "react-icons/fa";
import toast from "react-hot-toast";

// Constants
const PAYMENT_STATUS = {
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800",
    bgRow: "bg-green-50",
  },
  partial: {
    label: "Partial",
    color: "bg-yellow-100 text-yellow-800",
    bgRow: "bg-yellow-50",
  },
  pending: {
    label: "Pending",
    color: "bg-red-100 text-red-800",
    bgRow: "bg-red-50",
  },
  default: {
    label: "Pending",
    color: "bg-gray-100 text-gray-800",
    bgRow: "bg-gray-50",
  },
};

// Helper Components
const ModalHeader = ({ title, onClose }) => (
  <div className="bg-green-600 px-4 sm:px-5 py-3">
    <div className="flex justify-between items-center">
      <h2 className="text-base sm:text-lg font-semibold text-white">{title}</h2>
      <button
        onClick={onClose}
        className="text-white hover:bg-white hover:bg-opacity-20 rounded p-1 transition"
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
);

const FormInput = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const FormSelect = ({ label, value, onChange, options, required = false }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      required={required}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option._id} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

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

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term),
    );
  }, [users, searchTerm]);

  const getPaymentColor = (status) =>
    PAYMENT_STATUS[status]?.color || PAYMENT_STATUS.default.color;
  const getPaymentLabel = (status) =>
    PAYMENT_STATUS[status]?.label || PAYMENT_STATUS.default.label;
  const getRowColor = (status) =>
    PAYMENT_STATUS[status]?.bgRow || PAYMENT_STATUS.default.bgRow;

  const getPlotName = (plotId) => {
    const plot = plots.find((p) => p._id === plotId);
    return plot ? plot.name : "Not Assigned";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "user",
    });
  };

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
      resetForm();
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
    if (paymentAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
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
  };

  // User Row Component - Mobile Optimized with Color Coding
  const UserRow = ({ user }) => {
    const rowBgColor = getRowColor(user.paymentStatus);

    return (
      <div
        className={`${rowBgColor} rounded-lg mb-2 p-3 border transition-all duration-200`}
      >
        {/* Desktop View - Grid Layout */}
        <div className="hidden md:grid md:grid-cols-12 md:gap-3 md:items-center">
          <div className="col-span-3">
            <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
          </div>
          <div className="col-span-3">
            <div className="flex items-center">
              <FaPhone className="text-gray-400 text-xs mr-1.5" />
              <span className="text-sm text-gray-700">{user.phone}</span>
            </div>
          </div>
          <div className="col-span-3">
            <div className="flex items-center">
              <FaEnvelope className="text-gray-400 text-xs mr-1.5" />
              <span className="text-xs text-gray-600 truncate">
                {user.email}
              </span>
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-400 text-xs mr-1.5" />
              <span className="text-sm text-gray-700 truncate">
                {getPlotName(user.plotId)}
              </span>
            </div>
          </div>
          <div className="col-span-1 flex justify-center space-x-1">
            <button
              onClick={() => handleMarkPaid(user)}
              className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition"
              title="Add Payment"
            >
              <FaMoneyBillWave />
            </button>
            <button
              onClick={() => handleEdit(user)}
              className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              title="Edit User"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleDelete(user._id)}
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Delete User"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="md:hidden space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800 text-base">
                {user.name}
              </p>
              <div className="flex items-center mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getPaymentColor(user.paymentStatus)}`}
                >
                  {getPaymentLabel(user.paymentStatus)}
                </span>
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => handleMarkPaid(user)}
                className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Add Payment"
              >
                <FaMoneyBillWave className="text-base" />
              </button>
              <button
                onClick={() => handleEdit(user)}
                className="p-2 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                title="Edit User"
              >
                <FaEdit className="text-base" />
              </button>
              <button
                onClick={() => handleDelete(user._id)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Delete User"
              >
                <FaTrash className="text-base" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <FaPhone className="text-gray-400 text-xs mr-1.5" />
              <span className="text-gray-700">{user.phone}</span>
            </div>
            <div className="flex items-center">
              <FaEnvelope className="text-gray-400 text-xs mr-1.5" />
              <span className="text-gray-500 text-xs truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-1 border-t border-gray-100">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-400 text-xs mr-1.5" />
              <span className="text-xs text-gray-600">Plot:</span>
              <span className="text-xs text-gray-700 ml-1 truncate">
                {getPlotName(user.plotId)}
              </span>
            </div>
            <p className="text-sm font-bold text-green-600">
              KSh {user.paidAmount || 0}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sticky top-0 bg-gray-100 z-10 py-2">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">
          User Management
        </h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm font-medium whitespace-nowrap"
          >
            <FaPlus className="mr-1 text-xs" /> Add User
          </button>
        </div>
      </div>

      {/* Users List */}
      <div>
        {filteredUsers.length > 0 ? (
          <div>
            {/* Desktop Column Headers */}
            <div className="hidden md:grid md:grid-cols-12 md:gap-3 mb-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
              <div className="col-span-3">User Name</div>
              <div className="col-span-3">Mobile Number</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Plot Assigned</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
            <FaUsers className="text-gray-300 text-3xl sm:text-4xl mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No users found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-green-600 text-sm hover:text-green-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Form Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <ModalHeader
              title={editingUser ? "Edit User" : "Add New User"}
              onClose={() => {
                setIsModalOpen(false);
                setEditingUser(null);
                resetForm();
              }}
            />
            <form onSubmit={handleSubmit} className="p-4 sm:p-5">
              <div className="space-y-3">
                <FormInput
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                />
                <FormInput
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="e.g., 0712345678"
                  required
                />
                <FormInput
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                />
                <FormInput
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current"
                      : "Min 6 characters"
                  }
                  required={!editingUser}
                />
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
                    resetForm();
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
            <ModalHeader
              title="Add Payment"
              onClose={() => {
                setShowPaymentModal(false);
                setSelectedUser(null);
                setPaymentAmount(0);
              }}
            />
            <div className="p-4 sm:p-5">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium">{selectedUser?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{selectedUser?.phone}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Plot:</span>
                  <span className="font-medium">
                    {getPlotName(selectedUser?.plotId)}
                  </span>
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
