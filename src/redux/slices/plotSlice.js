import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchPlots = createAsyncThunk(
  "plots/fetch",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get("/api/plots", {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const createPlot = createAsyncThunk(
  "plots/create",
  async (plotData, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post("/api/plots", plotData, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const updatePlot = createAsyncThunk(
  "plots/update",
  async ({ id, data }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.put(`/api/plots/${id}`, data, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const deletePlot = createAsyncThunk(
  "plots/delete",
  async (id, { getState }) => {
    const token = getState().auth.token;
    await axios.delete(`/api/plots/${id}`, {
      headers: { "x-auth-token": token },
    });
    return id;
  },
);

export const addUserToPlot = createAsyncThunk(
  "plots/addUser",
  async ({ plotId, userId }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post(
      `/api/plots/${plotId}/users`,
      { userId },
      {
        headers: { "x-auth-token": token },
      },
    );
    return response.data;
  },
);

export const removeUserFromPlot = createAsyncThunk(
  "plots/removeUser",
  async ({ plotId, userId }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.delete(
      `/api/plots/${plotId}/users/${userId}`,
      {
        headers: { "x-auth-token": token },
      },
    );
    return response.data;
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
        state.error = action.error.message;
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
