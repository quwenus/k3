import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../src/assets/img/logo-green.svg';

const Footer = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (e, sectionId, targetPath = '/') => {
        e.preventDefault();

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
        <footer className="w-full bg-gray-100 shadow-sm">
            <div className="container mx-auto flex flex-col items-center gap-3 px-4 py-4 text-center text-gray-800 md:grid md:grid-cols-[50px_1fr_auto] md:gap-8 md:text-left">
                <a href="/" className="shrink-0 md:justify-self-start">
                    <img src={logo} alt="K3" className="w-10 md:w-14" />
                </a>

                <div className="flex min-w-0 flex-col items-center gap-1 md:justify-self-center">
                    <a
                        href="tel:+79687177737"
                        className="whitespace-nowrap text-sm font-semibold leading-tight transition-colors hover:text-green-600 lg:text-lg xl:text-xl"
                    >
                        +7 (968) 717-77-37
                    </a>

                    <a
                        href="mailto:info@k3-parts.ru"
                        className="max-w-full break-all text-sm font-semibold leading-tight text-green-600 hover:underline lg:text-lg xl:text-xl"
                    >
                        info@k3-parts.ru
                    </a>
                </div>

                <nav className="hidden justify-self-end md:block">
                    <ul className="flex items-center gap-5 font-semibold text-sm lg:gap-6 lg:text-lg xl:text-xl">
                        <li>
                            <a
                                href="/#about"
                                onClick={(e) => scrollToSection(e, 'about', '/')}
                                className="cursor-pointer transition-colors hover:text-green-600"
                            >
                                О нас
                            </a>
                        </li>
                        <li>
                            <a href="/catalog" className="transition-colors hover:text-green-600">Каталог</a>
                        </li>
                        <li>
                            <a href="/warranty" className="transition-colors hover:text-green-600">Гарантии</a>
                        </li>
                    </ul>
                </nav>
            </div>
        </footer>
    )
}

export default Footer
