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
| US-019 | Administrador revoga SBT de membro em caso de fraude ou conduta grave | 🔴 | `backlog` | M |
| US-020 | Alumni inclui evidência de formação (Lattes ou LinkedIn) na solicitação de credencial | 🟡 | `backlog` | P |
| US-021 | Sistema detecta solicitações com dados de formação duplicados | 🟡 | `backlog` | P |
| US-022 | Alumni verificado indica outro alumni como referência na solicitação | 🟢 | `backlog` | M |
| US-014 | Alumni denuncia uma mensagem aos administradores | 🟡 | `backlog` | M |
| US-015 | Administrador visualiza e gerencia denúncias recebidas | 🟡 | `backlog` | M |
| US-016 | Agente pessoal alerta alumni sobre conteúdo inadequado antes de enviar | 🟡 | `backlog` | G |
| US-017 | coZap expõe MCP Server para integração com assistentes pessoais de IA | 🟡 | `backlog` | G |
| US-018 | Alumni reencaminha mensagem preservando cadeia de proveniência | 🟢 | `backlog` | M |
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

## Detalhamento de US-019

**Como** administrador,
**quero** revogar o SBT de um membro,
**para que** credenciais emitidas por erro ou fraude possam ser canceladas.

**Regras:**
- Nova função `revokeCredential(address)` no contrato `AlumniSBT.sol`, restrita a `onlyAdmin`
- Revogação emite evento `CredentialRevoked(address indexed member, address indexed revokedBy)`
- Após revogação: `hasCredential(address)` retorna `false`, token é deletado dos mappings
- Membro perde acesso à plataforma imediatamente (hook `useHasCredential` detecta na próxima verificação)
- Revogação é **irreversível** — para reintegrar, o membro precisa solicitar nova credencial
- Registro on-chain garante rastreabilidade de quem revogou e quando

**Impacto em outros contratos:** nenhum — token é soulbound e não há mercado secundário.

---

## Detalhamento de US-020

**Como** alumni,
**quero** incluir uma URL do Lattes ou LinkedIn na minha solicitação de credencial,
**para que** o administrador tenha uma evidência adicional para verificar minha formação.

**Regras:**
- Campo opcional no formulário de solicitação (US-001)
- Admin visualiza a URL no painel de revisão (US-002)
- Sem validação automática — verificação continua manual

---

## Detalhamento de US-021

**Como** sistema,
**quero** detectar solicitações com dados de formação idênticos a uma credencial já aprovada,
**para que** o admin seja alertado sobre possível duplicata antes de aprovar.

**Regras:**
- Ao criar solicitação, verifica se existe `CredentialRequest` aprovado com mesmo `course` + `graduationYear` + `degreeType`
- Se duplicata encontrada: solicitação é criada normalmente, mas admin vê alerta visual no painel
- Não bloqueia o fluxo — admin decide se é duplicata legítima (ex: dois alumni do mesmo curso e ano) ou fraude

---

## Detalhamento de US-022

**Como** alumni verificado,
**quero** indicar outro alumni como referência em uma solicitação de credencial,
**para que** o admin tenha um sinal adicional de confiança na aprovação.

**Regras:**
- Campo opcional na solicitação: endereço ou nome de um alumni verificado que conhece o solicitante
- Sistema valida que o alumni indicado possui SBT ativo (`hasCredential = true`)
- Admin vê a indicação no painel de revisão — não substitui a verificação manual
- O alumni indicado **não é notificado** nesta versão (fora de escopo por ora)

---

## Detalhamento de US-014

**Como** alumni,
**quero** denunciar uma mensagem aos administradores,
**para que** condutas inadequadas ou ilegais sejam apuradas.

**Regras:**
- Denúncia é anônima ou identificada — **o alumni escolhe** no momento do envio
- Ao denunciar, o sistema captura: mensagem denunciada + cadeia completa de eventos Nostr (eventos pai via tags `e`) + comentário opcional do denunciante
- A denúncia fica **arquivada permanentemente** — nunca deletada, mesmo que a mensagem seja removida do relay
- Admins recebem notificação de nova denúncia
- Escopo inicial: **somente admins**. Futuro: possibilidade de encaminhar a autoridades externas

**Fora de escopo por ora:**
- Integração com portais policiais ou autoridades externas
- Feedback ao denunciante sobre o resultado da apuração

---

## Detalhamento de US-015

**Como** administrador,
**quero** visualizar e gerenciar as denúncias recebidas,
**para que** eu possa apurar cada caso com contexto completo.

**Regras:**
- Painel lista denúncias por data, com status: `nova`, `em apuração`, `encerrada`
- Cada denúncia exibe: mensagem denunciada, cadeia de proveniência, identidade do denunciante (se não anônimo) e comentário
- Admin pode atualizar status e adicionar nota interna
- Denúncias nunca são deletadas

**Depende de:** US-014

---

## Detalhamento de US-016

**Como** alumni,
**quero** que meu assistente pessoal de IA me alerte antes de enviar uma mensagem possivelmente inadequada,
**para que** eu possa revisar o conteúdo antes de publicá-lo.

**Regras:**
- O alerta é **não bloqueante** — o alumni pode ignorar e enviar mesmo assim
- A avaliação ocorre **no cliente**, antes de assinar e publicar o evento Nostr
- O agente usa o contexto do canal (nome, descrição, regras) fornecido pelo MCP Server (US-017)
- Cada alumni configura seu próprio provider de IA — a plataforma não impõe nenhum
- Se nenhum agente estiver configurado, a feature simplesmente não aparece

**Depende de:** US-017

---

## Detalhamento de US-017

**Como** plataforma coZap,
**quero** expor um MCP Server com ferramentas e contexto da comunidade,
**para que** assistentes pessoais de IA dos alumni possam usá-lo para avaliações contextualizadas.

**Ferramentas expostas pelo MCP:**
- `get_channel_context(channelId)` — retorna nome, descrição e regras do canal
- `get_community_rules()` — retorna as diretrizes gerais da comunidade Alumni Poli
- `get_recent_messages(channelId, limit)` — retorna mensagens recentes para contextualizar o tom

**Regras:**
- MCP Server é autenticado — só alumni verificados (com SBT) podem conectar
- O alumni configura a URL do MCP Server no seu assistente (Claude Desktop, Cursor, etc.)
- O provider de IA é escolha do alumni — a plataforma é agnóstica

**Fora de escopo por ora:**
- Ferramentas de escrita/envio de mensagem via MCP (somente leitura de contexto)
- MCP para admin (gerenciar denúncias via assistente)

---

## Detalhamento de US-018

**Como** alumni,
**quero** reencaminhar uma mensagem de um canal para outros membros,
**para que** conteúdo relevante circule na comunidade com rastreabilidade de origem.

**Regras:**
- Implementação via **NIP-18** (Nostr repost) — o evento de repost referencia o evento original via tag `e`
- A cadeia é preservada: repost → mensagem repostada → mensagens pai (se for uma resposta)
- Ao denunciar um repost (US-014), a cadeia completa — incluindo a mensagem original — é capturada
- O contexto original fica acessível para admins na investigação, evitando perda de sentido por repasse fora de contexto

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
- **2026-03-22**: US-014 a US-018 adicionadas — sistema de denúncias (US-014/015),
  agente pessoal de alerta via MCP (US-016/017) e reencaminhamento com cadeia de
  proveniência (US-018).
- **2026-03-22**: US-019 a US-022 adicionadas — mecanismos anti-perfil-falso: revogação
  de SBT (🔴 alta prioridade), evidência de formação, detecção de duplicatas e vouching.
