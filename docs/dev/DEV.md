# Ambiente de desenvolvimento — devcontainer

O projeto usa [Dev Containers](https://containers.dev) para garantir um ambiente reproduzível. Recomendado para desenvolvimento local via VS Code ou GitHub Codespaces.

## Pré-requisitos

- [Docker](https://www.docker.com/products/docker-desktop)
- [VS Code](https://code.visualstudio.com) com a extensão [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Iniciando

1. Clone o repositório e abra a pasta no VS Code.
2. Quando solicitado, clique em **Reopen in Container** (ou acione via `Ctrl+Shift+P` → _Dev Containers: Reopen in Container_).
3. O VS Code vai construir a imagem, instalar as dependências (`pnpm install`) e abrir o workspace pronto para uso.

## O que está no container

| Componente | Versão |
|---|---|
| Node.js | 22 (Debian Bookworm slim) |
| pnpm | 9.15.4 |
| Claude Code CLI | última disponível |
| solc (compilador Solidity) | última disponível |

Extensões do VS Code instaladas automaticamente:

- **Claude Code** — assistente de IA integrado
- **ESLint** + **Prettier** — linting e formatação
- **TypeScript Nightly** — suporte TypeScript avançado
- **Hardhat for VS Code** — Solidity / contratos
- **GitLens** — histórico e blame no editor
- **Code Spell Checker** (PT-BR + EN) — correção ortográfica

## Variáveis de ambiente

O container lê variáveis do host via `remoteEnv`. Antes de abrir o container, exporte no seu shell:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

A chave nunca deve ser commitada no repositório.

## Portas

| Porta | Serviço |
|---|---|
| 3000 | Next.js dev server |

O VS Code notifica automaticamente quando a porta 3000 está disponível.

## Persistência do Claude Code

O diretório `~/.claude` do host é montado dentro do container:

```
source: $HOME/.claude  (host)
target: /home/node/.claude  (container)
```

Isso preserva memória, histórico e configurações do Claude Code entre sessões e rebuilds do container.

## Rebuild do container

Necessário quando o `Dockerfile` ou o `devcontainer.json` for alterado:

```
Ctrl+Shift+P → Dev Containers: Rebuild Container
```
