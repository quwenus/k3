#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DUMP_FILE="${1:-$ROOT_DIR/backups/k3_parts_dump.sql.gz}"
PORT="${DB_PORT:-3307}"
DB_NAME="${DB_NAME:-k3_parts}"

if [ ! -f "$DUMP_FILE" ]; then
  echo "Dump file not found: $DUMP_FILE" >&2
  exit 1
fi

"$ROOT_DIR/scripts/local-db-start.sh"

mysql --protocol=TCP -h 127.0.0.1 --port="$PORT" -u root \
  -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

gunzip -c "$DUMP_FILE" | mysql --protocol=TCP -h 127.0.0.1 --port="$PORT" -u root "$DB_NAME"

echo "Imported $DUMP_FILE into $DB_NAME on 127.0.0.1:$PORT"
