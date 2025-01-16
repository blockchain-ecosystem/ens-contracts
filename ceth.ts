import { defineChain } from 'viem'
export const ceth = /*#__PURE__*/ defineChain({
  id: 398,
  name: 'CETH',
  nativeCurrency: {
    decimals: 18,
    name: 'CETH',
    symbol: 'CETH',
  },
  rpcUrls: {
    default: { http: ['https://rpc-eth.teknix.dev/'] },
  },
  blockExplorers: {
    default: {
      name: 'CETH Explorer',
      url: 'https://explorer-eth.teknix.dev',
    },
  },
  testnet: false,
})
