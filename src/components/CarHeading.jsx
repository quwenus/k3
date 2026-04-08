import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const CarHeading = () => {
    const navigate = useNavigate()

    const goBack = () => {
        navigate(-1)
    }

    return (
        <section>
            <div className="container mx-auto px-4 relative"> {/* Добавили relative */}
                <div className="flex justify-center my-10"> {/* justify-center центрирует содержимое по горизонтали */}
                    <h1 className="uppercase font-semibold text-4xl text-center">
                        Автомобильные колодки
                    </h1>
                </div>

                {/* Стрелка абсолютно позиционируется слева, не влияя на центр заголовка */}
                <button
                    onClick={() => goBack()}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                    <IoIosArrowBack size={30} className="hover:text-green-600" />
                </button>
            </div>
        </section>
    )
}

export default CarHeading