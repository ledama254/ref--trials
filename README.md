# Kenya Referral Earning Platform

A sleek referral platform for Kenya with M-Pesa STK push integration, gamification, and a clean UI.

Tech stack:
- Frontend: Static HTML/CSS/JS in `docs/` (deployed to GitHub Pages)
- Backend: Node.js (Express) in `backend/`
- DB: PostgreSQL via Prisma ORM
- Auth: JWT + bcrypt
- Payments: M-Pesa Daraja (STK push) with a mock provider for development
- Hosting: GitHub Pages (frontend), Render/Railway/VPS (backend)


## Features
- Landing, Registration, Activation (KES 300 STK), Login
- Dashboard: balances, referrals list, network visual placeholder, leaderboard, notifications
- Deposit (STK), Withdraw (Fridays only), Auto deactivation > KES 2000 withdrawals until KES 300 reactivation
- Admin: users, referrals, deposits/withdrawals, approvals, settings, analytics placeholders
- Dark/Light mode, modern cards, transitions, mobile-first


## Repository Structure
```
/(root)
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
├─ docs/                 # Static site for GitHub Pages
│  ├─ index.html
│  ├─ register.html
│  ├─ login.html
│  ├─ activate.html
│  ├─ dashboard.html
│  ├─ styles.css
│  ├─ app.js
│  └─ config.js         # Set BACKEND_URL here (public API URL)
├─ .github/workflows/pages.yml  # Auto-deploy docs/ to GitHub Pages
├─ docker-compose.yml    # Optional: local Postgres
└─ README.md
```


## Quickstart (Backend API)
1) Prereqs: Node 18+, Docker (optional), npm.

2) Start Postgres (optional for local):
```
docker compose up -d
```

3) Configure env
- Copy `backend/.env.example` to `backend/.env` and fill values.

4) Install deps and setup Prisma
```
cd backend
npm install
npx prisma generate && npx prisma migrate dev --name init
node prisma/seed.js  # optional
npm run dev          # or: npm start
```

Backend runs on http://localhost:4000


## Environment Variables
See `backend/.env.example` for full list.

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


## Frontend (GitHub Pages)
The static site lives in `docs/` and is deployed via GitHub Pages.

1) Set your backend API URL in `docs/config.js`:
```
window.APP_CONFIG = { BACKEND_URL: "https://api.yourdomain.com" };
```

2) Ensure your backend CORS allows your Pages origin (e.g. `https://YOUR_USERNAME.github.io`) via `FRONTEND_URL` or `FRONTEND_URLS`.

3) Push to `main`/`master`. The workflow at `.github/workflows/pages.yml` publishes `docs/` automatically.


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
