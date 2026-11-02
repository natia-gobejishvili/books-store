export type Address = {
    id: string;
    label: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    isDefault: boolean;
    createdAt: string;
};

export type AddressRequest = {
    label: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    isDefault?: boolean;
};

export type AddressesResponse = {
    items: Address[];
};

export type AddressResponse = {
    address: Address;
};