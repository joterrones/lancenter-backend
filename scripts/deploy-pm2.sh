#!/usr/bin/env bash
# Despliegue en Ubuntu + PM2 (sin Docker), estilo Sol Redes / Credimax.
# Uso en el servidor: bash scripts/deploy-pm2.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Node $(node -v) en $ROOT"

if [ ! -f .env ]; then
  echo "ERROR: falta $ROOT/.env"
  echo "Copia .env.example a .env y configura DATABASE_URL, JWT_SECRET, ADMIN_*"
  exit 1
fi

npm install
npm run build

if pm2 describe node_lancenter >/dev/null 2>&1; then
  pm2 restart node_lancenter --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save
pm2 status
curl -sS "http://127.0.0.1:${PORT:-3600}/health" || true
echo
echo "Deploy Lancenter OK."
