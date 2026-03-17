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
| US-004 | Alumni acessa canal geral da comunidade após verificação | 🔴 | `backlog` | G |
| US-005 | Alumni envia mensagem em canal | 🟡 | `backlog` | M |
| US-006 | Alumni explora canais temáticos e entra em um | 🟡 | `backlog` | M |
| US-007 | Alumni visualiza perfil próprio com formações | 🟡 | `backlog` | M |
| US-008 | Alumni atualiza dados do perfil off-chain | 🟢 | `backlog` | M |
| US-009 | Administrador adiciona outro administrador | 🟢 | `backlog` | P |

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
