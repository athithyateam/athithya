const jwt = require('jsonwebtoken');

const jwtkey = process.env.JWT_SECRET || 'your-secret-key-change-this';

module.exports = { jwt, jwtkey };
