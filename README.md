# World Mall - VIP Task/Order Management Platform

A complete multi-tenant VIP task and order management system with member, sub-admin, and owner roles. Built as a standalone, self-contained web application.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, tRPC |
| Database | PostgreSQL with Drizzle ORM |
| Auth | JWT-based authentication |
| i18n | English, Chinese (中文), Burmese (မြန်မာ) |

## Features

### Member Portal
- Register with invite code (required)
- Dashboard with balance, commission, VIP level, progress
- 40 sequential orders per VIP level (must complete in order)
- Each order shows product image, name, price, commission
- Deposit page with crypto addresses (USDT, BTC, ETH)
- Withdrawal page with wallet address
- Live chat with assigned sub-admin
- Multi-language support
- Profile and password management

### Admin Panel (Owner)
- Overview dashboard with key metrics
- Full user management (edit balance, VIP level, status)
- Deposit management (approve/reject)
- Withdrawal management (approve/reject)
- Chat with all members
- Sub-admin creation with auto-generated invite codes
- VIP order configuration (40 orders × 5 levels)
- Global deposit address settings
- Activity log

### Sub-Admin Panel
- Scoped dashboard (own members only)
- Own user, deposit, withdrawal management
- Independent VIP order settings
- Chat with own members
- Settings page

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Owner/Admin | `admin` | `worldmall@2024` |
| Sub-Admin (sample) | `subadmin1` | `subadmin123` |

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd world-mall
npm run install:all

# 2. Configure environment
cp .env.example server/.env
# Edit server/.env with your PostgreSQL connection string

# 3. Run database migration and seed
cd server
npm run db:migrate
npm run db:seed
cd ..

# 4. Start development servers
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/trpc

## Deployment on Render.com

### Option 1: Blueprint (Recommended)

1. Push this project to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and create:
   - A PostgreSQL database
   - A web service with auto-build

### Option 2: Manual Setup

1. **Create PostgreSQL Database:**
   - Go to Render → New → PostgreSQL
   - Note the Internal Database URL

2. **Create Web Service:**
   - Go to Render → New → Web Service
   - Connect your GitHub repo
   - **Build Command:**
     ```
     npm install && cd server && npm install && cd ../client && npm install && cd .. && npm run build
     ```
   - **Start Command:**
     ```
     cd server && npm run db:migrate && npm run db:seed && npm start
     ```
   - **Environment Variables:**
     - `DATABASE_URL` = (your PostgreSQL connection string)
     - `JWT_SECRET` = (generate a random string)
     - `NODE_ENV` = production
     - `CORS_ORIGIN` = *

### Option 3: Docker

```bash
docker build -t world-mall .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/worldmall \
  -e JWT_SECRET=your-secret-key \
  -e NODE_ENV=production \
  world-mall
```

## Deployment on VPS

```bash
# 1. Install Node.js 20 and PostgreSQL
# 2. Clone the project
git clone <repo-url>
cd world-mall

# 3. Install dependencies
npm run install:all

# 4. Build
npm run build

# 5. Set environment variables
export DATABASE_URL=postgresql://user:pass@localhost:5432/worldmall
export JWT_SECRET=your-super-secret-key
export NODE_ENV=production
export PORT=3000

# 6. Migrate and seed database
cd server
npm run db:migrate
npm run db:seed

# 7. Start the server
npm start
```

Use PM2 for process management:
```bash
npm install -g pm2
cd server
pm2 start dist/index.js --name world-mall
pm2 save
pm2 startup
```

## Project Structure

```
world-mall/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Shared components (Layout)
│   │   ├── i18n/           # Translations (en, zh, my)
│   │   ├── pages/
│   │   │   ├── auth/       # Login, Register
│   │   │   ├── member/     # Dashboard, Orders, Deposit, Withdraw, Chat, Settings
│   │   │   └── admin/      # Dashboard, Users, Deposits, Withdrawals, Chat, VIP Orders, SubAdmins, ActivityLog, Settings
│   │   ├── stores/         # Zustand auth store
│   │   └── utils/          # tRPC client
│   └── ...
├── server/                 # Express + tRPC backend
│   ├── src/
│   │   ├── db/             # Schema, connection, migration
│   │   ├── routes/         # tRPC routers (auth, member, admin, chat)
│   │   ├── seed/           # Database seeder
│   │   ├── utils/          # Auth utilities (JWT, bcrypt)
│   │   ├── trpc.ts         # tRPC initialization
│   │   └── index.ts        # Express server entry
│   └── ...
├── render.yaml             # Render.com blueprint
├── Dockerfile              # Docker deployment
└── README.md
```

## Business Rules

1. Members must register with a valid sub-admin invite code
2. Orders must be completed sequentially (1 → 2 → 3 ... → 40)
3. Each VIP level has its own set of 40 orders
4. Completing an order deducts the price and returns price + commission
5. Sub-admins can only view/manage their own members
6. Deposits require admin approval before balance is credited
7. Withdrawals freeze the amount until approved/rejected

## License

Proprietary - All rights reserved.
