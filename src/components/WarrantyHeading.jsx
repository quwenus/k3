const WarrantyHeading = () => {
    return (
        <section>
            <div className="container mx-auto px-4  flex flex-col mt-10">
                <div className="grid gap-8">
                    <div className="self-start">
                        <h1 className="uppercase font-semibold text-4xl">Гарантийные обязательства</h1>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold">Используемые термины</h2>
                    </div>
                </div>

                <div className="mt-4 flex flex-col lg:flex-row gap-8 items-start">

                    <div className="grid gap-2 max-w-2xl w-full font-light">
                        <p >
                            <strong className="font-semibold">Гарантийный срок</strong> - календарный срок, установленный в днях, месяцах, годах, или наработка,
                            установленная в часах, циклах срабатываний, километрах пробега или иных аналогичных показателях,
                            предусмотренные законодательством или договором, в течение которых товар должен соответствовать требованиям
                            к его качеству, определенным в порядке, установленном законодательством.
                        </p>
                        <p >
                            <strong className="font-semibold">Документ, подтверждающий факт приобретения товара,</strong> – документ, содержащий сведения о наименовании товара, стоимости товара,
                            дате приобретения товара, продавце, оформленный в порядке,
                            утвержденном нормативными правовыми актами Российской Федерации.
                        </p>
                        <p >
                            <strong className="font-semibold">Качество товара</strong> – эксплуатационные характеристики, функциональная пригодность,
                            безопасность, надежность, экономические, информационные и эстетические требования и др.
                        </p>
                        <p >
                            <strong className="font-semibold">Недостаток товара</strong> – несоответствие товара нормативным документам, устанавливающим
                            требования к его качеству, иному законодательству или условиям договора.
                        </p>
                    </div>

                    <div className="w-full lg:flex-1 flex justify-center items-start pt-1">
                        <button className="border border-green-500 bg-green-500 hover:bg-green-600 px-8 py-3 transition-colors whitespace-nowrap font-semibold cursor-pointer">
                            Скачать акт рекламации
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default WarrantyHeading