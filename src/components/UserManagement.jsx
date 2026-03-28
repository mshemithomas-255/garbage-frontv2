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
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
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
      setFormData({ name: "", email: "", password: "", role: "user" });
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
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
              placeholder="Search users..."
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

      {/* Users List - Mobile Optimized */}
      <div className="space-y-3">
        {filteredUsers.map((user) => (
          <div key={user._id} className="card-mobile">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
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
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
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
                    required={!editingUser}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to keep current password
                    </p>
                  )}
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
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                    setFormData({
                      name: "",
                      email: "",
                      password: "",
                      role: "user",
                    });
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
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
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">Add Payment</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">
                  User: {selectedUser?.name}
                </label>
                <label className="block text-sm font-bold mb-2">
                  Amount (KSh)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                  className="input-mobile"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current paid: KSh {selectedUser?.paidAmount || 0}
                </p>
                <p className="text-sm text-gray-500">
                  Status: {selectedUser?.paymentStatus}
                </p>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex space-x-2">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedUser(null);
                  setPaymentAmount(0);
                }}
                className="flex-1 px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg"
              >
                Add Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
