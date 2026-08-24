# Research Lab

A comprehensive platform for conducting psychological and behavioral research, currently focusing on Loss Aversion and Prospect Theory.

## Architecture Overview

The project is structured as an enterprise-grade monorepo containing:
- **`/frontend`**: React + Vite + TailwindCSS + TypeScript application. Features a dynamic survey engine and administrative dashboard.
- **`/backend`**: Node.js + Express + Supabase API. Built with a robust Controller-Service-Route architecture to handle complex logic, such as Cumulative Prospect Theory (CPT) math evaluations.

## Tech Stack

- **Frontend**: React (v19), Vite, TypeScript, TailwindCSS, React Router, Recharts, Framer Motion
- **Backend**: Node.js, Express, Supabase JS Client, JWT, Helmet
- **Database**: Supabase (PostgreSQL)

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A Supabase account and project

## Local Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd loss-aversion-research
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Setup Environment Variables:**
   - Copy `backend/.env.example` to `backend/.env` and fill in your Supabase credentials.
   - Copy `frontend/.env.example` to `frontend/.env` and ensure the API URL is correct.

5. **Start Development Servers:**
   - **Backend**: `cd backend && npm run start` (Runs on http://localhost:5000)
   - **Frontend**: `cd frontend && npm run dev` (Runs on http://localhost:5173)

## Environment Variables

See the `.env.example` files in both the `/frontend` and `/backend` directories for required configuration keys.

## Deployment

- **Backend**: Deployed on Render (see `backend/render.yaml`).
- **Frontend**: Deployed on Vercel. Connect the GitHub repository and set the root directory to `/frontend`.
