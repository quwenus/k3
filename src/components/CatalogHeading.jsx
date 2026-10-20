import ChooseCategory from "./ChooseCategory"
import { Link } from "react-router-dom"

const CatalogHeading = () => {
    return (
        <section>
            <div className="container mx-auto px-4 flex flex-col h-full">
                <div className="self-center my-10 text-center">
                    <h1 className="uppercase font-semibold text-3xl" >Каталог колодок</h1>
                    <Link to="/catalog/search" className="mt-3 inline-block text-sm font-medium text-green-700 underline underline-offset-4 hover:text-green-800">
                        Поиск по всему каталогу
                    </Link>
                </div>
                <div className="w-full max-w-full mb-10">
                    <ChooseCategory />
                </div>
            </div>
        </section>
    )
}


export default CatalogHeading
