import { expect } from 'chai'
import { ethers } from 'hardhat'
import { AlumniSBT } from '../typechain-types'

describe('AlumniSBT', function () {
  let contract: AlumniSBT
  let owner: Awaited<ReturnType<typeof ethers.getSigner>>
  let admin: Awaited<ReturnType<typeof ethers.getSigner>>
  let member: Awaited<ReturnType<typeof ethers.getSigner>>
  let other: Awaited<ReturnType<typeof ethers.getSigner>>

  const credentialHash = ethers.keccak256(
    ethers.toUtf8Bytes('Engenharia Elétrica|2024|graduation'),
  )

  beforeEach(async function () {
    ;[owner, admin, member, other] = await ethers.getSigners()
    const Factory = await ethers.getContractFactory('AlumniSBT')
    contract = (await Factory.deploy()) as unknown as AlumniSBT
  })

  describe('deploy', function () {
    it('define o deployer como owner', async function () {
      expect(await contract.owner()).to.equal(owner.address)
    })

    it('adiciona o owner como admin', async function () {
      expect(await contract.admins(owner.address)).to.be.true
    })
  })

  describe('addAdmin / removeAdmin', function () {
    it('owner pode adicionar admin', async function () {
      await contract.addAdmin(admin.address)
      expect(await contract.admins(admin.address)).to.be.true
    })

    it('owner pode remover admin', async function () {
      await contract.addAdmin(admin.address)
      await contract.removeAdmin(admin.address)
      expect(await contract.admins(admin.address)).to.be.false
    })

    it('não-owner não pode adicionar admin', async function () {
      await expect(contract.connect(other).addAdmin(admin.address)).to.be.revertedWith('Not owner')
    })

    it('reverte ao adicionar endereço zero', async function () {
      await expect(contract.addAdmin(ethers.ZeroAddress)).to.be.revertedWithCustomError(
        contract,
        'ZeroAddress',
      )
    })
  })

  describe('issueCredential', function () {
    it('admin emite credencial com sucesso', async function () {
      await expect(contract.issueCredential(member.address, credentialHash))
        .to.emit(contract, 'CredentialIssued')
        .withArgs(member.address, 1n, owner.address)
    })

    it('tokenId começa em 1 e incrementa', async function () {
      await contract.issueCredential(member.address, credentialHash)
      await contract.issueCredential(other.address, credentialHash)
      expect(await contract.tokenOf(member.address)).to.equal(1n)
      expect(await contract.tokenOf(other.address)).to.equal(2n)
    })

    it('registra credentialHash e issuedAt', async function () {
      await contract.issueCredential(member.address, credentialHash)
      expect(await contract.credentialHash(1n)).to.equal(credentialHash)
      expect(await contract.issuedAt(1n)).to.be.gt(0n)
    })

    it('reverte se membro já possui credencial', async function () {
      await contract.issueCredential(member.address, credentialHash)
      await expect(
        contract.issueCredential(member.address, credentialHash),
      ).to.be.revertedWithCustomError(contract, 'AlreadyHasCredential')
    })

    it('reverte para endereço zero', async function () {
      await expect(
        contract.issueCredential(ethers.ZeroAddress, credentialHash),
      ).to.be.revertedWithCustomError(contract, 'ZeroAddress')
    })

    it('reverte se chamado por não-admin', async function () {
      await expect(
        contract.connect(other).issueCredential(member.address, credentialHash),
      ).to.be.revertedWithCustomError(contract, 'NotAdmin')
    })
  })

  describe('consultas', function () {
    beforeEach(async function () {
      await contract.issueCredential(member.address, credentialHash)
    })

    it('hasCredential retorna true para membro com token', async function () {
      expect(await contract.hasCredential(member.address)).to.be.true
    })

    it('hasCredential retorna false para endereço sem token', async function () {
      expect(await contract.hasCredential(other.address)).to.be.false
    })

    it('tokenOf retorna o tokenId correto', async function () {
      expect(await contract.tokenOf(member.address)).to.equal(1n)
    })

    it('ownerOf retorna o endereço correto', async function () {
      expect(await contract.ownerOf(1n)).to.equal(member.address)
    })
  })

  describe('soulbound', function () {
    it('transfer reverte com Soulbound', async function () {
      await expect(contract.transfer(other.address, 1n)).to.be.revertedWithCustomError(
        contract,
        'Soulbound',
      )
    })

    it('approve reverte com Soulbound', async function () {
      await expect(contract.approve(other.address, 1n)).to.be.revertedWithCustomError(
        contract,
        'Soulbound',
      )
    })
  })
})
