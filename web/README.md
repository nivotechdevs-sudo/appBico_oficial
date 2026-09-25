# Bicos — front-end em React + TypeScript

Migração 1:1 do app legado (`../app`, HTML + JavaScript ES modules + Tailwind) para **React 19 +
TypeScript + Vite**. Mesma aparência, mesmos textos, mesmas regras de negócio — a comparação
automatizada com o app original está em `scripts/parity/` (ver `docs/VALIDACAO.md`).

> O app legado continua intacto em `../app` e é a referência da validação.

## Rodando

```bash
npm install
npm run dev          # servidor de desenvolvimento (http://localhost:5173)
npm run build        # build de produção em dist/ (code splitting por tela)
npm run preview      # serve o dist/
npm run build:standalone  # dist-standalone/index.html com tudo embutido — abre direto do disco (file://), como o legado
```

Qualidade:

```bash
npm run typecheck    # tsc (strict)
npm run lint         # ESLint (typescript-eslint + react-hooks)
npm run format       # Prettier
npm test             # Vitest — inclui testes de paridade de lógica contra os módulos JS do legado
npm run build && npm run parity   # paridade visual/comportamental contra o app legado (Playwright)
```

## Estrutura

```
src/
  main.tsx              bootstrap (roteador + React root + CSS)
  App.tsx               rota atual → tela (com ou sem shell), 404, scroll ao topo, prefetch de telas
  routes.ts             tabela de rotas; cada tela é um chunk carregado sob demanda
  layouts/              AppShell (nav + <main>) e AppNav (pílula no celular, barra "ilha" ≥ 770px, menu da conta)
  pages/
    shared/             splash, login, cadastro, verificação, completar perfil, senha, perfis, avaliações, configurações
    worker/             mural, vaga, candidatura, minhas candidaturas, salvas, selecionado, avaliar
    recruiter/          publicar vaga, publicada, gerenciar, fechado, impulsionar, histórico
  components/           biblioteca de UI (Button, Input, Card, Modal/Sheet, JobTile, PhotoCarousel, …)
    icons/              ícones Lucide como mask-image (data URIs) + "G" do Google
  hooks/                useStore (useDb/useRole/useUI), useTextField (cursor/autofoco dos campos)
  services/             store (dados mock em memória, imutável), selectors (consultas), router (hash router)
  data/                 seed (dados de demonstração), cidades (IBGE)
  types/                modelos do domínio (Job, Company, Worker, Application, …)
  utils/                formatação/máscaras, textos de agenda, cidades, WhatsApp, status de candidatura
  styles/               tokens.css, base.css e tailwind.css (os do legado, só com os tokens e regras que o app usa)
public/img/jobs/        fotos de exemplo das vagas
scripts/parity/         harness de paridade legado × React
docs/                   MAPEAMENTO.md (levantamento do legado) e VALIDACAO.md (checklist e resultados)
```

## Decisões

- **Estilo**: Tailwind CSS 3.4.19 com o _mesmo_ `tailwind.config` do legado, `tokens.css` e `base.css`
  copiados do legado (sem os tokens e regras que nenhum elemento usa — o conjunto completo de tokens
  continua em `../app/css/tokens.css`), e as mesmas classes em cada elemento. O CSS gerado tem as
  mesmas regras do legado (o autoprefixer é o mesmo que o CLI do Tailwind usava). Isso garante
  identidade visual sem reescrever valores em CSS Modules/styled-components.
- **Estado**: `services/store.ts` reproduz o store em memória do legado — dados (`db`), papel logado
  (`role`) e o "saco" de estado de UI por tela (`ui`), que sobrevive à navegação como antes. As
  atualizações são imutáveis e os componentes assinam só a fatia que leem (`useSyncExternalStore`),
  evitando re-renderizações desnecessárias.
- **Roteamento**: o hash router do legado portado como está (`#/rota`, pilha própria de "voltar",
  `goBack(fallback)`), com as telas em chunks separados e pré-carregados quando o navegador fica ocioso.
  Uma tela já carregada renderiza de forma síncrona — nunca aparece um quadro vazio entre telas.
- **Micro-interações do legado**: o app antigo recriava todo o DOM a cada mudança de estado, o que
  tinha efeitos visíveis (foco, transições, animações, rolagem). `components/LegacyRerender.tsx`
  reproduz esses efeitos depois de cada atualização; removê-lo de `App.tsx` dá o comportamento mais
  suave do React. Detalhes em `docs/VALIDACAO.md` → Observações.
- **Firebase**: o repositório **não usa Firebase** (nem Auth, nem Realtime Database). Login,
  cadastro e verificação de e-mail são simulados, como no legado. A camada `services/` isola o acesso a
  dados para que um backend real possa entrar depois sem tocar nas telas. Detalhes em
  `docs/MAPEAMENTO.md`.
