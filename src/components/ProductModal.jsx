import { useState, useEffect, useRef, useId } from 'react';
import { IoClose, IoChevronBack, IoChevronForward, IoSearchOutline, IoArrowForward } from 'react-icons/io5';
import FormattedApplicability from './FormattedApplicability';
import { filterApplicability } from '../utils/applicability.js';
import OrderModal from './OrderModal';
import { PLACEHOLDER_IMAGE, getProductImages } from '../utils/productImages';

const ProductModal = ({ product, onClose }) => {
    const [activeTab, setActiveTab] = useState('compatibility');
    const [modelQuery, setModelQuery] = useState('');
    const [imageIndex, setImageIndex] = useState(0);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const dialogRef = useRef(null);
    const closeRef = useRef(null);
    const orderButtonRef = useRef(null);
    const panelId = useId();
    const titleId = useId();
    const { sku, title, oem_numbers, price, applicability_text, compatible_cars, images } = product || {};
    const sliderImages = getProductImages(images);
    const currentImage = sliderImages[imageIndex] || sliderImages[0];
    const compatibleCars = Array.isArray(compatible_cars) ? compatible_cars.filter(Boolean) : [];
    const applicability = String(applicability_text || '').trim() || compatibleCars.join('\n');
    const filteredApplicability = filterApplicability(applicability, modelQuery);
    const oemNumbers = [...new Set((Array.isArray(oem_numbers) ? oem_numbers : [oem_numbers])
        .flatMap(value => String(value || '').split(/[,;\r\n\t]+/))
        .map(value => value.trim()).filter(Boolean))];
    const formattedPrice = new Intl.NumberFormat('ru-RU').format(price || 0);
    const selectedTab = applicability ? activeTab : 'oem';

    useEffect(() => {
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        closeRef.current?.focus();
        return () => {
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, []);

    useEffect(() => {
        if (isOrderModalOpen) return undefined;
        const handleKey = event => {
            if (event.key === 'Escape') onClose();
            if (event.key !== 'Tab') return;
            const elements = [...dialogRef.current.querySelectorAll('button, input, [tabindex="0"]')]
                .filter(element => !element.disabled && element.getClientRects().length);
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isOrderModalOpen, onClose]);

    if (!product) return null;
    const moveImage = direction => setImageIndex(index => (index + direction + sliderImages.length) % sliderImages.length);
    const changeTab = tab => {
        setActiveTab(tab);
        dialogRef.current?.querySelector('[data-product-scroll]')?.scrollTo({ top: 0 });
    };
    const handleImageError = event => {
        if (event.currentTarget.getAttribute('src') !== PLACEHOLDER_IMAGE) event.currentTarget.src = PLACEHOLDER_IMAGE;
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/65 p-2 backdrop-blur-sm sm:p-5" onClick={onClose}>
                <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId}
                    className="flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl"
                    onClick={event => event.stopPropagation()}>
                    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:px-7 sm:py-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="h-6 w-1 shrink-0 rounded-full bg-green-600" />
                            <span className="text-sm text-gray-500">Карточка товара</span>
                            <span className="truncate text-sm font-semibold text-gray-900">{sku}</span>
                        </div>
                        <button ref={closeRef} type="button" onClick={onClose} aria-label="Закрыть карточку"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-green-600">
                            <IoClose size={22} />
                        </button>
                    </header>

                    <div data-product-scroll className="min-h-0 overflow-y-auto overscroll-contain">
                        <div className="grid items-start gap-6 p-4 sm:gap-8 sm:p-7 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
                            <div className="md:sticky md:top-7">
                                <div className="relative flex h-56 items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white sm:h-72 md:aspect-square md:h-auto">
                                    <img src={currentImage.file_path} alt={`${title}, фото ${imageIndex + 1}`}
                                        className="h-full w-full object-contain p-4 sm:p-6" onError={handleImageError} />
                                    {sliderImages.length > 1 && (
                                        <>
                                            <button type="button" aria-label="Предыдущее фото" onClick={() => moveImage(-1)}
                                                className="absolute left-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm hover:bg-gray-100">
                                                <IoChevronBack size={20} />
                                            </button>
                                            <button type="button" aria-label="Следующее фото" onClick={() => moveImage(1)}
                                                className="absolute right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white/95 text-gray-700 shadow-sm hover:bg-gray-100">
                                                <IoChevronForward size={20} />
                                            </button>
                                            <span className="absolute bottom-3 right-3 rounded-full bg-gray-100 px-2.5 py-1 text-xs tabular-nums text-gray-500">{imageIndex + 1} / {sliderImages.length}</span>
                                        </>
                                    )}
                                </div>
                                {sliderImages.length > 1 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Фотографии товара">
                                        {sliderImages.map((image, index) => (
                                            <button key={image.id || `${image.file_path}-${index}`} type="button"
                                                aria-label={`Показать фото ${index + 1}`} aria-pressed={index === imageIndex}
                                                onClick={() => setImageIndex(index)}
                                                className={`h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-1 transition-colors ${index === imageIndex ? 'border-green-600' : 'border-gray-100 hover:border-gray-300'}`}>
                                                <img src={image.file_path} alt="" className="h-full w-full object-contain" onError={handleImageError} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-widest text-green-700">Артикул {sku}</p>
                                <h2 id={titleId} className="mt-2 text-2xl leading-tight font-bold text-gray-950 wrap-break-word sm:text-3xl">{title}</h2>
                                <p className="mt-3 text-sm text-gray-500">Тип колодок <span className="ml-2 font-medium text-gray-800">Дисковые</span></p>

                                <div role="tablist" aria-label="Информация о товаре" className="mt-6 flex gap-5 border-b border-gray-200">
                                    {[
                                        ...(applicability ? [{ id: 'compatibility', label: 'Применяемость' }] : []),
                                        { id: 'oem', label: `OEM / аналоги${oemNumbers.length ? ` · ${oemNumbers.length}` : ''}` },
                                    ].map(tab => (
                                        <button key={tab.id} id={`${panelId}-${tab.id}`} type="button" role="tab"
                                            aria-selected={selectedTab === tab.id} aria-controls={`${panelId}-content`}
                                            onClick={() => changeTab(tab.id)}
                                            className={`-mb-px cursor-pointer border-b-2 pb-3 text-sm font-semibold transition-colors ${selectedTab === tab.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-900'}`}>
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div id={`${panelId}-content`} role="tabpanel" aria-labelledby={`${panelId}-${selectedTab}`} className="pt-4">
                                    {selectedTab === 'compatibility' ? (
                                        <>
                                            <label className="relative mb-4 flex items-center">
                                                <IoSearchOutline size={18} className="pointer-events-none absolute left-3 text-gray-400" />
                                                <input type="search" value={modelQuery} onChange={event => setModelQuery(event.target.value)}
                                                    aria-label="Поиск в применяемости" placeholder="Найти марку или модель"
                                                    className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pr-3 pl-10 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 focus:bg-white focus:ring-2 focus:ring-green-600/10" />
                                            </label>
                                            {filteredApplicability ? (
                                                <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 [&_strong]:inline-block [&_strong]:pt-2 [&_strong]:pb-1 [&_div:first-child_strong]:pt-0">
                                                    <FormattedApplicability value={filteredApplicability} />
                                                </div>
                                            ) : (
                                                <div role="status" className="rounded-xl bg-gray-50 px-4 py-8 text-center">
                                                    <p className="text-sm font-medium text-gray-900">Совпадений не найдено</p>
                                                    <p className="mt-1 text-sm text-gray-500">Попробуйте другое название марки или модели.</p>
                                                    <button type="button" onClick={() => setModelQuery('')} className="mt-3 cursor-pointer text-sm font-semibold text-green-700 hover:text-green-800">Сбросить поиск</button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <p className="mb-4 text-sm leading-relaxed text-gray-500">Оригинальные номера и артикулы аналогов для сверки.</p>
                                            {oemNumbers.length ? (
                                                <ul className="flex flex-wrap gap-2" aria-label="OEM и аналоги">
                                                    {oemNumbers.map(number => <li key={number} className="max-w-full rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 font-mono text-xs leading-relaxed text-gray-700 wrap-break-word">{number}</li>)}
                                                </ul>
                                            ) : <p className="text-sm text-gray-500">OEM-номера пока не указаны.</p>}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-gray-100 bg-white px-4 py-4 sm:px-7">
                        <div>
                            <p className="text-xs text-gray-500">Цена за комплект</p>
                            <p className="mt-0.5 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">{formattedPrice} <span className="text-lg font-medium text-gray-500">₽</span></p>
                        </div>
                        <button ref={orderButtonRef} type="button" onClick={() => setIsOrderModalOpen(true)}
                            className="flex h-12 cursor-pointer items-center justify-center gap-4 rounded-xl bg-green-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:min-w-48">
                            Заказать <IoArrowForward size={18} />
                        </button>
                    </footer>
                </section>
            </div>
            <OrderModal product={product} isOpen={isOrderModalOpen} onClose={() => {
                setIsOrderModalOpen(false);
                orderButtonRef.current?.focus();
            }} />
        </>
    );
};

export default ProductModal;
