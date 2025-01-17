const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Handle known errors
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
  
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token. Please log in again." });
    }
  
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
  
    // Handle database connection errors
    if (err.name === "MongoNetworkError") {
      return res.status(500).json({ error: "Database connection error." });
    }
  
    res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
  };
  
  module.exports = errorHandler;
  