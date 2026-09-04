#!/bin/bash
set -e

echo "==========================================="
echo "   A'dan Z'gacha Test Skripti Boshlandi    "
echo "==========================================="

echo ""
echo "1️⃣ Backend API va Unit Testlarini ishga tushirish..."
cd backend
npm test
cd ..
echo "✅ Backend Testlari Muvaffaqiyatli O'tdi!"

echo ""
echo "2️⃣ Frontend UI va Komponent Testlarini ishga tushirish..."
cd frontend
npm run test
cd ..
echo "✅ Frontend Testlari Muvaffaqiyatli O'tdi!"

echo ""
echo "3️⃣ End-to-End (E2E) va Lokalizatsiya Testlari (Playwright)..."
# Make sure local backend and frontend are running, otherwise playwright test might fail.
# Assuming servers are running in background.
npx playwright test
echo "✅ Playwright E2E Testlari Muvaffaqiyatli O'tdi!"

echo ""
echo "==========================================="
echo " 🎉 Barcha A-Z Testlar 100% Yashil (Passed)!"
echo "==========================================="
