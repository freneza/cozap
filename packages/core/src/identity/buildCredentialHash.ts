import { encodePacked, keccak256 } from 'viem'
import { CredentialRequestData } from './types.js'

export function buildCredentialHash(data: CredentialRequestData): `0x${string}` {
  return keccak256(
    encodePacked(
      ['string', 'uint256', 'string'],
      [data.course, BigInt(data.graduationYear), data.degreeType],
    ),
  )
}
