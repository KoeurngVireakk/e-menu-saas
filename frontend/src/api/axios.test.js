import { describe, expect, it } from "vitest";
import { getApiErrorMessage, normalizeApiError } from "./axios";

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

  it("uses normalized user messages when available", () => {
    expect(getApiErrorMessage({ userMessage: "Friendly message" })).toBe("Friendly message");
  });
});
