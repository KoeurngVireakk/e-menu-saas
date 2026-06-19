import "@testing-library/jest-dom/vitest";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

vi.mock("@testing-library/react", async () => {
  const actual = await vi.importActual("@testing-library/react");

  return {
    ...actual,
    render: (ui, options = {}) => {
      const ProvidedWrapper = options.wrapper;
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });

      function TestQueryWrapper({ children }) {
        const wrappedChildren = ProvidedWrapper
          ? React.createElement(ProvidedWrapper, null, children)
          : children;

        return React.createElement(QueryClientProvider, { client: queryClient }, wrappedChildren);
      }

      return actual.render(ui, { ...options, wrapper: TestQueryWrapper });
    },
  };
});

class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

globalThis.IntersectionObserver = globalThis.IntersectionObserver || IntersectionObserverMock;
