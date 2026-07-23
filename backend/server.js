/* global process */

import express from 'express';
import cors from 'cors';
import sql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import multer from 'multer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistDir = path.join(__dirname, '..', 'dist');
const frontendIndexFile = path.join(frontendDistDir, 'index.html');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/assets', express.static(path.join(__dirname, '..', 'src', 'assets')));

const port = process.env.PORT || 5001;
const host = process.env.HOST || '0.0.0.0';
const adminJwtSecret = process.env.JWT_SECRET || 'k3-admin-panel-secret';
const orderRecipientEmail = process.env.ORDER_RECIPIENT_EMAIL || 'info@k3-parts.ru';
const defaultUploadDir = fs.existsSync('/var/www/k3-app')
    ? '/var/www/k3-app/uploads/img'
    : path.join(__dirname, '..', 'src', 'assets', 'img');
const imageUploadDir = process.env.UPLOAD_DIR || defaultUploadDir;

fs.mkdirSync(imageUploadDir, { recursive: true });
app.use('/assets/img', express.static(imageUploadDir));

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, imageUploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        cb(null, `${Date.now()}-${baseName || 'image'}${ext.toLowerCase()}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fieldSize: 5 * 1024 * 1024
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
            return;
        }

        cb(new Error('Only image files are allowed'));
    }
});

const uploadImages = (req, res, next) => {
    upload.array('images')(req, res, (err) => {
        if (err) {
            console.error(err);
            res.status(400).json({
                message: err.message || 'Error uploading images'
            });
            return;
        }

        next();
    });
};

const parseEntityId = (id) => {
    const numericId = Number(id);

    return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
};

const removeUploadedFiles = async (filePaths) => {
    const uniqueFilePaths = [...new Set(filePaths.filter(Boolean))];

    await Promise.all(uniqueFilePaths.map(async (filePath) => {
        const fileName = path.basename(filePath);

        if (!fileName || fileName === 'placeholder.jpg') {
            return;
        }

        const fullPath = path.join(imageUploadDir, fileName);

        try {
            await fs.promises.unlink(fullPath);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                console.error(`Error deleting image file ${fullPath}:`, err.message);
            }
        }
    }));
};

const createAdminToken = (admin) => jwt.sign(
    {
        adminId: admin.id,
        login: admin.login
    },
    adminJwtSecret,
    { expiresIn: '8h' }
);

const requireAdminAuth = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
        return res.status(401).json({ message: 'Admin authorization required' });
    }

    try {
        req.admin = jwt.verify(token, adminJwtSecret);
        next();
    } catch (err) {
        console.error('Admin auth failed:', err.message);
        res.status(401).json({ message: 'Admin session expired' });
    }
};

const getOrderTransporter = () => {
    if (!process.env.SMTP_HOST) {
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 465),
        secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : Number(process.env.SMTP_PORT || 465) === 465,
        auth: process.env.SMTP_USER && process.env.SMTP_PASS
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
            : undefined
    });
};

const formatList = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return 'Не указано';
    }

    return items.filter(Boolean).join(', ') || 'Не указано';
};

const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const parseJsonArrayField = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (!value) {
        return [];
    }

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
};

const parseProductImageChanges = (value) => parseJsonArrayField(value)
    .map((image, index) => ({
        id: parseEntityId(image?.id),
        isMain: image?.is_main === true || image?.is_main === 1 || image?.is_main === '1' || image?.is_main === 'true',
        sortOrder: Number.isFinite(Number(image?.sort_order)) ? Number(image.sort_order) : index,
        shouldDelete: image?.delete === true || image?.delete === 1 || image?.delete === '1' || image?.delete === 'true'
    }))
    .filter(image => image.id);

const isMainProductImage = (image) => image?.is_main === true
    || image?.is_main === 1
    || image?.is_main === '1'
    || image?.is_main === 'true';

const getProductImageSortOrder = (image) => {
    const order = Number(image?.sort_order);

    return Number.isFinite(order) ? order : 0;
};

const productImageExists = (image) => {
    const filePath = String(image?.file_path || '').trim();

    if (!filePath) {
        return false;
    }

    if (/^(https?:)?\/\//.test(filePath)) {
        return true;
    }

    return fs.existsSync(path.join(imageUploadDir, path.basename(filePath)));
};

const sortProductImages = (images) => {
    if (!Array.isArray(images)) {
        return [];
    }

    return images.filter(productImageExists).sort((a, b) => {
        const aIsMain = isMainProductImage(a);
        const bIsMain = isMainProductImage(b);

        if (aIsMain && !bIsMain) return -1;
        if (!aIsMain && bIsMain) return 1;

        const orderDifference = getProductImageSortOrder(a) - getProductImageSortOrder(b);
        if (orderDifference !== 0) return orderDifference;

        return Number(a?.id || 0) - Number(b?.id || 0);
    });
};

const normalizeProductPayload = (body) => {
    const {
        k3_number,
        title,
        price,
        category_id,
        applicability_text = '',
        oem_numbers = '[]',
        compatible_model_ids = '[]'
    } = body;

    const normalized = {
        k3Number: String(k3_number || '').trim(),
        title: String(title || '').trim(),
        price: String(price || '').trim(),
        categoryId: parseEntityId(category_id),
        applicabilityText: String(applicability_text || '').trim(),
        oemNumbers: parseJsonArrayField(oem_numbers).map(item => String(item).trim()).filter(Boolean),
        compatibleModelIds: parseJsonArrayField(compatible_model_ids)
            .map(item => parseEntityId(item))
            .filter(Boolean)
    };

    if (!normalized.k3Number || !normalized.title || !normalized.price || !normalized.categoryId) {
        const error = new Error('K3 number, title, price and category are required');
        error.statusCode = 400;
        throw error;
    }

    return normalized;
};

const saveProductRelations = async (connection, k3Id, oemNumbers, compatibleModelIds) => {
    await connection.query('DELETE FROM oem_numbers WHERE k3_id = ?', [k3Id]);
    for (const oem of oemNumbers) {
        await connection.query(
            'INSERT INTO oem_numbers (k3_id, number) VALUES (?, ?)',
            [k3Id, oem]
        );
    }

    await connection.query('DELETE FROM model_compatibility WHERE k3_id = ?', [k3Id]);
    for (const modelId of compatibleModelIds) {
        await connection.query(
            'INSERT INTO model_compatibility (k3_id, model_id) VALUES (?, ?)',
            [k3Id, modelId]
        );
    }
};

const replaceProductImages = async (connection, productId, files) => {
    const [oldImages] = await connection.query(
        'SELECT file_path FROM product_images WHERE product_id = ?',
        [productId]
    );

    await connection.query('DELETE FROM product_images WHERE product_id = ?', [productId]);

    for (const [index, file] of files.entries()) {
        await connection.query(
            'INSERT INTO product_images (product_id, file_path, is_main, sort_order) VALUES (?, ?, ?, ?)',
            [
                productId,
                `/assets/img/${file.filename}`,
                index === 0,
                index
            ]
        );
    }

    return oldImages.map(image => image.file_path);
};

const updateProductImageChanges = async (connection, productId, imageChanges) => {
    const [currentImages] = await connection.query(
        'SELECT id, file_path FROM product_images WHERE product_id = ?',
        [productId]
    );
    const currentImageIds = new Set(currentImages.map(image => image.id));
    const requestedImages = imageChanges.filter(image => currentImageIds.has(image.id));
    const imagesToKeep = requestedImages.filter(image => !image.shouldDelete);
    const keepIds = new Set(imagesToKeep.map(image => image.id));
    const imagesToDelete = currentImages.filter(image => !keepIds.has(image.id));

    if (imagesToDelete.length > 0) {
        await connection.query(
            `DELETE FROM product_images
            WHERE product_id = ?
                AND id IN (${imagesToDelete.map(() => '?').join(', ')})`,
            [productId, ...imagesToDelete.map(image => image.id)]
        );
    }

    if (imagesToKeep.length > 0) {
        const mainImageId = imagesToKeep.find(image => image.isMain)?.id || imagesToKeep[0].id;

        for (const [index, image] of imagesToKeep.entries()) {
            await connection.query(
                `UPDATE product_images
                SET is_main = ?, sort_order = ?
                WHERE product_id = ? AND id = ?`,
                [image.id === mainImageId, image.sortOrder ?? index, productId, image.id]
            );
        }
    }

    return imagesToDelete.map(image => image.file_path);
};

const runSchemaChange = async (query, ignoredErrorCodes = []) => {
    try {
        await pool.query(query);
    } catch (err) {
        if (!ignoredErrorCodes.includes(err.code)) {
            throw err;
        }
    }
};

const getTableColumns = async (tableName, columnName) => {
    const [columns] = await pool.query(
        `SELECT DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND COLUMN_NAME = ?`,
        [tableName, columnName]
    );

    return columns;
};

const indexUsesColumn = async (tableName, indexName, columnName) => {
    const [indexes] = await pool.query(
        `SELECT 1
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND INDEX_NAME = ?
            AND COLUMN_NAME = ?
        LIMIT 1`,
        [tableName, indexName, columnName]
    );

    return indexes.length > 0;
};

const foreignKeyExists = async (tableName, constraintName) => {
    const [constraints] = await pool.query(
        `SELECT 1
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
        WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
            AND CONSTRAINT_NAME = ?
            AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        LIMIT 1`,
        [tableName, constraintName]
    );

    return constraints.length > 0;
};

const ensureDatabaseShape = async () => {
    try {
        const applicabilityTextColumns = await getTableColumns('products', 'applicability_text');
        if (applicabilityTextColumns.length === 0) {
            await runSchemaChange(
                'ALTER TABLE products ADD COLUMN applicability_text MEDIUMTEXT NULL AFTER category_id',
                ['ER_DUP_FIELDNAME']
            );
        } else if (applicabilityTextColumns[0].DATA_TYPE !== 'mediumtext') {
            await runSchemaChange('ALTER TABLE products MODIFY applicability_text MEDIUMTEXT NULL');
        }

        const numberColumns = await getTableColumns('oem_numbers', 'number');
        if (numberColumns.length === 0) {
            return;
        }

        const hashColumns = await getTableColumns('oem_numbers', 'number_hash');
        const uniqueIndexUsesHash = await indexUsesColumn('oem_numbers', 'k3_oem_idx', 'number_hash');
        const numberIndexUsesNumber = await indexUsesColumn('oem_numbers', 'idx_oem_numbers_number', 'number');
        const needsMigration = numberColumns[0].DATA_TYPE !== 'mediumtext'
            || hashColumns.length === 0
            || !uniqueIndexUsesHash
            || !numberIndexUsesNumber;

        if (!needsMigration) {
            return;
        }

        const k3ForeignKeyName = 'oem_numbers_ibfk_1';
        if (await foreignKeyExists('oem_numbers', k3ForeignKeyName)) {
            await runSchemaChange(`ALTER TABLE oem_numbers DROP FOREIGN KEY ${k3ForeignKeyName}`);
        }

        await runSchemaChange('ALTER TABLE oem_numbers DROP INDEX k3_oem_idx', ['ER_CANT_DROP_FIELD_OR_KEY']);
        await runSchemaChange('ALTER TABLE oem_numbers DROP INDEX idx_oem_numbers_number', ['ER_CANT_DROP_FIELD_OR_KEY']);
        await runSchemaChange('ALTER TABLE oem_numbers MODIFY number MEDIUMTEXT NOT NULL');
        await runSchemaChange(
            'ALTER TABLE oem_numbers ADD COLUMN number_hash BINARY(32) GENERATED ALWAYS AS (UNHEX(SHA2(number, 256))) STORED',
            ['ER_DUP_FIELDNAME']
        );
        await runSchemaChange('ALTER TABLE oem_numbers ADD UNIQUE KEY k3_oem_idx (k3_id, number_hash)', ['ER_DUP_KEYNAME']);
        await runSchemaChange('ALTER TABLE oem_numbers ADD INDEX idx_oem_numbers_number (number(191))', ['ER_DUP_KEYNAME']);
        if (!await foreignKeyExists('oem_numbers', k3ForeignKeyName)) {
            await runSchemaChange(
                `ALTER TABLE oem_numbers
                ADD CONSTRAINT ${k3ForeignKeyName}
                FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE`,
                ['ER_FK_DUP_NAME']
            );
        }
    } catch (err) {
        console.error('Database schema check failed:', err.message);
    }
};

const pool = sql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        await ensureDatabaseShape();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

app.post('/api/admin/', async (req, res) => {
    try {
        const { login, password } = req.body;

        const hashPassword = await bcrypt.hash(password, 10); // Хэшируем пароль

        await pool.query(
            'INSERT INTO admin_table (login, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
            [login, hashPassword]
        );
        res.json({ success: true, message: 'Admin user created/updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error creating/updating admin user'
        });
    }
});

app.post('/api/admin/login', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ success: false, message: 'Login and password are required' });
        }

        const [rows] = await pool.query(
            'SELECT * FROM admin_table WHERE login = ?',
            [login]
        );

        if (rows.length > 0) {
            const isMatch = await bcrypt.compare(password, rows[0].password);
            if (isMatch) {
                res.json({
                    success: true,
                    message: 'Login successful',
                    token: createAdminToken(rows[0])
                });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error during login'
        });
    }
});

app.get('/api/admin/session', requireAdminAuth, (req, res) => {
    res.json({
        success: true,
        admin: {
            id: req.admin.adminId,
            login: req.admin.login
        }
    });
});


app.get('/api/products', async (req, res) => {
    const { category_slug } = req.query;

    try {
        let query = `
            SELECT
                p.id,

                k3.number AS sku,
                k3.title,

                p.price,
                p.applicability_text,

                c.id AS category_id,
                c.name AS category_name,
                c.slug AS category_slug,

                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(o.number)
                        FROM oem_numbers o
                        WHERE o.k3_id = k3.id
                    ),
                    JSON_ARRAY()
                ) AS oem_numbers,

                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(
                            CONCAT(cb.name, ' ', cm.name)
                        )
                        FROM model_compatibility mc
                        JOIN car_models cm
                            ON cm.id = mc.model_id
                        JOIN car_brands cb
                            ON cb.id = cm.brand_id
                        WHERE mc.k3_id = k3.id
                    ),
                    JSON_ARRAY()
                ) AS compatible_cars,

                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(mc.model_id)
                        FROM model_compatibility mc
                        WHERE mc.k3_id = k3.id
                    ),
                    JSON_ARRAY()
                ) AS compatible_model_ids,

                COALESCE(
                    (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pi.id,
                                'file_path', pi.file_path,
                                'is_main', pi.is_main,
                                'sort_order', pi.sort_order
                            )
                        )
                        FROM product_images pi
                        WHERE pi.product_id = p.id
                    ),
                    JSON_ARRAY()
                ) AS images

            FROM products p

            JOIN k3_numbers k3
                ON p.k3_id = k3.id

            JOIN categories c
                ON p.category_id = c.id
        `;

        const queryParams = [];

        if (category_slug) {
            query += ` WHERE c.slug = ?`;
            queryParams.push(category_slug);
        }

        query += ` ORDER BY p.id ASC`;

        const [rows] = await pool.query(query, queryParams);

        // mysql2 иногда возвращает JSON как строки
        const data = rows.map(product => {
            const images = typeof product.images === 'string'
                ? JSON.parse(product.images)
                : product.images;

            return {
                ...product,

                oem_numbers:
                    typeof product.oem_numbers === 'string'
                        ? JSON.parse(product.oem_numbers)
                        : product.oem_numbers,

                compatible_cars:
                    typeof product.compatible_cars === 'string'
                        ? JSON.parse(product.compatible_cars)
                        : product.compatible_cars,

                compatible_model_ids:
                    typeof product.compatible_model_ids === 'string'
                        ? JSON.parse(product.compatible_model_ids)
                        : product.compatible_model_ids,

                images: sortProductImages(images)
            };
        });

        res.json({ data });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Error fetching products'
        });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const {
            product_id,
            sku,
            customer_phone,
            applicability_text = '',
            oem_numbers = [],
            compatible_cars = []
        } = req.body;

        const phone = String(customer_phone || '').trim();

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        if (!product_id && !sku) {
            return res.status(400).json({ message: 'Product id or K3 number is required' });
        }

        const whereClause = product_id ? 'p.id = ?' : 'k3.number = ?';
        const whereValue = product_id || sku;

        const [rows] = await pool.query(
            `SELECT
                p.id,
                k3.number AS sku,
                k3.title,
                c.name AS category_name
            FROM products p
            JOIN k3_numbers k3 ON k3.id = p.k3_id
            JOIN categories c ON c.id = p.category_id
            WHERE ${whereClause}
            LIMIT 1`,
            [whereValue]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const transporter = getOrderTransporter();

        if (!transporter) {
            return res.status(503).json({ message: 'Order email is not configured' });
        }

        const product = rows[0];
        const subject = `Заказ колодок ${product.sku}`;
        const formattedOems = formatList(oem_numbers);
        const formattedCompatibleCars = String(applicability_text || '').trim() || formatList(compatible_cars);
        const text = [
            'Новая заявка на заказ колодок',
            '',
            `Телефон клиента: ${phone}`,
            '',
            `K3 номер: ${product.sku}`,
            `Название: ${product.title}`,
            `Категория: ${product.category_name}`,
            `OEM: ${formattedOems}`,
            `Применяемость: ${formattedCompatibleCars}`
        ].join('\n');

        const html = `
            <h2>Новая заявка на заказ колодок</h2>
            <p><strong>Телефон клиента:</strong> ${escapeHtml(phone)}</p>
            <hr>
            <p><strong>K3 номер:</strong> ${escapeHtml(product.sku)}</p>
            <p><strong>Название:</strong> ${escapeHtml(product.title)}</p>
            <p><strong>Категория:</strong> ${escapeHtml(product.category_name)}</p>
            <p><strong>OEM:</strong> ${escapeHtml(formattedOems)}</p>
            <p><strong>Применяемость:</strong> ${escapeHtml(formattedCompatibleCars)}</p>
        `;

        await transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || orderRecipientEmail,
            to: orderRecipientEmail,
            subject,
            text,
            html
        });

        res.status(201).json({ message: 'Order request sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || 'Error sending order request'
        });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching categories'
        });
    }
});

app.post('/api/categories', requireAdminAuth, async (req, res) => {
    try {
        const { name, slug } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ message: 'Category name and slug are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO categories (name, slug)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE name = VALUES(name), slug = VALUES(slug)`,
            [name.trim(), slug.trim()]
        );

        res.status(201).json({
            message: 'Category saved successfully',
            id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error saving category'
        });
    }
});

