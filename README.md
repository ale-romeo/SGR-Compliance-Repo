## SGR Catalog — README

Applicazione full‑stack sicura per la gestione di un catalogo prodotti con categorie. Include backend (NestJS + Prisma + PostgreSQL), frontend (React + Vite + Tailwind), Docker Compose per l’avvio rapido, lint/test/CI e dati di seed.

—

## Avvio rapido

Hai due opzioni equivalenti: con Docker (consigliato) o in locale senza Docker.

### Opzione A — Docker Compose (consigliata)

Prerequisiti: Docker + Docker Compose.

- Servizi esposti:
  - Frontend: http://localhost:5173
  - API: http://localhost:3000/api/v1

```bash
docker compose up --build
```

Opzionale: popola il database con dati realistici.

```bash
docker compose exec api npm run prisma:seed
```

Check rapidi:

- Health API: http://localhost:3000/api/v1/health
- Swagger (in dev): http://localhost:3000/api-docs

Stop e pulizia (facoltativi):

```bash
docker compose down -v
```

### Opzione B — Avvio locale (senza Docker)

Prerequisiti: Node 20+, PostgreSQL 16+.

1) Backend

- Copia la configurazione e imposta le variabili ambiente:

```bash
cd backend
cp .env.example .env
# Assicurati che DATABASE_URL punti al tuo Postgres locale
```

- Installa, genera client Prisma, migra il DB, avvia in watch:

