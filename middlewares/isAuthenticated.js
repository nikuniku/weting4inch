const jwt = require('jsonwebtoken');
require('dotenv').config();

const isAuthenticated = async (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        return res.status(401).json({ msg: 'Missing token' });
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            return res.status(401).json({ msg: 'Invalid token' });
        }
    }
    catch (error) {
        error.status = 401;
        return next(error);
    }
    req.userId = decodedToken.userId;
    next();
}

module.exports = isAuthenticated;