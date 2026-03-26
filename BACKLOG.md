# Backlog — coZap

> Gerenciado pelo Orquestrador. Atualizado após cada iteração.

## Legenda

- **Prioridade**: 🔴 Alta | 🟡 Média | 🟢 Baixa
- **Status**: `backlog` | `refinando` | `em andamento` | `revisão` | `done`
- **Complexidade**: P (< 1h) | M (1-2h) | G (> 2h)

---

## Em andamento

_Nenhuma tarefa em andamento._

## Bugs conhecidos

| # | Descrição | Prioridade |
|---|---|---|
| BUG-001 | ~~Página `/admin/solicitacoes` exibe aprovadas — repositório não persistia após aprovação~~ **Corrigido:** `updateStatus` aceitava apenas `'approved'\|'rejected'`, causando erro TypeScript que quebrava o handler PATCH inteiro. Corrigido junto com `findAll` (Prisma `exactOptionalPropertyTypes`) e `entryYear` opcional no core. | ✅ |

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
| US-010 | Alumni silencia um membro específico em um canal | 🔴 | `backlog` | M |
| US-019 | Administrador revoga SBT de membro em caso de fraude ou conduta grave | 🔴 | `done` | M |
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
| US-023 | Alumni reage a uma mensagem com emoji | 🔴 | `backlog` | P |
| US-024 | Alumni busca mensagens em um canal | 🔴 | `backlog` | M |
| US-025 | Alumni ou admin fixa uma mensagem em um canal | 🔴 | `backlog` | P |
| US-026 | Alumni silencia notificações de um canal ou grupo | 🔴 | `backlog` | P |
| US-027 | Alumni bloqueia um membro da plataforma | 🔴 | `backlog` | M |
| US-028 | Alumni configura foto e bio no perfil | 🟡 | `backlog` | M |
| US-029 | Tag de membro no grupo exibe curso e período de formação | 🟡 | `backlog` | P |
| US-032 | Grupos suportam até 10.000 membros com lista criptografada e controles de admin | 🟡 | `backlog` | G |
| US-030 | Plataforma previne capturas de tela (screen security) | 🟢 | `backlog` | M |
| US-031 | Alumni configura tempo de expiração de mensagens em um canal | 🟢 | `backlog` | M |
| US-033 | 🥚 Easter egg: notificação especial para membros computação2002 | 🟢 | `backlog` | P |
| US-034 | Administrador filtra membros verificados por nome, curso e período | 🟡 | `backlog` | P |
| US-035 | Lista de membros exibe contagem de denúncias recebidas por cada membro | 🟡 | `backlog` | M |
| US-036 | Membro é notificado quando seu SBT é revogado | 🟡 | `backlog` | M |
| US-037 | Membro com SBT revogado recebe mensagem explicativa ao tentar fazer login | 🔴 | `backlog` | P |

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

---

## Detalhamento de US-023

**Como** alumni,
**quero** reagir a uma mensagem com um emoji,
**para que** eu possa expressar sentimentos de forma rápida sem precisar enviar uma mensagem.

**Regras:**
- Qualquer emoji pode ser usado como reação
- Uma mensagem pode ter múltiplas reações de membros diferentes
- O mesmo alumni pode reagir com emojis diferentes à mesma mensagem
- Reações são exibidas agrupadas por emoji com contagem
- Implementação via evento Nostr kind 7 (NIP-25 — Reactions)
- Reação negativa (`-`) remove a reação anterior do mesmo alumni

---

## Detalhamento de US-024

**Como** alumni,
**quero** buscar mensagens em um canal por palavra-chave,
**para que** eu possa encontrar conteúdo relevante sem rolar o histórico inteiro.

**Regras:**
- Busca local no histórico de mensagens já carregadas pelo cliente (sem consulta ao relay)
- Busca por substring no conteúdo da mensagem (case-insensitive)
- Resultados exibidos com contexto (canal, data, autor)
- Escopo inicial: canal em que o alumni está — busca global entre canais é fora de escopo por ora
- Não é necessário armazenar índice no servidor — privacidade preservada

---

## Detalhamento de US-025

**Como** alumni ou admin,
**quero** fixar uma mensagem em um canal,
**para que** informações importantes fiquem visíveis para todos os membros.

**Regras:**
- Até 3 mensagens podem estar fixadas simultaneamente por canal
- Apenas admins podem fixar mensagens (permissão padrão — pode ser alterada por admin)
- Mensagem fixada aparece em destaque no topo do canal
- Fixar/desafixar é registrado como evento Nostr (kind 9041 ou tag customizada)
- Duração: permanente até ser desafixada (sem expiração automática nesta versão)

---

## Detalhamento de US-026

**Como** alumni,
**quero** silenciar as notificações de um canal ou grupo,
**para que** eu não seja interrompido por mensagens de canais de baixa prioridade.

