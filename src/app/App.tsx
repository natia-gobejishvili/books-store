import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CatalogPage from "../pages/CatalogPage";
import ProductDetailsPage from "../pages/ProductDetailsPage";
import CartPage from "../pages/CartPage";
import ProtectedRoute from "./ProtectedRoute";
import { CartProvider } from "../context/CartContext";

export default function App() {
    return (
        <CartProvider>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/products/:slug" element={<ProductDetailsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </CartProvider>
    );
}
