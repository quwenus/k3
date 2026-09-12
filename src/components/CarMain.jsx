import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IoChevronDown, IoClose, IoSearch } from 'react-icons/io5';
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

const skuCollator = new Intl.Collator('ru', {
    numeric: true,
    sensitivity: 'base'
});

const getSkuNumber = (sku) => {
    const digits = String(sku || "").match(/\d+/g)?.join("");

    return digits ? Number(digits) : null;
};

const normalizeSearchValue = (value) => String(value || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const getProductSearchValue = (product) => normalizeSearchValue([
    product?.sku,
    product?.title,
    product?.applicability_text,
    ...(Array.isArray(product?.oem_numbers) ? product.oem_numbers : [product?.oem_numbers]),
    ...(Array.isArray(product?.compatible_cars) ? product.compatible_cars : [])
].filter(Boolean).join(" "));

const CarMain = ({ categorySlug = "car" }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") || "");

    useEffect(() => {
        setSearchQuery(searchParams.get("q") || "");
    }, [searchParams]);

    useEffect(() => {
        // Запрос к API с использованием переданного slug
        fetch(`/api/products?category_slug=${categorySlug}`)
            .then(res => res.json())
            .then(response => {
                setProducts(response.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Ошибка загрузки:', err);
                setLoading(false);
            });
    }, [categorySlug]); // Перезапускаем при смене slug

    const filteredProducts = useMemo(() => {
        const searchWords = normalizeSearchValue(searchQuery).split(" ").filter(Boolean);

        if (searchWords.length === 0) {
            return products;
        }

        return products.filter((product) => {
            const productSearchValue = getProductSearchValue(product);

            return searchWords.every((word) => productSearchValue.includes(word));
        });
    }, [products, searchQuery]);

    const sortedProducts = useMemo(() => {
        const directionMultiplier = sortDirection === "desc" ? -1 : 1;

        return [...filteredProducts].sort((a, b) => {
            const aSku = String(a?.sku || a?.title || "");
            const bSku = String(b?.sku || b?.title || "");
            const aNumber = getSkuNumber(aSku);
            const bNumber = getSkuNumber(bSku);

            if (aNumber !== null && bNumber !== null && aNumber !== bNumber) {
                return (aNumber - bNumber) * directionMultiplier;
            }

            const skuDifference = skuCollator.compare(aSku, bSku);

            if (skuDifference !== 0) {
                return skuDifference * directionMultiplier;
            }

            return (Number(a?.id || 0) - Number(b?.id || 0)) * directionMultiplier;
        });
    }, [filteredProducts, sortDirection]);

    const updateSearchQuery = (value) => {
        setSearchQuery(value);

        const nextParams = new URLSearchParams(searchParams);
        const trimmedValue = value.trim();

        if (trimmedValue) {
            nextParams.set("q", trimmedValue);
        } else {
            nextParams.delete("q");
        }

        setSearchParams(nextParams, { replace: true });
    };

    if (loading) return <div className="text-center py-10">Загрузка товаров...</div>;

    return (
        <section className="py-8 relative">
            <div className="container mx-auto px-4">
                {products.length > 0 ? (
                    <>
                        <div className="mb-6 flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <label className="relative block w-full md:max-w-md">
                                <span className="sr-only">Поиск по каталогу</span>
                                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => updateSearchQuery(event.target.value)}
                                    placeholder="Поиск по артикулу, OEM, модели"
                                    className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        aria-label="Очистить поиск"
                                        onClick={() => updateSearchQuery("")}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <IoClose size={18} />
                                    </button>
                                )}
                            </label>
                            <label className="flex w-full items-center justify-between gap-3 text-sm text-gray-600 md:w-auto md:justify-start">
                                <span>Сортировка</span>
                                <span className="relative block">
                                    <select
                                        value={sortDirection}
                                        onChange={(event) => setSortDirection(event.target.value)}
                                        className="h-10 min-w-0 appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-10 text-sm text-gray-800 outline-none transition-colors hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                    >
                                        <option value="asc">Номер: по возрастанию</option>
                                        <option value="desc">Номер: по убыванию</option>
                                    </select>
                                    <IoChevronDown
                                        aria-hidden="true"
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        size={16}
                                    />
                                </span>
                            </label>
                        </div>
                        {sortedProducts.length > 0 ? (
                            <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {sortedProducts.map((product) => (
                                <ProductCard
                                    key={product.sku || product.id}
                                    product={product}
                                    onOpenModal={() => setSelectedProduct(product)}
                                />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                                По запросу «{searchQuery.trim()}» ничего не найдено
                            </div>
                        )}
                    </>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                        Товары в этой категории пока не добавлены
                    </div>
                )}
            </div>

            {selectedProduct && (
                <ProductModal 
                    product={selectedProduct} 
                    onClose={() => setSelectedProduct(null)} 
                />
            )}
        </section>
    );
};

export default CarMain;
