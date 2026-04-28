import { useState, useEffect } from 'react';
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal"; // Импортируем модалку

const CarMain = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Состояние для модалки: хранит объект товара или null
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetch('http://localhost:5123/api/products')
            .then(res => res.json())
            .then(response => {
                if (response && response.data) {
                    setProducts(response.data);
                } else if (Array.isArray(response)) {
                    setProducts(response);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="container mx-auto px-4 py-10 text-center">Загрузка товаров...</div>;

    return (
        <section className="py-8 relative">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <ProductCard 
                            key={product.sku || product.id} 
                            product={product} 
                            // Передаем функцию открытия модалки
                            onOpenModal={() => setSelectedProduct(product)} 
                        />
                    ))}
                </div>
            </div>

            {/* Рендерим модалку только если selectedProduct не null */}
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