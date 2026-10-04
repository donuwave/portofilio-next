# Three stages: build with everything, then copy only what is needed to run.
# The final image holds Next's "standalone" output (a traced, minimal node_modules)
# instead of the whole dependency tree, which keeps it small and quick to ship.

FROM node:22-bookworm-slim AS base
# Prisma's engines need OpenSSL.
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS builder
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
# Remember which Prisma CLI version the project uses, to install the same one below.
RUN node -p "require('prisma/package.json').version" > /prisma-version

FROM base AS runner
ENV NODE_ENV=production \
    UPLOADS_DIR=/data/uploads \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# The Prisma CLI is only needed for `migrate deploy` at start-up, and standalone output
# leaves it out, so it gets its own small install, separate from the app.
COPY --from=builder /prisma-version /tmp/prisma-version
RUN npm install --prefix /opt/prisma --no-audit --no-fund --omit=dev "prisma@$(cat /tmp/prisma-version)" \
  && rm -rf /root/.npm /tmp/prisma-version

# Run as the unprivileged `node` user, not root: if the app is ever compromised, the
# attacker gets a user that can write only the Next cache and the uploads folder.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/prisma ./prisma
# Creating the uploads folder here makes a fresh named volume inherit this ownership.
RUN mkdir -p /data/uploads && chown -R node:node /data
USER node
EXPOSE 3000

# Apply pending migrations, then start. Both are idempotent, so restarts are safe.
CMD ["sh", "-c", "node /opt/prisma/node_modules/prisma/build/index.js migrate deploy && exec node server.js"]
