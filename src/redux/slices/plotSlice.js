import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchPlots = createAsyncThunk(
  "plots/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/plots");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Failed to fetch plots" },
      );
    }
  },
);

export const createPlot = createAsyncThunk(
  "plots/create",
  async (plotData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/plots", plotData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Failed to create plot" },
      );
    }
  },
);

export const updatePlot = createAsyncThunk(
  "plots/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/plots/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Failed to update plot" },
      );
    }
  },
);

export const deletePlot = createAsyncThunk(
  "plots/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/plots/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Failed to delete plot" },
      );
    }
  },
);

export const addUserToPlot = createAsyncThunk(
  "plots/addUser",
  async ({ plotId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/plots/${plotId}/users`, { userId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Failed to add user to plot" },
      );
    }
  },
);

export const removeUserFromPlot = createAsyncThunk(
  "plots/removeUser",
  async ({ plotId, userId }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/plots/${plotId}/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { msg: "Failed to remove user from plot" },
      );
    }
  },
);

const plotSlice = createSlice({
  name: "plots",
  initialState: {
    plots: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlots.fulfilled, (state, action) => {
        state.loading = false;
        state.plots = action.payload;
      })
      .addCase(fetchPlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || action.error.message;
      })
      .addCase(createPlot.fulfilled, (state, action) => {
        state.plots.push(action.payload);
      })
      .addCase(updatePlot.fulfilled, (state, action) => {
        const index = state.plots.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.plots[index] = action.payload;
      })
      .addCase(deletePlot.fulfilled, (state, action) => {
        state.plots = state.plots.filter((p) => p._id !== action.payload);
      })
      .addCase(addUserToPlot.fulfilled, (state, action) => {
        const index = state.plots.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.plots[index] = action.payload;
      })
      .addCase(removeUserFromPlot.fulfilled, (state, action) => {
        const index = state.plots.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.plots[index] = action.payload;
      });
  },
});

export default plotSlice.reducer;
