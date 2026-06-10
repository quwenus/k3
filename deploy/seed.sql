-- INSERT INTO car_brands (name) VALUES
-- ('Lada')
-- ON DUPLICATE KEY UPDATE name=name;

-- INSERT INTO car_models (brand_id, name) VALUES
-- (1, 'Vesta'),
-- (1, 'Granta')
-- ON DUPLICATE KEY UPDATE name=name;

-- INSERT INTO k3_numbers (number, title) VALUES
-- ('K18121', 'Тормозные колодки передние Lada Vesta/Granta')
-- ON DUPLICATE KEY UPDATE number=number;
-- INSERT INTO categories (name, slug) VALUES
-- ('Авто', 'car'),
-- ('Мото', 'moto')
-- ON DUPLICATE KEY UPDATE name=name;

-- INSERT INTO products (k3_id, price, category_id) VALUES
-- (1, 1500.00, 1)
-- ON DUPLICATE KEY UPDATE price=price;

-- INSERT INTO oem_numbers (k3_id, number) VALUES
-- (1, '8450102948'),
-- (1, '1118-3501080')
-- ON DUPLICATE KEY UPDATE number=number;

-- INSERT INTO model_compatibility (k3_id, model_id) VALUES
-- (1, 1),
-- (1, 2)
-- ON DUPLICATE KEY UPDATE k3_id=k3_id;

-- INSERT INTO product_images (product_id, file_path, is_main, sort_order) VALUES
-- (1, '/assets/img/K18121.jpg', TRUE, 0)
-- ON DUPLICATE KEY UPDATE file_path=file_path;

-- Бренды
INSERT INTO
    car_brands (name)
VALUES ('Lada')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

-- Модели
INSERT INTO
    car_models (brand_id, name)
SELECT b.id, 'Vesta'
FROM car_brands b
WHERE
    b.name = 'Lada'
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

INSERT INTO
    car_models (brand_id, name)
SELECT b.id, 'Granta'
FROM car_brands b
WHERE
    b.name = 'Lada'
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

-- K3 номер
INSERT INTO
    k3_numbers (number, title)
VALUES (
        'K18121',
        'Тормозные колодки передние Lada Vesta/Granta'
    )
ON DUPLICATE KEY UPDATE
    title = VALUES(title);

-- Категории
INSERT INTO
    categories (name, slug)
VALUES ('Авто', 'car'),
    ('Мото', 'moto')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

-- Товар
INSERT INTO
    products (k3_id, price, category_id)
SELECT k.id, 1500.00, c.id
FROM k3_numbers k
    JOIN categories c ON c.slug = 'car'
WHERE
    k.number = 'K18121'
ON DUPLICATE KEY UPDATE
    price = VALUES(price);

-- OEM номера
INSERT INTO
    oem_numbers (k3_id, number)
SELECT k.id, '8450102948'
FROM k3_numbers k
WHERE
    k.number = 'K18121'
ON DUPLICATE KEY UPDATE
    number = VALUES(number);

INSERT INTO
    oem_numbers (k3_id, number)
SELECT k.id, '1118-3501080'
FROM k3_numbers k
WHERE
    k.number = 'K18121'
ON DUPLICATE KEY UPDATE
    number = VALUES(number);

-- Совместимость с моделями
INSERT INTO
    model_compatibility (k3_id, model_id)
SELECT k.id, m.id
FROM
    k3_numbers k
    JOIN car_models m ON m.name = 'Vesta'
    JOIN car_brands b ON b.id = m.brand_id
WHERE
    k.number = 'K18121'
    AND b.name = 'Lada'
ON DUPLICATE KEY UPDATE
    k3_id = VALUES(k3_id);

INSERT INTO
    model_compatibility (k3_id, model_id)
SELECT k.id, m.id
FROM
    k3_numbers k
    JOIN car_models m ON m.name = 'Granta'
    JOIN car_brands b ON b.id = m.brand_id
WHERE
    k.number = 'K18121'
    AND b.name = 'Lada'
ON DUPLICATE KEY UPDATE
    k3_id = VALUES(k3_id);

-- Изображение
INSERT INTO
    product_images (
        product_id,
        file_path,
        is_main,
        sort_order
    )
SELECT p.id, '/assets/img/K18121.jpg', TRUE, 0
FROM products p
    JOIN k3_numbers k ON k.id = p.k3_id
WHERE
    k.number = 'K18121'
ON DUPLICATE KEY UPDATE
    file_path = VALUES(file_path);