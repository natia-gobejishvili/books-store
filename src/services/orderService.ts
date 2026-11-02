import { apiRequest } from "./api";
import type {
    OrdersResponse,
    OrderResponse,
} from "../types/order";

export const orderService = {
    getOrders() {
        return apiRequest<OrdersResponse>("/orders", {
            auth: true,
        });
    },

    getOrder(id: string) {
        return apiRequest<OrderResponse>(
            `/orders/${encodeURIComponent(id)}`,
            {
                auth: true,
            },
        );
    },
};