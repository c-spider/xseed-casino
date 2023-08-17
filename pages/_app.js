import { Provider } from 'react-redux';
import { store } from '/store/store';
import Layout from 'components/layout/Layout';
import '../styles/globals.css';

import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const projectId = process.env.NEXT_PUBLIC_ID
const xseed_chain = {
  id: 422286,
  network: 'MetaXSeed Mainnet',
  name: 'MetaXSeed',
  nativeCurrency: { name: 'XSEED', symbol: 'XSEED', decimals: 18 },
  rpcUrls: {
    default: { http: [ "https://mainnet-rpc.xseedscan.io" ] },
    public: { http: [ "https://mainnet-rpc.xseedscan.io" ] },
  },
  blockExplorers: {
    default: { name: 'XSEED SCAN', url: "http://explorer.xseedscan.io" }
  },
}
// console.log(JSON.stringify(mainnet))
const chains = [xseed_chain]
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
        <ToastContainer />
      </WagmiConfig>
      
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </Provider>
  )
}

export default MyApp
