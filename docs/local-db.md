# Локальная база через dump

Локальная разработка должна работать с копией базы, а не напрямую с серверной БД. Для этого нужен dump с сервера и локальный MySQL.

В этом проекте локальная база запускается отдельно на `127.0.0.1:3307`, чтобы не мешать другим MySQL-базам на компьютере.

## Что уже есть

Свежий dump сохранен локально:

```bash
backups/k3_parts_dump.sql.gz
```

Этот файл не должен попадать в git, потому что внутри есть данные продакшн-БД.

## Установить MySQL локально

Если MySQL еще не установлен:

```bash
brew install mysql
brew services start mysql
```

Проверка:

```bash
mysql --version
```

## Импортировать dump

Автоматический вариант:

```bash
scripts/local-db-import.sh
```

Ручной вариант:

Запустить проектный MySQL:

```bash
scripts/local-db-start.sh
```

Создать базу:

```bash
mysql --protocol=TCP -h 127.0.0.1 --port=3307 -u root -e "CREATE DATABASE IF NOT EXISTS k3_parts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Загрузить dump:

```bash
gunzip -c backups/k3_parts_dump.sql.gz | mysql --protocol=TCP -h 127.0.0.1 --port=3307 -u root k3_parts
```

Остановить проектный MySQL:

```bash
scripts/local-db-stop.sh
```

## Настроить backend

Создать локальный файл настроек:

```bash
cp backend/.env.example backend/.env
```

Если MySQL настроен не под `root` без пароля, поменять в `backend/.env`:

```env
DB_PORT=3307
DB_USER=root
DB_PASSWORD=
```

## Запуск

Backend:

```bash
npm --prefix backend run dev
```

Frontend:

```bash
npm run dev
```

После этого сайт локально берет товары, картинки, OEM и связи моделей из локальной базы `k3_parts`.

## Обновить локальную базу свежими данными

1. Сделать новый dump на сервере.
2. Скопировать архив в `backups/k3_parts_dump.sql.gz`.
3. Повторить импорт:

```bash
scripts/local-db-import.sh
```
