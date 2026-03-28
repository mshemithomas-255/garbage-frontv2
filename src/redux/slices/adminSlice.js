import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchAdmins = createAsyncThunk(
  "admins/fetch",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get("/api/admins", {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const createAdmin = createAsyncThunk(
  "admins/create",
  async (adminData, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post("/api/admins", adminData, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const deleteAdmin = createAsyncThunk(
  "admins/delete",
  async (id, { getState }) => {
    const token = getState().auth.token;
    await axios.delete(`/api/admins/${id}`, {
      headers: { "x-auth-token": token },
    });
    return id;
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
        state.error = action.error.message;
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
