
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    await mongoose.connect("mongodb+srv://Nurkanat:Nurkanat05@kazdiscover.vkucv.mongodb.net/?retryWrites=true&w=majority&appName=KazDiscover", {
      
    });

    console.log("Подключение к базе данных MongoDB успешно!");
  } catch (err) {
    console.error("Ошибка подключения к базе данных MongoDB", err);
    process.exit(1); 
  }
};

module.exports = connectDB;
