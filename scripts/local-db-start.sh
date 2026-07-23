#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="$ROOT_DIR/.local/mysql"
SOCKET="$DATA_DIR/mysql.sock"
PID_FILE="$DATA_DIR/mysql.pid"
LOG_FILE="$DATA_DIR/mysql.err"
PORT="${DB_PORT:-3307}"

mkdir -p "$DATA_DIR"

if [ ! -d "$DATA_DIR/mysql" ]; then
  mysqld --initialize-insecure --datadir="$DATA_DIR"
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  echo "Local MySQL is already running on 127.0.0.1:$PORT"
  exit 0
fi

if mysql --protocol=TCP -h 127.0.0.1 --port="$PORT" -u root -e "SELECT 1" >/dev/null 2>&1; then
  echo "Local MySQL is already running on 127.0.0.1:$PORT"
  exit 0
fi

mysqld \
  --daemonize \
  --datadir="$DATA_DIR" \
  --port="$PORT" \
  --socket="$SOCKET" \
  --pid-file="$PID_FILE" \
  --log-error="$LOG_FILE" \
  --mysqlx=0

for _ in {1..30}; do
  if mysql --protocol=TCP -h 127.0.0.1 --port="$PORT" -u root -e "SELECT 1" >/dev/null 2>&1; then
    echo "Local MySQL started on 127.0.0.1:$PORT"
    exit 0
  fi

  sleep 1
done

echo "Local MySQL did not start. Check $LOG_FILE" >&2
exit 1
