// server/controllers/paymentController.js
const axios = require('axios');
const { QIWI_API_KEY, QIWI_WALLET } = require('../config/qiwiConfig');


const checkBalance = async (req, res) => {
    const url = `https://edge.qiwi.com/funding-sources/v2/persons/${QIWI_WALLET}/accounts`;
    
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${QIWI_API_KEY}`,
                'Accept': 'application/json',
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        if (error.response) {
            // The request was made, but the server responded with an error status code
            console.error('QIWI API Error:', error.response.data);
            res.status(error.response.status).json({ error: 'QIWI API Error', details: error.response.data });
        } else if (error.request) {
            // The request was made, but no response was received
            console.error('No response from QIWI API:', error.request);
            res.status(500).json({ error: 'No response from QIWI API' });
        } else {
            // Something else went wrong
            console.error('Error:', error.message);
            res.status(500).json({ error: 'Failed to check balance', details: error.message });
        }
    }
};

const sendPayment = async (req, res) => {
    const { recipientWallet, amount, currency = '643' } = req.body;
    const url = 'https://edge.qiwi.com/sinap/api/v2/terms/99/payments';
    const paymentData = {
        id: Date.now(),
        sum: {
            amount: amount,
            currency: currency,
        },
        paymentMethod: {
            type: 'Account',
            accountId: '643',
        },
        fields: {
            account: recipientWallet,
        },
    };

    try {
        const response = await axios.post(url, paymentData, {
            headers: {
                'Authorization': `Bearer ${QIWI_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error sending payment:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to send payment' });
    }
};

const getTransactionHistory = async (req, res) => {
    const { rows = 10 } = req.query;
    const url = `https://edge.qiwi.com/payment-history/v2/persons/${QIWI_WALLET}/payments?rows=${rows}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${QIWI_API_KEY}`,
                'Accept': 'application/json',
            },
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching transaction history:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch transaction history' });
    }
};

module.exports = {
    checkBalance,
    sendPayment,
    getTransactionHistory,
};
