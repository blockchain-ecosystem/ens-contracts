// from @nomicfoundation/hardhat-toolbox-viem to avoid module issue
import '@nomicfoundation/hardhat-ignition-viem'
import '@nomicfoundation/hardhat-verify'
import '@nomicfoundation/hardhat-viem'
import 'hardhat-gas-reporter'
import 'solidity-coverage'
import './tasks/hardhat-deploy-viem.cjs'

import dotenv from 'dotenv'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import { HardhatUserConfig, task } from 'hardhat/config'

import('@ensdomains/hardhat-chai-matchers-viem')

// hardhat actions
import './tasks/esm_fix.cjs'
import fs from 'fs'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
dotenv.config({ debug: false })

let real_accounts = [process.env.DEPLOYER_KEY, process.env.OWNER_KEY]

console.log('🚀 ~ real_accounts:', real_accounts)

// circular dependency shared with actions
export const archivedDeploymentPath = './deployments/archive'

task('verify:export', async (args, hre) => {
  const artifact = await hre.artifacts.readArtifact('ENSRegistryWithFallback')
  const buildInfo = await hre.artifacts.getBuildInfo(
    `${artifact.sourceName}:${artifact.contractName}`,
  )
  if (!buildInfo) {
    throw new Error('Build info not found')
  }
  fs.writeFileSync('solc-input.json', JSON.stringify(buildInfo.input, null, 2))
  console.log('solc-input.json exported')
})

const config = {
  networks: {
    hardhat: {
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
      allowUnlimitedContractSize: false,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 4,
      // accounts: real_accounts,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 3,
      // accounts: real_accounts,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 5,
      // accounts: real_accounts,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 11155111,
      // accounts: real_accounts,
    },
    holesky: {
      url: `https://holesky-rpc.nocturnode.tech`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 17000,
      // accounts: real_accounts,
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['legacy', 'use_root'],
      chainId: 1,
      // accounts: real_accounts,
    },
    custom: {
      url: `http://103.69.98.80:8545`,
      tags: ['legacy', 'use_root'],
      chainId: 22988,
      accounts: [
        process.env.DEPLOYER_KEY as string,
        process.env.OWNER_KEY as string,
      ],
      // accounts: real_accounts,
    },
  },
  mocha: {},
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1200,
          },
        },
      },
      // for DummyOldResolver contract
      {
        version: '0.4.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  abiExporter: {
    path: './build/contracts',
    runOnCompile: true,
    clear: true,
    flat: true,
    except: [
      'Controllable$',
      'INameWrapper$',
      'SHA1$',
      'Ownable$',
      'NameResolver$',
      'TestBytesUtils$',
      'legacy/*',
    ],
    spacing: 2,
    pretty: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 0,
    },
  },
  external: {
    contracts: [
      {
        artifacts: [archivedDeploymentPath],
      },
    ],
  },
  etherscan: {
    apiKey: {
      custom: process.env.EXPLORER_API_KEY as string,
    },
    customChains: [
      {
        network: 'custom',
        chainId: 22988,
        urls: {
          apiURL: 'https://explorer.testnet.hii.network/api',
          browserURL: 'https://explorer.testnet.hii.network/',
        },
      },
    ],
  },
} satisfies HardhatUserConfig

export default config
