import { useState } from 'react';
import SearchCategory from './SearchCategory';

const SearchBar = () => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim()) {
            console.log('Ищем:', query);
            // Здесь будет вызов вашей функции поиска
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="w-full  p-6 bg-gray-300/20 rounded-xl shadow-sm ">

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Быстрый <span className="font-extrabold">поиск</span>
            </h2>

            <p className="text-gray-500 mb-6 text-sm">
                Быстрый поиск по модели или номеру детали
            </p>

            <div className="relative items-center w-full flex">

                {/* Инпут */}
                <input
                    type="text"
                    placeholder="Поиск"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full h-14 pl-6 pr-32 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-600 transition-all text-gray-700 placeholder-gray-400"
                />

                {/* Кнопка поиска */}
                <button
                    onClick={handleSearch}
                    className="absolute right-2 top-2 bottom-2 bg-green-600 hover:bg-green-700 text-white font-medium px-8 rounded-full transition-colors shadow-md active:scale-95 transform duration-150 cursor-pointer"
                >
                    ПОИСК
                </button>
            </div>
            {/* <div className='border-[0.5px] my-6 border-gray-200'></div> */}
            {/* <SearchCategory /> */}
        </div>
    );
};

export default SearchBar;