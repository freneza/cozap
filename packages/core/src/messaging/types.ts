/**
 * Representa um canal de comunicação da comunidade.
 *
 * Canais obrigatórios (required: true) substituem os atuais grupos de Networking
 * do WhatsApp — todo membro verificado participa automaticamente.
 *
 * Canais opcionais (required: false) são os grupos temáticos (IA, Esportes,
 * Cultura, etc.) que o membro escolhe participar.
 */
export interface Channel {
  /** Identificador único do canal (pubkey Nostr do canal) */
  id: string
  /** Nome do canal */
  name: string
  /** Descrição */
  description: string
  /**
   * Indica se a participação é obrigatória para todos os membros verificados.
   * true  → canal geral da comunidade (ex: "Alumni Poli")
   * false → canal temático opcional (ex: "Inteligência Artificial")
   */
  required: boolean
  /** Chaves públicas dos administradores (Nostr pubkeys) */
  adminPubkeys: string[]
  /** Timestamp de criação */
  createdAt: number
}

/**
 * Mensagem publicada em um canal.
 * Wraps o evento Nostr com informações de contexto.
 */
export interface ChannelMessage {
  /** ID do evento Nostr */
  id: string
  /** Chave pública Nostr do remetente */
  authorPubkey: string
  /** ID do canal */
  channelId: string
  /** Conteúdo da mensagem */
  content: string
  /** Referência à mensagem original (para replies) */
  replyTo?: string
  /** Timestamp */
  createdAt: number
}
