import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

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
                            : "შეკვეთის მონაცემების ჩატვირთვა ვერ მოხერხდა.",
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
        `${price.toLocaleString("ka-GE")} ₾`;

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
            setError("კალათა ცარიელია.");
            return;
        }

        if (
            !shipping.fullName.trim() ||
            !shipping.phone.trim() ||
            !shipping.city.trim() ||
            !shipping.address.trim()
        ) {
            setError("გთხოვ, შეავსო მიწოდების ყველა ველი.");
            return;
        }

        const cardNumber = card.number.replace(/\s/g, "");

        if (cardNumber.length !== 16) {
            setError("ბარათის ნომერი უნდა შეიცავდეს 16 ციფრს.");
            return;
        }

        if (!card.holder.trim()) {
            setError("შეიყვანე ბარათის მფლობელის სახელი და გვარი.");
            return;
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
            setError("ბარათის ვადა შეიყვანე MM/YY ფორმატით.");
            return;
        }

        const [monthText, yearText] = card.expiry.split("/");
        const month = Number(monthText);
        const year = 2000 + Number(yearText);
        const now = new Date();
        const currentMonth = now.getFullYear() * 12 + now.getMonth();
        const expiryMonth = year * 12 + month - 1;

        if (expiryMonth < currentMonth) {
            setError("ბარათის ვადა გასულია.");
            return;
        }

        if (!/^\d{3,4}$/.test(card.cvc)) {
            setError("CVC უნდა შეიცავდეს 3 ან 4 ციფრს.");
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
            setSuccess(
                "შეკვეთა შეიქმნა. გადახდის დასასრულებლად შეიყვანე ელფოსტაზე მიღებული კოდი.",
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "შეკვეთის შექმნა ვერ მოხერხდა.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleConfirmOrder(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!order) return;

        if (!/^\d{6}$/.test(confirmationCode)) {
            setError("დადასტურების კოდი უნდა შეიცავდეს 6 ციფრს.");
            return;
        }

        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await checkoutService.confirmOrder(order.orderId, {
                code: confirmationCode,
            });

            setSuccess("გადახდა წარმატებით დადასტურდა! შეკვეთა მიღებულია.");
            setOrder(null);
            setConfirmationCode("");
            setCheckout(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "გადახდის დადასტურება ვერ მოხერხდა.",
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
            setSuccess("დადასტურების კოდი ხელახლა გაიგზავნა.");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "კოდის ხელახლა გაგზავნა ვერ მოხერხდა.",
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
                        შეკვეთის მონაცემები იტვირთება...
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
                    <h1>შეკვეთა წარმატებით გაფორმდა!</h1>
                    <p>{success}</p>

                    <Button onClick={() => navigate("/catalog")}>
                        კატალოგში დაბრუნება
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
                        {error || "შეკვეთის მონაცემების მიღება ვერ მოხერხდა."}
                    </div>

                    <Button onClick={() => navigate("/cart")}>
                        კალათაში დაბრუნება
                    </Button>
                </div>
            </main>
        );
    }

    if (checkout.items.length === 0 && !order) {
        return (
            <main className="checkout-page">
                <section className="checkout-success-page">
                    <h1>კალათა ცარიელია</h1>
                    <p>შეკვეთის გასაფორმებლად დაამატე პროდუქტები კალათაში.</p>
                    <Button onClick={() => navigate("/catalog")}>
                        კატალოგში დაბრუნება
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
                        <span className="auth-eyebrow">BOOKS STORE</span>
                        <h1>შეკვეთის გაფორმება</h1>
                        <p>შეავსე მონაცემები და დაასრულე შეკვეთა.</p>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => navigate("/cart")}
                    >
                        ← კალათაში დაბრუნება
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
                        <h2>გადახდის დადასტურება</h2>

                        <p>შეკვეთა შექმნილია. ელფოსტაზე გამოგზავნილი 6-ნიშნა კოდი შეიყვანე ქვემოთ.</p>

                        <div className="confirmation-order-info">
                            <span>შეკვეთის ნომერი</span>
                            <strong>{order.orderId}</strong>

                            <span>გადასახდელი თანხა</span>
                            <strong>{formatPrice(order.total)}</strong>

                            <span>კოდის მოქმედების დრო</span>
                            <strong>{order.expiresInMinutes} წუთი</strong>
                        </div>

                        {order.devCode && (
                            <div className="dev-code-notice">
                                სატესტო კოდი: <strong>{order.devCode}</strong>
                            </div>
                        )}

                        <form
                            className="confirmation-form"
                            onSubmit={handleConfirmOrder}
                        >
                            <label>
                                6-ნიშნა დამადასტურებელი კოდი
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
                                {isSubmitting ? "მოწმდება..." : "გადახდის დადასტურება"}
                            </button>

                            <button
                                type="button"
                                className="resend-code-button"
                                onClick={() => void handleResendCode()}
                                disabled={isSubmitting}
                            >
                                კოდის ხელახლა გაგზავნა
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
                                <h2>1. მიწოდების მისამართი</h2>

                                {checkout.addresses.length > 0 && (
                                    <label className="checkout-field">
                                        <span>შენახული მისამართის არჩევა</span>
                                        <select
                                            value={selectedAddressId}
                                            onChange={(event) =>
                                                handleAddressSelect(
                                                    event.target.value,
                                                )
                                            }
                                        >
                                            <option value="">
                                                აირჩიე მისამართი
                                            </option>

                                            {checkout.addresses.map(
                                                (address) => (
                                                    <option
                                                        key={address.id}
                                                        value={address.id}
                                                    >
                                                        {address.label}
                                                        {address.isDefault
                                                            ? " (ძირითადი)"
                                                            : ""}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </label>
                                )}

                                <div className="checkout-fields-grid">
                                    <label className="checkout-field">
                                        <span>სახელი და გვარი *</span>
                                        <input
                                            name="fullName"
                                            value={shipping.fullName}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>ტელეფონი *</span>
                                        <input
                                            name="phone"
                                            type="tel"
                                            value={shipping.phone}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>ქალაქი *</span>
                                        <input
                                            name="city"
                                            value={shipping.city}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>სრული მისამართი *</span>
                                        <input
                                            name="address"
                                            value={shipping.address}
                                            onChange={handleShippingChange}
                                            required
                                        />
                                    </label>
                                </div>

                                <p className="checkout-address-hint">
                                    მისამართის დამატება ან მართვა შეგიძლია{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/addresses")}
                                    >
                                        მისამართების გვერდიდან
                                    </button>
                                    .
                                </p>
                            </section>

                            <section className="checkout-section">
                                <h2>2. ბარათის მონაცემები</h2>

                                <div className="checkout-fields-grid">
                                    <label className="checkout-field checkout-field-full">
                                        <span>ბარათის ნომერი *</span>
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
                                        <span>ბარათის მფლობელი *</span>
                                        <input
                                            name="holder"
                                            value={card.holder}
                                            onChange={handleCardChange}
                                            placeholder="სახელი და გვარი"
                                            autoComplete="cc-name"
                                            required
                                        />
                                    </label>

                                    <label className="checkout-field">
                                        <span>ვადა (MM/YY) *</span>
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
                                        <span>CVC *</span>
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
                                    სატესტო ბარათი: 4242 4242 4242 4242. გამოიყენე მომავალი ვადა და ნებისმიერი ვალიდური CVC.
                                </p>
                            </section>

                            <button
                                type="submit"
                                className="checkout-submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "შეკვეთა მუშავდება..." : "შეკვეთის შექმნა"}
                            </button>
                        </form>

                        <aside className="checkout-summary">
                            <h2>შეკვეთის შეჯამება</h2>

                            <div className="checkout-summary-items">
                                {checkout.items.map((item) => (
                                    <div
                                        className="checkout-summary-item"
                                        key={item.id}
                                    >
                                        <div>
                                            <strong>{item.product.title}</strong>
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
                                <span>პროდუქტების ღირებულება</span>
                                <strong>
                                    {formatPrice(checkout.subtotal)}
                                </strong>
                            </div>

                            <div className="checkout-summary-row">
                                <span>მიწოდება</span>
                                <strong>
                                    {checkout.shippingFee === 0
                                        ? "უფასო"
                                        : formatPrice(checkout.shippingFee)}
                                </strong>
                            </div>

                            <div className="checkout-summary-row checkout-summary-total">
                                <span>სულ გადასახდელი</span>
                                <strong>{formatPrice(checkout.total)}</strong>
                            </div>

                            <p className="checkout-free-shipping">
                                {checkout.freeShippingFrom} ₾-დან მიწოდება
                                უფასოა.
                            </p>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    );
}