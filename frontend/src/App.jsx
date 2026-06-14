import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import InstallPrompt from "./components/InstallPrompt";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <InstallPrompt />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
