import type { CheckoutShipping } from "./checkout";

export type OrderStatus =
    | "pending_payment"
    | "paid"
    | "cancelled"
    | "failed";

export type OrderItem = {
    productId: string;
    slug: string;
    title: string;
    image: string;
    price: number;
    qty: number;
    lineTotal: number;
};

export type OrderPayment = {
    brand: string;
    last4: string;
};

export type Order = {
    id: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    currency: "GEL";
    shipping: CheckoutShipping;
    payment: OrderPayment;
    createdAt: string;
    paidAt?: string;
};

export type OrdersResponse = {
    items: Order[];
};

export type OrderResponse = {
    order: Order;
};