```bash
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

- Popola dati di esempio (opzionale):

```bash
npm run prisma:seed
```

2) Frontend

- Imposta l’endpoint API (già pronto in `.env.development`):

```bash
cd ../frontend
# .env.development include VITE_API_BASE_URL=http://localhost:3000/api/v1
npm ci
npm run dev
```

—

## Struttura del progetto

```
SGR-Compliance-Repo/
├─ backend/              # API NestJS + Prisma
│  ├─ src/
│  │  ├─ main.ts         # bootstrap con Helmet, CORS, Swagger (dev)
│  │  ├─ app.module.ts   # moduli principali
│  │  ├─ health.controller.ts
│  │  ├─ prisma/         # PrismaService
│  │  ├─ products/       # CRUD prodotti + list con filtri/sort/paginazione
│  │  └─ categories/     # list + create categorie
│  ├─ prisma/
│  │  ├─ schema.prisma   # schema DB (Product/Category)
│  │  └─ seed.ts         # dati realistici + created_at variabili
│  ├─ .env.example       # variabili (DB, CORS, rate limit, …)
│  └─ Dockerfile
├─ frontend/             # React + Vite + Tailwind
│  ├─ src/
│  │  ├─ main.tsx, App.tsx
│  │  ├─ pages/          # ProductsList, Categories, ProductForm (route dedicata)
│  │  ├─ components/     # Layout, Modal, ProductForm (riusabile nei modal)
│  │  └─ lib/            # api axios, queryClient
│  ├─ .env.development   # VITE_API_BASE_URL locale
│  ├─ .env.production    # VITE_API_BASE_URL per build container (Nginx)
│  └─ Dockerfile         # build + Nginx serve SPA
├─ docker-compose.yml    # db + api + web con healthcheck
└─ README.md
```

—

## Scelte tecniche e sicurezza

- Validazione robusta con Zod (nestjs-zod): tutti i DTO usano schemi dichiarativi e sicuri.
- Sicurezza HTTP: Helmet (header sicuri), CORS ristretto all’origin del FE, Throttler configurabile (rate limit).
- Error handling: mapping esplicito errori Prisma (P2002, P2025) in eccezioni HTTP coerenti.
- Tipi e lint: TypeScript strict, ESLint + Prettier in BE/FE; rimozione di any non necessari; path alias sicuri.
- DB sicuro: PostgreSQL con migrazioni Prisma e seed controllato; campi indicizzati (created_at, price, category_id).
- Dev vs Prod: Swagger abilitato solo in dev; FE servito da Nginx nel container.

—

## Backend (NestJS + Prisma)

- Entità principali:
  - Category: id, name (unique)
  - Product: id, name, price(Decimal), tags(string[]), created_at, category_id opzionale

- Endpoints chiave:
  - GET /api/v1/products
    - Query: search, categoryId, minPrice, maxPrice, sortBy(price|created_at), sortOrder(asc|desc), page, pageSize
  - GET /api/v1/products/:id
  - POST /api/v1/products
  - PUT /api/v1/products/:id
  - DELETE /api/v1/products/:id
  - GET /api/v1/categories
  - POST /api/v1/categories
  - GET /api/v1/health

- Filtri/ordinamento/paginazione: eseguiti lato server con Prisma, transazioni per count + findMany.
- Validazioni: Zod su query/body; price coerced number ≥ 0; UUID per categoryId.
- Sicurezza: Helmet, CORS controllato via `CORS_ORIGIN`, (opz.) Throttler.
- DevX: Swagger su /api-docs (dev), seed con timestamp distribuiti per vedere il sort.

Comandi utili (backend):

```bash
npm run prisma:generate   # genera client
npm run prisma:migrate    # migrazioni in dev
npm run prisma:deploy     # applica migrazioni in ambienti non interattivi
npm run prisma:seed       # popola DB
npm run lint && npm run build && npm test
```

—

## Frontend (React + Vite + Tailwind)

- Librerie:
  - React 18, Vite 5, Tailwind 3
  - TanStack Query: cache/query di rete con invalidation dopo mutate
  - Axios: client HTTP (`src/lib/api.ts`) con `VITE_API_BASE_URL`

- Funzioni implementate:
  - Elenco prodotti con: ricerca, filtro categoria, min/max price, ordinamento (price/created_at), paginazione, vista tabella o card.
  - Creazione/modifica prodotto in modal (riuso di `components/ProductForm`).
  - Pagina Categorie (list + create) con validazione base e gestione errori server.
  - Sincronizzazione filtro/sort con URL; formattazione prezzo in €.

Comandi utili (frontend):

```bash
npm run dev          # avvio locale vite
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run build        # build produzione
```

—

## Come i requisiti sono stati soddisfatti

- Prodotti: CRUD completo; campi richiesti presenti; validazioni (name obbligatorio, price ≥ 0, category_id se presente dev’essere valido)
- Listing server‑side: ricerca case‑insensitive, filtro categoria, min/max price, sort per price|created_at, paginazione con page/pageSize e total.
- Categorie: list + create, unique name con gestione conflitto (409).
- Frontend: UI con filtri/sort/paginazione, stati (loading/error), modali per create/edit; categorie gestite; UX sobria.
- DB: PostgreSQL con Prisma, migrazioni, seed realistico (timestamp vari) e indici utili.
- Avvio: Docker Compose pronto (db+api+web), più avvio locale documentato; variabili via `.env`/`.env.development`.
- Sicurezza: Zod validation, Helmet, CORS ristretto, (pronto) rate limit.
- Qualità: ESLint/Prettier, unit test backend (filtri/sort/pagination, mapping errori), CI su GitHub Actions con Postgres service.

—

## Configurazione e variabili d’ambiente

- Backend (`backend/.env`):
  - `DATABASE_URL=postgresql://app_user:app_password@localhost:5432/app_db?schema=public`
  - `CORS_ORIGIN=http://localhost:5173`
  - `RATE_LIMIT_TTL`, `RATE_LIMIT_MAX` (opz.)
  - `JWT_*` placeholder per futuri sviluppi

- Frontend:
  - `frontend/.env.development` → `VITE_API_BASE_URL=http://localhost:3000/api/v1`
  - `frontend/.env.production` → `VITE_API_BASE_URL=/api/v1` (Nginx proxy)

—

## CI, lint e test

- GitHub Actions: job separati per backend e frontend; Postgres come service; Prisma generate/deploy in CI.
- Lint/format: ESLint + Prettier in entrambi i progetti.
- Test backend: unit + e2e basilari; esecuzione in CI.

Esecuzione locale:

```bash
# Backend
cd backend
npm run lint && npm run build && npm test

# Frontend
cd ../frontend
npm run lint && npm run typecheck && npm run build
```

