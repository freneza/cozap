# ADR-001 — Estratégia de identidade Ethereum: carteira própria ou embedded wallet

**Data:** 2026-03-17
**Atualizado:** 2026-03-17
**Status:** Aceito
**Contexto:** US-001, US-002, US-003

---

## Contexto

O coZap usa Soulbound Tokens (SBT) na blockchain como prova de identidade Alumni Poli.
Para receber e usar um SBT, o alumni precisa de um endereço Ethereum.

O público-alvo inclui desde engenheiros com experiência em Web3 até egressos de outras
áreas sem nenhum contato com blockchain. Exigir que todos instalem MetaMask e gerenciem
uma carteira criaria uma barreira de entrada alta e excluiria boa parte da comunidade.

Por outro lado, esconder completamente a carteira via serviço totalmente custodial
contradiz a proposta de identidade auto-soberana do projeto.

---

## Decisão

Oferecer **dois caminhos de identidade**, ambos de primeira classe:

### Caminho A — Acesso simplificado (padrão)
- Alumni faz login com email ou Google (conta `@usp.br` natural para esse público)
- Sistema cria uma **embedded wallet** transparentemente via **Web3Auth**
- Alumni nunca vê endereço, nunca instala extensão, nunca assina transação manualmente
- SBT é emitido para a carteira embedded

### Caminho B — Carteira própria (modo avançado)
- Alumni clica em "Conectar carteira" e usa MetaMask, WalletConnect, etc.
- Controle total das chaves privadas — identidade verdadeiramente auto-soberana
- SBT é emitido diretamente para o endereço conectado

### Regras comuns a ambos
- Um alumni = um SBT = um endereço (restrição do contrato `AlumniSBT`)
- O formulário de solicitação **não expõe o endereço** ao alumni — o sistema resolve
  o endereço internamente (embedded ou conectado) antes de enviar ao admin
- Alumni do Caminho A pode exportar a chave privada da carteira embedded pelo
  painel do Web3Auth e migrar para o Caminho B (processo documentado, não automático)

---

## Por que Web3Auth

Três serviços foram avaliados para o Caminho A: Privy, Magic.link e Web3Auth.

**Web3Auth** foi escolhido pelos seguintes motivos:

### 1. MPC — chave privada nunca existe inteira em nenhum servidor

Web3Auth usa **Multi-Party Computation (MPC)**: a chave privada é dividida
matematicamente entre o dispositivo do alumni e os nós da rede Web3Auth.
Nenhuma das partes isoladas consegue assinar transações — é necessária cooperação.

Isso significa:
- Web3Auth (a empresa) **não pode** acessar os fundos ou assinar em nome do alumni
- Um ataque ao servidor do Web3Auth não compromete as chaves
- É fundamentalmente diferente de uma custódia tradicional

Comparação direta:

| Modelo | Quem tem a chave? | Risco de custódia |
|---|---|---|
| MetaMask | Somente o usuário | Nenhum (mas usuário pode perder) |
| Privy (padrão) | Privy + usuário | Médio — Privy pode reconstruir |
| **Web3Auth MPC** | **Nós distribuídos + usuário** | **Baixo — requer cooperação** |
| Magic.link | Magic.link | Alto — totalmente custodial |

### 2. Open source

O core do Web3Auth é open source (Apache 2.0). A infraestrutura MPC pode ser
inspecionada e, no futuro, substituída por uma rede própria se necessário.

### 3. Self-host possível

A camada de autenticação social (OAuth) pode ser hospedada pelo próprio projeto,
reduzindo a dependência de infraestrutura terceira ao longo do tempo.

---

## Consequências

### Positivas
- Barreira de entrada baixa para a maioria dos alumni
- Proposta de valor preservada para quem quer controle total
- MPC elimina o risco de custódia total presente em alternativas
- Open source — auditável e substituível
- Não exclui nenhum perfil da comunidade

### Negativas e mitigações

| Risco | Mitigação |
|---|---|
| Vendor lock-in no Web3Auth | Alumni podem exportar chave. Web3Auth é substituível pela interface `useAuth` que abstrai o provedor. |
| MPC requer nós online para assinar | Web3Auth mantém SLA de disponibilidade. Alumni com Caminho B não são afetados. |
| Segurança baseada em email (Caminho A) | Encorajar 2FA na conta Google/email. Phishing de email não é pior do que perda de seed phrase para usuários não técnicos. |
| Complexidade de implementação maior | Duas rotas de auth, mas a lógica de negócio (contrato, core) é idêntica para ambas. O hook `useAuth` encapsula toda a diferença. |

---

## Alternativas consideradas e descartadas

**Privy:** Boa DX, mas modelo de custódia menos favorável que MPC. Closed source.
Descartado em favor do Web3Auth após avaliação de segurança.

**Magic.link:** Totalmente custodial. A empresa detém as chaves. Descartado por
contradizer diretamente a proposta de identidade auto-soberana.

**Somente carteira própria:** Excluiria alumni não técnicos. Contradiz o objetivo de
substituir o WhatsApp como canal principal da comunidade.

**Somente embedded wallet:** Contradiz a proposta de identidade descentralizada.
Cria dependência total de serviço terceiro.

---

## Impacto no backlog

- **US-001** (solicitação de credencial): formulário não pede endereço; sistema resolve
  o endereço pelo caminho escolhido pelo alumni
- **US-002** (admin emite SBT): recebe o endereço já resolvido; sem mudança de lógica
- **US-003** (alumni verifica identidade): suporta ambos os caminhos de autenticação

## Impacto nas tarefas técnicas

- TASK-009 usa `@web3auth/modal` e `@web3auth/base` em vez de `@privy-io/react-auth`
- A interface `useAuth` permanece idêntica — o resto do app não muda
