import ChooseCategory from "./ChooseCategory"

const CatalogHeading = () => {
    return (
        <section>
            <div className="container mx-auto px-4 flex flex-col">
                <div className="self-center my-10">
                    <h1 className="uppercase font-semibold text-4xl" >Каталог колодок</h1>
                </div>
                <div className="w-full max-w-full mb-10">
                    <ChooseCategory />
                </div>
            </div>
        </section>
    )
}


export default CatalogHeading