import { getVolume } from "./volume";
import { getFundingRate } from "./exchanges-funding-rate";
import express from "express";

const app = express();

async function main(): Promise<number> {
  let volume, fundingRate;

  do {
    volume = await getVolume();
    fundingRate = await getFundingRate();
  } while (Object.keys(fundingRate).length !== Object.keys(volume).length);

  let totalVolume = 0;
  let fundingRateValues: Record<string, number> = {
    Deribit: 0,
    Bitget: 0,
    Bybit: 0,
    BybitUSD: 0,
    Bitmex: 0,
    OKX: 0,
    OKXUSD: 0,
    Huobi: 0,
    BinanceUSDT: 0,
    BinanceUSD: 0,
  };

  for (const exchange in volume) {
    const exchangeVolume = volume[exchange];
    const exchangeFundingRate = fundingRate[exchange];

    totalVolume += exchangeVolume;

    if (exchangeFundingRate !== undefined) {
      const fundingRateValue = exchangeFundingRate * exchangeVolume;
      fundingRateValues[exchange] = fundingRateValue;
    } else {
      console.log(`Exchange ${exchange} não possui taxa de financiamento.`);
    }
  }

  const totalFundingRate = Object.values(fundingRateValues).reduce((acc, value) => acc + value, 0);
  const globalFundingRate = totalFundingRate / totalVolume;

  if (totalVolume === 0) {
    return 0;
  }

  if (Object.keys(fundingRateValues).length !== Object.keys(volume).length) {
    console.log('Erro: nem todos os valores de "exchangeFundingRate * exchangeVolume" foram incluídos no cálculo de totalFundingRate.');
    // Você pode adicionar mais lógica aqui, se necessário
  }
  
  return globalFundingRate;
}

app.get('/api/last-global-funding-rate', async (req, res) => {
  try {
    const volume = await getVolume();
    const fundingRate = await getFundingRate();

    // Cálculo do global funding rate usando volume e fundingRate
    const globalFundingRate = await main();

    res.json(globalFundingRate.toFixed(4));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
