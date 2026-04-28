

import express from 'express';
import cors from 'cors';
import sql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path'; 
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

app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                k3.number AS sku,                
                k3.title,                         
                p.price,
                
                GROUP_CONCAT(DISTINCT oem.number SEPARATOR ', ') AS oem_numbers,
                GROUP_CONCAT(DISTINCT CONCAT(cb.name, ' ', cm.name) SEPARATOR '; ') AS compatible_cars,

                (
                    SELECT COALESCE(
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', pi.id,
                                'file_path', pi.file_path,
                                'is_main', pi.is_main,
                                'sort_order', pi.sort_order
                            )
                        ),
                        JSON_ARRAY()
                    )
                    FROM product_images pi
                    WHERE pi.product_id = p.id
                ) AS images

            FROM products p
            JOIN k3_numbers k3 ON p.k3_id = k3.id
            LEFT JOIN oem_numbers oem ON k3.id = oem.k3_id
            LEFT JOIN model_compatibility mc ON mc.k3_id = k3.id
            LEFT JOIN car_models cm ON mc.model_id = cm.id
            LEFT JOIN car_brands cb ON cm.brand_id = cb.id

            GROUP BY p.id, k3.number, k3.title, p.price
            ORDER BY p.id ASC
        `);
        
        rows.forEach(product => {
            if (product.images && Array.isArray(product.images)) {
                const uniqueImages = [];
                const seenIds = new Set();
                
                product.images.forEach(img => {
                    img.is_main = Boolean(img.is_main);
                    if (!seenIds.has(img.id)) {
                        seenIds.add(img.id);
                        uniqueImages.push(img);
                    }
                });
                
                uniqueImages.sort((a, b) => a.sort_order - b.sort_order);
                product.images = uniqueImages;
            }
        });

        res.json({ data: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});

export { pool };