# Fluxo de trabalho entre agentes

## Visão geral

```
Usuário / Dono do produto
        │
        ▼
  REQUIREMENTS ──────────────────────────────────────┐
  Escreve User Stories                               │
  com critérios de aceitação                         │
        │                                            │
        ▼                                            │
  REFINEMENT ◄──────── ARCHITECTURE                 │
  Decompõe em tarefas     (consultado se             │
  técnicas (TASK-XXX)      necessário)               │
        │                                            │
        ▼                                            │
  ORCHESTRATOR                                       │
  Gerencia backlog,                                  │
  decide próxima ação                                │
        │                                            │
        ▼                                            │
  QA                                                 │
  Escreve acceptance                                 │
  tests (falham)                                     │
        │                                            │
        ▼                                            │
  IMPLEMENTATION                                     │
  Ciclo TDD:                                         │
  red → green → refactor                             │
        │                                            │
        ▼                                            │
  REVIEW                                             │
  Revisa PR, aprova                                  │
  ou bloqueia                                        │
        │                                            │
        ▼                                            │
  merge → ORCHESTRATOR atualiza backlog              │
        │                                            │
        └────────────────────────────────────────────┘
                   próxima tarefa
```

## Ciclo TDD expandido (ATDD)

```
1. QA escreve acceptance test          → teste falha (comportamento ausente)
2. IMPLEMENTATION escreve unit test    → teste falha (implementação ausente)
3. IMPLEMENTATION escreve código       → unit test passa
4. IMPLEMENTATION verifica             → acceptance test passa
5. IMPLEMENTATION refatora             → ambos ainda passam
6. REVIEW revisa                       → aprova ou solicita ajustes
7. merge
```

## Protocolo de comunicação entre agentes

Cada agente, ao concluir seu trabalho, entrega um artefato claro:

| Agente | Entrega |
|---|---|
| REQUIREMENTS | User Story em `BACKLOG.md` |
| REFINEMENT | Tarefas técnicas em `BACKLOG.md` ou comentário na US |
| ARCHITECTURE | ADR em `docs/adr/` |
| QA | Testes de aceitação em `*.test.ts` (failing) |
| IMPLEMENTATION | Código + testes passando + commit |
| REVIEW | Aprovação ou lista de bloqueantes |
| ORCHESTRATOR | Status atualizado em `BACKLOG.md` |

## Regras gerais

1. **Nenhum código de produção sem teste que justifique.** Se não há teste, não há tarefa.
2. **`main` deve estar sempre verde.** Nunca merge com `pnpm test` falhando.
3. **Tarefas G devem ser decompostas** antes de entrar em andamento.
4. **O usuário é escalado apenas** quando há bloqueio real (ambiguidade de requisito, decisão estratégica de produto).
5. **ADRs são imutáveis após aceitos** — novas decisões criam novos ADRs que substituem os anteriores.
