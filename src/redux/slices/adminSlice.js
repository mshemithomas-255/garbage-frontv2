import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchAdmins = createAsyncThunk(
  "admins/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/admins");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createAdmin = createAsyncThunk(
  "admins/create",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/admins", adminData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteAdmin = createAsyncThunk(
  "admins/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/admins/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const adminSlice = createSlice({
  name: "admins",
  initialState: {
    admins: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.admins.push(action.payload);
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter((a) => a._id !== action.payload);
      });
  },
});

export default adminSlice.reducer;
