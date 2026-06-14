import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "../components/ui/States";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <LoadingState message="Checking session..." />
      </div>
    );
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
