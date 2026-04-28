import { useState, useEffect } from 'react';
import { IoClose, IoChevronDown, IoChevronUp } from 'react-icons/io5'; // Добавили иконки стрелок


const ProductModal = ({ product, onClose }) => {
    if (!product) return null;

    const { 
        sku, 
        title, 
        oem_numbers, 
        price,
        compatible_cars,
        images
    } = product;

    let imageUrl = '/assets/img/placeholder.png';

    if (images && Array.isArray(images) && images.length > 0) {
        const mainImage = images.find(img => img.is_main);
        // Если есть главное - берем его, иначе первое из списка
        imageUrl = mainImage ? mainImage.file_path : images[0].file_path;
    }

    // Состояние для выпадающего списка применяемости
    const [isCompatibilityOpen, setIsCompatibilityOpen] = useState(false);

    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price);

    // Закрытие по Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()} 
            >
                
                {/* Шапка */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-50 shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Подробная информация</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer">
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Тело с прокруткой */}
                <div className="p-6 overflow-y-auto custom-scrollbar grow">
                    
                    {/* Изображение */}
                    <div className="w-full h-full mb-6 overflow-hidden rounded-xl bg-gray-100 shadow-inner">
                        <img 
                            src={imageUrl}
                            alt={title} 
                            className="w-full h-full object-cover" 
                        />
                    </div>

                    {/* Артикул и Название */}
                    <div className="mb-4">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xl font-bold rounded mb-2">
                            {sku}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight wrap-break-words">
                            {title}
                        </h3>
                    </div>

                    {/* Характеристики */}
                    <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        {/* <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Ширина</p>
                            <p className="font-medium text-gray-800">{width_mm} мм</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Высота</p>
                            <p className="font-medium text-gray-800">{height_mm} мм</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Толщина</p>
                            <p className="font-medium text-gray-800">{thickness_mm} мм</p>
                        </div> */}
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-semibold">Тип</p>
                            <p className="font-medium text-gray-800">Дисковые</p> 
                        </div>
                    </div>

                    {/* OEM номера */}
                    {oem_numbers && (
                        <div className="mb-6">
                            <p className="text-sm font-semibold text-gray-700 mb-1">Оригинальные номера (OEM):</p>
                            <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded border border-gray-200 break-all">
                                {oem_numbers}
                            </p>
                        </div>
                    )}

                    {/* --- ВЫПАДАЮЩИЙ СПИСОК ПРИМЕНЯЕМОСТИ --- */}
                    {compatible_cars && (
                        <div className="mb-6 border border-blue-100 rounded-lg overflow-hidden ">
                            {/* Кнопка-заголовок */}
                            <button 
                                onClick={() => setIsCompatibilityOpen(!isCompatibilityOpen)}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                            >
                                <span className="text-sm font-semibold text-blue-900 ">
                                    Применяемость ({compatible_cars.split('; ').length} авто)
                                </span>
                                {isCompatibilityOpen ? <IoChevronUp /> : <IoChevronDown />}
                            </button>

                            {/* Раскрывающийся контент */}
                            {isCompatibilityOpen && (
                                <div className="p-3 bg-white border-t border-blue-100 animate-fade-in-down">
                                    <ul className="list-disc list-inside space-y-1">
                                        {/* Разбиваем строку "Toyota Camry; BMW X5" на массив и выводим списком */}
                                        {compatible_cars.split('; ').map((car, index) => (
                                            <li key={index} className="text-sm text-gray-700 pl-2">
                                                {car}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    {/* --------------------------------------- */}

                </div>

                {/* Футер с ценой */}
                {/* <div className="p-4 border-t bg-gray-50 flex items-center justify-between shrink-0">
                    <div>
                        <p className="text-xs text-gray-500">Цена за комплект</p>
                        <p className="text-2xl font-bold text-green-600">{formattedPrice} ₽</p>
                    </div>
                    <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg active:scale-95">
                        В корзину
                    </button>
                </div> */}

            </div>
        </div>
    );
};

export default ProductModal;