

import express from 'express';
import cors from 'cors';
import sql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/assets', express.static(path.join(__dirname, '..', 'src', 'assets')));

const port = process.env.PORT || 5001;

const pool = sql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

(async () => {
    try {
        await pool.getConnection();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection failed:', err.message);
    }
})();

app.post('/api/admin/', async (req, res) => {
    try {
        const { login, password } = req.body;

        const hashPassword = await bcrypt.hash(password, 10); // Хэшируем пароль

        const [rows] = await pool.query(
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

        const [rows] = await pool.query(
            'SELECT * FROM admin_table WHERE login = ?',
            [login]
        );

        if (rows.length > 0) {
            const isMatch = await bcrypt.compare(password, rows[0].password);
            if (isMatch) {
                res.json({ success: true, message: 'Login successful' });
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


app.get('/api/products', async (req, res) => {
    const { category_slug } = req.query;

    try {
        let query = `
            SELECT
                p.id,

                k3.number AS sku,
                k3.title,

                p.price,

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
        const data = rows.map(product => ({
            ...product,

            oem_numbers:
                typeof product.oem_numbers === 'string'
                    ? JSON.parse(product.oem_numbers)
                    : product.oem_numbers,

            compatible_cars:
                typeof product.compatible_cars === 'string'
                    ? JSON.parse(product.compatible_cars)
                    : product.compatible_cars,

            images:
                typeof product.images === 'string'
                    ? JSON.parse(product.images)
                    : product.images
        }));

        res.json({ data });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Error fetching products'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

export { pool };