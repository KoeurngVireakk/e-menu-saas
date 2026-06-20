import axios from "axios";

export const API_TIMEOUT_MS = 10_000;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const statusMessages = {
  400: "The request could not be processed.",
  401: "Your session has expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record could not be found.",
  422: "Please review the form and try again.",
  429: "Too many requests. Please wait a moment and try again.",
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("emenu_token");

  config.headers = config.headers || {};
  config.headers.Accept = "application/json";

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
  if (isRequestCanceled(error)) {
    return {
      status: 0,
      message: "Request canceled.",
      errors: {},
      code: "ERR_CANCELED",
      isCanceled: true,
    };
  }

  if (error?.code === "ECONNABORTED") {
    return {
      status: 0,
      message: "The request took too long. Check your connection and try again.",
      errors: {},
      code: "ECONNABORTED",
      isCanceled: false,
    };
  }

  const status = error?.response?.status || 0;
  const data = error?.response?.data || {};
  const errors = normalizeValidationErrors(data.errors);
  const code = safeErrorCode(data.code || error?.code);

  if (!error?.response) {
    return {
      status,
      message: typeof navigator !== "undefined" && navigator.onLine === false
        ? "You are offline. Please reconnect and try again."
        : "The server could not be reached.",
      errors,
      code,
      isCanceled: false,
    };
  }

  if (status === 422 && Object.keys(errors).length) {
    return {
      status,
      message: firstValidationMessage(errors) || statusMessages[422],
      errors,
      code,
      isCanceled: false,
    };
  }

  if (status >= 500) {
    return {
      status,
      message: "The service is temporarily unavailable. Please try again soon.",
      errors,
      code,
      isCanceled: false,
    };
  }

  return {
    status,
    message: statusMessages[status] || safeServerMessage(data.message) || "Something went wrong. Please try again.",
    errors,
    code,
    isCanceled: false,
  };
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.userMessage || error?.normalized?.message || error?.response?.data?.message || fallback;
}

export function withAbortSignal(config = {}, signal) {
  if (!signal) {
    return config;
  }

  return {
    ...config,
    signal,
  };
}

export function createAbortController() {
  if (typeof AbortController === "undefined") {
    return {
      signal: undefined,
      abort: () => {},
    };
  }

  return new AbortController();
}

export function isRequestCanceled(error) {
  return Boolean(
    axios.isCancel(error)
      || error?.code === "ERR_CANCELED"
      || error?.name === "CanceledError"
      || error?.normalized?.isCanceled,
  );
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

function safeServerMessage(message) {
  if (typeof message !== "string") {
    return "";
  }

  const trimmed = message.trim();
  const unsafePatterns = [/sqlstate/i, /stack trace/i, /exception/i, /vendor[\\/]/i, /\.php:\d+/i];

  if (!trimmed || trimmed.length > 180 || unsafePatterns.some((pattern) => pattern.test(trimmed))) {
    return "";
  }

  return trimmed;
}

function safeErrorCode(code) {
  if (typeof code !== "string") {
    return "";
  }

  const trimmed = code.trim();

  return /^[A-Z0-9_.-]{2,60}$/i.test(trimmed) ? trimmed : "";
}

export default api;
