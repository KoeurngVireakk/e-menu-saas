import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import InstallPrompt from "./components/InstallPrompt";
import PwaUpdatePrompt from "./components/PwaUpdatePrompt";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <InstallPrompt />
        <PwaUpdatePrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
