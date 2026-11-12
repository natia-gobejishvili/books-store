import { apiRequest } from "./api";
import type {AddressRequest, AddressResponse, AddressesResponse, } from "../types/address";

export const addressService = {
    getAddresses() {
        return apiRequest<AddressesResponse>("/addresses", {
            auth: true,
        });
    },

    createAddress(data: AddressRequest) {
        return apiRequest<AddressResponse>("/addresses", {
            method: "POST",
            body: data,
            auth: true,
        });
    },

    updateAddress(id: string, data: Partial<AddressRequest>) {
        return apiRequest<AddressResponse>(
            `/addresses/${encodeURIComponent(id)}`,
            {
                method: "PATCH",
                body: data,
                auth: true,
            },
        );
    },

    deleteAddress(id: string) {
        return apiRequest<null>(
            `/addresses/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                auth: true,
            },
        );
    },
};