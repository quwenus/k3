const PLACEHOLDER_IMAGE = '/assets/img/placeholder.jpg';

const isMainImage = (image) => image?.is_main === true
    || image?.is_main === 1
    || image?.is_main === '1'
    || image?.is_main === 'true';

const getSortOrder = (image) => {
    const order = Number(image?.sort_order);

    return Number.isFinite(order) ? order : 0;
};

const normalizeImagePath = (filePath) => {
    const trimmedPath = String(filePath || '').trim();

    if (!trimmedPath) {
        return PLACEHOLDER_IMAGE;
    }

    if (/^(https?:)?\/\//.test(trimmedPath) || trimmedPath.startsWith('/')) {
        return trimmedPath;
    }

    if (trimmedPath.startsWith('assets/img/')) {
        return `/${trimmedPath}`;
    }

    if (trimmedPath.startsWith('src/assets/img/')) {
        return trimmedPath.replace('src/', '/');
    }

    return `/assets/img/${trimmedPath}`;
};

export const getProductImages = (images) => {
    if (!Array.isArray(images) || images.length === 0) {
        return [{ file_path: PLACEHOLDER_IMAGE, is_main: true, sort_order: 0 }];
    }

    const normalizedImages = images
        .filter(Boolean)
        .map((image, index) => ({
            ...image,
            file_path: normalizeImagePath(image.file_path),
            is_main: isMainImage(image),
            sort_order: getSortOrder(image),
            original_index: index
        }))
        .sort((a, b) => {
            if (a.is_main && !b.is_main) return -1;
            if (!a.is_main && b.is_main) return 1;
            if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
            return a.original_index - b.original_index;
        });

    return normalizedImages.length > 0
        ? normalizedImages
        : [{ file_path: PLACEHOLDER_IMAGE, is_main: true, sort_order: 0 }];
};

export const getProductMainImage = (images) => getProductImages(images)[0].file_path;

export { PLACEHOLDER_IMAGE };
