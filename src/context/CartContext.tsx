import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type { Product } from "../types/product";

export type CartItem = {
    product: Product;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
};

const CART_STORAGE_KEY = "books-store-cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

function getInitialCart(): CartItem[] {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);

        if (!savedCart) {
            return [];
        }

        const parsed: unknown = JSON.parse(savedCart);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed as CartItem[];
    } catch {
        return [];
    }
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(getInitialCart);
    
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    function addToCart(product: Product) {
        if (!product.inStock) {
            return;
        }

        setItems((currentItems) => {
            const existingItem = currentItems.find(
                (item) => item.product.id === product.id,
            );
            
            if (existingItem) {
                return currentItems.map((item) =>
                    item.product.id === product.id
                        ? {
                            ...item,
                            quantity: Math.min(item.quantity + 1, product.stock),
                        }
                        : item,
                );
            }

            return [...currentItems, { product, quantity: 1 }];
        });
    }

  function removeFromCart(productId: string) {
        setItems((currentItems) =>
            currentItems.filter((item) => item.product.id !== productId),
        );
    }

    function increaseQuantity(productId: string) {
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.product.id === productId
                ? {
                    ...item,
                    quantity: Math.min(
                        item.quantity + 1,
                        item.product.stock,
                    ),
                    }
                : item,
            ),
        );
    }

    function decreaseQuantity(productId: string) {
        setItems((currentItems) =>
            currentItems
                .map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item,
                )
                .filter((item) => item.quantity > 0),
        );
    } 

    function clearCart() {
        setItems([]);
    }

    const totalItems = items.reduce(
        (sum, item) => sum + item.quantity,
        0,
    );

    const totalPrice = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0,
    );

    const value = useMemo(
        () => ({
            items,
            totalItems,
            totalPrice,
            addToCart,
            removeFromCart,
            increaseQuantity,
            decreaseQuantity,
            clearCart,
        }),
        [items, totalItems, totalPrice],
    );

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCart უნდა გამოიყენო CartProvider-ის შიგნით.");
    }

    return context;
}
