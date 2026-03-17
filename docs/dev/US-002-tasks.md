# US-002 — Administrador revisa e emite SBT

> Refinado em 2026-03-17.
> Depende de: US-001 (solicitações pendentes no repositório), contrato AlumniSBT.sol.

## Fluxo

```
Admin acessa /admin/solicitacoes
  → vê lista de solicitações pendentes
  → clica em uma solicitação → vê dados da formação
  → clica "Aprovar"
    → carteira do admin assina transação issueCredential(address, hash)
    → contrato emite SBT on-chain
    → API atualiza status para 'approved'
  → clica "Rejeitar"
    → informa motivo (opcional)
    → API atualiza status para 'rejected'
```

## Decisões arquiteturais

- **Admin interage via carteira própria** (Caminho B do ADR-001). O admin conecta MetaMask/carteira externa, que precisa estar cadastrada como admin no contrato.
- **Frontend chama o contrato diretamente** via `viem` usando o provider do Web3Auth. Sem relayer — o admin paga o gas e assina on-chain.
- **Endereço do contrato** injetado via `NEXT_PUBLIC_ALUMNI_SBT_ADDRESS`.
- **Sem autenticação de rota por ora** — a página `/admin` é protegida por obscuridade no MVP.

---

## Tarefas

### TASK-013 — Testes do contrato AlumniSBT

**Complexidade:** M
**Pacote(s):** `packages/contracts`

**O que fazer:**
Criar `test/AlumniSBT.test.ts` com cobertura completa do contrato:

**Testes esperados:**
- [ ] `issueCredential` emite evento `CredentialIssued` com args corretos
- [ ] `issueCredential` reverte com `AlreadyHasCredential` se endereço já possui SBT
- [ ] `issueCredential` reverte com `NotAdmin` se chamado por não-admin
- [ ] `issueCredential` reverte com `ZeroAddress` para endereço zero
- [ ] `hasCredential` retorna `true` após emissão
- [ ] `hasCredential` retorna `false` para endereço sem SBT
- [ ] `tokenOf` retorna o tokenId correto após emissão
- [ ] `ownerOf` retorna o endereço correto
- [ ] `transfer` reverte com `Soulbound`
- [ ] `approve` reverte com `Soulbound`
- [ ] `addAdmin` adiciona admin e emite `AdminAdded`
- [ ] `addAdmin` reverte se chamado por não-owner
- [ ] `removeAdmin` remove admin e emite `AdminRemoved`
- [ ] `credentialHash` armazena o hash corretamente

**Arquivos:**
- `packages/contracts/test/AlumniSBT.test.ts`

---

### TASK-014 — Função `buildCredentialHash` no core

**Complexidade:** P
**Pacote(s):** `packages/core`
**Depende de:** TASK-007

**O que fazer:**
Criar `src/identity/buildCredentialHash.ts`:
```ts
buildCredentialHash(data: CredentialRequestData): `0x${string}`
```
Calcula `keccak256(abi.encodePacked(course, graduationYear, degreeType))` usando `viem`.
Esse hash é o que vai on-chain no contrato.

**Testes esperados:**
- [ ] Retorna string `0x...` de 66 chars (32 bytes em hex)
- [ ] Mesmos dados sempre produzem o mesmo hash (determinístico)
- [ ] Dados diferentes produzem hashes diferentes

**Arquivos:**
- `packages/core/src/identity/buildCredentialHash.ts`
- `packages/core/src/identity/buildCredentialHash.test.ts`

---

### TASK-015 — API routes de admin

**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-011

**O que fazer:**

1. `GET /api/credential-requests` em `src/app/api/credential-requests/route.ts` (adicionar ao arquivo existente):
   - Retorna lista de todas as `CredentialRequest`
   - Suporta query param `?status=pending|approved|rejected` para filtrar

2. `PATCH /api/credential-requests/[id]` em `src/app/api/credential-requests/[id]/route.ts`:
   - Body: `{ action: 'approve' | 'reject', rejectionReason?: string }`
   - Valida que a solicitação existe
   - Valida que status atual é `'pending'`
   - Atualiza status no repositório
   - Retorna a solicitação atualizada com `200`

