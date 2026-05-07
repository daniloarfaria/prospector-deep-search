@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1
title PROSPECTOR DEEP SEARCH - Setup

echo.
echo ========================================
echo   PROSPECTOR DEEP SEARCH - SETUP (Win)
echo ========================================
echo.

:: ── Node.js ──────────────────────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
    echo [OK] Node.js ja instalado: !NODE_VER!
    goto :CHECK_NPM
)

echo [!] Node.js nao encontrado. Tentando instalar via winget...

where winget >nul 2>&1
if %ERRORLEVEL% NEQ 0 goto :MANUAL_INSTALL

winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
if %ERRORLEVEL% NEQ 0 goto :MANUAL_INSTALL

:: Atualiza PATH manualmente sem depender de RefreshEnv (Chocolatey)
set "PATH=%PATH%;%PROGRAMFILES%\nodejs;%APPDATA%\npm"

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Node.js instalado. IMPORTANTE: feche este terminal e abra um novo,
    echo     depois execute setup.bat novamente para continuar.
    echo.
    pause
    exit /b 0
)

echo [OK] Node.js instalado:
node -v
goto :CHECK_NPM

:MANUAL_INSTALL
echo.
echo [!] Nao foi possivel instalar automaticamente.
echo     Baixe e instale o Node.js LTS manualmente:
echo     https://nodejs.org/pt/download
echo.
echo     Apos instalar, feche e abra um novo terminal e execute setup.bat novamente.
echo.
pause
exit /b 1

:CHECK_NPM
:: ── npm ───────────────────────────────────────────────────────────────────────
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] npm nao encontrado. Reinstale o Node.js.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [OK] npm instalado: !NPM_VER!

:: ── Dependencias do projeto ───────────────────────────────────────────────────
cd /d "%~dp0"
echo.
echo Instalando dependencias do projeto...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Falha ao instalar dependencias.
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas.

:: ── Arquivo .env ──────────────────────────────────────────────────────────────
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo.
    echo [!] Arquivo .env criado. Abra o arquivo .env e coloque sua GEMINI_API_KEY.
    echo [!] Obtenha a chave em: https://aistudio.google.com/apikey
    echo.
    :: Abre o .env no bloco de notas para o usuario editar
    start notepad .env
) else (
    echo [OK] Arquivo .env ja existe.
)

:: ── Verificar API key ─────────────────────────────────────────────────────────
findstr /C:"MY_GEMINI_API_KEY" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [ATENCAO] Configure sua GEMINI_API_KEY no arquivo .env antes de rodar!
    echo           Obtenha em: https://aistudio.google.com/apikey
)

echo.
echo Setup concluido! Execute run.bat para iniciar.
echo.
pause
