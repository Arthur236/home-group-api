const jwt = require('jsonwebtoken');

module.exports = (slug, firstName, email, isAdmin, secret, expires) => {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign({ slug, firstName, email, isAdmin }, secret, { expiresIn: expires });
};
