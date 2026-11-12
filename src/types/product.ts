
export type ProductCategory = {
    id: string;
    slug: string;
    name: string;
    nameEn?: string;
    description: string;
    image: string;
    productsCount: number;
};

export type FilterOption = {
    value: string;
    label: string;
};

export type CategoryFilter = {
    key: string;
    label: string;
    type: "checkbox" | "radio" | "color" | "range";
    options?: FilterOption[];
    min?: number;
    max?: number;
    unit?: string;
};

export type CategoryDetails = ProductCategory & {
    filters: CategoryFilter[];
};

export type CategoriesResponse = {
    items: ProductCategory[];
};

export type Product = {
    id: string;
    slug: string;
    title: string;
    description: string;
    brand: string;
    price: number;
    oldPrice: number | null;
    discountPercent: number | null;
    currency: string;
    rating: number;
    reviewsCount: number;
    stock: number;
    inStock: boolean;
    warrantyMonths: number;
    image: string;
    images: string[];
    specs: Record<string, string>;
    category: {
        slug: string;
        name: string;
        nameEn?: string;
    };
    createdAt: string;
    attributes?: Record<string, unknown>;
};

export type ProductsResponse = {
    items: Product[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sort: string;
};

export type ProductDetails = Product & {
    attributes?: Record<string, unknown>;
    related?: Product[];
};


export type ProductQuery = {
    category?: string;
    brand?: string;
    q?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    onSale?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
    [key: string]: string | number | boolean | undefined;
};
