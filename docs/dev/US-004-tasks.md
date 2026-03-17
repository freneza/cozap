# US-004 — Alumni acessa canal geral da comunidade após verificação

> Refinado pelo Agente de Refinamento em 2026-03-17.
> Depende de: US-003 (acesso verificado por SBT).

## Fluxo

```
Alumni autenticado com SBT abre /comunidade
  → sistema verifica SBT (useHasCredential) — sem SBT: redireciona para /
  → sistema garante identidade Nostr (useNostrIdentity) — gera keypair se primeira visita
  → sistema conecta a relay(s) e assina canal geral
  → exibe mensagens do canal em ordem cronológica
```

## Decisão arquitetural

- **Nostr kind 42**: mensagens de canal. A assinatura usa `["e", channelId, "", "root"]`.
- **Keypair Nostr**: gerado na primeira visita com `generateSecretKey` + `getPublicKey` de
  `nostr-tools`. Privkey hex salvo em `localStorage['nostr_privkey']`. MVP — sem derivação
  da chave Ethereum (complexidade alta, valor baixo agora).
- **SimplePool**: `nostr-tools` para multiplexar assinatura entre relays.
- **GENERAL_CHANNEL_ID**: variável de ambiente `NEXT_PUBLIC_NOSTR_CHANNEL_ID`. Para
  desenvolvimento: criar canal manualmente e fixar o event ID.
- **Relay list**: `NEXT_PUBLIC_NOSTR_RELAYS` (JSON array), fallback para lista padrão.
- `nostr-tools` adicionado como dep direta de `apps/web` (os hooks são React-específicos).

---

## Tarefas

### TASK-020 — Hook `useNostrIdentity`

**História origem:** US-004
**Complexidade:** M
**Pacote(s):** `apps/web`

**O que fazer:**
Criar `src/hooks/useNostrIdentity.ts`:
```ts
useNostrIdentity(): { pubkey: string; privkey: Uint8Array }
```
- Na primeira chamada: gera keypair com `generateSecretKey()` + `getPublicKey()`
  de `nostr-tools`, salva hex da privkey em `localStorage['nostr_privkey']`
- Nas chamadas seguintes: recupera do localStorage
- `pubkey` em hex (não npub)

**Testes esperados:**
- [ ] Retorna pubkey e privkey na primeira chamada
- [ ] Reutiliza o mesmo keypair em chamadas subsequentes (mesmo privkey)
- [ ] Pubkey deriva corretamente da privkey gerada
- [ ] Funciona sem localStorage (SSR): retorna keypair gerado sem persistir

**Critérios de aceitação técnicos:**
- [ ] `localStorage` mockável nos testes (jsdom já fornece)
- [ ] `generateSecretKey` mockável nos testes
- [ ] `pnpm typecheck` sem warnings

**Arquivos prováveis:**
- `apps/web/src/hooks/useNostrIdentity.ts`
- `apps/web/src/hooks/useNostrIdentity.test.ts`

---

### TASK-021 — Hook `useChannelMessages`

**História origem:** US-004
**Complexidade:** G
**Pacote(s):** `apps/web`

**O que fazer:**
Criar `src/hooks/useChannelMessages.ts`:
```ts
useChannelMessages(channelId: string, relayUrls: string[]): {
  messages: ChannelMessage[]
  isConnected: boolean
}
```
- Usa `SimplePool` de `nostr-tools`
- Filtro: `{ kinds: [42], "#e": [channelId], limit: 50 }`
- Mapeia evento Nostr → `ChannelMessage` (de `@cozap/core`)
- Ordena mensagens por `createdAt` crescente
- `isConnected: true` quando o pool está ativo, `false` enquanto ainda não conectou
- Cleanup: `pool.close(relayUrls)` no unmount

**Testes esperados:**
- [ ] Retorna array vazio e `isConnected: false` antes de conectar
- [ ] Adiciona mensagens ao estado quando `onevent` é disparado pelo pool
- [ ] Mensagens são ordenadas por `createdAt` crescente
- [ ] Chama `subscribeMany` com filtro kind 42 e channelId correto
- [ ] Limpa a assinatura no unmount

**Critérios de aceitação técnicos:**
- [ ] `SimplePool` mockável nos testes
- [ ] `pnpm typecheck` sem warnings
- [ ] Sem vazamentos de memória (cleanup no useEffect)

**Arquivos prováveis:**
- `apps/web/src/hooks/useChannelMessages.ts`
- `apps/web/src/hooks/useChannelMessages.test.ts`

---

### TASK-022 — Página `/comunidade`

**História origem:** US-004
**Complexidade:** M
**Pacote(s):** `apps/web`
**Depende de:** TASK-020, TASK-021

**O que fazer:**
Criar `src/app/comunidade/page.tsx`:

- **Sem SBT ou não autenticado**: redireciona para `/` via `useRouter().replace('/')`
- **Carregando** (verificando credencial ou conectando relay): spinner "Conectando..."
- **Conectado**: lista de mensagens do canal, com pubkey do autor (truncada) e conteúdo

**Testes esperados:**
- [ ] Redireciona para `/` quando `hasCredential` é `false`
- [ ] Exibe "Conectando..." enquanto verifica/conecta
- [ ] Exibe mensagens quando `isConnected` é `true` e `messages` não está vazio
- [ ] Exibe "Nenhuma mensagem ainda" quando `messages` está vazio e conectado

**Critérios de aceitação técnicos:**
- [ ] `'use client'`
- [ ] `useAuth`, `useHasCredential`, `useNostrIdentity`, `useChannelMessages` mockados nos testes
- [ ] `pnpm typecheck` sem warnings
- [ ] Sem lógica além de composição e renderização

**Arquivos prováveis:**
- `apps/web/src/app/comunidade/page.tsx`
- `apps/web/src/app/comunidade/page.test.tsx`

---

## Variáveis de ambiente necessárias

| Variável | Descrição | Fallback |
|---|---|---|
| `NEXT_PUBLIC_NOSTR_CHANNEL_ID` | Event ID do canal geral Alumni Poli | `''` |
| `NEXT_PUBLIC_NOSTR_RELAYS` | JSON array de URLs de relay | `["wss://relay.damus.io","wss://nos.lol"]` |

Adicionar ao `.env.example`.

## Ordem de execução

```
TASK-020 (useNostrIdentity)   TASK-021 (useChannelMessages)
                   ↘             ↙
               TASK-022 (página /comunidade)
```