app.delete('/api/categories/:id', requireAdminAuth, async (req, res) => {
    let connection;
    const categoryId = parseEntityId(req.params.id);

    if (!categoryId) {
        return res.status(400).json({ message: 'Invalid category id' });
    }

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [categoryRows] = await connection.query('SELECT id FROM categories WHERE id = ? FOR UPDATE', [categoryId]);

        if (categoryRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Category not found' });
        }

        const [products] = await connection.query(
            `SELECT p.k3_id, pi.file_path
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE p.category_id = ?`,
            [categoryId]
        );

        const k3Ids = [...new Set(products.map(product => product.k3_id).filter(Boolean))];

        for (const k3Id of k3Ids) {
            await connection.query('DELETE FROM k3_numbers WHERE id = ?', [k3Id]);
        }

        await connection.query('DELETE FROM categories WHERE id = ?', [categoryId]);
        await connection.commit();
        await removeUploadedFiles(products.map(product => product.file_path));

        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }

        console.error(err);
        res.status(500).json({
            message: err.message || 'Error deleting category'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.get('/api/brands', async (_req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM car_brands ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching brands'
        });
    }
});

app.post('/api/brands', requireAdminAuth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        const [result] = await pool.query(
            `INSERT INTO car_brands (name)
            VALUES (?)
            ON DUPLICATE KEY UPDATE name = VALUES(name)`,
            [name.trim()]
        );

        res.status(201).json({
            message: 'Brand saved successfully',
            id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error saving brand'
        });
    }
});

