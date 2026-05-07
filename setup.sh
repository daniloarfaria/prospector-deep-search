#!/usr/bin/env bash
set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}========================================${RESET}"
echo -e "${BOLD}   PROSPECTOR DEEP SEARCH — SETUP (Mac)${RESET}"
echo -e "${BOLD}========================================${RESET}"
echo ""

# ── Node.js ──────────────────────────────────────────────────────────────────
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}✔ Node.js já instalado: ${NODE_VERSION}${RESET}"
else
  echo -e "${YELLOW}! Node.js não encontrado. Instalando via Homebrew...${RESET}"

  if ! command -v brew &>/dev/null; then
    echo -e "${YELLOW}! Homebrew não encontrado. Instalando Homebrew...${RESET}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Adiciona brew ao PATH para Apple Silicon e Intel
    if [[ -f /opt/homebrew/bin/brew ]]; then
      eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
  fi

  brew install node
  echo -e "${GREEN}✔ Node.js instalado: $(node -v)${RESET}"
fi

# ── npm ───────────────────────────────────────────────────────────────────────
if command -v npm &>/dev/null; then
  echo -e "${GREEN}✔ npm já instalado: $(npm -v)${RESET}"
else
  echo -e "${RED}✘ npm não encontrado. Reinstale o Node.js.${RESET}"
  exit 1
fi

# ── Dependências do projeto ───────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BOLD}Instalando dependências do projeto...${RESET}"
npm install
echo -e "${GREEN}✔ Dependências instaladas.${RESET}"

# ── Arquivo .env ──────────────────────────────────────────────────────────────
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo -e "${YELLOW}! Arquivo .env criado a partir de .env.example.${RESET}"
  echo -e "${YELLOW}! Configure sua GEMINI_API_KEY no arquivo .env antes de rodar.${RESET}"
else
  echo -e "${GREEN}✔ Arquivo .env já existe.${RESET}"
fi

# ── Verificar API key ─────────────────────────────────────────────────────────
if grep -q 'MY_GEMINI_API_KEY\|^GEMINI_API_KEY=""' .env 2>/dev/null || ! grep -q 'GEMINI_API_KEY=' .env 2>/dev/null; then
  echo ""
  echo -e "${RED}╔══════════════════════════════════════════════════════╗${RESET}"
  echo -e "${RED}║  ATENÇÃO: Configure sua GEMINI_API_KEY no .env       ║${RESET}"
  echo -e "${RED}║  Obtenha em: https://aistudio.google.com/apikey      ║${RESET}"
  echo -e "${RED}╚══════════════════════════════════════════════════════╝${RESET}"
fi

echo ""
echo -e "${GREEN}${BOLD}Setup concluído! Execute ./run.sh para iniciar.${RESET}"
echo ""
