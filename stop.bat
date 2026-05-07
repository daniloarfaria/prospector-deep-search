@echo off
:: Para todos os processos Vite/Node nas portas 3000-3010

echo Parando servidores...

:: mata pelo nome do processo
taskkill /F /IM node.exe /T >nul 2>&1

:: libera portas 3000-3010
for /L %%p in (3000,1,3010) do (
  for /f "tokens=5" %%i in ('netstat -aon ^| findstr ":%%p " 2^>nul') do (
    if not "%%i"=="" (
      taskkill /F /PID %%i >nul 2>&1
      echo   Porta %%p liberada
    )
  )
)

echo Pronto.
pause
