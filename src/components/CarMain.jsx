import { useState, useEffect } from 'react';
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

const CarMain = ({ categorySlug, title }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        // Запрос к API с использованием переданного slug
        fetch('/api/products?category_slug=car')
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

    if (loading) return <div className="text-center py-10">Загрузка товаров...</div>;

    return (
        <section className="py-8 relative">
            <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">{title}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <ProductCard 
                            key={product.sku || product.id} 
                            product={product} 
                            onOpenModal={() => setSelectedProduct(product)} 
                        />
                    ))}
                </div>
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