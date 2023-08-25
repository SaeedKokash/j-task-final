const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const Bearertoken = req.headers['authorization'];
  const token = Bearertoken && Bearertoken.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Failed to authenticate token' });
    }
    req.userId = decoded.userId;

    next();
  });
};

module.exports = { authenticate };
