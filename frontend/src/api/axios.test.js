import { describe, expect, it } from "vitest";
import api, {
  API_TIMEOUT_MS,
  createAbortController,
  getApiErrorMessage,
  isRequestCanceled,
  normalizeApiError,
  withAbortSignal,
} from "./axios";

describe("API client defaults", () => {
  it("uses a shared base URL and timeout", () => {
    expect(api.defaults.baseURL).toBeTruthy();
    expect(api.defaults.timeout).toBe(API_TIMEOUT_MS);
  });

  it("attaches Accept and auth headers without forcing preflight headers", async () => {
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
    expect(response.data.headers.Authorization).toBe("Bearer test-token");
    expect(response.data.headers["X-Requested-With"]).toBeUndefined();
    expect(response.data.headers["Content-Type"]).toBeUndefined();
    expect(response.data.headers["X-Api-Key"]).toBeUndefined();

    localStorage.removeItem("emenu_token");
  });

  it("supports AbortController signals through request config", () => {
    const controller = createAbortController();

    expect(withAbortSignal({ params: { page: 1 } }, controller.signal)).toEqual({
      params: { page: 1 },
      signal: controller.signal,
    });
  });

  it("keeps config unchanged when no abort signal is supplied", () => {
    expect(withAbortSignal({ params: { page: 1 } })).toEqual({ params: { page: 1 } });
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

  it("marks canceled requests without treating them as server failures", () => {
    const error = { code: "ERR_CANCELED", name: "CanceledError" };
    const normalized = normalizeApiError(error);

    expect(isRequestCanceled(error)).toBe(true);
    expect(normalized).toMatchObject({
      status: 0,
      code: "ERR_CANCELED",
      isCanceled: true,
    });
  });

  it("gives timed-out requests an actionable retry message", () => {
    expect(normalizeApiError({ code: "ECONNABORTED" })).toMatchObject({
      status: 0,
      code: "ECONNABORTED",
      message: "The request took too long. Check your connection and try again.",
    });
  });
});
