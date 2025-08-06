import hre from 'hardhat'
import {
  namehash,
  keccak256,
  toBytes,
  bytesToHex,
  stringToBytes,
  labelhash as labelhashBytes32,
} from 'viem'

// Inline dnsEncodeName function
function packetToBytes(packet) {
  const value = packet.replace(/^\.|\.$/, '')
  if (value.length === 0) return new Uint8Array(1)

  const bytes = new Uint8Array(stringToBytes(value).byteLength + 2)

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i += 1) {
    let encoded = stringToBytes(list[i])
    if (encoded.byteLength > 255)
      encoded = stringToBytes(encodeLabelhash(labelhashBytes32(list[i])))
    bytes[offset] = encoded.length
    bytes.set(encoded, offset + 1)
    offset += encoded.length + 1
  }

  if (bytes.byteLength !== offset + 1) return bytes.slice(0, offset + 1)
  return bytes
}

function encodeLabelhash(hash) {
  return `[${hash.slice(2)}]`
}

function dnsEncodeName(name) {
  return bytesToHex(packetToBytes(name))
}

async function main() {
  const { viem } = hre

  // Get contract instances
  const registry = await viem.getContract('ENSRegistry')
  const root = await viem.getContract('Root')
  const dnsRegistrar = await viem.getContract('DNSRegistrar')
  const { deployer } = await viem.getNamedClients()

  console.log('=== Testing Individual TLD EnableNode Calls ===')

  // Test the TLDs that were in the failing multicall
  const testTLDs = [
    'ac',
    'ad',
    'ae',
    'aero',
    'af',
    'ag',
    'ai',
    'al',
    'am',
    'ao',
  ]

  for (const tld of testTLDs) {
    try {
      console.log(`\n--- Testing TLD: .${tld} ---`)

      const node = namehash(tld)
      const encodedTLD = dnsEncodeName(tld)
      const label = keccak256(toBytes(tld))

      console.log('Node:', node)
      console.log('Encoded TLD:', encodedTLD)
      console.log('Label:', label)

      // Check current state
      const currentOwner = await registry.read.owner([node])
      const isLocked = await root.read.locked([label])
      const isDNSRegistrarController = await root.read.controllers([
        dnsRegistrar.address,
      ])

      console.log('Current owner:', currentOwner)
      console.log('Is locked?', isLocked)
      console.log('Is DNSRegistrar a controller?', isDNSRegistrarController)

      if (currentOwner === dnsRegistrar.address) {
        console.log('Already owned by DNSRegistrar - skipping')
        continue
      }

      if (isLocked) {
        console.log('TLD is locked - cannot enable')
        continue
      }

      // Try to enable the node
      console.log('Attempting to enable node...')
      const hash = await dnsRegistrar.write.enableNode([encodedTLD], {
        account: deployer.account,
      })

      console.log(`Enable transaction hash: ${hash}`)
      await viem.waitForTransactionSuccess(hash)
      console.log('✅ Successfully enabled!')
    } catch (error) {
      console.log(`❌ Failed to enable .${tld}:`, error.message)

      // If this is the first failure, let's investigate further
      if (error.message.includes('execution reverted')) {
        console.log('This TLD is causing the multicall to fail!')

        // Try to get more details about why it's failing
        try {
          const node = namehash(tld)
          const encodedTLD = dnsEncodeName(tld)
          const label = keccak256(toBytes(tld))

          // Check if the Root contract would allow this operation
          const rootOwner = await root.read.owner()
          const rootAddress = await registry.read.owner([Buffer.alloc(32)])

          console.log('Root contract owner:', rootOwner)
          console.log('Root node owner in registry:', rootAddress)

          // Check if the label is actually locked (double-check)
          const isReallyLocked = await root.read.locked([label])
          console.log('Label really locked?', isReallyLocked)
        } catch (debugError) {
          console.log('Debug error:', debugError.message)
        }

        break // Stop at first failure to investigate
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
