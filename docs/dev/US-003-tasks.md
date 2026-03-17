# US-003 — Alumni acessa a plataforma com identidade verificada pelo SBT

> Refinado pelo Agente de Refinamento em 2026-03-17.
> Depende de: US-001 (solicitação) + US-002 (emissão do SBT).

## Fluxo

```
Alumni abre /
  → se não autenticado  → exibe opções de login
  → se autenticado, sem SBT → exibe "credencial em análise" + link /solicitar
  → se autenticado, com SBT → exibe dashboard verificado (home da comunidade)
```

## Decisão arquitetural

- Verificação on-chain feita via `createPublicClient` (somente leitura, sem carteira).
- Hook `useHasCredential(address)` encapsula a chamada ao contrato — desacoplado do `useAuth`.
- A página `/` compõe `useAuth` + `useHasCredential` e decide qual estado renderizar.
- Nenhuma lógica de negócio na página — apenas composição.

---

## Tarefas

### TASK-018 — Hook `useHasCredential`

**História origem:** US-003
**Complexidade:** M
**Pacote(s):** `apps/web`

**O que fazer:**
Criar `src/hooks/useHasCredential.ts` com hook:
```ts
useHasCredential(address: `0x${string}` | undefined): {
  hasCredential: boolean | null
  isLoading: boolean
}
```
- Usa `createPublicClient` do viem com `http()` transport apontando para Polygon Amoy RPC
- Chama `hasCredential(address)` no contrato AlumniSBT
- ABI mínimo: `function hasCredential(address) view returns (bool)`
- Retorna `{ hasCredential: null, isLoading: false }` quando `address` é `undefined`
- `isLoading: true` enquanto a chamada está em andamento
- Dispara nova leitura quando `address` muda

**Testes esperados:**
- [ ] Retorna `{ hasCredential: null, isLoading: false }` quando `address` é `undefined`
- [ ] Retorna `{ hasCredential: true }` quando o contrato retorna `true`
- [ ] Retorna `{ hasCredential: false }` quando o contrato retorna `false`
- [ ] `isLoading` é `true` durante a chamada e `false` após

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] `createPublicClient` mockável nos testes (não instanciado no topo do módulo)
- [ ] RPC url via `process.env.NEXT_PUBLIC_AMOY_RPC_URL` com fallback para `'https://rpc-amoy.polygon.technology'`

**Arquivos prováveis:**
- `apps/web/src/hooks/useHasCredential.ts`
- `apps/web/src/hooks/useHasCredential.test.ts`

---

### TASK-019 — Página inicial `/` protegida

**História origem:** US-003
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-018

**O que fazer:**
Atualizar `src/app/page.tsx` para ter três estados:

1. **Não autenticado** (`!isAuthenticated`):
   - Título "coZap — Alumni Poli"
   - Dois botões: "Entrar com email ou Google" e "Conectar carteira própria"
   - Ambos chamam `login()` do `useAuth`

2. **Autenticado sem SBT** (`isAuthenticated && hasCredential === false`):
   - Mensagem "Sua credencial está em análise"
   - Link para `/solicitar` caso ainda não tenha solicitado
   - Botão "Sair"

3. **Autenticado com SBT** (`isAuthenticated && hasCredential === true`):
   - Mensagem de boas-vindas "Bem-vindo à comunidade Alumni Poli"
   - Botão "Sair"

4. **Carregando** (`isLoading || hasCredential === null && isAuthenticated`):
   - Texto "Verificando credencial..."

**Testes esperados:**
- [ ] Exibe botões de login quando não autenticado
- [ ] Exibe "em análise" quando autenticado sem SBT
- [ ] Exibe boas-vindas quando autenticado com SBT
- [ ] Exibe estado de carregamento enquanto verifica
- [ ] Botão "Sair" chama `logout()`

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] `'use client'` no topo
- [ ] Sem lógica além de composição de hooks e condicional de renderização
- [ ] `useAuth` e `useHasCredential` mockados nos testes

**Arquivos prováveis:**
- `apps/web/src/app/page.tsx`
- `apps/web/src/app/page.test.tsx`

---

## Ordem de execução

```
TASK-018 (useHasCredential)
        ↓
TASK-019 (página / protegida)
```
