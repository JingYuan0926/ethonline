import { useEffect, useState } from 'react';

const formatTimestamp = (unixTimestamp) => {
    const date = new Date(unixTimestamp * 1000);
    return date.toISOString().replace('T', ' ').substring(0, 19);
};

export default function HistoricalPrices() {
    const [ethPriceHistory, setEthPriceHistory] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [logMessages, setLogMessages] = useState([]);

    const baseURL = 'https://benchmarks.pyth.network/v1/updates/price';
    const ethUsdPriceFeedId = '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace';

    const getDateRange = () => {
        const endDate = new Date();
        endDate.setMinutes(endDate.getMinutes() - 1); // Get the previous minute
        endDate.setSeconds(0, 0);
        const startDate = new Date(endDate.getTime() - 29 * 60 * 1000); // 29 minutes before endDate
        const dateArray = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            dateArray.push(new Date(currentDate));
            currentDate.setMinutes(currentDate.getMinutes() + 1);
        }
        return dateArray.reverse();
    };

    const log = (message) => {
        setLogMessages(prev => [...prev, message]);
    };

    useEffect(() => {
        async function fetchHistoricalPrice(date) {
            const timestamp = Math.floor(date.getTime() / 1000);
            const url = `${baseURL}/${timestamp}/60?ids=${ethUsdPriceFeedId}&parsed=true&unique=true`;

            try {
                const response = await fetch(url);
                const data = await response.json();
                log(`Price data for ${formatTimestamp(timestamp)}: ${JSON.stringify(data)}`);

                return data.map((entry) => {
                    const priceData = entry.parsed[0]?.price;
                    if (priceData) {
                        const price = parseFloat(priceData.price) / Math.pow(10, Math.abs(priceData.expo));
                        const publishTime = formatTimestamp(priceData.publish_time);
                        return { datetime: publishTime, price };
                    }
                    return null;
                }).filter(entry => entry !== null);
            } catch (err) {
                log(`Error fetching price for ${formatTimestamp(timestamp)}: ${err.message}`);
                return null;
            }
        }

        async function fetchPriceHistory() {
            const dateRange = getDateRange();
            const pricePromises = dateRange.map(date => fetchHistoricalPrice(date));
            const priceData = await Promise.all(pricePromises);

            const validPrices = priceData.flat().filter(price => price !== null);
            setEthPriceHistory(validPrices);
            setInitialLoad(false);
        }

        fetchPriceHistory();
    }, []);

    const downloadCSV = async () => {
        const csvContent = "DateTime,Price\n" + ethPriceHistory.map(row => `${row.datetime},${row.price}`).join("\n");
        
        try {
          const response = await fetch('/api/save-csv', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ csvContent }),
          });
          
          if (response.ok) {
            console.log('CSV file has been saved successfully.');
          } else {
            const errorData = await response.json();
            throw new Error(`Failed to save CSV file: ${errorData.details || errorData.error}`);
          }
        } catch (error) {
          console.error('Error saving CSV file:', error);
        }
      };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">ETH/USD Historical Prices (Last 30 Minutes, 60-Second Intervals)</h1>
            {initialLoad ? (
                <p>Loading historical prices...</p>
            ) : (
                <>
                    <button onClick={downloadCSV} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4">
                        Save CSV
                    </button>
                    <div className="space-y-2">
                        {ethPriceHistory.map((priceEntry, index) => (
                            <p key={index}>
                                {priceEntry.datetime}: ${priceEntry.price.toFixed(2)}
                            </p>
                        ))}
                    </div>
                    <h2 className="text-xl font-bold mt-8 mb-2">Log Messages:</h2>
                    <div className="space-y-1 text-sm">
                        {logMessages.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}