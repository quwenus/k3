import { useNavigate, useLocation } from "react-router-dom";
import card3 from '../../src/assets/img/card-bg-3.png';


const ChooseCategory = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const goTo = (category) => {
        navigate(`/catalog/${category}`);
    };

    const isCarActive = location.pathname === '/catalog/car';
    const isMotoActive = location.pathname === '/catalog/moto';

    // Общий класс для карточки
    const baseCardClass = "relative w-full max-w-4xl min-h-[300px] sm:min-h-[400px] rounded-xl overflow-hidden shadow-lg group flex items-center justify-center transition-all duration-300 cursor-pointer";

    const activeClass = "opacity-80 hover:opacity-100 hover:scale-[1.01]";

    return (
        <div className="flex flex-col sm:flex-row justify-between gap-4">

            <button
                onClick={() => goTo('car')}
                className={`${baseCardClass} ${activeClass}`}
            >
                <img
                    src={card3}
                    alt="Автомобили"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>

                <div className="relative z-10 flex flex-col justify-center p-6 text-white text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wide">
                        Автомобили
                    </h2>
                    <p className="text-sm sm:text-base opacity-90">Перейти в каталог</p>
                </div>
            </button>

            {/* Кнопка МОТОЦИКЛЫ */}
            <button
                onClick={() => goTo('moto')}
                className={`${baseCardClass} ${activeClass}`}
            >

                <img
                    src={card3} // <-- ЗАМЕНИТЕ НА КАРТИНКУ МОТОЦИКЛОВ
                    alt="Мотоциклы"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>

                <div className="relative z-10 flex flex-col justify-center p-6 text-white text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wide">
                        Мотоциклы
                    </h2>
                    <p className="text-sm sm:text-base opacity-90">Перейти в каталог</p>
                </div>
            </button>
        </div>
    );
};

export default ChooseCategory;