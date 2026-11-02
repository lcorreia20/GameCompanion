#!/bin/sh
set -eu

# npm ci e os artefatos temporários do Vite ficam no volume node_modules.
npm ci
mkdir -p /app/node_modules/.vite-local
cp /app/vite.config.ts /app/node_modules/.vite-local/vite.config.ts
exec "$@"
