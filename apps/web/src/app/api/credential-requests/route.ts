import { NextRequest, NextResponse } from 'next/server'
import { CredentialRequest } from '@cozap/core'
import { getRepository } from '../../../lib/repository.js'

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const data = body as Partial<CredentialRequest>

  if (!data.id || !data.walletAddress || !data.data || !data.requestedAt) {
    return NextResponse.json({ error: 'Dados obrigatórios ausentes' }, { status: 400 })
  }

  if (data.status !== 'pending') {
    return NextResponse.json({ error: 'Status deve ser pending' }, { status: 400 })
  }

  const credentialRequest = body as CredentialRequest
  await getRepository().save(credentialRequest)

  return NextResponse.json(credentialRequest, { status: 201 })
}
