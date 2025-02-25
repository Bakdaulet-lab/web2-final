require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes");
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
const { seedSampleFlight } = require("./models/Flight");

// Suppress deprecation warning for punycode
process.noDeprecation = true;

const app = express();
const PORT = process.env.PORT || 3000;

// Improved middleware setup
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, "../travel-platform-frontend")));

// API routes
app.use("/api", routes);

// Handle frontend routes
app.get('*', (req, res) => {
    const requestedPage = path.join(__dirname, '../travel-platform-frontend', req.path);
    const indexPage = path.join(__dirname, '../travel-platform-frontend/index.html');
    
    if (req.path.endsWith('.html')) {
        res.sendFile(requestedPage, (err) => {
            if (err) {
                res.sendFile(indexPage);
            }
        });
    } else {
        res.sendFile(indexPage);
    }
});

// Enhanced error handling
app.use(errorHandler);
app.use((err, req, res, next) => {
    console.error('Application error:', err);
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Improved server startup
async function startServer() {
    try {
        await connectDB();
        await seedSampleFlight();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5500'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;

