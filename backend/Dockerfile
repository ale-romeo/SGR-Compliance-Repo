FROM node:22-bookworm-slim AS build
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then npm i -g pnpm@9 && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; else npm i; fi
COPY . .
RUN npx prisma generate && rm -f tsconfig.build.tsbuildinfo && npm run build

FROM node:22-bookworm-slim AS runner
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
# Sanity check: ensure build artifact exists in the image
RUN test -f /app/dist/main.js || (echo 'ERROR: dist/main.js not found in runner image' && ls -la /app && ls -la /app/dist || true && exit 1)
EXPOSE 3000
CMD ["node", "dist/main.js"]
