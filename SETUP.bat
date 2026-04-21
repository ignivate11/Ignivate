@echo off
echo.
echo  ================================================
echo   IGNIVATE - Setup Script
echo  ================================================
echo.

echo [1/4] Installing packages...
call npm install
if %errorlevel% neq 0 ( echo ERROR: npm install failed & pause & exit /b 1 )

echo.
echo [2/4] Pushing database schema to Neon...
call npx prisma db push
if %errorlevel% neq 0 ( echo ERROR: prisma db push failed & pause & exit /b 1 )

echo.
echo [3/4] Creating admin account...
call npx prisma db seed
if %errorlevel% neq 0 ( echo ERROR: seed failed & pause & exit /b 1 )

echo.
echo [4/4] Starting development server...
echo.
echo  ================================================
echo   Site running at: http://localhost:3000
echo   Admin login:     admin@ignivate.in
echo   Admin password:  admin@ignivate123
echo  ================================================
echo.
call npm run dev
