# 🔬 Research Lab (Loss Aversion & CPT Survey Platform)

Research Lab is a dedicated and secure survey platform designed to conduct economic research, including testing behavioral economics theories such as Loss Aversion and Cumulative Prospect Theory (CPT).

This system allows participants to take tests based on complex logic, securely stores their responses, and provides researchers with an Admin Panel for deep analysis.

---

## 🛠 Tech Stack

### 🎨 Frontend

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite
- **Styling & UI:** Tailwind CSS, Radix UI (modern design)
- **Routing:** React Router DOM
- **Security:** Client-side XSS protection, Supabase Auth

### ⚙️ Backend

- **Environment:** Node.js + Express.js
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase JWT Auth (Token-based)
- **Security:**
  - `express-rate-limit` (DDoS & Spam protection)
  - `cors` (Strict Cross-Origin rules)
  - `helmet` (HTTP header security)
  - `hpp` (HTTP Parameter Pollution prevention)

---

## 📂 Project Structure

The project is structured as a monorepo containing frontend, backend, and database logic:

```text
research-lab/
│
├── frontend/                # React/Vite Application
│   ├── src/                 # Main UI code (Components, Pages)
│   ├── .env.example         # Required configuration for frontend
│   └── package.json
│
├── backend/                 # Node.js/Express API Server
│   ├── src/
│   │   ├── routes/          # API routes (e.g., /api/questions, /api/responses)
│   │   ├── middlewares/     # Security and Error handlers
│   │   └── config/          # Database connections (Supabase)
│   ├── .env.example         # Required configuration for backend
│   └── package.json
│
├── supabase/                # Database configuration
│   ├── schema.sql           # Database schema definition
│   └── README.md            # Database setup instructions
│
└── .gitignore               # Root git ignore
```

---

## 🚀 Setup & Run Locally

Follow these steps to set up the project on your local machine.

### 1. Clone the repository

```bash
git clone https://github.com/uralov0gabek/ResearchLab.git
cd ResearchLab
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Update the backend `.env` file with your credentials:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb...  # WARNING: Keep this secret!
SUPABASE_JWT_SECRET=your-jwt-secret # From Supabase Auth settings

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
npm install
```

Copy the example environment file:

```bash
cp .env.example .env
```

Update the frontend `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...  # Public API key
```

Start the frontend server:

```bash
npm run dev
```

The application should now be running at `http://localhost:5173`.

---

## ☁️ Deployment

### Database (Supabase)

Apply the `supabase/schema.sql` to your Supabase project using the SQL Editor to set up the necessary tables and RLS policies.

### Backend (Render / Vercel)

The backend includes a `render.yaml` for deployment on Render. Make sure to configure the environment variables correctly in the Render dashboard, particularly `SUPABASE_SERVICE_ROLE_KEY`.

### Frontend (Vercel)

The frontend is configured for deployment on Vercel (includes `vercel.json`). Remember to configure the `VITE_*` environment variables in your Vercel project settings.

---

## 🔒 Security & RBAC (Role-Based Access Control)

The platform implements strict security protocols:

- **Admin Access:** There is no public registration. Admins must be invited or added manually via the Supabase Dashboard. Only users with valid JWT tokens can access admin features or modify backend data.
- **Secret Keys:** The `SUPABASE_SERVICE_ROLE_KEY` is securely stored in the backend. The frontend only uses the safe `ANON_KEY`.
- **Rate Limiting:** IP addresses are limited to 10,000 requests per 15 minutes to prevent DDoS and spam.

---

## 📜 License & Copyright

This system was developed for academic and personal research purposes.
**Author:** Og'abek Uralov (Research Lab)
