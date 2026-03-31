import { useState } from 'react';
import logo from '../../src/assets/img/logo-green.svg';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const closeMenu = () => setIsOpen(false)

    return (
        <header className="bg-white shadow-sm top-0 z-50 sticky">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">

                {/* Логотип */}
                <div className="shrink-0">
                    <a href="/"><img src={logo} alt="K3" className="max-w-10 sm:max-w-15 " /></a>
                </div>

                <div className='sm:hover:text-green-600 sm:transition-colors xl:text-2xl'>
                    <a href="tel:+79687177737"
                        className='font-semibold'
                    >+7 (968) 717-77-37</a>
                </div>

                {/* Кнопка Бургера (видна только на мобильных < 640px) */}
                <button
                    onClick={toggleMenu}
                    className="md:hidden focus:outline-none p-2"
                    aria-label="Открыть меню"
                >
                    <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                        <span className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out origin-center ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                        <span className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out origin-center ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>

                {/* Навигация (Меню) */}
                <nav
                    className={`
                    absolute top-full left-0 w-full bg-white shadow-lg 
                    transition-all duration-500 ease-in-out overflow-hidden
                    md:relative md:block md:w-auto md:bg-transparent md:shadow-none md:transform-none md:overflow-visible
                    ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 md:max-h-full md:opacity-100'}
                `}
                >
                    <ul className={`
                    flex flex-col md:flex-row items-center 
                    md:py-0 md:space-y-0 md:space-x-6 
                    font-medium text-gray-700
                    ${isOpen ? 'py-4 space-y-4' : 'py-0 space-y-0 md:py-0 md:space-y-0'}
                    `}>
                        <li><a href="#" onClick={closeMenu} className="hover:text-green-600 transition-colors md:hidden">Главная</a></li>
                        <li><a href="#about" onClick={closeMenu} className="hover:text-green-600 transition-colors">О нас</a></li>
                        <li><a href="#" onClick={closeMenu} className="hover:text-green-600 transition-colors">Каталог</a></li>
                        <li><a href="#" onClick={closeMenu} className="hover:text-green-600 transition-colors">Сотрудничество</a></li>
                        <li><a href="#" onClick={closeMenu} className="hover:text-green-600 transition-colors">Гарантии</a></li>
                        <li><a href="" className="text-green-600 font-bold hover:underline">Войти</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;