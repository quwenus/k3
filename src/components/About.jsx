

const About = () => {
    return (
        <section id="about" className="scroll-mt-24">
            <div className="container mx-auto px-4 py-5 my-10 flex flex-col items-center">
                <div className="self-start w-full mb-8">
                    <h1 className="uppercase font-semibold text-3xl sm:text-4xl text-gray-900">О компании</h1>
                </div>
                <div className="self-start max-w-3xl text-gray-700 space-y-4 mb-10 font-light leading-relaxed">
                    <p>
                        Качественно разрабатываемых моделей тормозных колодок
                        соответствует мировым стандартам. Испытания подтверждают высокие
                        эксплуатационные характеристики продукции в том числе в
                        сравнении с основными конкурентами на рынке. Мы стремимся занять
                        лидерскую позицию не только на Российском, но и на мировом
                        рынке.
                    </p>
                </div>
                <div className="grid gap-4 font-light text-gray-700 self-start">
                    <div>
                        <h4 className="text-2xl lg:text-4xl font-semibold text-green-500">01</h4>
                        <div>
                            <p>
                                Надежное и эффективное торможение при любых скоростных
                                режимах и на разных видах покрытий
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl lg:text-4xl font-semibold text-green-500">02</h4>
                        <div>
                            <p>
                                Производство располагается в России, что упрощает доставку и
                                исключает возможные перебои в поставках.
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl lg:text-4xl font-semibold text-green-500">03</h4>
                        <div>
                            <p>
                                Долговечность колодок, минимальный износ диска при
                                эксплуатации
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl lg:text-4xl font-semibold text-green-500">04</h4>
                        <div>
                            <p>
                                Проведенные испытания подтверждают отсутствие шума при
                                торможении
                            </p>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl lg:text-4xl font-semibold text-green-500">05</h4>
                        <div>
                            <p>
                                Соответствие требованиям ГОСТ и другим стандартам
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}


export default About