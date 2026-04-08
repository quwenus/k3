import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../src/assets/img/logo-green.svg';

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const scrollToSection = (e, sectionId, targetPath = '/') => {
        e.preventDefault();
        closeMenu();

        if (location.pathname === targetPath) {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            navigate(`${targetPath}#${sectionId}`);
            setTimeout(() => {
                const element = document.getElementById(sectionId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    };

    return (
        <header className="bg-white shadow-sm top-0 z-50 sticky">
            {/* 
                Сетка для десктопа (3 колонки):
                1. Левая: [50px] - Фиксирована под логотип (как в футере)
                2. Центр: [1fr] - Растягивается. Сюда мы поместим телефон и почту.
                3. Право: [auto] - Меню (автоматически выровняется с футером)
            */}
            <div className="container mx-auto px-4 py-3 hidden md:grid grid-cols-[50px_1fr_auto] items-center gap-8">

                {/* 1. Логотип */}
                <div className="shrink-0">
                    <a href="/">
                        <img src={logo} alt="K3" className="max-w-15" />
                    </a>
                </div>

                {/* 2. Центральная колонка: Телефон + Почта */}
                <div className="flex flex-col items-center w-full justify-center gap-1">
                    <div>
                        <a href="tel:+79687177737" className='font-semibold lg:text-xl xl:text-2xl hover:text-green-600 transition-colors leading-tight'>
                            +7 (968) 717-77-37
                        </a>
                    </div>
                    <div>
                        <a href="mailto:info@k3-parts.ru" className='text-xs lg:text-sm font-semibold text-green-600 hover:underline leading-tight'>
                            info@k3-parts.ru
                        </a>
                    </div>
                </div>

                {/* 3. Навигация (справа) */}
                <nav>
                    <ul className="flex items-center space-x-6 font-semibold ">
                        <li>
                            <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="hover:text-green-600 transition-colors lg:text-lg xl:text-xl">
                                Главная
                            </a>
                        </li>
                        <li>
                            <a href="/#about" onClick={(e) => scrollToSection(e, 'about', '/')} className="hover:text-green-600 transition-colors lg:text-lg xl:text-xl cursor-pointer">
                                О нас
                            </a>
                        </li>
                        <li><a href="/catalog" className="hover:text-green-600 transition-colors lg:text-lg xl:text-xl">Каталог</a></li>
                        <li><a href="#" className="hover:text-green-600 transition-colors lg:text-lg xl:text-xl">Сотрудничество</a></li>
                        <li>
                            <a href="/warranty" className="hover:text-green-600 transition-colors lg:text-lg xl:text-xl">Гарантии</a>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Мобильная версия */}
            <div className="md:hidden container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="shrink-0">
                    <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
                        <img src={logo} alt="K3" className="max-w-10" />
                    </a>
                </div>

                <div className='text-right'>
                    <a href="tel:+79687177737" className='block font-semibold text-sm sm:text-base'>+7 (968) 717-77-37</a>
                    <a href="mailto:info@k3-parts.ru" className='hidden text-[10px] text-green-600 font-semibold'>info@k3-parts.ru</a>
                </div>

                <button
                    onClick={toggleMenu}
                    className="focus:outline-none p-2"
                    aria-label="Открыть меню"
                >
                    <div className="w-6 h-6 flex flex-col justify-center space-y-1.5">
                        <span className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out origin-center ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                        <span className={`block w-full h-0.5 bg-gray-800 transition-all duration-300 ease-in-out origin-center ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </div>
                </button>
            </div>

            {/* Выпадающее мобильное меню */}
            <nav
                className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <ul className={`flex flex-col items-center font-medium text-gray-700 ${isOpen ? 'py-4 space-y-4' : 'py-0 space-y-0'}`}>
                    <li><a href="/" onClick={() => { navigate('/'); closeMenu(); }} className="hover:text-green-600 transition-colors text-lg">Главная</a></li>
                    <li><a href="/#about" onClick={(e) => scrollToSection(e, 'about', '/')} className="hover:text-green-600 transition-colors text-lg">О нас</a></li>
                    <li><a href="/catalog" onClick={closeMenu} className="hover:text-green-600 transition-colors text-lg">Каталог</a></li>
                    <li><a href="#" onClick={closeMenu} className="hover:text-green-600 transition-colors text-lg">Сотрудничество</a></li>
                    <li><a href="/warranty" onClick={closeMenu} className="hover:text-green-600 transition-colors text-lg">Гарантии</a></li>
                    <li className="pt-2 border-t mt-2">
                        <a href="mailto:info@k3-parts.ru" className="text-green-600 font-bold">info@k3-parts.ru</a>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default Header;