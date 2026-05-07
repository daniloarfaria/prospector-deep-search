#!/usr/bin/env bash
# Atualiza o Prospector sem apagar o .env

echo "Atualizando Prospector..."

git pull

echo "Instalando dependências novas (se houver)..."
npm install

echo ""
echo "Pronto! Rode ./start.sh para iniciar."
