import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { orderService } from "../services/orderService";
import type { Order } from "../types/order";
import Button from "../shared/ui/Button";

import "../styles/order-details.css";

function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) {
                setError("შეკვეთის ნომერი მითითებული არ არის.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const response = await orderService.getOrder(id);
                setOrder(response.order);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "შეკვეთის ჩატვირთვა ვერ მოხერხდა."
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchOrder();
    }, [id]);

    const formatPrice = (price: number) =>
        `${price.toFixed(2)} ₾`;

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("ka-GE", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getStatusLabel = (status: Order["status"]) => {
        const statuses: Record<Order["status"], string> = {
            pending_payment: "გადახდის მოლოდინში",
            paid: "გადახდილია",
            cancelled: "გაუქმებულია",
            failed: "წარუმატებელი",
        };

        return statuses[status] ?? status;
    };

    if (isLoading) {
        return (
            <main className="order-details-page">
                <p className="order-details-message">
                    შეკვეთის ინფორმაცია იტვირთება...
                </p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="order-details-page">
                <div className="order-details-error">
                    <h2>შეკვეთა ვერ მოიძებნა</h2>
                    <p>{error || "მოთხოვნილი შეკვეთა არ არსებობს."}</p>

                    <Button onClick={() => navigate("/orders")}>
                        შეკვეთების ისტორიაში დაბრუნება
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="order-details-page">
            <div className="order-details-heading">
                <div>
                    <h1>შეკვეთის დეტალები</h1>
                    <p>შეკვეთის ნომერი: #{order.id}</p>
                </div>

                <span className={`order-details-status status-${order.status}`}>
                    {getStatusLabel(order.status)}
                </span>
            </div>

            <section className="order-details-section">
                <h2>შეკვეთილი პროდუქტები</h2>

                <div className="order-products">
                    {order.items.map((item) => (
                        <article
                            className="order-product"
                            key={item.productId}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                            />

                            <div className="order-product-info">
                                <h3>{item.title}</h3>
                                <p>რაოდენობა: {item.qty}</p>
                                <p>ერთეულის ფასი: {formatPrice(item.price)}</p>
                            </div>

                            <strong>
                                {formatPrice(item.lineTotal)}
                            </strong>
                        </article>
                    ))}
                </div>
            </section>

            <div className="order-details-grid">
                <section className="order-details-section">
                    <h2>მიწოდების ინფორმაცია</h2>

                    <div className="order-info-list">
                        <p>
                            <span>მიმღები:</span>
                            {order.shipping.fullName}
                        </p>
                        <p>
                            <span>ტელეფონი:</span>
                            {order.shipping.phone}
                        </p>
                        <p>
                            <span>ქალაქი:</span>
                            {order.shipping.city}
                        </p>
                        <p>
                            <span>მისამართი:</span>
                            {order.shipping.address}
                        </p>
                    </div>
                </section>

                <section className="order-details-section">
                    <h2>შეკვეთის ინფორმაცია</h2>

                    <div className="order-info-list">
                        <p>
                            <span>შეკვეთის თარიღი:</span>
                            {formatDate(order.createdAt)}
                        </p>

                        {order.paidAt && (
                            <p>
                                <span>გადახდის თარიღი:</span>
                                {formatDate(order.paidAt)}
                            </p>
                        )}

                        {order.payment && (
                            <p>
                                <span>გადახდის ბარათი:</span>
                                {order.payment.brand.toUpperCase()} **** {order.payment.last4}
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <section className="order-details-section order-summary">
                <h2>გადახდის შეჯამება</h2>

                <div className="summary-row">
                    <span>პროდუქტების ღირებულება</span>
                    <span>{formatPrice(order.subtotal)}</span>
                </div>

                <div className="summary-row">
                    <span>მიწოდება</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                </div>

                <div className="summary-row summary-total">
                    <span>სულ გადასახდელი</span>
                    <strong>{formatPrice(order.total)}</strong>
                </div>
            </section>

            <div className="order-details-actions">
                <Button onClick={() => navigate("/orders")}>
                    შეკვეთების ისტორიაში დაბრუნება
                </Button>

                <Button onClick={() => navigate("/catalog")}>
                    კატალოგში დაბრუნება
                </Button>
            </div>
        </main>
    );
}

export default OrderDetailsPage;
