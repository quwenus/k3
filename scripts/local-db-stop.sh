#!/usr/bin/env bash
set -euo pipefail

PORT="${DB_PORT:-3307}"

mysqladmin --protocol=TCP -h 127.0.0.1 --port="$PORT" -u root shutdown
echo "Local MySQL stopped on 127.0.0.1:$PORT"
