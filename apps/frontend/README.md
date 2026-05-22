# EcoFlow Frontend

## Run On Port 3000

```bash
cd apps/frontend
pnpm run dev -- --port 3000
```

App URL:

- http://localhost:3000

## Kill Port 3000 (Linux)

Use this if port 3000 is already in use:

```bash
fuser -k 3000/tcp
```

Alternative:

```bash
lsof -ti:3000 | xargs kill -9
```

## One Command (Kill + Run)

```bash
cd apps/frontend
(fuser -k 3000/tcp || true) && pnpm run dev -- --port 3000
```
