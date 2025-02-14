const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: err.message
        });
    }

    if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({
            success: false,
            error: 'Duplicate Error',
            details: 'Resource already exists'
        });
    }

    res.status(500).json({
        success: false,
        error: err.message || 'Server error'
    });
};

module.exports = errorHandler;
