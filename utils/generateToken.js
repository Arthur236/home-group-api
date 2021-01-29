const jwt = require('jsonwebtoken');

module.exports = (id, firstName, email, isAdmin, secret, expires) => {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign({ id, firstName, email, isAdmin }, secret, { expiresIn: expires });
};
