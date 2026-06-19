import { describe, expect, it } from "vitest";
import api, { API_TIMEOUT_MS, getApiErrorMessage, normalizeApiError, withAbortSignal } from "./axios";

describe("API client defaults", () => {
  it("uses a shared base URL and timeout", () => {
    expect(api.defaults.baseURL).toBeTruthy();
    expect(api.defaults.timeout).toBe(API_TIMEOUT_MS);
  });

  it("attaches JSON and auth headers without secrets", async () => {
    localStorage.setItem("emenu_token", "test-token");

    const response = await api.get("/health", {
      adapter: (config) => Promise.resolve({
        data: config,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    });

    expect(response.data.headers.Accept).toBe("application/json");
    expect(response.data.headers["X-Requested-With"]).toBe("XMLHttpRequest");
    expect(response.data.headers.Authorization).toBe("Bearer test-token");
    expect(response.data.headers["X-Api-Key"]).toBeUndefined();

    localStorage.removeItem("emenu_token");
  });

  it("supports AbortController signals through request config", () => {
    const controller = new AbortController();

    expect(withAbortSignal({ params: { page: 1 } }, controller.signal)).toEqual({
      params: { page: 1 },
      signal: controller.signal,
    });
  });
});

describe("API error normalization", () => {
  it("returns the first Laravel validation message", () => {
    const normalized = normalizeApiError({
      response: {
        status: 422,
        data: {
          message: "Validation failed",
          errors: {
            email: ["The email field is required."],
          },
        },
      },
    });

    expect(normalized.message).toBe("The email field is required.");
    expect(normalized.errors.email).toEqual(["The email field is required."]);
  });

  it("hides server details from users", () => {
    const normalized = normalizeApiError({
      response: {
        status: 500,
        data: {
          message: "SQLSTATE secret detail",
        },
      },
    });

    expect(normalized.message).toBe("The service is temporarily unavailable. Please try again soon.");
  });

  it("does not expose stack-like server messages for non-500 statuses", () => {
    const normalized = normalizeApiError({
      response: {
        status: 409,
        data: {
          message: "Exception at vendor/framework/File.php:42",
        },
      },
    });

    expect(normalized.message).toBe("Something went wrong. Please try again.");
  });

  it("uses normalized user messages when available", () => {
    expect(getApiErrorMessage({ userMessage: "Friendly message" })).toBe("Friendly message");
  });
});
