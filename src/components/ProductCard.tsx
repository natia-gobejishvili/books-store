import { useTranslation } from "react-i18next";
import type { Product } from "../types/product";

type ProductCardProps = {
    product: Product;
    onViewDetails?: (slug: string) => void;
};

export default function ProductCard({
    product,
    onViewDetails,
}: ProductCardProps) {
    const { t, i18n } = useTranslation();

    const locale = i18n.language.startsWith("en") ? "en-US" : "ka-GE";

    const hasDiscount =
        product.oldPrice !== null &&
        product.oldPrice > product.price;

    const categoryName =
        locale === "en-US"
            ? product.category.nameEn || product.category.name
            : product.category.name;

    return (
        <article className="product-card">
            <div className="product-card__image-wrap">
                <img
                    className="product-card__image"
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                />

                {hasDiscount && (
                    <span className="product-card__discount">
                        -{product.discountPercent ?? Math.round(
                            ((product.oldPrice! - product.price) /
                                product.oldPrice!) *
                                100,
                        )}%
                    </span>
                )}

                {!product.inStock && (
                    <span className="product-card__out-of-stock">
                        {t("productCard.outOfStock")}
                    </span>
                )}
            </div>

            <div className="product-card__content">
                <span className="product-card__category">
                    {categoryName}
                </span>

                <h3 className="product-card__title">
                    {product.title}
                </h3>

                <div className="product-card__rating">
                    <span aria-label={t("productCard.rating")}>★</span>{" "}
                    {product.rating.toFixed(1)}
                    <span className="product-card__reviews">
                        ({product.reviewsCount})
                    </span>
                </div>

                <div className="product-card__prices">
                    <strong className="product-card__price">
                        {product.price.toLocaleString(locale)} ₾
                    </strong>

                    {hasDiscount && (
                        <span className="product-card__old-price">
                            {product.oldPrice!.toLocaleString(locale)} ₾
                        </span>
                    )}
                </div>

                <button
                    className="product-card__button"
                    type="button"
                    onClick={() => onViewDetails?.(product.slug)}
                >
                    {t("productCard.details")}
                </button>
            </div>
        </article>
    );
}