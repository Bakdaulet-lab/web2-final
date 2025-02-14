//app.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes"); 
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

require("dotenv").config(); 

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use(express.static(path.join(__dirname, "../travel-platform-frontend")));

// API routes
app.use("/api", routes);

// Handle frontend routes
app.get('*', (req, res) => {
    // Serve the requested page or fall back to index.html
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

// Error handling
app.use(errorHandler);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        success: false,
        error: 'Server error'
    });
});

// Start server
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

module.exports = app;

