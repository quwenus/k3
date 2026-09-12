import { useEffect, useState } from 'react';
import { stripApplicabilityFormatting } from './FormattedApplicability';
import OrderModal from './OrderModal';
import { PLACEHOLDER_IMAGE, getProductImages } from '../utils/productImages';

const ProductCard = ({ product, onOpenModal }) => {
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        setImageIndex(0);
    }, [product?.id, product?.images]);

    if (!product) return null;

    const {
        sku,
        title,
        oem_numbers,
        applicability_text,
        compatible_cars,
        images
    } = product;

    const productImages = getProductImages(images);
    const imageUrl = productImages[Math.min(imageIndex, productImages.length - 1)]?.file_path || PLACEHOLDER_IMAGE;
    const formattedOemNumbers = Array.isArray(oem_numbers)
        ? oem_numbers.join(', ')
        : oem_numbers;
    const manualApplicability = String(applicability_text || '').trim();
    const formattedCompatibility = manualApplicability || (
        Array.isArray(compatible_cars) && compatible_cars.length > 0
            ? compatible_cars.join(', ')
            : ''
    );
    const plainCompatibility = stripApplicabilityFormatting(formattedCompatibility);

    return (
        <>
        <div className="bg-white border border-gray-200 rounded-2xl p-3 min-w-0
                            shadow-sm hover:shadow-lg transition-all duration-300
                            flex flex-col h-full min-h-[540px] group cursor-pointer w-full"
            onClick={onOpenModal}>
            <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-[14px] bg-white cursor-pointer">
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    className="block h-full w-full rounded-[14px] object-contain"
                    onError={(e) => {
                        if (imageIndex < productImages.length - 1) {
                            setImageIndex(currentIndex => currentIndex + 1);
                            return;
                        }

                        e.target.src = PLACEHOLDER_IMAGE;
                        e.target.onerror = null;
                    }}
                />
            </div>

            <div className="flex flex-col grow">
                <div className="mb-2">
                    <span className="inline-block text-xl font-bold text-green-600 uppercase tracking-wider mb-1">
                        {sku}
                    </span>


                    <h3 className="font-bold text-sm sm:text-base text-gray-800 leading-tight wrap-break-words line-clamp-2">
                        {title}
                    </h3>
                </div>

                {formattedOemNumbers && (
                    <p className="text-[10px] text-gray-500 mb-2 wrap-break-words line-clamp-2 whitespace-pre-wrap" title={formattedOemNumbers}>
                        OEM: {formattedOemNumbers}
                    </p>
                )}

                {plainCompatibility && (
                    <p className="text-[10px] text-gray-500 mb-2 wrap-break-words line-clamp-3 whitespace-pre-wrap" title={plainCompatibility}>
                        Применяемость: {plainCompatibility}
                    </p>
                )}

                <div className="mt-auto flex flex-col gap-2 pt-2 border-t border-gray-100">
                    {/* <span className="text-green-600 font-bold text-2xl whitespace-nowrap">
                        {formattedPrice} ₽
                    </span> */}

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onOpenModal();
                            }}
                            className="min-w-0 bg-gray-700 text-white px-2 py-1.5 w-full rounded text-xs sm:text-sm hover:bg-gray-800 transition-colors shadow-sm active:scale-95 cursor-pointer"
                        >
                            Подробнее
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOrderModalOpen(true);
                            }}
                            className="min-w-0 bg-green-600 text-white px-2 py-1.5 w-full rounded text-xs sm:text-sm hover:bg-green-700 transition-colors shadow-sm active:scale-95 cursor-pointer"
                        >
                            Заказать
                        </button>
                    </div>
                    {/* <button
                        onClick={onOpenModal}
                        className="bg-green-600 text-white px-3 py-1.5 w-full rounded text-xs sm:text-sm hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm active:scale-95 cursor-pointer"
                    >
                        Подробнее
                    </button> */}
                </div>
            </div>
        </div>
        <OrderModal
            product={product}
            isOpen={isOrderModalOpen}
            onClose={() => setIsOrderModalOpen(false)}
        />
        </>
    );
};

export default ProductCard;
