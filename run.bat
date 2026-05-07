@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title PROSPECTOR DEEP SEARCH

cd /d "%~dp0"

:: ── Verificacoes rapidas ──────────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado. Execute setup.bat primeiro.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [!] Dependencias nao instaladas. Executando npm install...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo [ERRO] Arquivo .env nao encontrado. Execute setup.bat primeiro.
    pause
    exit /b 1
)

findstr /C:"MY_GEMINI_API_KEY" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [AVISO] GEMINI_API_KEY parece nao configurada no .env
)

echo.
echo Iniciando Prospector Deep Search...
echo Acesse: http://localhost:3000
echo Pressione Ctrl+C para parar.
echo.

call npm run dev
