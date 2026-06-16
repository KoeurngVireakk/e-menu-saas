import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import InstallPrompt from "./components/InstallPrompt";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import ToastProvider from "./components/ui/ToastProvider";
import { LanguageProvider } from "./i18n";
import { queryClient } from "./lib/queryClient";
import AppRoutes from "./routes/AppRoutes";

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
            <InstallPrompt />
            <PwaUpdatePrompt />
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
