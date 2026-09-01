<h1 align="center">UzCombinator Research Lab (Loss Aversion & CPT)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue.svg" alt="React">
  <img src="https://img.shields.io/badge/Vite-5.0-purple.svg" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Express.js-4.18-green.svg" alt="Express">
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E.svg" alt="Supabase">
</p>

<p align="center">
  A comprehensive, modern platform for conducting psychological and behavioral research. Currently optimized for dynamic surveys, <b>Loss Aversion</b>, and <b>Cumulative Prospect Theory (CPT)</b> assessments.
</p>

---

## 🚀 Key Features

* **Dynamic Survey Engine**: Construct multi-block surveys with complex conditional logic, required fields, and multiple question types (short text, numbers, single/multiple choice, sliders).
* **CPT Builder**: Specialized interface for designing complex lottery scenarios. Allows researchers to dynamically calculate α (Alpha), β (Beta), and λ (Lambda) parameters based on user gambling choices.
* **Modern Admin Dashboard**: Visualize data via advanced Recharts, manage live surveys, export CPT analysis in CSV, and oversee respondent records.
* **Responsive & Accessible**: Fully optimized for mobile, tablet, and desktop devices utilizing TailwindCSS utility classes.
* **Robust Backend**: Node.js & Express REST API interacting seamlessly with a scalable Supabase PostgreSQL database.

## 🏗 Architecture Overview

This project is a monorepo consisting of:

* **`/frontend`**: React + Vite + TypeScript. It handles both the public-facing survey application and the protected researcher dashboard.
* **`/backend`**: Node.js + Express. Implements a scalable controller/service architecture, JWT middleware, and backend CPT analytics computations.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 19, Vite, TypeScript
- **Styling**: TailwindCSS, Framer Motion, Lucide React
- **Routing**: React Router DOM
- **Data Viz**: Recharts
- **Testing**: Playwright (E2E)

### Backend
- **Environment**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Security**: Helmet, CORS, JSONWebToken (JWT)
- **Testing**: Jest, Supertest

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)
- A [Supabase](https://supabase.com/) account and project.

## 💻 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:uralov0gabek/ResearchLab.git
   cd loss-aversion-research
   ```

2. **Environment Variables Configuration:**
   Copy the `.env.example` in the root directory to a `.env` file, and populate it with your specific Supabase and Server details:
   ```bash
   cp .env.example .env
   ```

3. **Install and Run Backend:**
   ```bash
   cd backend
   npm install
   # Start the Express server on http://localhost:5000
   npm run start 
   ```

4. **Install and Run Frontend:**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   # Start the Vite development server on http://localhost:5173
   npm run dev
   ```

## 🧪 Testing

We employ rigorous testing strategies across both ends:
- **Backend**: Run `npm test` inside the `/backend` folder to execute Jest API and unit tests.
- **Frontend/E2E**: Playwright End-to-End automation is configured. You can execute `npx playwright test` in the root (ensure your server is running). *Note: Test results and directories are ignored from git tracking.*

## 🚢 Deployment Configuration

- **Frontend (Vercel)**: Connect your repository, set the build command to `npm run build`, and set the root directory to `/frontend`.
- **Backend (Render / Railway)**: Connect your repository, point to the `/backend` directory, set the start command to `npm run start`, and inject the backend environment variables.

---
*Developed by Nurbek Saliyev for advanced behavioral studies.*
