import hre from 'hardhat'
import { namehash, keccak256, toBytes } from 'viem'

async function main() {
  const { viem } = hre

  // Get contract instances
  const registry = await viem.getContract('ENSRegistry')
  const root = await viem.getContract('Root')
  const dnsRegistrar = await viem.getContract('DNSRegistrar')

  console.log('=== Debug TLD Issue ===')
  console.log('Registry address:', registry.address)
  console.log('Root address:', root.address)
  console.log('DNSRegistrar address:', dnsRegistrar.address)

  // Check if DNSRegistrar is a controller of Root
  const isDNSRegistrarController = await root.read.controllers([
    dnsRegistrar.address,
  ])
  console.log('Is DNSRegistrar a controller of Root?', isDNSRegistrarController)

  // Check Root owner
  const rootOwner = await root.read.owner()
  console.log('Root owner:', rootOwner)

  // Test a few common TLD labels to see if they're locked
  const testTLDs = ['com', 'org', 'net', 'edu', 'gov']

  for (const tld of testTLDs) {
    const node = namehash(tld)
    const label = keccak256(toBytes(tld))

    console.log(`\n--- Testing TLD: .${tld} ---`)
    console.log('Node:', node)
    console.log('Label:', label)

    // Check if label is locked
    const isLocked = await root.read.locked([label])
    console.log('Is locked?', isLocked)

    // Check current owner of the node
    const currentOwner = await registry.read.owner([node])
    console.log('Current owner:', currentOwner)

    // Check if it's zero address (unregistered)
    if (currentOwner === '0x0000000000000000000000000000000000000000') {
      console.log('Node is unregistered - should be able to enable')
    } else if (currentOwner === dnsRegistrar.address) {
      console.log('Already owned by DNSRegistrar - should skip')
    } else {
      console.log('Owned by different address - potential issue')
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
