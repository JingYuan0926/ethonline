import Head from 'next/head'
import { useState } from 'react'
import SendEthForm from '../components/SendEthForm'
import EthAddressGenerator from '../components/EthAddressGenerator'

export default function Send() {
  const [generatedAddress, setGeneratedAddress] = useState('');

  const handleAddressGenerated = (address) => {
    setGeneratedAddress(address);
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Transfer ETH using NEAR-CA</title>
        <meta name="description" content="Transfer ETH using NEAR Chain Abstraction" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className="text-2xl font-bold mb-4">Transfer ETH using NEAR-CA</h1>
        <EthAddressGenerator onAddressGenerated={handleAddressGenerated} />
        {generatedAddress && <SendEthForm fromAddress={generatedAddress} />}
      </main>
    </div>
  )
}