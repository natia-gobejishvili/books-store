import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { orderService } from "../services/orderService";
import type { Order } from "../types/order";
import Button from "../shared/ui/Button";

import "../styles/orders.css";

function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const locale = i18n.language === "en" ? "en-US" : "ka-GE";

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
                        : "orders.loadError"
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchOrders();
    }, []);

    const formatPrice = (price: number) =>
        `${price.toLocaleString(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} ₾`;

    const formatDate = (date: string) =>
        new Date(date).toLocaleString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getStatusLabel = (status: Order["status"]) => {
        const statuses: Record<Order["status"], string> = {
            pending_payment: t("orders.status.pending"),
            paid: t("orders.status.paid"),
            cancelled: t("orders.status.cancelled"),
            failed: t("orders.status.failed"),
        };

        return statuses[status] ?? status;
    };

    if (isLoading) {
        return (
            <div className="orders-page">
                <p className="orders-message">
                    {t("orders.loading")}
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-page">
                <p className="orders-error">
                    {error === "orders.loadError"
                        ? t("orders.loadError")
                        : error}
                </p>

                <Button onClick={() => window.location.reload()}>
                    {t("orders.retry")}
                </Button>
            </div>
        );
    }

    return (
        <main className="orders-page">
            <div className="orders-header">
                <div>
                    <h1>{t("orders.title")}</h1>
                    <p>{t("orders.subtitle")}</p>
                </div>

                <Button onClick={() => navigate("/catalog")}>
                    {t("orders.backToCatalog")}
                </Button>
            </div>

            {orders.length === 0 ? (
                <section className="orders-empty">
                    <h2>{t("orders.emptyTitle")}</h2>
                    <p>{t("orders.emptyDescription")}</p>

                    <Button onClick={() => navigate("/catalog")}>
                        {t("orders.browseBooks")}
                    </Button>
                </section>
            ) : (
                <section className="orders-list">
                    {orders.map((order) => (
                        <article className="order-card" key={order.id}>
                            <div className="order-card-header">
                                <div>
                                    <span className="order-label">
                                        {t("orders.orderNumber")}
                                    </span>
                                    <h2>#{order.id}</h2>
                                </div>

                                <span className={`order-status status-${order.status}`}>
                                    {getStatusLabel(order.status)}
                                </span>
                            </div>

                            <div className="order-card-info">
                                <div>
                                    <span className="order-label">
                                        {t("orders.orderDate")}
                                    </span>
                                    <p>{formatDate(order.createdAt)}</p>
                                </div>

                                <div>
                                    <span className="order-label">
                                        {t("orders.products")}
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
                                        {t("orders.total")}
                                    </span>
                                    <p className="order-total">
                                        {formatPrice(order.total)}
                                    </p>
                                </div>
                            </div>

                            <div className="order-card-footer">
                                <span>
                                    {t("orders.productTypes", {
                                        count: order.items.length,
                                    })}
                                </span>

                                <Button
                                    onClick={() =>
                                        navigate(`/orders/${order.id}`)
                                    }
                                >
                                    {t("orders.viewDetails")}
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
