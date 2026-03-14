import { describe, it, expect } from 'vitest'
import type { AlumniCredential, AlumniDegree, MemberProfile } from './types.js'

describe('AlumniDegree', () => {
  it('aceita formação com campos obrigatórios', () => {
    const degree: AlumniDegree = {
      course: 'Engenharia Elétrica com Ênfase em Computação',
      degreeType: 'graduation',
      graduationYear: 2024,
    }
    expect(degree.course).toBe('Engenharia Elétrica com Ênfase em Computação')
    expect(degree.degreeType).toBe('graduation')
    expect(degree.graduationYear).toBe(2024)
  })

  it('aceita todos os tipos de diploma', () => {
    const types: AlumniDegree['degreeType'][] = ['graduation', 'masters', 'doctorate']
    types.forEach((degreeType) => {
      const degree: AlumniDegree = { course: 'Curso', degreeType, graduationYear: 2020 }
      expect(degree.degreeType).toBe(degreeType)
    })
  })
})

describe('AlumniCredential', () => {
  it('aceita credencial válida', () => {
    const credential: AlumniCredential = {
      address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      primaryDegree: {
        course: 'Engenharia de Computação',
        degreeType: 'graduation',
        graduationYear: 2022,
      },
      issuedAt: 1700000000,
      issuedBy: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    }
    expect(credential.address).toMatch(/^0x/)
    expect(credential.issuedAt).toBeGreaterThan(0)
  })
})

describe('MemberProfile', () => {
  it('aceita perfil com campos obrigatórios', () => {
    const profile: MemberProfile = {
      nostrPubkey: 'npub1abc123',
      displayName: 'João Silva',
      degrees: [
        {
          course: 'Engenharia Mecânica',
          degreeType: 'graduation',
          graduationYear: 2018,
        },
      ],
      professionalInterests: ['Web3', 'IA'],
      generalInterests: ['Leitura', 'Xadrez'],
      updatedAt: 1700000000,
    }
    expect(profile.degrees).toHaveLength(1)
    expect(profile.professionalInterests).toContain('Web3')
  })

  it('aceita múltiplas formações', () => {
    const profile: MemberProfile = {
      nostrPubkey: 'npub1xyz',
      displayName: 'Ana Souza',
      degrees: [
        { course: 'Engenharia Civil', degreeType: 'graduation', graduationYear: 2015 },
        { course: 'Engenharia Civil', degreeType: 'masters', graduationYear: 2017 },
        { course: 'Engenharia Civil', degreeType: 'doctorate', graduationYear: 2021 },
      ],
      professionalInterests: [],
      generalInterests: [],
      updatedAt: 1700000000,
    }
    expect(profile.degrees).toHaveLength(3)
    expect(profile.degrees[2].degreeType).toBe('doctorate')
  })
})
