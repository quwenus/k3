import logo from '../../src/assets/img/logo-green.svg';

const Footer = () => {
    return (
        <footer className=" bg-gray-300/20 w-full shadow-sm">
            <div className="container mx-auto px-4 py-5 flex justify-between items-center gap-4 ">
                <div className="shrink-0 ">
                    <a href="/"><img src={logo} alt="K3" className="max-w-10 sm:max-w-15 " /></a>
                </div>
                <div className='max-w-40 xl:max-w-lg'>
                    <p className='font-semibold text-xs lg:text-lg'>Официальный поставщик тормозных колодок K3</p>
                </div>
                <div>
                    <a href="mailto:info@k3-parts.ru" className='text-xs lg:text-lg font-semibold text-green-600 hover:underline'>info@k3-parts.ru</a>
                </div>
                <div>
                    <nav>
                        <ul className={`
                            sm:flex flex-col md:flex-row items-center
                            md:py-0 md:space-y-0 md:space-x-6 
                            font-semibold text-xs hidden lg:text-lg
                            `}>
                            <li><a href="/#about" onClick={(e) => scrollToSection(e, 'about', '/')} className="hover:text-green-600 transition-colors lg:text-lg xl:text-xl cursor-pointer">
                                О нас
                            </a></li>
                            <li><a href="/catalog" className="hover:text-green-600 transition-colors">Каталог</a></li>
                            <li><a href="#" className="hover:text-green-600 transition-colors">Сотрудничество</a></li>
                            <li><a href="/warranty" className="hover:text-green-600 transition-colors">Гарантии</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    )
}

export default Footer