import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createLocation,
  updateLocation,
  deleteLocation,
} from "../redux/slices/locationSlice";
import { createPlot, fetchPlots } from "../redux/slices/plotSlice";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaChevronDown,
  FaChevronUp,
  FaLayerGroup,
} from "react-icons/fa";
import toast from "react-hot-toast";

const LocationManagement = ({ refreshData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [expandedLocations, setExpandedLocations] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    address: "",
  });
  const [plotFormData, setPlotFormData] = useState({
    name: "",
    expectedAmount: 0,
    expenses: 0,
  });

  const dispatch = useDispatch();
  const { locations } = useSelector((state) => state.locations);
  const { plots } = useSelector((state) => state.plots);

  useEffect(() => {
    dispatch(fetchPlots());
  }, [dispatch]);

  const filteredLocations = locations.filter(
    (location) =>
      location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await dispatch(
          updateLocation({ id: editingLocation._id, data: formData }),
        ).unwrap();
        toast.success("Location updated successfully!");
      } else {
        await dispatch(createLocation(formData)).unwrap();
        toast.success("Location created successfully!");
      }
      await refreshData();
      setIsModalOpen(false);
      setEditingLocation(null);
      setFormData({ name: "", address: "" });
    } catch (error) {
      toast.error(error.message || "Operation failed");
    }
  };

  const handleAddPlot = (location) => {
    setSelectedLocation(location);
    setPlotFormData({ name: "", expectedAmount: 0, expenses: 0 });
    setIsPlotModalOpen(true);
  };

  const handlePlotSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        createPlot({
          name: plotFormData.name,
          locationId: selectedLocation._id,
          expectedAmount: plotFormData.expectedAmount,
          expenses: plotFormData.expenses,
          paidAmount: 0,
        }),
      ).unwrap();
      toast.success("Plot added successfully!");
      await refreshData();
      setIsPlotModalOpen(false);
      setSelectedLocation(null);
      setPlotFormData({ name: "", expectedAmount: 0, expenses: 0 });
    } catch (error) {
      toast.error(error.message || "Failed to add plot");
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this location? This will also delete all plots in this location.",
      )
    ) {
      try {
        await dispatch(deleteLocation(id)).unwrap();
        toast.success("Location deleted successfully!");
        await refreshData();
      } catch (error) {
        toast.error(error.message || "Failed to delete location");
      }
    }
  };

  const toggleLocation = (locationId) => {
    setExpandedLocations((prev) => ({
      ...prev,
      [locationId]: !prev[locationId],
    }));
  };

  const getPlotsForLocation = (locationId) => {
    return plots.filter(
      (plot) =>
        plot.locationId?._id === locationId || plot.locationId === locationId,
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Location Management
        </h1>
        <div className="flex flex-col xs:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-mobile"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary whitespace-nowrap"
          >
            <FaPlus className="mr-2" /> Add Location
          </button>
        </div>
      </div>

      {/* Locations List */}
      <div className="space-y-3">
        {filteredLocations.map((location) => (
          <div key={location._id} className="card-mobile">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleLocation(location._id)}
                    className="text-gray-500"
                  >
                    {expandedLocations[location._id] ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </button>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg">
                      {location.name}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {location.address}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleAddPlot(location)}
                  className="p-2 text-purple-500 hover:text-purple-600"
                  title="Add Plot"
                >
                  <FaLayerGroup />
                </button>
                <button
                  onClick={() => handleEdit(location)}
                  className="p-2 text-blue-500 hover:text-blue-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(location._id)}
                  className="p-2 text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 text-xs">Expected</p>
                <p className="font-semibold">
                  KSh {location.totalExpectedAmount || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 text-xs">Paid</p>
                <p className="font-semibold text-green-600">
                  KSh {location.totalPaidAmount || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-gray-500 text-xs">Expenses</p>
                <p className="font-semibold text-red-600">
                  KSh {location.totalExpenses || 0}
                </p>
              </div>
            </div>

            {expandedLocations[location._id] && (
              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-sm">
                    Plots ({getPlotsForLocation(location._id).length})
                  </h4>
                  <button
                    onClick={() => handleAddPlot(location)}
                    className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 flex items-center"
                  >
                    <FaPlus className="mr-1 text-xs" /> Add Plot
                  </button>
                </div>
                {getPlotsForLocation(location._id).length > 0 ? (
                  <div className="space-y-2">
                    {getPlotsForLocation(location._id).map((plot) => (
                      <div key={plot._id} className="bg-gray-50 rounded p-2">
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm">{plot.name}</p>
                          <span className="text-xs text-green-600 font-semibold">
                            {plot.expectedAmount > 0
                              ? Math.round(
                                  (plot.paidAmount / plot.expectedAmount) * 100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Users: {plot.users?.length || 0} | Expected: KSh{" "}
                          {plot.expectedAmount || 0} | Paid: KSh{" "}
                          {plot.paidAmount || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No plots in this location yet.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Location Form Modal */}
      {isModalOpen && (
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Location Name
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
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="input-mobile"
                    rows="3"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingLocation(null);
                    setFormData({ name: "", address: "" });
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                  {editingLocation ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Plot Modal */}
      {isPlotModalOpen && (
        <div className="modal-mobile">
          <div className="modal-content-mobile">
            <div className="sticky top-0 bg-white border-b p-4">
              <h2 className="text-xl font-bold">
                Add Plot to {selectedLocation?.name}
              </h2>
            </div>
            <form onSubmit={handlePlotSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Plot Name
                  </label>
                  <input
                    type="text"
                    value={plotFormData.name}
                    onChange={(e) =>
                      setPlotFormData({ ...plotFormData, name: e.target.value })
                    }
                    className="input-mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    Expected Amount (KSh)
                  </label>
                  <input
                    type="number"
                    value={plotFormData.expectedAmount}
                    onChange={(e) =>
                      setPlotFormData({
                        ...plotFormData,
                        expectedAmount: parseFloat(e.target.value),
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
                    value={plotFormData.expenses}
                    onChange={(e) =>
                      setPlotFormData({
                        ...plotFormData,
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
                    setIsPlotModalOpen(false);
                    setSelectedLocation(null);
                    setPlotFormData({
                      name: "",
                      expectedAmount: 0,
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
                  Add Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationManagement;
