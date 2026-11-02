import { apiRequest } from "./api";

import type {
    CheckoutResponse,
    CreateOrderRequest,
    CreateOrderResponse,
    ConfirmOrderRequest,
} from "../types/checkout";

export const checkoutService = {
    getCheckout() {
        return apiRequest<CheckoutResponse>("/checkout", {
            auth: true,
        });
    },

    createOrder(data: CreateOrderRequest) {
        return apiRequest<CreateOrderResponse>("/orders", {
            method: "POST",
            body: data,
            auth: true,
        });
    },

    confirmOrder(orderId: string, data: ConfirmOrderRequest) {
        return apiRequest<{ order: unknown }>(
            `/orders/${encodeURIComponent(orderId)}/confirm`,
            {
                method: "POST",
                body: data,
                auth: true,
            },
        );
    },

    resendCode(orderId: string) {
        return apiRequest<unknown>(
            `/orders/${encodeURIComponent(orderId)}/resend-code`,
            {
                method: "POST",
                auth: true,
            },
        );
    },
};