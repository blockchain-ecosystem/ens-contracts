import { defineChain } from 'viem'
export const ceth = /*#__PURE__*/ defineChain({
  id: 22988,
  name: 'Hii Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HII',
    symbol: 'HII',
  },
  rpcUrls: {
    default: { http: ['http://103.69.98.80:8545/'] },
  },
  blockExplorers: {
    default: {
      name: 'Hii Explorer',
      url: 'https://explorer.testnet.hii.network/',
    },
  },
  testnet: false,
})
