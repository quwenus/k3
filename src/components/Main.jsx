import card1 from '../../src/assets/img/card-bg-1.png'
import card2 from '../../src/assets/img/card-bg-2.png'
import card3 from '../../src/assets/img/card-bg-3.png'
import card4 from '../../src/assets/img/card-bg-4.png'

const Main = () => {
    return (
        <main>
            <div className="container mx-auto px-4 py-5 flex flex-col items-center">

                <div className="self-start w-full mb-8">
                    <h1 className="uppercase font-semibold text-3xl sm:text-4xl text-gray-900">
                        наши преимущества
                    </h1>
                </div>

                <div className="self-start max-w-3xl text-gray-700 space-y-4 mb-10 font-light leading-relaxed">
                    <p>
                        Компания К3 – самостоятельный производитель тормозных колодок из России. Мы предлагаем продукцию для
                        легковых автомобилей разных марок и моделей.
                    </p>
                    <p>
                        Качественно разрабатываемых моделей тормозных колодок соответствует необходимым стандартам. Испытания
                        подтверждают высокие эксплуатационные характеристики продукции в том числе в сравнении с основными
                        конкурентами на рынке. Мы стремимся занять лидерскую позицию на российском рынке.
                    </p>
                    <p>
                        Мы не стоим на месте, регулярно совершенствуем продукцию, учитываем технологические тренды и внедряем
                        собственные разработки. Повышаем эффективность работы тормозных колодок, надежность и долговечность
                        продукции, сохраняя выгодные цены.
                    </p>
                </div>

                <div className="grid gap-10">
                    <div className="relative w-full max-w-4xl min-h-75 sm:min-h-100 rounded-xl overflow-hidden shadow-lg group flex items-center">
                        <img
                            src={card1}
                            alt="Оснащение"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-10 text-white">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-wide">
                                Оснащение
                            </h2>
                            <p className="text-base sm:text-lg text-gray-200 max-w-lg leading-relaxed">
                                Располагаем передовым производственным оборудованием для
                                обработки материалов, сборки продукции. Производство на уровне
                                ведущих представителей рынка.
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full max-w-4xl min-h-75 sm:min-h-100 rounded-xl overflow-hidden shadow-lg group flex items-center">
                        <img
                            src={card2}
                            alt="Производство"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-10 text-white">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-wide">
                                Комплексное производство
                            </h2>
                            <p className="text-base sm:text-lg text-gray-200 max-w-lg leading-relaxed">
                                Комплексное производство – имеем максимальную локализацию
                                производственных мощностей, что позволяет самостоятельно
                                изготавливать тормозные колодки от проекта до полной
                                готовности.
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full max-w-4xl min-h-75 sm:min-h-100 rounded-xl overflow-hidden shadow-lg group flex items-center">
                        <img
                            src={card3}
                            alt="Цеха"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-10 text-white">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-wide">
                                Собственные цеха
                            </h2>
                            <p className="text-base sm:text-lg text-gray-200 max-w-lg leading-relaxed">
                                Производство полностью является собственностью нашей компании,
                                это означает, что мы смотрим только вперед и нацелены на
                                уверенное сотрудничество, регулярные поставки продукции.
                            </p>
                        </div>
                    </div>
                    <div className="relative w-full max-w-4xl min-h-75 sm:min-h-100 rounded-xl overflow-hidden shadow-lg group flex items-center">
                        <img
                            src={card4}
                            alt="Персонал"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/50 to-transparent"></div>
                        <div className="relative z-10 h-full flex flex-col justify-center p-6 sm:p-10 text-white">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-4 uppercase tracking-wide">
                                Квалифицированный персонал
                            </h2>
                            <p className="text-base sm:text-lg text-gray-200 max-w-lg leading-relaxed">
                                Мы понимаем важность кадров в организации производства,
                                поэтому формируем штат исключительно из компетентных
                                специалистов, имеющих соответствующую квалификацию и опыт.
                            </p>
                            {/* <button className="mt-6 self-start px-6 py-2 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 rounded font-medium">
                                Подробнее
                            </button> */}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    )
}

export default Main