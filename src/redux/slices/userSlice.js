import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUsers = createAsyncThunk(
  "users/fetch",
  async (_, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.get("/api/users", {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const createUser = createAsyncThunk(
  "users/create",
  async (userData, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.post("/api/users", userData, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const updateUser = createAsyncThunk(
  "users/update",
  async ({ id, data }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.put(`/api/users/${id}`, data, {
      headers: { "x-auth-token": token },
    });
    return response.data;
  },
);

export const deleteUser = createAsyncThunk(
  "users/delete",
  async (id, { getState }) => {
    const token = getState().auth.token;
    await axios.delete(`/api/users/${id}`, {
      headers: { "x-auth-token": token },
    });
    return id;
  },
);

export const markUserPaid = createAsyncThunk(
  "users/markPaid",
  async ({ id, amount }, { getState }) => {
    const token = getState().auth.token;
    const response = await axios.put(
      `/api/users/${id}/pay`,
      { amount },
      {
        headers: { "x-auth-token": token },
      },
    );
    return response.data;
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
        state.error = action.error.message;
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
