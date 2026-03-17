/**
 * Representa uma formação individual na POLI.
 * Um membro pode ter múltiplas formações (graduação, mestrado, doutorado).
 */
export interface AlumniDegree {
  /** Nome do curso (ex: "Engenharia Elétrica com Ênfase em Computação") */
  course: string
  /** Tipo de diploma */
  degreeType: 'graduation' | 'masters' | 'doctorate'
  /** Ano de entrada no curso */
  entryYear?: number
  /** Ano de conclusão */
  graduationYear: number
}

/**
 * Credencial on-chain de um Alumni Poli — emitida como Soulbound Token (SBT).
 * Baseada na formação primária (primeira graduação), mas o membro pode ter
 * múltiplas formações registradas no MemberProfile.
 */
export interface AlumniCredential {
  /** Endereço Ethereum do membro */
  address: `0x${string}`
  /** Formação primária — base para emissão do SBT */
  primaryDegree: AlumniDegree
  /** Timestamp de emissão da credencial */
  issuedAt: number
  /** Endereço do admin que emitiu */
  issuedBy: `0x${string}`
}

/**
 * Dados preenchidos pelo alumni no formulário de solicitação de credencial.
 */
export interface CredentialRequestData {
  fullName: string
  course: string
  degreeType: 'graduation' | 'masters' | 'doctorate'
  entryYear: number
  graduationYear: number
}

/**
 * Solicitação completa de emissão de credencial, incluindo endereço
 * Ethereum resolvido internamente pelo sistema (invisível ao alumni).
 */
export interface CredentialRequest {
  id: string
  walletAddress: `0x${string}`
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: number
  data: CredentialRequestData
  rejectionReason?: string
}

/**
 * Perfil off-chain do membro, cujo hash fica registrado on-chain.
 * Dados dinâmicos que o próprio membro atualiza.
 */
export interface MemberProfile {
  /** Chave pública Nostr (npub) */
  nostrPubkey: string
  /** Nome de exibição */
  displayName: string
  /**
   * Todas as formações na POLI — incluindo a primária.
   * A formação primária (index 0) é a que originou o SBT.
   */
  degrees: [AlumniDegree, ...AlumniDegree[]]
  /** Área de atuação profissional */
  professionalArea?: string
  /** Empresa atual */
  company?: string
  /** Interesses profissionais */
  professionalInterests: string[]
  /** Interesses gerais */
  generalInterests: string[]
  /** Bio curta */
  bio?: string
  /** Última atualização */
  updatedAt: number
}
