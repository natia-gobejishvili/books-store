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
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    } = useCart();

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

            {items.length === 0 ? (
                <section className="cart-empty">
                    <h2>თქვენი კალათა ცარიელია</h2>
                    <p>შეარჩიე სასურველი წიგნები კატალოგიდან.</p>

                    <Button onClick={() => navigate("/catalog")}>
                        წიგნების დათვალიერება
                    </Button>
                </section>
            ) : (
                <>
                    <section className="cart-items">
                        {items.map(({ product, quantity }) => (
                            <article className="cart-item" key={product.id}>
                                <img
                                    src={product.image}
                                    alt={product.title}
                                    className="cart-item__image"
                                />

                                <div className="cart-item__info">
                                    <h2>{product.title}</h2>
                                    <p>{product.category?.name}</p>

                                    <strong>
                                        {product.price.toLocaleString("ka-GE")} ₾
                                    </strong>
                                </div>

                                <div className="cart-item__quantity">
                                    <button
                                        type="button"
                                        onClick={() => decreaseQuantity(product.id)}
                                        aria-label="რაოდენობის შემცირება"
                                    >
                                        -
                                    </button>

                                    <span>{quantity}</span>

                                    <button
                                        type="button"
                                        onClick={() => increaseQuantity(product.id)}
                                        disabled={quantity >= product.stock}
                                        aria-label="რაოდენობის გაზრდა"
                                    >
                                        +
                                    </button>
                                </div>

                                <div className="cart-item__subtotal">
                                    <strong>
                                        {(product.price * quantity).toLocaleString("ka-GE")} ₾
                                    </strong>

                                    <button
                                        type="button"
                                        className="cart-remove"
                                        onClick={() => removeFromCart(product.id)}
                                    >
                                        წაშლა
                                    </button>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="cart-summary">
                        <div>
                            <span>სულ პროდუქტი:</span>
                            <strong>{totalItems}</strong>
                        </div>

                        <div className="cart-summary__total">
                            <span>ჯამური ღირებულება:</span>
                            <strong>{totalPrice.toLocaleString("ka-GE")} ₾</strong>
                        </div>

                        <div className="cart-summary__actions">
                            <Button variant="secondary" onClick={clearCart}>
                                კალათის გასუფთავება
                            </Button>

                            <Button
                                onClick={() =>
                                    window.alert(
                                        "შეკვეთის გაფორმების ფუნქცია შემდეგ ეტაპზე დაემატება.",
                                    )
                                }
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
