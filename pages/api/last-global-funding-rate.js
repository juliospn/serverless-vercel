const axios = require('axios');
const express = require('express');

const app = express();

async function getVolume() {
  const response = await axios.get('https://serverless-vercel-nine.vercel.app/api/volume');
  return response.data.reduce((acc, item) => {
    acc[item.exchangeName] = item.volume;
    return acc;
  }, {});
}

async function getFundingRate() {
  const response = await axios.get('https://serverless-vercel-nine.vercel.app/api/exchanges-funding-rate');
  return response.data.reduce((acc, item) => {
    acc[item.exchangeName] = item.rate;
    return acc;
  }, {});
}

async function main() {
  const volume = await getVolume();
  const fundingRate = await getFundingRate();

  let totalVolume = 0;
  let totalFundingRate = 0;

  for (const exchange in volume) {
    const exchangeVolume = volume[exchange];
    const exchangeFundingRate = fundingRate[exchange];

    totalVolume += exchangeVolume;

    if (exchangeFundingRate !== undefined) {
      totalFundingRate += exchangeFundingRate * exchangeVolume;
    } else {
      console.log(`Exchange ${exchange} não possui taxa de financiamento.`);
    }
  }

  const globalFundingRate = totalFundingRate / totalVolume;

  if (totalVolume === 0) {
    return 0;
  }

  if (Object.keys(fundingRate).length !== Object.keys(volume).length) {
    console.log('Erro: nem todos os valores de "exchangeFundingRate * exchangeVolume" foram incluídos no cálculo de totalFundingRate.');
    // Você pode adicionar mais lógica aqui, se necessário
  }

  return globalFundingRate;
}

app.get('/api/last-global-funding-rate', async (req, res) => {
  try {
    const globalFundingRate = await main();

    res.json(globalFundingRate.toFixed(4));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
