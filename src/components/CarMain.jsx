import { useState, useEffect, useMemo } from 'react';
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

const CarMain = ({ categorySlug = "car" }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");

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

    const sortedProducts = useMemo(() => {
        const directionMultiplier = sortDirection === "desc" ? -1 : 1;

        return [...products].sort((a, b) => {
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
    }, [products, sortDirection]);

    if (loading) return <div className="text-center py-10">Загрузка товаров...</div>;

    return (
        <section className="py-8 relative">
            <div className="container mx-auto px-4">
                {sortedProducts.length > 0 ? (
                    <>
                        <div className="mb-5 flex justify-end">
                            <label className="flex items-center gap-3 text-sm text-gray-600">
                                <span>Сортировка</span>
                                <select
                                    value={sortDirection}
                                    onChange={(event) => setSortDirection(event.target.value)}
                                    className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition-colors hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                >
                                    <option value="asc">Номер: по возрастанию</option>
                                    <option value="desc">Номер: по убыванию</option>
                                </select>
                            </label>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                            {sortedProducts.map((product) => (
                            <ProductCard 
                                key={product.sku || product.id} 
                                product={product} 
                                onOpenModal={() => setSelectedProduct(product)} 
                            />
                            ))}
                        </div>
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
