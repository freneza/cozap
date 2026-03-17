# US-001 — Alumni solicita emissão de credencial

> Refinado pelo Agente de Refinamento em 2026-03-17.
> Decisão de identidade: ver ADR-001.

## Fluxo

```
Alumni abre /solicitar
  → escolhe: [Entrar com Google/email] ou [Conectar carteira]
  → autentica (Privy cuida de ambos os caminhos)
  → endereço Ethereum resolvido internamente
  → preenche: nome, curso, tipo diploma, ano entrada, ano conclusão
  → envia → solicitação salva como "pendente"
  → tela de confirmação
```

## Decisão arquitetural (MVP)

- Solicitações armazenadas em **repositório em memória** atrás de interface
  `ICredentialRequestRepository` — substituível por banco de dados sem mudar lógica.
- **Privy** (`@privy-io/react-auth`) gerencia ambos os caminhos de autenticação.
  Privy já integra com wagmi internamente — não precisamos configurar wagmi separado.
- Hook `useAuth()` abstrai os dois caminhos. O resto do app nunca sabe qual foi usado.

---

## Tarefas

### TASK-007 — Adicionar tipo `CredentialRequest` ao core

**História origem:** US-001
**Complexidade:** P
**Pacote(s):** `packages/core`

**O que fazer:**
Adicionar em `src/identity/types.ts` as interfaces:
- `CredentialRequestData` — dados que o alumni preenche no formulário
  (fullName, course, degreeType, entryYear, graduationYear)
- `CredentialRequest` — solicitação completa com id, walletAddress, status
  (`'pending' | 'approved' | 'rejected'`), requestedAt, e os dados acima
- Exportar pelo `index.ts` do pacote

**Testes esperados:**
- [ ] Tipos compilam sem erros de TypeScript
- [ ] `CredentialRequest` com status `'pending'` é assignável ao tipo

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings em `packages/core`
- [ ] Importável como `import { CredentialRequest } from '@cozap/core'`

**Arquivos prováveis:**
- `packages/core/src/identity/types.ts`
- `packages/core/src/identity/index.ts`

---

### TASK-008 — Função `buildCredentialRequest` no core

**História origem:** US-001
**Complexidade:** P
**Pacote(s):** `packages/core`
**Depende de:** TASK-007

**O que fazer:**
Criar `src/identity/buildCredentialRequest.ts` com função pura:
```
buildCredentialRequest(data: CredentialRequestData, walletAddress: `0x${string}`) → CredentialRequest
```
- Gera `id` único (crypto.randomUUID)
- Define `status: 'pending'`
- Define `requestedAt: Date.now()`
- Valida que `entryYear < graduationYear`
- Lança erro tipado `InvalidRequestData` se inválido

**Testes esperados:**
- [ ] Retorna `CredentialRequest` com status `'pending'` e dados corretos
- [ ] `requestedAt` é um timestamp numérico
- [ ] Lança `InvalidRequestData` quando `entryYear >= graduationYear`
- [ ] Lança `InvalidRequestData` quando `fullName` está vazio
- [ ] `id` gerado é único entre duas chamadas consecutivas

**Critérios de aceitação técnicos:**
- [ ] `pnpm test` verde em `packages/core`
- [ ] `pnpm typecheck` sem warnings
- [ ] Função pura — sem efeitos colaterais, sem I/O

**Arquivos prováveis:**
- `packages/core/src/identity/buildCredentialRequest.ts`
- `packages/core/src/identity/buildCredentialRequest.test.ts`
- `packages/core/src/identity/errors.ts`

---

