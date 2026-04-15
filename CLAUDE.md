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
| Frontend | Next.js 16 + React 19 |
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

## Documentação de arquitetura

| Documento | Descrição |
|---|---|
| [docs/dev/c4-context.md](docs/dev/c4-context.md) | C4 Nível 1 — atores e sistemas externos |
| [docs/dev/c4-container.md](docs/dev/c4-container.md) | C4 Nível 2 — containers e protocolos |
| [docs/dev/class-diagram.md](docs/dev/class-diagram.md) | Classes, interfaces, hooks e contrato |
| [docs/dev/component-diagram.md](docs/dev/component-diagram.md) | Dependências entre componentes |
| [docs/dev/login-flow.md](docs/dev/login-flow.md) | Fluxo de autenticação (Web3Auth + SBT) |
| [docs/adr/](docs/adr/) | Architecture Decision Records |

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


<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:ca08a54f -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

## Session Completion

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd dolt push
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
<!-- END BEADS INTEGRATION -->
