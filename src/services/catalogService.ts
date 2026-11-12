import { apiRequest } from "./api";
import type { CategoriesResponse, CategoryDetails, ProductDetails, ProductQuery, ProductsResponse, } from "../types/product";


export const catalogService = {
    getCategories() {
        return apiRequest<CategoriesResponse>("/categories");
    },
    
    getCategory(slug: string) {
        return apiRequest<CategoryDetails>(
            `/categories/${encodeURIComponent(slug)}`,
        );
    },
    
    getProducts(params: ProductQuery = {}) {
        const searchParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                searchParams.set(key, String(value));
            }
        });
        
        const query = searchParams.toString();
        const path = `/products${query ? `?${query}` : ""}`;
        
        return apiRequest<ProductsResponse>(path);
    },
    
    getProduct(slug: string) {
        return apiRequest<ProductDetails>(
            `/products/${encodeURIComponent(slug)}`,
        );
    },
};
