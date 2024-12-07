const Stock = require('../models/stocks');
const axios = require('axios');

const apiKey = 'Your API Key';

const updateStockPrice = async (symbol) => {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data || !data.c) {
            console.log('No stock data found for symbol:', symbol);
            return;
        }

        const latestPrice = data.c; // Finnhub current price

        // Update stock price in MongoDB
        await Stock.updateOne({ symbol: symbol }, { price: latestPrice });
        console.log(`Updated ${symbol} price to ${latestPrice}`);
    } catch (error) {
        console.log('Error:', error);
    }
};

module.exports = { updateStockPrice };

