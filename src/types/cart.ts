export type CartProduct = {
    id: string;
    slug: string;
    title: string;
    brand: string;
    image: string;
    price: number;
    oldPrice: number | null;
    currency: string;
    stock: number;
    inStock: boolean;
};

export type CartItem = {
    id: string;
    productId: string;
    qty: number;
    lineTotal: number;
    product: CartProduct;
};

export type CartResponse = {
    items: CartItem[];
    totalQty: number;
    subtotal: number;
    currency: "GEL";
};

export type AddCartItemRequest = {
    productId: string;
    qty: number;
};

export type UpdateCartItemRequest = {
    qty: number;
};