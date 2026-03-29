import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlot,
  updatePlot,
  deletePlot,
  addUserToPlot,
  removeUserFromPlot,
} from "../redux/slices/plotSlice";
import { fetchUsers, markUserPaid } from "../redux/slices/userSlice";
import { fetchLocations } from "../redux/slices/locationSlice";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaUserPlus,
  FaUserMinus,
  FaMoneyBillWave,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import toast from "react-hot-toast";

const PlotManagement = ({ refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedPlots, setExpandedPlots] = useState({});
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    locationId: "",
    expectedAmount: 0,
    paidAmount: 0,
    expenses: 0,
  });

  const dispatch = useDispatch();
  const { plots } = useSelector((state) => state.plots);
  const { locations } = useSelector((state) => state.locations);
  const { users } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchLocations());
  }, [dispatch]);

  const filteredPlots = plots.filter((plot) =>
    plot.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlot) {
        await dispatch(
          updatePlot({ id: editingPlot._id, data: formData }),
        ).unwrap();
        toast.success("Plot updated successfully!");
      } else {
        await dispatch(createPlot(formData)).unwrap();
        toast.success("Plot created successfully!");
      }
      await refreshData();
      setIsModalOpen(false);
      setEditingPlot(null);
      setFormData({
        name: "",
        locationId: "",
        expectedAmount: 0,
        paidAmount: 0,
        expenses: 0,
      });
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleEdit = (plot) => {
    setEditingPlot(plot);
    setFormData({
      name: plot.name,
      locationId: plot.locationId?._id || plot.locationId,
      expectedAmount: plot.expectedAmount || 0,
      paidAmount: plot.paidAmount || 0,
      expenses: plot.expenses || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this plot?")) {
      try {
        await dispatch(deletePlot(id)).unwrap();
        toast.success("Plot deleted successfully!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to delete plot");
      }
    }
  };

  const handleAddUser = (plot) => {
    setSelectedPlot(plot);
    setShowAddUserModal(true);
  };

  const handleMarkPaid = (user, plot) => {
    setSelectedUser(user);
    setSelectedPlot(plot);
    setPaymentAmount(0);
    setShowPaymentModal(true);
  };

  const handleRemoveUser = async (plotId, userId) => {
    if (
      window.confirm("Are you sure you want to remove this user from the plot?")
    ) {
      try {
        await dispatch(removeUserFromPlot({ plotId, userId })).unwrap();
        toast.success("User removed from plot successfully!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to remove user");
      }
    }
  };

  const handleAddUserToPlot = async (userId) => {
    try {
      await dispatch(
        addUserToPlot({ plotId: selectedPlot._id, userId }),
      ).unwrap();
      toast.success("User added to plot successfully!");
      await refreshData();
      setShowAddUserModal(false);
      setSelectedPlot(null);
    } catch (error) {
      toast.error(error.message || "Failed to add user");
    }
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
        setSelectedPlot(null);
        setPaymentAmount(0);
      } catch (error) {
        toast.error(error.message || "Failed to add payment");
      }
    } else {
      toast.error("Please enter a valid amount");
    }
  };

  const togglePlot = (plotId) => {
    setExpandedPlots((prev) => ({
      ...prev,
      [plotId]: !prev[plotId],
    }));
  };

  const getUsersNotInPlot = () => {
    if (!selectedPlot) return [];
    return users.filter(
      (user) =>
        user.role === "user" &&
        (!selectedPlot.users ||
          !selectedPlot.users.some((u) => u._id === user._id)),
    );
  };

  const getLocationName = (locationId) => {
    if (!locationId) return "Unknown";
    const location = locations.find(
      (l) => l._id === (locationId._id || locationId),
    );
    return location ? location.name : "Unknown";
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
          Plot Management
        </h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search plots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-mobile"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary whitespace-nowrap"
          >
            <FaPlus className="mr-2" /> Add Plot
          </button>
        </div>
      </div>

      {/* Plots Grid */}
      <div className="grid-mobile">
        {filteredPlots.map((plot) => (
          <div key={plot._id} className="card-mobile">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePlot(plot._id)}
                    className="text-gray-500"
                  >
                    {expandedPlots[plot._id] ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">
                      {plot.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {getLocationName(plot.locationId)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleAddUser(plot)}
                  className="p-2 text-green-500 hover:text-green-600"
                  title="Add User"
                >
                  <FaUserPlus />
                </button>
                <button
                  onClick={() => handleEdit(plot)}
                  className="p-2 text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(plot._id)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Expected</p>
                <p className="font-semibold">KSh {plot.expectedAmount || 0}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Paid</p>
                <p className="font-semibold text-green-600">
                  KSh {plot.paidAmount || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Expenses</p>
                <p className="font-semibold text-red-600">
                  KSh {plot.expenses || 0}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Collection</p>
                <p className="font-semibold">
                  {plot.expectedAmount > 0
                    ? Math.round((plot.paidAmount / plot.expectedAmount) * 100)
                    : 0}
                  %
                </p>
              </div>
            </div>

            {expandedPlots[plot._id] && (
              <div className="border-t pt-3 mt-2">
                <h4 className="font-semibold text-sm mb-2">
                  Users ({plot.users?.length || 0})
                </h4>
                {plot.users && plot.users.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {plot.users.map((user) => (
                      <div
                        key={user._id}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getPaymentColor(user.paymentStatus)}`}
                            >
                              {user.paymentStatus}
                            </span>
                            <span className="text-xs text-gray-600">
                              Paid: KSh {user.paidAmount || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => handleMarkPaid(user, plot)}
                            className="p-1.5 text-green-500 hover:text-green-600"
                            title="Add Payment"
                          >
                            <FaMoneyBillWave />
                          </button>
                          <button
                            onClick={() => handleRemoveUser(plot._id, user._id)}
                            className="p-1.5 text-red-500 hover:text-red-600"
                            title="Remove User"
                          >
                            <FaUserMinus />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No users in this plot yet.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Plot Form Modal */}
      {/* Plot Form Modal - Compact */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  {editingPlot ? "Edit Plot" : "Add Plot"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPlot(null);
                    setFormData({
                      name: "",
                      locationId: "",
                      expectedAmount: 0,
                      paidAmount: 0,
                      expenses: 0,
                    });
                  }}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Plot Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter plot name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) =>
                      setFormData({ ...formData, locationId: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((location) => (
                      <option key={location._id} value={location._id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expected (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.expectedAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedAmount: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Paid (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        paidAmount: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Expenses (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.expenses}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expenses: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPlot(null);
                    setFormData({
                      name: "",
                      locationId: "",
                      expectedAmount: 0,
                      paidAmount: 0,
                      expenses: 0,
                    });
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {editingPlot ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {/* Add User Modal - Compact */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Add User</h2>
                <button
                  onClick={() => {
                    setShowAddUserModal(false);
                    setSelectedPlot(null);
                  }}
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
              <p className="text-green-100 text-xs mt-1">
                Select user for {selectedPlot?.name}
              </p>
            </div>

            {/* User List */}
            <div className="max-h-64 overflow-y-auto">
              {getUsersNotInPlot().length > 0 ? (
                getUsersNotInPlot().map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAddUserToPlot(user._id)}
                    className="w-full text-left px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <p className="font-medium text-gray-800 text-sm">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                        user.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : user.paymentStatus === "partial"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.paymentStatus}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 px-5">
                  <svg
                    className="w-10 h-10 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">No users available</p>
                  <p className="text-gray-400 text-xs mt-1">
                    All users are assigned
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setSelectedPlot(null);
                }}
                className="w-full text-gray-600 text-sm font-medium py-1.5 hover:text-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {/* Payment Modal - Compact and Well-Structured */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 px-5 py-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">
                  Add Payment
                </h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedUser(null);
                    setSelectedPlot(null);
                    setPaymentAmount(0);
                  }}
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

            {/* Content */}
            <div className="p-5">
              {/* User & Plot Info */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium text-gray-800">
                    {selectedUser?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plot:</span>
                  <span className="font-medium text-gray-800">
                    {selectedPlot?.name}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
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

              {/* Amount Input */}
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
                    className="w-full pl-12 pr-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedUser(null);
                    setSelectedPlot(null);
                    setPaymentAmount(0);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={!paymentAmount || paymentAmount <= 0}
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

export default PlotManagement;
