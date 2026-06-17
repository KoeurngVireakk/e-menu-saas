import { lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastProvider from "./components/ui/ToastProvider";
import { LanguageProvider } from "./i18n";
import { queryClient } from "./lib/queryClient";
import AppRoutes from "./routes/AppRoutes";

const InstallPrompt = lazy(() => import("./components/InstallPrompt"));
const PwaUpdatePrompt = lazy(() => import("./components/PwaUpdatePrompt"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
            <ToastProvider />
            <Suspense fallback={null}>
              <InstallPrompt />
              <PwaUpdatePrompt />
            </Suspense>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
