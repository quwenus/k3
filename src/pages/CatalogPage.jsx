import CatalogHeading from "../components/CatalogHeading"

const CatalogPage = () => {
    return (
        <section className="min-h-full flex flex-col justify-center py-8">
            {/* Добавляем flex, направление column, min-h-full и центрирование по оси Y */}
            <CatalogHeading />
        </section>
    )
}

export default CatalogPage