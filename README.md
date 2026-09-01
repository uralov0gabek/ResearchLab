# 🔬 Research Lab (Loss Aversion & CPT Survey Platform)

Research Lab - bu iqtisodiy tadqiqotlar, jumladan yo'qotishdan qochish (Loss Aversion) va Kumulyativ Istiqbol Nazariyasi (Cumulative Prospect Theory - CPT) kabi xulq-atvor iqtisodiyoti nazariyalarini sinovdan o'tkazish uchun mo'ljallangan maxsus va xavfsiz so'rovnoma (survey) platformasidir.

Bu tizim ishtirokchilarga murakkab mantiqqa asoslangan testlar o'tkazish, ularning javoblarini xavfsiz saqlash hamda tadqiqotchilarga chuqur tahlillar uchun qulay bo'lgan boshqaruv paneli (Admin Panel) taqdim etish imkonini beradi.

---

## 🛠 Texnologiyalar To'plami (Tech Stack)

### 🎨 Frontend (Mijoz qismi)
- **Framework:** React 18 + TypeScript
- **Build tool:** Vite (Tezkor va optimallashtirilgan)
- **Styling & UI:** Tailwind CSS, Shadcn UI, Radix UI (Zamonaviy va qulay dizayn)
- **Routing:** React Router DOM
- **Xavfsizlik:** Client-side XSS himoyasi, Supabase Auth

### ⚙️ Backend (Server qismi)
- **Muhit:** Node.js + Express.js
- **Ma'lumotlar bazasi (DB):** Supabase (PostgreSQL)
- **Autentifikatsiya:** Supabase JWT Auth (Tokenga asoslangan tekshiruv)
- **Xavfsizlik (Security):** 
  - `express-rate-limit` (DDoS va Spamlardan himoya)
  - `cors` (Qat'iy Cross-Origin qoidalari)
  - `helmet` (HTTP sarlavhalarini himoyalash)
  - `hpp` (Parametrlarni ifloslanishidan himoya)

---

## 📂 Loyiha Tuzilmasi (Project Structure)

Loyiha ikkita mustaqil qismga bo'lingan (Monorepo uslubida):

```text
research-lab/
│
├── frontend/                # React/Vite ilovasi
│   ├── src/                 # Asosiy UI kodlari (Komponentlar, Sahifalar)
│   ├── .env.example         # Frontend uchun zarur sozlamalar namunasi
│   └── package.json
│
├── backend/                 # Node.js/Express API serveri
│   ├── src/
│   │   ├── routes/          # API yo'llari (masalan: /api/questions, /api/responses)
│   │   ├── middlewares/     # Xavfsizlik (Auth, Error handler)
│   │   └── config/          # Supabase kabi xizmatlarga ulanish
│   ├── .env.example         # Backend uchun zarur sozlamalar namunasi
│   └── package.json
│
└── .gitignore               # Umumiy e'tiborga olinmaydigan fayllar ro'yxati
```

---

## 🚀 O'rnatish va Ishga Tushirish (Setup & Run)

Lokal muhitda (o'z kompyuteringizda) ishga tushirish uchun quyidagi qadamlarni bajaring.

### 1. Repozitoriyni yuklab olish
```bash
git clone https://github.com/uralov0gabek/ResearchLab.git
cd ResearchLab
```

### 2. Backend ni sozlash va ishga tushirish
Backend papkasiga o'ting va kerakli paketlarni o'rnating:
```bash
cd backend
npm install
```

Backend ichida `.env` faylini yarating (yoki `.env.example` dan nusxa oling) va quyidagi ma'lumotlarni to'ldiring:
```env
# Database Configuration (Supabase)
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhb...  # DIQQAT: Sir saqlang!
SUPABASE_JWT_SECRET=your-jwt-secret # Supabase sozlamalaridagi JWT secret

# Server Configuration
PORT=5000

# CORS Configuration (Faqat shu URL lar backendga ulana oladi)
FRONTEND_URL=http://localhost:5173
```
Serverni ishga tushiring:
```bash
npm run dev
```

### 3. Frontend ni sozlash va ishga tushirish
Yangi terminal ochib, frontend papkasiga o'ting:
```bash
cd frontend
npm install
```

Frontend ichida `.env` faylini yarating va quyidagi ma'lumotlarni to'ldiring:
```env
# API Endpoint
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb...  # Ochiq API kaliti
```
Frontendni ishga tushiring:
```bash
npm run dev
```
Sayt endi `http://localhost:5173` manzilida ishlayotgan bo'lishi kerak.

---

## 🔒 Xavfsizlik va Admin Panel (Security & RBAC)

Platforma qat'iy xavfsizlik protokollariga asoslangan:
- **Admin tizimi (RBAC):** Saytda ochiq ro'yxatdan o'tish (Register) imkoni yo'q. Admin bo'lishi kerak bo'lgan odamlarni loyiha egasi shaxsan **Supabase Dashboard** orqali kiritadi. Muvaffaqiyatli JWT tokenga ega bo'lgan foydalanuvchilargina backend ma'lumotlarini o'zgartira oladi.
- **Maxfiy kalitlar:** `SUPABASE_SERVICE_ROLE_KEY` faqat backendda saqlanadi. Frontend mutlaqo xavfsiz (faqat cheklangan qoidalarga ega `ANON_KEY` bilan ishlaydi).
- **Rate Limiting:** Har bir IP manziliga 15 daqiqada 100 ta so'rov bilan cheklov qo'yilgan. Bu serverni DDoS hujumlari va keraksiz spam yuklamalardan to'liq himoya qiladi.

---

## 📜 Litsenziya va Mualliflik huquqi
Ushbu tizim shaxsiy tadqiqotlar uchun ishlab chiqilgan.
**Muallif:** Ogabek Uralov (Research Lab)
