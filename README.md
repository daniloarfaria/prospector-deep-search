# Prospector Deep Search

Ferramenta de prospecção de leads com busca por grade geográfica usando a API Gemini.

---

## Pré-requisito: Chave de API Gemini

Antes de instalar, obtenha sua chave gratuita em:
**https://aistudio.google.com/apikey**

---

## Instalação — Mac

Abra o **Terminal** e execute os comandos abaixo, um por vez:

```bash
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/prospector-deep-search.git
cd prospector-deep-search

# 2. Rodar o setup (instala Node.js se necessário, instala dependências e cria o .env)
chmod +x setup.sh && ./setup.sh
```

Após o setup, abra o arquivo `.env` e substitua `MY_GEMINI_API_KEY` pela sua chave:

```
GEMINI_API_KEY="sua_chave_aqui"
```

```bash
# 3. Iniciar o app
./run.sh
```

Acesse **http://localhost:3000** no navegador.

---

## Instalação — Windows

Abra o **Prompt de Comando** (cmd) ou **PowerShell** e execute:

```cmd
# 1. Clonar o repositório
git clone https://github.com/SEU_USUARIO/prospector-deep-search.git
cd prospector-deep-search

# 2. Rodar o setup
setup.bat
```

O setup vai instalar o Node.js automaticamente (via winget) e abrirá o arquivo `.env` no Bloco de Notas. Substitua `MY_GEMINI_API_KEY` pela sua chave e salve.

```cmd
# 3. Iniciar o app
run.bat
```

Acesse **http://localhost:3000** no navegador.

---

## Requisitos

| Requisito | Versão mínima |
|-----------|--------------|
| Node.js   | 18+          |
| Git       | qualquer     |

> Os scripts `setup.sh` (Mac) e `setup.bat` (Windows) instalam o Node.js automaticamente se não estiver presente.

---

## Git não instalado?

**Mac:** `xcode-select --install`

**Windows:** Baixe em https://git-scm.com/download/win

---

## Comandos úteis

```bash
npm run dev      # inicia em modo desenvolvimento
npm run build    # gera build de produção
npm run lint     # verifica tipos TypeScript
```
