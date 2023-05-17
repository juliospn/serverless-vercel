import https from 'https';
import express from "express";

const app = express();

interface Exchange {
  name: string;
  url: string;
}

const exchanges: Exchange[] = [
  { name: 'Deribit', url: 'https://www.deribit.com/api/v2/public/get_book_summary_by_instrument?instrument_name=BTC-PERPETUAL' },
  { name: 'Bitget', url: 'https://api.bitget.com/api/mix/v1/market/ticker?symbol=BTCUSDT_UMCBL' },
  { name: 'Bybit', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSDT' },
  { name: 'BybitUSD', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSD' },
  { name: 'Bitmex', url: 'https://www.bitmex.com/api/v1/instrument?symbol=XBTUSD' },
  { name: 'OKX', url: 'https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT-SWAP' },
  { name: 'OKXUSD', url: 'https://www.okx.com/api/v5/market/ticker?instId=BTC-USD-SWAP' },
  { name: 'Huobi', url: 'https://api.hbdm.com/linear-swap-ex/market/detail/merged?contract_code=BTC-USDT' },
  { name: 'BinanceUSDT', url: 'https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT' },
  { name: 'BinanceUSD', url: 'https://www.binance.com/dapi/v1/ticker/24hr?symbol=BTCUSD_PERP' },
];

function getVolume(): Record<string, number> {
  const volumeObj: Record<string, number> = {};

  for (const exchange of exchanges) {
    https.get(exchange.url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const jsonData = JSON.parse(data);
        let btcVolume = 0;

        switch (exchange.name) {
          case 'Deribit':
            btcVolume = jsonData && jsonData.result && jsonData.result[0] ? jsonData.result[0].volume_usd : 0;
            break;
          case 'Bitget':
            btcVolume = jsonData.data.quoteVolume;
            break;
          case 'Bybit':
            btcVolume = jsonData.result[0].turnover_24h;
            break;
          case 'BybitUSD':
            btcVolume = jsonData.result[0].volume_24h;
            break;
          case 'Bitmex':
            btcVolume = jsonData[0].volume24h;
            break;
          case 'OKX':
            btcVolume = jsonData.data[0].volCcy24h;
            const btcPrice = parseFloat(jsonData.data[0].last);
            btcVolume *= btcPrice;
            break;
          case 'OKXUSD':
            btcVolume = jsonData.data[0].vol24h;
            break;
          case 'Huobi':
            btcVolume = jsonData.tick.trade_turnover;
            break;
          case 'BinanceUSDT':
            btcVolume = jsonData.quoteVolume;
            break;
          case 'BinanceUSD':
            btcVolume = jsonData[0]?.volume;
            break;
        }

        volumeObj[exchange.name] = Math.trunc(btcVolume);
        console.log(`${exchange.name}: $${Math.trunc(btcVolume)}`);
      });

    }).on('error', (err) => {
      console.error(`Error: ${err.message}`);
    });
  }

  return volumeObj;
}

getVolume();

export { getVolume };

app.get('/api/volume', async (req, res) => {
    try {
      const volume = await getVolume();

      res.json(volume);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  export default app;