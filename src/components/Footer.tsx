import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuth } from "../context/AuthContext";

import "../styles/footer.css";

function Footer() {
    const { isAuthenticated } = useAuth();
    const { t } = useTranslation();

    return (
        <footer className="site-footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        BOOKS<span>STORE</span>
                    </Link>

                    <p>{t("footer.description")}</p>
                </div>

                <div className="footer-links">
                    <h3>{t("footer.navigation")}</h3>
                    <Link to="/catalog">{t("footer.catalog")}</Link>

                    {isAuthenticated && (
                        <>
                            <Link to="/orders">{t("footer.orders")}</Link>
                            <Link to="/addresses">{t("footer.addresses")}</Link>
                            <Link to="/cart">{t("footer.cart")}</Link>
                        </>
                    )}
                </div>

                <div className="footer-contact">
                    <h3>{t("footer.information")}</h3>
                    <p>{t("footer.storeDescription")}</p>
                    <p>{t("footer.thankYou")}</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>
                    © {new Date().getFullYear()} BOOKS STORE.
                    {" "}{t("footer.copyright")}
                </p>
            </div>
        </footer>
    );
}

export default Footer;
