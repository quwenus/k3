import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const CarHeading = () => {
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };

    return (
        <section className="py-6">
            <div className="container mx-auto px-4 relative min-h-20 flex items-center"> 
                
                <button
                    onClick={goBack}
                    className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-100 rounded-full transition-colors cursor-pointer z-20"
                    aria-label="Назад"
                >
                    <IoIosArrowBack size={28} className="text-gray-800 hover:text-green-600 transition-colors" />
                </button>

                <div className="w-full text-center ml-12 md:ml-0">
                    <h1 className="uppercase font-bold text-2xl sm:text-3xl md:text-4xl text-gray-900 leading-tight wrap-break-word">
                        Автомобильные колодки
                    </h1>
                </div>
            </div>
        </section>
    );
};

export default CarHeading;