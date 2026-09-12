# Развертывание

## Подготовка

* Нужен WSL (Ubuntu) с Ansible.
* Настроенный беспарольный доступ по SSH (по ключу) из WSL к серверу.

## Запуск деплоя

1. Собираешь фронт локально в Windows или WSL:
   ```bash
   npm run build
   ```

2. Запускаешь плейбук Ansible из корня проекта через WSL:
   ```bash
   wsl -d Ubuntu ansible-playbook -i deploy/hosts.ini deploy/playbook.yml
   ```

## Настройка отправки заявок на почту

Чтобы сайт сам отправлял заявки, при деплое нужно передать SMTP-доступы от ящика `info@k3-parts.ru`.

Пример для Яндекс 360:

```bash
export ORDER_RECIPIENT_EMAIL=info@k3-parts.ru
export SMTP_HOST=smtp.yandex.ru
export SMTP_PORT=465
export SMTP_SECURE=true
export SMTP_USER=info@k3-parts.ru
export SMTP_PASS='пароль_приложения_или_smtp_пароль'
export SMTP_FROM=info@k3-parts.ru

ANSIBLE_LOCAL_TEMP=/tmp/ansible-local ansible-playbook -i deploy/hosts.ini deploy/playbook.yml
```

Пример для Mail.ru / VK WorkMail:

```bash
export ORDER_RECIPIENT_EMAIL=info@k3-parts.ru
export SMTP_HOST=smtp.mail.ru
export SMTP_PORT=465
export SMTP_SECURE=true
export SMTP_USER=info@k3-parts.ru
export SMTP_PASS='пароль_приложения_или_smtp_пароль'
export SMTP_FROM=info@k3-parts.ru

ANSIBLE_LOCAL_TEMP=/tmp/ansible-local ansible-playbook -i deploy/hosts.ini deploy/playbook.yml
```

Если SMTP уже был прописан в `/var/www/k3-app/backend/.env` на сервере, деплой больше не затирает эти значения пустыми строками.

## Как это работает

* **Хосты**: Настраиваются в файле `hosts.ini`.
* **Пакеты**: Устанавливаются Node.js, Caddy и MySQL Server.
* **База данных**: Идемпотентно создается база `k3_parts`, пользователь `admin` и импортируются файлы `schema.sql` (структура) и `seed.sql` (демо-данные).
* **Статика**: Собранный фронт (`dist/`) копируется в новую release-папку `/var/www/k3-app/releases/frontend/...`, затем live-ссылка `/var/www/k3-app/frontend-current` переключается на новый релиз.
* **Бэкенд**: Бэк копируется в `/var/www/k3-app/backend`, устанавливаются зависимости, создается `.env` и запускается systemd сервис `k3-backend`.
* **Прокси**: Caddy раздает статику из `/var/www/k3-app/frontend-current` на порту `80` и проксирует `/api/*` запросы к Node.js бэкенду.
