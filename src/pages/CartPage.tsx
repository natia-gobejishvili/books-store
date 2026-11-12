import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCart } from "../context/CartContext";
import Button from "../shared/ui/Button";

import "../styles/cart.css";

export default function CartPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const locale = i18n.language.startsWith("en") ? "en-US" : "ka-GE";

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
        `${price.toLocaleString(locale)} ₾`;

    return (
        <main className="cart-page">
            <header className="cart-header">
                <div>
                    <h1>{t("cart.title")}</h1>
                    <p>
                        {t("cart.itemsCount", { count: totalItems })}
                    </p>
                </div>

                <Button
                    variant="secondary"
                    onClick={() => navigate("/catalog")}
                >
                    ← {t("cart.backToCatalog")}
                </Button>
            </header>

            {isLoading ? (
                <section className="cart-empty">
                    <p>{t("cart.loading")}</p>
                </section>
            ) : error ? (
                <section className="cart-empty">
                    <h2>{t("cart.errorTitle")}</h2>
                    <p>{error}</p>
                    <Button onClick={() => window.location.reload()}>
                        {t("cart.retry")}
                    </Button>
                </section>
            ) : items.length === 0 ? (
                <section className="cart-empty">
                    <h2>{t("cart.emptyTitle")}</h2>
                    <p>{t("cart.emptyDescription")}</p>
                    <Button onClick={() => navigate("/catalog")}>
                        {t("cart.browseBooks")}
                    </Button>
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
                                        {product.brand && <p>{product.brand}</p>}

                                        <strong>
                                            {formatPrice(product.price)}
                                        </strong>
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
                                            aria-label={t("cart.decreaseQuantity")}
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
                                                isUpdating ||
                                                item.qty >= product.stock
                                            }
                                            aria-label={t("cart.increaseQuantity")}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="cart-item__subtotal">
                                        <strong>
                                            {formatPrice(item.lineTotal)}
                                        </strong>

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
                                            {t("cart.remove")}
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </section>

                    <section className="cart-summary">
                        <div>
                            <span>{t("cart.totalProducts")}:</span>
                            <strong>{totalItems}</strong>
                        </div>

                        <div className="cart-summary__total">
                            <span>{t("cart.totalPrice")}:</span>
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
                                {t("cart.clearCart")}
                            </Button>

                            <Button
                                onClick={() => navigate("/checkout")}
                                disabled={isUpdating || items.length === 0}
                            >
                                {t("cart.checkout")}
                            </Button>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}