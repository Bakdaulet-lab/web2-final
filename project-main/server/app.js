const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes"); 
const connectDB = require("./db");
const session = require("express-session");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));



app.use(express.static(path.join(__dirname, "../public")));

connectDB(console.log("Database connected"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }, // 1 min
  })
);


app.use(routes);

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
