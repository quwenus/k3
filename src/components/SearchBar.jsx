import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('search');

    const handleSearch = (event) => {
        event.preventDefault();
        const trimmedQuery = query.trim();
        const search = trimmedQuery ? `?q=${encodeURIComponent(trimmedQuery)}` : '';

        navigate(`/catalog/${category}${search}`);
    };

    return (
        <form onSubmit={handleSearch} role="search" className="p-6 bg-gray-300/20 rounded-xl shadow-sm">

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Быстрый <span className="font-extrabold">поиск</span>
            </h2>

            <p className="text-gray-500 mb-4 text-sm">
                По артикулу, OEM, марке или модели
            </p>

            <div className="mb-4 grid grid-cols-3 gap-2 rounded-full bg-white p-1 text-sm">
                <button
                    type="button"
                    aria-pressed={category === 'search'}
                    onClick={() => setCategory('search')}
                    className={`rounded-full px-4 py-2 transition-colors ${category === 'search' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Все
                </button>
                <button
                    type="button"
                    aria-pressed={category === 'car'}
                    onClick={() => setCategory('car')}
                    className={`rounded-full px-4 py-2 transition-colors ${category === 'car' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Авто
                </button>
                <button
                    type="button"
                    aria-pressed={category === 'moto'}
                    onClick={() => setCategory('moto')}
                    className={`rounded-full px-4 py-2 transition-colors ${category === 'moto' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    Мото
                </button>
            </div>

            <div className="relative items-center w-full flex">

                {/* Инпут */}
                <input
                    type="search"
                    aria-label="Поиск по каталогу"
                    placeholder="Артикул или модель"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-14 pl-6 pr-32 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 placeholder-gray-400"
                />

                {/* Кнопка поиска */}
                <button
                    type="submit"
                    className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-700 text-white font-medium px-8 rounded-full transition-colors shadow-md active:scale-95 transform duration-150 cursor-pointer"
                >
                    ПОИСК
                </button>
            </div>
        </form>
    );
};

export default SearchBar;
