import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PLACEHOLDER_IMAGE, getProductImages } from "../utils/productImages";

const ADMIN_TOKEN_KEY = "k3AdminToken";

const parseResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return response.json();
    }

    const text = await response.text();

    return {
        message: text || `HTTP error ${response.status}`
    };
};

const getAdminAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem(ADMIN_TOKEN_KEY) || ""}`
});

const createEmptyProductForm = () => ({
    k3_number: "",
    title: "",
    price: "",
    category_id: "",
    oem_numbers: "",
    applicability_text: "",
    compatible_model_ids: [],
    existing_images: [],
    deleted_existing_image_ids: [],
    images: []
});

export default function AdminPanel() {
    const navigate = useNavigate();

    // Состояние для переключения вкладок в админке
    const [activeTab, setActiveTab] = useState("products");

    // Состояние для списка категорий
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingKey, setDeletingKey] = useState("");
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [editingProductId, setEditingProductId] = useState(null);

    const fetchDictionaries = async () => {
        try {
            const [productsResponse, categoriesResponse, brandsResponse, modelsResponse] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories"),
                fetch("/api/brands"),
                fetch("/api/models")
            ]);

            if (!productsResponse.ok || !categoriesResponse.ok || !brandsResponse.ok || !modelsResponse.ok) {
                throw new Error("Не удалось загрузить справочники");
            }

            const [productsData, categoriesData, brandsData, modelsData] = await Promise.all([
                productsResponse.json(),
                categoriesResponse.json(),
                brandsResponse.json(),
                modelsResponse.json()
            ]);

            setProducts(productsData.data || []);
            setCategories(categoriesData);
            setBrands(brandsData);
            setModels(modelsData);
        } catch (error) {
            console.error("Error fetching dictionaries:", error);
            setMessage("Ошибка загрузки справочников");
        }
    };

    useEffect(() => {
        const verifyAdminSession = async () => {
            const token = localStorage.getItem(ADMIN_TOKEN_KEY);

            if (!token) {
                navigate("/admin/login", { replace: true });
                return;
            }

            try {
                const response = await fetch("/api/admin/session", {
                    headers: getAdminAuthHeaders()
                });

                if (!response.ok) {
                    throw new Error("Нужно войти заново");
                }

                await fetchDictionaries();
                setIsCheckingAuth(false);
            } catch (error) {
                console.error("Admin session check failed:", error);
                localStorage.removeItem(ADMIN_TOKEN_KEY);
                navigate("/admin/login", { replace: true });
            }
        };

        verifyAdminSession();
    }, [navigate]);

    const handleAuthError = (response, data) => {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem(ADMIN_TOKEN_KEY);
            navigate("/admin/login", { replace: true });
            throw new Error(data.message || "Нужно войти заново");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        navigate("/admin/login", { replace: true });
    };

    const handleDelete = async (entityName, url, successMessage, warning = "", itemKey = "") => {
        const confirmationText = [`Удалить ${entityName}?`, warning].filter(Boolean).join("\n");
        const confirmed = window.confirm(confirmationText);

        if (!confirmed) {
            return;
        }

        setIsSubmitting(true);
        setDeletingKey(itemKey);
        setMessage("");

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: getAdminAuthHeaders()
            });

            const data = await parseResponse(response);
            handleAuthError(response, data);

            if (!response.ok) {
                throw new Error(data.message || "Ошибка удаления");
            }

            await fetchDictionaries();
            setMessage(successMessage);
        } catch (error) {
            console.error("Error deleting item:", error);
            setMessage(error.message);
        } finally {
            setIsSubmitting(false);
            setDeletingKey("");
        }
    };

    // 1. Состояние для формы добавления ТОВАРА
    const [productForm, setProductForm] = useState(createEmptyProductForm);

    // 2. Состояния для простых справочников
    const [categoryForm, setCategoryForm] = useState({ name: "", slug: "" });
    const [brandForm, setBrandForm] = useState({ name: "" });
    const [modelForm, setModelForm] = useState({ brand_id: "", name: "" });

    // --- Обработчики для формы ТОВАРА ---
    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleModelCompatibilityChange = (modelId) => {
        setProductForm(prev => {
            const exists = prev.compatible_model_ids.includes(modelId);

            return {
                ...prev,
                compatible_model_ids: exists
                    ? prev.compatible_model_ids.filter(id => id !== modelId)
                    : [...prev.compatible_model_ids, modelId]
            };
        });
    };

    const resetProductForm = () => {
        setProductForm(createEmptyProductForm());
        setEditingProductId(null);
    };

    const handleEditProduct = (product) => {
        const existingImages = Array.isArray(product.images)
            ? getProductImages(product.images).filter(image => image.file_path !== PLACEHOLDER_IMAGE)
            : [];

        setProductForm({
            k3_number: product.sku || "",
            title: product.title || "",
            price: product.price ?? "",
            category_id: product.category_id ? String(product.category_id) : "",
            oem_numbers: Array.isArray(product.oem_numbers) && product.oem_numbers.length > 0
                ? product.oem_numbers.join("; ")
                : "",
            applicability_text: product.applicability_text || "",
            compatible_model_ids: Array.isArray(product.compatible_model_ids)
                ? product.compatible_model_ids.map(id => String(id))
                : [],
            existing_images: existingImages,
            deleted_existing_image_ids: [],
            images: []
        });
        setEditingProductId(product.id);
        setMessage(`Редактирование товара ${product.sku}`);
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).map((file, index) => ({
                file: file,
                is_main: index === 0,
                sort_order: index
            }));
            setProductForm(prev => ({ ...prev, images: [...prev.images, ...filesArray] }));
        }
    };

    const getVisibleExistingImages = () => productForm.existing_images.filter(
        image => !productForm.deleted_existing_image_ids.includes(image.id)
    );

    const handleSetMainExistingImage = (imageId) => {
        setProductForm(prev => ({
            ...prev,
            existing_images: prev.existing_images.map((image) => ({
                ...image,
                is_main: image.id === imageId
            }))
        }));
    };

    const handleDeleteExistingImage = (imageId) => {
        setProductForm(prev => {
            const deletedIds = prev.deleted_existing_image_ids.includes(imageId)
                ? prev.deleted_existing_image_ids
                : [...prev.deleted_existing_image_ids, imageId];
            const visibleImages = prev.existing_images.filter(image => !deletedIds.includes(image.id));
            const hasMainImage = visibleImages.some(image => image.is_main);

            return {
                ...prev,
                deleted_existing_image_ids: deletedIds,
                existing_images: hasMainImage || visibleImages.length === 0
                    ? prev.existing_images
                    : prev.existing_images.map(image => ({
                        ...image,
                        is_main: image.id === visibleImages[0].id
                    }))
            };
        });
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        const formDataToSend = new FormData();
        const oemNumbers = productForm.oem_numbers
            .split(";")
            .map(oem => oem.trim())
            .filter(Boolean);

        formDataToSend.append("k3_number", productForm.k3_number);
        formDataToSend.append("title", productForm.title);
        formDataToSend.append("price", productForm.price);
        formDataToSend.append("category_id", productForm.category_id);
        formDataToSend.append("applicability_text", productForm.applicability_text);
        formDataToSend.append("oem_numbers", JSON.stringify(oemNumbers));
        formDataToSend.append("compatible_model_ids", JSON.stringify(productForm.compatible_model_ids));

        if (editingProductId) {
            const visibleExistingImages = getVisibleExistingImages();
            const mainImageId = visibleExistingImages.find(image => image.is_main)?.id || visibleExistingImages[0]?.id;

            formDataToSend.append("existing_images", JSON.stringify([
                ...visibleExistingImages.map((image, index) => ({
                    id: image.id,
                    is_main: image.id === mainImageId,
                    sort_order: index
                })),
                ...productForm.deleted_existing_image_ids.map(id => ({
                    id,
                    delete: true
                }))
            ]));
        }

        productForm.images.forEach((imgObj) => {
            formDataToSend.append("images", imgObj.file);
        });

        try {
            const response = await fetch(editingProductId ? `/api/products/${editingProductId}` : "/api/products", {
                method: editingProductId ? "PUT" : "POST",
                headers: getAdminAuthHeaders(),
                body: formDataToSend
            });

            const data = await parseResponse(response);
            handleAuthError(response, data);

            if (!response.ok) {
                throw new Error(data.message || "Ошибка сохранения товара");
            }

            resetProductForm();
            await fetchDictionaries();
            setMessage(editingProductId ? "Товар обновлен" : "Товар сохранен");
        } catch (error) {
            console.error("Error saving product:", error);
            setMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAdminAuthHeaders()
                },
                body: JSON.stringify(categoryForm)
            });

            const data = await parseResponse(response);
            handleAuthError(response, data);

            if (!response.ok) {
                throw new Error(data.message || "Ошибка сохранения категории");
            }

            setCategoryForm({ name: "", slug: "" });
            await fetchDictionaries();
            setMessage("Категория сохранена");
        } catch (error) {
            console.error("Error saving category:", error);
            setMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBrandSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/brands", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAdminAuthHeaders()
                },
                body: JSON.stringify(brandForm)
            });

            const data = await parseResponse(response);
            handleAuthError(response, data);

            if (!response.ok) {
                throw new Error(data.message || "Ошибка сохранения бренда");
            }

            setBrandForm({ name: "" });
            await fetchDictionaries();
            setMessage("Бренд сохранен");
        } catch (error) {
            console.error("Error saving brand:", error);
            setMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleModelSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        try {
            const response = await fetch("/api/models", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...getAdminAuthHeaders()
                },
                body: JSON.stringify(modelForm)
            });

            const data = await parseResponse(response);
            handleAuthError(response, data);

            if (!response.ok) {
                throw new Error(data.message || "Ошибка сохранения модели");
            }

            setModelForm({ brand_id: "", name: "" });
            await fetchDictionaries();
            setMessage("Модель сохранена");
        } catch (error) {
            console.error("Error saving model:", error);
            setMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isCheckingAuth) {
        return (
            <div className="max-w-4xl mx-auto p-6 font-sans text-gray-800">
                Проверка доступа...
            </div>
        );
    }

    const visibleExistingImages = getVisibleExistingImages();

    return (
        <div className="max-w-4xl mx-auto p-6 font-sans text-gray-800">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="self-start rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:self-auto"
                >
                    Выйти
                </button>
            </div>

            {message && (
                <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm">
                    {message}
                </div>
            )}

            {/* Навигация по вкладкам */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "products"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    Товары
                </button>
                <button
                    onClick={() => setActiveTab("categories")}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "categories"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    Категории
                </button>
                <button
                    onClick={() => setActiveTab("auto")}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${activeTab === "auto"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    Автомобили (Бренды/Модели)
                </button>
            </div>

            {/* ВКЛАДКА 1: ДОБАВЛЕНИЕ ТОВАРА */}
            {activeTab === "products" && (
                <div className="flex flex-col gap-6">
                    <form onSubmit={handleProductSubmit} className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingProductId ? "Редактировать товар" : "Добавить новый товар"}
                            </h2>
                            {editingProductId && (
                                <button
                                    type="button"
                                    onClick={resetProductForm}
                                    className="self-start rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 sm:self-auto"
                                >
                                    Отменить редактирование
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Номер K3:</label>
                            <input type="text" name="k3_number" value={productForm.k3_number} onChange={handleProductChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Название товара:</label>
                            <input type="text" name="title" value={productForm.title} onChange={handleProductChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Цена:</label>
                                <input type="number" step="0.01" name="price" value={productForm.price} onChange={handleProductChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Категория:
                                </label>
                                <select
                                    name="category_id"
                                    value={productForm.category_id}
                                    onChange={handleProductChange}
                                    required
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer text-gray-800"
                                >
                                    {/* Дефолтный пустой вариант, чтобы сработал валидатор required */}
                                    <option value="">Выберите категорию</option>

                                    {/* Динамический рендеринг массива категорий из стейта */}
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <div className="mb-1 flex items-center justify-between gap-3">
                                <label className="block text-sm font-medium text-gray-700">OEM Номера:</label>
                                <span className="shrink-0 text-xs text-gray-500">
                                    {productForm.oem_numbers.length.toLocaleString("ru-RU")} знаков
                                </span>
                            </div>
                            <textarea
                                name="oem_numbers"
                                value={productForm.oem_numbers}
                                onChange={handleProductChange}
                                required
                                rows={5}
                                placeholder="8450102948; 1118-3501080"
                                className="w-full p-2.5 text-sm leading-relaxed border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <p className="mt-1 text-sm text-gray-500">Разделяйте номера точкой с запятой.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Применяемость:</label>
                            <textarea
                                name="applicability_text"
                                value={productForm.applicability_text}
                                onChange={handleProductChange}
                                rows={10}
                                placeholder={"KM1191\nAJP, SPR 240 X, объем 240куб.см, 22-24г.в., перед\nAJP, SPR 310 R, объем 310куб.см, 22-24г.в., перед"}
                                className="w-full p-2.5 text-sm leading-relaxed border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <p className="mt-1 text-sm text-gray-500">Можно вставлять большой многострочный текст из Word. Переносы строк сохраняются.</p>
                        </div>

                        {/* Загрузка картинок */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editingProductId ? "Новые изображения товара:" : "Изображения товара:"}
                            </label>
                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
                            {productForm.images.length > 0 && <p className="text-sm text-gray-600 mt-1">Выбрано файлов: {productForm.images.length}</p>}
                            {editingProductId && productForm.images.length === 0 && (
                                <p className="text-sm text-gray-500 mt-1">Если не выбрать файлы, текущие изображения останутся без изменений.</p>
                            )}
                            {editingProductId && visibleExistingImages.length > 0 && (
                                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {visibleExistingImages.map((image) => (
                                        <div key={image.id} className="rounded-lg border border-gray-200 bg-white p-3">
                                            <div className="mb-3 aspect-square overflow-hidden rounded-md bg-gray-100">
                                                <img
                                                    src={image.file_path}
                                                    alt="Изображение товара"
                                                    className="h-full w-full object-contain p-2"
                                                    onError={(e) => {
                                                        e.target.src = PLACEHOLDER_IMAGE;
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            </div>
                                            <p className="mb-2 truncate text-xs text-gray-500" title={image.file_path}>
                                                {image.file_path}
                                            </p>
                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                <button
                                                    type="button"
                                                    onClick={() => handleSetMainExistingImage(image.id)}
                                                    className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${image.is_main
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                        }`}
                                                >
                                                    {image.is_main ? "Титульная" : "Сделать титульной"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingImage(image.id)}
                                                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Совместимость с моделями:</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
                                {models.length === 0 && (
                                    <p className="text-sm text-gray-500">Сначала добавьте бренд и модель</p>
                                )}
                                {models.map((model) => (
                                    <label key={model.id} className="flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={productForm.compatible_model_ids.includes(String(model.id))}
                                            onChange={() => handleModelCompatibilityChange(String(model.id))}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        {model.brand_name} {model.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-gray-400">
                            {isSubmitting ? "Сохранение..." : editingProductId ? "Обновить товар" : "Сохранить товар в БД"}
                        </button>
                    </form>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Товары</h2>
                        <div className="flex flex-col gap-2">
                            {products.length === 0 && (
                                <p className="text-sm text-gray-500">Товары пока не добавлены</p>
                            )}
                            {products.map((product) => (
                                <div key={product.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{product.sku} — {product.title}</p>
                                        <p className="text-sm text-gray-500">{product.category_name}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => handleEditProduct(product)}
                                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                                        >
                                            Редактировать
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => handleDelete(
                                                `товар ${product.sku}`,
                                                `/api/products/${product.id}`,
                                                "Товар удален",
                                                "Связанные OEM номера, применяемость и изображения тоже будут удалены.",
                                                `product-${product.id}`
                                            )}
                                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                                        >
                                            {deletingKey === `product-${product.id}` ? "Удаление..." : "Удалить"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ВКЛАДКА 2: КАТЕГОРИИ */}
            {activeTab === "categories" && (
                <div className="flex flex-col gap-6">
                    <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Создать категорию</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Название:</label>
                            <input type="text" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Слаг (Slug):</label>
                            <input type="text" value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full mt-2 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-gray-400">
                            {isSubmitting ? "Сохранение..." : "Создать категорию"}
                        </button>
                    </form>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Удалить категорию</h2>
                        <div className="flex flex-col gap-2">
                            {categories.length === 0 && (
                                <p className="text-sm text-gray-500">Категории пока не добавлены</p>
                            )}
                            {categories.map((category) => (
                                <div key={category.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{category.name}</p>
                                        <p className="text-sm text-gray-500">{category.slug}</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled={isSubmitting}
                                        onClick={() => handleDelete(
                                            `категорию ${category.name}`,
                                            `/api/categories/${category.id}`,
                                            "Категория удалена",
                                            "Все товары этой категории и их связи тоже будут удалены.",
                                            `category-${category.id}`
                                        )}
                                        className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                                    >
                                        {deletingKey === `category-${category.id}` ? "Удаление..." : "Удалить"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ВКЛАДКА 3: АВТОМОБИЛИ */}
            {activeTab === "auto" && (
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Форма бренда */}
                        <form onSubmit={handleBrandSubmit} className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Добавить Бренд</h3>
                            <input type="text" placeholder="Например: BMW" value={brandForm.name} onChange={e => setBrandForm({ name: e.target.value })} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm mt-auto disabled:cursor-not-allowed disabled:bg-gray-400">
                                {isSubmitting ? "Сохранение..." : "Сохранить бренд"}
                            </button>
                        </form>

                        {/* Форма модели */}
                        <form onSubmit={handleModelSubmit} className="flex flex-col gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Добавить Модель</h3>
                            <select value={modelForm.brand_id} onChange={e => setModelForm({ ...modelForm, brand_id: e.target.value })} required className="w-full p-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer text-gray-800">
                                <option value="">Выберите бренд</option>
                                {brands.map((brand) => (
                                    <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
                            <input type="text" placeholder="Например: X5" value={modelForm.name} onChange={e => setModelForm({ ...modelForm, name: e.target.value })} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
                            <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-gray-400">
                                {isSubmitting ? "Сохранение..." : "Сохранить модель"}
                            </button>
                        </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Удалить бренд</h2>
                            <div className="flex flex-col gap-2">
                                {brands.length === 0 && (
                                    <p className="text-sm text-gray-500">Бренды пока не добавлены</p>
                                )}
                                {brands.map((brand) => (
                                    <div key={brand.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                                        <p className="font-semibold text-gray-900">{brand.name}</p>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => handleDelete(
                                                `бренд ${brand.name}`,
                                                `/api/brands/${brand.id}`,
                                                "Бренд удален",
                                                "Все модели этого бренда и их связи с товарами тоже будут удалены.",
                                                `brand-${brand.id}`
                                            )}
                                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                                        >
                                            {deletingKey === `brand-${brand.id}` ? "Удаление..." : "Удалить"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Удалить модель</h2>
                            <div className="flex flex-col gap-2">
                                {models.length === 0 && (
                                    <p className="text-sm text-gray-500">Модели пока не добавлены</p>
                                )}
                                {models.map((model) => (
                                    <div key={model.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="font-semibold text-gray-900">{model.name}</p>
                                            <p className="text-sm text-gray-500">{model.brand_name}</p>
                                        </div>
                                        <button
                                            type="button"
                                            disabled={isSubmitting}
                                            onClick={() => handleDelete(
                                                `модель ${model.brand_name} ${model.name}`,
                                                `/api/models/${model.id}`,
                                                "Модель удалена",
                                                "Связи этой модели с товарами тоже будут удалены.",
                                                `model-${model.id}`
                                            )}
                                            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400"
                                        >
                                            {deletingKey === `model-${model.id}` ? "Удаление..." : "Удалить"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
