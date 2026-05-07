@echo off
:: Atualiza o Prospector sem apagar o .env

echo Atualizando Prospector...

git pull

echo Instalando dependencias novas (se houver)...
npm install

echo.
echo Pronto! Rode start.bat para iniciar.
pause
