# Deployment Guide

## Backend (Render)
1. Push this repository to GitHub.
2. In Render, create a new `Blueprint` service and select this repo.
3. Render will detect `render.yaml` and create `student-ms-backend`.
4. Set secret environment variables in Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_USERNAME`
   - `CORS_ORIGIN` (your Vercel frontend URL)
5. Deploy and copy the backend URL (for example `https://student-ms-backend.onrender.com`).

## Frontend (Vercel)
1. Import this repo into Vercel.
2. Set project root directory to `frontend`.
3. Add environment variable:
   - `VITE_API_URL` = your Render backend URL
4. Deploy.

## Notes
- SPA routing is handled by `frontend/vercel.json`.
- Backend health check endpoint is `GET /health`.
