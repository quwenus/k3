import { useNavigate } from "react-router-dom";
import moto from '../assets/img/catalog-moto-silhouette.jpg';

import car from '../assets/img/catalog-car-silhouette.jpg'


const ChooseCategory = () => {
    const navigate = useNavigate();

    const goTo = (category) => {
        navigate(`/catalog/${category}`);
    };

    // Общий класс для карточки
    const baseCardClass = "relative aspect-[3/2] w-full rounded-xl overflow-hidden bg-zinc-900 shadow-lg group flex items-end text-left transition-shadow duration-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-600";

    const activeClass = "hover:shadow-xl";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <button
                type="button"
                onClick={() => goTo('car')}
                className={`${baseCardClass} ${activeClass}`}
            >
                <img
                    src={car}
                    alt="Автомобили"
                    width={1536}
                    height={1024}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                />

                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/90 via-black/10 to-transparent"></div>

                <div className="relative z-10 flex flex-col p-5 md:p-6 text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2 uppercase tracking-wide">
                        Автомобили
                    </h2>
                    <p className="text-sm sm:text-base opacity-90">Перейти в каталог</p>
                </div>
            </button>

            {/* Кнопка МОТОЦИКЛЫ */}
            <button
                type="button"
                onClick={() => goTo('moto')}
                className={`${baseCardClass} ${activeClass}`}
            >

                <img
                    src={moto} 
                    alt="Мотоциклы"
                    width={1536}
                    height={1024}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/90 via-black/10 to-transparent"></div>

                <div className="relative z-10 flex flex-col p-5 md:p-6 text-white">
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
