import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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

import "../styles/catalog.css";

const PAGE_SIZE = 12;

export default function CatalogPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { totalItems } = useCart();
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
                    setError("კატეგორიების ჩატვირთვა ვერ მოხერხდა.");
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
                    setError(
                        "პროდუქტების ჩატვირთვა ვერ მოხერხდა. გთხოვ, სცადე თავიდან.",
                    );
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
                <span className="auth-eyebrow">BOOKS STORE</span>
                <h1>წიგნების სამყარო</h1>
                <p>გამარჯობა, {user?.name || user?.email || "მკითხველო"}!
                    აღმოაჩინე საინტერესო წიგნები და შეარჩიე შენთვის სასურველი.
                </p>
                
                <div className="catalog-header-actions">
                    <Button variant="secondary" onClick={() => navigate("/cart")}>
                        კალათა ({totalItems})
                    </Button>

                    <Button onClick={logout}>გამოსვლა</Button>
                </div>
            </header>
            
            <form onSubmit={handleSearch}>
                <div className="catalog-toolbar">
                    <div className="catalog-field">
                        <label htmlFor="catalog-search">წიგნის ძიება</label>
                        <input
                            id="catalog-search"
                            type="search"
                            placeholder="შეიყვანე წიგნის სათაური..."
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                        />
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-category">კატეგორია</label>
                        <select
                            id="catalog-category"
                            value={category}
                            onChange={(event) => {
                                setCategory(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">ყველა კატეგორია</option>
                            {categories.map((item) => (
                                <option key={item.id} value={item.slug}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-sort">დახარისხება</label>
                        <select
                            id="catalog-sort"
                            value={sort}
                            onChange={(event) => {
                                setSort(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="newest">უახლესი</option>
                            <option value="price-asc">ფასი: ზრდადობით</option>
                            <option value="price-desc">ფასი: კლებადობით</option>
                            <option value="rating-desc">რეიტინგი</option>
                            <option value="popular">პოპულარული</option>
                            <option value="title-asc">სათაური: A–Z</option>
                        </select>
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-min-price">მინ. ფასი (₾)</label>
                        <input
                            id="catalog-min-price"
                            type="number"
                            min="0"
                            placeholder="მაგ. 10"
                            value={minPrice}
                            onChange={(event) => {
                                setMinPrice(event.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-max-price">მაქს. ფასი (₾)</label>
                        <input
                            id="catalog-max-price"
                            type="number"
                            min="0"
                            placeholder="მაგ. 100"
                            value={maxPrice}
                            onChange={(event) => {
                                setMaxPrice(event.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    
                    <div className="catalog-field">
                        <label htmlFor="catalog-rating">მინ. რეიტინგი</label>
                        <select
                            id="catalog-rating"
                            value={minRating}
                            onChange={(event) => {
                                setMinRating(event.target.value);
                                setPage(1);
                            }}
                        >
                            <option value="">ყველა რეიტინგი</option>
                            <option value="3">3+ ვარსკვლავი</option>
                            <option value="4">4+ ვარსკვლავი</option>
                            <option value="4.5">4.5+ ვარსკვლავი</option>
                        </select>
                    </div>
                </div>
                
                <div className="catalog-actions">
                    <Button type="submit">ძიება</Button>
                    <Button type="button" onClick={resetFilters}>
                        ფილტრების გასუფთავება
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
                    მხოლოდ მარაგში არსებული
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
                    მხოლოდ ფასდაკლებული
                </label>
            </div>
            
            <p className="catalog-results">
                {isLoading
                    ? "პროდუქტები იტვირთება..."
                    : `ნაპოვნია ${total} პროდუქტი`}
            </p>
            
            {error && (
                <div className="catalog-message" role="alert">
                    <p>{error}</p>
                    <Button
                        onClick={() => {
                            setPage((current) => current);
                            setSort((current) => current);
                        }}
                    >გასაგებია</Button>
                </div>
            )}
            
            {isLoading && (
                <div className="catalog-message" role="status">
                    გთხოვ, დაელოდო პროდუქტების ჩატვირთვას...
                </div>
            )}

            {!isLoading && !error && products.length === 0 && (
                <div className="catalog-message">
                    <p>შერჩეული პირობებით პროდუქტები ვერ მოიძებნა.</p>
                    <Button onClick={resetFilters}>
                        ფილტრების გასუფთავება
                    </Button>
                </div>
            )}

            {!isLoading && !error && products.length > 0 && (
                <>
                    <section className="product-grid" aria-label="პროდუქტების კატალოგი">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onViewDetails={handleViewDetails}
                            />
                        ))}
                    </section>

                    <nav className="catalog-pagination" aria-label="გვერდების ნავიგაცია">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => current - 1)}
                        >
                            წინა
                        </button>

                        <span>გვერდი {page} / {totalPages}</span>

                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((current) => current + 1)}
                        >
                            შემდეგი
                        </button>
                    </nav>
                </>
            )}
        </main>
    );
}
