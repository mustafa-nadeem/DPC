# DPC Backend

Express + PostgreSQL API for the Daventry clinic review-first booking portal.

## Setup

1. Copy `.env.example` to `.env` and set values, including Supabase keys.
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Run migrations:
   - `npm run prisma:migrate`
5. Seed admin user + sample data:
   - `npm run seed`
6. Start API:
   - `npm run dev`

API base URL: `http://localhost:4000/api`

Supabase frontend env (root `.env`):
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_BASE_URL`
