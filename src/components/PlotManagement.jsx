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
      {isModalOpen && (
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">
                {editingPlot ? "Edit Plot" : "Add New Plot"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Plot Name
                  </label>
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
                  <label className="block text-sm font-bold mb-2">
                    Location
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) =>
                      setFormData({ ...formData, locationId: e.target.value })
                    }
                    className="input-mobile"
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
                  <label className="block text-sm font-bold mb-2">
                    Expected Amount (KSh)
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
                    className="input-mobile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Paid Amount (KSh)
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
                    className="input-mobile"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
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
                    className="input-mobile"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
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
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  {editingPlot ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">
                Add User to {selectedPlot?.name}
              </h2>
            </div>
            <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {getUsersNotInPlot().map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleAddUserToPlot(user._id)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Status: {user.paymentStatus}
                  </p>
                </button>
              ))}
              {getUsersNotInPlot().length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No users available to add
                </p>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setSelectedPlot(null);
                }}
                className="w-full px-4 py-2 border rounded-lg"
              >
                Close
              </button>
            </div>
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
                  Plot: {selectedPlot?.name}
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
                  setSelectedPlot(null);
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

export default PlotManagement;
