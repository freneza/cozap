FROM node:22-bookworm-slim

# Dependências de sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Permite que o usuário node use sudo sem senha
# Necessário para o feature docker-outside-of-docker ajustar GID do socket
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node && chmod 0440 /etc/sudoers.d/node

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
