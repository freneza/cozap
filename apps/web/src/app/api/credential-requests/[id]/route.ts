import { NextRequest, NextResponse } from 'next/server'
import { getRepository } from '../../../../lib/repository'

type PatchBody = {
  action: 'approve' | 'reject' | 'revoke'
  rejectionReason?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const existing = await getRepository().findById(id)

  if (!existing) {
    return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (body.action !== 'approve' && body.action !== 'reject' && body.action !== 'revoke') {
    return NextResponse.json({ error: 'Ação inválida — use approve, reject ou revoke' }, { status: 400 })
  }

  if (body.action === 'revoke') {
    if (existing.status !== 'approved') {
      return NextResponse.json({ error: 'Apenas membros aprovados podem ter o SBT revogado' }, { status: 400 })
    }
    const updated = await getRepository().updateStatus(id, 'revoked', body.rejectionReason)
    return NextResponse.json(updated)
  }

  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Apenas solicitações pendentes podem ser atualizadas' }, { status: 400 })
  }

  const status = body.action === 'approve' ? 'approved' : 'rejected'
  const updated = await getRepository().updateStatus(id, status, body.rejectionReason)

  return NextResponse.json(updated)
}