**Regras:**
- Silêncio é **local** (armazenado no dispositivo)
- Canal silenciado ainda pode ser acessado — apenas não gera notificação push
- Alumni pode configurar duração: 8h, 24h, 1 semana, ou permanente
- Interface: ícone de sino no canal indica se está silenciado
- Independente do silêncio de membros (US-010) — são controles distintos

---

## Detalhamento de US-027

**Como** alumni,
**quero** bloquear um membro da plataforma,
**para que** eu não receba mensagens dele em nenhum canal.

**Regras:**
- Bloqueio é **global** (afeta todos os canais, diferente do silêncio por canal da US-010)
- Membro bloqueado não sabe que foi bloqueado
- Mensagens do membro bloqueado não aparecem para o alumni em nenhum canal
- Lista de bloqueados armazenada localmente
- Alumni pode desbloquear a qualquer momento
- Bloqueio persiste mesmo que o membro troque de chave Nostr (identificado por npub)

**Diferença em relação a US-010:** US-010 silencia um membro em um canal específico; US-027 bloqueia globalmente.

---

## Detalhamento de US-028

**Como** alumni,
**quero** adicionar foto e bio ao meu perfil,
**para que** outros membros da comunidade possam me identificar e conhecer meu contexto.

**Regras:**
- Campos adicionais ao perfil: foto (URL ou upload), bio (texto livre, limite de 200 caracteres)
- Dados armazenados off-chain (banco de dados da aplicação) — não na blockchain
- Foto e bio são visíveis para todos os membros verificados da plataforma
- Expande US-007 (visualização) e US-008 (atualização de dados do perfil)
- Nome exibível já existe como campo — esta US adiciona foto e bio

---

## Detalhamento de US-029

**Como** membro de um canal,
**quero** ver a tag de outro membro exibindo seu curso e período de formação,
**para que** eu possa identificar rapidamente o contexto acadêmico de quem está participando.

**Regras:**
- Tag exibida ao lado do nome do membro nas mensagens do canal
- Formato sugerido: `Eng. Civil '12` (curso abreviado + ano de conclusão)
- Conteúdo da tag derivado dos dados de credencial aprovada (US-001/002) — sem input manual
- Alumni pode optar por ocultar sua tag (privacidade)
- Admins podem permitir que membros customizem rótulos adicionais (papel no grupo, ex: "Moderador", "Alumni Destaque")

---

## Detalhamento de US-032

**Como** plataforma coZap,
**quero** que grupos suportem até 10.000 membros com lista de membros criptografada e controles de admin granulares,
**para que** a comunidade Alumni Poli possa crescer sem limitações técnicas e com privacidade dos participantes.

**Requisitos de escala:**
- Capacidade de até 10.000 membros por grupo/canal
- Arquitetura de relay Nostr deve ser validada para este volume (NIP-29 para grupos gerenciados)

**Criptografia de membros:**
- Lista de membros do grupo armazenada de forma criptografada no relay
- Apenas membros com a chave do grupo podem descriptografar a lista
- Zero-knowledge proofs para autenticação de membros sem revelar identidade ao relay
- Referência de implementação: Signal Private Group System

**Controles de admin:**
- Configurar quem pode postar (todos os membros / somente admins)
- Adicionar e remover membros
- Definir rótulos de papel por membro (ex: "Moderador", "Fundador")
- Fixar mensagens (permissão delegável aos membros)
- Transferir permissão de admin para outro membro

**Fora de escopo por ora:**
- Subgrupos ou canais aninhados
- Sincronização de configurações entre dispositivos do mesmo admin

---

## Detalhamento de US-030

**Como** alumni,
**quero** que a plataforma previna capturas de tela de conversas,
**para que** o conteúdo privado da comunidade não seja facilmente vazado.

**Regras:**
- Em mobile (iOS/Android): usar flags nativas da plataforma para bloquear screenshot (FLAG_SECURE no Android, API de proteção de conteúdo no iOS)
- Em desktop (web): overlay ou aviso ao detectar tentativa de screenshot (limitação técnica — não é 100% eficaz no browser)
- Aplicado em todas as telas com mensagens
- Configurável pelo admin do canal (on/off por canal)

---

## Detalhamento de US-031

**Como** alumni,
**quero** configurar um tempo de expiração para mensagens em um canal,
**para que** o histórico não se acumule indefinidamente e conversas sensíveis não fiquem permanentes.

**Regras:**
- Opções de expiração: 24h, 7 dias, 30 dias, ou sem expiração
- Configuração por canal, definida pelo admin
- Mensagens expiradas são removidas localmente do cliente (não do relay, salvo se o relay suportar deleção via NIP-09)
- Evento de deleção (NIP-09) é publicado no relay ao expirar, sinalizando que os demais clientes devem remover
- Alumni vê indicador visual de que o canal tem expiração configurada

## Detalhamento de US-033

**Como** membro com tag `computação2002`,
**quero** ouvir um som especial ao receber mensagem de outro membro com a mesma tag,
**para que** a turma de Computação 2002 tenha um sinal de reconhecimento secreto na plataforma.

