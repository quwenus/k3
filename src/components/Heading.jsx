
import SearchBar from './SearchBar'


const Heading = () => {
    const scrollTo = (targetId) => {
        const element = document.getElementById('plus')
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        }
    }

    return (
        <section>
            <div className="container mx-auto px-4 py-5 flex flex-col lg:grid lg:grid-cols-2 mt-10">
                <div>
                    <div className="self-start">
                        <h1 className="uppercase font-semibold text-4xl">тормозные колодки от производителя</h1>
                    </div>
                    <div className="pt-3 pb-10 self-start">
                        <span className="uppercase font-semibold text-2xl ">европейская надежность по разумной цене</span>
                    </div>
                </div>
                <div>
                    <SearchBar />
                </div>
            </div>
        </section>
    )
}

export default Heading