3. Atualizar `ICredentialRequestRepository` e `InMemoryCredentialRequestRepository` com:
   - `updateStatus(id: string, status: 'approved' | 'rejected', rejectionReason?: string): Promise<CredentialRequest | null>`

**Testes esperados:**
- [ ] `GET` sem filtro retorna todas as solicitações
- [ ] `GET ?status=pending` retorna só pendentes
- [ ] `PATCH approve` atualiza status para `'approved'`
- [ ] `PATCH reject` atualiza status para `'rejected'` com motivo
- [ ] `PATCH` em solicitação inexistente retorna `404`
- [ ] `PATCH` em solicitação já aprovada retorna `400`

**Arquivos:**
- `apps/web/src/app/api/credential-requests/route.ts` (atualizar)
- `apps/web/src/app/api/credential-requests/[id]/route.ts`
- `apps/web/src/lib/repository.ts` (atualizar)
- `apps/web/src/lib/repository.test.ts` (atualizar)

---

### TASK-016 — Hook `useAlumniSBT`

**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-009, TASK-014

**O que fazer:**
Criar `src/hooks/useAlumniSBT.ts` usando `viem`:
```ts
{
  issueCredential(to: `0x${string}`, hash: `0x${string}`): Promise<`0x${string}`> // txHash
  isLoading: boolean
  error: string | null
}
```
- Usa o `provider` do `useWeb3Auth` para criar um `WalletClient` viem
- Endereço do contrato via `process.env.NEXT_PUBLIC_ALUMNI_SBT_ADDRESS`
- ABI importada de `packages/contracts/artifacts`

**Testes esperados:**
- [ ] `issueCredential` chama o contrato com os args corretos (mock do walletClient)
- [ ] `isLoading` é `true` enquanto a tx está pendente
- [ ] `error` é preenchido se a transação falhar

**Arquivos:**
- `apps/web/src/hooks/useAlumniSBT.ts`
- `apps/web/src/hooks/useAlumniSBT.test.ts`
- `apps/web/.env.example` (adicionar `NEXT_PUBLIC_ALUMNI_SBT_ADDRESS`)

---

### TASK-017 — Página `/admin/solicitacoes`

**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-015, TASK-016

**O que fazer:**
Criar `src/app/admin/solicitacoes/page.tsx`:

1. Busca `GET /api/credential-requests?status=pending` ao montar
2. Exibe lista: nome, curso, tipo diploma, anos, endereço (truncado)
3. Para cada item: botões "Aprovar" e "Rejeitar"
4. Ao aprovar:
   - Chama `useAlumniSBT.issueCredential(address, buildCredentialHash(data))`
   - Aguarda confirmação da tx
   - Chama `PATCH /api/credential-requests/[id]` com `{ action: 'approve' }`
   - Remove item da lista
5. Ao rejeitar:
   - Pede motivo (input inline)
   - Chama `PATCH /api/credential-requests/[id]` com `{ action: 'reject', rejectionReason }`
   - Remove item da lista
6. Exibe loading e erros por item

**Testes esperados:**
- [ ] Renderiza lista de solicitações pendentes
- [ ] "Aprovar" chama `issueCredential` e então PATCH
- [ ] "Rejeitar" mostra campo de motivo e então PATCH
- [ ] Item removido da lista após ação
- [ ] Exibe erro se `issueCredential` falhar

**Arquivos:**
- `apps/web/src/app/admin/solicitacoes/page.tsx`
- `apps/web/src/app/admin/solicitacoes/page.test.tsx`

---

## Ordem de execução

```
TASK-013 (testes contrato)    TASK-014 (buildCredentialHash)
                                       ↓
              TASK-015 (API admin)    TASK-016 (useAlumniSBT)
                               ↘    ↙
                         TASK-017 (página admin)
```

## Nota sobre deploy do contrato

Para TASK-016 funcionar em ambiente real, o contrato precisa estar deployado na Amoy.
Script de deploy existe em `packages/contracts`. Após deploy, adicionar o endereço ao `.env.local`:
```
NEXT_PUBLIC_ALUMNI_SBT_ADDRESS=0x...
```
Para testes unitários, o endereço é mockado — não é necessário deploy.
