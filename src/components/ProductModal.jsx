import { useState, useEffect } from 'react';
import { IoClose, IoChevronBack, IoChevronDown, IoChevronForward, IoChevronUp } from 'react-icons/io5';
import { PLACEHOLDER_IMAGE, getProductImages } from '../utils/productImages';


const ProductModal = ({ product, onClose }) => {
    const [compatibilityState, setCompatibilityState] = useState({ sku: null, isOpen: false });
    const [imageState, setImageState] = useState({ sku: null, index: 0 });

    const {
        sku,
        title,
        oem_numbers,
        price,
        compatible_cars,
        images
    } = product || {};

    const sliderImages = getProductImages(images);
    const activeImageIndex = imageState.sku === sku ? imageState.index : 0;
    const isCompatibilityOpen = compatibilityState.sku === sku ? compatibilityState.isOpen : false;
    const currentImage = sliderImages[activeImageIndex] || sliderImages[0];
    const hasMultipleImages = sliderImages.length > 1;

    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price || 0);

    const showPreviousImage = () => {
        setImageState((currentState) => {
            const currentIndex = currentState.sku === sku ? currentState.index : 0;

            return {
                sku,
                index: currentIndex === 0 ? sliderImages.length - 1 : currentIndex - 1
            };
        });
    };

    const showNextImage = () => {
        setImageState((currentState) => {
            const currentIndex = currentState.sku === sku ? currentState.index : 0;

            return {
                sku,
                index: currentIndex === sliderImages.length - 1 ? 0 : currentIndex + 1
            };
        });
    };

    // Закрытие по Escape
    useEffect(() => {
        if (!product) return undefined;

        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, product]);

    if (!product) return null;

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

                    {/* Изображения */}
                    <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 shadow-inner">
                        <img
                            src={currentImage.file_path}
                            alt={title}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                if (activeImageIndex < sliderImages.length - 1) {
                                    showNextImage();
                                    return;
                                }

                                e.target.src = PLACEHOLDER_IMAGE;
                                e.target.onerror = null;
                            }}
                        />

                        {hasMultipleImages && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Предыдущее изображение"
                                    onClick={showPreviousImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow hover:bg-white transition-colors"
                                >
                                    <IoChevronBack size={22} />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Следующее изображение"
                                    onClick={showNextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-800 shadow hover:bg-white transition-colors"
                                >
                                    <IoChevronForward size={22} />
                                </button>
                                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1">
                                    {sliderImages.map((image, index) => (
                                        <button
                                            key={image.id || `${image.file_path}-${index}`}
                                            type="button"
                                            aria-label={`Изображение ${index + 1}`}
                                            onClick={() => setImageState({ sku, index })}
                                            className={`h-2 w-2 rounded-full transition-colors ${index === activeImageIndex ? 'bg-white' : 'bg-white/45 hover:bg-white/75'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
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
                                {Array.isArray(oem_numbers)
                                    ? oem_numbers.join(', ')
                                    : oem_numbers}
                            </p>
                        </div>
                    )}

                    {/* --- ВЫПАДАЮЩИЙ СПИСОК ПРИМЕНЯЕМОСТИ --- */}
                    {compatible_cars && (
                        <div className="mb-6 border border-blue-100 rounded-lg overflow-hidden ">
                            {/* Кнопка-заголовок */}
                            <button
                                onClick={() => setCompatibilityState({ sku, isOpen: !isCompatibilityOpen })}
                                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 transition-colors text-left"
                            >
                                <span className="text-sm font-semibold text-blue-900">
                                    Применяемость 
                                </span>
                                {isCompatibilityOpen ? <IoChevronUp /> : <IoChevronDown />}
                            </button>

                            {/* Раскрывающийся контент */}
                            {isCompatibilityOpen && (
                                <div className="p-3 bg-white border-t border-blue-100 animate-fade-in-down cursor-pointer">
                                    <ul className="list-disc list-inside space-y-1">
                                        {/* Разбиваем строку "Toyota Camry; BMW X5" на массив и выводим списком */}
                                        {compatible_cars.map((car, index) => (
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
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between shrink-0">
                    <div>
                        <p className="text-xs text-gray-500">Цена за комплект</p>
                        <p className="text-2xl font-bold text-green-600">{formattedPrice} ₽</p>
                    </div>
                    {/* <button className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg active:scale-95">
                        В корзину
                    </button> */}
                </div>

            </div>
        </div>
    );
};

export default ProductModal;
