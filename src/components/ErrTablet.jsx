import Modal from 'react-modal';
import { useState, useEffect } from 'react';


Modal.setAppElement("#root");

const ErrTablet = () => {
    const [isOpen, setIsOpen] = useState(null);

    const closeModal = () => {
        setIsOpen(false);
        localStorage.setItem('k3_modal_closed', 'true');
    };

    useEffect(() => {
        const isClosed = localStorage.getItem('k3_modal_closed');
        
        if (!isClosed) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    if (isOpen === null) {
        return null;
    }

    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            borderRadius: '1rem',
            border: 'none',
            padding: '0',
            maxWidth: '90%',
            width: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            backgroundColor: '#ffffff',
            overflow: 'visible',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(5px)',
            zIndex: 9999,
        },
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel='Сайт находится в разработке'
            shouldCloseOnOverlayClick={true}
        >
            <div className='p-8 relative'>
                <div className="mb-6 flex justify-center">
                    <div className="bg-yellow-100 p-4 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                </div>

                <h2 className="text-2xl md:text-xl font-bold text-gray-900 mb-4 uppercase text-center">
                    Сайт находится в разработке
                </h2>

                <p className="text-gray-600 text-base md:text-sm mb-8 leading-relaxed text-center">
                    Мы активно работаем над запуском нашего нового сайта.<br />
                    Пожалуйста, зайдите позже, чтобы увидеть полный каталог продукции K3.
                </p>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={closeModal}
                        className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                        Понятно
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ErrTablet;