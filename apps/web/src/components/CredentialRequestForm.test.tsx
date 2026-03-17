import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CredentialRequestForm } from './CredentialRequestForm.js'
import { CredentialRequest } from '@cozap/core'

const address = '0xAbCd1234AbCd1234AbCd1234AbCd1234AbCd1234' as `0x${string}`

describe('CredentialRequestForm', () => {
  it('renderiza todos os campos', () => {
    render(<CredentialRequestForm address={address} onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Nome completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Curso de formação')).toBeInTheDocument()
    expect(screen.getByLabelText('Tipo de diploma')).toBeInTheDocument()
    expect(screen.getByLabelText('Ano de entrada')).toBeInTheDocument()
    expect(screen.getByLabelText('Ano de conclusão')).toBeInTheDocument()
  })

  it('exibe erro quando nome está vazio', async () => {
    const user = userEvent.setup()
    render(<CredentialRequestForm address={address} onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText('Curso de formação'), 'Engenharia')
    await user.type(screen.getByLabelText('Ano de entrada'), '2015')
    await user.type(screen.getByLabelText('Ano de conclusão'), '2020')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitação' }))

    expect(screen.getByRole('alert')).toHaveTextContent('fullName não pode ser vazio')
  })

  it('exibe erro quando ano de entrada >= ano de conclusão', async () => {
    const user = userEvent.setup()
    render(<CredentialRequestForm address={address} onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText('Nome completo'), 'João Silva')
    await user.type(screen.getByLabelText('Curso de formação'), 'Engenharia')
    await user.type(screen.getByLabelText('Ano de entrada'), '2020')
    await user.type(screen.getByLabelText('Ano de conclusão'), '2020')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitação' }))

    expect(screen.getByRole('alert')).toHaveTextContent('entryYear deve ser menor que graduationYear')
  })

  it('chama onSubmit com CredentialRequest válido', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CredentialRequestForm address={address} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome completo'), 'João Silva')
    await user.type(screen.getByLabelText('Curso de formação'), 'Engenharia Elétrica')
    await user.type(screen.getByLabelText('Ano de entrada'), '2015')
    await user.type(screen.getByLabelText('Ano de conclusão'), '2020')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitação' }))

    expect(onSubmit).toHaveBeenCalledOnce()
    const request: CredentialRequest = onSubmit.mock.calls[0]![0]
    expect(request.status).toBe('pending')
    expect(request.walletAddress).toBe(address)
    expect(request.data.fullName).toBe('João Silva')
  })

  it('botão fica desabilitado após submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CredentialRequestForm address={address} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Nome completo'), 'João Silva')
    await user.type(screen.getByLabelText('Curso de formação'), 'Engenharia Elétrica')
    await user.type(screen.getByLabelText('Ano de entrada'), '2015')
    await user.type(screen.getByLabelText('Ano de conclusão'), '2020')
    await user.click(screen.getByRole('button', { name: 'Enviar solicitação' }))

    expect(screen.getByRole('button', { name: 'Enviar solicitação' })).toBeDisabled()
  })
})
