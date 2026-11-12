import { apiRequest } from "./api";
import type { AddCartItemRequest, CartResponse, UpdateCartItemRequest, } from "../types/cart";

export const cartService = {
    getCart() {
        return apiRequest<CartResponse>("/cart", {
            auth: true,
        });
    },

    addItem(data: AddCartItemRequest) {
        return apiRequest<CartResponse>("/cart/items", {
            method: "POST",
            body: data,
            auth: true,
        });
    },

    updateItem(id: string, data: UpdateCartItemRequest) {
        return apiRequest<CartResponse>(
            `/cart/items/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                body: data,
                auth: true,
            },
        );
    },

    removeItem(id: string) {
        return apiRequest<CartResponse>(
            `/cart/items/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                auth: true,
            },
        );
    },

    clearCart() {
        return apiRequest<CartResponse>("/cart", {
            method: "DELETE",
            auth: true,
        });
    },
};