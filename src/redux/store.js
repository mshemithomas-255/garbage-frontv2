import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import locationReducer from "./slices/locationSlice";
import plotReducer from "./slices/plotSlice";
import userReducer from "./slices/userSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    locations: locationReducer,
    plots: plotReducer,
    users: userReducer,
    admins: adminReducer,
  },
});
