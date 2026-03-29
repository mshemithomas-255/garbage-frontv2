import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with base URL
const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["x-auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors with toast messages
api.interceptors.response.use(
  (response) => {
    // Show success message if present in response
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    // Extract error message from response
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Server responded with error
      const { data, status } = error.response;

      // Get message from various possible formats
      if (data.message) {
        errorMessage = data.message;
      } else if (data.msg) {
        errorMessage = data.msg;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.errors && data.errors.length > 0) {
        errorMessage = data.errors[0].msg || data.errors[0].message;
      }

      // Add status code context for specific errors
      if (status === 401) {
        errorMessage = errorMessage || "Session expired. Please login again.";
        // Clear token on unauthorized
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      } else if (status === 403) {
        errorMessage =
          errorMessage || "You do not have permission to perform this action";
      } else if (status === 404) {
        errorMessage = errorMessage || "Resource not found";
      } else if (status === 500) {
        errorMessage = errorMessage || "Server error. Please try again later.";
      }
    } else if (error.request) {
      // Request was made but no response
      errorMessage =
        "Unable to connect to server. Please check your internet connection.";
    } else {
      // Something else happened
      errorMessage = error.message || "An unexpected error occurred";
    }

    // Show error toast
    toast.error(errorMessage);

    // Reject with error for component handling
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);

export default api;
