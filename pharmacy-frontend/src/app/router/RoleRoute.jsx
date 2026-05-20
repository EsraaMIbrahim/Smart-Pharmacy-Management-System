import { Navigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function RoleRoute({
  allowedRoles,

  children,
}) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/store" />;
  }

  return children;
}
