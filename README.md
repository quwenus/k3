# K3 Parts

Каталог тормозных колодок для автомобилей и мотоциклов.

Brake pad catalog for cars and motorcycles.

[Сайт / Website](https://k3-parts.ru/) · [Русский](#русский) · [English](#english)

## Русский

### О проекте

K3 Parts — сайт производителя тормозных колодок К3. Проект объединяет каталог продукции, поиск по артикулам и применяемости, карточки товаров и отправку заявок на заказ. Интерфейс адаптирован для компьютеров и мобильных устройств.

### Возможности

- Разделы автомобильных и мотоциклетных колодок, а также общий поиск по каталогу.
- Поиск по артикулу К3, OEM-номеру, марке и модели. Учитываются разделители в номерах, похожие латинские и кириллические символы и заданные русские варианты названий.
- Сортировка по совпадению и номеру артикула; поисковый запрос и сортировка сохраняются в адресе страницы.
- Карточки товаров с фотографиями, ценой, OEM-номерами и применяемостью. В подробной карточке доступны галерея и поиск по применяемости.
- Форма заказа с проверкой введённых данных и отправкой заявки на email через SMTP.
- Административная панель для управления товарами, фотографиями, категориями, марками и моделями; обработка применяемости из DOCX.
- Страницы о компании и гарантийных условиях.

Поиск использует текстовые данные каталога. Он не заменяет проверку совместимости по году выпуска и комплектации автомобиля.

**Статус аккаунтов покупателей:** регистрация, личный кабинет и обновлённый механизм авторизации подготовлены в локальной рабочей копии. В опубликованный релиз от 21 октября 2026 года эти изменения не включены.

### Технологии

| Часть проекта | Технологии |
| --- | --- |
| Интерфейс | React 19, React Router 7, Tailwind CSS 4 |
| Сборка и разработка | Vite 8, ESLint |
| Сервер | Node.js, Express 5, REST API |
| База данных | MySQL, mysql2 |
| Файлы и почта | Multer, Nodemailer |
| Развёртывание | Caddy, systemd, Ansible |

### Структура

```text
src/
  components/   Компоненты интерфейса и административной панели
  pages/        Страницы приложения
  utils/        Поиск, применяемость и вспомогательные функции
  assets/       Изображения и оформление
backend/        API, работа с БД, загрузка файлов и отправка заявок
public/         Статические файлы, favicon и иконки
deploy/         SQL-схема и конфигурация развёртывания
scripts/        Локальная БД и обработка применяемости
docs/           Документация проекта
```

### Локальный запуск

Нужны Node.js 22.12 или новее, npm и MySQL.

1. Установите зависимости и создайте локальный файл настроек:

   ```bash
   npm install
   npm --prefix backend install
   cp backend/.env.example backend/.env
   ```

2. Подготовьте отдельную локальную базу данных. Для новой базы используется схема [deploy/schema.sql](deploy/schema.sql); для работы с копией существующего каталога — [инструкция по локальной БД](docs/local-db.md). Настройте `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` и `DB_NAME` в `backend/.env`. Проектный скрипт MySQL использует порт `3307`, а пример `.env` — `3306`: значение должно соответствовать вашей БД.

3. Настройте `UPLOAD_DIR` — папку изображений товаров. Для существующих локальных изображений можно указать `../src/assets/img`; относительный путь считается от каталога `backend`. Для отправки заявок заполните `SMTP_*` и `ORDER_RECIPIENT_EMAIL`.

4. Запустите API и интерфейс в двух терминалах из корня проекта:

   ```bash
   npm --prefix backend run dev
   ```

   ```bash
   npm run dev
   ```

Интерфейс по умолчанию доступен на `http://localhost:5173`, API — на `http://127.0.0.1:5001`. Vite проксирует запросы к API на локальный backend. Файл `.env` и дампы базы не хранятся в Git.

### Сборка и проверки

```bash
npm run build        # Сборка интерфейса в dist/
npm run lint         # Проверка кода
npm run test:search  # Тесты поиска и применяемости
```

В локальной версии с аккаунтами также доступны `npm run test:forms` и `npm run test:auth`. Интеграционные тесты авторизации требуют настроенной локальной MySQL.

### Развёртывание и документация

На сервере Caddy раздаёт интерфейс из `frontend-current`, передаёт `/api/*` в Express и обслуживает изображения товаров из отдельной папки загрузок. Обновление интерфейса выполняется через отдельную папку релиза и атомарное переключение ссылки с сохранением предыдущей версии для отката.

Полный Ansible-плейбук также обновляет backend и импортирует SQL — его запуск затрагивает больше, чем файлы интерфейса.

- [Устройство поиска](docs/catalog-search.md)
- [Локальная база данных](docs/local-db.md)
- [Развёртывание и SMTP](deploy/README.md)

---

## English

### About

K3 Parts is the website of K3, a brake pad manufacturer. The project combines a product catalog, part number and fitment search, product details, and order inquiries. The interface supports desktop and mobile devices.

### Features

- Separate car and motorcycle catalogs, plus search across all products.
- Search by K3 part number, OEM number, vehicle make, and model. Search handles number separators, similar Latin and Cyrillic characters, and predefined Russian name aliases.
- Sorting by relevance or part number, with the query and sort order preserved in the page URL.
- Product cards with photos, prices, OEM references, and fitment information. Detailed views include an image gallery and fitment filtering.
- An order inquiry form with input validation and email delivery through SMTP.
- An admin panel for managing products, photos, categories, makes, and models, including fitment processing from DOCX files.
- Company information and warranty pages.

Search works with the catalog's text data. It does not replace compatibility checks for a specific model year and vehicle configuration.

**Customer account status:** registration, customer profiles, and an updated authentication system have been prepared in the local working copy. These changes were not included in the production release dated October 21, 2026.

### Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | React 19, React Router 7, Tailwind CSS 4 |
| Build and development | Vite 8, ESLint |
| Backend | Node.js, Express 5, REST API |
| Database | MySQL, mysql2 |
| Uploads and email | Multer, Nodemailer |
| Deployment | Caddy, systemd, Ansible |

### Project structure

```text
src/
  components/   UI and admin panel components
  pages/        Application pages
  utils/        Search, fitment, and helper functions
  assets/       Images and visual assets
backend/        API, database access, uploads, and order inquiries
public/         Static files, favicon, and icons
deploy/         SQL schema and deployment configuration
scripts/        Local database and fitment utilities
docs/           Project documentation
```

### Running locally

Requirements: Node.js 22.12 or newer, npm, and MySQL.

1. Install dependencies and create the local environment file:

   ```bash
   npm install
   npm --prefix backend install
   cp backend/.env.example backend/.env
   ```

2. Prepare a separate local database. Use [deploy/schema.sql](deploy/schema.sql) for a new database, or follow the [local database guide](docs/local-db.md) to use a copy of an existing catalog. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`. The project's MySQL script uses port `3307`, while the example `.env` uses `3306`; select the port that matches your database.

3. Set `UPLOAD_DIR` to the product image directory. To use existing local images, set it to `../src/assets/img`; relative paths are resolved from `backend`. Configure `SMTP_*` and `ORDER_RECIPIENT_EMAIL` to enable order inquiry emails.

4. Start the API and frontend in separate terminals from the project root:

   ```bash
   npm --prefix backend run dev
   ```

   ```bash
   npm run dev
   ```

The frontend defaults to `http://localhost:5173`, and the API to `http://127.0.0.1:5001`. Vite proxies API requests to the local backend. Environment files and database dumps are excluded from Git.

### Build and checks

```bash
npm run build        # Build the frontend into dist/
npm run lint         # Run code checks
npm run test:search  # Run search and fitment tests
```

The local account implementation also provides `npm run test:forms` and `npm run test:auth`. Authentication integration tests require a configured local MySQL instance.

### Deployment and documentation

Caddy serves the frontend from `frontend-current`, forwards `/api/*` to Express, and serves product images from a separate upload directory. Frontend updates use a separate release directory and an atomic symlink switch, retaining the previous version for rollback.

The full Ansible playbook also updates the backend and imports SQL, so it affects more than frontend files.

- [Search implementation](docs/catalog-search.md)
- [Local database setup](docs/local-db.md)
- [Deployment and SMTP](deploy/README.md)

The detailed guides linked above are currently written in Russian.
