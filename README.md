# ES RUNABA Library Management System

Full-stack library management system using React, Vite, Express, and Supabase PostgreSQL.

## Supabase Setup

1. Open the Supabase project dashboard and go to **SQL Editor**.
2. Run the schema in [`backend/supabase/schema.sql`](backend/supabase/schema.sql).
3. Copy `backend/.env.example` to `backend/.env` and set:
   - `SUPABASE_URL` from **Project Settings > API > Project URL**.
   - `SUPABASE_SERVICE_ROLE_KEY` from the project's API keys. This secret must stay in the backend and must never use a `VITE_` prefix.
   - `JWT_SECRET` to a long random value.

The schema creates the inventory, teacher, class, admin, and borrow tables plus transactional stock checkout/return functions. It does not import existing MongoDB records.

## Run Locally

From the repository root:

```powershell
Copy-Item backend/.env.example backend/.env
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:5000`.

On first startup with valid Supabase settings, the backend creates these default accounts if they do not exist:

- Librarian: `admin` / `admin123`
- IT manager: `itadmin` / `itadmin123`

Change the default passwords before using this with real data. Teacher photos are currently saved to the backend's local `uploads/` directory; use Supabase Storage or another persistent object store for production deployments.

## Deployment

The root `vercel.json` deploys the frontend and Express API as two services in one Vercel project. Import the repository with the project root set to the repository root (`./`).

In **Project Settings > Environment Variables**, add `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `JWT_SECRET` for Production (and Preview if needed). Keep the service-role key server-only. Remove any old `VITE_API_URL` value from the Vercel project so the frontend uses the same-domain `/api` route.

After a successful Production deployment, assign the production domain to that project. If the domain still says there is no production deployment, open **Deployments** and fix the latest failed deployment's build log before retrying.
