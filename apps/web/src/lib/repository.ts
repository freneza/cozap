import { CredentialRequest } from '@cozap/core'

export interface ICredentialRequestRepository {
  save(request: CredentialRequest): Promise<void>
  findAll(status?: CredentialRequest['status']): Promise<CredentialRequest[]>
  findById(id: string): Promise<CredentialRequest | null>
  updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ): Promise<CredentialRequest | null>
}

export class InMemoryCredentialRequestRepository implements ICredentialRequestRepository {
  private store = new Map<string, CredentialRequest>()

  async save(request: CredentialRequest): Promise<void> {
    this.store.set(request.id, request)
  }

  async findAll(status?: CredentialRequest['status']): Promise<CredentialRequest[]> {
    const all = Array.from(this.store.values())
    return status ? all.filter((r) => r.status === status) : all
  }

  async findById(id: string): Promise<CredentialRequest | null> {
    return this.store.get(id) ?? null
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ): Promise<CredentialRequest | null> {
    const request = this.store.get(id)
    if (!request) return null
    const updated: CredentialRequest = { ...request, status, ...(rejectionReason ? { rejectionReason } : {}) }
    this.store.set(id, updated)
    return updated
  }
}

let instance: InMemoryCredentialRequestRepository | null = null

export function getRepository(): InMemoryCredentialRequestRepository {
  if (!instance) instance = new InMemoryCredentialRequestRepository()
  return instance
}
