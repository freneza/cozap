import { createHash } from 'crypto'
import { CredentialRequest } from '@cozap/core'
import { prisma } from './prisma'

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

// ---------------------------------------------------------------------------
// InMemory — usado em testes unitários
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Prisma — usado em produção quando DATABASE_URL está disponível
// ---------------------------------------------------------------------------

type CredentialRequestRow = {
  id: string
  walletAddress: string
  status: string
  requestedAt: Date
  fullName: string
  course: string
  degreeType: string
  entryYear: number | null
  graduationYear: number
  dedupHash: string
  evidenceUrl: string | null
  voucherAddress: string | null
  rejectionReason: string | null
  decidedAt: Date | null
  decidedBy: string | null
  createdAt: Date
}

function buildDedupHash(course: string, degreeType: string, graduationYear: number): string {
  return createHash('sha256').update(`${course}|${degreeType}|${graduationYear}`).digest('hex')
}

function rowToCredentialRequest(row: CredentialRequestRow): CredentialRequest {
  return {
    id: row.id,
    walletAddress: row.walletAddress as `0x${string}`,
    status: row.status as CredentialRequest['status'],
    requestedAt: row.requestedAt.getTime(),
    data: {
      fullName: row.fullName,
      course: row.course,
      degreeType: row.degreeType as 'graduation' | 'masters' | 'doctorate',
      entryYear: row.entryYear ?? undefined,
      graduationYear: row.graduationYear,
    },
    ...(row.rejectionReason ? { rejectionReason: row.rejectionReason } : {}),
  }
}

export class PrismaCredentialRequestRepository implements ICredentialRequestRepository {
  async save(request: CredentialRequest): Promise<void> {
    await prisma.credentialRequest.upsert({
      where: { id: request.id },
      create: {
        id: request.id,
        walletAddress: request.walletAddress,
        status: request.status,
        requestedAt: new Date(request.requestedAt),
        fullName: request.data.fullName,
        course: request.data.course,
        degreeType: request.data.degreeType,
        entryYear: request.data.entryYear ?? null,
        graduationYear: request.data.graduationYear,
        dedupHash: buildDedupHash(request.data.course, request.data.degreeType, request.data.graduationYear),
        rejectionReason: request.rejectionReason ?? null,
      },
      update: {},
    })
  }

  async findAll(status?: CredentialRequest['status']): Promise<CredentialRequest[]> {
    const rows = await prisma.credentialRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { requestedAt: 'desc' },
    })
    return rows.map(rowToCredentialRequest)
  }

  async findById(id: string): Promise<CredentialRequest | null> {
    const row = await prisma.credentialRequest.findUnique({ where: { id } })
    return row ? rowToCredentialRequest(row) : null
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected',
    rejectionReason?: string,
  ): Promise<CredentialRequest | null> {
    const existing = await prisma.credentialRequest.findUnique({ where: { id } })
    if (!existing) return null
    const updated = await prisma.credentialRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: rejectionReason ?? null,
        decidedAt: new Date(),
      },
    })
    return rowToCredentialRequest(updated)
  }
}

// ---------------------------------------------------------------------------
// Factory — escolhe a implementação com base no ambiente
// ---------------------------------------------------------------------------

let inMemoryInstance: InMemoryCredentialRequestRepository | null = null

export function getRepository(): ICredentialRequestRepository {
  if (process.env.DATABASE_URL) {
    return new PrismaCredentialRequestRepository()
  }
  if (!inMemoryInstance) inMemoryInstance = new InMemoryCredentialRequestRepository()
  return inMemoryInstance
}
