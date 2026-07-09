CREATE TABLE IF NOT EXISTS car_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,

    INDEX idx_car_brands_name (name)
);

CREATE TABLE IF NOT EXISTS car_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,

    FOREIGN KEY (brand_id) REFERENCES car_brands (id) ON DELETE CASCADE,

    UNIQUE KEY brand_model_idx (brand_id, name),

    INDEX idx_car_models_brand_id (brand_id),
    INDEX idx_car_models_name (name)
);

CREATE TABLE IF NOT EXISTS k3_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,

    INDEX idx_k3_numbers_number (number)
);

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_categories_slug (slug),
    INDEX idx_categories_name (name)
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    k3_id INT NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,

    FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE,

    INDEX idx_products_category_id (category_id),
    INDEX idx_products_k3_id (k3_id)
);

CREATE TABLE IF NOT EXISTS oem_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    k3_id INT NOT NULL,
    number TEXT NOT NULL,
    number_hash BINARY(32) GENERATED ALWAYS AS (UNHEX(SHA2(number, 256))) STORED,

    FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE,

    UNIQUE KEY k3_oem_idx (k3_id, number_hash),

    INDEX idx_oem_numbers_k3_id (k3_id),
    INDEX idx_oem_numbers_number (number(191))
);

CREATE TABLE IF NOT EXISTS model_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    k3_id INT NOT NULL,
    model_id INT NOT NULL,

    FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES car_models (id) ON DELETE CASCADE,

    UNIQUE KEY k3_model_idx (k3_id, model_id),

    INDEX idx_model_compatibility_k3_id (k3_id),
    INDEX idx_model_compatibility_model_id (model_id)
);

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,

    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,

    UNIQUE KEY product_image_idx (product_id, file_path),

    INDEX idx_product_images_product_id (product_id),
    INDEX idx_product_images_is_main (is_main)
);

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    login VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_login (login),
    INDEX idx_users_phone (phone)
);

CREATE TABLE IF NOT EXISTS admin_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
)
