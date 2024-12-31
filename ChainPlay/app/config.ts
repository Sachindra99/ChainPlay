import { 
    createConfig, 
    http, 
    cookieStorage,
    createStorage
  } from 'wagmi'
  import {type Chain} from 'viem'

  export const flowTestnet = {
    id: 545,
    name: 'flow Testnet',
    nativeCurrency: { name: 'FLOW', symbol: 'FLOW', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://testnet.evm.nodes.onflow.org'] },
    },
    blockExplorers: {
      default: { name: 'flowScan', url: 'https://evm-testnet.flowscan.io/' },
    },
  } as const satisfies Chain
  
  export function getConfig() {
    return createConfig({
      chains: [flowTestnet],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      transports: {
        [flowTestnet.id]: http(),
      },
    })
  }