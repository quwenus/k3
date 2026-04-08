
import SearchBar from './SearchBar'


const Heading = () => {
    

    return (
        <section>
            <div className="container mx-auto px-4 py-5 flex flex-col lg:grid lg:grid-cols-2 mt-10 place-items-center">
                <div className='flex items-center flex-col gap-5'>
                    <div className="self-start">
                        <h1 className="uppercase font-semibold text-4xl">тормозные колодки от производителя</h1>
                    </div>
                    <div className="self-start">
                        <span className="uppercase font-semibold text-2xl ">европейская надежность по разумной цене</span>
                    </div>
                </div>
                <div className='w-full'>
                    <SearchBar />
                </div>
            </div>
        </section>
    )
}

export default Heading