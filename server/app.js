const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes"); 
const connectDB = require("./db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

require("dotenv").config(); 


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

// Middleware
app.use(cors());
app.use(express.json());

connectDB();



// API routes
app.use("/api", routes);


// Error Handling Middleware 
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});


