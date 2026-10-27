
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { isLoading, isAuthenticated } = useAuth();
    const location = useLocation();
    
    if (isLoading) {
        return (
            <main className="auth-page" aria-live="polite">
                <p>მომხმარებლის მონაცემები იტვირთება...</p>
            </main>
        );
    }
    
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }
    
    return <Outlet />;
}
