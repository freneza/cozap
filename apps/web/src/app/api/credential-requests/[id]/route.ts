import { NextRequest, NextResponse } from 'next/server'
import { getRepository } from '../../../../lib/repository'

type PatchBody = {
  action: 'approve' | 'reject'
  rejectionReason?: string
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const existing = await getRepository().findById(params.id)

  if (!existing) {
    return NextResponse.json({ error: 'Solicitação não encontrada' }, { status: 404 })
  }

  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Apenas solicitações pendentes podem ser atualizadas' }, { status: 400 })
  }

  let body: PatchBody
  try {
    body = (await request.json()) as PatchBody
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (body.action !== 'approve' && body.action !== 'reject') {
    return NextResponse.json({ error: 'Ação inválida — use approve ou reject' }, { status: 400 })
  }

  const status = body.action === 'approve' ? 'approved' : 'rejected'
  const updated = await getRepository().updateStatus(params.id, status, body.rejectionReason)

  return NextResponse.json(updated)
}
