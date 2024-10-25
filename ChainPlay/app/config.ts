import { 
    createConfig, 
    http, 
    cookieStorage,
    createStorage
  } from 'wagmi'
  import { mainnet, sepolia, avalancheFuji, } from 'wagmi/chains'
  import {type Chain} from 'viem'

  export const aiaTestnet = {
    id: 1320,
    name: 'AIA Testnet',
    nativeCurrency: { name: 'AIA', symbol: 'AIA', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://aia-dataseed1-testnet.aiachain.org'] },
    },
    blockExplorers: {
      default: { name: 'aiaScan', url: 'https://testnet.aiascan.com/' },
    },
  } as const satisfies Chain
  
  export function getConfig() {
    return createConfig({
      chains: [mainnet, sepolia, avalancheFuji,aiaTestnet],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [avalancheFuji.id]: http(),
        [aiaTestnet.id]: http(),
      },
    })
  }