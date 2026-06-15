import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import InstallPrompt from "./components/InstallPrompt";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <InstallPrompt />
        <PwaUpdatePrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
