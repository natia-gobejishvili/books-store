import type { Product } from "../types/product";

type ProductCardProps = {
    product: Product;
    onViewDetails?: (slug: string) => void;
};

export default function ProductCard({
    product,
    onViewDetails,
}: ProductCardProps) {
    const hasDiscount =
        product.oldPrice !== null &&
        product.oldPrice > product.price;
    
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
                        არ არის მარაგში
                    </span>
                )}
            </div>
            
            <div className="product-card__content">
                <span className="product-card__category">
                    {product.category.name}
                </span>
                
                <h3 className="product-card__title">
                    {product.title}
                </h3>
                
                <div className="product-card__rating">
                    <span>★</span> {product.rating.toFixed(1)}
                    <span className="product-card__reviews">
                        ({product.reviewsCount})
                    </span>
                </div>
                
                <div className="product-card__prices">
                    <strong className="product-card__price">
                        {product.price.toLocaleString("ka-GE")} ₾
                    </strong>
                    
                    {hasDiscount && (
                        <span className="product-card__old-price">
                            {product.oldPrice!.toLocaleString("ka-GE")} ₾
                        </span>
                    )}
                </div>
                
                <button
                    className="product-card__button"
                    type="button"
                    onClick={() => onViewDetails?.(product.slug)}
                >
                    დეტალურად
                </button>
            </div>
        </article>
    );
}
