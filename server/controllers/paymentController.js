// server/controllers/paymentController.js
const axios = require('axios');
const { QIWI_API_KEY, QIWI_WALLET } = require('../config/qiwiConfig');

// Проверка баланса QIWI-кошелька
const checkBalance = async (req, res) => {
    if (!QIWI_API_KEY || !QIWI_WALLET) {
        return res.status(500).json({ error: "QIWI API credentials are missing." });
    }

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
        console.error('QIWI API Error:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to retrieve QIWI wallet balance',
            details: error.response?.data || error.message
        });
    }
};

// Отправка платежа на другой QIWI-кошелек
const sendPayment = async (req, res) => {
    if (!QIWI_API_KEY || !QIWI_WALLET) {
        return res.status(500).json({ error: "QIWI API credentials are missing." });
    }

    const { recipientWallet, amount, currency = '643' } = req.body;

    // Валидация входных данных
    if (!recipientWallet || !amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid recipient wallet or amount." });
    }

    const url = 'https://edge.qiwi.com/sinap/api/v2/terms/99/payments';

    const paymentData = {
        id: Date.now(),
        sum: {
            amount: parseFloat(amount), // Приводим к числу
            currency: currency,
        },
        paymentMethod: {
            type: 'Account',
            accountId: currency,
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
        res.status(error.response?.status || 500).json({
            error: 'Failed to send payment',
            details: error.response?.data || error.message
        });
    }
};

// Получение истории транзакций
const getTransactionHistory = async (req, res) => {
    if (!QIWI_API_KEY || !QIWI_WALLET) {
        return res.status(500).json({ error: "QIWI API credentials are missing." });
    }

    const { rows = 10 } = req.query; // Количество транзакций по умолчанию - 10
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
        res.status(error.response?.status || 500).json({
            error: 'Failed to fetch transaction history',
            details: error.response?.data || error.message
        });
    }
};

// Экспортируем функции
module.exports = {
    checkBalance,
    sendPayment,
    getTransactionHistory,
};
