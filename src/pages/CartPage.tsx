import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../context/CartContext";
import Button from "../shared/ui/Button";

import "../styles/cart.css";

export default function CartPage() {
    const navigate = useNavigate();

    const {
        items,
        totalItems,
        totalPrice,
        isLoading,
        error,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    } = useCart();

    const [isUpdating, setIsUpdating] = useState(false);

    async function handleCartAction(action: () => Promise<void>) {
        setIsUpdating(true);

        try {
            await action();
        } catch {
            // შეცდომის შეტყობინება CartContext-ში ინახება.
        } finally {
            setIsUpdating(false);
        }
    }

    const formatPrice = (price: number) =>
        `${price.toLocaleString("ka-GE")} ₾`;

    return (
        <main className="cart-page">
            <header className="cart-header">
                <div>
                    <span className="auth-eyebrow">BOOKS STORE</span>
                    <h1>ჩემი კალათა</h1>
                    <p>კალათაში დამატებული წიგნები: {totalItems}</p>
                </div>

                <Button variant="secondary" onClick={() => navigate("/catalog")}>
                    ← კატალოგში დაბრუნება
                </Button>
            </header>

            {isLoading ? (
                <section className="cart-empty">
                    <p>კალათა იტვირთება...</p>
                </section>
            ) : error ? (
                <section className="cart-empty">
                    <h2>შეცდომა</h2>
                    <p>{error}</p>
                    <Button onClick={() => window.location.reload()}>თავიდან ცდა</Button>
                </section>
            ) : items.length === 0 ? (
                <section className="cart-empty">
                    <h2>თქვენი კალათა ცარიელია</h2>
                    <p>შეარჩიე სასურველი წიგნები კატალოგიდან.</p>
                    <Button onClick={() => navigate("/catalog")}>წიგნების დათვალიერება</Button>
                </section>
            ) : (
                <>
                    <section className="cart-items">
                        {items.map((item) => {
                            const { product } = item;

                            return (
                                <article className="cart-item" key={item.id}>
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="cart-item__image"
                                    />

                                    <div className="cart-item__info">
                                        <h2>{product.title}</h2>
                                        <p>{product.brand}</p>

                                        <strong>{formatPrice(product.price)}</strong>
                                    </div>

                                    <div className="cart-item__quantity">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleCartAction(() =>
                                                decreaseQuantity(item.id),
                                                )
                                            }
                                            disabled={isUpdating}
                                            aria-label="რაოდენობის შემცირება"
                                        >
                                            -
                                        </button>

                                        <span>{item.qty}</span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                void handleCartAction(() =>
                                                    increaseQuantity(item.id),
                                                )
                                            }
                                            disabled={
                                                isUpdating || item.qty >= product.stock
                                            }
                                            aria-label="რაოდენობის გაზრდა"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-item__subtotal">
                                        <strong>{formatPrice(item.lineTotal)}</strong>

                                        <button
                                            type="button"
                                            className="cart-remove"
                                            onClick={() =>
                                                void handleCartAction(() =>
                                                    removeFromCart(item.id),
                                                )
                                            }
                                            disabled={isUpdating}
                                        >
                                            წაშლა
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="cart-summary">
                        <div>
                            <span>სულ პროდუქტი:</span>
                            <strong>{totalItems}</strong>
                        </div>

                        <div className="cart-summary__total">
                            <span>ჯამური ღირებულება:</span>
                            <strong>{formatPrice(totalPrice)}</strong>
                        </div>

                        <div className="cart-summary__actions">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    void handleCartAction(clearCart)
                                }
                                disabled={isUpdating}
                            >
                                კალათის გასუფთავება
                            </Button>

                            <Button
                                onClick={() => navigate("/checkout")}
                                disabled={isUpdating || items.length === 0}
                            >
                                შეკვეთის გაფორმება
                            </Button>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}
