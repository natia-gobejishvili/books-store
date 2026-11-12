import {
    useEffect,
    useState,
    type ChangeEvent,
    type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { checkoutService } from "../services/checkoutService";
import type {
    CardDetails,
    CheckoutResponse,
    CheckoutShipping,
    CreateOrderResponse,
} from "../types/checkout";

import Button from "../shared/ui/Button";
import "../styles/checkout.css";

const INITIAL_SHIPPING: CheckoutShipping = {
    fullName: "",
    phone: "",
    city: "",
    address: "",
};

const INITIAL_CARD: CardDetails = {
    number: "",
    holder: "",
    expiry: "",
    cvc: "",
};

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const locale = i18n.language.startsWith("en") ? "en-US" : "ka-GE";

    const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
    const [shipping, setShipping] =
        useState<CheckoutShipping>(INITIAL_SHIPPING);
    const [card, setCard] = useState<CardDetails>(INITIAL_CARD);

    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [order, setOrder] = useState<CreateOrderResponse | null>(null);
    const [confirmationCode, setConfirmationCode] = useState("");

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        async function loadCheckout() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await checkoutService.getCheckout();

                if (!active) return;

                setCheckout(response);
                setShipping(response.shipping);

                const defaultAddress = response.addresses.find(
                    (address) => address.isDefault,
                );

                if (defaultAddress) {
                    setSelectedAddressId(defaultAddress.id);
                    setShipping({
                        fullName: defaultAddress.fullName,
                        phone: defaultAddress.phone,
                        city: defaultAddress.city,
                        address: defaultAddress.address,
                    });
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : t("checkout.loadError"),
                    );
                }
            } finally {
                if (active) setIsLoading(false);
            }
        }

        void loadCheckout();

        return () => {
            active = false;
        };
    }, []);

    const formatPrice = (price: number) =>
        `${price.toLocaleString(locale)} ₾`;

    function handleShippingChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const { name, value } = event.target;

        setShipping((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleCardChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const { name, value } = event.target;

        if (name === "number") {
            const digits = value.replace(/\D/g, "").slice(0, 16);
            const formatted = digits.replace(/(.{4})/g, "$1 ").trim();

            setCard((current) => ({
                ...current,
                number: formatted,
            }));

            return;
        }

        if (name === "expiry") {
            const digits = value.replace(/\D/g, "").slice(0, 4);
            const formatted =
                digits.length > 2
                    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                    : digits;

            setCard((current) => ({
                ...current,
                expiry: formatted,
            }));

            return;
        }

        if (name === "cvc") {
            setCard((current) => ({
                ...current,
                cvc: value.replace(/\D/g, "").slice(0, 4),
            }));

            return;
        }

        setCard((current) => ({
            ...current,
            [name]: value,
        }));
    }

    function handleAddressSelect(id: string) {
        setSelectedAddressId(id);

        const selectedAddress = checkout?.addresses.find(
            (address) => address.id === id,
        );

        if (!selectedAddress) return;

        setShipping({
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            city: selectedAddress.city,
            address: selectedAddress.address,
        });
    }

    async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError(null);
        setSuccess(null);

        if (!checkout || checkout.items.length === 0) {
            setError(t("checkout.emptyCart"));
            return;
        }

        if (
            !shipping.fullName.trim() ||
            !shipping.phone.trim() ||
            !shipping.city.trim() ||
            !shipping.address.trim()
        ) {
            setError(t("checkout.shippingRequired"));
            return;
        }

        const cardNumber = card.number.replace(/\s/g, "");

        if (cardNumber.length !== 16) {
            setError(t("checkout.invalidCardNumber"));
            return;
        }

        if (!card.holder.trim()) {
            setError(t("checkout.cardHolderRequired"));
            return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
            setError(t("checkout.invalidExpiry"));
            return;
        }

        const [monthText, yearText] = card.expiry.split("/");
        const month = Number(monthText);
        const year = 2000 + Number(yearText);
        const now = new Date();
        const currentMonth = now.getFullYear() * 12 + now.getMonth();
        const expiryMonth = year * 12 + month - 1;

        if (expiryMonth < currentMonth) {
            setError(t("checkout.expiredCard"));
            return;
        }

        if (!/^\d{3,4}$/.test(card.cvc)) {
            setError(t("checkout.invalidCvc"));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await checkoutService.createOrder({
                shipping: {
                    fullName: shipping.fullName.trim(),
                    phone: shipping.phone.trim(),
                    city: shipping.city.trim(),
                    address: shipping.address.trim(),
                },
                card: {
                    number: cardNumber,
                    holder: card.holder.trim(),
                    expiry: card.expiry,
                    cvc: card.cvc,
                },
            });

            setOrder(response);
            setSuccess(t("checkout.orderCreated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t("checkout.createOrderError"),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleConfirmOrder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!order) return;

        if (!/^\d{6}$/.test(confirmationCode)) {
            setError(t("checkout.invalidConfirmationCode"));
            return;
        }

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await checkoutService.confirmOrder(order.orderId, {
                code: confirmationCode,
            });

            setSuccess(t("checkout.paymentConfirmed"));
            setOrder(null);
            setConfirmationCode("");
            setCheckout(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t("checkout.confirmPaymentError"),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendCode() {
        if (!order) return;

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await checkoutService.resendCode(order.orderId);
            setSuccess(t("checkout.codeResent"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t("checkout.resendCodeError"),
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <main className="checkout-page">
                <div className="checkout-container">
                    <p className="checkout-loading">
                        {t("checkout.loading")}
                    </p>
                </div>
            </main>
        );
    }

    if (success && !order && !checkout) {
        return (
            <main className="checkout-page">
                <section className="checkout-success-page">
                    <div className="checkout-success-icon">✓</div>
                    <h1>{t("checkout.successTitle")}</h1>
                    <p>{success}</p>

                    <Button onClick={() => navigate("/catalog")}>
                        {t("checkout.backToCatalog")}
                    </Button>
                </section>
            </main>
        );
    }

    if (!checkout) {
        return (
            <main className="checkout-page">
                <div className="checkout-container">
                    <div className="checkout-alert checkout-alert-error">
                        {error || t("checkout.loadError")}
                    </div>

                    <Button onClick={() => navigate("/cart")}>
                        {t("checkout.backToCart")}
                    </Button>
                </div>
            </main>
        );
    }

    if (checkout.items.length === 0 && !order) {
        return (
            <main className="checkout-page">
                <section className="checkout-success-page">
                    <h1>{t("checkout.emptyCartTitle")}</h1>
                    <p>{t("checkout.emptyCartDescription")}</p>
                    <Button onClick={() => navigate("/catalog")}>
                        {t("checkout.backToCatalog")}
                    </Button>
                </section>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">
                <header className="checkout-header">
                    <div>
                        <h1>{t("checkout.title")}</h1>
                        <p>{t("checkout.subtitle")}</p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => navigate("/cart")}
                    >
                        ← {t("checkout.backToCart")}
                    </Button>
                </header>

                {error && (
                    <div className="checkout-alert checkout-alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="checkout-alert checkout-alert-success">
                        {success}
                    </div>
                )}

                {order ? (
                    <section className="confirmation-card">
                        <div className="confirmation-icon">✉</div>
                        <h2>{t("checkout.confirmationTitle")}</h2>

                        <p>{t("checkout.confirmationDescription")}</p>

                        <div className="confirmation-order-info">
                            <span>{t("checkout.orderNumber")}</span>
                            <strong>{order.orderId}</strong>

                            <span>{t("checkout.amountDue")}</span>
                            <strong>{formatPrice(order.total)}</strong>

                            <span>{t("checkout.codeExpiry")}</span>
                            <strong>
                                {t("checkout.minutes", {
                                    count: order.expiresInMinutes,
                                })}
                            </strong>
                        </div>

                        {order.devCode && (
                            <div className="dev-code-notice">
                                {t("checkout.testCode")}:{" "}
                                <strong>{order.devCode}</strong>
                            </div>
                        )}

                        <form
                            className="confirmation-form"
                            onSubmit={handleConfirmOrder}
                        >
                            <label>
                                {t("checkout.confirmationCodeLabel")}
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={confirmationCode}
                                    onChange={(event) =>
                                        setConfirmationCode(
                                            event.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 6),
                                        )
                                    }
                                    placeholder="000000"
                                    required
                                />
                            </label>

                            <button
                                type="submit"
                                className="checkout-submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? t("checkout.checking")
                                    : t("checkout.confirmPayment")}
                            </button>

                            <button
                                type="button"
                                className="resend-code-button"
                                onClick={() => void handleResendCode()}
                                disabled={isSubmitting}
                            >
                                {t("checkout.resendCode")}
                            </button>
                        </form>
                    </section>
                ) : (
                    <div className="checkout-layout">
                        <form
                            className="checkout-form"
                            onSubmit={handleCreateOrder}
                        >
                            <section className="checkout-section">
                                <h2>{t("checkout.shippingTitle")}</h2>

                                {checkout.addresses.length > 0 && (
                                    <label className="checkout-field">
                                        <span>
                                            {t("checkout.savedAddress")}
                                        </span>
                                        <select
                                            value={selectedAddressId}
                                            onChange={(event) =>
                                                handleAddressSelect(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                {t("checkout.chooseAddress")}
                                            </option>

                                            {checkout.addresses.map(
                                                (address) => (
                                                    <option
                                                        key={address.id}
                                                        value={address.id}
                                                    >
                                                        {address.label}
                                                        {address.isDefault
                                                            ? ` (${t("checkout.defaultAddress")})`
                                                            : ""}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>
                                )}

                                <div className="checkout-fields-grid">
                                    <label className="checkout-field">
                                        <span>
                                            {t("checkout.fullName")} *
                                        </span>
                                        <input
                                            name="fullName"
                                            value={shipping.fullName}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>{t("checkout.phone")} *</span>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={shipping.phone}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>{t("checkout.city")} *</span>
                                        <input
                                            name="city"
                                            value={shipping.city}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>
                                            {t("checkout.address")} *
                                        </span>
                                        <input
                                            name="address"
                                            value={shipping.address}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>
                                </div>

                                <p className="checkout-address-hint">
                                    {t("checkout.addressHint")}{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/addresses")}
                                    >
                                        {t("checkout.addressesPage")}
                                    </button>
                                    .
                                </p>
                            </section>

                            <section className="checkout-section">
                                <h2>{t("checkout.cardTitle")}</h2>

                                <div className="checkout-fields-grid">
                                    <label className="checkout-field checkout-field-full">
                                        <span>
                                            {t("checkout.cardNumber")} *
                                        </span>
                                        <input
                                            name="number"
                                            value={card.number}
                                            onChange={handleCardChange}
                                            placeholder="4242 4242 4242 4242"
                                            inputMode="numeric"
                                            autoComplete="cc-number"
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field checkout-field-full">
                                        <span>
                                            {t("checkout.cardHolder")} *
                                        </span>
                                        <input
                                            name="holder"
                                            value={card.holder}
                                            onChange={handleCardChange}
                                            placeholder={t("checkout.cardHolderPlaceholder")}
                                            autoComplete="cc-name"
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>
                                            {t("checkout.expiry")} *
                                        </span>
                                        <input
                                            name="expiry"
                                            value={card.expiry}
                                            onChange={handleCardChange}
                                            placeholder="12/28"
                                            inputMode="numeric"
                                            autoComplete="cc-exp"
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>{t("checkout.cvc")} *</span>
                                        <input
                                            name="cvc"
                                            type="password"
                                            value={card.cvc}
                                            onChange={handleCardChange}
                                            placeholder="123"
                                            inputMode="numeric"
                                            autoComplete="cc-csc"
                                            required
                                        />
                                    </label>
                                </div>

                                <p className="checkout-test-hint">
                                    {t("checkout.testCardHint")}
                                </p>
                            </section>

                            <button
                                type="submit"
                                className="checkout-submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? t("checkout.processing")
                                    : t("checkout.createOrder")}
                            </button>
                        </form>

                        <aside className="checkout-summary">
                            <h2>{t("checkout.summaryTitle")}</h2>

                            <div className="checkout-summary-items">
                                {checkout.items.map((item) => (
                                    <div
                                        className="checkout-summary-item"
                                        key={item.id}
                                    >
                                        <div>
                                            <strong>
                                                {item.product.title}
                                            </strong>
                                            <span>
                                                {item.qty} x{" "}
                                                {formatPrice(item.product.price)}
                                            </span>
                                        </div>

                                        <strong>
                                            {formatPrice(item.lineTotal)}
                                        </strong>
                                    </div>
                                ))}
                            </div>

                            <div className="checkout-summary-row">
                                <span>
                                    {t("checkout.subtotal")}
                                </span>
                                <strong>
                                    {formatPrice(checkout.subtotal)}
                                </strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>{t("checkout.shippingFee")}</span>
                                <strong>
                                    {checkout.shippingFee === 0
                                        ? t("checkout.free")
                                        : formatPrice(checkout.shippingFee)}
                                </strong>
                            </div>

                            <div className="checkout-summary-row checkout-summary-total">
                                <span>{t("checkout.totalDue")}</span>
                                <strong>{formatPrice(checkout.total)}</strong>
                            </div>

                            <p className="checkout-free-shipping">
                                {t("checkout.freeShippingHint", {
                                    amount: checkout.freeShippingFrom,
                                })}
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}