import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return {};
});

export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.put(
        "/api/auth/change-password",
        { currentPassword, newPassword },
        { headers: { "x-auth-token": token } },
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const setSecretWord = createAsyncThunk(
  "auth/setSecretWord",
  async ({ secretWord, confirmSecretWord }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.post(
        "/api/auth/set-secret-word",
        { secretWord, confirmSecretWord },
        { headers: { "x-auth-token": token } },
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const verifySecretWord = createAsyncThunk(
  "auth/verifySecretWord",
  async ({ email, secretWord }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/verify-secret-word", {
        email,
        secretWord,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ resetToken, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/auth/reset-password", {
        resetToken,
        newPassword,
        confirmPassword,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async ({ name, email, phone }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await api.put(
        "/api/auth/update-profile",
        { name, email, phone },
        { headers: { "x-auth-token": token } },
      );
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user")),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(setSecretWord.fulfilled, (state, action) => {
        if (state.user) {
          state.user.secretWordSet = true;
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      });
  },
});

export default authSlice.reducer;
