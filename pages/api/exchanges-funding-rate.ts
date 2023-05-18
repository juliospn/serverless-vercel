import https from 'https';
import express from 'express';
import WebSocket from 'ws';

const app = express();

interface Exchange {
  name: string;
  url?: string;
}

const exchangesF: Exchange[] = [
  { name: 'Deribit', url: 'https://www.deribit.com/api/v2/public/get_funding_chart_data?instrument_name=BTC-PERPETUAL&length=8h' },
  { name: 'Bitget', url: 'https://api.bitget.com/api/mix/v1/market/current-fundRate?symbol=BTCUSDT_UMCBL' },
  { name: 'Bybit', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSDT' },
  { name: 'BybitUSD', url: 'https://api.bybit.com/v2/public/tickers?symbol=BTCUSD' },
  { name: 'Bitmex', url: 'https://www.bitmex.com/api/v1/instrument?symbol=XBTUSD' },
  { name: 'OKX', url: 'https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USDT-SWAP' },
  { name: 'OKXUSD', url: 'https://www.okx.com/api/v5/public/funding-rate?instId=BTC-USD-SWAP' },
  { name: 'Huobi', url: 'https://api.hbdm.com/linear-swap-api/v1/swap_funding_rate?contract_code=BTC-USDT' },
  { name: 'BinanceUSDT', url: 'https://www.binance.com/fapi/v1/premiumIndex?symbol=BTCUSDT' },
];

async function getFundingRate(): Promise<{ [key: string]: string }> {
  const fundingRateObj: { [key: string]: string } = {};

  // Crie uma função auxiliar para lidar com a atualização do funding rate
  function handleFundingRate(exchange: Exchange, fundingRate: number) {
    const formattedFundingRate = (fundingRate * 100).toFixed(4);
    fundingRateObj[exchange.name] = formattedFundingRate;
    console.log(`${exchange.name}: ${formattedFundingRate}%`);
  }

  const promises = exchangesF.map((exchange) => {
    return new Promise<void>((resolve, reject) => {
      if (exchange.url) { // Verifique se a propriedade 'url' está definida
      https.get(exchange.url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let fundingRate: string = '';
          switch (exchange.name) {
            case 'Deribit':
              fundingRate = (parseFloat(JSON.parse(data).result.interest_8h) * 100).toFixed(4);
              break;
            case 'Bitget':
              fundingRate = (parseFloat(JSON.parse(data).data.fundingRate) * 100).toFixed(4);
              break;
            case 'Bybit':
              fundingRate = (parseFloat(JSON.parse(data).result[0].funding_rate) * 100).toFixed(4);
              break;
            case 'BybitUSD':
              fundingRate = (parseFloat(JSON.parse(data).result[0].funding_rate) * 100).toFixed(4);
              break;
            case 'Bitmex':
              fundingRate = (parseFloat(JSON.parse(data)[0].fundingRate) * 100).toFixed(4);
              break;
            case 'OKX':
              fundingRate = (parseFloat(JSON.parse(data).data[0].fundingRate) * 100).toFixed(4);
              break;
            case 'OKXUSD':
              fundingRate = (parseFloat(JSON.parse(data).data[0].fundingRate) * 100).toFixed(4);
              break;
            case 'Huobi':
              fundingRate = (parseFloat(JSON.parse(data).data.funding_rate) * 100).toFixed(4);
              break;
            case 'BinanceUSDT':
              fundingRate = (parseFloat(JSON.parse(data).lastFundingRate) * 100).toFixed(4);
              break;

            default:
              fundingRate = '';
              break;
          }
          fundingRateObj[exchange.name] = fundingRate;
          resolve();
          //console.log(`${exchange.name}: ${fundingRate}%`);
        });
        res.on('error', (err) => {
          console.error(`Error: ${err.message}`);
          reject(err);
        });
      });
    }});
  });
  await Promise.all(promises);
  return fundingRateObj;
}

export { getFundingRate };

app.get('/api/exchanges-funding-rate', async (req, res) => {
  try {
    const fundingRate = await getFundingRate();
    res.json(fundingRate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
