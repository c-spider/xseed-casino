import { Provider } from 'react-redux';
import { store } from '/store/store';
import Layout from 'components/layout/Layout';
import '../styles/globals.css';

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'

const projectId = process.env.NEXT_PUBLIC_ID
const xseed_chain = {
  id: 1,
  network: 'MetaXSeed',
  name: process.env.DEFAULT_CHAINNAME,
  nativeCurrency: { name: 'XSEED', symbol: 'XSEED', decimals: 18 },
  rpcUrls: {
    alchemy: { http: [Array], webSocket: [Array] },
    infura: { http: [Array], webSocket: [Array] },
    default: { http: [Array] },
    public: { http: [Array] }
  },
  blockExplorers: {
    default: { name: 'XSDSCAN', url: process.env.DEFAULT_BLOCKCHAIN_EXPLORER }
  },
}
console.log(JSON.stringify(mainnet))
const chains = [mainnet]
const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 2, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function MyApp({ Component, pageProps }) {

  return (
    <Provider store={store}>
      <WagmiConfig config={wagmiConfig}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </WagmiConfig>
      
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Provider>
  )
}

export default MyApp
