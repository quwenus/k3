import { useEffect, useState, useRef, useId } from 'react';
import { IoClose } from 'react-icons/io5';

const getPhoneDigits = (value) => {
    const digits = String(value || '').replace(/\D/g, '');

    if (digits.startsWith('8')) {
        return digits.slice(1, 11);
    }

    if (digits.startsWith('7')) {
        return digits.slice(1, 11);
    }

    return digits.slice(0, 10);
};

const formatRussianPhone = (value) => {
    const digits = getPhoneDigits(value);

    if (!digits) return '';

    const parts = [];
    parts.push('+7');

    if (digits.length > 0) {
        parts.push(` (${digits.slice(0, 3)}`);
    }

    if (digits.length >= 3) {
        parts[1] += ')';
    }

    if (digits.length > 3) {
        parts.push(` ${digits.slice(3, 6)}`);
    }

    if (digits.length > 6) {
        parts.push(`-${digits.slice(6, 8)}`);
    }

    if (digits.length > 8) {
        parts.push(`-${digits.slice(8, 10)}`);
    }

    return parts.join('');
};

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const OrderModal = ({ product, isOpen, onClose }) => {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [step, setStep] = useState("contacts");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const formRef = useRef(null);
    const titleId = useId();

    const { id, sku, title } = product || {};

    useEffect(() => {
        if (!isOpen) return undefined;

        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setEmailBody("");
        setStep("contacts");
        setMessage("");
        setIsSubmitting(false);

        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
                return;
            }
            if (event.key === 'Tab') {
                const elements = [...formRef.current.querySelectorAll('button, input, textarea')]
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
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, [isOpen]);

    if (!isOpen || !product) return null;

    const createDefaultEmailBody = ({ name, phone, email }) => [
        'Здравствуйте!',
        '',
        'Хочу заказать колодки:',
        `Имя: ${name}`,
        `Телефон для связи: ${phone}`,
        `Email: ${email}`,
        '',
        `K3 номер: ${sku}`,
        `Название: ${title}`
    ].join('\n');

    const openMailClientFallback = ({ body }) => {
        const subject = `Заказ колодок ${sku}`;

        window.location.href = `mailto:info@k3-parts.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const handleContinue = (event) => {
        event.preventDefault();

        const trimmedName = customerName.trim();
        const phoneDigits = getPhoneDigits(customerPhone);
        const trimmedPhone = formatRussianPhone(customerPhone);
        const trimmedEmail = customerEmail.trim();

        if (!trimmedName) {
            setMessage("Укажите имя");
            return;
        }

        if (phoneDigits.length < 10) {
            setMessage("Укажите телефон");
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            setMessage("Укажите корректный email");
            return;
        }

        setEmailBody(createDefaultEmailBody({
            name: trimmedName,
            phone: trimmedPhone,
            email: trimmedEmail
        }));
        setStep("letter");
        setMessage("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const trimmedName = customerName.trim();
        const trimmedPhone = formatRussianPhone(customerPhone);
        const trimmedEmail = customerEmail.trim();
        const trimmedEmailBody = emailBody.trim();

        if (!isValidEmail(trimmedEmail)) {
            setMessage("Укажите корректный email");
            return;
        }

        if (!trimmedEmailBody) {
            setMessage("Заполните текст письма");
            return;
        }

        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: id,
                    sku,
                    customer_name: trimmedName,
                    customer_phone: trimmedPhone,
                    customer_email: trimmedEmail,
                    customer_message: trimmedEmailBody
                })
            });

            const data = await response.json();

            if (response.status === 503) {
                openMailClientFallback({ body: trimmedEmailBody });
                setMessage("Почта на сайте не настроена. Откройте готовое письмо и нажмите «Отправить».");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Не удалось отправить заявку");
            }

            setStep("sent");
            setMessage("");
        } catch (error) {
            console.error("Error sending order request:", error);
            setMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <form
                ref={formRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onSubmit={step === "letter" ? handleSubmit : handleContinue}
                className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h2 id={titleId} className="text-xl font-bold text-gray-900">Оформить заказ</h2>
                        <p className="mt-1 text-sm text-gray-500">{sku} · {title}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                        aria-label="Закрыть"
                    >
                        <IoClose size={22} />
                    </button>
                </div>

                {step === "sent" ? (
                    <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                        <p className="text-lg font-bold text-green-700">Письмо отправлено</p>
                        <p className="mt-1 text-sm text-green-700">Спасибо, мы свяжемся с вами в ближайшее время.</p>
                    </div>
                ) : (
                    <>
                        {step === "contacts" && (
                            <div className="space-y-3">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Имя</span>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(event) => setCustomerName(event.target.value)}
                                        autoFocus
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                        placeholder="Как к вам обращаться"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Телефон</span>
                                    <input
                                        type="tel"
                                        value={customerPhone}
                                        onChange={(event) => setCustomerPhone(formatRussianPhone(event.target.value))}
                                        inputMode="tel"
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                        placeholder="+7 (___) ___-__-__"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Email</span>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(event) => setCustomerEmail(event.target.value)}
                                        inputMode="email"
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                        placeholder="name@example.ru"
                                    />
                                </label>
                            </div>
                        )}

                        {step === "letter" && (
                            <div className="space-y-3">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Ваш email</span>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(event) => setCustomerEmail(event.target.value)}
                                        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-gray-700">Письмо</span>
                                    <textarea
                                        value={emailBody}
                                        onChange={(event) => setEmailBody(event.target.value)}
                                        rows={10}
                                        className="min-h-52 w-full resize-y rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-500/20"
                                    />
                                </label>
                            </div>
                        )}
                    </>
                )}

                {message && (
                    <p className="mt-3 text-sm text-red-600">
                        {message}
                    </p>
                )}

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        {step === "sent" ? "Закрыть" : "Отмена"}
                    </button>
                    {step === "letter" && (
                        <button
                            type="button"
                            onClick={() => {
                                setStep("contacts");
                                setMessage("");
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                        >
                            Назад
                        </button>
                    )}
                    {step !== "sent" && (
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {step === "contacts" ? "Продолжить" : (isSubmitting ? "Отправка..." : "Отправить")}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default OrderModal;
