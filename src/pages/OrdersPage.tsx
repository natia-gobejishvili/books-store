import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { orderService } from "../services/orderService";
import type { Order } from "../types/order";
import Button from "../shared/ui/Button";

import "../styles/orders.css";

function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                setError("");

                const response = await orderService.getOrders();
                setOrders(response.items);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "შეკვეთების ჩატვირთვა ვერ მოხერხდა."
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchOrders();
    }, []);

    const formatPrice = (price: number) =>
        `${price.toFixed(2)} ₾`;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("ka-GE", {
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
            <div className="orders-page">
                <p className="orders-message">
                    შეკვეთები იტვირთება...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-page">
                <p className="orders-error">{error}</p>
                <Button onClick={() => window.location.reload()}>
                    თავიდან ცდა
                </Button>
            </div>
        );
    }

    return (
        <main className="orders-page">
            <div className="orders-header">
                <div>
                    <h1>ჩემი შეკვეთები</h1>
                    <p>შენი შეკვეთების ისტორია</p>
                </div>

                <Button onClick={() => navigate("/catalog")}>
                    კატალოგში დაბრუნება
                </Button>
            </div>

            {orders.length === 0 ? (
                <section className="orders-empty">
                    <h2>შეკვეთები ჯერ არ გაქვს</h2>
                    <p>
                        როდესაც პირველ შეკვეთას გააფორმებ,
                        ის აქ გამოჩნდება.
                    </p>

                    <Button onClick={() => navigate("/catalog")}>
                        წიგნების დათვალიერება
                    </Button>
                </section>
            ) : (
                <section className="orders-list">
                    {orders.map((order) => (
                        <article
                            className="order-card"
                            key={order.id}
                        >
                            <div className="order-card-header">
                                <div>
                                    <span className="order-label">
                                        შეკვეთის ნომერი
                                    </span>
                                    <h2>#{order.id}</h2>
                                </div>

                                <span
                                    className={`order-status status-${order.status}`}
                                >
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>

                            <div className="order-card-info">
                                <div>
                                    <span className="order-label">
                                        შეკვეთის თარიღი
                                    </span>
                                    <p>{formatDate(order.createdAt)}</p>
                                </div>

                                <div>
                                    <span className="order-label">
                                        პროდუქტები
                                    </span>
                                    <p>
                                        {order.items.reduce(
                                            (total, item) =>
                                                total + item.qty,
                                            0
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <span className="order-label">
                                        ჯამური ღირებულება
                                    </span>
                                    <p className="order-total">
                                        {formatPrice(order.total)}
                                    </p>
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <span>
                                    {order.items.length} დასახელების პროდუქტი
                                </span>

                                <Button
                                    onClick={() =>
                                        navigate(`/orders/${order.id}`)
                                    }
                                >
                                    დეტალების ნახვა
                                </Button>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
}

export default OrdersPage;