app.delete('/api/brands/:id', requireAdminAuth, async (req, res) => {
    const brandId = parseEntityId(req.params.id);

    if (!brandId) {
        return res.status(400).json({ message: 'Invalid brand id' });
    }

    try {
        const [result] = await pool.query('DELETE FROM car_brands WHERE id = ?', [brandId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Brand not found' });
        }

        res.json({ message: 'Brand deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || 'Error deleting brand'
        });
    }
});

app.get('/api/models', async (req, res) => {
    try {
        const { brand_id } = req.query;
        const params = [];

        let query = `
            SELECT
                cm.id,
                cm.brand_id,
                cm.name,
                cb.name AS brand_name
            FROM car_models cm
            JOIN car_brands cb ON cb.id = cm.brand_id
        `;

        if (brand_id) {
            query += ' WHERE cm.brand_id = ?';
            params.push(brand_id);
        }

        query += ' ORDER BY cb.name ASC, cm.name ASC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error fetching models'
        });
    }
});

app.post('/api/models', requireAdminAuth, async (req, res) => {
    try {
        const { brand_id, name } = req.body;

        if (!brand_id || !name) {
            return res.status(400).json({ message: 'Brand and model name are required' });
        }

        const [result] = await pool.query(
            `INSERT INTO car_models (brand_id, name)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE name = VALUES(name)`,
            [brand_id, name.trim()]
        );

        res.status(201).json({
            message: 'Model saved successfully',
            id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Error saving model'
        });
    }
});

