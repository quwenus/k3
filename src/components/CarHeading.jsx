import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const CarHeading = ({ title = "Автомобильные колодки" }) => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate('/catalog');
    };

    return (
        <section className="py-6">
            <div className="container mx-auto grid min-h-20 w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4">
                
                <button
                    onClick={goBack}
                    className="p-3 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                    aria-label="Назад"
                >
                    <IoIosArrowBack size={28} className="text-gray-800 hover:text-green-600 transition-colors" />
                </button>

                <div className="min-w-0 text-center">
                    <h1 className="uppercase font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900 leading-tight break-words">
                        {title}
                    </h1>
                </div>

                <div className="h-13 w-13" aria-hidden="true" />
            </div>
        </section>
    );
};

export default CarHeading;
