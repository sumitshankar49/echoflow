# EcoFlow Frontend

## Run On Port 3000

```bash
cd apps/frontend
pnpm run dev -- --port 3000
```

App URL:

- http://localhost:3000

## Google Login Env

Create `.env.local` in frontend root and add:

```env
NEXT_PUBLIC_GOOGLE_AUTH_URL=http://localhost:4000/api/auth/google
```

Where it is used:

- `Continue with Google` button in login form.
- Source: `src/features/auth/flows/manage/login/use-login-form.ts`.

If this variable is missing, the app shows a toast saying Google sign-in is not configured.

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
