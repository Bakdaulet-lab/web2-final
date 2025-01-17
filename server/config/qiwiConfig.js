// server/config/qiwiConfig.js
require('dotenv').config();

module.exports = {
    QIWI_API_KEY: process.env.QIWI_API_KEY,
    QIWI_WALLET: process.env.QIWI_WALLET,
};