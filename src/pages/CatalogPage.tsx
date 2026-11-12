import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { catalogService } from "../services/catalogService";

import type {
    Product,
    ProductCategory,
    ProductQuery,
} from "../types/product";

import ProductCard from "../components/ProductCard";
import Button from "../shared/ui/Button";
import CustomSelect from "../components/CustomSelect";

import "../styles/catalog.css";

const PAGE_SIZE = 12;

export default function CatalogPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { totalItems } = useCart();
    const { t, i18n } = useTranslation();

    const isEnglish = i18n.resolvedLanguage === "en";

    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [category, setCategory] = useState("books");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");

    const [inStock, setInStock] = useState(false);
    const [onSale, setOnSale] = useState(false);

    const [sort, setSort] = useState("newest");
    const [page, setPage] = useState(1);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        catalogService
            .getCategories()
            .then((response) => {
                if (!cancelled) {
                    setCategories(response.items);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setError("catalog.loadCategoriesError");
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            setIsLoading(true);
            setError("");

            const filters: ProductQuery = {
                category,
                q: search || undefined,
                minPrice: minPrice !== "" ? Number(minPrice) : undefined,
                maxPrice: maxPrice !== "" ? Number(maxPrice) : undefined,
                minRating: minRating !== "" ? Number(minRating) : undefined,
                inStock: inStock || undefined,
                onSale: onSale || undefined,
                sort,
                page,
                limit: PAGE_SIZE,
            };

            try {
                const response = await catalogService.getProducts(filters);

                if (!cancelled) {
                    setProducts(response.items);
                    setTotal(response.total);
                    setTotalPages(Math.max(1, response.totalPages));
                }
            } catch {
                if (!cancelled) {
                    setProducts([]);
                    setTotal(0);
                    setTotalPages(1);
                    setError("catalog.loadProductsError");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        void loadProducts();

        return () => {
            cancelled = true;
        };
    }, [
        category,
        search,
        minPrice,
        maxPrice,
        minRating,
        inStock,
        onSale,
        sort,
        page,
    ]);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function resetFilters() {
        setCategory("books");
        setSearchInput("");
        setSearch("");
        setMinPrice("");
        setMaxPrice("");
        setMinRating("");
        setInStock(false);
        setOnSale(false);
        setSort("newest");
        setPage(1);
    }

    function handleViewDetails(slug: string) {
        navigate(`/products/${encodeURIComponent(slug)}`);
    }

    return (
        <main className="catalog-page">
            <header className="catalog-header">
                <h1>{t("catalog.title")}</h1>

                <p>
                    {t("catalog.greeting", {
                        name: user?.name || user?.email || t("catalog.reader"),
                    })}
                </p>

                <div className="catalog-header-actions">
                    <Button
                        variant="secondary"
                        onClick={() => navigate("/cart")}
                    >
                        {t("catalog.cart")} ({totalItems})
                    </Button>

                    <Button onClick={logout}>
                        {t("catalog.logout")}
                    </Button>
                </div>
            </header>

            <form onSubmit={handleSearch}>
                <div className="catalog-toolbar">
                    <div className="catalog-field">
                        <label htmlFor="catalog-search">
                            {t("catalog.searchLabel")}
                        </label>

                        <input
                            id="catalog-search"
                            type="search"
                            placeholder={t("catalog.searchPlaceholder")}
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                        />
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-category">
                            {t("catalog.category")}
                        </label>

                        <CustomSelect
                            id="catalog-category"
                            value={category}
                            onChange={(value) => {
                                setCategory(value);
                                setPage(1);
                            }}
                            options={[
                                {
                                    value: "",
                                    label: t("catalog.allCategories"),
                                },
                                ...categories.map((item) => ({
                                    value: item.slug,
                                    label: isEnglish
                                        ? item.nameEn || item.name
                                        : item.name,
                                })),
                            ]}
                        />
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-sort">
                            {t("catalog.sort")}
                        </label>

                        <CustomSelect
                            id="catalog-sort"
                            value={sort}
                            onChange={(value) => {
                                setSort(value);
                                setPage(1);
                            }}
                            options={[
                                {
                                    value: "newest",
                                    label: t("catalog.newest"),
                                },
                                {
                                    value: "price-asc",
                                    label: t("catalog.priceAsc"),
                                },
                                {
                                    value: "price-desc",
                                    label: t("catalog.priceDesc"),
                                },
                                {
                                    value: "rating-desc",
                                    label: t("catalog.rating"),
                                },
                                {
                                    value: "popular",
                                    label: t("catalog.popular"),
                                },
                                {
                                    value: "title-asc",
                                    label: t("catalog.titleAsc"),
                                },
                            ]}
                        />
                    </div>


                    <div className="catalog-field">
                        <label htmlFor="catalog-min-price">
                            {t("catalog.minPrice")}
                        </label>

                        <input
                            id="catalog-min-price"
                            type="number"
                            min="0"
                            placeholder={t("catalog.priceExample")}
                            value={minPrice}
                            onChange={(event) => {
                                setMinPrice(event.target.value);
                                setPage(1);
                            }}
                        />
                    </div>

                    <div className="catalog-field">
                        <label htmlFor="catalog-max-price">
                            {t("catalog.maxPrice")}
                        </label>

                        <input
                            id="catalog-max-price"
                            type="number"
                            min="0"
                            placeholder={t("catalog.priceExample")}
                            value={maxPrice}
                            onChange={(event) => {
                                setMaxPrice(event.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-rating">
                            {t("catalog.minRating")}
                        </label>

                        <CustomSelect
                            id="catalog-rating"
                            value={minRating}
                            onChange={(value) => {
                                setMinRating(value);
                                setPage(1);
                            }}
                            options={[
                                {
                                    value: "",
                                    label: t("catalog.allRatings"),
                                },
                                {
                                    value: "3",
                                    label: t("catalog.stars3"),
                                },
                                {
                                    value: "4",
                                    label: t("catalog.stars4"),
                                },
                                {
                                    value: "4.5",
                                    label: t("catalog.stars45"),
                                },
                            ]}
                        />
                    </div>
                </div>

                <div className="catalog-actions">
                    <Button type="submit">
                        {t("catalog.search")}
                    </Button>

                    <Button type="button" onClick={resetFilters}>
                        {t("catalog.clearFilters")}
                    </Button>
                </div>
            </form>

            <div className="catalog-checks">
                <label>
                    <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(event) => {
                            setInStock(event.target.checked);
                            setPage(1);
                        }}
                    />

                    {t("catalog.inStock")}
                </label>

                <label>
                    <input
                        type="checkbox"
                        checked={onSale}
                        onChange={(event) => {
                            setOnSale(event.target.checked);
                            setPage(1);
                        }}
                    />

                    {t("catalog.onSale")}
                </label>
            </div>

            <p className="catalog-results">
                {isLoading
                    ? t("catalog.loading")
                    : t("catalog.results", { count: total })}
            </p>

            {error && (
                <div className="catalog-message" role="alert">
                    <p>{t(error)}</p>

                    <Button
                        onClick={() => setError("")}
                    >
                        {t("catalog.errorDismiss")}
                    </Button>
                </div>
            )}

            {isLoading && (
                <div className="catalog-message" role="status">
                    {t("catalog.loadingPleaseWait")}
                </div>
            )}

            {!isLoading && !error && products.length === 0 && (
                <div className="catalog-message">
                    <p>{t("catalog.empty")}</p>

                    <Button onClick={resetFilters}>
                        {t("catalog.clearFilters")}
                    </Button>
                </div>
            )}

            {!isLoading && !error && products.length > 0 && (
                <>
                    <section
                        className="product-grid"
                        aria-label={t("catalog.productCatalog")}
                    >
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </section>

                    <nav
                        className="catalog-pagination"
                        aria-label={t("catalog.productCatalog")}
                    >
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() =>
                                setPage((current) => current - 1)
                            }
                        >
                            {t("catalog.previous")}
                        </button>

                        <span>
                            {t("catalog.page", {
                                current: page,
                                total: totalPages,
                            })}
                        </span>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() =>
                                setPage((current) => current + 1)
                            }
                        >
                            {t("catalog.next")}
                        </button>
                    </nav>
                </>
            )}
        </main>
    );
}