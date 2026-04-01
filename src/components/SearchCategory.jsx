

const SearchCategory = () => {
    return (
        <div className='flex flex-col'>
            <label htmlFor="">Выберите категорию:</label>
            <div className='flex justify-between max-w-sm'>
                <div>
                    <input type="radio" name="choise" id="car" className='mr-2 accent-green-600' />
                    <label htmlFor="car">Автомобиль</label>
                </div>
                <div>
                    <input type="radio" name="choise" id="moto" className='mr-2 accent-green-600' />
                    <label htmlFor="moto">Мотоцикл</label>
                </div>
            </div>
        </div>
    )
}

export default SearchCategory