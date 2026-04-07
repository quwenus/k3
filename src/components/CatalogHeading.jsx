import ChooseCategory from "./ChooseCategory"

const CatalogHeading = () => {
    return (
        <section>
            <div className="container mx-auto px-4 flex flex-col mt-10">
                <div className="self-center mb-10">
                    <h1 className="uppercase font-semibold text-4xl" >Каталог колодок</h1>
                </div>
                <div>
                    <ChooseCategory />
                </div>
            </div>
        </section>
    )
}


export default CatalogHeading