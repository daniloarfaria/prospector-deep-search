#!/usr/bin/env bash
set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ── Verificações rápidas ──────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "${RED}✘ Node.js não encontrado. Execute ./setup.sh primeiro.${RESET}"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}! Dependências não instaladas. Executando npm install...${RESET}"
  npm install
fi

if [ ! -f ".env" ]; then
  echo -e "${RED}✘ Arquivo .env não encontrado. Execute ./setup.sh primeiro.${RESET}"
  exit 1
fi

# Avisa se a API key ainda é placeholder
if grep -qE 'MY_GEMINI_API_KEY|^GEMINI_API_KEY=""' .env 2>/dev/null; then
  echo -e "${YELLOW}! AVISO: GEMINI_API_KEY parece não configurada no .env${RESET}"
fi

echo ""
echo -e "${GREEN}${BOLD}Iniciando Prospector Deep Search...${RESET}"
echo -e "Acesse: ${BOLD}http://localhost:3000${RESET}"
echo -e "Pressione ${BOLD}Ctrl+C${RESET} para parar."
echo ""

npm run dev
