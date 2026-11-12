import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { catalogService } from "../services/catalogService";
import type { Product } from "../types/product";
import ProductCard from "../components/ProductCard";
import Button from "../shared/ui/Button";

import "../styles/catalog.css";
import "../styles/home.css";

export default function HomePage() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadPopularBooks() {
            try {
                const response = await catalogService.getProducts({
                    category: "books",
                    sort: "popular",
                    page: 1,
                    limit: 4,
                });

                if (!cancelled) {
                    setProducts(response.items);
                }
            } catch {
                if (!cancelled) {
                    setError(t("home.loadError"));
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadPopularBooks();

        return () => {
            cancelled = true;
        };
    }, [t]);

    function handleViewDetails(slug: string) {
        navigate(`/products/${encodeURIComponent(slug)}`);
    }

    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="home-hero__content">
                    <span className="home-eyebrow">
                        {t("home.eyebrow")}
                    </span>

                    <h1>
                        {t("home.heroTitle")}
                        <br />
                        {t("home.heroTitleSecond")}
                    </h1>

                    <p>{t("home.heroDescription")}</p>

                    <div className="home-hero__actions">
                        <Button onClick={() => navigate("/catalog")}>
                            {t("home.viewCatalog")}
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={() => navigate("/login")}
                        >
                            {t("home.login")}
                        </Button>
                    </div>

                    <div className="home-hero__note">
                        <span>✦</span>
                        {t("home.heroNote")}
                    </div>
                </div>

                <div className="home-hero_visual">
                    <img src="/images/books-hero.jpg" alt="Books" className="home-hero_image"/>
                </div>
            </section>

            <section className="home-benefits">
                <article className="home-benefit">
                    <span className="home-benefit__icon">📚</span>
                    <div>
                        <h3>{t("home.benefits.choiceTitle")}</h3>
                        <p>{t("home.benefits.choiceDescription")}</p>
                    </div>
                </article>

                <article className="home-benefit">
                    <span className="home-benefit__icon">🚚</span>
                    <div>
                        <h3>{t("home.benefits.orderTitle")}</h3>
                        <p>{t("home.benefits.orderDescription")}</p>
                    </div>
                </article>

                <article className="home-benefit">
                    <span className="home-benefit__icon">♡</span>
                    <div>
                        <h3>{t("home.benefits.personalTitle")}</h3>
                        <p>{t("home.benefits.personalDescription")}</p>
                    </div>
                </article>
            </section>

            <section className="home-popular">
                <div className="home-section-heading">
                    <div>
                        <span className="home-section-eyebrow">
                            {t("home.popularEyebrow")}
                        </span>

                        <h2>{t("home.popularTitle")}</h2>
                        <p>{t("home.popularDescription")}</p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => navigate("/catalog")}
                    >
                        {t("home.allBooks")}
                    </Button>
                </div>

                {isLoading && (
                    <div className="home-message" role="status">
                        {t("home.loading")}
                    </div>
                )}

                {error && (
                    <div className="home-message home-message--error" role="alert">
                        {error}

                        <Button
                            variant="secondary"
                            onClick={() => navigate("/catalog")}
                        >
                            {t("home.viewCatalog")}
                        </Button>
                    </div>
                )}

                {!isLoading && !error && products.length === 0 && (
                    <div className="home-message">
                        {t("home.empty")}

                        <Button onClick={() => navigate("/catalog")}>
                            {t("home.viewCatalog")}
                        </Button>
                    </div>
                )}

                {!isLoading && !error && products.length > 0 && (
                    <div className="home-product-grid">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section className="home-cta">
                <div>
                    <span className="home-section-eyebrow">
                        {t("home.ctaEyebrow")}
                    </span>

                    <h2>{t("home.ctaTitle")}</h2>
                    <p>{t("home.ctaDescription")}</p>
                </div>

                <Button onClick={() => navigate("/catalog")}>
                    {t("home.ctaButton")}
                </Button>
            </section>
        </main>
    );
}