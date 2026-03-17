# US-001 — Alumni verifica sua identidade conectando carteira Ethereum

> Refinado pelo Agente de Refinamento em 2026-03-17.

## Fluxo

```
Usuário abre app
  → clica "Conectar Carteira"
  → MetaMask/WalletConnect abre
  → endereço conectado
  → app consulta AlumniSBT.hasCredential(address)
  → exibe: ✅ Alumni verificado | ❌ Sem credencial
```

## Decisão arquitetural

- `packages/core` usa **viem** (já dependência) para chamadas de contrato — puras, testáveis com mock de `PublicClient`.
- `apps/web` usa **wagmi v2** (a ser instalado) para conexão de carteira — depende de viem por baixo.
- `packages/contracts` exporta o ABI como módulo TypeScript — única fonte de verdade.
- `core` nunca depende de wagmi. `web` nunca faz chamada direta ao contrato.

---

## Tarefas

### TASK-001 — Exportar ABI do AlumniSBT como módulo TypeScript

**História origem:** US-001
**Complexidade:** P
**Pacote(s):** `packages/contracts`

**O que fazer:**
Criar `src/abis/AlumniSBT.ts` exportando o ABI do contrato como array TypeScript (`as const`), derivado do contrato compilado. Exportar pelo `index.ts` do pacote.

**Testes esperados:**
- [ ] ABI exportado contém as funções `hasCredential`, `tokenOf`, `issueCredential`
- [ ] ABI exportado contém os eventos `CredentialIssued`, `AdminAdded`

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] Importável como `import { AlumniSBTAbi } from '@cozap/contracts'`

**Arquivos prováveis:**
- `packages/contracts/src/abis/AlumniSBT.ts`
- `packages/contracts/src/index.ts`
- `packages/contracts/package.json` (adicionar `exports`)

---

### TASK-002 — Implementar `verifyCredential` no core

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `packages/core`
**Depende de:** TASK-001

**O que fazer:**
Criar `src/identity/verifyCredential.ts` com função pura:
```
verifyCredential(address, contractAddress, publicClient) → Promise<boolean>
```
Usa `viem` `publicClient.readContract` com `AlumniSBTAbi` para chamar `hasCredential(address)`.

**Testes esperados:**
- [ ] Retorna `true` quando contrato retorna `true`
- [ ] Retorna `false` quando contrato retorna `false`
- [ ] Lança erro tipado quando chamada ao contrato falha
- [ ] PublicClient é injetado (não instanciado internamente — testável com mock)

**Critérios de aceitação técnicos:**
- [ ] `pnpm test` verde em `packages/core`
- [ ] `pnpm typecheck` sem warnings
- [ ] Sem efeitos colaterais — função pura que recebe o cliente como parâmetro

**Arquivos prováveis:**
- `packages/core/src/identity/verifyCredential.ts`
- `packages/core/src/identity/verifyCredential.test.ts`
- `packages/core/src/identity/index.ts`

---

### TASK-003 — Configurar wagmi v2 no app web

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`

**O que fazer:**
Instalar `wagmi` e `@tanstack/react-query` (peer dep do wagmi). Criar `src/lib/wagmi.ts` com configuração de chains (Polygon Amoy testnet + localhost para dev). Envolver o app com `WagmiProvider` e `QueryClientProvider` em `layout.tsx`.

**Testes esperados:**
- [ ] App renderiza sem erros com os providers configurados
- [ ] Chain Polygon Amoy (chainId 80002) está na lista de chains suportadas

**Critérios de aceitação técnicos:**
- [ ] `pnpm build` sem erros em `apps/web`
- [ ] `pnpm typecheck` sem warnings
- [ ] Nenhum `'use client'` desnecessário — providers em arquivo separado

**Arquivos prováveis:**
- `apps/web/src/lib/wagmi.ts`
- `apps/web/src/app/providers.tsx`
- `apps/web/src/app/layout.tsx`

---

### TASK-004 — Componente `ConnectWalletButton`

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-003

**O que fazer:**
Criar componente React `ConnectWalletButton` com 3 estados visuais:
- `desconectado` → botão "Conectar Carteira"
- `conectando` → botão desabilitado com loading
- `conectado` → exibe endereço truncado (0x1234…abcd) + botão "Desconectar"

Usa hooks `useConnect`, `useDisconnect`, `useAccount` do wagmi.

**Testes esperados:**
- [ ] Renderiza "Conectar Carteira" quando desconectado
- [ ] Exibe endereço truncado quando conectado
- [ ] Chama `connect` ao clicar no botão desconectado
- [ ] Chama `disconnect` ao clicar quando conectado

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] Componente é `'use client'`
- [ ] Sem dependência direta de wagmi no componente — usa apenas hooks

**Arquivos prováveis:**
- `apps/web/src/components/ConnectWalletButton.tsx`
- `apps/web/src/components/ConnectWalletButton.test.tsx`

---

### TASK-005 — Hook `useIdentityVerification`

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-002, TASK-003

**O que fazer:**
Criar hook `useIdentityVerification()` que:
1. Observa o estado da carteira (`useAccount`)
2. Quando endereço disponível, chama `verifyCredential` do `@cozap/core`
3. Retorna `{ status: 'idle' | 'checking' | 'verified' | 'not_verified', error?: Error }`

O hook cria internamente o `publicClient` via `usePublicClient` do wagmi.

**Testes esperados:**
- [ ] Retorna `idle` enquanto carteira não conectada
- [ ] Retorna `checking` enquanto consulta está em andamento
- [ ] Retorna `verified` quando `verifyCredential` retorna `true`
- [ ] Retorna `not_verified` quando `verifyCredential` retorna `false`
- [ ] Retorna `error` quando chamada falha

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] `verifyCredential` é mockável nos testes (injeção por parâmetro ou vi.mock)

**Arquivos prováveis:**
- `apps/web/src/hooks/useIdentityVerification.ts`
- `apps/web/src/hooks/useIdentityVerification.test.ts`

---

### TASK-006 — UI de verificação na página principal

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-004, TASK-005

**O que fazer:**
Atualizar `apps/web/src/app/page.tsx` para exibir o fluxo completo:
- `ConnectWalletButton` sempre visível
- Quando conectado, exibe painel de verificação com base no estado de `useIdentityVerification`:
  - `checking` → spinner "Verificando credencial…"
  - `verified` → mensagem de boas-vindas com endereço
  - `not_verified` → mensagem explicando que o endereço não possui SBT Alumni Poli

**Testes esperados:**
- [ ] Exibe `ConnectWalletButton` em todos os estados
- [ ] Exibe spinner quando `status === 'checking'`
- [ ] Exibe boas-vindas quando `status === 'verified'`
- [ ] Exibe mensagem de negação quando `status === 'not_verified'`

**Critérios de aceitação técnicos:**
- [ ] `pnpm build` sem erros
- [ ] `pnpm typecheck` sem warnings
- [ ] Sem lógica de negócio na página — apenas composição de componentes e hooks

**Arquivos prováveis:**
- `apps/web/src/app/page.tsx`

---

## Ordem de execução

```
TASK-001 (contracts ABI)
    ↓
TASK-002 (core verifyCredential)   TASK-003 (wagmi setup)
                    ↓                       ↓
              TASK-005 (hook)        TASK-004 (ConnectWalletButton)
                         ↘          ↙
                        TASK-006 (UI página)
```
