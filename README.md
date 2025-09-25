# Kenya Referral Earning Platform (Crowd1-style)

A sleek, mobile-first referral platform for Kenya with M-Pesa STK push integration, gamification, admin panel, and professional fintech UI.

Tech stack:
- Frontend: Next.js (React), TailwindCSS, Framer Motion
- Backend: Node.js (Express)
- DB: PostgreSQL via Prisma ORM
- Auth: JWT + bcrypt
- Payments: M-Pesa Daraja (STK push) with a mock provider for development
- Hosting: Vercel/Netlify (frontend), Render/Railway (backend)


## Features
- Landing, Registration, Activation (KES 300 STK), Login
- Dashboard: balances, referrals list, network visual placeholder, leaderboard, notifications
- Deposit (STK), Withdraw (Fridays only), Auto deactivation > KES 2000 withdrawals until KES 300 reactivation
- Admin: users, referrals, deposits/withdrawals, approvals, settings, analytics placeholders
- Dark/Light mode, modern cards, transitions, mobile-first


## Monorepo Structure
```
/ (root)
├─ backend/
│  ├─ src/
│  │  ├─ server.js
│  │  ├─ routes/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  └─ middleware/
│  ├─ prisma/
│  ├─ package.json
│  └─ .env.example
├─ frontend/
│  ├─ src/app/
│  ├─ src/components/
│  ├─ package.json
│  ├─ tailwind.config.js
│  ├─ postcss.config.js
│  └─ next.config.js
├─ docker-compose.yml
├─ .env.example
└─ README.md
```


## Quickstart
1) Prereqs: Node 18+, Docker, pnpm or npm.

2) Start Postgres:
```
docker compose up -d
```

3) Configure env files
- Copy `.env.example` to `.env` at root and in `backend/.env` and `frontend/.env.local`. Fill values.

4) Install deps
```
# backend
cd backend && npm install
# setup prisma
npx prisma generate && npx prisma migrate dev --name init
# optional seed
node prisma/seed.js

# frontend
cd ../frontend && npm install
```

5) Run dev
```
# in two terminals
cd backend && npm run dev
cd frontend && npm run dev
```

Backend runs on http://localhost:4000
Frontend runs on http://localhost:3000


## Environment Variables
See `.env.example` (root), `backend/.env.example`, and `frontend/.env.local.example` for full lists.

Key settings:
- JWT_SECRET
- DATABASE_URL (postgres)
- MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL

For development, set `PAYMENTS_PROVIDER=mock` to simulate STK push.


## MPesa Daraja Notes
- In production, switch `PAYMENTS_PROVIDER=mpesa` and configure Daraja credentials.
- STK push is used for: Activation (KES 300), Deposits (variable), and Re-Activation (KES 300).


## Rules Implemented
- Withdrawals only on Fridays. Attempting on other days returns a friendly message.
- If total withdrawals exceed KES 2000, the account becomes inactive. Next withdrawal is blocked until a KES 300 re-activation payment.
- Referral: Each activated referral gives 100 KES to the referrer.
- Fraud checks: block self-referrals and duplicate activations.


## Scripts
- Backend: `npm run dev` (nodemon), `npm run start`
- Frontend: `npm run dev`, `npm run build`, `npm run start`


## Security
- Passwords hashed with bcrypt
- JWT auth on API endpoints
- CORS configured to allow frontend origin


## Design System
- Tailwind with a fintech palette
- Inter font, dark/light toggle
- Framer Motion transitions


## Disclaimer
This project includes a mock payment provider for local development. Confirm all regulatory and compliance requirements (KYC/AML, data protection) before going live.
