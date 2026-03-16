# coZap — Contexto para Agentes

## O que é este projeto

Plataforma de comunicação descentralizada para a comunidade **Alumni Poli** (ex-alunos da Escola Politécnica da USP). Combina identidade on-chain via **Soulbound Token (SBT)** com mensagens sobre o protocolo **Nostr** — substituindo grupos de WhatsApp por uma rede aberta e verificada.

## Metodologia

Este projeto é desenvolvido com **Extreme Programming (XP)**:

- **TDD** — nenhum código de produção existe sem um teste que o justifique. O ciclo é: acceptance test falha → unit test falha → código passa → refatorar.
- **Pair Programming** — todo agente de implementação opera em par com o agente de revisão.
- **Design Simples** — a solução mais simples que faz o teste passar. Nada além.
- **Refatoração contínua** — ao término de cada tarefa, o código deve estar mais limpo do que estava.
- **Integração contínua** — `pnpm test` deve estar verde a qualquer momento na branch `main`.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 + React 18 |
| Contratos | Solidity 0.8.27 + Hardhat |
| Protocolo de mensagens | Nostr (`nostr-tools`) |
| Blockchain alvo | Polygon (testnet: Amoy) |
| Monorepo | pnpm + Turborepo |
| Linguagem | TypeScript 5.5 (ESM) |
| Testes unitários | Vitest (core), Hardhat/Mocha (contracts) |

## Estrutura do monorepo

```
coZap/
├── apps/
│   └── web/              # Frontend Next.js
├── packages/
│   ├── core/             # Tipos e lógica de domínio
│   └── contracts/        # Contratos Solidity
└── docs/
    ├── agents/           # Instruções por papel de agente
    ├── adr/              # Architecture Decision Records
    └── dev/              # Guias de desenvolvimento
```

## Convenções de código

- **TypeScript**: ESM (`"type": "module"`), strict mode, sem `any` explícito.
- **Solidity**: 0.8.27, erros customizados (não `require` com string), eventos para toda mutação de estado.
- **Testes**: um arquivo `*.test.ts` por módulo, na mesma pasta do código. Nomes em português para descrever comportamento (`'reverte se membro já possui credencial'`).
- **Commits**: Conventional Commits em português (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`).
- **Formatação**: Prettier com as configurações do `.prettierrc`. `editor.formatOnSave` ativo no devcontainer.

## Fluxo de trabalho entre agentes

```
REQUIREMENTS → REFINEMENT → ARCHITECTURE (se necessário)
                    ↓
              ORCHESTRATOR
                    ↓
         QA (acceptance test) → IMPLEMENTATION (TDD) → REVIEW
                                                           ↓
                                                    merge + próxima tarefa
```

Consulte `docs/agents/` para as instruções detalhadas de cada papel.

## Backlog

O backlog vive em `BACKLOG.md`. O Orquestrador é o responsável por manter esse arquivo atualizado após cada iteração.

## Definition of Done

Uma tarefa está concluída quando:
- [ ] Acceptance test passa
- [ ] Unit tests cobrem o comportamento novo
- [ ] `pnpm test` verde em todos os pacotes
- [ ] Código revisado pelo agente de Review
- [ ] Sem warnings de TypeScript (`pnpm typecheck`)
- [ ] Commit com mensagem descritiva
