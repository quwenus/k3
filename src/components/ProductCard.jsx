import { useEffect, useState } from 'react';
import { PLACEHOLDER_IMAGE, getProductImages } from '../utils/productImages';

const ProductCard = ({ product, onOpenModal }) => {
    const [isOrdering, setIsOrdering] = useState(false);
    const [orderMessage, setOrderMessage] = useState("");
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        setImageIndex(0);
    }, [product?.id, product?.images]);

    if (!product) return null;

    const {
        id,
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

    const openMailClientFallback = (phone) => {
        const subject = `Заказ колодок ${sku}`;
        const body = [
            'Здравствуйте!',
            '',
            'Хочу заказать колодки:',
            `K3 номер: ${sku}`,
            `Название: ${title}`,
            `Телефон для связи: ${phone}`,
            '',
            `OEM: ${Array.isArray(oem_numbers) && oem_numbers.length > 0 ? oem_numbers.join(', ') : 'Не указано'}`,
            `Применяемость: ${formattedCompatibility || 'Не указано'}`
        ].join('\n');

        window.location.href = `mailto:info@k3-parts.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleOrderClick = async (e) => {
        e.stopPropagation();

        const customerPhone = window.prompt(`Введите телефон для заказа ${sku}`);

        if (customerPhone === null) {
            return;
        }

        const trimmedPhone = customerPhone.trim();

        if (!trimmedPhone) {
            setOrderMessage("Укажите телефон");
            return;
        }

        setIsOrdering(true);
        setOrderMessage("");

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: id,
                    sku,
                    customer_phone: trimmedPhone,
                    applicability_text: formattedCompatibility,
                    oem_numbers,
                    compatible_cars
                })
            });

            const data = await response.json();

            if (response.status === 503) {
                openMailClientFallback(trimmedPhone);
                setOrderMessage("Откройте письмо для отправки");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Не удалось отправить заявку");
            }

            setOrderMessage("Заявка отправлена");
        } catch (error) {
            console.error("Error sending order request:", error);
            setOrderMessage(error.message);
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 min-w-0
                            shadow-sm hover:shadow-lg transition-all duration-300
                            flex flex-col h-[450px] group cursor-pointer w-full max-w-60"
            onClick={onOpenModal}>
            <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer">
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    className="w-full h-full object-contain p-2"
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

                {formattedCompatibility && (
                    <p className="text-[10px] text-gray-500 mb-2 wrap-break-words line-clamp-3 whitespace-pre-wrap" title={formattedCompatibility}>
                        Применяемость: {formattedCompatibility}
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
                            disabled={isOrdering}
                            onClick={handleOrderClick}
                            className="min-w-0 bg-green-600 text-white px-2 py-1.5 w-full rounded text-xs sm:text-sm hover:bg-green-700 transition-colors shadow-sm active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isOrdering ? "Отправка..." : "Заказать"}
                        </button>
                    </div>
                    {orderMessage && (
                        <p
                            className={`text-[11px] leading-tight ${orderMessage === "Заявка отправлена" ? "text-green-600" : "text-red-600"}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {orderMessage}
                        </p>
                    )}
                    {/* <button
                        onClick={onOpenModal}
                        className="bg-green-600 text-white px-3 py-1.5 w-full rounded text-xs sm:text-sm hover:bg-green-700 transition-colors whitespace-nowrap shadow-sm active:scale-95 cursor-pointer"
                    >
                        Подробнее
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
