import axios from "axios";

const statusMessages = {
  400: "The request could not be processed.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record could not be found.",
  422: "Please review the form and try again.",
  429: "Too many requests. Please wait a moment and try again.",
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("emenu_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeApiError(error);

    error.normalized = normalized;
    error.userMessage = normalized.message;
    error.validationErrors = normalized.errors;

    if (error.response?.data) {
      error.response.data = {
        ...error.response.data,
        message: normalized.message,
        errors: normalized.errors,
      };
    }

    if (normalized.status === 401) {
      localStorage.removeItem("emenu_token");
      const path = window.location.pathname;
      const isAdminArea = path.startsWith("/admin");
      const isAuthPage = path === "/login" || path === "/register";

      if (isAdminArea && !isAuthPage) {
        window.location.assign(`/login?next=${encodeURIComponent(path)}`);
      }
    }

    return Promise.reject(error);
  },
);

export function normalizeApiError(error) {
  const status = error?.response?.status || 0;
  const data = error?.response?.data || {};
  const errors = normalizeValidationErrors(data.errors);

  if (!error?.response) {
    return {
      status,
      message: navigator.onLine ? "The server could not be reached." : "You are offline. Please reconnect and try again.",
      errors,
    };
  }

  if (status === 422 && Object.keys(errors).length) {
    return {
      status,
      message: firstValidationMessage(errors) || statusMessages[422],
      errors,
    };
  }

  if (status >= 500) {
    return {
      status,
      message: "The service is temporarily unavailable. Please try again soon.",
      errors,
    };
  }

  return {
    status,
    message: statusMessages[status] || data.message || "Something went wrong. Please try again.",
    errors,
  };
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.userMessage || error?.normalized?.message || error?.response?.data?.message || fallback;
}

function normalizeValidationErrors(errors) {
  if (!errors || typeof errors !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [
      field,
      Array.isArray(messages) ? messages.filter(Boolean).map(String) : [String(messages)],
    ]),
  );
}

function firstValidationMessage(errors) {
  return Object.values(errors).flat().find(Boolean);
}

export default api;
