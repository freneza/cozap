# US-005 — Alumni envia mensagem em canal

> Refinado pelo Agente de Refinamento em 2026-03-17.
> Depende de: US-004 (canal geral acessível).

## Fluxo

```
Alumni autenticado com SBT na /comunidade
  → digita mensagem no campo de texto
  → clica "Enviar"
  → evento Nostr kind 42 é assinado com privkey do alumni
  → evento publicado nos relays via SimplePool
  → input limpo; mensagem aparece na lista (via useChannelMessages)
```

## Decisão arquitetural

- **kind 42**: mensagem de canal Nostr. Tag `["e", channelId, "", "root"]` indica o canal.
- **`finalizeEvent`** de `nostr-tools`: assina e finaliza o evento com a privkey.
- **`pool.publish(relays, event)`**: publica nos relays; retorna array de Promises.
- `useSendMessage` recebe `privkey` como parâmetro — sem acesso direto ao identity store.
- Erros de publish (relay rejeita) são expostos via `error: string | null`.

---

## Tarefas

### TASK-023 — Hook `useSendMessage`

**História origem:** US-005
**Complexidade:** M
**Pacote(s):** `apps/web`

**O que fazer:**
Criar `src/hooks/useSendMessage.ts`:
```ts
useSendMessage(channelId: string, relayUrls: string[], privkey: Uint8Array): {
  sendMessage(content: string): Promise<void>
  isSending: boolean
  error: string | null
}
```
- Cria template kind 42 com `tags: [['e', channelId, '', 'root']]`
- Assina com `finalizeEvent(template, privkey)` de `nostr-tools`
- Publica com `new SimplePool().publish(relayUrls, event)`
- `isSending: true` enquanto aguarda publish; `false` após
- `error` preenchido se publish rejeitar; `null` em caso de sucesso

**Testes esperados:**
- [ ] Chama `finalizeEvent` com kind 42 e channelId correto
- [ ] `isSending` é `true` durante o publish e `false` após
- [ ] `error` é `null` após publish com sucesso
- [ ] `error` é preenchido se publish falhar

**Critérios de aceitação técnicos:**
- [ ] `finalizeEvent` e `SimplePool` mockáveis nos testes
- [ ] `pnpm typecheck` sem warnings

**Arquivos prováveis:**
- `apps/web/src/hooks/useSendMessage.ts`
- `apps/web/src/hooks/useSendMessage.test.ts`

---

### TASK-024 — Input de mensagem na página `/comunidade`

**História origem:** US-005
**Complexidade:** P
**Pacote(s):** `apps/web`
**Depende de:** TASK-023

**O que fazer:**
Atualizar `src/app/comunidade/page.tsx`:
- Adicionar `<form>` com `<input>` (texto) e botão "Enviar"
- Usa `useSendMessage` com `channelId`, `relays` e `privkey` do `useNostrIdentity`
- Input limpo após envio bem-sucedido
- Botão desabilitado enquanto `isSending`
- Exibe erro de envio se `error` estiver preenchido

**Testes esperados:**
- [ ] Input e botão "Enviar" estão presentes quando autenticado com SBT
- [ ] Botão fica desabilitado enquanto `isSending` é true
- [ ] Input é limpo após envio bem-sucedido
- [ ] Erro de envio é exibido se `sendMessage` rejeitar

**Critérios de aceitação técnicos:**
- [ ] `useSendMessage` mockado nos testes de página
- [ ] `pnpm typecheck` sem warnings

**Arquivos prováveis:**
- `apps/web/src/app/comunidade/page.tsx`
- `apps/web/src/app/comunidade/page.test.tsx` (atualizado)

---

## Ordem de execução

```
TASK-023 (useSendMessage)
        ↓
TASK-024 (input na /comunidade)
```
