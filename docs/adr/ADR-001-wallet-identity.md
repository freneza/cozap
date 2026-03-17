# ADR-001 — Estratégia de identidade Ethereum: carteira própria ou embedded wallet

**Data:** 2026-03-17
**Status:** Aceito
**Contexto:** US-001, US-002, US-003

---

## Contexto

O coZap usa Soulbound Tokens (SBT) na blockchain como prova de identidade Alumni Poli.
Para receber e usar um SBT, o alumni precisa de um endereço Ethereum.

O público-alvo inclui desde engenheiros com experiência em Web3 até egressos de outras
áreas sem nenhum contato com blockchain. Exigir que todos instalem MetaMask e gerenciem
uma carteira criaria uma barreira de entrada alta e excluiria boa parte da comunidade.

Por outro lado, esconder completamente a carteira via serviço custodial (Privy, Magic, etc.)
contradiz a proposta de identidade auto-soberana do projeto.

---

## Decisão

Oferecer **dois caminhos de identidade**, ambos de primeira classe:

### Caminho A — Acesso simplificado (padrão)
- Alumni faz login com email ou Google (conta `@usp.br` natural para esse público)
- Sistema cria uma **embedded wallet** transparentemente via **Privy**
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
- Alumni do Caminho A pode migrar para o Caminho B exportando a chave privada
  da carteira embedded via painel do Privy (processo documentado, não automático)

---

## Consequências

### Positivas
- Barreira de entrada baixa para a maioria dos alumni
- Proposta de valor preservada para quem quer controle total
- Não exclui nenhum perfil da comunidade

### Negativas e mitigações

| Risco | Mitigação |
|---|---|
| Vendor lock-in no Privy | Alumni podem exportar chave privada. Privy é substituível pela interface viem/wagmi já em uso. |
| Custódia parcial das chaves no Caminho A | Documentado e transparente. Alumni é informado que pode migrar para Caminho B. |
| Segurança baseada em email (Caminho A) | Encorajar 2FA. Phishing de email não é pior do que perda de seed phrase para usuários não técnicos. |
| Complexidade de implementação maior | Duas rotas de auth, mas a lógica de negócio (contrato, core) é idêntica para ambas. |

---

## Alternativas consideradas e descartadas

**Somente carteira própria:** Excluiria alumni não técnicos. Contradiz o objetivo de
substituir o WhatsApp como canal principal da comunidade.

**Somente embedded wallet custodial:** Contradiz a proposta de identidade descentralizada.
Cria dependência total de serviço terceiro.

---

## Impacto no backlog

- **US-001** (solicitação de credencial): formulário não pede endereço; sistema resolve
  o endereço pelo caminho escolhido pelo alumni
- **US-002** (admin emite SBT): recebe o endereço já resolvido; sem mudança de lógica
- **US-003** (alumni verifica identidade): suporta ambos os caminhos de autenticação
