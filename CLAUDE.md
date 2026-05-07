# Prospector Deep Search — Mapa do Projeto

## Stack
- React 19 + TypeScript + Vite 6
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Google GenAI SDK (`@google/genai`) — modelo padrão: `gemini-3-flash-preview`
- Motion (Framer), Lucide, XLSX, canvas-confetti

## Estrutura de Arquivos

```
src/
├── types.ts                  # Interfaces: Lead, SearchConfig, SearchProgress
├── main.tsx                  # Entry point React
├── App.tsx                   # Orquestrador principal — estado, loop de busca, export
├── index.css                 # CSS global + variáveis Tailwind
├── env.d.ts                  # Tipos de env vars (GEMINI_API_KEY)
├── lib/
│   └── utils.ts              # cn(), formatNumber(), generateGrid()
├── services/
│   └── prospectorService.ts  # geocodeCity(), findLeadsInGrid(), withRetry()
└── components/
    ├── SearchControls.tsx    # Sidebar: formulário de config + botões
    ├── LeadTable.tsx         # Tabela live de leads
    └── GridVisualizer.tsx    # Visualização da grade de varredura
```

## Fluxo Principal (App.tsx)

1. `handleStart` → `geocodeCity(city)` → gera grid via `generateGrid()`
2. Loop por cada ponto do grid → `findLeadsInGrid(config, point, onFound)`
3. Deduplicação por `id` (hash de name+phone+coords)
4. `handleExport` → gera `.xlsx` com `XLSX`

## Tipos Chave (types.ts)

```ts
Lead          // id, name, phone, address, website, rating, reviews, category,
              // openingHours?, plusCode?, claimed?, socials?, emails?, coordinate?

SearchConfig  // niche, city, radiusKm, gridStepKm, deepExtract, model

SearchProgress // totalFound, totalRaw, withEmail, currentGridPoint,
               // totalGridPoints, status, message, currentCoord?
```

## prospectorService.ts

- `geocodeCity(city)` — pede coords ao Gemini via JSON puro
- `findLeadsInGrid(config, point, onFound)` — prompt estruturado com `responseSchema`
- `withRetry(fn, retries=3, delay=2000)` — retry exponencial em 429
- `leadSchema` — schema JSON para Gemini retornar array de empresas

## Variáveis de Ambiente

```
GEMINI_API_KEY=  # obrigatório, lido em prospectorService.ts via process.env
```

## Comandos

```bash
npm run dev      # servidor local :3000
npm run build    # build produção
npm run lint     # tsc --noEmit
```

## Convenções

- CSS: classes Tailwind + variáveis customizadas (`bg-sidebar`, `text-primary`, `border-border-subtle`, etc.) definidas em `index.css`
- `cn()` em `lib/utils.ts` para classes condicionais
- Componentes sem estado próprio relevante — todo estado vive em `App.tsx`
- `stopRef` é um `useRef` para interromper o loop assíncrono sem re-render
