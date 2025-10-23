# SGR Catalog API (NestJS + Prisma)

Backend scaffold per l'applicazione "Mini Catalogo Prodotti".

## Stack
- NestJS (TypeScript)
- Prisma ORM + PostgreSQL
- Swagger (dev)
- Helmet, CORS, Rate limiting

## Variabili ambiente
Copia `.env.example` in `.env` e personalizza i valori (DATABASE_URL, CORS_ORIGIN, NODE_ENV, RATE_LIMIT_*).

## Comandi principali
- install: `npm install`
- prisma generate: `npm run prisma:generate`
- migrazioni dev: `npm run prisma:migrate`
- seed: `npm run prisma:seed`
- avvio dev: `npm run start:dev`
- build: `npm run build`
- avvio prod: `node dist/main.js`

Swagger: http://localhost:3000/api-docs (solo in dev)
Healthcheck: http://localhost:3000/health

## Docker
Dal root della repo: `docker compose up --build` per avviare DB e API.

## Prossimi passi (da implementare)
- Modulo categories: GET /categories, POST /categories
- Modulo products: CRUD completo, list con filtri/ordinamento/paginazione
- Auth JWT (opzionale) con RBAC per mutazioni
- Test: unit/integration
