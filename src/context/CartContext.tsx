import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { cartService } from "../services/cartService";
import type { CartItem, CartResponse } from "../types/cart";
import type { Product } from "../types/product";

type CartContextType = {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    isLoading: boolean;
    error: string | null;
    addToCart: (product: Product) => Promise<void>;
    removeFromCart: (cartItemId: string) => Promise<void>;
    increaseQuantity: (cartItemId: string) => Promise<void>;
    decreaseQuantity: (cartItemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const EMPTY_CART: CartResponse = {
    items: [],
    totalQty: 0,
    subtotal: 0,
    currency: "GEL",
};

export function CartProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [cart, setCart] = useState<CartResponse>(EMPTY_CART);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refreshCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(EMPTY_CART);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await cartService.getCart();
            setCart(response);
        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : "კალათის ჩატვირთვა ვერ მოხერხდა.",
            );
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (isAuthLoading) {
            return;
        }

        if (!isAuthenticated) {
            setCart(EMPTY_CART);
            setError(null);
            setIsLoading(false);
            return;
        }

        let active = true;

        async function loadCart() {
            setIsLoading(true);
            setError(null);

            try {
                const response = await cartService.getCart();

                if (active) {
                    setCart(response);
                }
            } catch (err) {
                if (active) {
                    setError(
                        err instanceof Error
                        ? err.message
                        : "კალათის ჩატვირთვა ვერ მოხერხდა.",
                    );
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        void loadCart();

        return () => {
            active = false;
        };
    }, [isAuthenticated, isAuthLoading]);

    const addToCart = useCallback(
        async (product: Product) => {
            if (!product.inStock) {
                return;
            }

            setError(null);

            try {
                const response = await cartService.addItem({
                    productId: product.id,
                    qty: 1,
                });

                setCart(response);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "პროდუქტის კალათაში დამატება ვერ მოხერხდა.";

                setError(message);
                throw err;
            }
        },
        [],
    );

    const removeFromCart = useCallback(async (cartItemId: string) => {
        setError(null);

        try {
            const response = await cartService.removeItem(cartItemId);
            setCart(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "პროდუქტის წაშლა ვერ მოხერხდა.",
            );
            throw err;
        }
    }, []);

    const increaseQuantity = useCallback(
        async (cartItemId: string) => {
            const item = cart.items.find((entry) => entry.id === cartItemId);

            if (!item || item.qty >= item.product.stock) {
                return;
            }

            setError(null);

            try {
                const response = await cartService.updateItem(cartItemId, {
                    qty: item.qty + 1,
                });

                setCart(response);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "რაოდენობის გაზრდა ვერ მოხერხდა.",
                );
                throw err;
            }
        },
        [cart.items],
    );

    const decreaseQuantity = useCallback(
        async (cartItemId: string) => {
            const item = cart.items.find((entry) => entry.id === cartItemId);

            if (!item) {
                return;
            }

            if (item.qty <= 1) {
                await removeFromCart(cartItemId);
                return;
            }

            setError(null);

            try {
                const response = await cartService.updateItem(cartItemId, {
                    qty: item.qty - 1,
                });

                setCart(response);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "რაოდენობის შემცირება ვერ მოხერხდა.",
                );
                throw err;
            }
        },
        [cart.items, removeFromCart],
    );

    const clearCart = useCallback(async () => {
        setError(null);

        try {
            const response = await cartService.clearCart();
            setCart(response);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "კალათის გასუფთავება ვერ მოხერხდა.",
            );
            throw err;
        }
    }, []);

    const value = useMemo(
        () => ({
            items: cart.items,
            totalItems: cart.totalQty,
            totalPrice: cart.subtotal,
            isLoading,
            error,
            addToCart,
            removeFromCart,
            increaseQuantity,
            decreaseQuantity,
            clearCart,
            refreshCart,
        }),
        [
            cart,
            isLoading,
            error,
            addToCart,
            removeFromCart,
            increaseQuantity,
            decreaseQuantity,
            clearCart,
            refreshCart,
        ],
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