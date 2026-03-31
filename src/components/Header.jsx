import { useState } from 'react';
import logo from '../../src/assets/img/logo-green.svg';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header className="bg-white shadow-sm relative z-50">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">

                {/* Логотип */}
                <div className="shrink-0">
                    <img src={logo} alt="K3" className="max-w-15 sm:max-w-35" />
                </div>

                <div className='sm:hover:text-green-600 sm:transition-colors'>
                    <a href="tel:+79687177737"
                        className='font-semibold'
                    >+7 (968) 717-77-37</a>
                </div>

                {/* Кнопка Бургера (видна только на мобильных < 640px) */}
                <button
                    onClick={toggleMenu}
                    className="sm:hidden focus:outline-none p-2"
                    aria-label="Открыть меню"
                >
                    <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                        <span
                            className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out origin-center ${isOpen ? 'rotate-45 translate-y-2' : ''
                                }`}
                        ></span>
                        <span
                            className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'
                                }`}
                        ></span>
                        <span
                            className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out origin-center ${isOpen ? '-rotate-45 -translate-y-2' : ''
                                }`}
                        ></span>
                    </div>
                </button>

                {/* Навигация (Меню) */}
                <nav
                    className={`
                        absolute top-full left-0 w-full bg-white shadow-lg 
                        transform transition-all duration-300 ease-in-out overflow-hidden
                        sm:relative sm:block sm:w-auto sm:bg-transparent sm:shadow-none sm:transform-none
                        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 sm:max-h-full sm:opacity-100'}
                    `}
                >
                    <ul className="flex flex-col sm:flex-row items-center py-4 sm:py-0 space-y-4 sm:space-y-0 sm:space-x-6 font-medium text-gray-700">
                        <li><a href="#" className="hover:text-green-600 transition-colors">Главная</a></li>
                        <li><a href="#" className="hover:text-green-600 transition-colors">О нас</a></li>
                        <li><a href="#" className="hover:text-green-600 transition-colors">Каталог</a></li>
                        <li><a href="#" className="hover:text-green-600 transition-colors">Сотрудничество</a></li>
                        <li><a href="#" className="hover:text-green-600 transition-colors">Гарантии</a></li>
                        <li><a href="tel:+79687177737" className="text-green-600 font-bold hover:underline">Войти</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;