import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { orderService } from "../services/orderService";
import type { Order } from "../types/order";
import Button from "../shared/ui/Button";

import "../styles/order-details.css";

function OrderDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const locale = i18n.language === "en" ? "en-US" : "ka-GE";

    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) {
                setError("orderDetails.missingId");
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
                        : "orderDetails.loadError"
                );
            } finally {
                setIsLoading(false);
            }
        };

        void fetchOrder();
    }, [id]);

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
            pending_payment: t("orderDetails.status.pending"),
            paid: t("orderDetails.status.paid"),
            cancelled: t("orderDetails.status.cancelled"),
            failed: t("orderDetails.status.failed"),
        };

        return statuses[status] ?? status;
    };

    if (isLoading) {
        return (
            <main className="order-details-page">
                <p className="order-details-message">
                    {t("orderDetails.loading")}
                </p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="order-details-page">
                <div className="order-details-error">
                    <h2>{t("orderDetails.notFoundTitle")}</h2>
                    <p>
                        {error
                            ? error.startsWith("orderDetails.")
                                ? t(error)
                                : error
                            : t("orderDetails.notFoundDescription")}
                    </p>

                    <Button onClick={() => navigate("/orders")}>
                        {t("orderDetails.backToOrders")}
                    </Button>
                </div>
            </main>
        );
    }

    return (
        <main className="order-details-page">
            <div className="order-details-heading">
                <div>
                    <h1>{t("orderDetails.title")}</h1>
                    <p>{t("orderDetails.orderNumber")}: #{order.id}</p>
                </div>

                <span className={`order-details-status status-${order.status}`}>
                    {getStatusLabel(order.status)}
                </span>
            </div>

            <section className="order-details-section">
                <h2>{t("orderDetails.orderedProducts")}</h2>

                <div className="order-products">
                    {order.items.map((item) => (
                        <article className="order-product" key={item.productId}>
                            <img src={item.image} alt={item.title}/>

                            <div className="order-product-info">
                                <h3>{item.title}</h3>
                                <p>{t("orderDetails.quantity")}: {item.qty}</p>
                                <p>{t("orderDetails.unitPrice")}: {formatPrice(item.price)}</p>
                            </div>

                            <strong>{formatPrice(item.lineTotal)}</strong>
                        </article>
                    ))}
                </div>
            </section>

            <div className="order-details-grid">
                <section className="order-details-section">
                    <h2>{t("orderDetails.shippingInformation")}</h2>

                    <div className="order-info-list">
                        <p>
                            <span>{t("orderDetails.recipient")}:</span>
                            {order.shipping.fullName}
                        </p>
                        <p>
                            <span>{t("orderDetails.phone")}:</span>
                            {order.shipping.phone}
                        </p>
                        <p>
                            <span>{t("orderDetails.city")}:</span>
                            {order.shipping.city}
                        </p>
                        <p>
                            <span>{t("orderDetails.address")}:</span>
                            {order.shipping.address}
                        </p>
                    </div>
                </section>

                <section className="order-details-section">
                    <h2>{t("orderDetails.orderInformation")}</h2>

                    <div className="order-info-list">
                        <p>
                            <span>{t("orderDetails.orderDate")}:</span>
                            {formatDate(order.createdAt)}
                        </p>

                        {order.paidAt && (
                            <p>
                                <span>{t("orderDetails.paymentDate")}:</span>
                                {formatDate(order.paidAt)}
                            </p>
                        )}

                        {order.payment && (
                            <p>
                                <span>{t("orderDetails.paymentCard")}:</span>
                                {order.payment.brand.toUpperCase()} **** {order.payment.last4}
                            </p>
                        )}
                    </div>
                </section>
            </div>

            <section className="order-details-section order-summary">
                <h2>{t("orderDetails.paymentSummary")}</h2>

                <div className="summary-row">
                    <span>{t("orderDetails.subtotal")}</span>
                    <span>{formatPrice(order.subtotal)}</span>
                </div>

                <div className="summary-row">
                    <span>{t("orderDetails.shippingFee")}</span>
                    <span>{formatPrice(order.shippingFee)}</span>
                </div>

                <div className="summary-row summary-total">
                    <span>{t("orderDetails.total")}</span>
                    <strong>{formatPrice(order.total)}</strong>
                </div>
            </section>

            <div className="order-details-actions">
                <Button onClick={() => navigate("/orders")}>
                    {t("orderDetails.backToOrders")}
                </Button>

                <Button onClick={() => navigate("/catalog")}>
                    {t("orderDetails.backToCatalog")}
                </Button>
            </div>
        </main>
    );
}

export default OrderDetailsPage;
