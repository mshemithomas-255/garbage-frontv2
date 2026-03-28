import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchLocations = createAsyncThunk(
  "locations/fetch",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get("/api/locations", {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const createLocation = createAsyncThunk(
  "locations/create",
  async (locationData, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post("/api/locations", locationData, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const updateLocation = createAsyncThunk(
  "locations/update",
  async ({ id, data }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.put(`/api/locations/${id}`, data, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const deleteLocation = createAsyncThunk(
  "locations/delete",
  async (id, { getState }) => {
    const token = getState().auth.token;
    await axios.delete(`/api/locations/${id}`, {
      headers: { "x-auth-token": token },
    });
    return id;
  },
);

const locationSlice = createSlice({
  name: "locations",
  initialState: {
    locations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(createLocation.fulfilled, (state, action) => {
        state.locations.push(action.payload);
      })
      .addCase(updateLocation.fulfilled, (state, action) => {
        const index = state.locations.findIndex(
          (l) => l._id === action.payload._id,
        );
        if (index !== -1) state.locations[index] = action.payload;
      })
      .addCase(deleteLocation.fulfilled, (state, action) => {
        state.locations = state.locations.filter(
          (l) => l._id !== action.payload,
        );
      });
  },
});

export default locationSlice.reducer;
