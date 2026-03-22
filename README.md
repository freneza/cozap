# coZap

Plataforma de comunicação descentralizada para a comunidade **Alumni Poli** (ex-alunos da Escola Politécnica).

Combina verificação de identidade via blockchain com mensagens sobre o protocolo aberto [Nostr](https://nostr.com) — uma alternativa descentralizada aos grupos de WhatsApp da comunidade.

---

## Como funciona

### Identidade on-chain

Cada alumni verificado recebe um **Soulbound Token (SBT)**: um NFT não-transferível que certifica o vínculo com a Poli. O token é emitido por administradores autorizados e fica permanentemente associado ao endereço Ethereum do membro — não pode ser transferido nem vendido.

Os dados da formação primária (curso, ano, tipo de diploma) ficam hasheados on-chain. O perfil completo do membro — com todas as formações, área de atuação e interesses — é armazenado off-chain e vinculado à credencial pelo hash.

### Comunicação descentralizada

A troca de mensagens usa o protocolo Nostr. Existem dois tipos de canal:

- **Canais obrigatórios** — todo membro verificado participa automaticamente (substitutos dos grupos de Networking do WhatsApp)
- **Canais temáticos** — participação opcional (ex: Inteligência Artificial, Esportes, Cultura)

---

## Estrutura do monorepo

```
coZap/
├── apps/
│   └── web/              # Frontend (Next.js)
└── packages/
    ├── core/             # Tipos compartilhados (identidade + mensagens)
    └── contracts/        # Contratos Solidity (Hardhat)
```

### `packages/core`

Tipos TypeScript que definem os modelos de domínio:

- `AlumniDegree` — formação individual (curso, tipo, ano)
- `AlumniCredential` — credencial on-chain baseada na formação primária
- `MemberProfile` — perfil off-chain completo do membro
- `Channel` — canal de comunicação da comunidade
- `ChannelMessage` — mensagem publicada em um canal

### `packages/contracts`

Contrato `AlumniSBT.sol` em Solidity 0.8.27:

- Emissão de SBTs por admins autorizados
- Máximo de um token por endereço
- Transferência bloqueada (soulbound)
- Hash da formação primária registrado on-chain

### `apps/web`

Interface web construída com Next.js.

---

## Documentação

| Documento | Descrição |
|---|---|
| [docs/dev/DEV.md](docs/dev/DEV.md) | Guia do devcontainer |
| [docs/dev/c4-context.md](docs/dev/c4-context.md) | C4 Nível 1 — Contexto do sistema |
| [docs/dev/c4-container.md](docs/dev/c4-container.md) | C4 Nível 2 — Containers e comunicação |
| [docs/dev/class-diagram.md](docs/dev/class-diagram.md) | Diagrama de classes |
| [docs/dev/component-diagram.md](docs/dev/component-diagram.md) | Diagrama de componentes |
| [docs/dev/login-flow.md](docs/dev/login-flow.md) | Fluxo de login (Web3Auth + SBT) |
| [docs/adr/](docs/adr/) | Architecture Decision Records |

---

## Ambiente de desenvolvimento

O projeto inclui um **devcontainer** com Node.js 22, pnpm 9.15.4, Claude Code CLI e todas as extensões do VS Code pré-configuradas. Basta abrir a pasta no VS Code e clicar em _Reopen in Container_.

Consulte [docs/dev/DEV.md](docs/dev/DEV.md) para instruções detalhadas.

## Requisitos (sem devcontainer)

- Node.js >= 22
- pnpm >= 9.15

## Instalação

```bash
pnpm install
```

## Desenvolvimento

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Typecheck

```bash
pnpm typecheck
```

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js + React |
| Contratos | Solidity 0.8.27 + Hardhat |
| Protocolo de mensagens | Nostr |
| Blockchain alvo | Polygon (testnet: Amoy) |
| Monorepo | pnpm + Turborepo |
| Linguagem | TypeScript |
