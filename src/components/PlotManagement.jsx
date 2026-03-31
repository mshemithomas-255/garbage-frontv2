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
  FaEnvelope,
  FaSearch,
} from "react-icons/fa";
import toast from "react-hot-toast";

// Constants
const PAYMENT_STATUS = {
  paid: {
    label: "Paid",
    color: "bg-green-100 text-green-800",
    bgRow: "bg-green-50",
    borderRow: "border-green-200",
  },
  partial: {
    label: "Partial",
    color: "bg-yellow-100 text-yellow-800",
    bgRow: "bg-yellow-50",
    borderRow: "border-yellow-200",
  },
  pending: {
    label: "Pending",
    color: "bg-red-100 text-red-800",
    bgRow: "bg-red-50",
    borderRow: "border-red-200",
  },
  default: {
    label: "Pending",
    color: "bg-gray-100 text-gray-800",
    bgRow: "bg-gray-50",
    borderRow: "border-gray-200",
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

const ModalFooter = ({ onClose, buttonText = "Close" }) => (
  <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50">
    <button
      onClick={onClose}
      className="w-full text-gray-600 text-sm font-medium py-1.5 hover:text-gray-800 transition"
    >
      {buttonText}
    </button>
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
        <option key={option._id} value={option._id}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
);

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

  // Fetch data on mount
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

  // Filter locations based on search term
  const filteredLocations = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return Object.values(plotsByLocation).filter(
      (item) =>
        item.location.name?.toLowerCase().includes(term) ||
        item.plots.some((plot) => plot.name?.toLowerCase().includes(term)) ||
        item.plots.some((plot) =>
          plot.users?.some(
            (user) =>
              user.name?.toLowerCase().includes(term) ||
              user.phone?.toLowerCase().includes(term),
          ),
        ),
    );
  }, [plotsByLocation, searchTerm]);

  // Helper functions
  const getPaymentColor = (status) =>
    PAYMENT_STATUS[status]?.color || PAYMENT_STATUS.default.color;
  const getPaymentLabel = (status) =>
    PAYMENT_STATUS[status]?.label || PAYMENT_STATUS.default.label;
  const getRowColor = (status) =>
    PAYMENT_STATUS[status]?.bgRow || PAYMENT_STATUS.default.bgRow;

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

  // Toggle functions
  const toggleLocation = (locationId) => {
    setExpandedState((prev) => {
      const isExpanding = !prev.locations[locationId];
      const newState = {
        locations: { ...prev.locations, [locationId]: isExpanding },
        plots: { ...prev.plots },
      };
      // Collapse all plots when collapsing location
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

  // CRUD Operations
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
        toast.success("Plot updated successfully!");
      } else {
        await dispatch(createPlot(formData)).unwrap();
        toast.success("Plot created successfully!");
      }
      await refreshData();
      closeAllModals();
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
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

  const handleAddUserToPlot = async (userId) => {
    try {
      await dispatch(
        addUserToPlot({ plotId: modalState.addUser.selectedPlot._id, userId }),
      ).unwrap();
      toast.success("User added to plot successfully!");
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

  const handlePaymentSubmit = async () => {
    const { amount, selectedUser, selectedPlot } = modalState.payment;
    if (amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await dispatch(markUserPaid({ id: selectedUser._id, amount })).unwrap();
      toast.success(`Payment of KSh ${amount} added successfully!`);
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

  // User Row Component - Mobile Optimized
  const UserRow = ({ user, plot }) => {
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
          <div className="col-span-2">
            <div className="flex items-center">
              <FaEnvelope className="text-gray-400 text-xs mr-1.5" />
              <span className="text-xs text-gray-600 truncate">
                {user.email}
              </span>
            </div>
          </div>
          <div className="col-span-2">
            <span
              className={`inline-block text-xs px-2 py-1 rounded-full ${getPaymentColor(user.paymentStatus)}`}
            >
              {getPaymentLabel(user.paymentStatus)}
            </span>
          </div>
          <div className="col-span-1">
            <p className="text-sm font-semibold text-green-600">
              KSh {user.paidAmount || 0}
            </p>
          </div>
          <div className="col-span-1 flex justify-center space-x-1">
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
              className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition"
              title="Add Payment"
            >
              <FaMoneyBillWave />
            </button>
            <button
              onClick={() => handleRemoveUser(plot._id, user._id)}
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Remove User"
            >
              <FaUserMinus />
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
                className="p-2 text-green-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                title="Add Payment"
              >
                <FaMoneyBillWave className="text-base" />
              </button>
              <button
                onClick={() => handleRemoveUser(plot._id, user._id)}
                className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Remove User"
              >
                <FaUserMinus className="text-base" />
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
            <span className="text-gray-500 text-xs">Amount Paid</span>
            <p className="text-base font-bold text-green-600">
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
          Plot Management
        </h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() =>
              setModalState((prev) => ({
                ...prev,
                plotForm: { isOpen: true, editingPlot: null },
              }))
            }
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center text-sm font-medium whitespace-nowrap"
          >
            <FaPlus className="mr-1 text-xs" /> Add Plot
          </button>
        </div>
      </div>

      {/* Hierarchical View */}
      <div className="space-y-3 md:space-y-4">
        {filteredLocations.map(({ location, plots: locationPlots }) => (
          <div
            key={location._id}
            className="bg-white rounded-lg shadow overflow-hidden"
          >
            {/* Location Header */}
            <div
              className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 cursor-pointer transition-all duration-200"
              onClick={() => toggleLocation(location._id)}
            >
              <div className="px-4 sm:px-5 py-3 sm:py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  <div className="bg-green-500 rounded-lg p-1.5 sm:p-2 flex-shrink-0">
                    <FaMapMarkerAlt className="text-white text-sm sm:text-base" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                      {location.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 truncate">
                      {location.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4 ml-2">
                  <div className="text-right hidden xs:block">
                    <p className="text-xs text-gray-300">Plots</p>
                    <p className="text-sm font-bold text-white">
                      {locationPlots.length}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-gray-300">Collection</p>
                    <p className="text-sm font-bold text-white">
                      {location.totalExpectedAmount > 0
                        ? Math.round(
                            (location.totalPaidAmount /
                              location.totalExpectedAmount) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  {expandedState.locations[location._id] ? (
                    <FaChevronUp className="text-white text-sm sm:text-xl" />
                  ) : (
                    <FaChevronDown className="text-white text-sm sm:text-xl" />
                  )}
                </div>
              </div>

              {/* Location Stats - Mobile Compact View */}
              {!expandedState.locations[location._id] && (
                <div className="px-4 pb-2 flex xs:hidden justify-between text-xs text-gray-300 border-t border-gray-600 pt-2">
                  <span>📊 {locationPlots.length} plots</span>
                  <span>
                    💰{" "}
                    {location.totalExpectedAmount > 0
                      ? Math.round(
                          (location.totalPaidAmount /
                            location.totalExpectedAmount) *
                            100,
                        )
                      : 0}
                    % collected
                  </span>
                </div>
              )}
            </div>

            {/* Plots List */}
            {expandedState.locations[location._id] && (
              <div className="bg-gray-50">
                {locationPlots.length > 0 ? (
                  locationPlots.map((plot) => (
                    <div
                      key={plot._id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      {/* Plot Header */}
                      <div
                        className="px-4 sm:px-5 py-2.5 sm:py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => togglePlot(plot._id)}
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="bg-blue-100 rounded-lg p-1 sm:p-1.5 flex-shrink-0">
                            <FaLayerGroup className="text-blue-600 text-xs sm:text-sm" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                              {plot.name}
                            </h4>
                            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-0.5">
                              <span>👥 {plot.users?.length || 0}</span>
                              <span className="hidden xs:inline">
                                💰 KSh {plot.expectedAmount || 0}
                              </span>
                              <span>✅ KSh {plot.paidAmount || 0}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                          <div className="text-right mr-1 hidden sm:block">
                            <p className="text-xs text-gray-500">Collection</p>
                            <p className="text-sm font-semibold text-green-600">
                              {plot.expectedAmount > 0
                                ? Math.round(
                                    (plot.paidAmount / plot.expectedAmount) *
                                      100,
                                  )
                                : 0}
                              %
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalState((prev) => ({
                                ...prev,
                                addUser: { isOpen: true, selectedPlot: plot },
                              }));
                            }}
                            className="p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 rounded transition"
                            title="Add User"
                          >
                            <FaUserPlus className="text-xs sm:text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(plot);
                            }}
                            className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Edit Plot"
                          >
                            <FaEdit className="text-xs sm:text-sm" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(plot._id);
                            }}
                            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete Plot"
                          >
                            <FaTrash className="text-xs sm:text-sm" />
                          </button>
                          {expandedState.plots[plot._id] ? (
                            <FaChevronUp className="text-gray-400 text-xs sm:text-sm" />
                          ) : (
                            <FaChevronDown className="text-gray-400 text-xs sm:text-sm" />
                          )}
                        </div>
                      </div>

                      {/* Users List */}
                      {expandedState.plots[plot._id] && (
                        <div className="bg-white px-3 sm:px-5 py-3 border-t border-gray-100">
                          <h5 className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                            <FaUsers className="mr-2 text-gray-500 text-xs sm:text-sm" />
                            Users ({plot.users?.length || 0})
                          </h5>

                          {plot.users && plot.users.length > 0 ? (
                            <div>
                              {/* Desktop Column Headers */}
                              <div className="hidden md:grid md:grid-cols-12 md:gap-3 mb-2 px-3 py-2 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">
                                <div className="col-span-3">User Name</div>
                                <div className="col-span-3">Mobile Number</div>
                                <div className="col-span-2">Email</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-1">Amount</div>
                                <div className="col-span-1 text-center">
                                  Actions
                                </div>
                              </div>
                              <div className="space-y-2">
                                {plot.users.map((user) => (
                                  <UserRow
                                    key={user._id}
                                    user={user}
                                    plot={plot}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                              <FaUsers className="text-gray-300 text-2xl sm:text-3xl mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">
                                No users in this plot yet
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
                                className="mt-2 text-green-600 text-sm hover:text-green-700 font-medium"
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
                  <div className="text-center py-6 sm:py-8 bg-gray-50">
                    <FaLayerGroup className="text-gray-300 text-2xl sm:text-3xl mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      No plots in this location yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredLocations.length === 0 && (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow">
            <FaMapMarkerAlt className="text-gray-300 text-3xl sm:text-4xl mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No locations found</p>
          </div>
        )}
      </div>

      {/* Plot Form Modal */}
      {modalState.plotForm.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <ModalHeader
              title={
                modalState.plotForm.editingPlot ? "Edit Plot" : "Add New Plot"
              }
              onClose={closeAllModals}
            />
            <form onSubmit={handleSubmit} className="p-4 sm:p-5">
              <div className="space-y-3">
                <FormInput
                  label="Plot Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter plot name"
                  required
                />
                <FormSelect
                  label="Location"
                  value={formData.locationId}
                  onChange={(e) =>
                    setFormData({ ...formData, locationId: e.target.value })
                  }
                  options={locations}
                  required
                />
                <FormInput
                  label="Expected Amount (KSh)"
                  type="number"
                  value={formData.expectedAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expectedAmount: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
                <FormInput
                  label="Expenses (KSh)"
                  type="number"
                  value={formData.expenses}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expenses: parseFloat(e.target.value),
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="flex space-x-2 mt-5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700"
                >
                  {modalState.plotForm.editingPlot ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {modalState.addUser.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <ModalHeader
              title={`Add User to ${modalState.addUser.selectedPlot?.name}`}
              onClose={() =>
                setModalState((prev) => ({
                  ...prev,
                  addUser: { isOpen: false, selectedPlot: null },
                }))
              }
            />
            <div className="max-h-64 overflow-y-auto">
              {getUsersNotInPlot().length > 0 ? (
                getUsersNotInPlot().map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleAddUserToPlot(user._id)}
                    className="w-full text-left px-4 sm:px-5 py-3 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <p className="font-medium text-gray-800 text-sm">
                      {user.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center">
                        <FaPhone className="mr-1 text-xs" /> {user.phone}
                      </span>
                      <span className="flex items-center">
                        <FaEnvelope className="mr-1 text-xs" /> {user.email}
                      </span>
                    </div>
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${getPaymentColor(user.paymentStatus)}`}
                    >
                      {getPaymentLabel(user.paymentStatus)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 px-5">
                  <FaUsers className="text-gray-300 text-3xl mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No users available</p>
                  <p className="text-gray-400 text-xs mt-1">
                    All users are already assigned
                  </p>
                </div>
              )}
            </div>
            <ModalFooter
              onClose={() =>
                setModalState((prev) => ({
                  ...prev,
                  addUser: { isOpen: false, selectedPlot: null },
                }))
              }
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {modalState.payment.isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-auto overflow-hidden">
            <ModalHeader
              title="Add Payment"
              onClose={() =>
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
            />
            <div className="p-4 sm:p-5">
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium">
                    {modalState.payment.selectedUser?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">
                    {modalState.payment.selectedUser?.phone}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Plot:</span>
                  <span className="font-medium">
                    {modalState.payment.selectedPlot?.name}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-lg p-3 mb-4 text-sm ${
                  modalState.payment.selectedUser?.paymentStatus === "paid"
                    ? "bg-green-50 border border-green-200"
                    : modalState.payment.selectedUser?.paymentStatus ===
                        "partial"
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-semibold ${
                      modalState.payment.selectedUser?.paymentStatus === "paid"
                        ? "text-green-600"
                        : modalState.payment.selectedUser?.paymentStatus ===
                            "partial"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {modalState.payment.selectedUser?.paymentStatus?.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold">
                    KSh {modalState.payment.selectedUser?.paidAmount || 0}
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
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={
                    !modalState.payment.amount || modalState.payment.amount <= 0
                  }
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

export default PlotManagement;
