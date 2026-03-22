# Backlog — coZap

> Gerenciado pelo Orquestrador. Atualizado após cada iteração.

## Legenda

- **Prioridade**: 🔴 Alta | 🟡 Média | 🟢 Baixa
- **Status**: `backlog` | `refinando` | `em andamento` | `revisão` | `done`
- **Complexidade**: P (< 1h) | M (1-2h) | G (> 2h)

---

## Em andamento

_Nenhuma tarefa em andamento._

---

## Backlog priorizado

> Ordenado pelo fluxo real de uso: um alumni só pode verificar sua identidade após
> ter recebido o SBT, e só recebe o SBT após solicitar e ser aprovado por um admin.

| # | História | Prioridade | Status | Complexidade |
|---|---|---|---|---|
| US-001 | Alumni solicita emissão de credencial informando dados de formação | 🔴 | `done` | M |
| US-002 | Administrador revisa solicitação e emite SBT para alumni verificado | 🔴 | `done` | M |
| US-003 | Alumni acessa a plataforma com identidade verificada pelo SBT | 🔴 | `done` | G |
| US-004 | Alumni acessa canal geral da comunidade após verificação | 🔴 | `done` | G |
| US-005 | Alumni envia mensagem em canal | 🟡 | `done` | M |
| US-006 | Alumni explora canais temáticos e entra em um | 🟡 | `backlog` | M |
| US-007 | Alumni visualiza perfil próprio com formações | 🟡 | `backlog` | M |
| US-008 | Alumni atualiza dados do perfil off-chain | 🟢 | `backlog` | M |
| US-009 | Administrador adiciona outro administrador | 🟢 | `backlog` | P |
| US-010 | Alumni silencia um membro específico em um canal | 🟡 | `backlog` | M |
| US-011 | Alumni visualiza mensagens de membros silenciados via toggle | 🟢 | `backlog` | P |
| US-012 | Agente avalia aderência de mensagens ao tópico do canal | 🟡 | `backlog` | G |
| US-013 | Alumni configura threshold de relevância e filtra mensagens pelo score do agente | 🟡 | `backlog` | M |

---

## Detalhamento de US-001

**Como** alumni egresso da Poli,
**quero** solicitar minha credencial informando meus dados de formação,
**para que** um administrador possa verificar e emitir meu SBT.

**Dados informados pelo alumni:**
- Nome completo
- Curso de formação
- Tipo de diploma (graduação / mestrado / doutorado)
- Ano de entrada
- Ano de conclusão

> O endereço Ethereum **não é pedido ao alumni**. O sistema resolve o endereço
> internamente pelo caminho de identidade escolhido (ver ADR-001):
> - **Caminho A (padrão):** alumni faz login com email/Google → embedded wallet criada via Web3Auth (MPC)
> - **Caminho B (avançado):** alumni conecta carteira própria (MetaMask, WalletConnect)

**Fluxo:**
1. Alumni escolhe como acessar: email/Google ou carteira própria
2. Preenche formulário com dados de formação
3. Solicitação fica pendente com o endereço já resolvido pelo sistema
4. Administrador verifica os dados na base da Poli (manual por ora)
5. Administrador pode checar redes sociais/contatos para confirmar identidade
6. Administrador aprova → SBT é emitido (US-002)
7. Alumni acessa a plataforma verificado (US-003)

**Fora de escopo por ora:**
- Integração automática com base de dados da Poli
- Notificação ao alumni sobre aprovação/rejeição
- Migração entre Caminho A e Caminho B

---

## Detalhamento de US-002

**Como** administrador,
**quero** revisar solicitações pendentes e aprovar ou rejeitar cada uma,
**para que** apenas egressos legítimos da Poli recebam o SBT.

**Fluxo:**
1. Admin acessa painel de solicitações pendentes
2. Visualiza dados da formação do solicitante
3. Verifica manualmente na base da Poli
4. Opcionalmente verifica identidade por redes sociais/contatos
5. Aprova → transação on-chain emite o SBT (`issueCredential`)
6. Rejeita → solicitação arquivada com motivo

---

