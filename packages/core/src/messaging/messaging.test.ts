import { describe, it, expect } from 'vitest'
import type { Channel, ChannelMessage } from './types.js'

describe('Channel', () => {
  it('aceita canal obrigatório', () => {
    const channel: Channel = {
      id: 'npub1channel123',
      name: 'Alumni Poli',
      description: 'Canal geral da comunidade Alumni Poli',
      required: true,
      adminPubkeys: ['npub1admin1', 'npub1admin2'],
      createdAt: 1700000000,
    }
    expect(channel.required).toBe(true)
    expect(channel.adminPubkeys).toHaveLength(2)
  })

  it('aceita canal temático opcional', () => {
    const channel: Channel = {
      id: 'npub1ai123',
      name: 'Inteligência Artificial',
      description: 'Discussões sobre IA e ML',
      required: false,
      adminPubkeys: ['npub1admin1'],
      createdAt: 1700000000,
    }
    expect(channel.required).toBe(false)
  })
})

describe('ChannelMessage', () => {
  it('aceita mensagem simples', () => {
    const message: ChannelMessage = {
      id: 'event123',
      authorPubkey: 'npub1author',
      channelId: 'npub1channel',
      content: 'Olá, pessoal!',
      createdAt: 1700000000,
    }
    expect(message.content).toBe('Olá, pessoal!')
    expect(message.replyTo).toBeUndefined()
  })

  it('aceita reply com replyTo preenchido', () => {
    const reply: ChannelMessage = {
      id: 'event456',
      authorPubkey: 'npub1responder',
      channelId: 'npub1channel',
      content: 'Olá!',
      replyTo: 'event123',
      createdAt: 1700000001,
    }
    expect(reply.replyTo).toBe('event123')
  })
})
