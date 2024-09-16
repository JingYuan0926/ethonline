import { useEffect, useState } from 'react';

export default function Home() {
  const [prices, setPrices] = useState({
    ethUsd: null,
    opUsd: null,
    arbUsd: null
  });
  const [initialLoad, setInitialLoad] = useState(true);

  // Hermes API URLs
  const hermesUrls = {
    ethUsd: 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
    opUsd: 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x385f64d993f7b77d8182ed5003d97c60aa3361f3cecfe711544d2d59165e9bdf',
    arbUsd: 'https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x3fa4252848f9f0a1480be62745a4629d9eb1322aebab8a791e344b3b9c1adcf5'
  };

  useEffect(() => {
    async function fetchPrice(url, key) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Full JSON response for ${key}:`, data.parsed);
        const priceData = data.parsed[0]?.price;
        if (priceData) {
          const price = parseFloat(priceData.price) / Math.pow(10, Math.abs(priceData.expo));
          setPrices(prevPrices => ({ ...prevPrices, [key]: price }));
        }
      } catch (err) {
        console.error(`Error fetching ${key} price:`, err);
      }
    }

    async function fetchAllPrices() {
      await Promise.all([
        fetchPrice(hermesUrls.ethUsd, 'ethUsd'),
        fetchPrice(hermesUrls.opUsd, 'opUsd'),
        fetchPrice(hermesUrls.arbUsd, 'arbUsd')
      ]);
      setInitialLoad(false);
    }

    fetchAllPrices();
    const interval = setInterval(fetchAllPrices, 10000); // 100 ms as per original request

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Real-Time Crypto Prices from Pyth Hermes</h1>
      {initialLoad ? (
        <p>Loading prices...</p>
      ) : (
        <div className="space-y-2">
          <p>ETH/USD Price: ${prices.ethUsd !== null ? prices.ethUsd.toFixed(2) : 'Updating...'}</p>
          <p>OP/USD Price: ${prices.opUsd !== null ? prices.opUsd.toFixed(2) : 'Updating...'}</p>
          <p>ARB/USD Price: ${prices.arbUsd !== null ? prices.arbUsd.toFixed(2) : 'Updating...'}</p>
        </div>
      )}
    </div>
  );
}