import { ethers } from 'hardhat'

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying with account:', deployer.address)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance), 'POL')

  const AlumniSBT = await ethers.getContractFactory('AlumniSBT')
  const contract = await AlumniSBT.deploy()
  await contract.waitForDeployment()

  const address = await contract.getAddress()
  console.log('AlumniSBT deployed to:', address)
  console.log('')
  console.log('Adicione ao .env.local:')
  console.log(`NEXT_PUBLIC_ALUMNI_SBT_ADDRESS=${address}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
