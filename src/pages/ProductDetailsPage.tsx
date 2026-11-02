import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { catalogService } from "../services/catalogService";
import type { ProductDetails } from "../types/product";
import ProductCard from "../components/ProductCard";
import Button from "../shared/ui/Button";
import { useCart } from "../context/CartContext";

import "../styles/product-details.css";

export default function ProductDetailsPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const { addToCart, items } = useCart();

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
                setError("პროდუქტის მისამართი არასწორია.");
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
                    setError("პროდუქტის მონაცემების ჩატვირთვა ვერ მოხერხდა. შესაძლოა, პროდუქტი აღარ არსებობს.",);
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
        if (!product || !product.inStock || isAddingToCart) {
            return;
        }

        setIsAddingToCart(true);
        setCartError("");

        try {
            await addToCart(product);
            navigate("/cart");
        } catch (err) {
            setCartError(
                err instanceof Error
                    ? err.message
                    : "პროდუქტის კალათაში დამატება ვერ მოხერხდა.",
            );
        } finally {
            setIsAddingToCart(false);
        }
    }
    
    if (isLoading) {
        return (
            <main className="product-details-page">
                <p className="product-details-message" role="status">პროდუქტის მონაცემები იტვირთება...</p>
            </main>
        );
    }
    
    if (error || !product) {
        return (
            <main className="product-details-page">
                <div className="product-details-message" role="alert">
                    <h1>პროდუქტი ვერ ჩაიტვირთა</h1>
                    <p>{error || "პროდუქტი ვერ მოიძებნა."}</p>
                    
                    <Button onClick={() => navigate("/catalog")}>
                        კატალოგში დაბრუნება
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
                
    return (
        <main className="product-details-page">
            <header className="product-details-header">
                <div>
                    <span className="auth-eyebrow">BOOKS STORE</span>
                    <h1>წიგნის დეტალები</h1>
                </div>
                
                <Button variant="secondary" onClick={() => navigate("/catalog")}>
                    ← კატალოგში დაბრუნება
                </Button>
            </header>
            
            <section className="product-details-card">
                <div className="product-details-gallery">
                    {images.length > 0 ? (
                        images.map((image, index) => (
                            <img
                                key={`${image}-${index}`}
                                src={image}
                                alt={`${product.title} — ფოტო ${index + 1}`}
                                className={
                                    index === 0
                                        ? "product-details-main-image"
                                        : "product-details-extra-image"
                                }
                            />
                        ))
                    ) : (
                        <div className="product-details-no-image">
                            სურათი მიუწვდომელია
                        </div>
                    )}
                </div>
                
                <div className="product-details-info">
                    <span className="product-details-category">
                        {product.category?.name || "კატეგორია"}
                    </span>
                    
                    <h2>{product.title}</h2>
                    
                    {product.brand && (
                        <p className="product-details-brand">
                            ავტორი / გამომცემელი: {product.brand}
                        </p>
                    )}
                    
                    <div className="product-details-rating">
                        <span aria-label="რეიტინგი">★</span>
                        <strong>{Number(product.rating ?? 0).toFixed(1)}</strong>
                        <span>
                            ({product.reviewsCount ?? 0} შეფასება)
                        </span>
                    </div>
                    
                    <div className="product-details-prices">
                        <strong>
                            {product.price.toLocaleString("ka-GE")} ₾
                        </strong>
                        
                        {hasDiscount && (
                            <>
                                <span className="product-details-old-price">
                                    {product.oldPrice!.toLocaleString("ka-GE")} ₾
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
                                ? "არ არის მარაგში"
                                : isAddingToCart
                                    ? "ემატება..."
                                    : "კალათაში დამატება"}
                        </Button>

                        {isInCart && (
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/cart")}
                            >
                                კალათის ნახვა
                            </Button>
                        )}
                    </div>

                    {cartError && (
                        <p className="product-details-message" role="alert">
                            {cartError}
                        </p>
                    )}
                    
                    <p
                        className={
                            product.inStock
                                ? "product-details-stock is-available"
                                : "product-details-stock is-unavailable"
                            }
                        >
                            {product.inStock
                                ? `მარაგშია${product.stock > 0 ? ` — ${product.stock} ცალი` : ""}`
                                : "ამჟამად მარაგში არ არის"}
                    </p>

                    {product.warrantyMonths > 0 && (
                        <p className="product-details-warranty">
                            გარანტია: {product.warrantyMonths} თვე
                        </p>
                    )}

                    <div className="product-details-description">
                        <h3>აღწერა</h3>
                        <p>
                            {product.description || "აღწერა მითითებული არ არის."}
                        </p>
                    </div>

                    {product.specs &&
                        Object.keys(product.specs).length > 0 && (
                            <div className="product-details-specs">
                                <h3>მახასიათებლები</h3>

                                <dl>
                                    {Object.entries(product.specs).map(
                                        ([key, value]) => (
                                            <div key={key} className="product-details-spec">
                                                <dt>{key}</dt>
                                                <dd>{String(value)}</dd>
                                            </div>
                                        ),
                                    )}
                                </dl>
                            </div>
                    )}
                </div>
            </section>
            
            {product.related && product.related.length > 0 && (
                <section className="product-details-related">
                    <h2>მსგავსი პროდუქტები</h2>
                    
                    <div className="product-grid">
                        {product.related.map((relatedProduct) => (
                            <ProductCard
                                key={relatedProduct.id}
                                product={relatedProduct}
                                onViewDetails={(relatedSlug) =>
                                    navigate(`/products/${encodeURIComponent(relatedSlug)}`)
                                }
                            />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}
