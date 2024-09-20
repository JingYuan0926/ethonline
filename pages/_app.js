// pages/_app.js
import { NextUIProvider } from '@nextui-org/react'
import { WalletSelectorContextProvider } from '../components/WalletSelectorContext'
import '@near-wallet-selector/modal-ui/styles.css';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <WalletSelectorContextProvider>
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </WalletSelectorContextProvider>
  )
}

export default MyApp