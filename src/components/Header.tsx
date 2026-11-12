import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";
import Button from "../shared/ui/Button";

import "../styles/header.css";

function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { totalItems } = useCart();
    const { themeMode, setThemeMode } = useTheme();

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const changeLanguage = (language: "ka" | "en") => {
        void i18n.changeLanguage(language);
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <header className="site-header">
            <div className="header-container">
                <Link to="/" className="header-logo">
                    BOOKS<span>STORE</span>
                </Link>

                <nav className="header-nav">
                    <Link to="/">{t("header.home")}</Link>
                    <Link to="/catalog">{t("header.catalog")}</Link>

                    {isAuthenticated && (
                        <>
                            <Link to="/profile">{t("header.profile")}</Link>
                            <Link to="/orders">{t("header.orders")}</Link>
                            <Link to="/addresses">{t("header.addresses")}</Link>
                        </>
                    )}
                </nav>

                <div className="header-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to="/cart" className="header-cart">
                                

                                <svg
                                    className="header-cart__icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <circle cx="9" cy="21" r="1" />
                                    <circle cx="20" cy="21" r="1" />
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                </svg>

                                <span className="cart-count">{totalItems}</span>
                            </Link>

                            <span className="header-user">
                                {user?.name || user?.email}
                            </span>

                            <Button onClick={handleLogout}>
                                {t("header.logout")}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/login")}
                            >
                                {t("header.login")}
                            </Button>

                            <Button onClick={() => navigate("/register")}>
                                {t("header.register")}
                            </Button>
                        </>
                    )}

                    <div className="language-switcher" role="group" aria-label="Language">
                        <button
                            type="button"
                            className={i18n.language.startsWith("ka") ? "active" : ""}
                            onClick={() => changeLanguage("ka")}
                            aria-label="ქართული ენა"
                            aria-pressed={i18n.language.startsWith("ka")}
                        >
                            KA
                        </button>

                        <button
                            type="button"
                            className={i18n.language.startsWith("en") ? "active" : ""}
                            onClick={() => changeLanguage("en")}
                            aria-label="English language"
                            aria-pressed={i18n.language.startsWith("en")}
                        >
                            EN
                        </button>
                    </div>

                    <div
                        className="theme-switcher"
                        role="group"
                        aria-label={t("header.theme")}
                    >
                        <button
                            type="button"
                            className={themeMode === "light" ? "active" : ""}
                            onClick={() => setThemeMode("light")}
                            aria-label={t("header.themeLight")}
                            aria-pressed={themeMode === "light"}
                            title={t("header.themeLight")}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                            </svg>
                            <span>{t("header.themeLight")}</span>
                        </button>

                        <button
                            type="button"
                            className={themeMode === "dark" ? "active" : ""}
                            onClick={() => setThemeMode("dark")}
                            aria-label={t("header.themeDark")}
                            aria-pressed={themeMode === "dark"}
                            title={t("header.themeDark")}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
                            </svg>
                            <span>{t("header.themeDark")}</span>
                        </button>

                        <button
                            type="button"
                            className={themeMode === "system" ? "active" : ""}
                            onClick={() => setThemeMode("system")}
                            aria-label={t("header.themeSystem")}
                            aria-pressed={themeMode === "system"}
                            title={t("header.themeSystem")}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="4" width="18" height="13" rx="2" />
                                <path d="M8 21h8m-4-4v4" />
                            </svg>
                            <span>{t("header.themeSystem")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
