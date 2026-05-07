# Prospector Deep Search

Ferramenta de prospecção de leads com busca por grade geográfica usando a API Gemini.

---

## Antes de começar — Obtenha sua chave de API (gratuita)

1. Acesse: **https://aistudio.google.com/apikey**
2. Faça login com uma conta Google
3. Clique em **"Create API Key"**
4. Copie a chave gerada (você vai precisar dela na instalação)

---

## Instalação no Mac

### Passo 1 — Abra o Terminal

Pressione **Command (⌘) + Espaço**, digite `Terminal` e pressione Enter.

### Passo 2 — Instale o Git (se ainda não tiver)

Cole o comando abaixo no Terminal e pressione Enter:

```bash
xcode-select --install
```

> Uma janela vai aparecer pedindo para instalar as ferramentas de linha de comando. Clique em **Instalar**. Se aparecer "software already installed", pode pular esta etapa.

### Passo 3 — Baixe e configure o projeto

Cole cada linha abaixo no Terminal e pressione Enter:

```bash
git clone https://github.com/daniloarfaria/prospector-deep-search.git
cd prospector-deep-search
chmod +x setup.sh && ./setup.sh
```

> O setup instala tudo automaticamente. Pode demorar alguns minutos.

### Passo 4 — Configure sua chave de API

Ao final do setup, um arquivo chamado `.env` será criado na pasta do projeto. Abra-o com qualquer editor de texto e altere esta linha:

```
GEMINI_API_KEY="MY_GEMINI_API_KEY"
```

Substituindo pela sua chave:

```
GEMINI_API_KEY="sua_chave_aqui"
```

Salve o arquivo.

### Passo 5 — Inicie o app

```bash
./run.sh
```

Abra o navegador e acesse: **http://localhost:3000**

Para parar o app, pressione **Ctrl + C** no Terminal.

---

## Instalação no Windows

### Passo 1 — Instale o Git (se ainda não tiver)

1. Acesse: **https://git-scm.com/download/win**
2. Baixe e instale o arquivo `.exe`
3. Durante a instalação, clique em **Next** em todas as telas (as opções padrão funcionam bem)

### Passo 2 — Abra o Prompt de Comando

Pressione **Windows + R**, digite `cmd` e pressione Enter.

### Passo 3 — Baixe e configure o projeto

Cole cada linha abaixo no Prompt de Comando e pressione Enter:

```cmd
git clone https://github.com/daniloarfaria/prospector-deep-search.git
cd prospector-deep-search
setup.bat
```

> O setup vai instalar o Node.js automaticamente e abrirá o arquivo `.env` no Bloco de Notas.

### Passo 4 — Configure sua chave de API

No Bloco de Notas que abriu, altere esta linha:

```
GEMINI_API_KEY="MY_GEMINI_API_KEY"
```

Substituindo pela sua chave:

```
GEMINI_API_KEY="sua_chave_aqui"
```

Salve com **Ctrl + S** e feche o Bloco de Notas.

### Passo 5 — Inicie o app

```cmd
run.bat
```

Abra o navegador e acesse: **http://localhost:3000**

Para parar o app, pressione **Ctrl + C** no Prompt de Comando.

---

## Problemas comuns

**"git não é reconhecido como comando"**
→ Instale o Git conforme o Passo 1 do seu sistema e abra um novo terminal.

**"Permissão negada" no Mac**
→ Execute `chmod +x setup.sh run.sh` e tente novamente.

**O app não abre no navegador**
→ Verifique se a `GEMINI_API_KEY` está corretamente configurada no arquivo `.env`.

**Node.js não instalou automaticamente no Windows**
→ Baixe manualmente em **https://nodejs.org** (versão LTS), instale e abra um novo Prompt de Comando.
