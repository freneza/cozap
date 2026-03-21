FROM node:20-bookworm-slim

# Dependências de sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# pnpm via corepack (já incluso no Node 20)
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

# Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# Solidity compiler (via npm — Hardhat instala automaticamente, mas solc global é útil)
RUN npm install -g solc

# Usuário não-root
USER node
WORKDIR /workspace

# Diretório .claude para persistência de memória (montado via devcontainer.json)
RUN mkdir -p /home/node/.claude
