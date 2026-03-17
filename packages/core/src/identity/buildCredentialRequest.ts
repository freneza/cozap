import { randomUUID } from 'node:crypto'
import { CredentialRequest, CredentialRequestData } from './types.js'
import { InvalidRequestData } from './errors.js'

export function buildCredentialRequest(
  data: CredentialRequestData,
  walletAddress: `0x${string}`,
): CredentialRequest {
  if (!data.fullName.trim()) {
    throw new InvalidRequestData('fullName não pode ser vazio')
  }

  if (data.entryYear >= data.graduationYear) {
    throw new InvalidRequestData('entryYear deve ser menor que graduationYear')
  }

  return {
    id: randomUUID(),
    walletAddress,
    status: 'pending',
    requestedAt: Date.now(),
    data,
  }
}
