# ES RUNABA Library Management System

A full-stack library management system for ES RUNABA school built with Node.js + Express + MongoDB and React + Vite.

Deployed globally on Vercel with support for both local and production databases.

## Architecture

- **Backend**: Node.js + Express + MongoDB (Mongoose) — Deployed on Vercel
- **Frontend**: React (Vite) — Deployed on Vercel

## Quick Start (Local Development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Configure your `.env` file:
   - Set `MONGO_URI_LOCAL` to your local MongoDB connection (or use `MONGO_URI` for single URI)
   - Set `JWT_SECRET` to a secure random string
   - Set `NODE_ENV=development`

4. Install dependencies and start:
```bash
npm install
npm run dev
```

Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Install dependencies and start:
```bash
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## Production Deployment (Vercel)

Both backend and frontend are deployed on Vercel.

### Backend Environment Variables on Vercel
Set these in your Vercel project settings:
- `MONGO_URI_PRODUCTION`: Your MongoDB Atlas connection string
- `NODE_ENV`: production
- `JWT_SECRET`: Your secure JWT secret

### Frontend Environment Variables on Vercel
Set these in your Vercel project settings:
- `VITE_API_URL`: Your backend Vercel URL (e.g., https://your-backend.vercel.app/api)

## Database Configuration

The backend uses smart environment detection:
- **Local**: Connects to `MONGO_URI_LOCAL` when `NODE_ENV=development`
- **Production**: Connects to `MONGO_URI_PRODUCTION` when `NODE_ENV=production`
- **Fallback**: Uses `MONGO_URI` if set (for backward compatibility)

## Technologies

- MongoDB (Atlas for production, Local for development)
- Express.js
- React
- Vite
- JWT Authentication
- Multer (File uploads)
- Mongoose ODM

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
