import { Link } from 'react-router-dom';

const ProductCard = ({ product, onOpenModal }) => {
    if (!product) return null;

    const {
        sku,
        title,
        oem_numbers,
        price,
        images
    } = product;

    // Логика выбора изображения
    let imageUrl = '/assets/img/placeholder.png';

    if (images && Array.isArray(images) && images.length > 0) {
        const mainImage = images.find(img => img.is_main);
        // Если есть главное - берем его, иначе первое из списка
        imageUrl = mainImage ? mainImage.file_path : images[0].file_path;
    }

    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price || 0);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 
                            shadow-sm hover:shadow-lg transition-all duration-300 
                            flex flex-col h-full group cursor-pointer max-w-60"
            onClick={onOpenModal}>
            <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    loading="lazy"
                    className="w-full h-full object-cover " 
                    onError={(e) => {
                        // Если картинка не загрузилась, ставим заглушку
                        e.target.src = '/assets/img/placeholder.png';
                        e.target.onerror = null; // Защита от бесконечного цикла
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
                
                {oem_numbers && (
                    <p className="text-[10px] text-gray-500 mb-2 truncate" title={oem_numbers}>
                        OEM: {oem_numbers}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                    {/* <span className="text-green-600 font-bold text-2xl whitespace-nowrap">
                        {formattedPrice} ₽
                    </span> */}
                    
                    <button 
                        onClick={onOpenModal}
                        className="bg-green-600 text-white px-3 py-1.5 w-full rounded text-xs sm:text-sm hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm active:scale-95 cursor-pointer"
                    >
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;