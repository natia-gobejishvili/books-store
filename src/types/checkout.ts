import type { Address } from "./address";
import type { CartItem } from "./cart";

export type CheckoutShipping = {
    fullName: string;
    phone: string;
    city: string;
    address: string;
};

export type CheckoutResponse = {
    items: CartItem[];
    totalQty: number;
    subtotal: number;
    shippingFee: number;
    total: number;
    currency: "GEL";
    freeShippingFrom: number;
    shipping: CheckoutShipping;
    addresses: Address[];
};

export type CardDetails = {
    number: string;
    holder: string;
    expiry: string;
    cvc: string;
};

export type CreateOrderRequest = {
    shipping: CheckoutShipping;
    card: CardDetails;
};

export type CreateOrderResponse = {
    orderId: string;
    status: "pending_payment";
    total: number;
    currency: "GEL";
    message: string;
    expiresInMinutes: number;
    devCode?: string;
};

export type ConfirmOrderRequest = {
    code: string;
};