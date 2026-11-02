FROM node:22.16.0-alpine3.21

WORKDIR /app

# O contexto de build do Compose contém apenas o entrypoint de infraestrutura.
RUN mkdir -p /app/node_modules && chown -R node:node /app
COPY --chmod=755 container-entrypoint.sh /usr/local/bin/gamecompanion-entrypoint

ENV NPM_CONFIG_CACHE=/tmp/npm-cache
USER node
ENTRYPOINT ["/usr/local/bin/gamecompanion-entrypoint"]

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--config", "/app/node_modules/.vite-local/vite.config.ts"]
