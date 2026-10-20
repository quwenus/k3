import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { IoChevronDown, IoClose, IoSearch } from 'react-icons/io5';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { createProductSearchIndex, searchProducts } from '../utils/productSearch.js';

const categories = [
    { slug: '', label: 'Все', path: '/catalog/search' },
    { slug: 'car', label: 'Авто', path: '/catalog/car' },
    { slug: 'moto', label: 'Мото', path: '/catalog/moto' },
];

const CarMain = ({ categorySlug = '' }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [catalog, setCatalog] = useState({ products: [], loading: true, error: '' });
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const urlQuery = searchParams.get('q') || '';
    // Router navigation is asynchronous. Keep keystrokes immediate and only
    // replace the draft on external URL changes (e.g. browser Back/Forward).
    const [searchState, setSearchState] = useState(() => ({
        value: urlQuery, observedUrl: urlQuery, pending: [],
    }));
    if (searchState.observedUrl !== urlQuery) {
        const ownUpdate = searchState.pending.lastIndexOf(urlQuery);
        setSearchState({
            value: ownUpdate >= 0 ? searchState.value : urlQuery,
            observedUrl: urlQuery,
            pending: ownUpdate >= 0 ? searchState.pending.slice(ownUpdate + 1) : [],
        });
    }
    const searchQuery = searchState.value;
    const hasQuery = Boolean(searchQuery.trim());
    const requestedSort = searchParams.get('sort');
    const sortDirection = ['asc', 'desc', 'relevance'].includes(requestedSort)
        ? requestedSort : hasQuery ? 'relevance' : 'asc';

    useEffect(() => {
        const controller = new AbortController();
        const loadProducts = async () => {
            try {
                const response = await fetch('/api/products', { signal: controller.signal });
                if (!response.ok) throw new Error('Не удалось загрузить каталог');
                const data = await response.json();
                if (!Array.isArray(data.data)) throw new Error('Не удалось загрузить каталог');
                if (!controller.signal.aborted) {
                    setCatalog({ products: data.data, loading: false, error: '' });
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setCatalog({ products: [], loading: false, error: error.message });
                }
            }
        };
        loadProducts();
        return () => controller.abort();
    }, [reloadKey]);

    const index = useMemo(() => createProductSearchIndex(catalog.products), [catalog.products]);
    const allResults = useMemo(() => searchProducts(index, searchQuery, sortDirection),
        [index, searchQuery, sortDirection]);
    const products = categorySlug
        ? allResults.filter(product => product.category_slug === categorySlug) : allResults;
    const categoryCounts = Object.fromEntries(categories.map(category => [category.slug,
        category.slug ? allResults.filter(product => product.category_slug === category.slug).length : allResults.length,
    ]));

    const updateParam = (key, value) => {
        const nextParams = new URLSearchParams(searchParams);
        if (searchQuery) nextParams.set('q', searchQuery);
        else nextParams.delete('q');
        if (key === 'q') {
            setSearchState(previous => ({
                ...previous, value, pending: [...previous.pending, value],
            }));
        }
        if (value) nextParams.set(key, value);
        else nextParams.delete(key);
        setSearchParams(nextParams, { replace: true });
    };

    const categoryUrl = path => {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) params.set('q', searchQuery);
        else params.delete('q');
        const query = params.toString();
        return query ? `${path}?${query}` : path;
    };

    const retry = () => {
        setCatalog({ products: [], loading: true, error: '' });
        setReloadKey(key => key + 1);
    };

    return (
        <section className="py-8 relative">
            <div className="container mx-auto px-4">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full md:max-w-xl">
                        <label htmlFor="catalog-search" className="sr-only">Поиск по каталогу</label>
                        <IoSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            id="catalog-search"
                            type="search"
                            value={searchQuery}
                            onChange={event => updateParam('q', event.target.value)}
                            placeholder="Артикул, OEM, марка или модель"
                            aria-describedby="catalog-search-help"
                            className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-10 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 hover:border-green-500 focus:border-green-600 focus:ring-2 focus:ring-green-500/20 [&::-webkit-search-cancel-button]:appearance-none"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                aria-label="Очистить поиск"
                                onClick={() => updateParam('q', '')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            ><IoClose size={18} /></button>
                        )}
                    </div>
                    <label className="flex items-center justify-between gap-3 text-sm text-gray-600 md:justify-start">
                        <span>Сортировка</span>
                        <span className="relative block">
                            <select
                                value={sortDirection}
                                onChange={event => updateParam('sort', event.target.value)}
                                className="h-10 appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-10 text-sm text-gray-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                            >
                                <option value="relevance">По совпадению</option>
                                <option value="asc">Номер: по возрастанию</option>
                                <option value="desc">Номер: по убыванию</option>
                            </select>
                            <IoChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        </span>
                    </label>
                </div>
                <p id="catalog-search-help" className="mb-4 text-sm text-gray-500">
                    Например: К1842, 1118-3501080 или Лада Веста
                </p>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <nav aria-label="Категории поиска" className="flex gap-2">
                        {categories.map(category => (
                            <Link
                                key={category.path}
                                to={categoryUrl(category.path)}
                                aria-current={categorySlug === category.slug ? 'page' : undefined}
                                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${categorySlug === category.slug
                                    ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {category.label}{!catalog.loading && !catalog.error && ` · ${categoryCounts[category.slug]}`}
                            </Link>
                        ))}
                    </nav>
                    <p role="status" className="text-sm text-gray-500">
                        {catalog.loading ? 'Загрузка товаров…' : catalog.error ? '' : `Найдено товаров: ${products.length}`}
                    </p>
                </div>

                {catalog.error ? (
                    <div role="alert" className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                        <p>Не удалось загрузить каталог. Попробуйте ещё раз.</p>
                        <button type="button" onClick={retry} className="mt-3 font-medium text-green-700 underline">Повторить загрузку</button>
                    </div>
                ) : catalog.loading ? (
                    <div className="py-10 text-center text-gray-500">Загрузка каталога…</div>
                ) : products.length > 0 ? (
                    <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} onOpenModal={() => setSelectedProduct(product)} />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-600">
                        <p>{hasQuery ? `По запросу «${searchQuery.trim()}» ничего не найдено${categorySlug ? ' в этой категории' : ''}`
                            : 'Товары пока не добавлены'}</p>
                        {categorySlug && allResults.length > 0 ? (
                            <Link to={categoryUrl('/catalog/search')} className="mt-3 inline-block font-medium text-green-700 underline">
                                Посмотреть в других категориях · {allResults.length}
                            </Link>
                        ) : hasQuery && (
                            <p className="mt-2 text-sm">Проверьте номер детали или попробуйте указать только марку и модель.</p>
                        )}
                    </div>
                )}
            </div>
            {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
        </section>
    );
};

export default CarMain;
