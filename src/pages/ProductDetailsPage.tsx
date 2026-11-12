import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { catalogService } from "../services/catalogService";
import type { ProductDetails } from "../types/product";
import ProductCard from "../components/ProductCard";
import Button from "../shared/ui/Button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "../styles/product-details.css";

const SPEC_LABEL_KEYS: Record<string, string> = {
    "ჟანრი": "productDetails.specs.genre",
    "ენა": "productDetails.specs.language",
    "ყდა": "productDetails.specs.cover",
    "გვერდების რაოდენობა": "productDetails.specs.pages",
    "გამოცემის წელი": "productDetails.specs.publicationYear",
    "ფორმატი": "productDetails.specs.format",
    "ISBN": "productDetails.specs.isbn",
    "წონა": "productDetails.specs.weight",
};

const SPEC_VALUE_KEYS: Record<string, string> = {
    "ბიოგრაფია": "productDetails.specValues.biography",
    "ინგლისური": "productDetails.specValues.english",
    "მაგარი": "productDetails.specValues.hardcover",
};

export default function ProductDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const locale = i18n.language.startsWith("en") ? "en-US" : "ka-GE";

    const { addToCart, items } = useCart();
    const { isAuthenticated } = useAuth();

    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [cartError, setCartError] = useState("");

    const isInCart = product
        ? items.some((item) => item.productId === product.id)
        : false;

    useEffect(() => {
        let cancelled = false;

        async function loadProduct() {
            if (!slug) {
                setError("productDetails.invalidAddress");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError("");
            setProduct(null);

            try {
                const response = await catalogService.getProduct(slug);

                if (!cancelled) {
                    setProduct(response);
                }
            } catch {
                if (!cancelled) {
                    setError("productDetails.loadError");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadProduct();

        return () => {
            cancelled = true;
        };
    }, [slug]);

    async function handleAddToCart() {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            setCartError("");
            return;
        }

        if (!product || !product.inStock || isAddingToCart) {
            return;
        }

        setShowLoginPrompt(false);
        setIsAddingToCart(true);
        setCartError("");

        try {
            await addToCart(product);
            navigate("/cart");
        } catch (err) {
            setCartError(
                err instanceof Error
                    ? err.message
                    : t("productDetails.addToCartError"),
            );
        } finally {
            setIsAddingToCart(false);
        }
    }

    if (isLoading) {
        return (
            <main className="product-details-page">
                <p className="product-details-message" role="status">
                    {t("productDetails.loading")}
                </p>
            </main>
        );
    }

    if (error || !product) {
        return (
            <main className="product-details-page">
                <div className="product-details-message" role="alert">
                    <h1>{t("productDetails.loadErrorTitle")}</h1>
                    <p>
                        {error
                            ? t(error)
                            : t("productDetails.notFound")}
                    </p>

                    <Button onClick={() => navigate("/catalog")}>
                        {t("productDetails.backToCatalog")}
                    </Button>
                </div>
            </main>
        );
    }

    const hasDiscount =
        product.oldPrice !== null &&
        product.oldPrice > product.price;

    const images =
        product.images?.length > 0
            ? product.images
            : product.image
                ? [product.image]
                : [];

    const categoryName = product.category
        ? locale === "en-US"
            ? product.category.nameEn || product.category.name
            : product.category.name
        : t("productDetails.category");

    return (
        <main className="product-details-page">
            <header className="product-details-header">
                <div>
                    <h1>{t("productDetails.title")}</h1>
                </div>

                <Button
                    variant="secondary"
                    onClick={() => navigate("/catalog")}
                >
                    ← {t("productDetails.backToCatalog")}
                </Button>
            </header>

            <section className="product-details-card">
                <div className="product-details-gallery">
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <img
                                key={`${image}-${index}`}
                                src={image}
                                alt={t("productDetails.imageAlt", {
                                    title: product.title,
                                    number: index + 1,
                                })}
                                className={
                                    index === 0
                                        ? "product-details-main-image"
                                        : "product-details-extra-image"
                                }
                            />
                        ))
                    ) : (
                        <div className="product-details-no-image">
                            {t("productDetails.noImage")}
                        </div>
                    )}
                </div>

                <div className="product-details-info">
                    <span className="product-details-category">
                        {categoryName}
                    </span>

                    <h2>{product.title}</h2>

                    {product.brand && (
                        <p className="product-details-brand">
                            {t("productDetails.authorPublisher")}:{" "}
                            {product.brand}
                        </p>
                    )}

                    <div className="product-details-rating">
                        <span aria-label={t("productDetails.rating")}>★</span>
                        <strong>
                            {Number(product.rating ?? 0).toFixed(1)}
                        </strong>
                        <span>
                            ({product.reviewsCount ?? 0}{" "}
                            {t("productDetails.reviews")})
                        </span>
                    </div>

                    <div className="product-details-prices">
                        <strong>
                            {product.price.toLocaleString(locale)} ₾
                        </strong>

                        {hasDiscount && (
                            <>
                                <span className="product-details-old-price">
                                    {product.oldPrice!.toLocaleString(locale)} ₾
                                </span>

                                <span className="product-details-discount">
                                    -{product.discountPercent ??
                                        Math.round(
                                            ((product.oldPrice! - product.price) /
                                                product.oldPrice!) *
                                                100,
                                        )}%
                                </span>
                            </>
                        )}
                    </div>

                    <div className="product-details-cart-actions">
                        <Button
                            onClick={handleAddToCart}
                            disabled={!product.inStock || isAddingToCart}
                        >
                            {!product.inStock
                                ? t("productDetails.outOfStock")
                                : isAddingToCart
                                    ? t("productDetails.adding")
                                    : t("productDetails.addToCart")}
                        </Button>

                        {isInCart && (
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/cart")}
                            >
                                {t("productDetails.viewCart")}
                            </Button>
                        )}
                    </div>

                    {cartError && (
                        <p className="product-details-message" role="alert">
                            {cartError}
                        </p>
                    )}

                    {showLoginPrompt && (
                        <div className="product-login-prompt" role="alert">
                            <p>
                                {t("productDetails.loginRequired")}
                            </p>
                            <Button onClick={() => navigate("/login")}>
                                {t("productDetails.login")}
                            </Button>
                        </div>
                    )}

                    <p
                        className={
                            product.inStock
                                ? "product-details-stock is-available"
                                : "product-details-stock is-unavailable"
                        }
                    >
                        {product.inStock
                            ? product.stock > 0
                                ? t("productDetails.inStock", { count: product.stock })
                                : t("productDetails.inStockNoCount")
                            : t("productDetails.currentlyOutOfStock")}
                    </p>

                    {product.warrantyMonths > 0 && (
                        <p className="product-details-warranty">
                            {t("productDetails.warranty", {
                                count: product.warrantyMonths,
                            })}
                        </p>
                    )}

                    <div className="product-details-description">
                        <h3>{t("productDetails.description")}</h3>
                        <p>
                            {product.description ||
                                t("productDetails.noDescription")}
                        </p>
                    </div>

                    {product.specs &&
                        Object.keys(product.specs).length > 0 && (
                            <div className="product-details-specs">
                                <h3>{t("productDetails.specifications")}</h3>

                                <dl>
                                    {Object.entries(product.specs).map(([key, value]) => {
                                        const labelKey = SPEC_LABEL_KEYS[key];
                                        const valueKey = SPEC_VALUE_KEYS[String(value)];

                                        return (
                                            <div
                                                key={key}
                                                className="product-details-spec"
                                            >
                                                <dt>
                                                    {labelKey ? t(labelKey) : key}
                                                </dt>

                                                <dd>
                                                    {valueKey ? t(valueKey) : String(value)}
                                                </dd>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>
                        )}
                </div>
            </section>

            {product.related && product.related.length > 0 && (
                <section className="product-details-related">
                    <h2>{t("productDetails.relatedProducts")}</h2>

                    <div className="product-grid">
                        {product.related.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                product={relatedProduct}
                                onViewDetails={(relatedSlug) =>
                                    navigate(
                                        `/products/${encodeURIComponent(relatedSlug)}`,
                                    )
                                }
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
