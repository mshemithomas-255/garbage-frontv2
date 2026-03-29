import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchLocations = createAsyncThunk(
  "locations/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/locations");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createLocation = createAsyncThunk(
  "locations/create",
  async (locationData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/locations", locationData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateLocation = createAsyncThunk(
  "locations/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/locations/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteLocation = createAsyncThunk(
  "locations/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/locations/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
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
        state.error = action.payload;
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
