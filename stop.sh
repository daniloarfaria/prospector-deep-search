#!/usr/bin/env bash
# Para todos os processos Vite/Node nas portas 3000-3010

echo "Parando servidores..."

# mata pelo nome do processo
pkill -f "vite" 2>/dev/null
pkill -f "node.*vite" 2>/dev/null

# mata qualquer processo nas portas 3000-3010
for port in $(seq 3000 3010); do
  pid=$(lsof -ti tcp:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    kill -9 $pid 2>/dev/null
    echo "  Porta $port liberada (PID $pid)"
  fi
done

echo "Pronto."
