# ES RUNABA Library Management System

This workspace contains a full-stack library management system for ES RUNABA school.

Structure:
- backend: Node.js + Express + MongoDB (Mongoose)
- frontend: React (Vite)

Quick start (local):

1) Backend

 - Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
 - Install and run:

```bash
cd backend
npm install
npm run dev
```

Default admin credentials are created automatically:

- username: admin
- password: admin123

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the frontend expects backend at `http://localhost:5000/api`. You can change the URL by setting `VITE_API_URL` in the frontend environment.

Deployment notes:
- Backend can be deployed to Render (set environment variables and MongoDB Atlas URI).
- Frontend can be deployed to Vercel; set `VITE_API_URL` to the deployed backend URL.

Features implemented:
- JWT auth with default admin
- Teacher CRUD with photo upload
- Book CRUD and stock management
- Cart-style borrow transactions
- Partial returns and stock restoration
- Overdue detection
- Basic dashboard

Next steps (suggested): run the apps locally, test flows, and polish UI or add tests.
