import ForbiddenPage from "../pages/admin/ForbiddenPage";
import { useAuth } from "../context/AuthContext";
import { canView } from "../utils/permissions";

export default function PermissionRoute({ feature, children }) {
  const { user } = useAuth();

  if (!canView(user, feature)) {
    return <ForbiddenPage />;
  }

  return children;
}
