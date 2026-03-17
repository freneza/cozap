import { CredentialRequest } from '@cozap/core'

export interface ICredentialRequestRepository {
  save(request: CredentialRequest): Promise<void>
  findAll(): Promise<CredentialRequest[]>
  findById(id: string): Promise<CredentialRequest | null>
}

export class InMemoryCredentialRequestRepository implements ICredentialRequestRepository {
  private store = new Map<string, CredentialRequest>()

  async save(request: CredentialRequest): Promise<void> {
    this.store.set(request.id, request)
  }

  async findAll(): Promise<CredentialRequest[]> {
    return Array.from(this.store.values())
  }

  async findById(id: string): Promise<CredentialRequest | null> {
    return this.store.get(id) ?? null
  }
}

let instance: InMemoryCredentialRequestRepository | null = null

export function getRepository(): InMemoryCredentialRequestRepository {
  if (!instance) instance = new InMemoryCredentialRequestRepository()
  return instance
}
