import { defineChain } from 'viem'
export const ceth = /*#__PURE__*/ defineChain({
  id: 714,
  name: 'CBNB',
  nativeCurrency: {
    decimals: 18,
    name: 'CBNB',
    symbol: 'CBNB',
  },
  rpcUrls: {
    default: { http: ['http://103.23.90.50:8545/'] },
  },
  blockExplorers: {
    default: {
      name: 'CBNB Explorer',
      url: 'http://103.23.90.50:8067/',
    },
  },
  testnet: false,
})
