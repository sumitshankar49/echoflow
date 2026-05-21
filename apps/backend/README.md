# EchoFlow Backend Setup (NestJS + MySQL)

This guide explains the full process to run the backend with MySQL username/password auth.

## 1) Prerequisites

- Node.js 20+ and npm
- MySQL server running on port `3306`
- Linux/macOS terminal (commands below)

## 2) Install dependencies

From backend folder:

```bash
cd /home/candy-sync/Documents/Personal/ecoflow/apps/backend
npm install
```

## 3) Create MySQL database and user (password auth)

Open MySQL as admin:

```bash
sudo mysql
```

Run these SQL commands:

```sql
CREATE DATABASE IF NOT EXISTS echoflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'echoflow_user'@'localhost' IDENTIFIED BY 'echoflow_pass';
ALTER USER 'echoflow_user'@'localhost' IDENTIFIED BY 'echoflow_pass';

GRANT ALL PRIVILEGES ON echoflow.* TO 'echoflow_user'@'localhost';
FLUSH PRIVILEGES;

SHOW DATABASES LIKE 'echoflow';
SHOW GRANTS FOR 'echoflow_user'@'localhost';
```

Exit:

```sql
EXIT;
```

Optional verification from terminal:

```bash
mysql -h 127.0.0.1 -P 3306 -u echoflow_user -pechoflow_pass -D echoflow -e "SHOW TABLES;"
```

## 4) Configure environment

Create or update `.env` in backend root with:

```env
NODE_ENV=development
PORT=4000
API_PREFIX=api
APP_NAME=EchoFlow Backend

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=echoflow_user
DB_PASSWORD=echoflow_pass
DB_NAME=echoflow
DB_SYNCHRONIZE=true
DB_LOGGING=false

JWT_ACCESS_SECRET=jt-access-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=jt-refresh-secret
JWT_REFRESH_EXPIRES_IN=1d

SWAGGER_ENABLED=true
SWAGGER_PATH=api/docs
SWAGGER_TITLE=EchoFlow API
SWAGGER_DESCRIPTION=Smart real-time personal memory assistant backend API
SWAGGER_VERSION=1.0.0
```

## 5) Build and run

```bash
npm run build
npm run start:dev
```

Available scripts:

- `npm run start:dev` -> watch mode
- `npm run start` -> normal start
- `npm run build` -> compile TypeScript

## 6) Verify API is working

Health check:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{"status":"ok"}
```

Swagger docs:

- http://localhost:4000/api/docs

Test register endpoint:

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"StrongPass123!"}'
```

## 7) Troubleshooting

### Access denied for user `echoflow_user`

Run MySQL grant commands again:

```bash
sudo mysql -e "ALTER USER 'echoflow_user'@'localhost' IDENTIFIED BY 'echoflow_pass';"
sudo mysql -e "GRANT ALL PRIVILEGES ON echoflow.* TO 'echoflow_user'@'localhost'; FLUSH PRIVILEGES;"
```

### Database connection refused

- Ensure MySQL service is running:

```bash
sudo systemctl status mysql
```

- Start it if needed:

```bash
sudo systemctl start mysql
```

### Tables not created

- Ensure `DB_SYNCHRONIZE=true` in `.env`
- Restart backend after changing `.env`

---

For local development only, keep `DB_SYNCHRONIZE=true`.
For production, use migrations and set `DB_SYNCHRONIZE=false`.
