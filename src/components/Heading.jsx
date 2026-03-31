import background from '../../src/assets/img/hero-img-min.png'

const Heading = () => {
    return (
        <section>
            <div className="container mx-auto px-4 py-5 flex flex-col items-center">
                <div className="self-start">
                    <h1 className="uppercase font-semibold text-4xl">тормозные колодки от производителя</h1>
                </div>
                <div className="pt-3 pb-10 self-start">
                    <span className="uppercase font-semibold text-2xl ">европейская надежность по разумной цене</span>
                </div>
                <div className="grid gap-2 font-light text-gray-700">
                    <p>
                        Компания К3 занимается изготовлением тормозных колодок, используя для
                        производства современное оборудование и сырье, а также передовые технологические решения для достижения
                        качественного результата.
                    </p>
                    <p>
                        Продукция разрабатывается с учетом эксплуатационных запросов, проходит множество
                        этапов тестирования для достижения требуемого результата.
                    </p>
                    <p>
                        Итогом такого подхода, являются колодки
                        современного образца, способные обеспечить безопасность на дороге и уверенное торможение автомобиля в
                        любых условиях.  Кроме того, продукция поставляется в широком ассортименте моделей для отечественных и
                        импортных авто
                    </p>
                </div>
                <div className="gap-5 w-full grid my-10">
                    <div>
                        <button className="w-full py-3 font-semibold bg-green-500 border-2 border-green-500">Оставить заявку</button>
                    </div>
                    <div>
                        <button className="w-full py-3 font-semibold border-2">Подробнее</button>
                    </div>
                </div>
                <div>
                    <img src={background} alt="" />
                </div>
            </div>
        </section>
    )
}

export default Heading