-- Base dictionaries only. Products and product images are managed from the admin panel.

INSERT INTO
    categories (name, slug)
VALUES ('Авто', 'car'),
    ('Мото', 'moto')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

INSERT INTO
    car_brands (name)
VALUES ('Lada')
ON DUPLICATE KEY UPDATE
    name = VALUES(name);

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

INSERT INTO
    car_models (brand_id, name)
SELECT b.id, 'Niva'
FROM car_brands b
WHERE
    b.name = 'Lada'
ON DUPLICATE KEY UPDATE
    name = VALUES(name);
