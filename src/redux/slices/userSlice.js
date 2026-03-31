import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/users");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/users", userData);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/users/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const markUserPaid = createAsyncThunk(
  "users/markPaid",
  async ({ id, amount }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/${id}/pay`, { amount });
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const userSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id,
        );
        if (index !== -1) state.users[index] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      })
      .addCase(markUserPaid.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id,
        );
        if (index !== -1) state.users[index] = action.payload;
      });
  },
});

export default userSlice.reducer;
