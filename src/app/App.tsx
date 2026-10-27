
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CatalogPage from "../pages/CatalogPage";
import ProtectedRoute from "./ProtectedRoute";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/catalog" element={<CatalogPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