## Detalhamento de US-010

**Como** alumni,
**quero** silenciar um membro específico em um canal,
**para que** suas mensagens não apareçam no meu feed daquele canal.

**Regras:**
- Silêncio é **local** (armazenado no dispositivo, não sincronizado via relay)
- Silêncio é **por canal** (silenciar em um canal não afeta outros)
- Mensagens de membros silenciados são filtradas no cliente antes da renderização
- O membro silenciado não é notificado

**Fora de escopo por ora:**
- Sincronização entre dispositivos (NIP-51)
- Visualização de mensagens silenciadas (US-011)

---

## Detalhamento de US-011

**Como** alumni,
**quero** poder ver as mensagens de membros que silenciei via toggle "Mostrar silenciados",
**para que** eu possa consultar o histórico quando quiser.

**Depende de:** US-010

---

## Detalhamento de US-012

**Como** plataforma coZap,
**quero** que um agente de IA avalie a aderência de cada mensagem ao tópico do canal,
**para que** os membros possam filtrar conteúdo fora do escopo esperado.

**Regras:**
- Avaliação é **centralizada** (serviço do coZap, não por membro)
- Score de aderência com **gradação** (ex: 0.0 a 1.0)
- O agente recebe: conteúdo da mensagem + descrição do canal
- Score é publicado como metadata da mensagem (evento Nostr kind 1078 ou tag customizada)
- Provider de IA a definir — priorizar menor custo (candidatos: Claude Haiku, Gemini Flash, Groq)

**Fora de escopo por ora:**
- Feedback dos membros para melhorar o modelo
- Moderação automática baseada no score

---

## Detalhamento de US-013

**Como** alumni,
**quero** configurar um threshold de relevância e filtrar mensagens pelo score do agente,
**para que** eu veja apenas mensagens com aderência acima do meu limite de tolerância.

**Regras:**
- Threshold configurável por canal (ex: slider 0–100%)
- Mensagens abaixo do threshold são ocultadas (mesmo comportamento da US-010)
- Configuração armazenada localmente
- Depende do score gerado pela US-012 estar disponível na mensagem

**Depende de:** US-012

---

## Notas de iteração

- **2026-03-17**: Backlog reordenado para refletir fluxo real de uso. Adicionada
  US-001 (solicitação de credencial) como pré-requisito de US-002 e US-003.
  Arquivo `docs/dev/US-001-tasks.md` refere-se à antiga US-001 (agora US-003) —
  será renomeado quando a implementação iniciar.
- **2026-03-17**: ADR-001 registrado — estratégia de identidade com dois caminhos:
  embedded wallet (padrão) e carteira própria (avançado). Endereço Ethereum
  invisível ao alumni em ambos os casos.
- **2026-03-17**: ADR-001 atualizado — Privy substituído por Web3Auth. Motivo:
  Web3Auth usa MPC (chave nunca existe inteira em servidor), é open source e
  permite self-host. US-003 renomeada para refletir que o acesso pode ser por
  email/Google ou carteira própria.
- **2026-03-17**: US-003 concluída — hook `useHasCredential` lê `hasCredential(address)`
  on-chain via viem publicClient. Página inicial `/` tem 3 estados: não autenticado,
  autenticado sem SBT (em análise), autenticado com SBT (boas-vindas). 39 testes web.
- **2026-03-17**: US-004 concluída — `useNostrIdentity` (keypair gerado/persistido em
  localStorage), `useChannelMessages` (SimplePool, kind 42, canal geral), página
  `/comunidade` protegida por SBT com lista de mensagens. 55 testes web.
- **2026-03-17**: US-005 concluída — `useSendMessage` assina evento kind 42 com
  `finalizeEvent` e publica via `SimplePool.publish`. Formulário de envio na página
  `/comunidade` com limpeza automática e exibição de erro. 65 testes web.
- **2026-03-22**: US-010 a US-013 adicionadas — duas iniciativas independentes:
  silêncio de membros por canal (local, US-010/011) e agente de relevância com
  threshold configurável (centralizado, US-012/013). Provider de IA a definir.