app.delete('/api/models/:id', requireAdminAuth, async (req, res) => {
    const modelId = parseEntityId(req.params.id);

    if (!modelId) {
        return res.status(400).json({ message: 'Invalid model id' });
    }

    try {
        const [result] = await pool.query('DELETE FROM car_models WHERE id = ?', [modelId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Model not found' });
        }

        res.json({ message: 'Model deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: err.message || 'Error deleting model'
        });
    }
});

app.post('/api/products', requireAdminAuth, uploadImages, async (req, res) => {
    let connection;
    let oldImagePaths = [];
    const uploadedFilePaths = req.files?.map(file => `/assets/img/${file.filename}`) || [];

    try {
        connection = await pool.getConnection();

        const productPayload = normalizeProductPayload(req.body);

        await connection.beginTransaction();

        const [k3Result] = await connection.query(
            `INSERT INTO k3_numbers (number, title)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE title = VALUES(title), id = LAST_INSERT_ID(id)`,
            [productPayload.k3Number, productPayload.title]
        );

        const k3Id = k3Result.insertId;

        const [productResult] = await connection.query(
            `INSERT INTO products (k3_id, price, category_id, applicability_text)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                price = VALUES(price),
                category_id = VALUES(category_id),
                applicability_text = VALUES(applicability_text),
                id = LAST_INSERT_ID(id)`,
            [k3Id, productPayload.price, productPayload.categoryId, productPayload.applicabilityText]
        );

        const productId = productResult.insertId;

        await saveProductRelations(
            connection,
            k3Id,
            productPayload.oemNumbers,
            productPayload.compatibleModelIds
        );

        if (req.files?.length) {
            oldImagePaths = await replaceProductImages(connection, productId, req.files);
        } else if (Object.hasOwn(req.body, 'existing_images')) {
            oldImagePaths = await updateProductImageChanges(
                connection,
                productId,
                parseProductImageChanges(req.body.existing_images)
            );
        }

        await connection.commit();

        if (oldImagePaths.length > 0) {
            await removeUploadedFiles(oldImagePaths);
        }

        res.status(201).json({
            message: 'Product saved successfully',
            id: productId
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }

        await removeUploadedFiles(uploadedFilePaths);

        console.error(err);

        const isDuplicate = err.code === 'ER_DUP_ENTRY';
        res.status(err.statusCode || (isDuplicate ? 409 : 500)).json({
            message: isDuplicate
                ? 'Product with this K3 number or OEM number already exists'
                : err.message || 'Error saving product'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.put('/api/products/:id', requireAdminAuth, uploadImages, async (req, res) => {
    let connection;
    let oldImagePaths = [];
    const productId = parseEntityId(req.params.id);
    const uploadedFilePaths = req.files?.map(file => `/assets/img/${file.filename}`) || [];

    if (!productId) {
        await removeUploadedFiles(uploadedFilePaths);
        return res.status(400).json({ message: 'Invalid product id' });
    }

    try {
        connection = await pool.getConnection();
        const productPayload = normalizeProductPayload(req.body);

        await connection.beginTransaction();

        const [productRows] = await connection.query(
            `SELECT p.id, p.k3_id
            FROM products p
            WHERE p.id = ?
            FOR UPDATE`,
            [productId]
        );

        if (productRows.length === 0) {
            await connection.rollback();
            await removeUploadedFiles(uploadedFilePaths);
            return res.status(404).json({ message: 'Product not found' });
        }

        const k3Id = productRows[0].k3_id;

        await connection.query(
            'UPDATE k3_numbers SET number = ?, title = ? WHERE id = ?',
            [productPayload.k3Number, productPayload.title, k3Id]
        );

        await connection.query(
            'UPDATE products SET price = ?, category_id = ?, applicability_text = ? WHERE id = ?',
            [productPayload.price, productPayload.categoryId, productPayload.applicabilityText, productId]
        );

        await saveProductRelations(
            connection,
            k3Id,
            productPayload.oemNumbers,
            productPayload.compatibleModelIds
        );

        if (req.files?.length) {
            oldImagePaths = await replaceProductImages(connection, productId, req.files);
        }

        await connection.commit();

        if (oldImagePaths.length > 0) {
            await removeUploadedFiles(oldImagePaths);
        }

        res.json({
            message: 'Product updated successfully',
            id: productId
        });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }

        await removeUploadedFiles(uploadedFilePaths);

        console.error(err);

        const isDuplicate = err.code === 'ER_DUP_ENTRY';
        res.status(err.statusCode || (isDuplicate ? 409 : 500)).json({
            message: isDuplicate
                ? 'Product with this K3 number or OEM number already exists'
                : err.message || 'Error updating product'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.delete('/api/products/:id', requireAdminAuth, async (req, res) => {
    let connection;
    const productId = parseEntityId(req.params.id);

    if (!productId) {
        return res.status(400).json({ message: 'Invalid product id' });
    }

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.query(
            `SELECT p.k3_id, pi.file_path
            FROM products p
            LEFT JOIN product_images pi ON pi.product_id = p.id
            WHERE p.id = ?`,
            [productId]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Product not found' });
        }

        await connection.query('DELETE FROM k3_numbers WHERE id = ?', [rows[0].k3_id]);
        await connection.commit();
        await removeUploadedFiles(rows.map(row => row.file_path));

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        if (connection) {
            await connection.rollback();
        }

        console.error(err);
        res.status(500).json({
            message: err.message || 'Error deleting product'
        });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

if (fs.existsSync(frontendIndexFile)) {
    app.use(express.static(frontendDistDir));
    app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
        res.sendFile(frontendIndexFile);
    });
}

app.listen(port, host, () => {
    console.log(`Server running on http://${host}:${port}`);
});

export { pool };