### TASK-009 — Configurar Web3Auth e hook `useAuth`

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`

**O que fazer:**
1. Instalar `@web3auth/modal` e `@web3auth/base`
2. Criar `src/lib/web3auth.ts` com configuração: clientId (variável de ambiente
   `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`), loginMethods (`['email_passwordless', 'google']`),
   chain Polygon Amoy (chainId 80002). Para o Caminho B, Web3Auth suporta
   conexão com carteira externa via adapter `@web3auth/metamask-adapter`.
3. Criar `src/app/providers.tsx` com `Web3AuthProvider` envolvendo os filhos
4. Atualizar `src/app/layout.tsx` para usar `providers.tsx`
5. Criar hook `src/hooks/useAuth.ts` que retorna:
   ```ts
   {
     address: `0x${string}` | undefined
     isAuthenticated: boolean
     authMethod: 'embedded' | 'wallet' | null
     login: () => void
     logout: () => void
   }
   ```
   Usa o SDK do Web3Auth internamente. Detecta o adapter ativo para
   mapear `authMethod`.

**Testes esperados:**
- [ ] `useAuth` retorna `isAuthenticated: false` quando não autenticado
- [ ] `useAuth` retorna `address` e `isAuthenticated: true` quando autenticado
- [ ] `authMethod` é `'embedded'` para login por email/Google
- [ ] `authMethod` é `'wallet'` para login por carteira própria

**Critérios de aceitação técnicos:**
- [ ] `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` documentado em `.env.example`
- [ ] `pnpm build` sem erros
- [ ] `pnpm typecheck` sem warnings
- [ ] `Web3AuthProvider` em arquivo separado (`providers.tsx`), não diretamente no `layout.tsx`

**Arquivos prováveis:**
- `apps/web/src/lib/web3auth.ts`
- `apps/web/src/app/providers.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/hooks/useAuth.ts`
- `apps/web/src/hooks/useAuth.test.ts`
- `apps/web/.env.example`

---

### TASK-010 — Componente `CredentialRequestForm`

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-008

**O que fazer:**
Criar componente controlado `CredentialRequestForm` com campos:
- Nome completo (text)
- Curso de formação (text)
- Tipo de diploma (select: Graduação / Mestrado / Doutorado)
- Ano de entrada (number)
- Ano de conclusão (number)

Ao submeter: chama `buildCredentialRequest(formData, address)` e invoca
callback `onSubmit(request: CredentialRequest)`.

Exibe erros de validação inline (retornados por `buildCredentialRequest`).
Botão de submit desabilitado enquanto processando.

**Testes esperados:**
- [ ] Renderiza todos os campos
- [ ] Exibe erro quando ano de entrada >= ano de conclusão
- [ ] Exibe erro quando nome está vazio
- [ ] Chama `onSubmit` com `CredentialRequest` válido ao submeter
- [ ] Botão fica desabilitado após submit até receber resposta

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] Componente é `'use client'`
- [ ] Sem lógica de validação duplicada — delega tudo ao `buildCredentialRequest` do core

**Arquivos prováveis:**
- `apps/web/src/components/CredentialRequestForm.tsx`
- `apps/web/src/components/CredentialRequestForm.test.tsx`

---

### TASK-011 — API route `POST /api/credential-requests`

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-007

**O que fazer:**
Criar repositório e rota de API:

1. Interface `ICredentialRequestRepository` em `src/lib/repository.ts`:
   ```ts
   interface ICredentialRequestRepository {
     save(request: CredentialRequest): Promise<void>
     findAll(): Promise<CredentialRequest[]>
     findById(id: string): Promise<CredentialRequest | null>
   }
   ```
2. Implementação `InMemoryCredentialRequestRepository` (Map em módulo singleton)
3. Rota `POST /api/credential-requests` em `src/app/api/credential-requests/route.ts`:
   - Recebe JSON com `CredentialRequest`
   - Valida que `status === 'pending'`
   - Salva no repositório
   - Retorna `201` com o objeto salvo

**Testes esperados:**
- [ ] `POST` com dados válidos retorna `201` e o objeto
- [ ] `POST` com status diferente de `'pending'` retorna `400`
- [ ] `POST` com body inválido retorna `400`
- [ ] Repositório em memória persiste entre chamadas no mesmo processo

**Critérios de aceitação técnicos:**
- [ ] `pnpm typecheck` sem warnings
- [ ] Repositório injetável nos testes (não instanciado dentro da rota)
- [ ] `InMemoryCredentialRequestRepository` testado isoladamente

**Arquivos prováveis:**
- `apps/web/src/lib/repository.ts`
- `apps/web/src/lib/repository.test.ts`
- `apps/web/src/app/api/credential-requests/route.ts`
- `apps/web/src/app/api/credential-requests/route.test.ts`

---

### TASK-012 — Página `/solicitar`

**História origem:** US-001
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-009, TASK-010, TASK-011

**O que fazer:**
Criar `src/app/solicitar/page.tsx` com três estados visuais:

1. **Não autenticado**: dois botões — "Entrar com email ou Google" e
   "Conectar carteira" — ambos chamam `login()` do `useAuth`
   (Privy cuida de abrir o modal correto)
2. **Autenticado**: exibe `CredentialRequestForm`
3. **Solicitação enviada**: mensagem de confirmação com prazo estimado de resposta

Ao submeter o form: faz `POST /api/credential-requests` com o `CredentialRequest`,
trata erros de rede.

**Testes esperados:**
- [ ] Exibe botões de autenticação quando não autenticado
- [ ] Exibe formulário quando autenticado
- [ ] Exibe confirmação após submit com sucesso
- [ ] Exibe mensagem de erro se a API retornar erro

**Critérios de aceitação técnicos:**
- [ ] `pnpm build` sem erros
- [ ] `pnpm typecheck` sem warnings
- [ ] Sem lógica de negócio na página — apenas composição

**Arquivos prováveis:**
- `apps/web/src/app/solicitar/page.tsx`
- `apps/web/src/app/solicitar/page.test.tsx`

---

## Ordem de execução

```
TASK-007 (tipos CredentialRequest)
    ↓
TASK-008 (buildCredentialRequest)    TASK-009 (Privy + useAuth)    TASK-011 (repositório + API)
                         ↘                  ↙              ↘          ↙
                        TASK-010 (form)                  TASK-012 (página /solicitar)
```

## Nota sobre NEXT_PUBLIC_WEB3AUTH_CLIENT_ID

Para desenvolvimento local, criar uma conta gratuita no Web3Auth dashboard e criar
um novo projeto (Sapphire Devnet para desenvolvimento). Adicionar o clientId ao
`.env.local` (não commitado). O `.env.example` documenta a variável sem o valor real.
