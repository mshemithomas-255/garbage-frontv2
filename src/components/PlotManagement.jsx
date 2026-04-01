import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  FaMapMarkerAlt,
  FaLayerGroup,
  FaUsers,
  FaPhone,
} from "react-icons/fa";
import toast from "react-hot-toast";

// Constants
const PAYMENT_STATUS = {
  paid: { label: "Paid", bgRow: "bg-green-400" },
  partial: { label: "Partial", bgRow: "bg-yellow-100" },
  pending: { label: "Pending", bgRow: "" },
};

const PlotManagement = ({ refreshData }) => {
  // State
  const [modalState, setModalState] = useState({
    plotForm: { isOpen: false, editingPlot: null },
    addUser: { isOpen: false, selectedPlot: null },
    payment: {
      isOpen: false,
      selectedUser: null,
      selectedPlot: null,
      amount: 0,
    },
  });
  const [expandedState, setExpandedState] = useState({
    locations: {},
    plots: {},
  });
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

  // Group plots by location
  const plotsByLocation = useMemo(() => {
    const result = {};
    locations.forEach((location) => {
      result[location._id] = {
        location,
        plots: plots.filter(
          (plot) =>
            plot.locationId?._id === location._id ||
            plot.locationId === location._id,
        ),
      };
    });
    return result;
  }, [locations, plots]);

  const getUsersNotInPlot = useCallback(() => {
    const { selectedPlot } = modalState.addUser;
    if (!selectedPlot) return [];
    return users.filter(
      (user) =>
        user.role === "user" &&
        (!selectedPlot.users ||
          !selectedPlot.users.some((u) => u._id === user._id)),
    );
  }, [users, modalState.addUser.selectedPlot]);

  const resetForm = () => {
    setFormData({
      name: "",
      locationId: "",
      expectedAmount: 0,
      paidAmount: 0,
      expenses: 0,
    });
  };

  const closeAllModals = () => {
    setModalState({
      plotForm: { isOpen: false, editingPlot: null },
      addUser: { isOpen: false, selectedPlot: null },
      payment: {
        isOpen: false,
        selectedUser: null,
        selectedPlot: null,
        amount: 0,
      },
    });
    resetForm();
  };

  const toggleLocation = (locationId) => {
    setExpandedState((prev) => {
      const isExpanding = !prev.locations[locationId];
      const newState = {
        locations: { ...prev.locations, [locationId]: isExpanding },
        plots: { ...prev.plots },
      };
      if (!isExpanding) {
        const locationPlots = plotsByLocation[locationId]?.plots || [];
        locationPlots.forEach((plot) => {
          delete newState.plots[plot._id];
        });
      }
      return newState;
    });
  };

  const togglePlot = (plotId) => {
    setExpandedState((prev) => ({
      ...prev,
      plots: { ...prev.plots, [plotId]: !prev.plots[plotId] },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalState.plotForm.editingPlot) {
        await dispatch(
          updatePlot({
            id: modalState.plotForm.editingPlot._id,
            data: formData,
          }),
        ).unwrap();
        toast.success("Plot updated!");
      } else {
        await dispatch(createPlot(formData)).unwrap();
        toast.success("Plot created!");
      }
      await refreshData();
      closeAllModals();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this plot?")) {
      try {
        await dispatch(deletePlot(id)).unwrap();
        toast.success("Plot deleted!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to delete");
      }
    }
  };

  const handleAddUserToPlot = async (userId) => {
    try {
      await dispatch(
        addUserToPlot({ plotId: modalState.addUser.selectedPlot._id, userId }),
      ).unwrap();
      toast.success("User added!");
      await refreshData();
      setModalState((prev) => ({
        ...prev,
        addUser: { isOpen: false, selectedPlot: null },
      }));
    } catch (error) {
      toast.error(error.message || "Failed to add user");
    }
  };

  const handleRemoveUser = async (plotId, userId) => {
    if (window.confirm("Remove user from plot?")) {
      try {
        await dispatch(removeUserFromPlot({ plotId, userId })).unwrap();
        toast.success("User removed!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to remove");
      }
    }
  };

  const handlePaymentSubmit = async () => {
    const { amount, selectedUser, selectedPlot } = modalState.payment;
    if (amount <= 0) {
      toast.error("Enter valid amount");
      return;
    }
    try {
      await dispatch(markUserPaid({ id: selectedUser._id, amount })).unwrap();
      toast.success(`KSh ${amount} added!`);
      await refreshData();
      setModalState((prev) => ({
        ...prev,
        payment: {
          isOpen: false,
          selectedUser: null,
          selectedPlot: null,
          amount: 0,
        },
      }));
    } catch (error) {
      toast.error(error.message || "Failed to add payment");
    }
  };

  const handleEdit = (plot) => {
    setFormData({
      name: plot.name,
      locationId: plot.locationId?._id || plot.locationId,
      expectedAmount: plot.expectedAmount || 0,
      paidAmount: plot.paidAmount || 0,
      expenses: plot.expenses || 0,
    });
    setModalState((prev) => ({
      ...prev,
      plotForm: { isOpen: true, editingPlot: plot },
    }));
  };

  // User Row Component - Ultra Lean
  const UserRow = ({ user, plot }) => {
    const isPaid = user.paymentStatus === "paid";
    const bgClass = isPaid ? "bg-green-400" : "bg-gray-50";

    return (
      <div className={`${bgClass} border-b border-gray-200 last:border-b-0`}>
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{user.name}</span>
              <FaPhone className="text-gray-400 text-xs flex-shrink-0" />
              <span className="text-xs text-gray-600">{user.phone}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-green-700 w-16 text-right">
              KSh {user.paidAmount || 0}
            </span>
            <button
              onClick={() =>
                setModalState((prev) => ({
                  ...prev,
                  payment: {
                    isOpen: true,
                    selectedUser: user,
                    selectedPlot: plot,
                    amount: 0,
                  },
                }))
              }
              className="p-1 text-green-600 hover:text-green-800"
              title="Add Payment"
            >
              <FaMoneyBillWave className="text-xs" />
            </button>
            <button
              onClick={() => handleRemoveUser(plot._id, user._id)}
              className="p-1 text-red-500 hover:text-red-700"
              title="Remove"
            >
              <FaUserMinus className="text-xs" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-2">
      {/* Header - Minimal */}
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-bold text-gray-800">Plots</h1>
        <button
          onClick={() =>
            setModalState((prev) => ({
              ...prev,
              plotForm: { isOpen: true, editingPlot: null },
            }))
          }
          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 flex items-center gap-1"
        >
          <FaPlus className="text-xs" /> Add
        </button>
      </div>

      {/* Locations List - Ultra Lean */}
      <div className="space-y-2">
        {Object.values(plotsByLocation).map(
          ({ location, plots: locationPlots }) => (
            <div
              key={location._id}
              className="border border-gray-200 rounded overflow-hidden"
            >
              {/* Location Header - No address, minimal */}
              <div
                className="bg-gray-100 px-3 py-1.5 flex justify-between items-center cursor-pointer hover:bg-gray-200"
                onClick={() => toggleLocation(location._id)}
              >
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-500 text-xs" />
                  <span className="font-medium text-sm">{location.name}</span>
                  <span className="text-xs text-gray-500">
                    ({locationPlots.length})
                  </span>
                </div>
                {expandedState.locations[location._id] ? (
                  <FaChevronUp className="text-gray-400 text-xs" />
                ) : (
                  <FaChevronDown className="text-gray-400 text-xs" />
                )}
              </div>

              {/* Plots List */}
              {expandedState.locations[location._id] && (
                <div>
                  {locationPlots.length > 0 ? (
                    locationPlots.map((plot) => (
                      <div key={plot._id} className="border-t border-gray-200">
                        {/* Plot Header - Minimal */}
                        <div
                          className="px-3 py-1.5 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                          onClick={() => togglePlot(plot._id)}
                        >
                          <div className="flex items-center gap-3">
                            <FaLayerGroup className="text-blue-500 text-xs" />
                            <span className="text-sm font-medium">
                              {plot.name}
                            </span>
                            <div className="flex gap-2 text-xs text-gray-500">
                              <span>Exp: KSh {plot.expectedAmount || 0}</span>
                              <span>Paid: KSh {plot.paidAmount || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setModalState((prev) => ({
                                  ...prev,
                                  addUser: { isOpen: true, selectedPlot: plot },
                                }));
                              }}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Add User"
                            >
                              <FaUserPlus className="text-xs" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(plot);
                              }}
                              className="p-1 text-blue-500 hover:text-blue-700"
                              title="Edit"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(plot._id);
                              }}
                              className="p-1 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                            {expandedState.plots[plot._id] ? (
                              <FaChevronUp className="text-gray-400 text-xs" />
                            ) : (
                              <FaChevronDown className="text-gray-400 text-xs" />
                            )}
                          </div>
                        </div>

                        {/* Users List - Minimal, Green for paid users */}
                        {expandedState.plots[plot._id] && (
                          <div className="border-t border-gray-200">
                            <div className="bg-gray-50 px-3 py-1">
                              <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                                <FaUsers className="text-xs" /> Users (
                                {plot.users?.length || 0})
                              </span>
                            </div>
                            {plot.users && plot.users.length > 0 ? (
                              <div>
                                {plot.users.map((user) => (
                                  <UserRow
                                    key={user._id}
                                    user={user}
                                    plot={plot}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="px-3 py-2 text-center">
                                <p className="text-xs text-gray-400">
                                  No users
                                </p>
                                <button
                                  onClick={() =>
                                    setModalState((prev) => ({
                                      ...prev,
                                      addUser: {
                                        isOpen: true,
                                        selectedPlot: plot,
                                      },
                                    }))
                                  }
                                  className="text-xs text-green-600 hover:text-green-700 mt-1"
                                >
                                  + Add User
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-center text-xs text-gray-400">
                      No plots
                    </div>
                  )}
                </div>
              )}
            </div>
          ),
        )}
      </div>

      {/* Plot Form Modal - Minimal */}
      {modalState.plotForm.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-xs">
            <div className="bg-green-600 px-3 py-2 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white">
                {modalState.plotForm.editingPlot ? "Edit Plot" : "Add Plot"}
              </h2>
              <button onClick={closeAllModals} className="text-white text-sm">
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-3">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Plot name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-2 py-1 text-sm border rounded"
                  required
                />
                <select
                  value={formData.locationId}
                  onChange={(e) =>
                    setFormData({ ...formData, locationId: e.target.value })
                  }
                  className="w-full px-2 py-1 text-sm border rounded"
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location._id} value={location._id}>
                      {location.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Expected (KSh)"
                  value={formData.expectedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedAmount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1 text-sm border rounded"
                />
                <input
                  type="number"
                  placeholder="Expenses (KSh)"
                  value={formData.expenses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expenses: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-2 py-1 text-sm border rounded"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-sm"
                >
                  {modalState.plotForm.editingPlot ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal - Minimal */}
      {modalState.addUser.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-xs">
            <div className="bg-green-600 px-3 py-2 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white">Add User</h2>
              <button
                onClick={() =>
                  setModalState((prev) => ({
                    ...prev,
                    addUser: { isOpen: false, selectedPlot: null },
                  }))
                }
                className="text-white"
              >
                ✕
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {getUsersNotInPlot().length > 0 ? (
                getUsersNotInPlot().map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAddUserToPlot(user._id)}
                    className="w-full text-left px-3 py-2 border-b hover:bg-gray-50 text-sm"
                  >
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">
                  No users available
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t">
              <button
                onClick={() =>
                  setModalState((prev) => ({
                    ...prev,
                    addUser: { isOpen: false, selectedPlot: null },
                  }))
                }
                className="w-full text-sm text-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal - Minimal */}
      {modalState.payment.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-xs">
            <div className="bg-green-600 px-3 py-2 flex justify-between items-center">
              <h2 className="text-sm font-semibold text-white">Add Payment</h2>
              <button
                onClick={() =>
                  setModalState((prev) => ({
                    ...prev,
                    payment: {
                      isOpen: false,
                      selectedUser: null,
                      selectedPlot: null,
                      amount: 0,
                    },
                  }))
                }
                className="text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-3">
              <div className="bg-gray-50 px-2 py-1 rounded text-sm mb-2">
                <div>
                  <span className="text-gray-500">User:</span>{" "}
                  {modalState.payment.selectedUser?.name}
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {modalState.payment.selectedUser?.phone}
                </div>
              </div>
              <input
                type="number"
                placeholder="Amount (KSh)"
                value={modalState.payment.amount}
                onChange={(e) =>
                  setModalState((prev) => ({
                    ...prev,
                    payment: {
                      ...prev.payment,
                      amount: parseFloat(e.target.value),
                    },
                  }))
                }
                className="w-full px-2 py-1 border rounded text-sm mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setModalState((prev) => ({
                      ...prev,
                      payment: {
                        isOpen: false,
                        selectedUser: null,
                        selectedPlot: null,
                        amount: 0,
                      },
                    }))
                  }
                  className="flex-1 px-2 py-1 border rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-sm"
                >
                  Add
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
