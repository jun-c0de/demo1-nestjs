import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) {
        return <div>로딩 중...</div>;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/auth?mode=login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}