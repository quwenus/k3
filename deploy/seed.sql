INSERT INTO car_brands (name) VALUES 
('Lada'), 
('Renault'), 
('Hyundai')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO car_models (brand_id, name) VALUES 
(1, 'Vesta'),
(1, 'Granta'),
(2, 'Logan'),
(3, 'Solaris')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO k3_numbers (number, title) VALUES 
('K18121', 'Тормозные колодки передние Lada Vesta/Granta'),
('K18122', 'Тормозные колодки передние Renault Logan'),
('K18123', 'Тормозные колодки задние Hyundai Solaris')
ON DUPLICATE KEY UPDATE number=number;

INSERT INTO products (k3_id, price) VALUES 
(1, 1500.00),
(2, 1200.00),
(3, 1800.00)
ON DUPLICATE KEY UPDATE price=price;

INSERT INTO oem_numbers (k3_id, number) VALUES 
(1, '8450102948'),
(1, '1118-3501080'),
(2, '410602192R'),
(3, '58101-H5A25')
ON DUPLICATE KEY UPDATE number=number;

INSERT INTO model_compatibility (k3_id, model_id) VALUES 
(1, 1),
(1, 2),
(2, 3),
(3, 4)
ON DUPLICATE KEY UPDATE k3_id=k3_id;

INSERT INTO product_images (product_id, file_path, is_main, sort_order) VALUES 
(1, '/assets/img/K18121.jpg', TRUE, 0),
(2, '/assets/img/placeholder.png', TRUE, 0),
(3, '/assets/img/placeholder.png', TRUE, 0)
ON DUPLICATE KEY UPDATE file_path=file_path;
