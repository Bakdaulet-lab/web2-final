const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes"); 
const connectDB = require("./db");
const cookieParser = require("cookie-parser");

require("dotenv").config(); 


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));


connectDB();




app.use(routes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});