**Regras:**
- Condição: remetente **e** destinatário possuem tag derivada de `computação2002` (curso Computação + ano de entrada 2002 ou conclusão 2002 — a definir na implementação)
- Ao disparar a notificação, o som padrão é substituído por um áudio com a voz falando **"Eeeelaiá"**
- Comportamento silencioso: nenhuma indicação visual diferente — apenas o som
- Não documentado publicamente em nenhuma tela da plataforma
- O arquivo de áudio é empacotado no bundle do cliente (sem dependência de CDN externo)
- Se o canal estiver silenciado (US-026), o easter egg também é silenciado — respeita a preferência do usuário

---

## Detalhamento de US-034

**Como** administrador,
**quero** filtrar a lista de membros verificados por nome, curso e período de formação,
**para que** eu consiga encontrar rapidamente o membro cujo acesso preciso revisar ou revogar.

**Regras:**
- Filtros disponíveis: nome (substring, case-insensitive), curso (substring), ano de conclusão
- Filtros são combinados (AND) — aplicados localmente nos dados já carregados
- Resultado atualizado em tempo real conforme o admin digita (sem recarregar a página)
- Estado dos filtros não é persistido — resetam ao recarregar a página

---

## Detalhamento de US-035

**Como** administrador,
**quero** ver a contagem de denúncias recebidas por cada membro na lista de membros verificados,
**para que** eu tenha contexto antes de decidir revogar um SBT.

**Regras:**
- Contagem exibida como badge no card do membro (ex: "3 denúncias")
- Inclui apenas denúncias com status `nova` ou `em apuração` — denúncias `encerradas` não contam
- Zero denúncias: badge não é exibido (para não poluir a interface)
- Clicar no badge leva para o painel de denúncias filtrado pelo membro (US-015)
- **Depende de:** US-014 (sistema de denúncias)

---

## Detalhamento de US-036

**Como** membro,
**quero** ser notificado quando meu SBT for revogado,
**para que** eu entenda por que perdi o acesso à plataforma.

**Canal 1 — Mensagem na plataforma (se ainda estiver conectado):**
- Ao revogar, a plataforma publica uma mensagem direta criptografada (NIP-04) para o membro via Nostr
- Mensagem inclui: motivo da revogação (se informado pelo admin) e orientação para contato

**Canal 2 — Notificação por celular:**
- Se o membro tiver número de celular cadastrado no perfil, envia SMS ou WhatsApp via provider externo (ex: Twilio, Z-API)
- Conteúdo: mesmo da mensagem Nostr, em linguagem simples
- Provider a definir na implementação — abstraído por interface `INotificationService`

**Fora de escopo por ora:**
- E-mail de notificação
- Notificação push em app mobile

**Depende de:** US-028 (perfil com dados de contato) para o canal 2

---

## Detalhamento de US-037

**Como** membro com SBT revogado,
**quero** receber uma mensagem clara ao tentar fazer login,
**para que** eu entenda que meu acesso foi cancelado e como posso buscar esclarecimentos.

**Regras:**
- Ao concluir o login, o sistema verifica `hasCredential(address)` on-chain
- Se `false` **e** o banco de dados indica que o membro já teve status `approved` anteriormente (ou seja, foi revogado, não está apenas pendente), exibe tela específica de acesso revogado
- Tela exibe: mensagem de que o acesso foi suspenso, motivo (se registrado na revogação), canal de contato com a administração
- Tela é distinta da tela "em análise" (alumni que solicitou mas ainda não foi aprovado)
- Membro revogado **não tem acesso** à plataforma — não pode nem ver canais

**Diferença entre estados:**
- `pending` → "Solicitação em análise"
- `approved` + `hasCredential = true` → acesso liberado
- `approved` + `hasCredential = false` → **estado impossível em operação normal**
- `revoked` → "Acesso suspenso" (esta US)
- sem solicitação → tela de login/solicitar

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
- **2026-03-26**: US-019 concluída — `revokeCredential` no contrato AlumniSBT, hook
  `useAlumniSBT`, rotas API com `action: revoke` e página `/admin/membros`. BUG-001
  corrigido: assinatura de `updateStatus` e `findAll` no Prisma. US-034 a US-037
  adicionadas — melhorias no fluxo de revogação: filtros, contagem de denúncias,
  notificação ao membro e tela de acesso suspenso no login.
  161 testes totais (27 contracts + 36 core + 98 web).
- **2026-03-25**: US-023 a US-032 adicionadas — funcionalidades de mensageria básica
  inspiradas no Signal como referência de app de mensagens: reações, busca, mensagens
  fixadas, silêncio de canal, bloqueio de membro, perfil social, tag de membro no grupo,
  grupos de até 10.000 membros com controles de admin e criptografia de lista de membros.
  US-010 elevada para 🔴 Alta. Mensagens que desaparecem e screen security adicionadas
  com 🟢 Baixa prioridade.
