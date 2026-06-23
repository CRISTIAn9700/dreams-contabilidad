#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Uso: ./scripts/publicar-github-pages.sh https://github.com/USUARIO/dreams-contabilidad.git"
  exit 1
fi

REMOTE_URL="$1"

git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE_URL"
git branch -M main
git push -u origin main

echo "Proyecto subido. Ahora activa GitHub Pages con GitHub Actions en Settings > Pages."
