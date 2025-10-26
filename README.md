# Mini Catalogo Prodotti

**Obiettivo:** realizzare una piccola applicazione **full-stack** (frontend + backend + database) per la gestione di un catalogo prodotti con categorie.

---

## Requisiti

### Funzionalità
- **Prodotti**
  - Campi minimi: `id`, `name`, `price`, `category_id`, `tags`, `created_at`.
  - Operazioni: list, get by id, create, update, delete.
  - List: ricerca testuale, filtro per categoria, filtro per prezzo minimo/massimo, ordinamento per prezzo o data di creazione, paginazione.
  - Validazioni: `name` obbligatorio; `price` ≥ 0; `category_id` valido se presente.

- **Categorie**
  - Campi minimi: `id`, `name`.
  - Operazioni: list, create.

- **Frontend**
  - Vista elenco prodotti con ricerca/filtri/ordinamento/paginazione.
  - Form creazione/modifica prodotto.
  - Visualizzazione chiara degli stati (caricamento/errore/successo).

- **Backend**
  - API REST con routing chiaro e status code coerenti.
  - Filtri, ordinamento e paginazione gestiti lato server.

- **Database**
  - Persistenza relazionale (PostgreSQL consigliato; in alternativa SQLite).
  - Migrazioni o script di inizializzazione.

- **Avvio**
  - Preferibile utilizzo di **Docker/Docker Compose** per avvio rapido (app + DB).
  - Variabili di ambiente tramite file dedicato (es. `.env.example`).

---

## Consegna (obbligatoria su GitHub)

1. Pubblica il progetto in una **repository GitHub** (pubblica o privata con accesso fornito su richiesta).
2. Includi:
   - Codice **frontend** e **backend**.
   - **`README.md`** con istruzioni di avvio (Docker e avvio locale), configurazione variabili, comandi per migrazioni/seed, e comandi test.
   - **`docker-compose.yml`** e relativi **Dockerfile**.
   - Migrazioni o script DB; file `.env.example`.
3. Usa **commit granulari** con messaggi chiari; evita un unico commit cumulativo.
4. Tagga una release (es. `v0.1`) o fornisci branch di consegna dedicata.

---

## Vincoli

- **Stack:** a scelta (linguaggi e framework liberi).
- **Qualità attesa:** struttura chiara, coerenza stilistica, gestione errori, documentazione minima essenziale.

---

## Criteri di valutazione

- **Completezza funzionale**  
- **Qualità e organizzazione del codice**  
- **Correttezza API e validazioni**  
- **UX essenziale del frontend**  
- **Developer Experience (README, avvio rapido, migrazioni/test di base)**

---

## Avvio rapido (Docker Compose)

Prerequisiti: Docker e Docker Compose.

1. Build e avvio stack (DB + API + Frontend)
  - Il frontend viene esposto su http://localhost:5173
  - L'API è su http://localhost:3000/api/v1

```
docker compose up --build
```

2. (Opzionale) Popola il DB con dati di esempio

```
docker compose exec api npm run prisma:seed
```

3. Verifica lo stato
  - API health: http://localhost:3000/api/v1/health
  - Swagger (dev): http://localhost:3000/api-docs

## Avvio locale (senza Docker)

Backend:

```
cd backend
npm ci
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

Frontend:

```
cd frontend
npm ci
npm run dev
```

## Lint, build, test

Backend:

```
cd backend
npm run lint
npm run build
npm test
```

Frontend:

```
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Sicurezza e validazione

- Validazione request tramite Zod pipes per DTO
- CORS limitato all'origin del frontend
- Helmet abilitato
- Rate limiting configurabile con Throttler (abilitabile facilmente)

## Note

- La variabile `VITE_API_BASE_URL` può essere impostata in build del frontend Docker per puntare all'API (default: `http://localhost:3000/api/v1`).
- Lo seed assegna anche timestamp diversi ai prodotti per evidenziare l'ordinamento per data.