CREATE TABLE IF NOT EXISTS car_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS car_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES car_brands (id) ON DELETE CASCADE,
    UNIQUE KEY brand_model_idx (brand_id, name)
);

CREATE TABLE IF NOT EXISTS k3_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    number VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    k3_id INT NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS oem_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    k3_id INT NOT NULL,
    number VARCHAR(255) NOT NULL,
    FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE,
    UNIQUE KEY k3_oem_idx (k3_id, number)
);

CREATE TABLE IF NOT EXISTS model_compatibility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    k3_id INT NOT NULL,
    model_id INT NOT NULL,
    FOREIGN KEY (k3_id) REFERENCES k3_numbers (id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES car_models (id) ON DELETE CASCADE,
    UNIQUE KEY k3_model_idx (k3_id, model_id)
);

CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);


ALTER TABLE product_images
ADD UNIQUE KEY product_image_idx (product_id, file_path);